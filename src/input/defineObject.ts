import type { InferModelDefinition, Model, ModelDefinition } from '../base'

/**
 * Checks if a given input is a FormData instance safely in any environment.
 * @param data The input to check.
 */
function isFormData(data: unknown): data is FormData {
  return typeof FormData !== 'undefined' && data instanceof FormData
}

/**
 * Defines a new complete domain model bound strictly to the given field definition.
 *
 * @param definition A mapping of keys to ModelFields.
 * @returns A Model API for creating, emptying, and decoding strictly typed instances.
 *
 * @example
 * const User = defineObject({
 *   name: string(),
 *   age: number(),
 *   active: boolean()
 * });
 *
 * const user = User.empty();
 * user.set('name', 'John');
 */
export function defineObject<D extends ModelDefinition>(
  definition: D
): Model<InferModelDefinition<D>> {
  type T = InferModelDefinition<D>

  /**
   * Helper to attach prototype to raw dictionary to form a model instance.
   */
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
