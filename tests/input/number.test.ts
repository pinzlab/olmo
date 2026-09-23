import { describe, expect, it } from 'vitest'
import { DecodeError } from '../../src/base'
import { number } from '../../src/input'

describe('number', () => {
  it('returns zero as its zero value', () => {
    expect(number().zero()).toBe(0)
  })

  it('decodes an empty string as zero', () => {
    expect(number().decode('')).toBe(0)
  })

  it('decodes missing input as zero', () => {
    expect(number().decode(undefined)).toBe(0)
  })

  it('decodes numeric strings', () => {
    expect(number().decode('25')).toBe(25)
    expect(number().decode('25.5')).toBe(25.5)
  })

  it('decodes already typed finite numbers', () => {
    expect(number().decode(25)).toBe(25)
    expect(number().decode(-25.5)).toBe(-25.5)
  })

  it('rejects null', () => {
    expect(() => number().decode(null)).toThrow(DecodeError)
  })

  it('rejects invalid numeric strings', () => {
    expect(() => number().decode('hello')).toThrow(DecodeError)
  })

  it('rejects NaN', () => {
    expect(() => number().decode(Number.NaN)).toThrow(DecodeError)
  })

  it('rejects positive infinity', () => {
    expect(() => number().decode(Number.POSITIVE_INFINITY)).toThrow(DecodeError)
  })

  it('rejects negative infinity', () => {
    expect(() => number().decode(Number.NEGATIVE_INFINITY)).toThrow(DecodeError)
  })

  it('rejects booleans', () => {
    expect(() => number().decode(true)).toThrow(DecodeError)
  })

  it('rejects objects', () => {
    expect(() => number().decode({ value: 25 })).toThrow(DecodeError)
  })

  it('rejects arrays', () => {
    expect(() => number().decode([25])).toThrow(DecodeError)
  })
})
