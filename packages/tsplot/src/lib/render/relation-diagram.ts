import { DependencyOrigin, ProjectMember } from '../core';
import { FilterSet } from '../filter';
import { Diagram, DiagramOptions } from './diagram';

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
  from: ProjectMember;
  to: ProjectMember;
}

/** @internal */
function getEdgesOfMember(member: ProjectMember, members: ProjectMember[]) {
  return member.deps
    .map<RelationEdge>((d) => ({
      type: getRelationTypeFromDependencyOrigin(d.origin),
      from: members.find((m) => m.name === d.name)!,
      to: member,
    }))
    .filter(Boolean);
}

export function getEdges(members: ProjectMember[]) {
  return members
    .flatMap((m) => getEdgesOfMember(m, members))
    .filter((e) => e.from && e.to);
}

export interface RelationDiagramOptions extends DiagramOptions {
  /** Include {@link ProjectMember}s without any relation (edge) to other members */
  edgeless?: boolean;
}

export abstract class RelationDiagram extends Diagram {
  override getMembers(options?: RelationDiagramOptions): ProjectMember[] {
    const filters = new FilterSet<ProjectMember>();

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

  getEdges(options?: DiagramOptions): RelationEdge[] {
    return getEdges(super.getMembers(options));
  }
}
