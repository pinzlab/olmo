import type { Transformation, ValidationRule } from '../core/types'
import { interpolateMessage } from '../core/interpolate'
import { getSchemaConfig } from '../config/config'
import { Schema } from '../core/Schema'
import { Enum } from '../../base'
import { enumeration } from '../../input'

/**
 * A schema for validating values belonging to a TypeScript enumeration.
 *
 * EnumerationSchema validates already-decoded domain values. It does not
 * decode external representations; decoding remains the responsibility of
 * the corresponding input Field.
 *
 * @typeParam E - TypeScript enumeration object.
 * @typeParam M - Complete model type used by the eventual object Schema.
 *
 * @example
 * ```ts
 * enum Role {
 *   Admin = 'admin',
 *   User = 'user'
 * }
 *
 * const roleSchema = new EnumerationSchema(Role)
 *   .required()
 *
 * roleSchema.parse(Role.Admin)
 * ```
 */
export class EnumerationSchema<E extends Enum, M extends object = object> extends Schema<
  E[keyof E],
  E[keyof E],
  M
> {
  private readonly enumObject: E

  public constructor(
    enumObject: E,
    rules: readonly ValidationRule<E[keyof E]>[] = [],
    transformations: readonly Transformation<E[keyof E]>[] = []
  ) {
    const values = EnumerationSchema.getValues(enumObject)

    if (values.length === 0) {
      throw new Error('Enumeration must have at least one permitted value')
    }

    super({
      rules: [
        {
          code: 'enumeration.invalid',
          validate: ({ value }) => {
            if (values.includes(value) || value === '') {
              return null
            }

            return {
              code: 'enumeration.invalid',
              context: {}
            }
          }
        },
        ...rules
      ],
      transformations,
      zeroPolicy: 'preserve',

      field: {
        zero: enumeration(enumObject).zero,
        isZero: enumeration(enumObject).isZero
      },

      messageResolver: failure => {
        if (failure.message !== undefined) {
          return interpolateMessage(failure.message, failure.context)
        }

        const [namespace, rule] = failure.code.split('.')

        if (namespace !== 'enumeration') {
          return failure.code
        }

        const messages = getSchemaConfig().messages.enumeration
        const template = messages[rule as keyof typeof messages]

        if (template === undefined) {
          return failure.code
        }

        return interpolateMessage(template, failure.context)
      },

      output: value => value
    })

    this.enumObject = enumObject
  }

  /**
   * Requires the enumeration value to be different from its zero value.
   *
   * @returns A new schema with the required rule added.
   */
  public required(message?: string): EnumerationSchema<E, M> {
    return this.withRule({
      code: 'enumeration.required',
      validate: ({ value }) => {
        if (value !== '') {
          return null
        }

        return {
          code: 'enumeration.required',
          context: {},
          message
        }
      }
    })
  }

  /**
   * Adds a custom enumeration validation rule.
   *
   * @param validator Function receiving the decoded enumeration value.
   * @param code Stable validation code.
   * @returns A new schema with the custom rule added.
   *
   * @example
   * ```ts
   * enum Role {
   *   Admin = 'admin',
   *   User = 'user'
   * }
   *
   * const schema = enumeration(Role).custom(
   *   value => value !== Role.User,
   *   'role.adminOnly'
   * )
   * ```
   */
  public custom(
    validator: (value: E[keyof E]) => boolean,
    code = 'enumeration.custom',
    message?: string
  ): EnumerationSchema<E, M> {
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

  private withRule(rule: ValidationRule<E[keyof E]>): EnumerationSchema<E, M> {
    return new EnumerationSchema<E, M>(
      this.enumObject,
      [
        ...this.getRules().filter(
          existingRule => existingRule.code !== 'enumeration.invalid'
        ),
        rule
      ],
      this.getTransformations()
    )
  }

  private static getValues<E extends Enum>(enumObject: E): readonly E[keyof E][] {
    return Object.values(enumObject).filter((value): value is E[keyof E] => {
      // Numeric TypeScript enums contain reverse mappings such as
      // { 0: 'Admin', Admin: 0 }. Only the numeric members are valid values.
      if (typeof value === 'string') {
        return !Object.values(enumObject).some(
          numericValue =>
            typeof numericValue === 'number' && enumObject[numericValue] === value
        )
      }

      return true
    })
  }
}
