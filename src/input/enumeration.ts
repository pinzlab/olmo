import { DecodeError, type Field } from '../base'

/**
 * Creates an enumeration field with a predefined set of allowed values.
 *
 * The zero value is always the empty string (`""`), independently of the
 * values provided to the enumeration.
 *
 * The empty string is treated as the field's empty/initial representation and
 * does not need to be explicitly included in `values`.
 *
 * @param values The readonly array of permitted string or numeric values.
 * @returns A Field capable of safely decoding the enumeration.
 *
 * @example
 * ```ts
 * const status = enumeration("pending", "active", "deleted");
 *
 * status.zero(); // ""
 * status.decode(""); // ""
 * status.decode("active"); // "active"
 * ```
 */
export function enumeration<T extends string | number>(
  ...values: readonly T[]
): Field<T> {
  if (values.length === 0) {
    throw new Error('Enumeration must have at least one permitted value')
  }

  return {
    zero(): T {
      return '' as T
    },

    decode(input: unknown): T {
      if (input === null || input === undefined || input === '') {
        return '' as T
      }

      let testValue: unknown = input

      if (typeof values[0] === 'number' && typeof input === 'string') {
        const parsed = Number(input)

        if (!Number.isNaN(parsed)) {
          testValue = parsed
        }
      }

      if (values.includes(testValue as T)) {
        return testValue as T
      }

      throw new DecodeError('Cannot decode input into any permitted enumeration value')
    }
  }
}
