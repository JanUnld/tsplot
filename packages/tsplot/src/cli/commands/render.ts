import { Command, Option } from 'commander';
import {
  BuiltInTemplate,
  BuiltInTemplateTarget,
  ProjectView,
  render as _render,
} from '../../lib';
import {
  getConfinedProjectViewFromMemberOrDefault,
  getProjectView,
  interpolateOutputPath,
  logSharedOptions,
  output,
  setupLogLevel,
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
  setupLogLevel(options);
  logSharedOptions(options);

  const view = getProjectView(options);
  const renderView = (projectView: ProjectView) =>
    _render(template, {
      target: options.target,
      baseDir: options.baseDir,
      projectView,
    });

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
