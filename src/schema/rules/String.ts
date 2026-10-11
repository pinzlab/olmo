import { StringSchema } from '../builtins/StringSchema'

/**
 * Creates a string schema.
 *
 * @example
 * ```ts
 * const nameSchema = string()
 *   .trim()
 *   .min(1)
 *   .max(100);
 * ```
 */
export function string(): StringSchema {
  return new StringSchema()
}
