import { EOL } from 'os';
import { Member } from '../../core';
import { RelationDiagram } from '../relation-diagram';
import { renderEdge } from '../render-edge';
import { renderPlantUml } from './render-plant-uml';

export function renderMemberAsPlantUML(m: Member): string {
  let type: string;
  switch (m.type) {
    case 'class':
    case 'interface':
    case 'enum':
      type = m.type;
      if (m.isAbstract && type === 'class') {
        type = `abstract ${type}`;
      }
      break;
    case 'type':
      type = 'interface';
      break;
    case 'function':
      type = 'protocol';
      break;
    default:
      type = 'entity';
      break;
  }

  const stereotype = m.decorators
    ?.map((d) => d.name)
    .filter(Boolean)
    .join(', ');

  return `${type} ${m.name}${stereotype ? ` <<${stereotype}>>` : ''}`;
}

export class PlantUMLClassDiagram extends RelationDiagram {
  override render(options?: { edgeless?: boolean }) {
    const members = this.getMembers(options);
    const edges = this.getEdges();

    if (!members?.length && !edges?.length) return '';

    return renderPlantUml(
      members.map(renderMemberAsPlantUML).filter(Boolean).join(EOL),
      edges.map(renderEdge).join(EOL)
    );
  }
}
