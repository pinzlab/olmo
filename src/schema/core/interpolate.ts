import type { MessageContext } from './types'

/**
 * Interpolates named placeholders in a validation message template.
 *
 * Example:
 *
 * ```ts
 * interpolate("Must contain at least {min} characters", {
 *   min: 3,
 * });
 * // "Must contain at least 3 characters"
 * ```
 *
 * Unknown placeholders are left unchanged.
 */
export function interpolateMessage(template: string, context: MessageContext): string {
  return template.replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (placeholder, key: string) => {
    const value = context[key]

    return value === undefined ? placeholder : String(value)
  })
}
