import { draftSchema, type Draft } from '@finca/domain';
import { type DraftRepository } from '@finca/application';
import { type RecordStore } from './record-store';
export class ValidatedDraftRepository implements DraftRepository {
  constructor(private readonly store: RecordStore) {}
  async list(): Promise<Draft[]> {
    const records = await this.store.list();
    // Invalid records are never silently overwritten or discarded.
    return records
      .map((record) => draftSchema.parse(record))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  async put(draft: Draft): Promise<void> {
    const valid = draftSchema.parse(draft);
    await this.store.put(valid.id, valid);
  }
  remove(id: string): Promise<void> {
    return this.store.remove(id);
  }
  clear(): Promise<void> {
    return this.store.clear();
  }
}
