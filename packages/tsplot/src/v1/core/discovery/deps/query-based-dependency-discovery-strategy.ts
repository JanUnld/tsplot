import { ProjectMember } from '../member';
import { Dependency, DependencyDiscoveryStrategy } from './dependency-discovery-strategy';

export abstract class QueryBasedDependencyDiscoveryStrategy extends DependencyDiscoveryStrategy {
  override getDependenciesFromMember(member: ProjectMember): Dependency[] {
    return [];
  }
}
