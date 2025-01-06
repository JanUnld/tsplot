import { includes } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

/** @internal */
export function traverseNode(
  node: ts.Node,
  options: {
    through: (node: ts.Node) => ts.Node;
    until?: (node: ts.Node) => boolean;
  }
): ts.Node {
  const nextNode = options.through(node);
  const shouldBreak = options.until;

  if (nextNode != null && !shouldBreak?.(nextNode))
    return traverseNode(nextNode, options);
  else return nextNode ?? node;
}

/** @internal */
export function traverseNodeParents(
  node: ts.Node,
  options: {
    until?: (node: ts.Node) => boolean;
  }
): ts.Node {
  return traverseNode(node, {
    through: (n) => n.parent,
    ...options,
  });
}

/** @internal */
export function traverseNodeParentsToMatching(
  node: ts.Node,
  selector: string
): ts.Node {
  return traverseNodeParents(node, {
    until: (n) => includes(n, selector),
  });
}
