import { describe, expect, it, beforeEach } from 'vitest'
import { configure, resetConfig, defineSchema } from '../../src/schema'
import { file as inputFile, defineObject } from '../../src/input'
import { file } from '../../src/schema/rules/File'
import { InferModel } from '../../src/base'

describe('FileSchema', () => {
  beforeEach(() => {
    resetConfig()
  })

  describe('configuration', () => {
    it('uses default messages', () => {
      const schema = file().minSize(1024)
      const validFile = new File([new Uint8Array(2048)], 'test.txt')
      const invalidFile = new File([new Uint8Array(512)], 'test.txt')

      expect(schema.parse(validFile)).toBe(validFile)

      const [error, payload] = schema.safeParseUnknown(invalidFile)
      expect(payload).toBeNull()
      expect(error).not.toBeNull()
      expect((error as any)?._schema.message).toBe('Must be at least 1024 bytes')
    })

    it('allows overriding specific messages', () => {
      configure({
        messages: {
          file: {
            minSize: 'Minimum boundary: {min} bytes',
            mimeType: 'Invalid MIME type'
          }
        }
      })

      const schema = file().minSize(1024)
      const invalidFile = new File([new Uint8Array(512)], 'test.txt')

      const [error] = schema.safeParseUnknown(invalidFile)
      expect((error as any)?._schema.message).toBe('Minimum boundary: 1024 bytes')
    })
  })

  describe('runtime validation', () => {
    it('defensively verifies value is a File', () => {
      const schema = file()

      // Should fail if we pass a plain object, string, or boolean
      expect(schema.safeParseUnknown('foo')[0]).not.toBeNull()
      expect(schema.safeParseUnknown({})[0]).not.toBeNull()
      expect(schema.safeParseUnknown(null)[0]).not.toBeNull()

      const [error] = schema.safeParseUnknown('image.png')
      expect((error as any)?._schema.code).toBe('file.invalid')
      expect((error as any)?._schema.message).toBe('Invalid file')
    })
  })
  describe('required', () => {
    it('accepts non-empty files', () => {
      const schema = file().required()
      const value = new File(['content'], 'document.txt', {
        type: 'text/plain'
      })

      expect(schema.parse(value)).toBe(value)
    })

    it('rejects empty files', () => {
      const schema = file().required()
      const value = schema.zero()

      const [error] = schema.safeParseUnknown(value)
      expect(error).toMatchObject({
        _schema: {
          code: 'file.required',
          message: 'This field is required'
        }
      })
    })
  })
  describe('minSize', () => {
    it('accepts files meeting or exceeding minimum size', () => {
      const schema = file().minSize(1024)

      expect(schema.parse(new File([new Uint8Array(2048)], 'test.txt'))).toBeInstanceOf(
        File
      )
      expect(schema.parse(new File([new Uint8Array(1024)], 'test.txt'))).toBeInstanceOf(
        File
      )
    })

    it('rejects files below minimum size', () => {
      const schema = file().minSize(1024)
      const [error] = schema.safeParseUnknown(
        new File([new Uint8Array(1023)], 'test.txt')
      )

      expect((error as any)?._schema.code).toBe('file.minSize')
      expect((error as any)?._schema.message).toBe('Must be at least 1024 bytes')
    })
  })

  describe('maxSize', () => {
    it('accepts files up to maximum size', () => {
      const schema = file().maxSize(1024)

      expect(schema.parse(new File([new Uint8Array(512)], 'test.txt'))).toBeInstanceOf(
        File
      )
      expect(schema.parse(new File([new Uint8Array(1024)], 'test.txt'))).toBeInstanceOf(
        File
      )
    })

    it('rejects files exceeding maximum size', () => {
      const schema = file().maxSize(1024)
      const [error] = schema.safeParseUnknown(
        new File([new Uint8Array(1025)], 'test.txt')
      )

      expect((error as any)?._schema.code).toBe('file.maxSize')
      expect((error as any)?._schema.message).toBe('Must be at most 1024 bytes')
    })
  })

  describe('mimeType', () => {
    it('accepts single valid mime type', () => {
      const schema = file().mimeType('image/png')
      expect(
        schema.parse(new File([], 'test.png', { type: 'image/png' }))
      ).toBeInstanceOf(File)
    })

    it('accepts from multiple valid mime types', () => {
      const schema = file().mimeType('image/png', 'image/jpeg')
      expect(
        schema.parse(new File([], 'test.jpg', { type: 'image/jpeg' }))
      ).toBeInstanceOf(File)
      expect(
        schema.parse(new File([], 'test.png', { type: 'image/png' }))
      ).toBeInstanceOf(File)
    })

    it('rejects unlisted mime types', () => {
      const schema = file().mimeType('image/png')
      const [error] = schema.safeParseUnknown(
        new File([], 'test.jpg', { type: 'image/jpeg' })
      )

      expect((error as any)?._schema.code).toBe('file.mimeType')
    })
  })

  describe('custom', () => {
    it('invokes custom validation logic on file domain value', () => {
      const schema = file().custom(f => f.name.endsWith('.pdf'), 'file.pdf')

      expect(schema.parse(new File([], 'resume.pdf'))).toBeInstanceOf(File)

      const [error] = schema.safeParseUnknown(new File([], 'resume.txt'))
      expect((error as any)?._schema.code).toBe('file.pdf')
    })
  })

  it('custom asynchronous', async () => {
    const schema = file().custom(async value => value.name.endsWith('.pdf'), 'file.pdf')

    const validFile = new File([], 'resume.pdf')
    const invalidFile = new File([], 'resume.txt')

    await expect(schema.parseAsync(validFile)).resolves.toBe(validFile)

    const [error, payload] = await schema.safeParseValueAsync(invalidFile)
    expect(payload).toBeNull()
    expect((error as any)?._schema.code).toBe('file.pdf')
  })

  describe('zero semantics', () => {
    it('nullable() converts zero file to null', () => {
      const schema = file().nullable()
      const zeroFile = inputFile().zero()

      const result = schema.parse(zeroFile)
      expect(result).toBeNull()
    })

    it('nullable() reserves real file', () => {
      const schema = file().nullable()
      const realFile = new File(['content'], 'hello.txt', { type: 'text/plain' })

      const result = schema.parse(realFile)
      expect(result).toBe(realFile)
    })

    it('ignoreZero() converts zero file to undefined', () => {
      const schema = file().ignoreZero()
      const zeroFile = inputFile().zero()

      const result = schema.parse(zeroFile)
      expect(result).toBeUndefined()
    })
  })

  describe('object integration', () => {
    // Type testing
    it('compiles with defineSchema correctly', () => {
      const Document = defineObject({
        file: inputFile()
      })

      type Document = InferModel<typeof Document>

      const DocumentSchema = defineSchema<Document>({
        file: file().maxSize(1024).mimeType('application/pdf')
      })

      const invalidDocument = Document.create({
        file: new File([new Uint8Array(2048)], 'large.pdf', { type: 'application/pdf' })
      })

      const [payload, error] = DocumentSchema.safeParse(invalidDocument)
      expect(payload).toBeNull()
      expect(error?.file?.code).toBe('file.maxSize')

      const validDocument = Document.create({
        file: new File([new Uint8Array(512)], 'small.pdf', { type: 'application/pdf' })
      })

      const validResult = DocumentSchema.parse(validDocument)
      expect((validResult.file as File).size).toBe(512)
    })
  })

  describe('configuration', () => {
    it('uses default messages', () => {
      const schema = file().minSize(1024)
      const validFile = new File([new Uint8Array(2048)], 'test.txt')
      const invalidFile = new File([new Uint8Array(512)], 'test.txt')

      expect(schema.parse(validFile)).toBe(validFile)

      const [error, payload] = schema.safeParseUnknown(invalidFile)
      expect(payload).toBeNull()
      expect(error).not.toBeNull()
      expect((error as any)?._schema.message).toBe('Must be at least 1024 bytes')
    })

    it('allows overriding specific messages', () => {
      configure({
        messages: {
          file: {
            minSize: 'Minimum boundary: {min} bytes',
            mimeType: 'Invalid MIME type'
          }
        }
      })

      const schema = file().minSize(1024)
      const invalidFile = new File([new Uint8Array(512)], 'test.txt')

      const [error] = schema.safeParseUnknown(invalidFile)

      expect((error as any)?._schema).toMatchObject({
        code: 'file.minSize',
        message: 'Minimum boundary: 1024 bytes'
      })
    })

    it('allows overriding a single message', () => {
      configure({
        messages: {
          file: {
            minSize: 'Too short!'
          }
        }
      })

      const schema = file().minSize(5)
      const invalidFile = new File([new Uint8Array(3)], 'test.txt')

      const [error] = schema.safeParseUnknown(invalidFile)

      expect(error).toMatchObject({
        _schema: {
          code: 'file.minSize',
          message: 'Too short!'
        }
      })
    })
  })
})
