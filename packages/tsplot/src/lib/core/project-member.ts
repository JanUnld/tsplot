import { includes } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  getModifierFlagsFromNode,
  getNodesBySelectors,
  ResolvedNode,
  traverseNodeParentsToMatching,
} from '../utils';
import { Constructor, getConstructorFromNode } from './constructor';
import { Decorator, getDecoratorsFromNode } from './decorator';
import { Dependency } from './dependency';
import { Field, getFieldsFromNode } from './field';
import { getMethodsFromNode, Method } from './method';
import { getParamsFromNode, Parameter } from './parameter';
import {
  getTypeInfoFromNode,
  ReturnTypeInfo,
  tryGetReturnTypeFromNode,
  TypeInfo,
} from './type-info';

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
export function getMemberKindFromNode(node: ts.Node): MemberKind | undefined {
  const isArrowFunctionVar =
    (ts.isVariableStatement(node) || ts.isVariableDeclaration(node)) &&
    includes(node, 'ArrowFunction');

  if (isArrowFunctionVar) {
    return MemberKind.Function;
  }

  switch (node.kind) {
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

export interface ProjectMember
  extends ResolvedNode,
    TypeInfo,
    Partial<ReturnTypeInfo> {
  deps: Dependency[];
  decorators: Decorator[];
  fields: Field[];
  methods: Method[];
  params: Parameter[];
  ctor?: Constructor;
  kind: MemberKind;
  name: string;
  uniqueName: string;
  isExported: boolean;
  isAbstract: boolean;
}

/** @internal */
export function getMembersFromSourceFile(
  source: ts.SourceFile,
  typeChecker: ts.TypeChecker
): ProjectMember[] {
  const arrowFunctionVarDecl = 'VariableDeclaration > ArrowFunction';

  const selectors: string[] = [
    'ClassDeclaration > Identifier',
    'InterfaceDeclaration > Identifier',
    'EnumDeclaration > Identifier',
    'FunctionDeclaration > Identifier',
    `SourceFile > VariableStatement:has(${arrowFunctionVarDecl}) VariableDeclaration > Identifier`,
    'TypeAliasDeclaration > Identifier',
    `SourceFile > VariableStatement:not(:has(${arrowFunctionVarDecl})) VariableDeclaration > Identifier:first-child`,
  ];

  return getNodesBySelectors(source, selectors).map(
    ({ node }) =>
      ({
        node: node.parent,
        name: node.getText(),
        kind: getMemberKindFromNode(node.parent)!,
        ctor: getConstructorFromNode(node.parent, typeChecker),
        decorators: getDecoratorsFromNode(node.parent),
        fields: getFieldsFromNode(node.parent, typeChecker),
        methods: getMethodsFromNode(node.parent, typeChecker),
        params: getParamsFromNode(node.parent, typeChecker),
        ...getModifierFlagsFromNode(
          traverseNodeParentsToMatching(node, 'VariableStatement') ?? node,
          ['isExported', 'isAbstract']
        ),
        ...getTypeInfoFromNode(node.parent, typeChecker),
        ...tryGetReturnTypeFromNode(node.parent, typeChecker),
        // cannot be resolved statically. will be resolved within a project view
        // after all members are collected and indexed
        deps: [] as Dependency[],
        // same goes for the `uniqueName` field
      } as ProjectMember)
  );
}

/** @internal */
export function getMemberUniqueId(member: ProjectMember) {
  return `${member.node.getSourceFile().fileName}#${member.name}`;
}
