import { inject, Provider, Type } from 'injection-js';
import * as ts from 'typescript';
import { TYPE_CHECKER } from '../typescript';

export interface ProjectMember {
  symbol: ts.Symbol;
  node: ts.Node;
  type: ts.Type;

  name: string;
  uniqueName: string;
}

export type ProjectMemberReflection<T extends ProjectMember> = Partial<
  Omit<T, keyof ProjectMember>
>;

export function formatUniqueName(symbol: ts.Symbol, sourceFile?: ts.SourceFile): string {
  const fileName = sourceFile?.fileName ?? symbol.valueDeclaration?.getSourceFile().fileName;
  return `${fileName}#${symbol.escapedName}`;
}

export abstract class ProjectMemberDiscovery<T extends ProjectMember = ProjectMember> {
  readonly typeChecker = inject(TYPE_CHECKER);

  abstract query(sourceFile: ts.SourceFile): readonly ts.Node[];
  abstract reflect(member: ProjectMember): ProjectMemberReflection<T>;

  fromNode(node: ts.Node): T {
    const symbol = this.typeChecker.getSymbolAtLocation(node);
    const type = this.typeChecker.getTypeAtLocation(node);

    if (!symbol) throw new Error('No symbol found for the given node');

    const name = symbol.name;
    const uniqueName = formatUniqueName(symbol);

    const member: ProjectMember = { node, symbol, type, name, uniqueName };
    const reflection = this.reflect(member);

    return { ...member, ...reflection } as T;
  }
  fromSourceFile(sourceFile: ts.SourceFile): T[] {
    return this.query(sourceFile).map(this.fromNode.bind(this));
  }
}

export function provideMemberDiscovery(impl: Type<ProjectMemberDiscovery>): Provider {
  return {
    provide: ProjectMemberDiscovery,
    useClass: impl,
    multi: true,
  };
}

export function provideMemberDiscoveries(impls: Type<ProjectMemberDiscovery>[]): Provider[] {
  return impls?.map(provideMemberDiscovery) ?? [];
}
