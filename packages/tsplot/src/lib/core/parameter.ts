import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';
import {
  appendIdentifierToSelector,
  getModifierFlagsFromNode,
  PARAMETER_MODIFIER_FLAGS,
  ParameterModifierFlags,
  pipeSelector,
  prependDeclToSelector,
} from '../utils';

export interface Parameter extends Record<ParameterModifierFlags, boolean> {
  node: ts.Node;
  name: string;
}

export function getParamsFromNode(node: ts.Node): Parameter[] {
  return query(
    node,
    pipeSelector('Parameter', [
      prependDeclToSelector,
      appendIdentifierToSelector,
    ])
  ).map((node) => ({
    node: node.parent,
    name: node.getText(),
    ...getModifierFlagsFromNode(node.parent, PARAMETER_MODIFIER_FLAGS),
  }));
}
