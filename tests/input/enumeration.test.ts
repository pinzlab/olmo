import { describe, expect, it } from 'vitest'
import { DecodeError } from '../../src/base'
import { enumeration } from '../../src/input'

enum Role {
  Admin = 'admin',
  User = 'user'
}

enum Code {
  Pending = 1,
  Active = 2,
  Deleted = 3
}

enum Status {
  Active,
  Inactive
}

describe('enumeration', () => {
  describe('Role', () => {
    const f = enumeration(Role)

    it('has an empty string as zero value', () => {
      expect(f.zero()).toBe('')
    })

    it('decodes valid values', () => {
      expect(f.decode('admin')).toBe(Role.Admin)
      expect(f.decode('user')).toBe(Role.User)
    })

    it('decodes empty and missing values as zero value', () => {
      expect(f.decode('')).toBe('')
      expect(f.decode(undefined)).toBe('')
      expect(f.decode(null)).toBe('')
    })

    it('throws DecodeError for invalid values', () => {
      expect(() => f.decode('guest')).toThrow(DecodeError)
      expect(() => f.decode(99)).toThrow(DecodeError)
      expect(() => f.decode({})).toThrow(DecodeError)
    })
  })

  describe('Code', () => {
    const f = enumeration(Code)

    it('has an empty string as zero value', () => {
      expect(f.zero()).toBe('')
    })

    it('decodes valid numeric values', () => {
      expect(f.decode(Code.Pending)).toBe(Code.Pending)
      expect(f.decode(Code.Active)).toBe(Code.Active)
      expect(f.decode(Code.Deleted)).toBe(Code.Deleted)
    })

    it('coerces string numbers to numeric values', () => {
      expect(f.decode('1')).toBe(Code.Pending)
      expect(f.decode('2')).toBe(Code.Active)
      expect(f.decode('3')).toBe(Code.Deleted)
    })

    it('decodes empty and missing values as zero value', () => {
      expect(f.decode('')).toBe('')
      expect(f.decode(undefined)).toBe('')
      expect(f.decode(null)).toBe('')
    })

    it('throws DecodeError for invalid values', () => {
      expect(() => f.decode(99)).toThrow(DecodeError)
      expect(() => f.decode('99')).toThrow(DecodeError)
      expect(() => f.decode('invalid')).toThrow(DecodeError)
      expect(() => f.decode({})).toThrow(DecodeError)
    })
  })

  describe('Status', () => {
    const f = enumeration(Status)

    it('has an empty string as zero value', () => {
      expect(f.zero()).toBe('')
    })

    it('decodes valid numeric values', () => {
      expect(f.decode(Status.Active)).toBe(Status.Active)
      expect(f.decode(Status.Inactive)).toBe(Status.Inactive)
    })

    it('coerces string numbers to numeric values', () => {
      expect(f.decode('0')).toBe(Status.Active)
      expect(f.decode('1')).toBe(Status.Inactive)
    })

    it('decodes empty and missing values as zero value', () => {
      expect(f.decode('')).toBe('')
      expect(f.decode(undefined)).toBe('')
      expect(f.decode(null)).toBe('')
    })

    it('throws DecodeError for invalid values', () => {
      expect(() => f.decode(99)).toThrow(DecodeError)
      expect(() => f.decode('99')).toThrow(DecodeError)
      expect(() => f.decode('invalid')).toThrow(DecodeError)
      expect(() => f.decode({})).toThrow(DecodeError)
    })
  })
})
