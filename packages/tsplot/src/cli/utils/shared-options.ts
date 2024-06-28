import { Command, Option, program } from 'commander';
import { consola } from 'consola';
import { outputFile } from 'fs-extra';
import { EOL } from 'os';
import { resolve } from 'path';
import * as process from 'process';
import * as ts from 'typescript';
import { Member, MemberKind, ProjectView } from '../../lib/core';
import {
  excludeDecoratedBy,
  excludeMemberKindOf,
  excludeMemberNamespace,
  excludeSourceFiles,
  includeDecoratedBy,
  includeMemberKindOf,
  includeMemberNamespace,
  includeSourceFiles,
} from '../../lib/filter';

/** @internal */
const MEMBER_TYPES: MemberKind[] = Object.values(MemberKind);

/** @internal */
const DEFAULT_DEPTH = 9999;

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

  includeTypes?: string[];
  excludeTypes?: string[];

  includeDecoratedBy?: string[];
  excludeDecoratedBy?: string[];

  includeNames?: string[];
  excludeNames?: string[];
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
        'the entry members to start resolving the dependency graph from'
      )
      // todo: .option('--to <members...>', 'the exit members to stop resolving the dependency graph at')
      .option(
        '--depth <depth>',
        'the depth limit of the dependency graph when using the "from" option',
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
        'file paths that shall be included in the dependency graph'
      )
      .option(
        '--exclude <paths...>',
        'file paths that shall be excluded in the dependency graph'
      )
      .addOption(
        new Option(
          '--includeTypes <types...>',
          'types that shall be included in the dependency graph'
        ).choices(MEMBER_TYPES)
      )
      .addOption(
        new Option(
          '--excludeTypes <types...>',
          'types that shall be excluded in the dependency graph'
        ).choices(MEMBER_TYPES)
      )
      .option(
        '--includeDecoratedBy <decorators...>',
        'decorators that shall be included in the dependency graph'
      )
      .option(
        '--excludeDecoratedBy <decorators...>',
        'decorators that shall be excluded in the dependency graph'
      )
      .option(
        '--includeNames <names...>',
        'names that shall be included in the dependency graph'
      )
      .option(
        '--excludeNames <names...>',
        'names that shall be excluded in the dependency graph'
      )
      .option('-d, --debug', 'output extra debugging logs')
      .option('-s, --silent', 'output nothing but the result')
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
export function logSharedOptions(options: SharedOptions) {
  consola.debug('options:', JSON.stringify(options, null, 2));
  consola.info(`analyzing project at "${getTsConfigPath(options)}"...`);
}

/** @internal */
export function getProjectView(options: SharedOptions): ProjectView {
  const isRelevantSourceFile = (f: ts.SourceFile) => {
    return !f.isDeclarationFile && !f.fileName.includes('node_modules');
  };

  const tsConfigPath = getTsConfigPath(options);
  const projectView = new ProjectView({
    tsConfigPath,
    filters: [
      isRelevantSourceFile,
      includeSourceFiles(...(options.include ?? [])),
      excludeSourceFiles(...(options.exclude ?? [])),
    ],
  });

  const isPartialView = [
    options.from,
    options.include,
    options.exclude,
    options.includeTypes,
    options.excludeTypes,
    options.includeDecoratedBy,
    options.excludeDecoratedBy,
    options.includeNames,
    options.excludeNames,
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
    includeMemberKindOf(...((options.includeTypes ?? []) as MemberKind[])),
    excludeMemberKindOf(...((options.excludeTypes ?? []) as MemberKind[])),
    includeDecoratedBy(...(options.includeDecoratedBy ?? [])),
    excludeDecoratedBy(...(options.excludeDecoratedBy ?? [])),
    includeMemberNamespace(...(options.includeNames ?? [])),
    excludeMemberNamespace(...(options.excludeNames ?? []))
  );

  return projectView;
}

/** @internal */
export async function getProjectMembersAndStartFrom(
  projectView: ProjectView,
  options: SharedOptions
): Promise<Member[]> {
  const deferred = options?.from
    ?.map((f) => projectView.getMemberByName(f))
    .filter(Boolean)
    .map((m) => {
      return !options?.reverse
        ? projectView.getDependencyMembers(m!, options)
        : projectView.getDependentMembers(m!, options);
    });

  return deferred ? (await Promise.all(deferred)).flat() : projectView.members;
}

/** @internal */
export async function output(data: string, options: SharedOptions) {
  if (options.output) {
    const outputPath = resolve(process.cwd(), options.output);

    consola.info(`writing output to "${outputPath}"...`);

    if (!data)
      consola.warn(
        'It appears that the output is empty. Please make sure that the project graph is not empty and that the diagram renderer is working as expected.'
      );

    await outputFile(outputPath, data, 'utf-8');
  } else {
    process.stdout.write(data + EOL);
  }
}
