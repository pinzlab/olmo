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
