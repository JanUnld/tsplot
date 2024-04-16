export type Predicate<T> = (it: T) => boolean;

export class FilterSet<T> {
  protected readonly predicates = new Set<Predicate<T>>();

  add(...filter: Predicate<T>[]) {
    for (const f of filter) this.predicates.add(f);
    return this;
  }
  remove(...filter: Predicate<T>[]) {
    for (const f of filter) this.predicates.delete(f);
    return this;
  }

  apply(target: T[], options?: { method: 'every' | 'some' }): T[] {
    const filters = Array.from(this.predicates);
    const method = options?.method ?? 'every';
    return !filters?.length
      ? target
      : target.filter((it) => filters[method]((f) => f(it)));
  }
}
