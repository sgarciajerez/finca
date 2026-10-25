import { type RecordStore } from './record-store';
export class IndexedDbRecordStore implements RecordStore {
  private database: Promise<IDBDatabase> | undefined;
  constructor(private readonly factory: IDBFactory = globalThis.indexedDB) {}
  private open(): Promise<IDBDatabase> {
    this.database ??= new Promise((resolve, reject) => {
      if (!this.factory) {
        reject(new Error('IndexedDB no está disponible.'));
        return;
      }
      const request = this.factory.open('finca-app', 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore('drafts');
      };
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => db.close();
        resolve(db);
      };
      request.onerror = () => {
        this.database = undefined;
        reject(request.error ?? new Error('No se pudo abrir la biblioteca.'));
      };
      request.onblocked = () => {
        this.database = undefined;
        reject(new Error('Cierra otras pestañas de FINCA para actualizar la biblioteca.'));
      };
    });
    return this.database;
  }
  private async transaction<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('drafts', mode);
      const request = operation(transaction.objectStore('drafts'));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onabort = () =>
        reject(transaction.error ?? new Error('No se ha completado el guardado.'));
      transaction.onerror = () =>
        reject(transaction.error ?? new Error('No se pudo acceder a la biblioteca.'));
    });
  }
  async list(): Promise<unknown[]> {
    return this.transaction('readonly', (store) => store.getAll() as IDBRequest<unknown[]>);
  }
  async put(id: string, value: unknown): Promise<void> {
    await this.transaction('readwrite', (store) => store.put(value, id));
  }
  async remove(id: string): Promise<void> {
    await this.transaction('readwrite', (store) => store.delete(id));
  }
  async clear(): Promise<void> {
    await this.transaction('readwrite', (store) => store.clear());
  }
}
