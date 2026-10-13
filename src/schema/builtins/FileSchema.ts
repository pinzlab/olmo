import { Schema } from '../core/Schema'
import { getSchemaConfig } from '../config/config'
import type { Transformation, ValidationRule } from '../core/types'
import { interpolateMessage } from '../core/interpolate'

/**
 * A schema for validating domain File values.
 *
 * FileSchema never decodes external values. Its input is already a File
 * produced by the Model/Field layer.
 *
 * @typeParam M - Complete model type used by the eventual object Schema.
 *
 * @example
 * ```ts
 * const avatar = file()
 *   .maxSize(1024 * 1024)
 *   .mimeType('image/png', 'image/jpeg');
 * ```
 */
export class FileSchema<M extends object = object> extends Schema<File, File, M> {
  public constructor(
    rules: readonly ValidationRule<File>[] = [],
    transformations: readonly Transformation<File>[] = []
  ) {
    super({
      rules: [
        {
          code: 'file.invalid',
          validate: ({ value }) => {
            if (typeof File !== 'undefined' && value instanceof File) {
              return null
            }
            return {
              code: 'file.invalid',
              context: {}
            }
          }
        },
        ...rules
      ],
      transformations,
      zeroPolicy: 'preserve',

      field: {
        zero: () => (typeof File !== 'undefined' ? new File([], '') : ({} as File)),
        isZero: value => value.size === 0 && value.name === '' && value.type === ''
      },

      messageResolver: failure => {
        if (failure.message !== undefined) {
          return interpolateMessage(failure.message, failure.context)
        }

        const [namespace, rule] = failure.code.split('.')

        if (namespace !== 'file') {
          return failure.code
        }

        const messages = getSchemaConfig().messages.file
        const template = messages[rule as keyof typeof messages]

        if (template === undefined) {
          return failure.code
        }

        return interpolateMessage(template, failure.context)
      },

      output: value => value
    })
  }

  /**
   * Requires the file size to be at least `minimum` bytes.
   */
  public minSize(minimum: number, message?: string): FileSchema<M> {
    return this.withRule({
      code: 'file.minSize',
      validate: ({ value }) => {
        if (value.size >= minimum) {
          return null
        }

        return {
          code: 'file.minSize',
          context: { min: minimum },
          message
        }
      }
    })
  }

  /**
   * Requires the file size to be at most `maximum` bytes.
   */
  public maxSize(maximum: number, message?: string): FileSchema<M> {
    return this.withRule({
      code: 'file.maxSize',
      validate: ({ value }) => {
        if (value.size <= maximum) {
          return null
        }

        return {
          code: 'file.maxSize',
          context: { max: maximum },
          message
        }
      }
    })
  }

  /**
   * Requires the file to match one of the allowed MIME types.
   */
  public mimeType(...allowedMimeTypes: string[]): FileSchema<M> {
    return this.withRule({
      code: 'file.mimeType',
      validate: ({ value }) => {
        if (allowedMimeTypes.includes(value.type)) {
          return null
        }

        return {
          code: 'file.mimeType',
          context: {
            mimeType: allowedMimeTypes.join(', ')
          }
        }
      }
    })
  }

  /**
   * Adds a custom file validation rule.
   *
   * @param validator Function receiving the domain File. It can be async.
   * @param code Stable validation code.
   */
  public custom(
    validator: (value: File) => boolean | Promise<boolean>,
    code = 'file.custom',
    message?: string
  ): FileSchema<M> {
    return this.withRule({
      code,
      validate: ({ value }) => {
        const result = validator(value)

        if (result instanceof Promise) {
          return result.then(isValid => (isValid ? null : { code, context: {}, message }))
        }

        if (result) {
          return null
        }

        return {
          code,
          context: {},
          message
        }
      }
    })
  }

  private withRule(rule: ValidationRule<File>): FileSchema<M> {
    // The constructor prepends `file.invalid` to `rules`, so it must be
    // filtered out before passing the current rules back to the constructor
    // to prevent duplicate base-rule entries.
    const userRules = this.getRules().filter(r => r.code !== 'file.invalid')
    return new FileSchema<M>([...userRules, rule], this.getTransformations())
  }
}
