import { type InputField } from '../../base'
import { DecodeError } from '../core/DecodeError'

const TRUE_VALUES = new Set(['on', 'true', '1'])
const FALSE_VALUES = new Set(['off', 'false', '0'])

/**
 * Creates a boolean input field.
 *
 * Boolean decoding uses explicit HTML/form representations rather than
 * JavaScript truthiness. In particular, `"false"` is decoded as `false`
 * rather than being treated as a truthy string.
 *
 * Missing input resolves to the domain zero value, `false`.
 *
 * @returns A field whose domain type is `boolean`.
 *
 * @example
 * ```ts
 * const active = boolean();
 *
 * active.zero(); // false
 * active.decode("on"); // true
 * active.decode("false"); // false
 * active.decode(undefined); // false
 * ```
 */
export function boolean(): InputField<boolean> {
  return {
    zero(): boolean {
      return false
    },

    isZero(value: boolean): boolean {
      return value === false
    },

    decode(input: unknown): boolean {
      if (input === undefined || input === null) {
        return false
      }

      if (typeof input === 'boolean') {
        return input
      }

      if (typeof input === 'string') {
        if (TRUE_VALUES.has(input)) {
          return true
        }

        if (FALSE_VALUES.has(input)) {
          return false
        }
      }

      throw new DecodeError('Unable to decode input as a boolean.')
    }
  }
}
