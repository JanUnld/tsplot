import { PathsLike } from '../../lib';
import { entriesToObject } from './accumulators';

export type KeyValuePair<T = string> = [string, T];

/**
 * Transforms a string in the format `key:value` into a {@link KeyValuePair}
 * @internal
 */
export function parseKeyValuePair(str: string) {
  return str.split(':') as KeyValuePair;
}

/**
 * Transforms a string in the format `key:value,value` into a {@link KeyValuePair}
 * @internal
 */
export function parseKeyValueListPair(str: string) {
  const [key, value] = parseKeyValuePair(str);
  return [key, value.split(/[+,]/)] as KeyValuePair<string[]>;
}

export function getPathsFromKeyValueListPairs(
  pairs: KeyValuePair<string[]>[]
): PathsLike {
  return pairs.reduce<PathsLike>(entriesToObject, {});
}
