import * as ts from 'typescript';
import {
  ACCESS_MODIFIER_FLAGS,
  appendIdentifierToSelector,
  dedupeBy,
  getModifierFlagsFromNode,
  getNodesBySelectors,
  getReturnTypeInfoFromNode,
  getTypeInfoFromNode,
  prependDeclToSelector,
  ReturnTypeInfo,
} from '../utils';
import { Field } from './field';
import { getParamsFromNode, Parameter } from './parameter';

export interface Method extends Field, ReturnTypeInfo {
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
    .map(({ node }) => {
      return {
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
