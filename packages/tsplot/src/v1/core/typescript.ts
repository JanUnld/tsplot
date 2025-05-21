import { inject, InjectionToken, Provider } from 'injection-js';
import * as ts from 'typescript';

export const PROGRAM = new InjectionToken<ts.Program>('tsp:PROGRAM');

function isProgram(value: object): value is ts.Program {
  return 'getSourceFile' in value;
}

export function provideProgram(optionsOrProgram: ts.CreateProgramOptions | ts.Program): Provider {
  return {
    provide: PROGRAM,
    useValue: !isProgram(optionsOrProgram) ? ts.createProgram(optionsOrProgram) : optionsOrProgram,
  };
}

export const TYPE_CHECKER = new InjectionToken<ts.TypeChecker>('tsp:TYPE_CHECKER');

export function provideTypeChecker(): Provider {
  return {
    provide: TYPE_CHECKER,
    useFactory: () => inject(PROGRAM).getTypeChecker(),
  };
}

export type SourceFileResolver = (sourceFileOrName: ts.SourceFile | string) => ts.SourceFile;

export const SOURCE_FILE_RESOLVER = new InjectionToken<SourceFileResolver>(
  'tsp:SOURCE_FILE_RESOLVER'
);

export function provideSourceFileResolver(): Provider {
  return {
    provide: SOURCE_FILE_RESOLVER,
    useFactory: () => {
      const program = inject(PROGRAM);

      return (sourceFileOrName: ts.SourceFile | string) => {
        let sourceFile: ts.SourceFile | undefined;

        const isFileName = typeof sourceFileOrName === 'string';
        if (isFileName) {
          const fileName = sourceFileOrName;
          // try to use typescript built-in getter first. If we're dealing with a partial
          // source file path here, we need to use the program's source files to find the file.
          sourceFile =
            program.getSourceFile(sourceFileOrName) ??
            program.getSourceFiles().find((sf) => sf.fileName.endsWith(fileName));
        } else {
          // if we have a source file, we can use it directly
          sourceFile = sourceFileOrName;
        }

        return sourceFile;
      };
    },
  };
}
