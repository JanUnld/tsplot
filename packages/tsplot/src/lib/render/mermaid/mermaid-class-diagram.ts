import { EOL } from 'os';
import { dedupeBy } from '../../utils';
import {
  RelationDiagram,
  RelationDiagramFilterOptions,
} from '../relation-diagram';
import { renderEdge, renderMember, renderMermaid } from './mermaid-renderer';

export class MermaidClassDiagram extends RelationDiagram {
  override render(options?: RelationDiagramFilterOptions): string {
    const members = this.getMembers(options);
    const edges = this.getEdges();

    if (!members?.length && !edges?.length) return '';

    return renderMermaid(
      'classDiagram',
      members
        .filter(dedupeBy((m) => m.name))
        .map(renderMember)
        .filter(Boolean)
        .join(EOL),
      edges.map(renderEdge).join(EOL)
    );
  }
}
