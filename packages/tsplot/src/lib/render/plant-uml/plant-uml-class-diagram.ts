import { EOL } from 'os';
import { dedupeBy } from '../../utils';
import {
  RelationDiagram,
  RelationDiagramFilterOptions,
} from '../relation-diagram';
import { renderEdge, renderMember, renderPlantUml } from './plant-uml-renderer';

export class PlantUMLClassDiagram extends RelationDiagram {
  override render(options?: RelationDiagramFilterOptions) {
    const members = this.getMembers(options);
    const edges = this.getEdges();

    if (!members?.length && !edges?.length) return '';

    return renderPlantUml(
      members
        .filter(dedupeBy((m) => m.name))
        .map(renderMember)
        .filter(Boolean)
        .join(EOL),
      edges.map(renderEdge).join(EOL)
    );
  }
}
