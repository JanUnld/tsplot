import { ProjectGraph, ProjectView } from '../core';

export interface TemplateContext {
  view: ProjectView;
  graph: ProjectGraph;
}

export interface TemplateFileRenderer {
  render(templatePath: string, context: TemplateContext): string;
}
