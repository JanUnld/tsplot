import { ProjectMember } from '../core';
import { FilterSet } from '../filter';

export interface DiagramOptions {
  /**
   * Include non-exported {@link ProjectMember}s
   * @remarks "Exported" means that the member is accessible from outside the
   *  module (file). **Not** the package in general
   */
  nonExported?: boolean;
  /** Exclude {@link ProjectMember.fields} from rendering. Defaults to `true` */
  fields?: boolean;
  /** Exclude {@link ProjectMember.methods} from rendering. Defaults to `true` */
  methods?: boolean;
}

export abstract class Diagram {
  private readonly _members: ProjectMember[];

  readonly filters = new FilterSet<ProjectMember>();

  constructor(members: ProjectMember[]) {
    this._members = members ?? [];
  }

  getMembers(options?: DiagramOptions): ProjectMember[] {
    const filters = new FilterSet<ProjectMember>(this.filters.decompose());

    if (!options?.nonExported) {
      filters.add((m) => m.isExported);
    }

    return filters.apply(this._members);
  }

  abstract render(): string;
}
