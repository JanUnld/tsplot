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

function isBuiltInTemplate(str: string): str is BuiltInTemplateTarget {
  return Object.values(BuiltInTemplateTarget).includes(
    str as BuiltInTemplateTarget
  );
}

/** Options and flexible {@link TemplateContext} for rendering  */
export interface RenderOptions extends TemplateContext {
  /**
   * Either a {@link BuiltInTemplateTarget} or a subdirectory of {@link baseDir}
   * that is supposed to point to a directory name containing template files
   */
  target: BuiltInTemplateTarget | string;
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
 *   projectView
 * });
 * ```
 *
 * **Custom template example**
 *
 * Assuming the template file `.tsplot/templates/custom-template.njk` exists.
 *
 * ```typescript
 * render('custom-template', {
 *   baseDir: path.resolve(__dirname, '.tsplot')
 *   target: 'templates',
 *   projectView,
 * });
 * ```
 *
 * Custom templates **do not** require to be a declarative diagram dialect (e.g.
 * plant-uml). It can also be any other desired output format (ex. markdown)
 *
 * @param template Either a {@link BuiltInTemplate} or custom template name
 * @param options Required and other options for rendering
 * @param options.view Required {@link ProjectView} instance
 * @param options.target Required {@link RenderOptions.target}
 * @param options.renderer Optional custom {@link TemplateFileRenderer} instance
 *  to provide an alternative rendering implementation. This **does** overwrite
 *  the internally used {@link NunjucksRenderer}. Make sure to provide the proper
 *  template syntax and file extensions in case you're using this!
 * @param options.baseDir Optional custom base directory to register. **Does not**
 *  overwrite any built in paths used by default (e.g. `puml`, `mmd`)
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
    projectGraph: ProjectGraph.fromView(options.projectView),
    ...options,
  });
}
