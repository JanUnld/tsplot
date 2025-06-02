import { inject, Provider, Type } from 'injection-js';
import * as ts from 'typescript';
import { PROJECT_MEMBER_CACHE } from '../../cache';
import { ProjectMember } from '../member';
import { NodeReflector } from '../node-reflector';
import { ExplicitDependencyOrigin } from './explicit-dependency-origin';

// todo: think about the portability of this concept to codeflow discovery in the future

export type DependencyOrigin = ExplicitDependencyOrigin | string;

export interface Dependency {
  node: ts.Node;
  origin: DependencyOrigin;

  from: ProjectMember;
  to: ProjectMember;
}

export abstract class DependencyDiscoveryStrategy {
  protected readonly memberCache = inject(PROJECT_MEMBER_CACHE);
  protected readonly nodeReflector = inject(NodeReflector);

  abstract getDependenciesFromMember(member: ProjectMember): Dependency[];

  protected getProjectMemberFromNode(node: ts.Node): ProjectMember {
    const { symbol, type } = this.nodeReflector.reflectNodeOrThrow(node);

    const name = symbol.name;
    const uniqueName = this.nodeReflector.formatUniqueName(node);

    // get cached project member or create and set cache
    let member = this.memberCache.get(uniqueName);
    if (!member) {
      // todo: consider an alternative to caching the immediate project member result?!
      //  in the ideal case, we should already have all the quantified members in cache
      member = { node, symbol, type, name, uniqueName };
      this.memberCache.set(uniqueName, member);
    }

    return member;
  }
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
