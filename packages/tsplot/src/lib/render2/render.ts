import { ProjectGraph } from '../core';
import { NunjucksRenderer } from './nunjucks-renderer';
import {
  TemplateContext,
  TemplateFileRenderer,
} from './template-file-renderer';

export enum BuiltInTemplate {
  ClassDiagram = 'class-diagram',
}

export enum BuiltInTemplateTarget {
  PlantUML = 'plant-uml',
  Mermaid = 'mermaid',
}

/** Options and flexible {@link TemplateContext} for rendering  */
export interface RenderOptions {
  /**
   * Either a {@link BuiltInTemplateTarget} or a subdirectory of {@link baseDir}
   * that is supposed to point to a directory name containing template files
   */
  target: BuiltInTemplateTarget | string;
  /** The context that is handed to the template when rendering */
  context: TemplateContext;
  /** Custom {@link TemplateFileRenderer} implementation to use for rendering */
  renderer?: TemplateFileRenderer;
  /**
   * Absolute base directory path containing different subdirectories with
   * templates
   */
  baseDir?: string;
}

/**
 * Renders a {@link BuiltInTemplate} or custom template using the information
 * provided in a {@link ProjectView} and a {@link ProjectGraph} that's created
 * from the view instance
 *
 * **Default usage example**
 * ```typescript
 * render(BuiltInTemplate.ClassDiagram, {
 *   target: BuiltInTemplate.PlantUML,
 *   context: { projectView },
 * });
 * ```
 *
 * **Custom template example**
 *
 * Assuming the template file `.tsplot/templates/custom-template.njk` exists.
 *
 * ```typescript
 * render('custom-template', {
 *   baseDir: path.resolve(__dirname, '.tsplot'),
 *   context: { projectView },
 *   target: 'templates'
 * });
 * ```
 *
 * Custom templates **do not** require to be a declarative diagram dialect (e.g.
 * plant-uml). It can also be any other desired output format (ex. markdown)
 *
 * @param template Either a {@link BuiltInTemplate} or custom template name
 * @param options Required and other {@link RenderOptions}
 */
export function render(
  template: BuiltInTemplate | string,
  options: RenderOptions
) {
  const {
    renderer = new NunjucksRenderer(),
    target = 'puml',
    baseDir,
  } = options;

  if (baseDir) {
    renderer.setBaseDir(baseDir);
  }

  return renderer.render(`${target}/${template}.njk`, {
    projectGraph: ProjectGraph.fromView(options.context.projectView),
    ...options.context,
  });
}
