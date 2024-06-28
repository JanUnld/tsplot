import { FilterSet, MemberFilterFn } from '../filter';
import { Member } from './member';
import { ProjectView } from './project-view';

export interface Edge {
  from: Member;
  to: Member;
}

export interface ProjectGraphOptions {
  filter?: FilterSet<Member> | MemberFilterFn[];
  members: Member[];
}

export class ProjectGraph {
  private readonly _members: Member[];

  readonly filter = new FilterSet<Member>();

  get members(): Member[] {
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

  getEdgesOfMember(member: Member) {
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
      filter?: FilterSet<Member> | MemberFilterFn[];
    }
  ) {
    const filter = options?.keepFilter
      ? FilterSet.merge(view.filter, options.filter ?? [])
      : options?.filter;

    return new ProjectGraph({ members: view.members, filter });
  }

  // </editor-fold>
}
