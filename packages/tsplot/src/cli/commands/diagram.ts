import { Option, program } from 'commander';
import { Member, MermaidClassDiagram, PlantUMLClassDiagram } from '../../lib';
import {
  insertBeforeExtension,
  interpolate,
  INTERPOLATION_REGEX,
} from '../../lib/utils/interpolation';
import {
  getProjectMembersAndStartFrom,
  getProjectView,
  logSharedOptions,
  output,
  setupLogLevel,
  setupSharedOptions,
  SharedOptions,
} from '../utils';

export type BuiltInRenderer = 'plant-uml' | 'mermaid';

export interface DiagramOptions extends SharedOptions {
  edgeless?: boolean;
  renderer?: BuiltInRenderer;
  fields?: boolean;
  methods?: boolean;
  // type: string; // Diagram type
}

export function setupDiagramCommand() {
  setupSharedOptions(
    program
      .command('diagram')
      .description(
        'generate different types of diagrams for a typescript project based on its dependency graph'
      )
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
          '-r, --renderer <name>',
          'the type of the renderer to be used'
        )
          .choices(['plant-uml', 'mermaid'])
          .default('plant-uml')
      )
    // todo: add support for different renderers and diagram types
    //  .option('-t, --type <type>', 'type of the output diagram (depends on the renderer)', 'class')
  ).action(diagram);
}

export function getDiagramRenderer(
  options: DiagramOptions
): (member: Member[], options: DiagramOptions) => string {
  switch (options.renderer) {
    case 'plant-uml':
      return (members: Member[]) =>
        new PlantUMLClassDiagram(members).render(options);
    case 'mermaid':
      return (members: Member[]) =>
        new MermaidClassDiagram(members).render(options);
    default:
      throw new Error(`unknown renderer: ${options.renderer}`);
  }
}

export function interpolateOutputPath(
  output: string,
  values: Record<string, unknown>
) {
  const { memberName } = values;

  if (!memberName) return output;

  return INTERPOLATION_REGEX.test(output)
    ? interpolate(output, values)
    : insertBeforeExtension(output, memberName.toString());
}

export async function diagram(options: DiagramOptions) {
  setupLogLevel(options);
  logSharedOptions(options);

  const projectView = getProjectView(options);
  const render = getDiagramRenderer(options);

  if (!options.split || !options?.from) {
    const members = await getProjectMembersAndStartFrom(projectView, options);

    await output(render(members, options), options);
  } else {
    const memberBatch = await Promise.all(
      options.from.map((m) =>
        getProjectMembersAndStartFrom(projectView, {
          ...options,
          from: [m],
        })
      )
    );

    await Promise.all(
      memberBatch.map((m, index) =>
        output(render(m, options), {
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
