import { DecodeError, type Field } from '../base'

/**
 * Creates a string input field.
 *
 * The domain zero value is the empty string. Only actual strings and
 * `undefined` are accepted at the decoding boundary. `undefined` represents
 * missing input and resolves to the zero value.
 *
 * Other JavaScript values are rejected instead of being implicitly converted
 * with `String()`.
 *
 * @returns A field whose domain type is `string`.
 *
 * @example
 * ```ts
 * const name = string();
 *
 * name.zero(); // ""
 * name.decode("John"); // "John"
 * name.decode(undefined); // ""
 * ```
 */
export function string(): Field<string> {
  return {
    zero(): string {
      return ''
    },

    decode(input: unknown): string {
      if (input === undefined) {
        return ''
      }

      if (typeof input === 'string') {
        return input
      }

      throw new DecodeError('Unable to decode input as a string.')
    }
  }
}
