import { type RecordStore } from './record-store';
export class ChromeRecordStore implements RecordStore {
  private readonly prefix = 'finca.app.draft.';
  constructor(private readonly area: chrome.storage.StorageArea = chrome.storage.local) {}
  async list(): Promise<unknown[]> {
    const entries: Record<string, unknown> = await this.area.get(null);
    return Object.entries(entries)
      .filter(([key]) => key.startsWith(this.prefix))
      .map(([, value]) => value);
  }
  async put(id: string, value: unknown): Promise<void> {
    await this.area.set({ [this.prefix + id]: value });
  }
  async remove(id: string): Promise<void> {
    await this.area.remove(this.prefix + id);
  }
  async clear(): Promise<void> {
    const entries = await this.area.get(null);
    await this.area.remove(Object.keys(entries).filter((key) => key.startsWith(this.prefix)));
  }
}
