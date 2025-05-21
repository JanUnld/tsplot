import { SimpleCache } from './simple-cache';

export class InMemoryCache<K, V> implements SimpleCache<K, V> {
  protected map: Map<K, V> = new Map();

  get(key: K): V | undefined {
    return this.map.get(key);
  }

  set(key: K, value: V): this {
    this.map.set(key, value);
    return this;
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  keys(): IterableIterator<K> {
    return this.map.keys();
  }
  values(): IterableIterator<V> {
    return this.map.values();
  }

  [Symbol.iterator](): Iterator<[K, V]> {
    return this.map[Symbol.iterator]();
  }
}
