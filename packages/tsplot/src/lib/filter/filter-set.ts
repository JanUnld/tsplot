export type Predicate<T> = (it: T) => boolean;

export interface FilterComposeOptions {
  /**
   * Defines how multiple filters are supposed to be composed. Defaults to `every`
   * @remarks `every` means that all filters must return `true` for the item to pass.
   *  `some` means that at least one filter must return `true` for the item to pass.
   */
  method: 'every' | 'some';
}

export class FilterSet<T> {
  static with<T>(filters: Predicate<T>[]) {
    return new FilterSet(filters);
  }

  protected readonly predicates = new Set<Predicate<T>>();

  constructor(filters?: Predicate<T>[]) {
    if (filters) this.add(...filters);
  }

  add(...filter: Predicate<T>[]) {
    for (const f of filter) this.predicates.add(f);
    return this;
  }
  remove(...filter: Predicate<T>[]) {
    for (const f of filter) this.predicates.delete(f);
    return this;
  }

  apply(target: T[], options?: FilterComposeOptions): T[] {
    const filters = Array.from(this.predicates);
    const method = options?.method ?? 'every';
    return !filters?.length
      ? target
      : target.filter((it) => filters[method]((f) => f(it)));
  }

  /**
   * Composes all {@link Predicate}s included in the {@link FilterSet} instance
   * into a single {@link Predicate} function.
   * @remarks This operation is non-reversible
   */
  compose(options?: FilterComposeOptions): Predicate<T> {
    const filters = Array.from(this.predicates);
    const method = options?.method ?? 'every';

    return (it: T) => filters[method]((f) => f(it));
  }
}
