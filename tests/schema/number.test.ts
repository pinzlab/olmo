import { describe, expect, it, beforeEach } from 'vitest'
import { resetConfig, configure } from '../../src/schema'
import { number } from '../../src/schema/rules/Number'

describe('NumberSchema', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('runtime validation', () => {
    it('defensively verifies value is a number', () => {
      const schema = number()

      const [error] = schema.safeParseUnknown('123')
      expect((error as any)?._schema.code).toBe('number.invalid')
      expect((error as any)?._schema.message).toBe('Invalid number')
    })
  })

  describe('required', () => {
    it('accepts non-empty numbers', () => {
      const schema = number().required()

      expect(schema.parse(1)).toBe(1)
    })

    it('rejects empty numbers', () => {
      const schema = number().required()
      const [error] = schema.safeParseUnknown(0)
      expect(error).toMatchObject({
        _schema: {
          code: 'number.required',
          message: 'This field is required'
        }
      })
    })
  })

  describe('min', () => {
    it('accepts values greater than or equal to min', () => {
      const schema = number().min(5)
      expect(schema.parse(5)).toBe(5)
      expect(schema.parse(10)).toBe(10)
    })

    it('rejects values less than min', () => {
      const schema = number().min(5)
      const [error] = schema.safeParseUnknown(4)
      expect((error as any)?._schema.code).toBe('number.min')
      expect((error as any)?._schema.message).toBe('Must be greater than or equal to 5')
    })
  })

  describe('max', () => {
    it('accepts values less than or equal to max', () => {
      const schema = number().max(10)
      expect(schema.parse(5)).toBe(5)
      expect(schema.parse(10)).toBe(10)
    })

    it('rejects values greater than max', () => {
      const schema = number().max(10)
      const [error] = schema.safeParseUnknown(11)
      expect((error as any)?._schema.code).toBe('number.max')
      expect((error as any)?._schema.message).toBe('Must be less than or equal to 10')
    })
  })

  describe('integer', () => {
    it('accepts integers', () => {
      const schema = number().integer()
      expect(schema.parse(5)).toBe(5)
      expect(schema.parse(0)).toBe(0)
    })

    it('rejects floats', () => {
      const schema = number().integer()
      const [error] = schema.safeParseUnknown(5.5)
      expect((error as any)?._schema.code).toBe('number.integer')
    })
  })

  describe('positive', () => {
    it('accepts positive numbers', () => {
      const schema = number().positive()
      expect(schema.parse(1)).toBe(1)
    })

    it('rejects zero and negative numbers', () => {
      const schema = number().positive()
      expect(schema.safeParseUnknown(0)[0]).not.toBeNull()
      expect(schema.safeParseUnknown(-1)[0]).not.toBeNull()
    })
  })

  describe('negative', () => {
    it('accepts negative numbers', () => {
      const schema = number().negative()
      expect(schema.parse(-1)).toBe(-1)
    })

    it('rejects zero and positive numbers', () => {
      const schema = number().negative()
      expect(schema.safeParseUnknown(0)[0]).not.toBeNull()
      expect(schema.safeParseUnknown(1)[0]).not.toBeNull()
    })
  })

  describe('nonnegative', () => {
    it('accepts zero and positive numbers', () => {
      const schema = number().nonnegative()
      expect(schema.parse(0)).toBe(0)
      expect(schema.parse(1)).toBe(1)
    })

    it('rejects negative numbers', () => {
      const schema = number().nonnegative()
      expect(schema.safeParseUnknown(-1)[0]).not.toBeNull()
    })
  })

  describe('nonpositive', () => {
    it('accepts zero and negative numbers', () => {
      const schema = number().nonpositive()
      expect(schema.parse(0)).toBe(0)
      expect(schema.parse(-1)).toBe(-1)
    })

    it('rejects positive numbers', () => {
      const schema = number().nonpositive()
      expect(schema.safeParseUnknown(1)[0]).not.toBeNull()
    })
  })

  describe('finite', () => {
    it('accepts finite numbers', () => {
      const schema = number().finite()
      expect(schema.parse(10)).toBe(10)
    })

    it('rejects infinity', () => {
      const schema = number().finite()
      expect(schema.safeParseUnknown(Infinity)[0]).not.toBeNull()
      expect(schema.safeParseUnknown(-Infinity)[0]).not.toBeNull()
    })
  })

  describe('safe', () => {
    it('accepts safe integers', () => {
      const schema = number().safe()
      expect(schema.parse(10)).toBe(10)
      expect(schema.parse(Number.MAX_SAFE_INTEGER)).toBe(Number.MAX_SAFE_INTEGER)
    })

    it('rejects unsafe numbers', () => {
      const schema = number().safe()
      expect(schema.safeParseUnknown(Number.MAX_SAFE_INTEGER + 1)[0]).not.toBeNull()
    })
  })

  describe('custom', () => {
    it('supports custom validators', () => {
      const schema = number().custom(val => val % 2 === 0, 'number.even')

      expect(schema.parse(2)).toBe(2)

      const [error] = schema.safeParseUnknown(3)
      expect((error as any)?._schema.code).toBe('number.even')
    })
  })

  describe('configuration', () => {
    it('allows overriding messages', () => {
      configure({
        messages: {
          number: {
            min: 'Too small!'
          }
        }
      })

      const schema = number().min(5)
      const [error] = schema.safeParseUnknown(1)
      expect(error).toMatchObject({
        _schema: {
          code: 'number.min',
          message: 'Too small!'
        }
      })
    })
  })
})
