import { type InputField } from '../../base'
import { DecodeError } from '../core/DecodeError'

/**
 * Creates a file input field whose domain type is the browser `File` object.
 *
 * The domain zero value is an empty `File` with no name, no content, and no
 * MIME type (`new File([], "")`). A value is considered zero when its `size`,
 * `name`, and `type` are all empty.
 *
 * Only actual `File` instances are accepted at the decoding boundary.
 * `null`, `undefined`, and the empty string resolve to the zero value.
 * Any other input throws a `DecodeError`.
 *
 * In environments where the `File` API is unavailable, decoding missing input
 * also throws a `DecodeError`.
 *
 * @returns A field whose domain type is `File`.
 * @throws {DecodeError} If the input cannot be decoded into a `File`.
 *
 * @example
 * ```ts
 * const avatar = file();
 *
 * avatar.zero(); // new File([], "")
 * avatar.decode(someFile); // someFile
 * avatar.decode(undefined); // new File([], "")
 * ```
 */
export function file(): InputField<File> {
  return {
    zero(): File {
      return new File([], '')
    },
    isZero(value: File): boolean {
      return value.size === 0 && value.name === '' && value.type === ''
    },
    decode(input: unknown): File {
      if (typeof File !== 'undefined' && input instanceof File) {
        return input
      }
      if (input === null || input === undefined || input === '') {
        if (typeof File !== 'undefined') {
          return new File([], '')
        }
        throw new DecodeError(
          'Environment does not support File API and no value provided'
        )
      }
      throw new DecodeError('Cannot decode input into File')
    }
  }
}
