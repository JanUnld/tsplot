import { includes, query as tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import { ProjectMember, ProjectMemberReflection } from '../project-member-discovery-strategy';
import { QueryBasedProjectMemberDiscoveryStrategy } from '../query-based-project-member-discovery-strategy';

export interface InterfaceProjectMember extends ProjectMember {
  node: ts.InterfaceDeclaration;
  type: ts.InterfaceType;
}

export interface InterfaceReflection extends ProjectMemberReflection {
  isExported: boolean;
  // todo: getTypeParams(): Promise<unknown>;
  getFields(): Promise<unknown>;
  getMethods(): Promise<unknown>;
}

export class InterfaceDiscoveryStrategy extends QueryBasedProjectMemberDiscoveryStrategy {
  override queryNodesFromSourceFile(sourceFile: ts.SourceFile): ts.Node[] {
    return tsquery(sourceFile, 'InterfaceDeclaration');
  }
  override reflectProjectMember({ node, type }: InterfaceProjectMember): InterfaceReflection {
    return {
      isExported: includes(node, 'ExportKeyword'),

      async getFields() {
        return type.getProperties();
      },
      async getMethods() {
        return type.getProperties();
      },
    };
  }
}
