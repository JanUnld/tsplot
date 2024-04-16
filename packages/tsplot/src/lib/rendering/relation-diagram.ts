import { DependencyOrigin, Member } from '../core';
import { Diagram } from './diagram';

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

export abstract class RelationDiagram extends Diagram {
  override getMembers(options?: { edgeless?: boolean }): Member[] {
    const members = super.getMembers();

    if (options?.edgeless !== false) return members;

    const edges = this.getEdges().filter((e) => {
      return members.includes(e.from) && members.includes(e.to);
    });

    return members.filter((c) => {
      return edges.some((e) => e.from.name === c.name || e.to.name === c.name);
    });
  }

  getEdges(): RelationEdge[] {
    return getEdges(super.getMembers());
  }
}
