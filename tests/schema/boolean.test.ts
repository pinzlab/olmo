import { describe, expect, it, beforeEach } from 'vitest'
import { resetConfig, configure } from '../../src/schema'
import { boolean } from '../../src/schema/rules/Boolean'

describe('BooleanSchema', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('runtime validation', () => {
    it('defensively verifies value is a boolean', () => {
      const schema = boolean()

      const [error] = schema.safeParseUnknown('true') as any
      expect(error?._schema.code).toBe('boolean.invalid')
      expect(error?._schema.message).toBe('Invalid boolean')
    })
  })

  describe('custom', () => {
    it('invokes custom validation logic', () => {
      const schema = boolean().custom(val => val === true, 'boolean.mustBeTrue')

      expect(schema.parse(true)).toBe(true)

      const [error] = schema.safeParseUnknown(false) as any
      expect(error?._schema.code).toBe('boolean.mustBeTrue')
    })
  })

  describe('configuration', () => {
    it('allows overriding messages', () => {
      configure({
        messages: {
          boolean: {
            invalid: 'Not a boolean!'
          }
        }
      })

      const schema = boolean()
      const [error] = schema.safeParseUnknown('false')
      expect(error).toMatchObject({
        _schema: {
          code: 'boolean.invalid',
          message: 'Not a boolean!'
        }
      })
    })
  })
})
