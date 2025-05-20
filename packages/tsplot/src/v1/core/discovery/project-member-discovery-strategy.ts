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

export function formatUniqueName(symbol: ts.Symbol, sourceFile?: ts.SourceFile): string {
  const fileName = sourceFile?.fileName ?? symbol.valueDeclaration?.getSourceFile().fileName;
  return `${fileName}#${symbol.escapedName}`;
}

export abstract class ProjectMemberDiscoveryStrategy {
  abstract getReflectedProjectMembersFromNode(node: ts.Node): ReflectedProjectMember;
  abstract getReflectedProjectMemberFromSourceFile(
    sourceFile: ts.SourceFile
  ): ReflectedProjectMember[];
}

export function provideMemberDiscoveryStrategy(
  impl: Type<ProjectMemberDiscoveryStrategy>
): Provider {
  return {
    provide: ProjectMemberDiscoveryStrategy,
    useClass: impl,
    multi: true,
  };
}

export function provideMemberDiscoveryStrategies(
  impls: Type<ProjectMemberDiscoveryStrategy>[]
): Provider[] {
  return impls?.map(provideMemberDiscoveryStrategy) ?? [];
}
