import { configureSchema, getSchemaConfig, resetSchemaConfig } from './config/config'
import type { SchemaConfig, SchemaConfigOverride } from './config/types'

/**
 * Configures global Olmo Schema behavior.
 *
 * Only explicitly supplied messages are overridden.
 */
export function configure(override: SchemaConfigOverride): void {
  configureSchema(override)
}

/**
 * Returns the currently active Schema configuration.
 */
export function getConfig(): SchemaConfig {
  return getSchemaConfig()
}

/**
 * Restores the built-in English Schema configuration.
 */
export function resetConfig(): void {
  resetSchemaConfig()
}
