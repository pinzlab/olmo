import { FileSchema } from '../builtins/FileSchema'

/**
 * Creates a schema for validating domain File values.
 *
 * @returns A new FileSchema instance.
 *
 * @example
 * ```ts
 * const avatar = file().maxSize(1024 * 1024)
 * ```
 */
export function file(): FileSchema {
  return new FileSchema()
}
