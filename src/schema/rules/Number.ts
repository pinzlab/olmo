import { NumberSchema } from '../builtins/NumberSchema'

/**
 * Creates a number schema.
 *
 * @example
 * ```ts
 * const ageSchema = number()
 *   .integer()
 *   .min(18)
 *   .max(120);
 * ```
 */
export function number(): NumberSchema {
  return new NumberSchema()
}
