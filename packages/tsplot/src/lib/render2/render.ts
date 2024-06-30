import { NunjucksRenderer } from './nunjucks-renderer';
import {
  TemplateContext,
  TemplateFileRenderer,
} from './template-file-renderer';

export type BuiltInDiagram = 'class-diagram';
export type BuiltInTemplate = 'puml' | 'mmd';

function isBuiltInTemplate(str: string): str is BuiltInTemplate {
  return ['puml', 'mmd'].includes(str);
}

export interface RenderOptions extends TemplateContext {
  template?: BuiltInTemplate | string;
  renderer?: TemplateFileRenderer;
  baseDir?: string;
}

export function render(
  diagram: BuiltInDiagram | string,
  options: RenderOptions
) {
  const {
    renderer = new NunjucksRenderer(),
    template = 'puml',
    view,
    graph,
    baseDir,
  } = options;

  if (baseDir) {
    renderer.setBaseDir(baseDir);
  }

  return renderer.render(`${template}/${diagram}.njk`, { view, graph });
}
