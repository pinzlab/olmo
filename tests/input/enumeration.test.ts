import { describe, expect, it } from 'vitest'
import { DecodeError } from '../../src/base'
import { enumeration } from '../../src/input'

describe('enumeration', () => {
  const f = enumeration('admin', 'user')

  it('has an empty string as zero value', () => {
    expect(f.zero()).toBe('')
  })

  it('decodes valid strings correctly', () => {
    expect(f.decode('admin')).toBe('admin')
    expect(f.decode('user')).toBe('user')
  })

  it('decodes an empty string as zero value', () => {
    expect(f.decode('')).toBe('')
  })

  it('decodes missing values to zero value', () => {
    expect(f.decode(undefined)).toBe('')
    expect(f.decode(null)).toBe('')
  })

  it('coerces string numbers to numbers if expected', () => {
    const numEnum = enumeration(10, 20)

    expect(numEnum.decode('20')).toBe(20)
  })

  it('has an empty string as zero value for numeric enumerations', () => {
    const numEnum = enumeration(10, 20)

    expect(numEnum.zero()).toBe('')
    expect(numEnum.decode('')).toBe('')
    expect(numEnum.decode(undefined)).toBe('')
    expect(numEnum.decode(null)).toBe('')
  })

  it('throws DecodeError on invalid enum values', () => {
    expect(() => f.decode('guest')).toThrow(DecodeError)
    expect(() => f.decode(99)).toThrow(DecodeError)
    expect(() => f.decode({})).toThrow(DecodeError)
  })

  it('throws an Error during initialization if array is empty', () => {
    expect(() => enumeration()).toThrowError(
      'Enumeration must have at least one permitted value'
    )
  })
})
