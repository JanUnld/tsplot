import { parse } from 'path';
import * as ts from 'typescript';

/**
 * Resolves the fully parsed configuration for the given tsconfig file, als
 * including any extensions and references
 * @internal
 */
export function getParsedTsConfig(path: string) {
  const { dir } = parse(path);
  return ts.parseJsonSourceFileConfigFileContent(
    ts.readJsonConfigFile(path, ts.sys.readFile),
    ts.sys,
    dir
  );
}
