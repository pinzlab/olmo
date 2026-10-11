import { Field } from '../../base'

/**
 * Runtime validation context supplied to a schema rule.
 */
export interface ValidationContext<T> {
  /**
   * The original domain value received from the Model.
   */
  readonly value: T

  /**
   * The field responsible for the domain value.
   */
  readonly field: Field<T>

  /**
   * Complete domain model, when validation runs through ObjectSchema.
   */
  readonly model?: object

  /**
   * Model field name, when available.
   */
  readonly path?: string
}

/**
 * Context used to resolve a validation message.
 */
export interface MessageContext {
  readonly [key: string]: string | number | boolean
}

/**
 * Result of a single validation rule.
 */
export interface ValidationFailure {
  readonly code: string
  readonly message?: string
  readonly context: MessageContext
}

/**
 * A schema validation rule.
 */
export interface ValidationRule<T> {
  readonly code: string
  readonly validate: (
    context: ValidationContext<T>
  ) => ValidationFailure | null | Promise<ValidationFailure | null>
}

/**
 * Transformation applied to a domain value before it is emitted
 * into the server payload.
 */
export type Transformation<T> = (value: T) => T

/**
 * Schema output policy for zero values.
 */
export type ZeroPolicy = 'preserve' | 'nullable' | 'ignore'
