import * as ts from 'typescript';
import { MemberFilterFn, SourceFileFilterFn } from '../filter';
import { getParsedCommandLine } from '../utils';

/** @internal */
interface ProjectViewOptionsBase {
  sourceFileFilter?: SourceFileFilterFn[];
  memberFilter?: MemberFilterFn[];
}

export interface ProjectViewOptionsWithFiles extends ProjectViewOptionsBase {
  fileNames: string[];
  compilerOptions: ts.CompilerOptions;
}

export interface ProjectViewOptionsWithTsConfigPath
  extends ProjectViewOptionsBase {
  tsConfigPath: string;
}

export interface ProjectViewOptionsWithProgram extends ProjectViewOptionsBase {
  program: ts.Program;
}

export type ProjectViewOptions =
  | ProjectViewOptionsWithFiles
  | ProjectViewOptionsWithTsConfigPath
  | ProjectViewOptionsWithProgram;

/** @internal */
export function getProgramFromProjectViewOptions(
  options: ProjectViewOptions
): ts.Program {
  let rootNames: string[];
  let compilerOptions: ts.CompilerOptions;
  let oldProgram: ts.Program | undefined;

  if ('tsConfigPath' in options) {
    const parsedCommandLine = getParsedCommandLine(options.tsConfigPath);

    rootNames = parsedCommandLine.fileNames;
    compilerOptions = parsedCommandLine.options;
  } else if ('program' in options) {
    oldProgram = options.program;

    rootNames = oldProgram.getRootFileNames() as string[];
    compilerOptions = oldProgram.getCompilerOptions();
  } else {
    rootNames = options.fileNames;
    compilerOptions = options.compilerOptions;
  }

  return ts.createProgram({
    rootNames,
    options: compilerOptions,
    oldProgram,
  });
}
