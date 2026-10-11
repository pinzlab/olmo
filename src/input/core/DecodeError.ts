/**
 * Indicates that an external value cannot be represented by an input field's
 * domain type.
 *
 * Decoding errors describe failures at the external-data boundary. They are
 * intentionally separate from validation errors, which belong to a future
 * validation module.
 *
 * @example
 * ```ts
 * const age = number();
 *
 * try {
 *   age.decode("not-a-number");
 * } catch (error: unknown) {
 *   if (error instanceof DecodeError) {
 *     console.error(error.message);
 *   }
 * }
 * ```
 */
export class DecodeError extends Error {
  /**
   * Creates a decoding error.
   *
   * @param message Human-readable description of the decoding failure.
   */
  constructor(message: string) {
    super(message)
    this.name = 'DecodeError'
  }
}
