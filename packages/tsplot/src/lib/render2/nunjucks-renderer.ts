import * as njk from 'nunjucks';
import { resolve } from 'path';
import * as ts from 'typescript';
import {
  TemplateContext,
  TemplateFileRenderer,
} from './template-file-renderer';

/** @internal */
const INTERNAL_NJK_TEMPLATE_DIR = resolve(__dirname, 'templates');

/** @internal */
export interface NunjucksRendererOptions extends njk.ConfigureOptions {
  /** Base directory paths for the renderer to find any template files */
  baseDirs?: string[];
}

/**
 * [Nunjucks](https://mozilla.github.io/nunjucks/) powered renderer taking care
 * of the generation of diagram related files. This class is supposed to also
 * accept custom templates that will override any base templates defined inside
 * this library
 *
 * @internal
 */
export class NunjucksRenderer implements TemplateFileRenderer {
  private _njk: njk.Environment = this._createEnv();

  constructor(options?: NunjucksRendererOptions) {
    this._createEnv(options);
  }

  setBaseDir(path: string) {
    this._njk = this._createEnv({ baseDirs: [path] });
  }

  render(templatePath: string, context: TemplateContext) {
    return this._njk.render(templatePath, context);
  }

  private _createEnv(options?: NunjucksRendererOptions) {
    const { baseDirs = [] } = options ?? {};

    const env = njk.configure([INTERNAL_NJK_TEMPLATE_DIR, ...baseDirs], {
      autoescape: false,
      lstripBlocks: true,
      trimBlocks: true,
      noCache: true,
    });

    env.addGlobal('ts', ts);

    return env;
  }
}
