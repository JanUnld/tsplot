import { Command, Option } from 'commander';
import { consola } from 'consola';
import {
  BuiltInTemplate,
  BuiltInTemplateTarget,
  ProjectView,
  render as _render,
} from '../../lib';
import {
  collectStats,
  getConfinedProjectViewFromMemberOrDefault,
  getProjectView,
  interpolateOutputPath,
  logSharedOptions,
  output,
  setupConsola,
  setupSharedOptions,
  SharedOptions,
} from '../utils';

export interface RenderOptions extends SharedOptions {
  target: BuiltInTemplateTarget | string;
  baseDir?: string;
  // todo: fields; // filter
  // todo: methods; // filter
}

/** @internal */
export function setupRenderCommand(program: Command) {
  return setupSharedOptions(
    program
      .command('render')
      .argument(
        '<template>',
        'the template name that shall be rendered as output (e.g. class-diagram)'
      )
      .description(
        'renders typescript AST and type checker information to a desired target ' +
          'format using built-in and custom templates (e.g. plant-uml, mermaid)'
      )
      .option(
        '--baseDir <path>',
        'custom base directory to use for template file resolution'
      )
      .addOption(
        new Option(
          '-t, --target <name>',
          'the rendering output target'
        ).default(BuiltInTemplateTarget.PlantUML)
      )
  ).action(render);
}

export async function render(
  template: BuiltInTemplate | string,
  options: RenderOptions
) {
  setupConsola(options);
  logSharedOptions(options);

  const view = getProjectView(options);
  const renderView = (projectView: ProjectView) =>
    _render(template, {
      baseDir: options.baseDir,
      context: { projectView },
      target: options.target,
    });

  if (options.debug) {
    const s = await collectStats({ ...options, silent: true });

    consola.debug('stats:', JSON.stringify(s, null, 2));
  }

  if (!options.split || !options?.from) {
    const confinedView = await getConfinedProjectViewFromMemberOrDefault(
      view,
      options
    );

    await output(renderView(confinedView), options);
  } else {
    const viewBatch = await Promise.all(
      options.from.map((m) =>
        getConfinedProjectViewFromMemberOrDefault(view, {
          ...options,
          from: [m],
        })
      )
    );

    await Promise.all(
      viewBatch.map((v, index) =>
        output(renderView(v), {
          ...options,
          output: interpolateOutputPath(options.output!, {
            memberName: options.from![index],
            index,
          }),
        })
      )
    );
  }
}
