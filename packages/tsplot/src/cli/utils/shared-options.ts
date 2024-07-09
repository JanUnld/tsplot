import { Command, Option, program } from 'commander';
import { consola } from 'consola';
import { outputFile } from 'fs-extra';
import { EOL } from 'os';
import { resolve } from 'path';
import * as process from 'process';
import * as ts from 'typescript';
import { MemberKind, ProjectView } from '../../lib/core';
import {
  excludeDecoratedBy,
  excludeMemberKindOf,
  excludeMemberName,
  excludeSourceFiles,
  includeDecoratedBy,
  includeMemberKindOf,
  includeMemberName,
  includeSourceFiles,
  MemberFilterFn,
  SourceFileFilterFn,
} from '../../lib/filter';
import {
  insertBeforeExtension,
  interpolate,
  INTERPOLATION_REGEX,
} from './interpolation';

/** @internal */
const MEMBER_TYPES: MemberKind[] = Object.values(MemberKind);

/** @internal */
const DEFAULT_DEPTH = 42;

/** @internal */
export interface SharedOptions {
  project: string;
  output?: string;
  debug?: boolean;
  silent?: boolean;

  /** The entry members to start resolving the dependency graph from */
  from?: string[];
  /** The depth limit of the dependency graph when using the {@link from} option */
  depth?: number;
  /** Reverses the dependency graph resolution when using the {@link from} option to get dependents */
  reverse?: boolean;
  /** Splits the output into multiple files when using the {@link from} option */
  split?: boolean;

  /** The file paths that shall be included in the dependency graph */
  include?: string[];
  /** The file paths that shall be excluded from the dependency graph */
  exclude?: string[];

  includeKind?: string[];
  excludeKind?: string[];

  includeDecoratedBy?: string[];
  excludeDecoratedBy?: string[];

  includeName?: string[];
  excludeName?: string[];

  // <editor-fold desc="Deprecated">
  /** @deprecated Use {@link includeKind} instead */
  includeTypes?: string[];
  /** @deprecated Use {@link excludeKind} instead */
  excludeTypes?: string[];

  /** @deprecated Use {@link includeName} instead */
  includeNames?: string[];
  /** @deprecated Use {@link excludeName} instead */
  excludeNames?: string[];
  // </editor-fold>
}

/** @internal */
export function setupSharedOptions(command: Command) {
  return (
    command
      .option(
        '-p, --project <path>',
        'path to the tsconfig.json file of the project',
        './tsconfig.json'
      )
      .option('-o, --output <path>', 'path to the output file')
      .option(
        '--from <members...>',
        'the entry member to start the dependency resolution from'
      )
      // todo: .option('--to <members...>', 'the exit members to stop resolving the dependency graph at')
      .option(
        '--depth <depth>',
        'the depth limit of the dependency resolution, when using the "from" option',
        (value) => parseInt(value, 10),
        DEFAULT_DEPTH
      )
      .option(
        '--reverse',
        'reverses the dependency graph resolution when using the "from" option to get dependents',
        false
      )
      .option(
        '--split',
        'splits the output into multiple files when using the "from" option'
      )
      .option(
        '--include <paths...>',
        'file paths that shall be included in the view'
      )
      .option(
        '--exclude <paths...>',
        'file paths that shall be included in the view'
      )
      .addOption(
        new Option(
          '--includeKind <kinds...>',
          'member kind that shall be included in the view'
        ).choices(Object.values(MemberKind))
      )
      .addOption(
        new Option(
          '--excludeKind <kinds...>',
          'member kind that shall be included in the view'
        ).choices(Object.values(MemberKind))
      )
      .option(
        '--includeDecoratedBy <decorators...>',
        'decorators that shall be included in the view'
      )
      .option(
        '--excludeDecoratedBy <decorators...>',
        'decorators that shall be included in the view'
      )
      .option(
        '--includeName <names...>',
        'member name pattern that shall be included in the view'
      )
      .option(
        '--excludeName <names...>',
        'member name pattern that shall be included in the view'
      )
      .option('-d, --debug', 'output extra debugging logs')
      .option('-s, --silent', 'output nothing but the result')
      // <editor-fold desc="Deprecated">
      .option(
        '--includeNames <names...>',
        'DEPRECATED! use --includeName instead'
      )
      .option(
        '--excludeNames <names...>',
        'DEPRECATED! use --excludeName instead'
      )
      .addOption(
        new Option(
          '--includeTypes <kinds...>',
          'DEPRECATED! use --includeKind instead'
        ).choices(Object.values(MemberKind))
      )
      .addOption(
        new Option(
          '--excludeTypes <kinds...>',
          'DEPRECATED! use --excludeKind instead'
        ).choices(Object.values(MemberKind))
      ) // </editor-fold>
  );
}

/**
 * @internal
 * @returns A function that restores the original log level and options of consola
 */
export function setupConsola(options: SharedOptions) {
  const { level: consolaLogLevel, options: consolaOptions } = consola;
  const restoreFn = () => {
    consola.options = consolaOptions;
    consola.level = consolaLogLevel;
  };

  consola.options.formatOptions.date = false;
  consola.options.formatOptions.compact = true;

  if (options.debug) consola.level = 4;
  if (options.silent) consola.level = -999;

  return restoreFn;
}

/** @internal */
export function getTsConfigPath(options = program.opts<SharedOptions>()) {
  return resolve(process.cwd(), options.project);
}

/** @internal */
export function getProjectView(options: SharedOptions): ProjectView {
  const isRelevantSourceFile = (f: ts.SourceFile) => {
    return !f.isDeclarationFile && !f.fileName.includes('node_modules');
  };

  const tsConfigPath = getTsConfigPath(options);
  const projectView = new ProjectView({
    tsConfigPath,
    sourceFileFilter: [
      isRelevantSourceFile,
      includeSourceFiles(...(options.include ?? [])),
      excludeSourceFiles(...(options.exclude ?? [])),
    ],
  });

  const isPartialView = [
    options.from,
    options.include,
    options.exclude,
    options.includeKind ?? options.includeTypes,
    options.excludeKind ?? options.excludeTypes,
    options.includeDecoratedBy,
    options.excludeDecoratedBy,
    options.includeName ?? options.includeNames,
    options.excludeName ?? options.excludeNames,
  ].some((arr) => arr?.length);

  if (isPartialView)
    consola.info("note: you're generating a partial view of the project");

  const isFromUnset = !options.from?.length;

  if (isFromUnset && options.reverse)
    consola.warn(
      'the "reverse" option is ignored because the "from" option is not set'
    );
  if (isFromUnset && options.depth !== DEFAULT_DEPTH)
    consola.warn(
      'the "depth" option is ignored because the "from" option is not set'
    );
  if (isFromUnset && options.split)
    consola.warn(
      'the "split" option is ignored because the "from" option is not set'
    );

  projectView.filter.add(
    includeMemberKindOf(
      ...((options.includeKind ?? options.includeTypes ?? []) as MemberKind[])
    ),
    excludeMemberKindOf(
      ...((options.excludeKind ?? options.excludeTypes ?? []) as MemberKind[])
    ),
    includeDecoratedBy(...(options.includeDecoratedBy ?? [])),
    excludeDecoratedBy(...(options.excludeDecoratedBy ?? [])),
    includeMemberName(...(options.includeName ?? options.includeNames ?? [])),
    excludeMemberName(...(options.excludeName ?? options.excludeNames ?? []))
  );

  return projectView;
}

/** @internal */
export async function getConfinedProjectViewFromMemberOrDefault(
  projectView: ProjectView,
  options: SharedOptions
): Promise<ProjectView> {
  const deferred = options?.from
    ?.map((f) => projectView.getMemberByName(f))
    .filter(Boolean)
    .map((m) => {
      return !options?.reverse
        ? projectView.getDependencyMembers(m!, options)
        : projectView.getDependentMembers(m!, options);
    });

  const members = deferred && (await Promise.all(deferred)).flat();
  if (!members) return projectView;

  // checks whether a given member is included in the confined view of the original
  // project view. If that's the case, then we want to include it in the new view
  const isConfinedMemberSourceFile: SourceFileFilterFn = (s) =>
    members
      .map((m) => projectView.getFileOfMember(m)?.source.fileName)
      .some((fileName) => s.fileName === fileName);
  const isConfinedMember: MemberFilterFn = (m) =>
    members.some((m2) => m2.name === m.name);

  return new ProjectView({
    program: projectView.getProgram(),
    sourceFileFilter: [isConfinedMemberSourceFile],
    memberFilter: [isConfinedMember, ...projectView.filter.decompose()],
  });
}

/**
 * @internal
 * @experimental
 */
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

/** @internal */
export async function output(data: string, options: SharedOptions) {
  if (options.output) {
    const outputPath = resolve(process.cwd(), options.output);

    consola.info(`writing output to "${outputPath}"...`);

    if (!data)
      consola.warn(
        'It appears that the output is empty. Please make sure that the project ' +
          'graph is not empty and that the diagram renderer is working as expected.'
      );

    await outputFile(outputPath, data, 'utf-8');
  } else {
    process.stdout.write(data + EOL);
  }
}
