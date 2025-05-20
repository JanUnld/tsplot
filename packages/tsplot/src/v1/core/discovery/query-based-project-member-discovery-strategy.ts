import { inject } from 'injection-js';
import * as ts from 'typescript';
import { TYPE_CHECKER } from '../typescript';
import {
  formatUniqueName,
  ProjectMember,
  ProjectMemberDiscoveryStrategy,
  ProjectMemberReflection,
  ReflectedProjectMember,
} from './project-member-discovery-strategy';

export abstract class QueryBasedProjectMemberDiscoveryStrategy extends ProjectMemberDiscoveryStrategy {
  readonly typeChecker = inject(TYPE_CHECKER);

  abstract queryNodesFromSourceFile(sourceFile: ts.SourceFile): readonly ts.Node[];
  abstract reflectProjectMember(member: ProjectMember): ProjectMemberReflection;

  getReflectedProjectMembersFromNode(node: ts.Node): ReflectedProjectMember {
    const symbol = this.typeChecker.getSymbolAtLocation(node);
    const type = this.typeChecker.getTypeAtLocation(node);

    if (!symbol) throw new Error('No symbol found for the given node');

    const name = symbol.name;
    const uniqueName = formatUniqueName(symbol);

    const member: ProjectMember = { node, symbol, type, name, uniqueName };
    const props = this.reflectProjectMember(member);

    return { ...member, ...props } as ReflectedProjectMember;
  }
  getReflectedProjectMemberFromSourceFile(sourceFile: ts.SourceFile): ReflectedProjectMember[] {
    return this.queryNodesFromSourceFile(sourceFile).map(
      this.getReflectedProjectMembersFromNode.bind(this)
    );
  }
}
