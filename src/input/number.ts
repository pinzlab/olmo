import { DecodeError, type Field } from '../base'

/**
 * Numeric string syntax accepted by the number decoder.
 *
 * This intentionally validates the representation before converting it,
 * rather than using `Number()` as a generic coercion mechanism.
 */
const NUMERIC_STRING_PATTERN = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/

/**
 * Creates a number input field.
 *
 * The domain zero value is `0`. An empty string and missing input are valid
 * external representations of the zero value, matching the empty initial
 * representation commonly produced by HTML number inputs.
 *
 * Numeric strings are explicitly parsed after their syntax has been checked.
 * Non-finite numbers and unsupported external representations are rejected.
 *
 * @returns A field whose domain type is `number`.
 *
 * @example
 * ```ts
 * const age = number();
 *
 * age.zero(); // 0
 * age.decode("25"); // 25
 * age.decode("25.5"); // 25.5
 * age.decode(""); // 0
 * age.decode(undefined); // 0
 * ```
 */
export function number(): Field<number> {
  return {
    zero(): number {
      return 0
    },

    decode(input: unknown): number {
      if (input === undefined || input === '') {
        return 0
      }

      if (typeof input === 'number') {
        if (!Number.isFinite(input)) {
          throw new DecodeError('Unable to decode a non-finite number.')
        }

        return input
      }

      if (typeof input === 'string') {
        if (!NUMERIC_STRING_PATTERN.test(input)) {
          throw new DecodeError('Unable to decode input as a number.')
        }

        const parsedValue = Number(input)

        if (!Number.isFinite(parsedValue)) {
          throw new DecodeError('Unable to decode input as a finite number.')
        }

        return parsedValue
      }

      throw new DecodeError('Unable to decode input as a number.')
    }
  }
}
