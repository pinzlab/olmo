import { describe, expect, it } from 'vitest'
import { DecodeError } from '../../src/base'
import { string } from '../../src/input'

describe('string', () => {
  it('returns an empty string as its zero value', () => {
    expect(string().zero()).toBe('')
  })

  it('decodes strings', () => {
    expect(string().decode('hello')).toBe('hello')
    expect(string().decode('')).toBe('')
  })

  it('decodes missing input as the zero value', () => {
    expect(string().decode(undefined)).toBe('')
  })

  it('rejects null', () => {
    expect(() => string().decode(null)).toThrow(DecodeError)
  })

  it('rejects numbers', () => {
    expect(() => string().decode(123)).toThrow(DecodeError)
  })

  it('rejects booleans', () => {
    expect(() => string().decode(true)).toThrow(DecodeError)
  })

  it('rejects objects', () => {
    expect(() => string().decode({ value: 'hello' })).toThrow(DecodeError)
  })

  it('rejects arrays', () => {
    expect(() => string().decode(['hello'])).toThrow(DecodeError)
  })
})
