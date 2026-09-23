/**
 * Represents an input field with a concrete domain type.
 *
 * `T` is the value consumed by the rest of the application. External
 * representations are accepted only through `decode()`.
 *
 * @typeParam T The field's domain value type.
 *
 * @example
 * ```ts
 * const age: Field<number> = number();
 *
 * const initialAge: number = age.zero();
 * const decodedAge: number = age.decode("25");
 * ```
 */
export interface Field<T> {
  /**
   * Returns the domain zero value for this field.
   *
   * @returns A value of the field's domain type.
   */
  zero(): T

  /**
   * Decodes an external representation into the field's domain type.
   *
   * @param input External data such as a form or FormData value.
   * @returns The decoded domain value.
   * @throws {DecodeError} If the external representation is unsupported
   * or cannot be represented by the field's domain type.
   */
  decode(input: unknown): T
}
