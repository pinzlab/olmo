import { StringSchema } from '../builtins/StringSchema'
import { string } from './String'

/**
 * Requires a valid email address format.
 *
 * This validates the email syntax only. It does not verify
 * whether the address exists or can receive messages.
 *
 * @example
 * ```ts
 * const emailSchema = email().required();
 * ```
 */
export function email(message?: string): StringSchema {
  return string()
    .trim()
    .custom(value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 'format.email', message)
}

/**
 * Requires an absolute HTTP or HTTPS URL.
 *
 * This validates the URL syntax and protocol. It does not verify
 * whether the resource exists or is reachable.
 *
 * @example
 * ```ts
 * const websiteSchema = url()
 *   .required();
 * ```
 */
export function url(message?: string): StringSchema {
  return string()
    .trim()
    .custom(
      value => {
        try {
          const parsedUrl = new URL(value)

          return (
            (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') &&
            parsedUrl.hostname.length > 0
          )
        } catch {
          return false
        }
      },
      'format.url',
      message
    )
}
