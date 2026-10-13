import { InputField } from './Field'

/**
 * A mapping of field names to their corresponding input field definitions.
 *
 * Used as the argument to `defineObject` to describe the structure of a domain model.
 */
export type ModelDefinition = Record<string, InputField<unknown>>

/**
 * Infers the domain model type from a `ModelDefinition`.
 *
 * Each key is mapped to the domain type of its corresponding `InputField`.
 *
 * @typeParam D - A `ModelDefinition` object.
 */
export type InferModelDefinition<D extends ModelDefinition> = {
  [K in keyof D]: D[K] extends InputField<infer T> ? T : never
}

/**
 * Extracts the domain type `T` from a `Model<T>`.
 *
 * @typeParam M - A `Model` instance.
 */
export type InferModel<M> = M extends Model<infer T> ? T : never

/**
 * A domain model factory for creating and decoding typed instances.
 *
 * @typeParam T - The complete domain model type.
 */
export interface Model<T> {
  /**
   * Creates a domain model instance from partial domain data.
   *
   * Fields omitted from `data` are initialized to their zero values.
   * Does not perform decoding; use `decode` for external representations.
   *
   * @param data Optional partial domain data.
   * @returns A new model instance with all fields populated.
   */
  create(data?: Partial<T>): T

  /**
   * Decodes an external representation into a typed domain model.
   *
   * Accepts a plain JavaScript object or a `FormData` instance. Missing
   * fields resolve to their zero value via each field's `decode` method.
   *
   * @param data Raw external data such as a JSON payload or form submission.
   * @returns A model instance with all fields decoded and populated.
   */
  decode(data: unknown): T
}
