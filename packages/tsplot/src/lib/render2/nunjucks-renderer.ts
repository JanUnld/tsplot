import * as njk from 'nunjucks';
import { resolve } from 'path';
import * as ts from 'typescript';
import { renderVisibility } from '../render/renderer';
import {
  TemplateContext,
  TemplateFileRenderer,
} from './template-file-renderer';

/** @internal */
const INTERNAL_NJK_TEMPLATE_DIR = resolve(__dirname, 'templates');

export interface NunjucksRendererOptions extends njk.ConfigureOptions {
  /** Base directory paths for the renderer to find any template files */
  rootDirs?: string[];
}

/**
 * [Nunjucks](https://mozilla.github.io/nunjucks/) powered renderer taking care
 * of the generation of diagram related files. This class is supposed to also
 * accept custom templates that will override any base templates defined inside
 * this library
 */
export class NunjucksRenderer implements TemplateFileRenderer {
  private readonly _njk: njk.Environment;

  constructor(options?: NunjucksRendererOptions) {
    const { rootDirs = [] } = options ?? {};

    this._njk = njk.configure([INTERNAL_NJK_TEMPLATE_DIR, ...rootDirs], {
      autoescape: false,
      lstripBlocks: true,
      trimBlocks: true,
      noCache: true,
    });

    this._njk.addGlobal('ts', ts);
    this._njk.addFilter('visibility', renderVisibility);
  }

  render(templatePath: string, context: TemplateContext) {
    return this._njk.render(templatePath, context);
  }
}
