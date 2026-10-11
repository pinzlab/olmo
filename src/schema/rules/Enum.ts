import { EnumerationSchema } from '../builtins/EnumSchema'
import { Enum } from '../../base'

/**
 * Creates a schema for validating values belonging to an enumeration.
 *
 * @param enumObject Enumeration object containing the permitted values.
 * @returns A schema that validates values from the enumeration.
 *
 * @example
 * ```ts
 * enum Role {
 *   Admin = 'admin',
 *   User = 'user'
 * }
 *
 * const roleSchema = enumeration(Role)
 *   .required()
 * ```
 */
export function enumeration<E extends Enum>(enumObject: E): EnumerationSchema<E> {
  return new EnumerationSchema<E>(enumObject)
}
