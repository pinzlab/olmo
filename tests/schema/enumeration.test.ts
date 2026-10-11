import { beforeEach, describe, expect, it } from 'vitest'
import { configure, resetConfig } from '../../src/schema'
import { enumeration } from '../../src/schema/rules/Enum'

enum Role {
  Admin = 'admin',
  User = 'user'
}

enum Status {
  Pending = 1,
  Active = 2,
  Disabled = 3
}

describe('EnumerationSchema', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('runtime validation', () => {
    it('accepts values belonging to a string enumeration', () => {
      const schema = enumeration(Role)

      expect(schema.parse(Role.Admin)).toBe(Role.Admin)
      expect(schema.parse(Role.User)).toBe(Role.User)
    })

    it('accepts values belonging to a numeric enumeration', () => {
      const schema = enumeration(Status)

      expect(schema.parse(Status.Pending)).toBe(Status.Pending)
      expect(schema.parse(Status.Active)).toBe(Status.Active)
      expect(schema.parse(Status.Disabled)).toBe(Status.Disabled)
    })

    it('rejects values that do not belong to the enumeration', () => {
      const schema = enumeration(Role)

      const [error] = schema.safeParseUnknown('guest')

      expect(error).toMatchObject({
        _schema: {
          code: 'enumeration.invalid',
          message: 'Invalid enumeration value'
        }
      })
    })

    it('rejects values with an incompatible type', () => {
      const schema = enumeration(Role)

      expect(schema.safeParseUnknown(1)[0]).not.toBeNull()
      expect(schema.safeParseUnknown(true)[0]).not.toBeNull()
      expect(schema.safeParseUnknown(null)[0]).not.toBeNull()
    })
  })

  describe('custom', () => {
    it('supports custom validators', () => {
      const schema = enumeration(Role).custom(
        value => value === Role.Admin,
        'enumeration.adminOnly'
      )

      expect(schema.parse(Role.Admin)).toBe(Role.Admin)

      const [error] = schema.safeParseUnknown(Role.User)

      expect(error).toMatchObject({
        _schema: {
          code: 'enumeration.adminOnly'
        }
      })
    })
  })

  describe('configuration', () => {
    it('allows overriding the invalid message', () => {
      configure({
        messages: {
          enumeration: {
            invalid: 'Invalid role!'
          }
        }
      })

      const schema = enumeration(Role)
      const [error] = schema.safeParseUnknown('guest')

      expect(error).toMatchObject({
        _schema: {
          code: 'enumeration.invalid',
          message: 'Invalid role!'
        }
      })
    })
  })
})
