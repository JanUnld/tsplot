import * as ts from 'typescript';
import {
  ACCESS_MODIFIER_FLAGS,
  AccessModifiers,
  appendIdentifierToSelector,
  dedupeBy,
  getModifierFlagsFromNode,
  getNodesBySelectors,
  getTypeInfoFromNode,
  prependDeclToSelector,
  ResolvedNode,
  TypeInfo,
} from '../utils';

export interface Field extends ResolvedNode, AccessModifiers, TypeInfo {
  name: string;
}

export function getFieldsFromNode(
  node: ts.Node,
  typeChecker: ts.TypeChecker
): Field[] {
  const selectors: string[] = [
    'PropertySignature',
    'PropertyDeclaration:not(:has(ArrowFunction))',
    'GetAccessor',
    'SetAccessor',
    'EnumMember',
  ];

  return getNodesBySelectors(node, selectors, [
    prependDeclToSelector,
    appendIdentifierToSelector,
  ])
    .map(({ node }) => {
      return {
        node: node.parent,
        name: node.getText(),
        ...getTypeInfoFromNode(node.parent, typeChecker),
        ...getModifierFlagsFromNode(node.parent, ACCESS_MODIFIER_FLAGS),
      };
    })
    .filter(dedupeBy((p) => p.name));
}
