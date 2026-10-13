import { configureSchema, getSchemaConfig, resetSchemaConfig } from './config/config'
import type { SchemaConfig, SchemaConfigOverride } from './config/types'

/**
 * Configures global Olmo Schema validation messages.
 *
 * Only explicitly supplied messages are overridden. Omitted messages
 * retain their default English values.
 *
 * @param override Partial configuration containing only the messages to override.
 *
 * @example
 * ```ts
 * configure({
 *   messages: {
 *     string: { required: 'This field cannot be empty.' },
 *   },
 * });
 * ```
 */
export function configure(override: SchemaConfigOverride): void {
  configureSchema(override)
}

/**
 * Returns the currently active Schema configuration.
 *
 * @returns The active `SchemaConfig` including all resolved message templates.
 *
 * @example
 * ```ts
 * const config = getConfig();
 * console.log(config.messages.string.required);
 * ```
 */
export function getConfig(): SchemaConfig {
  return getSchemaConfig()
}

/**
 * Restores all validation messages to the built-in English defaults.
 *
 * @example
 * ```ts
 * resetConfig();
 * ```
 */
export function resetConfig(): void {
  resetSchemaConfig()
}
