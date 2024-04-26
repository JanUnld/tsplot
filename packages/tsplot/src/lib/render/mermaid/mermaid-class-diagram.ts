import { EOL } from 'os';
import { dedupeBy } from '../../utils';
import { RelationDiagram } from '../relation-diagram';
import {
  MermaidRenderOptions,
  renderEdge,
  renderMember,
  renderMermaid,
} from './mermaid-renderer';

export class MermaidClassDiagram extends RelationDiagram {
  override render(options?: MermaidRenderOptions): string {
    const members = this.getMembers(options);
    const edges = this.getEdges();

    if (!members?.length && !edges?.length) return '';

    return renderMermaid(
      'classDiagram',
      members
        .filter(dedupeBy((m) => m.name))

        .map((m) => renderMember(m, options))
        .filter(Boolean)
        .join(EOL),
      edges.map(renderEdge).join(EOL)
    );
  }
}
