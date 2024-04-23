import * as ts from 'typescript';
import {
  ACCESS_MODIFIER_FLAGS,
  AccessModifiers,
  appendIdentifierToSelector,
  dedupeBy,
  getModifierFlagsFromNode,
  getNodesBySelectors,
  pipeSelector,
  prependDeclToSelector,
  removeDeclFromSelector,
  removeIdentifierFromSelector,
  ResolvedNode,
} from '../utils';

export interface Field extends ResolvedNode, AccessModifiers {
  name: string;
}

export function getFieldsFromNode(node: ts.Node): Field[] {
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
    .map(({ selector, node }) => {
      return {
        selector: pipeSelector(selector, [
          removeDeclFromSelector,
          removeIdentifierFromSelector,
        ]),
        node: node.parent,
        name: node.getText(),
        ...getModifierFlagsFromNode(node.parent, ACCESS_MODIFIER_FLAGS),
      };
    })
    .filter(dedupeBy((p) => p.name));
}
