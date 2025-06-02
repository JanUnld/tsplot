import { query } from '@phenomnomnominal/tsquery';
import { ProjectMember } from '../../member';
import { ExplicitDependencyOrigin } from '../explicit-dependency-origin';
import {
  DependencyNodeWithOrigin,
  QueryBasedDependencyDiscoveryStrategy,
} from '../query-based-dependency-discovery-strategy';

export class AssociationDependencyDiscoveryStrategy extends QueryBasedDependencyDiscoveryStrategy {
  override queryNodesFromMember(member: ProjectMember): DependencyNodeWithOrigin[] {
    const selector = [
      'PropertyDeclaration',
      'Constructor Parameter:has(PrivateKeyword, ProtectedKeyword, PublicKeyword, ReadonlyKeyword)',
    ].join(', ');

    return query(member.node, selector).map((node) => ({
      origin: ExplicitDependencyOrigin.Association,
      node,
    }));
  }
}
