import { type DraftRepository } from '@finca/application';
import { type Draft } from '@finca/domain';
export class MemoryDraftRepository implements DraftRepository {
  private readonly records = new Map<string, Draft>();
  async list(): Promise<Draft[]> {
    return structuredClone([...this.records.values()]);
  }
  async put(draft: Draft): Promise<void> {
    this.records.set(draft.id, structuredClone(draft));
  }
  async remove(id: string): Promise<void> {
    this.records.delete(id);
  }
  async clear(): Promise<void> {
    this.records.clear();
  }
}
