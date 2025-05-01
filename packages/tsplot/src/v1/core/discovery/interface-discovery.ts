import { includes, query as tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  ProjectMember,
  ProjectMemberDiscovery,
  ProjectMemberReflection,
} from './project-member-discovery';

export interface InterfaceProjectMember extends ProjectMember {
  node: ts.InterfaceDeclaration;
  type: ts.InterfaceType;

  isExported: boolean;
  // todo: typeParams: unknown;
  fields: unknown;
  methods: unknown;
}

export class InterfaceDiscovery extends ProjectMemberDiscovery<InterfaceProjectMember> {
  override query(sourceFile: ts.SourceFile): ts.Node[] {
    return tsquery(sourceFile, 'InterfaceDeclaration');
  }
  override reflect({ node, type }: ProjectMember): ProjectMemberReflection<InterfaceProjectMember> {
    return {
      isExported: includes(node, 'ExportKeyword'),

      fields: type.getProperties(),
      methods: type.getCallSignatures(),
    };
  }
}
