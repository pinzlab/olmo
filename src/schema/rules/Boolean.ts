import { BooleanSchema } from '../builtins/BooleanSchema'

/**
 * Creates a boolean schema.
 *
 * The schema validates already-decoded boolean domain values.
 *
 * @example
 * ```ts
 * const active = boolean();
 *
 * const UserSchema = defineSchema({
 *   active,
 * });
 * ```
 */
export function boolean(): BooleanSchema {
  return new BooleanSchema()
}
