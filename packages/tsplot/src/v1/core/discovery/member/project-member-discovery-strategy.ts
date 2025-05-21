import { Provider, Type } from 'injection-js';
import * as ts from 'typescript';

export interface ProjectMember {
  symbol: ts.Symbol;
  node: ts.Node;
  type: ts.Type;

  name: string;
  uniqueName: string;
}

export type ProjectMemberReflection = Record<string, unknown>;
export type ReflectedProjectMember = ProjectMember & ProjectMemberReflection;

export abstract class ProjectMemberDiscoveryStrategy {
  abstract getReflectedProjectMembersFromNode(node: ts.Node): ReflectedProjectMember;
  abstract getReflectedProjectMembersFromSourceFile(
    sourceFile: ts.SourceFile
  ): ReflectedProjectMember[];
}

export function provideProjectMemberDiscoveryStrategy(
  impl: Type<ProjectMemberDiscoveryStrategy>
): Provider {
  return {
    provide: ProjectMemberDiscoveryStrategy,
    useClass: impl,
    multi: true,
  };
}

export function provideProjectMemberDiscoveryStrategies(
  impls: Type<ProjectMemberDiscoveryStrategy>[]
): Provider[] {
  return impls?.map(provideProjectMemberDiscoveryStrategy) ?? [];
}
