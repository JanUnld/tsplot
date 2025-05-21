import { Provider, Type } from 'injection-js';
import { ProjectMember } from '../member';

// todo: think about the portability of this concept to codeflow discovery in the future

export interface Dependency {
  from: ProjectMember;
  to: ProjectMember;
}

export abstract class DependencyDiscoveryStrategy {
  abstract getDependenciesFromMember(member: ProjectMember): Dependency[];
}

export function provideDependencyDiscoveryStrategy(
  impl: Type<DependencyDiscoveryStrategy>
): Provider {
  return {
    provide: DependencyDiscoveryStrategy,
    useClass: impl,
    multi: true,
  };
}

export function provideDependencyDiscoveryStrategies(
  impls: Type<DependencyDiscoveryStrategy>[]
): Provider {
  return impls.map(provideDependencyDiscoveryStrategy);
}
