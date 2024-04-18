import { ProjectFile } from '../../lib';

/** @internal */
export interface LinesOfCodeOptions {
  linesOfCode?: boolean;
  minLinesOfCode?: number;
}

/** @internal */
export function collectLinesBreaks(str: string): number {
  return str.split('\n').filter((l) => l.trim().length).length;
}

/** @internal */
export async function collectLinesOfCode(
  files: ProjectFile[],
  options: LinesOfCodeOptions
): Promise<Record<string, number>> {
  const { minLinesOfCode = 1000 } = options ?? {};

  return (
    await Promise.all(
      files.map(
        async (f): Promise<[string, number]> => [
          f.source.fileName,
          collectLinesBreaks(f.source.getText()),
        ]
      )
    )
  ).reduce((acc, [fileName, lines]) => {
    return lines > minLinesOfCode ? { ...acc, [fileName]: lines } : acc;
  }, {});
}
