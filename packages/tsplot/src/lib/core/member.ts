import * as ts from 'typescript';
import {
  getModifierFlagsFromNode,
  getNodesBySelectors,
  getTypeInfoFromNode,
  ResolvedNode,
  ReturnTypeInfo,
  tryGetReturnTypeFromNode,
  TypeInfo,
} from '../utils';
import { Decorator, getDecoratorsFromNode } from './decorator';
import { Dependency } from './dependency';
import { Field, getFieldsFromNode } from './field';
import { getMethodsFromNode, Method } from './method';
import { getParamsFromNode, Parameter } from './parameter';

export enum MemberKind {
  Class = 'class',
  Interface = 'interface',
  Enum = 'enum',
  Function = 'function',
  Type = 'type',
  Variable = 'variable',
}

/** @deprecated Use {@link MemberKind} instead. Will be removed soon */
export const MemberType = MemberKind;

/** @internal */
export function getMemberKindFromSyntaxKind(
  kind: ts.SyntaxKind
): MemberKind | undefined {
  switch (kind) {
    case ts.SyntaxKind.ClassDeclaration:
      return MemberKind.Class;
    case ts.SyntaxKind.InterfaceDeclaration:
      return MemberKind.Interface;
    case ts.SyntaxKind.EnumDeclaration:
      return MemberKind.Enum;
    case ts.SyntaxKind.FunctionDeclaration:
      return MemberKind.Function;
    case ts.SyntaxKind.TypeAliasDeclaration:
      return MemberKind.Type;
    case ts.SyntaxKind.VariableStatement:
    case ts.SyntaxKind.VariableDeclaration:
      return MemberKind.Variable;
    default:
      return undefined;
  }
}

// todo: consider different member interfaces for different member types (e.g. ClassMember, InterfaceMember, etc.)

export interface Member
  extends ResolvedNode,
    TypeInfo,
    Partial<ReturnTypeInfo> {
  deps: Dependency[];
  decorators: Decorator[];
  fields: Field[];
  methods: Method[];
  params: Parameter[];
  kind: MemberKind;
  name: string;
  isExported: boolean;
  isAbstract: boolean;
}

export function getMembersFromSourceFile(
  source: ts.SourceFile,
  typeChecker: ts.TypeChecker
): Member[] {
  const selectors: string[] = [
    'ClassDeclaration > Identifier',
    'InterfaceDeclaration > Identifier',
    'EnumDeclaration > Identifier',
    'FunctionDeclaration > Identifier',
    'TypeAliasDeclaration > Identifier',
    'SourceFile > VariableStatement VariableDeclaration > Identifier:first-child',
  ];

  return getNodesBySelectors(source, selectors).map(
    ({ node }) =>
      ({
        node: node.parent,
        name: node.getText(),
        kind: getMemberKindFromSyntaxKind(node.parent.kind)!,
        decorators: getDecoratorsFromNode(node.parent),
        fields: getFieldsFromNode(node.parent, typeChecker),
        methods: getMethodsFromNode(node.parent, typeChecker),
        params: getParamsFromNode(node.parent, typeChecker),
        ...getModifierFlagsFromNode(node.parent, ['isExported', 'isAbstract']),
        ...getTypeInfoFromNode(node.parent, typeChecker),
        ...tryGetReturnTypeFromNode(node.parent, typeChecker),
        // cannot be resolved statically. will be resolved within a project view
        // after all members are collected and indexed
        deps: [] as Dependency[],
      } as Member)
  );
}
