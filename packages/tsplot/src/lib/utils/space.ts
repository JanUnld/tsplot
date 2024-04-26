/**
 * Join strings with space and normalize spaces
 * @param contents Strings to join
 * @param options Options
 * @param options.separator Join separator. Default is `' '`.
 * @returns Joined string with normalized spaces.
 * @internal
 */
export function joinAndNormalizeSpace(
  contents: string[],
  options?: {
    separator?: string;
  }
): string {
  return contents
    .join(options?.separator ?? ' ')
    .replace(/\s+/, ' ')
    .trim();
}
