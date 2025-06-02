import * as ts from 'typescript';
import { ProjectMember } from '../member';
import { Dependency, DependencyDiscoveryStrategy } from './dependency-discovery-strategy';
import { ExplicitDependencyOrigin } from './explicit-dependency-origin';

export interface DependencyNodeWithOrigin {
  origin: ExplicitDependencyOrigin;
  node: ts.Node;
}

export abstract class QueryBasedDependencyDiscoveryStrategy extends DependencyDiscoveryStrategy {
  abstract queryNodesFromMember(member: ProjectMember): DependencyNodeWithOrigin[];

  override getDependenciesFromMember(member: ProjectMember): Dependency[] {
    return this.queryNodesFromMember(member).map(({ node, origin }) => ({
      to: this.getProjectMemberFromNode(node),
      from: member,
      origin,
      node,
    }));
  }
}
