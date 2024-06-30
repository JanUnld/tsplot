import { ProjectGraph, ProjectView } from '../core';

export interface TemplateContext {
  view: ProjectView;
  graph: ProjectGraph;
}

export interface TemplateFileRenderer {
  setBaseDir(path: string): void;

  render(templatePath: string, context: TemplateContext): string;
}
