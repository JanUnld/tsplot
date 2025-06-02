import { inject } from 'injection-js';
import * as ts from 'typescript';
import { NodeReflector } from '../node-reflector';
import {
  ProjectMember,
  ProjectMemberDiscoveryStrategy,
  ProjectMemberReflection,
  ReflectedProjectMember,
} from './project-member-discovery-strategy';

export abstract class QueryBasedProjectMemberDiscoveryStrategy extends ProjectMemberDiscoveryStrategy {
  protected readonly nodeReflector = inject(NodeReflector);

  abstract queryNodesFromSourceFile(sourceFile: ts.SourceFile): readonly ts.Node[];
  abstract reflectProjectMember(member: ProjectMember): ProjectMemberReflection;

  override getReflectedProjectMembersFromNode(node: ts.Node): ReflectedProjectMember {
    const { symbol, type } = this.nodeReflector.reflectNodeOrThrow(node);

    const name = symbol.name;
    const uniqueName = this.nodeReflector.formatUniqueName(node);

    const member: ProjectMember = { node, symbol, type, name, uniqueName };
    const props = this.reflectProjectMember(member);

    return { ...member, ...props } as ReflectedProjectMember;
  }
  override getReflectedProjectMembersFromSourceFile(
    sourceFile: ts.SourceFile
  ): ReflectedProjectMember[] {
    return this.queryNodesFromSourceFile(sourceFile).map(
      this.getReflectedProjectMembersFromNode.bind(this)
    );
  }
}
