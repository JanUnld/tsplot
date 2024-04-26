import { Member } from '../core';
import { FilterSet } from '../filter/filter-set';

export interface DiagramOptions {
  /**
   * Include non-exported {@link Member}s
   * @remarks "Exported" means that the member is accessible from outside the
   *  module (file). **Not** the package in general
   */
  nonExported?: boolean;
  /** Exclude {@link Member.fields} from rendering. Defaults to `true` */
  fields?: boolean;
  /** Exclude {@link Member.methods} from rendering. Defaults to `true` */
  methods?: boolean;
}

export abstract class Diagram {
  private readonly _members: Member[];

  readonly filters = new FilterSet<Member>();

  constructor(members: Member[]) {
    this._members = members ?? [];
  }

  getMembers(options?: DiagramOptions): Member[] {
    const filters = new FilterSet<Member>(this.filters.decompose());

    if (!options?.nonExported) {
      filters.add((m) => m.isExported);
    }

    return filters.apply(this._members);
  }

  abstract render(): string;
}
