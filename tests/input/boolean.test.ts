import { describe, expect, it } from 'vitest'
import { DecodeError } from '../../src/base'
import { boolean } from '../../src/input'

describe('boolean', () => {
  it('returns false as its zero value', () => {
    expect(boolean().zero()).toBe(false)
  })

  it('decodes booleans', () => {
    expect(boolean().decode(true)).toBe(true)
    expect(boolean().decode(false)).toBe(false)
  })

  it('decodes true form representations', () => {
    expect(boolean().decode('on')).toBe(true)
    expect(boolean().decode('true')).toBe(true)
    expect(boolean().decode('1')).toBe(true)
  })

  it('decodes false form representations', () => {
    expect(boolean().decode('off')).toBe(false)
    expect(boolean().decode('false')).toBe(false)
    expect(boolean().decode('0')).toBe(false)
  })

  it('decodes missing input as false', () => {
    expect(boolean().decode(undefined)).toBe(false)
  })

  it('rejects unknown strings', () => {
    for (const value of ['yes', 'no', 'maybe', 'foobar']) {
      expect(() => boolean().decode(value)).toThrow(DecodeError)
    }
  })

  it('rejects numbers', () => {
    expect(() => boolean().decode(1)).toThrow(DecodeError)
    expect(() => boolean().decode(0)).toThrow(DecodeError)
  })

  it('rejects objects', () => {
    expect(() => boolean().decode({ value: true })).toThrow(DecodeError)
  })

  it('rejects arrays', () => {
    expect(() => boolean().decode([true])).toThrow(DecodeError)
  })
})
