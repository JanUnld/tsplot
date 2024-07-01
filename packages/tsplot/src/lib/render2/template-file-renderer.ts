import { ProjectView } from '../core';

export interface TemplateContext extends Record<string, unknown> {
  projectView: ProjectView;
}

export interface TemplateFileRenderer {
  setBaseDir(path: string): void;

  render(templatePath: string, context: TemplateContext): string;
}
