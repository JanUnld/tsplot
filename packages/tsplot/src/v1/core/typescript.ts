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
