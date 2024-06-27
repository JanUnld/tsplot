import * as njk from 'nunjucks';
import { resolve } from 'path';
import * as ts from 'typescript';

/** @internal */
const INTERNAL_TEMPLATE_DIR = resolve(__dirname, 'templates');

export interface NjkRendererOptions extends njk.ConfigureOptions {
  /** Base paths for the renderer to find any template files */
  paths: string[];
}

/**
 * [Nunjucks](https://mozilla.github.io/nunjucks/) powered renderer taking care
 * of the generation of diagram related files. This class is supposed to also
 * accept custom templates that will override any base templates defined inside
 * this library
 */
export class NjkRenderer {
  private readonly _njk: njk.Environment;

  constructor(options?: NjkRendererOptions) {
    this._njk = njk.configure(options?.paths ?? INTERNAL_TEMPLATE_DIR, {
      autoescape: false,
      lstripBlocks: true,
      trimBlocks: true,
      noCache: true,
    });

    this._njk.addGlobal('ts', ts);
  }

  render(templatePath: string, context: object) {
    return this._njk.render(templatePath, context);
  }
}
