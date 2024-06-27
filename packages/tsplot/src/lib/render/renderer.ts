import * as ts from 'typescript';
import { Member } from '../core';
import { AccessModifiers } from '../utils';
import { RelationEdge } from './relation-diagram';

/** @internal */
export function renderNameQuoted(m: Member): string {
  return `"${m.name + (ts.isFunctionLike(m.node) ? '()' : '')}"`;
}

/** @internal */
export function renderVisibility(am: AccessModifiers): string {
  if (am.isPrivate) return '-';
  if (am.isProtected) return '#';
  if (am.isPublic) return '+';
  return '';
}

/** @internal */
export function renderOptional(o: { isOptional?: boolean }) {
  return o.isOptional ? '?' : '';
}

/**
 * Used to render the connection of two related {@link Member}s
 * @internal
 */
export function renderEdgeConnection(edge: RelationEdge): string {
  let connection: string;
  switch (edge.type) {
    case 'extension':
      connection = '--|>';
      break;
    case 'composition':
      connection = '--*';
      break;
    case 'aggregation':
      connection = '--o';
      break;
    default:
      connection = ts.isClassLike(edge.from.node) ? '-->' : '..>';
      break;
  }

  return `${connection}`;
}
