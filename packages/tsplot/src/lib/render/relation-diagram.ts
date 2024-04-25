import { DependencyOrigin, Member } from '../core';
import { FilterSet } from '../filter';
import { Diagram, DiagramFilterOptions } from './diagram';

export const enum RelationType {
  Aggregation = 'aggregation',
  Association = 'association',
  Composition = 'composition',
  Extension = 'extension',
}

export function getRelationTypeFromDependencyOrigin(
  origin: DependencyOrigin
): RelationType {
  switch (origin) {
    case DependencyOrigin.Heritage:
      return RelationType.Extension;
    default:
      return RelationType.Association;
  }
}

export interface RelationEdge {
  type: RelationType;
  from: Member;
  to: Member;
}

/** @internal */
function getEdgesOfMember(member: Member, members: Member[]) {
  return member.deps
    .map<RelationEdge>((d) => ({
      type: getRelationTypeFromDependencyOrigin(d.origin),
      from: members.find((m) => m.name === d.name)!,
      to: member,
    }))
    .filter(Boolean);
}

export function getEdges(members: Member[]) {
  return members
    .flatMap((m) => getEdgesOfMember(m, members))
    .filter((e) => e.from && e.to);
}

export interface RelationDiagramFilterOptions extends DiagramFilterOptions {
  /** Include {@link Member}s without any relation (edge) to other members */
  edgeless?: boolean;
}

export abstract class RelationDiagram extends Diagram {
  override getMembers(options?: RelationDiagramFilterOptions): Member[] {
    const filters = new FilterSet<Member>();

    const members = super.getMembers(options);

    if (options?.edgeless === false) {
      const edges = this.getEdges(options).filter((e) => {
        return members.includes(e.from) && members.includes(e.to);
      });

      filters.add((m) =>
        edges.some((e) => e.from.name === m.name || e.to.name === m.name)
      );
    }

    return filters.apply(members);
  }

  getEdges(options?: DiagramFilterOptions): RelationEdge[] {
    return getEdges(super.getMembers(options));
  }
}
