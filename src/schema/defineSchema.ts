import { Schema } from './core/Schema'
import type { FieldError, ValidationError } from './core/error'

/**
 * Schemas accepted by individual fields.
 */
export type SchemaDefinitionMap = Record<string, Schema<any, any, any>>

/**
 * Restricts a schema definition so its keys and field types match
 * the domain model M. Fields may be omitted.
 *
 * Unknown keys are rejected when the definition is checked against
 * a known model type.
 */
export type StrictSchemaDefinition<M extends object> = {
  [K in keyof M]?: Schema<M[K], any, any>
}

/**
 * Extracts the domain input type from a field Schema.
 */
export type InferSchemaInput<S> = S extends Schema<infer T, any, any> ? T : never

/**
 * Extracts the server output type from a field Schema.
 */
export type InferSchemaOutput<S> = S extends Schema<any, infer O, any> ? O : never

/**
 * Keys whose schemas may omit their output.
 */
export type OptionalSchemaKeys<D extends object> = {
  [K in keyof D]-?: D[K] extends Schema<any, any, any>
    ? undefined extends InferSchemaOutput<D[K]>
      ? K
      : never
    : never
}[keyof D]

/**
 * Keys whose schemas always emit a value.
 */
export type RequiredSchemaKeys<D extends object> = Exclude<keyof D, OptionalSchemaKeys<D>>

/**
 * Removes undefined from an output value.
 *
 * An undefined result means that the property is omitted.
 */
export type DefinedSchemaOutput<S> =
  S extends Schema<any, any, any> ? Exclude<InferSchemaOutput<S>, undefined> : never

/**
 * Infers the data payload produced by an object schema.
 *
 * Schemas returning undefined produce optional properties.
 * Nullable schemas remain required and preserve null.
 */
export type InferSchemaObjectData<D extends object> = {
  [K in RequiredSchemaKeys<D>]: D[K] extends Schema<any, any, any>
    ? DefinedSchemaOutput<D[K]>
    : never
} & {
  [K in OptionalSchemaKeys<D>]?: D[K] extends Schema<any, any, any>
    ? DefinedSchemaOutput<D[K]>
    : never
}

/**
 * Infers the complete result of validating an object schema.
 *
 * The tuple contains data first and validation errors second:
 *
 * - [data, null] represents success.
 * - [null, errors] represents failure.
 */
export type InferSchemaObjectOutput<M extends object, D extends object> =
  readonly [InferSchemaObjectData<D>, null] | readonly [null, ValidationError<M>]

/**
 * Object-level validation Schema.
 *
 * ObjectSchema coordinates field schemas. It does not decode external
 * representations and never mutates the input model.
 *
 * @typeParam M - Complete inferred model domain type.
 * @typeParam D - Partial field schema definition.
 */
export class ObjectSchema<
  M extends object,
  D extends StrictSchemaDefinition<M> = StrictSchemaDefinition<M>
> {
  private readonly definition: D

  public constructor(definition: D) {
    this.definition = definition
  }

  /**
   * Validates a complete domain model and returns its data or errors.
   *
   * Only fields present in the schema definition are validated.
   */
  public safeParse(value: M): InferSchemaObjectOutput<M, D> {
    const errors: Partial<ValidationError<M>> = {}
    const output: Record<string, unknown> = {}
    let hasErrors = false

    for (const key of Object.keys(this.definition)) {
      const schema = (
        this.definition as Record<string, Schema<any, any, any> | undefined>
      )[key]

      if (!schema) {
        continue
      }

      const boundSchema = schema.bindModel<M>(key as keyof M)
      const inputValue = (value as Record<string, unknown>)[key]

      const [error, projectedValue] = boundSchema.safeParseUnknown(inputValue, value)

      if (error !== null) {
        hasErrors = true

        const fieldError = error[key as keyof M] as FieldError<unknown> | undefined

        if (fieldError !== undefined) {
          ;(errors as Record<string, FieldError<unknown>>)[key] = fieldError
        }

        continue
      }

      if (projectedValue !== undefined) {
        output[key] = projectedValue
      }
    }

    if (hasErrors) {
      return [null, errors as ValidationError<M>]
    }

    return [output as InferSchemaObjectData<D>, null]
  }

  /**
   * Validates a domain model and returns its server representation.
   *
   * Throws the complete field-keyed ValidationError when validation fails.
   */
  public parse(value: M): InferSchemaObjectData<D> {
    const result = this.safeParse(value)

    if (result[1] !== null) {
      throw result[1]
    }

    return result[0] as InferSchemaObjectData<D>
  }

  /**
   * Asynchronously validates a complete domain model and returns
   * its data or errors.
   */
  public async safeParseAsync(value: M): Promise<InferSchemaObjectOutput<M, D>> {
    const errors: Partial<ValidationError<M>> = {}
    const output: Record<string, unknown> = {}
    let hasErrors = false

    for (const key of Object.keys(this.definition)) {
      const schema = (
        this.definition as Record<string, Schema<any, any, any> | undefined>
      )[key]

      if (!schema) {
        continue
      }

      const boundSchema = schema.bindModel<M>(key as keyof M)
      const inputValue = (value as Record<string, unknown>)[key]

      const [error, projectedValue] = await boundSchema.safeParseUnknownAsync(
        inputValue,
        value
      )

      if (error !== null) {
        hasErrors = true

        const fieldError = error[key as keyof M] as FieldError<unknown> | undefined

        if (fieldError !== undefined) {
          ;(errors as Record<string, FieldError<unknown>>)[key] = fieldError
        }

        continue
      }

      if (projectedValue !== undefined) {
        output[key] = projectedValue
      }
    }

    if (hasErrors) {
      return [null, errors as ValidationError<M>]
    }

    return [output as InferSchemaObjectData<D>, null]
  }

  /**
   * Asynchronously validates a domain model and returns its server representation.
   *
   * Throws the complete field-keyed ValidationError when validation fails.
   */
  public async parseAsync(value: M): Promise<InferSchemaObjectData<D>> {
    const result = await this.safeParseAsync(value)

    if (result[1] !== null) {
      throw result[1]
    }

    return result[0] as InferSchemaObjectData<D>
  }
}

/**
 * Defines an object-level validation Schema.
 *
 * The model type is supplied explicitly and determines the accepted
 * domain values. The definition may be partial: only supplied fields
 * are validated and projected.
 *
 * Field / defineObject remain responsible for decoding external data.
 * defineSchema is responsible only for domain validation and projection.
 */
export function defineSchema<
  M extends object,
  D extends StrictSchemaDefinition<M> = StrictSchemaDefinition<M>
>(definition: D): ObjectSchema<M, D> {
  return new ObjectSchema<M, D>(definition)
}
