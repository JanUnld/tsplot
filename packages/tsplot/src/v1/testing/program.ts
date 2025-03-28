import * as ts from 'typescript';
import { createSourceFile } from './source-file';

export interface TestingProgram extends ts.Program {
  setSourceFiles(sourceFiles: ts.SourceFile[]): void;
  resetSourceFiles(): void;

  createSourceFile(
    src: string,
    fileName?: string,
    target?: ts.ScriptTarget
  ): ts.SourceFile;
}

export function createTestingProgram(
  sourceFiles?: ts.SourceFile[],
  options?: Partial<ts.CreateProgramOptions>
) {
  const compilerOptions = options?.options ?? {};
  const host = createTestingCompilerHost(sourceFiles ?? [], compilerOptions);
  const program = ts.createProgram({
    rootNames: sourceFiles?.map((sf) => sf.fileName) ?? [],
    options: compilerOptions,
    host,
  }) as TestingProgram;

  program.getRootFileNames = () =>
    host.getSourceFiles().map((sf) => sf.fileName);
  program.getSourceFiles = () => host.getSourceFiles();

  program.setSourceFiles = (sourceFiles) => host.setSourceFiles(sourceFiles);
  program.resetSourceFiles = () => host.setSourceFiles([]);

  program.createSourceFile = (src, fileName, target) => {
    const sourceFile = createSourceFile(src, fileName, target);
    host.setSourceFiles([...host.getSourceFiles(), sourceFile]);
    return sourceFile;
  };

  return program;
}

export interface TestingCompilerHost extends ts.CompilerHost {
  setSourceFiles(sourceFiles: ts.SourceFile[]): void;
  getSourceFiles(): ts.SourceFile[];
}

export function createTestingCompilerHost(
  sourceFiles: ts.SourceFile[],
  options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
  }
): TestingCompilerHost {
  const host = ts.createCompilerHost(options) as TestingCompilerHost;

  let _sourceFiles = sourceFiles;
  host.getSourceFiles = () => _sourceFiles;
  host.setSourceFiles = (sourceFiles) => (_sourceFiles = sourceFiles);

  function getSourceFile(fileName: string) {
    return _sourceFiles.find((sf) => sf.fileName === fileName);
  }
  function fileExists(fileName: string): boolean {
    return getSourceFile(fileName) !== undefined;
  }
  function readFile(fileName: string): string | undefined {
    return getSourceFile(fileName)?.text;
  }

  host.getSourceFile = getSourceFile;
  host.fileExists = fileExists;
  host.readFile = readFile;

  return host;
}
