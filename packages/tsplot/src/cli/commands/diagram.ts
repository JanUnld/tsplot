import { Command, Option } from 'commander';
import { consola } from 'consola';
import {
  KnownTarget,
  Member,
  MermaidClassDiagram,
  PlantUMLClassDiagram,
} from '../../lib';
import {
  collectStats,
  getConfinedProjectViewFromMemberOrDefault,
  getProjectView,
  interpolateOutputPath,
  logDeprecationWarning,
  logSharedOptions,
  output,
  setupConsola,
  setupSharedOptions,
  SharedOptions,
} from '../utils';

/** @deprecated */
export interface DiagramOptions extends SharedOptions {
  edgeless?: boolean;
  renderer?: KnownTarget;
  fields?: boolean;
  methods?: boolean;
  // type: string; // Diagram type
}

/**
 * @deprecated
 * @internal
 */
export function setupDiagramCommand(program: Command) {
  return setupSharedOptions(
    program
      .command('diagram')
      .description('DEPRECATED! use "render <template>" command instead')
      .option(
        '-e, --edgeless',
        'indicates whether nodes without any edges shall be rendered or not',
        false
      )
      .option(
        '--fields',
        'indicates whether fields shall be included in the diagram or not',
        true
      )
      .option('--no-fields', "don't include fields in the diagram")
      .option(
        '--methods',
        'indicates whether methods shall be included in the diagram or not',
        true
      )
      .option('--no-methods', "don't include methods in the diagram")
      .addOption(
        new Option(
          '-r, --renderer <name>, --target <name>',
          'the type of the renderer to be used'
        )
          .choices(['plant-uml', 'mermaid'])
          .default('plant-uml')
      )
  ).action(diagram);
}

/**
 * @deprecated
 * @internal
 */
export function getDiagramRenderer(
  options: DiagramOptions
): (member: Member[], options: DiagramOptions) => string {
  switch (options.renderer) {
    case 'plant-uml':
      return (members: Member[]) =>
        new PlantUMLClassDiagram(members).render(options);
    case 'mermaid':
      return (members: Member[]) => {
        const diagram = new MermaidClassDiagram(members);
        const tooManyEdges = diagram.getEdges(options).length > 500;

        const output = new MermaidClassDiagram(members).render(options);
        const tooMuchText = output.length > 50000;

        if (tooManyEdges || tooMuchText) {
          consola.warn(
            'The generated output exceeds the default maximum text size or amount of edges. Make sure to configure ' +
              'Mermaid properly to allow rendering of larger diagrams (see https://mermaid.js.org/config/schema-docs/config.html) ' +
              'or consider refining the filter options to reduce the output diagram size (see --help)'
          );
        }

        return output;
      };
    default:
      throw new Error(`unknown renderer: ${options.renderer}`);
  }
}

/** @deprecated */
export async function diagram(options: DiagramOptions) {
  setupConsola(options);
  logSharedOptions(options);
  logDeprecationWarning('"diagram" command', {
    replaceWith: '"render <template>" command',
  });

  const projectView = getProjectView(options);
  const render = getDiagramRenderer(options);

  if (options.debug) {
    const s = await collectStats({ ...options, silent: true });

    consola.debug('stats:', JSON.stringify(s, null, 2));
  }

  if (!options.split || !options?.from) {
    const confinedView = await getConfinedProjectViewFromMemberOrDefault(
      projectView,
      options
    );

    await output(render(confinedView.members, options), options);
  } else {
    const memberBatch = await Promise.all(
      options.from.map((m) =>
        getConfinedProjectViewFromMemberOrDefault(projectView, {
          ...options,
          from: [m],
        })
      )
    );

    await Promise.all(
      memberBatch.map((confinedView, index) =>
        output(render(confinedView.members, options), {
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
