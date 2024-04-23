import { query } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

/**
 * Holds a typescript node and the selector it has been matched with
 * @internal
 */
export interface ResolvedNode {
  selector: string;
  node: ts.Node;
}

/** @internal */
type SelectorPipeOperator = (str: string) => string;

/** @internal */
export const pipeSelector = (
  selector: string,
  operators?: SelectorPipeOperator[]
) => operators?.reduce((s, f) => f(s), selector) ?? selector;

/** @internal */
export const appendIdentifierToSelector = (selector: string) =>
  `${selector} > Identifier`;

/** @internal */
export const removeIdentifierFromSelector = (selector: string) =>
  selector.replace(/\s*>\s*Identifier\s*/, '');

/** @internal */
export const prependDeclToSelector = (selector: string) =>
  `:declaration > ${selector}`;

/** @internal */
export const removeDeclFromSelector = (selector: string) =>
  selector.replace(/:declaration\s*>\s*/, '');

/** @internal */
export function getNodesBySelectors(
  node: ts.Node,
  selectors: string[],
  operators?: Array<(str: string) => string>
): ResolvedNode[] {
  return selectors
    .map((selector) => pipeSelector(selector, operators))
    .flatMap((selector) =>
      query(node, selector).map((node) => ({ selector, node }))
    );
}
