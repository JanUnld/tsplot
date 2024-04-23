import * as ts from 'typescript';
import {
  getModifierFlagsFromNode,
  getNodesBySelectors,
  removeIdentifierFromSelector,
  ResolvedNode,
} from '../utils';
import { Decorator, getDecoratorsFromNode } from './decorator';
import { Dependency } from './dependency';
import { Field, getFieldsFromNode } from './field';
import { getMethodsFromNode, Method } from './method';
import { getParamsFromNode, Parameter } from './parameter';

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

export interface Member extends ResolvedNode {
  deps: Dependency[];
  decorators: Decorator[];
  props: Field[];
  methods: Method[];
  params: Parameter[];
  type: MemberType;
  name: string;
  isExported: boolean;
  isAbstract: boolean;
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

  return getNodesBySelectors(source, selectors).map(
    ({ selector, node }) =>
      ({
        selector: removeIdentifierFromSelector(selector),
        node: node.parent,
        name: node.getText(),
        type: toMemberType(node.parent.kind)!,
        decorators: getDecoratorsFromNode(node.parent),
        props: getFieldsFromNode(node.parent),
        methods: getMethodsFromNode(node.parent),
        params: getParamsFromNode(node.parent),
        ...getModifierFlagsFromNode(node.parent, ['isExported', 'isAbstract']),
        // cannot be resolved statically. will be resolved within a project view
        deps: [] as Dependency[],
      } as Member)
  );
}
