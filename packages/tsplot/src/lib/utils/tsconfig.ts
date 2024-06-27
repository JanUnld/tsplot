import { parse } from 'path';
import * as ts from 'typescript';

/**
 * Resolves the fully parsed configuration for the given tsconfig file, also
 * including any extensions and references
 * @internal
 */
export function getParsedCommandLine(path: string) {
  const { dir } = parse(path);
  return ts.parseJsonSourceFileConfigFileContent(
    ts.readJsonConfigFile(path, ts.sys.readFile),
    ts.sys,
    dir
  );
}
