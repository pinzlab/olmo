import type { SchemaConfig } from './types'

/**
 * Built-in English Schema configuration.
 *
 * Applications do not need to call configure() before using Schema.
 */
export const defaultSchemaConfig: SchemaConfig = {
  messages: {
    string: {
      invalid: 'Invalid string',
      required: 'This field is required',
      min: 'Must contain at least {min} characters',
      max: 'Must contain at most {max} characters',
      length: 'Must contain exactly {length} characters',
      regex: 'Invalid format',
      includes: 'Must contain {value}',
      startsWith: 'Must start with {value}',
      endsWith: 'Must end with {value}'
    },
    format: {
      email: 'Invalid email address',
      url: 'Invalid URL'
    },
    number: {
      invalid: 'Invalid number',
      required: 'This field is required',
      min: 'Must be greater than or equal to {min}',
      max: 'Must be less than or equal to {max}',
      integer: 'Must be an integer',
      positive: 'Must be greater than zero',
      negative: 'Must be less than zero',
      nonnegative: 'Must be greater than or equal to zero',
      nonpositive: 'Must be less than or equal to zero',
      finite: 'Must be a finite number',
      safe: 'Must be a safe integer'
    },
    boolean: {
      invalid: 'Invalid boolean',
      required: 'This field is required'
    },
    enumeration: {
      invalid: 'Invalid enumeration value',
      required: 'This field is required'
    },
    file: {
      invalid: 'Invalid file',
      required: 'This field is required',
      minSize: 'Must be at least {min} bytes',
      maxSize: 'Must be at most {max} bytes',
      mimeType: 'Invalid file type'
    }
  }
}
