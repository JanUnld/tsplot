import { RelationEdge } from './relation-diagram';

/**
 * Used to render the connection of two related {@link Member}s
 * @internal
 */
export function renderEdge(edge: RelationEdge): string {
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
      connection = edge.from.type === 'class' ? '-->' : '..>';
      break;
  }

  return `${edge.from.name} ${connection} ${edge.to.name}`;
}
