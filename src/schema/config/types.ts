/**
 * Validation message templates for string schemas.
 *
 * Templates may include placeholders that are interpolated with
 * the context provided by the corresponding validation rule.
 */
export interface StringMessages {
  /** Message returned when the string fails a general validation rule. */
  readonly invalid: string

  /** Message returned when a required string is empty. */
  readonly required: string

  /** Message returned when the string contains fewer characters than allowed. */
  readonly min: string

  /** Message returned when the string contains more characters than allowed. */
  readonly max: string

  /** Message returned when the string length differs from the expected length. */
  readonly length: string

  /** Message returned when the string does not match the required regular expression. */
  readonly regex: string

  /** Message returned when the string does not contain the required substring. */
  readonly includes: string

  /** Message returned when the string does not start with the required prefix. */
  readonly startsWith: string

  /** Message returned when the string does not end with the required suffix. */
  readonly endsWith: string
}

/**
 * Validation message templates for predefined string formats.
 *
 * These messages are used by format validators such as email and URL.
 * Format validation checks the value's syntax without verifying the
 * existence or reachability of the corresponding resource.
 */
export interface FormatMessages {
  /** Message returned when the string does not match the expected email format. */
  readonly email: string

  /** Message returned when the string is not a valid absolute HTTP or HTTPS URL. */
  readonly url: string
}

/**
 * Validation message templates for enumeration schemas.
 *
 * These messages describe invalid enumeration values and missing
 * required values.
 */
export interface EnumerationMessages {
  /** Message returned when the value is not one of the allowed enumeration values. */
  readonly invalid: string

  /** Message returned when a required enumeration value is missing. */
  readonly required: string
}

/**
 * Validation message templates for number schemas.
 *
 * Templates may include placeholders containing the constraints
 * associated with the failed validation rule.
 */
export interface NumberMessages {
  /** Message returned when the value is not a valid number. */
  readonly invalid: string

  /** Message returned when the number is smaller than the minimum allowed value. */
  readonly min: string

  /** Message returned when the number is greater than the maximum allowed value. */
  readonly max: string

  /** Message returned when the number is not an integer. */
  readonly integer: string

  /** Message returned when the number is not strictly greater than zero. */
  readonly positive: string

  /** Message returned when the number is not strictly less than zero. */
  readonly negative: string

  /** Message returned when the number is negative. */
  readonly nonnegative: string

  /** Message returned when the number is positive. */
  readonly nonpositive: string

  /** Message returned when the number is infinite or otherwise not finite. */
  readonly finite: string

  /** Message returned when the number is not a safe integer. */
  readonly safe: string
}

/**
 * Validation message templates for boolean schemas.
 */
export interface BooleanMessages {
  /** Message returned when the value is not a valid boolean. */
  readonly invalid: string
}

/**
 * Validation message templates for file schemas.
 */
export interface FileMessages {
  /** Message returned when the value is not a valid file. */
  readonly invalid: string

  /** Message returned when the file is smaller than the minimum allowed size. */
  readonly minSize: string

  /** Message returned when the file exceeds the maximum allowed size. */
  readonly maxSize: string

  /** Message returned when the file's MIME type is not allowed. */
  readonly mimeType: string
}

/**
 * Collection of validation message templates for all supported schema types.
 *
 * Each property groups the messages used by a specific schema category.
 * Applications can customize these templates through the global schema
 * configuration.
 */
export interface SchemaMessages {
  /** Messages used by string validation rules. */
  readonly string: StringMessages

  /** Messages used by predefined string format validators, such as email and URL. */
  readonly format: FormatMessages

  /** Messages used by number validation rules. */
  readonly number: NumberMessages

  /** Messages used by boolean validation rules. */
  readonly boolean: BooleanMessages

  /** Messages used by enumeration validation rules. */
  readonly enumeration: EnumerationMessages

  /** Messages used by file validation rules. */
  readonly file: FileMessages
}

/**
 * Global Olmo Schema configuration.
 *
 * Contains the resolved configuration consumed by schema instances,
 * including the complete set of validation message templates.
 */
export interface SchemaConfig {
  /** Complete validation message configuration for all schema categories. */
  readonly messages: SchemaMessages
}

/**
 * Partial configuration accepted by `olmo.configure()`.
 *
 * Applications can override individual validation messages without
 * redefining the remaining messages. Omitted properties retain their
 * values from the default configuration.
 *
 * @example
 * ```ts
 * olmo.configure({
 *   messages: {
 *     string: {
 *       required: 'This field is required.',
 *       min: 'Enter at least {{min}} characters.'
 *     },
 *     format: {
 *       email: 'Enter a valid email address.',
 *       url: 'Enter a valid URL.'
 *     }
 *   }
 * });
 * ```
 */
export type SchemaConfigOverride = {
  /** Optional overrides grouped by schema category. */
  readonly messages?: {
    /** Overrides for string validation messages. */
    readonly string?: Partial<StringMessages>

    /** Overrides for predefined string format validation messages. */
    readonly format?: Partial<FormatMessages>

    /** Overrides for number validation messages. */
    readonly number?: Partial<NumberMessages>

    /** Overrides for boolean validation messages. */
    readonly boolean?: Partial<BooleanMessages>

    /** Overrides for enumeration validation messages. */
    readonly enumeration?: Partial<EnumerationMessages>

    /** Overrides for file validation messages. */
    readonly file?: Partial<FileMessages>
  }
}
