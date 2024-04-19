import { includes, query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  appendIdentifierToSelector,
  removeIdentifierFromSelector,
} from '../utils';
import { Decorator, getDecoratorsFromNode } from './decorator';
import { Dependency } from './dependency';
import { getMethodsFromNode, Method } from './method';
import { getPropsFromNode, Property } from './property';

export enum MemberType {
  Class = 'class',
  Interface = 'interface',
  Enum = 'enum',
  Function = 'function',
  Type = 'type',
  Variable = 'variable',
}

export function toMemberType(kind: ts.SyntaxKind): MemberType | undefined {
  switch (kind) {
    case ts.SyntaxKind.ClassDeclaration:
      return MemberType.Class;
    case ts.SyntaxKind.InterfaceDeclaration:
      return MemberType.Interface;
    case ts.SyntaxKind.EnumDeclaration:
      return MemberType.Enum;
    case ts.SyntaxKind.FunctionDeclaration:
      return MemberType.Function;
    case ts.SyntaxKind.TypeAliasDeclaration:
      return MemberType.Type;
    case ts.SyntaxKind.VariableStatement:
    case ts.SyntaxKind.VariableDeclaration:
      return MemberType.Variable;
    default:
      return undefined;
  }
}

export interface Member {
  selector: string;
  node: ts.Node;
  deps: Dependency[];
  decorators: Decorator[];
  props: Property[];
  methods: Method[];
  type: MemberType;
  name: string;
  isAbstract: boolean;
  isExported: boolean;
}

export function getMembersFromSourceFile(source: ts.SourceFile): Member[] {
  const selectors: string[] = [
    'ClassDeclaration > Identifier',
    'InterfaceDeclaration > Identifier',
    'EnumDeclaration > Identifier',
    'FunctionDeclaration > Identifier',
    'TypeAliasDeclaration > Identifier',
    'SourceFile > VariableStatement VariableDeclaration > Identifier:first-child',
  ];

  return selectors
    .map(appendIdentifierToSelector)
    .flatMap((selector) =>
      query(source, selector).map((node) => ({ selector, node }))
    )
    .map(
      ({ selector, node }) =>
        ({
          selector: removeIdentifierFromSelector(selector),
          node: node.parent,
          type: toMemberType(node.parent.kind)!,
          decorators: getDecoratorsFromNode(node.parent),
          props: getPropsFromNode(node.parent),
          methods: getMethodsFromNode(node.parent),
          deps: [], // cannot be resolved statically. will be resolved within a project view
          name: node.getText(),
          isAbstract: includes(node.parent, 'AbstractKeyword'),
          isExported: includes(node.parent, 'ExportKeyword'),
        } as Member)
    );
}
