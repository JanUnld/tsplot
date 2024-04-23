import { includes } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

/** @internal */
export type AccessModifierFlags =
  | 'isExported'
  | 'isStatic'
  | 'isAbstract'
  | 'isPrivate'
  | 'isProtected'
  | 'isPublic'
  | 'isReadonly';

/** @internal */
export type AccessModifiers = Record<AccessModifierFlags, boolean>;

/** @internal */
export type ParameterModifierFlags = 'isOptional' | 'isRest';

/** @internal */
export type ModifierFlag = AccessModifierFlags | ParameterModifierFlags;

/** @internal */
const MODIFIER_TOKEN_BY_FLAG: Record<ModifierFlag, string> = {
  isExported: 'ExportKeyword',
  isStatic: 'StaticKeyword',
  isAbstract: 'AbstractKeyword',
  isPrivate: 'PrivateKeyword',
  isProtected: 'ProtectedKeyword',
  isPublic: 'PublicKeyword',
  isReadonly: 'ReadonlyKeyword',
  isOptional: 'QuestionToken',
  isRest: 'DotDotDotToken',
};

/** @internal */
export function getModifierFlagsFromNode<K extends ModifierFlag = ModifierFlag>(
  node: ts.Node,
  flags: K[]
): Record<K, boolean> {
  const modifiers = Object.entries(MODIFIER_TOKEN_BY_FLAG)
    // either include all keys or just the ones specified in the `only` options value
    .filter(([key]) => flags.includes(key as K))
    // construct an object with the desired key and whether the node includes the token
    .reduce(
      (mods, [key, token]) => ({
        ...mods,
        [key]: includes(node, token),
      }),
      {} as Record<K, boolean>
    );

  if ('isPublic' in modifiers) {
    const isPrivate =
      ('isPrivate' in modifiers && modifiers.isPrivate) ||
      includes(node, MODIFIER_TOKEN_BY_FLAG['isPrivate']);
    const isProtected =
      ('isProtected' in modifiers && modifiers.isProtected) ||
      includes(node, MODIFIER_TOKEN_BY_FLAG['isProtected']);

    // just make sure it's public if it's not private or protected, there might
    // not be an explicit public keyword in the source
    const isPublic = !!modifiers.isPublic || (!isPrivate && !isProtected);

    return { ...modifiers, isPublic };
  } else {
    return modifiers;
  }
}

/** @internal */
export const ACCESS_MODIFIER_FLAGS: AccessModifierFlags[] = [
  'isExported',
  'isStatic',
  'isAbstract',
  'isPrivate',
  'isProtected',
  'isPublic',
  'isReadonly',
];

/** @internal */
export const PARAMETER_MODIFIER_FLAGS: ParameterModifierFlags[] = [
  'isOptional',
  'isRest',
];
