import { type Draft } from '@finca/domain';
export interface DraftRepository {
  list(): Promise<Draft[]>;
  put(draft: Draft): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}
