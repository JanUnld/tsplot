import { EOL } from 'os';
import { dedupeBy } from '../../utils';
import { RelationDiagram } from '../relation-diagram';
import {
  PlantUMLRenderOptions,
  renderEdge,
  renderMember,
  renderPlantUml,
} from './plant-uml-renderer';

export class PlantUMLClassDiagram extends RelationDiagram {
  override render(options?: PlantUMLRenderOptions) {
    const members = this.getMembers(options);
    const edges = this.getEdges();

    if (!members?.length && !edges?.length) return '';

    return renderPlantUml(
      members
        .filter(dedupeBy((m) => m.name))
        .map((m) => renderMember(m, options))
        .filter(Boolean)
        .join(EOL),
      edges.map(renderEdge).join(EOL)
    );
  }
}
