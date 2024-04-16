import { minimatch } from 'minimatch';

export function matchRegExpOr(
  str: string,
  options: {
    pattern: RegExp | unknown;
    or: (str: string) => boolean;
  }
) {
  const { pattern, or } = options;
  return pattern instanceof RegExp ? pattern.test(str) : or(str);
}

export function matchRegExpOrStr(pattern: RegExp | string, str: string) {
  return matchRegExpOr(str, {
    pattern,
    or: (s) => s.includes(pattern as string),
  });
}

export function matchRegExpOrGlob(pattern: RegExp | string, path: string) {
  return matchRegExpOr(path, {
    pattern,
    or: (str) => minimatch(str, pattern as string, { matchBase: true }),
  });
}
