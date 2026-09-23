import { DecodeError, type Field } from '../base'

/**
 * Creates a file model field representing a File domain value.
 * Zero value: new File([], "")
 *
 * @returns A ModelField capable of safely decoding File objects.
 *
 * @example
 * const avatar = file();
 * const myFile = avatar.decode(formData.get("avatar"));
 */
export function file(): Field<File> {
  return {
    zero(): File {
      return new File([], '')
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
