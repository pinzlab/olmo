import { Field } from '../../base'
import type { ValidationError } from './error'
import type {
  Transformation,
  ValidationContext,
  ValidationFailure,
  ValidationRule,
  ZeroPolicy
} from './types'

/**
 * Internal definition used to construct a Schema.
 *
 * @typeParam T - Complete domain value type.
 * @typeParam O - Server output type.
 * @typeParam M - Complete model type used for field-keyed errors.
 */
export interface SchemaDefinition<T, O, M> {
  readonly rules: readonly ValidationRule<T>[]
  readonly transformations: readonly Transformation<T>[]
  readonly zeroPolicy: ZeroPolicy
  readonly messageResolver: (failure: ValidationFailure) => string
  readonly output: (value: T, field: Field<T>) => O
  readonly field?: Field<T>
  readonly fieldName?: keyof M
}

/**
 * Base Schema implementation for a single model field.
 *
 * Schema validates already-decoded domain values. It does not decode
 * external data and it never mutates the model.
 *
 * @typeParam T - Domain field type.
 * @typeParam O - Server output type.
 * @typeParam M - Complete model type.
 */
export class Schema<T, O, M extends object> {
  protected readonly definition: SchemaDefinition<T, O, M>

  public constructor(definition: SchemaDefinition<T, O, M>) {
    this.definition = definition
  }

  /**
   * Returns the Schema field metadata used for zero-value semantics.
   *
   * @internal
   */
  public getField(): Field<T> {
    if (this.definition.field === undefined) {
      throw new Error('This Schema does not define field zero-value metadata.')
    }

    return this.definition.field
  }

  /**
   * Returns the canonical zero value.
   *
   * @internal
   */
  public zero(): T {
    return this.getField().zero()
  }

  /**
   * Determines whether a value is the canonical zero value.
   *
   * @internal
   */
  public isZero(value: T): boolean {
    return this.getField().isZero(value)
  }

  /**
   * Creates an immutable Schema bound to a particular model type and field.
   *
   * @internal
   */
  public bindModel<M2 extends object>(fieldName: keyof M2): Schema<T, O, M2> {
    return new Schema<T, O, M2>({
      ...this.definition,
      fieldName
    })
  }

  /**
   * Parses one domain value into its server representation.
   *
   * @param value Domain value supplied by the Model.
   * @param field Optional field metadata. When omitted, the Schema's own
   * field metadata is used.
   * @throws {ValidationError<M>} When validation fails.
   */
  public parse(value: T, field: Field<T> = this.getField()): O {
    const result = this.safeParseValue(value, field)

    if (result[0] !== null) {
      throw result[0]
    }

    return result[1] as O
  }

  /**
   * Safely parses one domain value.
   *
   * The parent Model schema uses this operation to construct the
   * complete field-keyed validation error object.
   */
  public safeParseValue(
    value: T,
    field: Field<T> = this.getField(),
    model?: M
  ): readonly [ValidationError<M> | null, O | null] {
    const context: ValidationContext<T> = {
      value,
      field,
      model,
      path: this.definition.fieldName ? String(this.definition.fieldName) : undefined
    }

    const failure = this.validate(context)

    if (failure !== null) {
      const fieldName = this.definition.fieldName
      const fieldError = {
        code: failure.code,
        message: this.definition.messageResolver(failure),
        value
      }

      if (fieldName === undefined) {
        return [
          {
            _schema: fieldError
          } as ValidationError<M>,
          null
        ]
      }

      return [
        {
          [fieldName]: fieldError
        } as ValidationError<M>,
        null
      ]
    }

    const transformedValue = this.applyTransformations(value)

    return [null, this.definition.output(transformedValue, field)]
  }

  /**
   * Parses one domain value asynchronously into its server representation.
   *
   * @param value Domain value supplied by the Model.
   * @param field Optional field metadata. When omitted, the Schema's own
   * field metadata is used.
   * @throws {ValidationError<M>} When validation fails.
   */
  public async parseAsync(value: T, field: Field<T> = this.getField()): Promise<O> {
    const result = await this.safeParseValueAsync(value, field)

    if (result[0] !== null) {
      throw result[0]
    }

    return result[1] as O
  }

  /**
   * Safely parses one domain value asynchronously.
   *
   * The parent Model schema uses this operation to construct the
   * complete field-keyed validation error object.
   */
  public async safeParseValueAsync(
    value: T,
    field: Field<T> = this.getField(),
    model?: M
  ): Promise<readonly [ValidationError<M> | null, O | null]> {
    const context: ValidationContext<T> = {
      value,
      field,
      model,
      path: this.definition.fieldName ? String(this.definition.fieldName) : undefined
    }

    const failure = await this.validateAsync(context)

    if (failure !== null) {
      const fieldName = this.definition.fieldName
      const fieldError = {
        code: failure.code,
        message: this.definition.messageResolver(failure),
        value
      }

      if (fieldName === undefined) {
        return [
          {
            _schema: fieldError
          } as ValidationError<M>,
          null
        ]
      }

      return [
        {
          [fieldName]: fieldError
        } as ValidationError<M>,
        null
      ]
    }

    const transformedValue = await this.applyTransformationsAsync(value)

    return [null, this.definition.output(transformedValue, field)]
  }

  /**
   * Internal erased-input entry point used by ObjectSchema.
   *
   * The public factory retains the precise domain type; this method only
   * crosses the heterogeneous object-schema collection boundary.
   *
   * @internal
   */
  public safeParseUnknown(
    value: unknown,
    model?: M
  ): readonly [ValidationError<M> | null, unknown | null] {
    return this.safeParseValue(value as T, this.getField(), model)
  }

  /**
   * Internal erased-input async entry point used by ObjectSchema.
   *
   * @internal
   */
  public safeParseUnknownAsync(
    value: unknown,
    model?: M
  ): Promise<readonly [ValidationError<M> | null, unknown | null]> {
    return this.safeParseValueAsync(value as T, this.getField(), model)
  }

  /**
   * Creates a schema configured for nullable zero-value projection.
   */
  public nullable(): Schema<T, O | null, M> {
    return new Schema<T, O | null, M>({
      ...this.definition,
      zeroPolicy: 'nullable',
      output: (value, field) => {
        if (field.isZero(value)) {
          return null
        }

        return this.definition.output(value, field)
      }
    })
  }

  /**
   * Creates a schema configured to omit zero values.
   */
  public ignoreZero(): Schema<T, O | undefined, M> {
    return new Schema<T, O | undefined, M>({
      ...this.definition,
      zeroPolicy: 'ignore',
      output: (value, field) => {
        if (field.isZero(value)) {
          return undefined
        }

        return this.definition.output(value, field)
      }
    })
  }

  /**
   * Adds a custom validation rule that can inspect the complete model.
   *
   * The callback receives the current field value and the complete model.
   * Refinements can be synchronous or asynchronous.
   *
   * The returned schema is immutable: the original schema is not modified.
   *
   * @param validator Validation callback.
   * @param code Stable machine-readable validation code.
   * @param message Optional custom validation message.
   */
  public refine(
    validator: (value: T, model: any) => boolean | Promise<boolean>,
    code = 'schema.refine',
    message?: string
  ): Schema<T, O, M> {
    const refinement: ValidationRule<T> = {
      code,
      validate: ({ value, model }) => {
        const result = validator(value, model)

        const toFailure = (isValid: boolean): ValidationFailure | null => {
          if (isValid) {
            return null
          }

          return {
            code,
            context: {},
            message
          }
        }

        if (result instanceof Promise) {
          return result.then(toFailure)
        }

        return toFailure(result)
      }
    }

    return new Schema<T, O, M>({
      ...this.definition,
      rules: [...this.definition.rules, refinement]
    })
  }

  protected validate(context: ValidationContext<T>): ValidationFailure | null {
    for (const rule of this.definition.rules) {
      const failure = rule.validate(context)

      if (failure instanceof Promise) {
        throw new Error(
          `Asynchronous validation encountered in synchronous parse. Use safeParseAsync instead. (rule: ${rule.code})`
        )
      }

      if (failure !== null) {
        return failure
      }
    }

    return null
  }

  protected async validateAsync(
    context: ValidationContext<T>
  ): Promise<ValidationFailure | null> {
    for (const rule of this.definition.rules) {
      const failure = await rule.validate(context)

      if (failure !== null) {
        return failure
      }
    }

    return null
  }

  protected getRules(): readonly ValidationRule<T>[] {
    return this.definition.rules
  }

  protected getTransformations(): readonly Transformation<T>[] {
    return this.definition.transformations
  }

  private applyTransformations(value: T): T {
    return this.definition.transformations.reduce(
      (currentValue, transformation) => transformation(currentValue),
      value
    )
  }

  private async applyTransformationsAsync(value: T): Promise<T> {
    let currentValue = value
    for (const transformation of this.definition.transformations) {
      const result = transformation(currentValue)
      currentValue = result instanceof Promise ? await result : result
    }
    return currentValue
  }
}
