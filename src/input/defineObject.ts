import type { InferModelDefinition, Model, ModelDefinition } from '../base'

function isFormData(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData
}

/**
 * Defines a domain model bound to the given field definitions.
 *
 * Returns a `Model` that can create new instances with zero values
 * and decode external representations such as `FormData` or plain objects.
 *
 * @param definition A mapping of field names to their input field definitions.
 * @returns A `Model` whose domain type is inferred from `definition`.
 *
 * @example
 * ```ts
 * const User = defineObject({
 *   name: string(),
 *   age: number(),
 *   active: boolean(),
 * });
 *
 * const user = User.create({ name: 'Alice' });
 * // { name: 'Alice', age: 0, active: false }
 *
 * const decoded = User.decode(formData);
 * ```
 */
export function defineObject<D extends ModelDefinition>(
  definition: D
): Model<InferModelDefinition<D>> {
  type T = InferModelDefinition<D>

  function createInstance(data: Record<string, unknown>): T {
    const instance = Object.create({})
    for (const key of Object.keys(definition)) {
      instance[key] = data[key]
    }
    return instance as T
  }

  return {
    create(data: Partial<T> = {}): T {
      const internalData: Record<string, unknown> = {}

      for (const [key, field] of Object.entries(definition)) {
        const value = data[key as keyof T]
        internalData[key] = value === undefined ? field.zero() : value
      }

      return createInstance(internalData)
    },

    decode(input: unknown): T {
      const internalData: Record<string, unknown> = {}
      const isForm = isFormData(input)

      for (const [key, field] of Object.entries(definition)) {
        let externalValue: unknown
        if (isForm) {
          externalValue = input.get(key)
        } else if (typeof input === 'object' && input !== null && key in input) {
          externalValue = (input as Record<string, unknown>)[key]
        } else {
          externalValue = undefined // Missing resolves to zero via decode()
        }

        internalData[key] = field.decode(externalValue)
      }
      return createInstance(internalData)
    }
  }
}
