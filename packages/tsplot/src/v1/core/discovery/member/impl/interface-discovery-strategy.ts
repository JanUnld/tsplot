import { includes, query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import { ProjectMember, ProjectMemberReflection } from '../project-member-discovery-strategy';
import { QueryBasedProjectMemberDiscoveryStrategy } from '../query-based-project-member-discovery-strategy';

export interface InterfaceProjectMember extends ProjectMember {
  node: ts.InterfaceDeclaration;
  type: ts.InterfaceType;
}

export interface InterfaceReflection extends ProjectMemberReflection {
  isExported: boolean;
  // todo: getTypeParams(): unknown[];
  getFields(): unknown[];
  getMethods(): readonly unknown[];
}

export class InterfaceDiscoveryStrategy extends QueryBasedProjectMemberDiscoveryStrategy {
  override queryNodesFromSourceFile(sourceFile: ts.SourceFile): ts.Node[] {
    return query(sourceFile, 'InterfaceDeclaration');
  }

  override reflectProjectMember({ node, type }: InterfaceProjectMember): InterfaceReflection {
    return {
      isExported: includes(node, 'ExportKeyword'),

      getFields() {
        return type.getProperties();
      },
      getMethods() {
        return type.getCallSignatures();
      },
    };
  }
}
