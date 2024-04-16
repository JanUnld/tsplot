import { EOL } from 'os';

export function indent(
  str: string,
  options?: { level?: number; size?: number }
) {
  const { level = 1, size = 4 } = options ?? {};

  return str
    .split(/[\n\r]/gm)
    .map((s) => ' '.repeat(size).repeat(level) + s.trimStart())
    .join(EOL);
}
