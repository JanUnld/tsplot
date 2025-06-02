import { query } from '@phenomnomnominal/tsquery';
import { ProjectMember } from '../../member';
import { ExplicitDependencyOrigin } from '../explicit-dependency-origin';
import {
  DependencyNodeWithOrigin,
  QueryBasedDependencyDiscoveryStrategy,
} from '../query-based-dependency-discovery-strategy';

export class HeritageDependencyDiscoveryStrategy extends QueryBasedDependencyDiscoveryStrategy {
  override queryNodesFromMember(member: ProjectMember): DependencyNodeWithOrigin[] {
    return query(member.node, 'HeritageClause').map((node) => ({
      origin: ExplicitDependencyOrigin.Heritage,
      node,
    }));
  }
}
