import { Field } from './Field'

export type ModelDefinition = Record<string, Field<unknown>>

export type InferModelDefinition<D extends ModelDefinition> = {
  [K in keyof D]: D[K] extends Field<infer T> ? T : never
}
export type InferModel<M> = M extends Model<infer T> ? T : never

export interface Model<T> {
  /**
   * Creates a mutable domain model from optionally provided, strictly typed data.
   * Any omitted fields are initialized using their corresponding zero value.
   * Does NOT perform decoding on external representations.
   *
   * @param data Optional partial domain data.
   * @returns A mutable ModelInstance populated with the provided data and zero values for omitted fields.
   */
  create(data?: Partial<T>): T

  /**
   * Decodes generic unstructured data matching the model structure into a domain model.
   * If a field is missing, it will use its zero value.
   * Supports `FormData` or raw JavaScript objects mapping to fields.
   *
   * @param data The raw data payload or FormData instance.
   * @returns A mutable ModelInstance with safely decoded properties.
   */
  decode(data: unknown): T
}
