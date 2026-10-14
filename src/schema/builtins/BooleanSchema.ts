import { Schema } from '../core/Schema'
import { getSchemaConfig } from '../config/config'
import { interpolateMessage } from '../core/interpolate'
import type { Transformation, ValidationRule } from '../core/types'
import { boolean as inputBoolean } from '../../input'

/**
 * A schema for validating boolean domain values.
 *
 * BooleanSchema never decodes external representations. Its input is already
 * a boolean produced by the Model/Field layer.
 *
 * @typeParam M - Complete model type used by the eventual object Schema.
 */
export class BooleanSchema<M extends object = object> extends Schema<
  boolean,
  boolean,
  M
> {
  public constructor(
    rules: readonly ValidationRule<boolean>[] = [],
    transformations: readonly Transformation<boolean>[] = []
  ) {
    super({
      rules: [
        {
          code: 'boolean.invalid',
          validate: ({ value }) => {
            if (typeof value === 'boolean') {
              return null
            }

            return {
              code: 'boolean.invalid',
              context: {}
            }
          }
        },
        ...rules
      ],
      transformations,
      zeroPolicy: 'preserve',
      field: {
        zero: inputBoolean().zero,
        isZero: inputBoolean().isZero
      },
      messageResolver: failure => {
        if (failure.message !== undefined) {
          return interpolateMessage(failure.message, failure.context)
        }

        const [namespace, rule] = failure.code.split('.')

        if (namespace !== 'boolean') {
          return failure.code
        }

        const messages = getSchemaConfig().messages.boolean
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
   * Requires the boolean to be `true`.
   *
   * Fails when the value equals the zero value (`false`).
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public required(message?: string): BooleanSchema<M> {
    return this.withRule({
      code: 'boolean.required',
      validate: ({ value }) => {
        if (value !== false) {
          return null
        }

        return {
          code: 'boolean.required',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Adds a custom boolean validation rule.
   *
   * @param validator Function that receives the domain boolean and returns
   * `true` if the value is valid, `false` otherwise.
   * @param code Stable machine-readable validation code.
   * @param message Optional human-readable error message.
   * @returns A new schema with the custom rule added.
   *
   * @example
   * ```ts
   * const activeSchema = boolean().custom(
   *   value => value === true,
   *   'boolean.mustBeTrue'
   * );
   * ```
   */
  public custom(
    validator: (value: boolean) => boolean,
    code = 'boolean.custom',
    message?: string
  ): BooleanSchema<M> {
    return this.withRule({
      code,
      validate: ({ value }) => {
        if (validator(value)) {
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

  private withRule(rule: ValidationRule<boolean>): BooleanSchema<M> {
    return new BooleanSchema<M>([...this.getRules(), rule], this.getTransformations())
  }
}
