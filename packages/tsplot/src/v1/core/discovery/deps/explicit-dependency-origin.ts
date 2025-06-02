export enum ExplicitDependencyOrigin {
  /**
   * The dependency is declared as part of a heritage clause.
   *
   * @example ```ts
   * class Foo extends Bar implements Baz {}
   * //        ^^^^^^^^^^^^^^^^^^^^^^^^^^
   * ```
   */
  Heritage = 'heritage',
  /**
   * The dependency is declared as part of a field type.
   *
   * @example ```ts
   * class Foo {
   *   readonly bar: Bar;
   *   //       ^^^^^^^^
   * }
   * ```
   */
  Association = 'association',
  /**
   * The dependency is declared as part of an instantiation.
   *
   * @example ```ts
   * class Foo {
   *   constructor() {
   *     const bar = new Bar();
   *     //          ^^^^^^^^^
   *   }
   * }
   * ```
   */
  Instantiation = 'instantiation',
  /**
   * The dependency is declared as part of a delegating function call.
   *
   * @example ```ts
   * class Foo {
   *   constructor() {
   *     Bar.baz();
   *     // ^^^^^^
   *   }
   * }
   * ```
   */
  Delegation = 'delegation',
  /**
   * The dependency is declared as part of a decorator annotation.
   *
   * @example ```ts
   * @Bar()
   * // ^^^
   * class Foo {
   *   @Bar()
   *   // ^^^
   *   readonly foo: unknown;
   *
   *   bar(@Bar() baz: unknown) {}
   *   //  ^^^^^^
   * }
   * ```
   */
  Decorator = 'decorator',
  /**
   * The dependency is declared as part of a parameter.
   *
   * @example ```ts
   * function foo(bar: Bar) {}
   * //           ^^^^^^^^
   * ```
   */
  Parameter = 'parameter',
  /**
   * The dependency is declared as part of a return type.
   *
   * @example ```ts
   * function foo(): Bar {}
   * //              ^^^
   * ```
   */
  Return = 'return',
}
