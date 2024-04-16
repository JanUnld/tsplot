import { EOL } from 'os';
import { Member } from '../../core';
import { indent } from '../../utils';
import { RelationDiagram } from '../relation-diagram';
import { renderEdge } from '../render-edge';

export function renderMemberAsMermaid(m: Member): string {
  let annotation = '';
  switch (m.type) {
    case 'class':
      if (m.isAbstract) {
        annotation = 'Abstract';
      }
      break;
    case 'enum':
      annotation = 'Enumeration';
      break;
    case 'interface':
      annotation = 'Interface';
      break;
  }

  return (
    `class ${m.name}` + (annotation ? `${EOL}<<${annotation}>> ${m.name}` : '')
  );
}

export class MermaidClassDiagram extends RelationDiagram {
  override render(options?: { edgeless?: boolean }): string {
    return (
      `classDiagram${EOL}` +
      indent(
        this.getMembers(options).map(renderMemberAsMermaid).join(EOL) +
          EOL +
          this.getEdges().map(renderEdge).join(EOL)
      )
    );
  }
}
