/**
 * A validation error associated with a single model field.
 *
 * @typeParam T - Domain type of the failed field.
 */
export interface FieldError<T> {
  /**
   * Stable machine-readable validation code.
   */
  readonly code: string

  /**
   * Human-readable validation message.
   */
  readonly message: string

  /**
   * Original domain value that failed validation.
   */
  readonly value: T
}

/**
 * Field-keyed validation error collection.
 *
 * Each model field can expose at most one error in the initial
 * implementation.
 *
 * @typeParam M - Complete model type.
 *
 * @example
 * ```ts
 * interface User {
 *   readonly name: string;
 *   readonly age: number;
 * }
 *
 * const errors: ValidationError<User> = {
 *   name: {
 *     code: "string.min",
 *     message: "Must contain at least 3 characters",
 *     value: "",
 *   },
 * };
 *
 * console.log(errors.name?.message);
 * ```
 */
export type ValidationError<M> = {
  readonly [K in keyof M]?: FieldError<M[K]>
}
