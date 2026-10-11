import { describe, expect, it } from 'vitest'
import { defineObject, string, number, boolean, file as inputFile } from '../../src/input'
import { defineSchema } from '../../src/schema'
import * as schema from '../../src/schema'

describe('defineSchema', () => {
  it('validates a complete model', () => {
    const Company = defineObject({
      name: string(),
      branches: number(),
      active: boolean()
    })

    const CompanySchema = defineSchema({
      name: schema.string().trim().min(3),
      branches: schema.number().integer().min(1),
      active: schema.boolean()
    })

    const [payload, error] = CompanySchema.safeParse(
      Company.create({
        name: '  Acme  ',
        branches: 5,
        active: true
      })
    )

    expect(error).toBeNull()
    expect(payload).toEqual({
      name: 'Acme',
      branches: 5,
      active: true
    })
  })

  it('validates a model with partial schema definition', () => {
    const Company = defineObject({
      name: string(),
      branches: number(),
      active: boolean(),
      secret: string()
    })

    const CompanySchema = defineSchema({
      name: schema.string(),
      active: schema.boolean()
    })

    const [payload, error] = CompanySchema.safeParse(
      Company.create({
        name: 'Acme',
        branches: 10,
        active: true,
        secret: 'hidden'
      })
    )

    expect(error).toBeNull()
    expect(payload).toEqual({
      name: 'Acme',
      active: true
    })
  })

  it('returns errors for all invalid fields', () => {
    const Company = defineObject({
      name: string(),
      branches: number()
    })

    const CompanySchema = defineSchema({
      name: schema.string().min(5),
      branches: schema.number().min(10)
    })

    const [payload, error] = CompanySchema.safeParse(
      Company.create({
        name: 'Ac',
        branches: 2
      })
    )

    expect(payload).toBeNull()
    expect(error).toEqual({
      name: {
        code: 'string.min',
        message: 'Must contain at least 5 characters',
        value: 'Ac'
      },
      branches: {
        code: 'number.min',
        message: 'Must be greater than or equal to 10',
        value: 2
      }
    })
  })

  it('parses invalid models and throws the validation error', () => {
    const Company = defineObject({
      name: string()
    })

    const CompanySchema = defineSchema({
      name: schema.string().min(3)
    })

    try {
      CompanySchema.parse(Company.create({ name: '' }))
      expect.fail('Should have thrown ValidationError')
    } catch (e: any) {
      expect(e.name).toBeDefined()
      expect(e.name.code).toBe('string.min')
    }
  })

  it('supports asynchronous file validation in ObjectSchema', async () => {
    const Document = defineObject({
      file: inputFile()
    })

    const DocumentSchema = defineSchema({
      file: schema.file().custom(async value => {
        // Simula una validación asíncrona externa.
        await Promise.resolve()

        return value.name.endsWith('.pdf')
      }, 'file.pdf')
    })

    const validDocument = Document.create({
      file: new File(['content'], 'document.pdf', {
        type: 'application/pdf'
      })
    })

    const invalidDocument = Document.create({
      file: new File(['content'], 'document.txt', {
        type: 'text/plain'
      })
    })

    await expect(DocumentSchema.parseAsync(validDocument)).resolves.toEqual({
      file: validDocument.file
    })

    const [payload, error] = await DocumentSchema.safeParseAsync(invalidDocument)

    expect(payload).toBeNull()
    expect(error).toEqual({
      file: {
        code: 'file.pdf',
        message: 'file.pdf',
        value: invalidDocument.file
      }
    })
  })
})
