import { FilterSet, MemberFilterFn } from '../filter';
import { ProjectMember } from './project-member';
import { ProjectView } from './project-view';

export interface Edge {
  from: ProjectMember;
  to: ProjectMember;
}

export interface ProjectGraphOptions {
  filter?: FilterSet<ProjectMember> | MemberFilterFn[];
  members: ProjectMember[];
}

export class ProjectGraph {
  private readonly _members: ProjectMember[];

  readonly filter = new FilterSet<ProjectMember>();

  get members(): ProjectMember[] {
    return this.filter.apply(this._members);
  }
  get edges(): Edge[] {
    return this.members
      .flatMap((m) => this.getEdgesOfMember(m))
      .filter((e) => e.from && e.to);
  }

  constructor(options: ProjectGraphOptions) {
    this._members = options.members;

    this.filter = FilterSet.merge(options.filter ?? []);
  }

  getEdgesOfMember(member: ProjectMember) {
    // todo: fix the `from` resolution to actually match the desired member
    //  This is currently not the case, because the mechanism only uses the member
    //  name instead of something that's unique. Member names may be duplicated
    //  within a project view or graph, so this is not a reliable way to resolve.
    //  This will probably involve looking into the imports and finding out where
    //  the dependency originates from
    return member.deps
      .map<Edge>((d) => ({
        from: this.members.find((m) => m.name === d.name)!,
        to: member,
      }))
      .filter(Boolean);
  }

  // <editor-fold desc="Static">

  static fromView(
    view: ProjectView,
    options?: {
      keepFilter?: boolean;
      filter?: FilterSet<ProjectMember> | MemberFilterFn[];
    }
  ) {
    const filter = options?.keepFilter
      ? FilterSet.merge(view.filter, options.filter ?? [])
      : options?.filter;

    return new ProjectGraph({ members: view.members, filter });
  }

  // </editor-fold>
}
