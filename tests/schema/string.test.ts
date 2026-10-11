import { describe, expect, it, beforeEach } from 'vitest'
import { resetConfig, configure } from '../../src/schema'
import { string } from '../../src/schema/rules/String'

describe('StringSchema', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('required', () => {
    it('accepts non-empty strings', () => {
      const schema = string().required()

      expect(schema.parse('hello')).toBe('hello')
      expect(schema.parse(' ')).toBe(' ')
    })

    it('rejects empty strings', () => {
      const schema = string().required()
      const [error] = schema.safeParseUnknown('')

      expect((error as any)?._schema.code).toBe('string.required')
      expect((error as any)?._schema.message).toBe('This field is required')
    })
  })

  describe('min', () => {
    it('accepts strings meeting minimum length', () => {
      const schema = string().min(3)
      expect(schema.parse('abc')).toBe('abc')
      expect(schema.parse('abcd')).toBe('abcd')
    })

    it('rejects strings below minimum length', () => {
      const schema = string().min(3)
      const [error] = schema.safeParseUnknown('ab')
      expect((error as any)?._schema.code).toBe('string.min')
      expect((error as any)?._schema.message).toBe('Must contain at least 3 characters')
    })
  })

  describe('max', () => {
    it('accepts strings within maximum length', () => {
      const schema = string().max(3)
      expect(schema.parse('abc')).toBe('abc')
      expect(schema.parse('ab')).toBe('ab')
    })

    it('rejects strings exceeding maximum length', () => {
      const schema = string().max(3)
      const [error] = schema.safeParseUnknown('abcd')
      expect((error as any)?._schema.code).toBe('string.max')
      expect((error as any)?._schema.message).toBe('Must contain at most 3 characters')
    })
  })

  describe('length', () => {
    it('accepts strings of exact length', () => {
      const schema = string().length(3)
      expect(schema.parse('abc')).toBe('abc')
    })

    it('rejects strings of other lengths', () => {
      const schema = string().length(3)
      expect(schema.safeParseUnknown('ab')[0]).not.toBeNull()
      expect(schema.safeParseUnknown('abcd')[0]).not.toBeNull()
    })
  })

  describe('regex', () => {
    it('accepts strings matching pattern', () => {
      const schema = string().regex(/^[a-z]+$/)
      expect(schema.parse('hello')).toBe('hello')
    })

    it('rejects strings not matching pattern', () => {
      const schema = string().regex(/^[a-z]+$/)
      const [error] = schema.safeParseUnknown('Hello123')
      expect((error as any)?._schema.code).toBe('string.regex')
    })
  })

  describe('includes', () => {
    it('accepts strings containing substring', () => {
      const schema = string().includes('cat')
      expect(schema.parse('my cat is cute')).toBe('my cat is cute')
    })

    it('rejects strings missing substring', () => {
      const schema = string().includes('cat')
      const [error] = schema.safeParseUnknown('my dog is cute')
      expect((error as any)?._schema.code).toBe('string.includes')
    })
  })

  describe('startsWith', () => {
    it('accepts strings with prefix', () => {
      const schema = string().startsWith('http://')
      expect(schema.parse('http://example.com')).toBe('http://example.com')
    })

    it('rejects strings without prefix', () => {
      const schema = string().startsWith('http://')
      const [error] = schema.safeParseUnknown('https://example.com')
      expect((error as any)?._schema.code).toBe('string.startsWith')
    })
  })

  describe('endsWith', () => {
    it('accepts strings with suffix', () => {
      const schema = string().endsWith('.com')
      expect(schema.parse('example.com')).toBe('example.com')
    })

    it('rejects strings without suffix', () => {
      const schema = string().endsWith('.com')
      const [error] = schema.safeParseUnknown('example.org')
      expect((error as any)?._schema.code).toBe('string.endsWith')
    })
  })

  describe('transformations', () => {
    it('trim() trims whitespace', () => {
      const schema = string().trim()
      expect(schema.parse('  hello  ')).toBe('hello')
    })

    it('lowercase() converts to lower case', () => {
      const schema = string().lowercase()
      expect(schema.parse('HELLO')).toBe('hello')
    })

    it('uppercase() converts to upper case', () => {
      const schema = string().uppercase()
      expect(schema.parse('hello')).toBe('HELLO')
    })

    it('combines transformations', () => {
      const schema = string().trim().uppercase()
      expect(schema.parse('  hello  ')).toBe('HELLO')
    })
  })

  describe('custom', () => {
    it('supports custom validators', () => {
      const schema = string().custom(val => val === 'foo', 'string.foo')

      expect(schema.parse('foo')).toBe('foo')

      const [error] = schema.safeParseUnknown('bar')
      expect((error as any)?._schema.code).toBe('string.foo')
    })
  })

  describe('configuration', () => {
    it('allows overriding messages', () => {
      configure({
        messages: {
          string: {
            min: 'Too short!'
          }
        }
      })

      const schema = string().min(5)
      const [error] = schema.safeParseUnknown('abc')
      expect(error).toMatchObject({
        _schema: {
          code: 'string.min',
          message: 'Too short!'
        }
      })
    })
  })
})
