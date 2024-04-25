import { Member } from '../core';
import { FilterSet } from '../filter/filter-set';

export interface DiagramFilterOptions {
  /**
   * Include non-exported {@link Member}s
   * @remarks "Exported" means that the member is accessible from outside the
   *  module (file). **Not** the package in general
   */
  nonExported?: boolean;
}

export abstract class Diagram {
  readonly #members: Member[];

  readonly filters = new FilterSet<Member>();

  constructor(members: Member[]) {
    this.#members = members ?? [];
  }

  getMembers(options?: DiagramFilterOptions): Member[] {
    const filters = new FilterSet<Member>(this.filters.decompose());

    if (!options?.nonExported) {
      filters.add((m) => m.isExported);
    }

    return filters.apply(this.#members);
  }

  abstract render(): string;
}
