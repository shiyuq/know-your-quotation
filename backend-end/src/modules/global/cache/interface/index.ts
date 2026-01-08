export interface CacheStrategy {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  del?(key: string): Promise<void>;
}
