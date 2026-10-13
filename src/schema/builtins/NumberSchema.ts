import { Schema } from '../core/Schema'
import { getSchemaConfig } from '../config/config'
import { interpolateMessage } from '../core/interpolate'
import type { Transformation, ValidationRule } from '../core/types'

/**
 * A schema for validating number domain values.
 *
 * NumberSchema does not decode strings or other external representations.
 *
 * @typeParam M - Complete model type used by the eventual object Schema.
 */
export class NumberSchema<M extends object = object> extends Schema<number, number, M> {
  public constructor(
    rules: readonly ValidationRule<number>[] = [],
    transformations: readonly Transformation<number>[] = []
  ) {
    super({
      rules: [
        {
          code: 'number.invalid',
          validate: ({ value }) => {
            if (typeof value === 'number') {
              return null
            }

            return {
              code: 'number.invalid',
              context: {}
            }
          }
        },
        ...rules
      ],
      transformations,
      zeroPolicy: 'preserve',
      field: {
        zero: () => 0,
        isZero: value => value === 0
      },
      messageResolver: failure => {
        if (failure.message !== undefined) {
          return interpolateMessage(failure.message, failure.context)
        }

        const [namespace, rule] = failure.code.split('.')

        if (namespace !== 'number') {
          return failure.code
        }

        const messages = getSchemaConfig().messages.number
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
   * Requires the number to be greater than or equal to `minimum`.
   *
   * @param minimum The inclusive lower bound.
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public min(minimum: number, message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.min',
      validate: ({ value }) => {
        if (value >= minimum) {
          return null
        }

        return {
          code: 'number.min',
          context: { min: minimum },
          message
        }
      }
    })
  }

  /**
   * Requires the number to be less than or equal to `maximum`.
   *
   * @param maximum The inclusive upper bound.
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public max(maximum: number, message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.max',
      validate: ({ value }) => {
        if (value <= maximum) {
          return null
        }

        return {
          code: 'number.max',
          context: { max: maximum },
          message
        }
      }
    })
  }

  /**
   * Requires the number to be an integer (no fractional component).
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public integer(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.integer',
      validate: ({ value }) => {
        if (Number.isInteger(value)) {
          return null
        }

        return {
          code: 'number.integer',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the number to be strictly greater than zero.
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public positive(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.positive',
      validate: ({ value }) => {
        if (value > 0) {
          return null
        }

        return {
          code: 'number.positive',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the number to be strictly less than zero.
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public negative(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.negative',
      validate: ({ value }) => {
        if (value < 0) {
          return null
        }

        return {
          code: 'number.negative',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the number to be greater than or equal to zero.
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public nonnegative(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.nonnegative',
      validate: ({ value }) => {
        if (value >= 0) {
          return null
        }

        return {
          code: 'number.nonnegative',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the number to be less than or equal to zero.
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public nonpositive(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.nonpositive',
      validate: ({ value }) => {
        if (value <= 0) {
          return null
        }

        return {
          code: 'number.nonpositive',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the number to be finite (not `Infinity`, `-Infinity`, or `NaN`).
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public finite(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.finite',
      validate: ({ value }) => {
        if (Number.isFinite(value)) {
          return null
        }

        return {
          code: 'number.finite',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the number to be a safe integer
   * (within `Number.MIN_SAFE_INTEGER` to `Number.MAX_SAFE_INTEGER`).
   *
   * @param message Optional custom error message.
   * @returns A new schema with the rule added.
   */
  public safe(message?: string): NumberSchema<M> {
    return this.withRule({
      code: 'number.safe',
      validate: ({ value }) => {
        if (Number.isSafeInteger(value)) {
          return null
        }

        return {
          code: 'number.safe',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Adds a custom number validation rule.
   *
   * @param validator Function that receives the domain number and returns
   * `true` if the value is valid, `false` otherwise.
   * @param code Stable machine-readable validation code.
   * @param message Optional human-readable error message.
   * @returns A new schema with the custom rule added.
   *
   * @example
   * ```ts
   * const evenSchema = number().custom(
   *   value => value % 2 === 0,
   *   'number.even'
   * );
   * ```
   */
  public custom(
    validator: (value: number) => boolean,
    code = 'number.custom',
    message?: string
  ): NumberSchema<M> {
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

  private withRule(rule: ValidationRule<number>): NumberSchema<M> {
    return new NumberSchema<M>(
      [
        ...this.getRules().filter(existingRule => existingRule.code !== 'number.invalid'),
        rule
      ],
      this.getTransformations()
    )
  }
}
