export function setCacheEntries<K, V>(cache: SimpleCache<K, V>, items: [K, V][]) {
  return items.reduce((acc, [key, value]) => acc.set(key, value), cache);
}

export interface SimpleCache<K, V> extends Iterable<[K, V]> {
  get(key: K): V | undefined;
  set(key: K, value: V): this;
  has(key: K): boolean;
  delete(key: K): void;
  clear(): void;

  keys(): IterableIterator<K>;
  values(): IterableIterator<V>;
}
