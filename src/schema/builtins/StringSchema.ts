import { Schema } from '../core/Schema'
import { getSchemaConfig } from '../config/config'
import type { Transformation, ValidationRule } from '../core/types'
import { interpolateMessage } from '../core/interpolate'

/**
 * A schema for validating and transforming string domain values.
 *
 * StringSchema never decodes values. Its input is already a string
 * produced by the Model/Field layer.
 *
 * @typeParam M - Complete model type used by the eventual object Schema.
 *
 * @example
 * ```ts
 * const username = string()
 *   .trim()
 *   .lowercase()
 *   .min(3)
 *   .max(50);
 * ```
 */
export class StringSchema<M extends object = object> extends Schema<string, string, M> {
  public constructor(
    rules: readonly ValidationRule<string>[] = [],
    transformations: readonly Transformation<string>[] = []
  ) {
    super({
      rules,
      transformations,
      zeroPolicy: 'preserve',

      field: {
        zero: () => '',
        isZero: value => value === ''
      },

      messageResolver: failure => {
        if (failure.message !== undefined) {
          return interpolateMessage(failure.message, failure.context)
        }

        const [namespace, rule] = failure.code.split('.')

        if (namespace !== 'string') {
          return failure.code
        }

        const messages = getSchemaConfig().messages.string
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
   * Required string
   */
  public required(message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.required',
      validate: ({ value }) => {
        if (value !== '') {
          return null
        }

        return {
          code: 'string.required',
          context: {},
          message
        }
      }
    })
  }
  /**
   * Requires at least `minimum` characters.
   */
  public min(minimum: number, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.min',
      validate: ({ value }) => {
        if (value.length >= minimum) {
          return null
        }

        return {
          code: 'string.min',
          context: { min: minimum },
          message
        }
      }
    })
  }

  /**
   * Requires at most `maximum` characters.
   */
  public max(maximum: number, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.max',
      validate: ({ value }) => {
        if (value.length <= maximum) {
          return null
        }

        return {
          code: 'string.max',
          context: { max: maximum },
          message
        }
      }
    })
  }

  /**
   * Requires exactly `expected` characters.
   */
  public length(expected: number, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.length',
      validate: ({ value }) => {
        if (value.length === expected) {
          return null
        }

        return {
          code: 'string.length',
          context: { length: expected },
          message
        }
      }
    })
  }

  /**
   * Requires the value to match a regular expression.
   */
  public regex(pattern: RegExp, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.regex',
      validate: ({ value }) => {
        if (pattern.test(value)) {
          return null
        }

        return {
          code: 'string.regex',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Requires the string to contain the supplied substring.
   */
  public includes(search: string, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.includes',
      validate: ({ value }) => {
        if (value.includes(search)) {
          return null
        }

        return {
          code: 'string.includes',
          context: { value: search },
          message
        }
      }
    })
  }

  /**
   * Requires the string to begin with the supplied prefix.
   */
  public startsWith(prefix: string, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.startsWith',
      validate: ({ value }) => {
        if (value.startsWith(prefix)) {
          return null
        }

        return {
          code: 'string.startsWith',
          context: { value: prefix },
          message
        }
      }
    })
  }

  /**
   * Requires the string to end with the supplied suffix.
   */
  public endsWith(suffix: string, message?: string): StringSchema<M> {
    return this.withRule({
      code: 'string.endsWith',
      validate: ({ value }) => {
        if (value.endsWith(suffix)) {
          return null
        }

        return {
          code: 'string.endsWith',
          context: { value: suffix },
          message
        }
      }
    })
  }

  /**
   * Trims leading and trailing whitespace from the server output.
   *
   * The original Model value is not modified.
   */
  public trim(): StringSchema<M> {
    return this.withTransformation(value => value.trim())
  }

  /**
   * Converts the server representation to lowercase.
   *
   * The original Model value is not modified.
   */
  public lowercase(): StringSchema<M> {
    return this.withTransformation(value => value.toLowerCase())
  }

  /**
   * Converts the server representation to uppercase.
   *
   * The original Model value is not modified.
   */
  public uppercase(): StringSchema<M> {
    return this.withTransformation(value => value.toUpperCase())
  }

  /**
   * Adds a custom string validation rule.
   *
   * @param validator Function receiving the domain string.
   * @param code Stable validation code.
   */
  public custom(
    validator: (value: string) => boolean,
    code = 'string.custom',
    message?: string
  ): StringSchema<M> {
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

  private withRule(rule: ValidationRule<string>): StringSchema<M> {
    return new StringSchema<M>([...this.getRules(), rule], this.getTransformations())
  }

  private withTransformation(transformation: Transformation<string>): StringSchema<M> {
    return new StringSchema<M>(this.getRules(), [
      ...this.getTransformations(),
      transformation
    ])
  }
}
