import { ProjectView } from '../core';

export interface TemplateContext extends Record<string, unknown> {
  projectView: ProjectView;
  indentSize?: number;
}

export interface TemplateFileRenderer {
  setBaseDir(path: string): void;

  canRender(templatePath: string): boolean;

  render(templatePath: string, context: TemplateContext): string;
}
