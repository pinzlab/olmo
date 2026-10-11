import { defaultSchemaConfig } from './defaultConfig'
import type { SchemaConfig, SchemaConfigOverride } from './types'

let activeSchemaConfig: SchemaConfig = defaultSchemaConfig

/**
 * Deeply merges a Schema configuration override into the active
 * configuration.
 */
export function configureSchema(override: SchemaConfigOverride): void {
  const currentMessages = activeSchemaConfig.messages

  activeSchemaConfig = {
    messages: {
      string: {
        ...currentMessages.string,
        ...override.messages?.string
      },
      number: {
        ...currentMessages.number,
        ...override.messages?.number
      },
      boolean: {
        ...currentMessages.boolean,
        ...override.messages?.boolean
      },
      enumeration: {
        ...currentMessages.enumeration,
        ...override.messages?.enumeration
      },
      file: {
        ...currentMessages.file,
        ...override.messages?.file
      }
    }
  }
}

/**
 * Returns the currently active Schema configuration.
 */
export function getSchemaConfig(): SchemaConfig {
  return activeSchemaConfig
}

/**
 * Resets Schema configuration to the built-in defaults.
 */
export function resetSchemaConfig(): void {
  activeSchemaConfig = defaultSchemaConfig
}
