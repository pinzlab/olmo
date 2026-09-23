import { describe, expect, it } from 'vitest'
import { DecodeError } from '../../src/base'
import { file } from '../../src/input'

describe('file()', () => {
  const f = file()

  it('has empty File as zero value', () => {
    const zero = f.zero()
    expect(zero).toBeInstanceOf(File)
    expect(zero.name).toBe('')
    expect(zero.size).toBe(0)
  })

  it('decodes valid File objects natively', () => {
    const myFile = new File(['test'], 'test.txt')
    expect(f.decode(myFile)).toBe(myFile)
  })

  it('decodes missing values to empty File', () => {
    expect(f.decode(undefined)).toBeInstanceOf(File)
    expect(f.decode(null)).toBeInstanceOf(File)
    expect(f.decode('')).toBeInstanceOf(File)
  })

  it('throws DecodeError on non-File objects', () => {
    expect(() => f.decode({})).toThrow(DecodeError)
    expect(() => f.decode('just a string')).toThrow(DecodeError)
  })
})
