import * as ts from 'typescript';
import {
  ACCESS_MODIFIER_FLAGS,
  AccessModifiers,
  appendIdentifierToSelector,
  dedupeBy,
  getModifierFlagsFromNode,
  getNodesBySelectors,
  getReturnTypeInfoFromNode,
  getTypeInfoFromNode,
  pipeSelector,
  prependDeclToSelector,
  removeDeclFromSelector,
  removeIdentifierFromSelector,
  ResolvedNode,
  ReturnTypeInfo,
  TypeInfo,
} from '../utils';
import { getParamsFromNode, Parameter } from './parameter';

export interface Method
  extends ResolvedNode,
    AccessModifiers,
    TypeInfo,
    ReturnTypeInfo {
  name: string;
  params: Parameter[];
}

export function getMethodsFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): Method[] {
  const selectors: string[] = [
    'MethodSignature',
    'MethodDeclaration',
    'PropertyDeclaration:has(ArrowFunction)',
  ];

  return getNodesBySelectors(node, selectors, [
    prependDeclToSelector,
    appendIdentifierToSelector,
  ])
    .map(({ selector, node }) => {
      return {
        selector: pipeSelector(selector, [
          removeDeclFromSelector,
          removeIdentifierFromSelector,
        ]),
        node: node.parent,
        name: node.getText(),
        params: getParamsFromNode(node.parent, typeChecker),
        ...getModifierFlagsFromNode(node.parent, ACCESS_MODIFIER_FLAGS),
        ...getTypeInfoFromNode(node.parent, typeChecker),
        ...getReturnTypeInfoFromNode(node.parent, typeChecker),
      };
    })
    .filter(dedupeBy((p) => p.name));
}
