/**
 * Storage service interface - Dependency Inversion Principle
 * Abstracts away concrete storage implementations
 */
export interface IStorageService<T> {
  save(key: string, data: T): Promise<void>;
  load(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

/**
 * Request storage specific interface
 */
export interface IRequestStorage {
  saveRequest(request: any): Promise<void>;
  loadRequest(id: string): Promise<any>;
  getAllRequests(): Promise<any[]>;
  deleteRequest(id: string): Promise<void>;
  updateRequest(id: string, request: any): Promise<void>;
}

/**
 * History storage interface
 */
export interface IHistoryStorage {
  addToHistory(request: any): Promise<void>;
  getHistory(): Promise<any[]>;
  clearHistory(): Promise<void>;
}
