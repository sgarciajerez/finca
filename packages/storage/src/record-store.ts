export interface RecordStore {
  list(): Promise<unknown[]>;
  put(id: string, value: unknown): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}
