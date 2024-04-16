import { Member } from '../core';
import { FilterSet } from '../filter/filter-set';

export abstract class Diagram {
  readonly #members: Member[];

  readonly filters = new FilterSet<Member>();

  constructor(members: Member[]) {
    this.#members = members ?? [];
  }

  getMembers() {
    return this.filters.apply(this.#members);
  }

  abstract render(): string;
}
