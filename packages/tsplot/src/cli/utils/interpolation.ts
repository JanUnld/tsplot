/** @internal */
export const INTERPOLATION_REGEX = /\${([^}]+)}/g;

/** @internal */
export function interpolate(str: string, values: Record<string, unknown>) {
  return str.replace(INTERPOLATION_REGEX, (_, match) => {
    return values[match] ?? match;
  });
}

/** @internal */
export function insertBeforeExtension(pathStr: string, str: string) {
  return pathStr.replace(/(\.\w+$)/, `.${str}$1`);
}
