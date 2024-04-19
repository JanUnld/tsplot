import * as ts from 'typescript';
import {
  appendIdentifierToSelector,
  dedupeBy,
  getNodesBySelectors,
  getTypeRefName,
  pipeSelector,
  prependDeclToSelector,
  removeDeclFromSelector,
  removeIdentifierFromSelector,
} from '../utils';

export interface Property {
  selector: string;
  node: ts.Node;
  name: string;
  typeName?: string;
  // typeName: string;
  // isAbstract: boolean;
  // isStatic: boolean;
  // isReadonly: boolean;
  // isOptional: boolean;
  // isPrivate: boolean;
  // isProtected: boolean;
  // isPublic: boolean;
}

export function getPropsFromNode(node: ts.Node): Property[] {
  const selectors: string[] = [
    'PropertySignature',
    'PropertyDeclaration:not(:has(ArrowFunction))',
    'GetAccessor',
    'SetAccessor',
    'EnumMember',
  ];

  return getNodesBySelectors(
    node,
    selectors.map((selector) =>
      pipeSelector(selector, [
        prependDeclToSelector,
        appendIdentifierToSelector,
      ])
    )
  )
    .map(({ selector, node }) => {
      return {
        selector: pipeSelector(selector, [
          removeDeclFromSelector,
          removeIdentifierFromSelector,
        ]),
        node: node.parent,
        name: node.getText(),
        typeName: getTypeRefName(node.parent),
      };
    })
    .filter(dedupeBy((p) => p.name));
}
