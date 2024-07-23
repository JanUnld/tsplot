import { Command, Option } from 'commander';
import { consola } from 'consola';
import {
  KnownTarget,
  KnownTemplate,
  PathsLike,
  ProjectGraph,
  ProjectView,
  render as _render,
} from '../../lib';
import { getParsedCommandLine } from '../../lib/utils';
import {
  collectStats,
  getConfinedProjectViewFromMemberOrDefault,
  getPathsFromKeyValueListPairs,
  getProjectView,
  interpolateOutputPath,
  logSharedOptions,
  logSizeWarningIfExceeding,
  output,
  parseKeyValueListPair,
  setupConsola,
  setupSharedOptions,
  SharedOptions,
} from '../utils';

const GROUP_BY_TS_PATHS = 'tsPaths';

export interface RenderOptions extends SharedOptions {
  target: KnownTarget | string;
  baseDir?: string;
  groupBy?: string[];
  // todo: fields; // filter
  // todo: methods; // filter
}

/** @internal */
export function setupRenderCommand(program: Command) {
  return setupSharedOptions(
    program
      .command('render')
      .description(
        'renders typescript AST and type checker information to a desired target ' +
          'format using built-in and custom templates (e.g. plant-uml, mermaid)'
      )
      .argument(
        '<template>',
        'the template name that shall be rendered as output (e.g. class-diagram)'
      )
      .option(
        '--baseDir <path>',
        'custom base directory to use for template file resolution'
      )
      .option(
        '--groupBy <namespace:glob...>',
        'grouping specification to use for namespacing members. Can be a list of ' +
          'custom specifiers in the format `namespace:glob` or `namespace:glob,glob` or. ' +
          "the keyword `tsPaths` to use the typescript paths definitions. Won't group by default"
      )
      .addOption(
        new Option(
          '-t, --target <name>',
          'the rendering output target. Can be a custom one or one of the built-in ' +
            `targets (${Object.values(KnownTarget).join(', ')})`
        ).default(KnownTarget.PlantUML)
      )
  ).action(render);
}

function getPaths(options: RenderOptions) {
  let { groupBy } = options;
  const useTsPaths = groupBy?.includes(GROUP_BY_TS_PATHS);

  if (useTsPaths) {
    groupBy = groupBy?.filter((str) => str !== GROUP_BY_TS_PATHS);
  }

  let paths: PathsLike = groupBy?.length
    ? getPathsFromKeyValueListPairs(groupBy.map(parseKeyValueListPair))
    : {};

  if (useTsPaths) {
    paths = {
      ...getParsedCommandLine(options.project).options.paths,
      ...paths,
    };
  }

  return paths;
}

export async function render(
  template: KnownTemplate | string,
  options: RenderOptions
) {
  setupConsola(options);
  logSharedOptions(options);

  const view = getProjectView({
    ...options,
    paths: getPaths(options),
  });

  const renderView = (projectView: ProjectView) => {
    const output = _render(template, {
      baseDir: options.baseDir,
      context: { projectView },
      target: options.target,
    });

    if (options.target === KnownTarget.Mermaid) {
      logSizeWarningIfExceeding({
        output,
        edges: ProjectGraph.fromView(projectView, { keepFilter: true }).edges
          .length,
        maxOutputSize: 50000,
        maxEdges: 500,
        description:
          'These are defaults set by Mermaid. To allow rendering of larger diagrams ' +
          'you can adjust the configuration (see https://mermaid.js.org/config/schema-docs/config.html)',
      });
    }

    return output;
  };

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
