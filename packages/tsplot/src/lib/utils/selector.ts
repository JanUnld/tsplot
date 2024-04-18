export type QueryModificationFn = (str: string) => string;

/** @internal */
export const modifyQuery = (
  selector: string,
  modifications: QueryModificationFn[]
) => modifications.reduce((s, f) => f(s), selector);

/** @internal */
export const appendIdentifierQuery = (selector: string) =>
  `${selector} > Identifier`;

/** @internal */
export const removeIdentifierQuery = (selector: string) =>
  selector.replace(/\s*>\s*Identifier\s*/, '');

/** @internal */
export const prependDeclQuery = (selector: string) =>
  `:declaration > ${selector}`;

/** @internal */
export const removeDeclQuery = (selector: string) =>
  selector.replace(/:declaration\s*>\s*/, '');
