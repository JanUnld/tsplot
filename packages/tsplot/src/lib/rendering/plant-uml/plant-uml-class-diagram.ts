import { EOL } from 'os';
import { Member } from '../../core';
import { indent } from '../../utils';
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

  const str = `${type} ${m.name}${stereotype ? ` <<${stereotype}>>` : ''}`;

  if (!m.props.length) {
    return str;
  } else {
    const props = m.props.map((p) => `{field} ${p.name}`).join(EOL);
    return `${str} {${EOL}${indent(props)}${EOL}}`;
  }
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
