/** Accumulates the sums of key occurrences. Shall be used with {@link Array.prototype.reduce} */
export const groupSums = (acc: Record<string, number>, key: string) => {
  acc[key] = (acc[key] ?? 0) + 1;
  return acc;
};

/** Accumulates an object from entries. Shall be used with {@link Array.prototype.reduce} */
export const entriesToObject = <T>(
  acc: T,
  [key, value]: [string, unknown]
): T => {
  return { ...acc, [key]: value };
};
