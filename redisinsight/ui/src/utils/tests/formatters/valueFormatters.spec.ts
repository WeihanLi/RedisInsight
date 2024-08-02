import { encode } from 'msgpackr'
import { serialize } from 'php-serialize'
import { KeyValueFormat } from 'uiSrc/constants'
import { anyToBuffer, bufferToSerializedFormat, formattingBuffer, stringToBuffer, stringToSerializedBufferFormat } from 'uiSrc/utils'

describe('bufferToSerializedFormat', () => {
  describe(KeyValueFormat.JSON, () => {
    describe('should properly serialize', () => {
      const testValues = [{}, '""', 1, true, { a: { b: [1, 2, '3'] } }].map((v) => JSON.stringify(v))

      test.each(testValues)('test %j', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.JSON, stringToBuffer(val))).toEqual(val)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.JSON, stringToBuffer(val))).toEqual(val)
      })
    })
  })

  describe(KeyValueFormat.Vector32Bit, () => {
    describe('should properly serialize', () => {
      const testValues = [new Float32Array([1.0, 2.0]), new Float32Array([12.12, 13.41])].map((v) => ({
        input: anyToBuffer(v.buffer),
        expected: JSON.stringify(v),
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(JSON.stringify(bufferToSerializedFormat(KeyValueFormat.Vector32Bit, input))).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = [new Float32Array(['test'])].map((v) => ({
        input: anyToBuffer(v.buffer),
        expected: JSON.stringify(v),
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(JSON.stringify(bufferToSerializedFormat(KeyValueFormat.Vector32Bit, input))).toEqual(expected)
      })
    })
  })

  describe(KeyValueFormat.Vector64Bit, () => {
    describe('should properly serialize', () => {
      const testValues = [new Float64Array([1.0, 2.0]), new Float64Array([12.12, 13.41])].map((v) => ({
        input: anyToBuffer(v.buffer),
        expected: JSON.stringify(v),
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(JSON.stringify(bufferToSerializedFormat(KeyValueFormat.Vector64Bit, input))).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = [new Float64Array(['test'])].map((v) => ({
        input: anyToBuffer(v.buffer),
        expected: JSON.stringify(v),
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(JSON.stringify(bufferToSerializedFormat(KeyValueFormat.Vector64Bit, input))).toEqual(expected)
      })
    })
  })

  describe(KeyValueFormat.Msgpack, () => {
    describe('should properly serialize', () => {
      const testValues = [{}, '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: anyToBuffer(encode(v)),
        expected: JSON.stringify(v)
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(bufferToSerializedFormat(KeyValueFormat.Msgpack, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.Msgpack, stringToBuffer(val))).toEqual(val)
      })
    })
  })

  describe(KeyValueFormat.PHP, () => {
    describe('should properly serialize', () => {
      const testValues = [[1], '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: stringToBuffer(serialize(v)),
        expected: JSON.stringify(v)
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(bufferToSerializedFormat(KeyValueFormat.PHP, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(bufferToSerializedFormat(KeyValueFormat.PHP, stringToBuffer(val))).toEqual(val)
      })
    })
  })
})

describe('stringToSerializedBufferFormat', () => {
  describe(KeyValueFormat.JSON, () => {
    describe('should properly unserialize', () => {
      const testValues = [{}, '""', 1, true, { a: { b: [1, 2, '3'] } }].map((v) => JSON.stringify(v))

      test.each(testValues)('test %j', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.JSON, val)).toEqual(stringToBuffer(val))
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.JSON, val)).toEqual(stringToBuffer(val))
      })
    })
  })

  describe(KeyValueFormat.Msgpack, () => {
    describe('should properly unserialize', () => {
      const testValues = [{}, '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: JSON.stringify(v),
        expected: anyToBuffer(encode(v))
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.Msgpack, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.Msgpack, val)).toEqual(stringToBuffer(val))
      })
    })
  })

  describe(KeyValueFormat.PHP, () => {
    describe('should properly unserialize', () => {
      const testValues = [[1], '""', 6677, true, { a: { b: [1, 2, '3'] } }].map((v) => ({
        input: JSON.stringify(v),
        expected: stringToBuffer(serialize(v))
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.PHP, input)).toEqual(expected)
      })
    })

    describe('should properly return value with invalid values', () => {
      const testValues = ['1-', '[1, 2,]', '{ zx1***.[']

      test.each(testValues)('test json values', (val) => {
        expect(stringToSerializedBufferFormat(KeyValueFormat.PHP, val)).toEqual(stringToBuffer(val))
      })
    })
  })
})

describe('formattingBuffer', () => {
  describe(KeyValueFormat.DateTime, () => {
    describe('should properly format timestamp number', () => {
      // 1722593319805
      const testValues = [new Uint8Array([49, 55, 50, 50, 53, 57, 51, 51, 49, 57, 56, 48, 53])].map((v) => ({
        input: anyToBuffer(v),
        expected: { value: '12:08:39.805 2 Aug 2024', isValid: true },
      }))

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(formattingBuffer(input, KeyValueFormat.DateTime)).toEqual(expected)
      })
    })

    describe('should left iso strings and other strings as they are', () => {
      const testValues = [
        {
          input: anyToBuffer(new Uint8Array(
            [65, 110, 121, 32, 83, 116, 114, 105, 110, 103]
          )),
          expected: { value: 'Any String', isValid: false },
        },
        {
          input: anyToBuffer(new Uint8Array([
            50, 48, 50, 52, 45, 48, 56, 45,
            48, 50, 84, 48, 48, 58, 48, 48,
            58, 48, 48, 46, 48, 48, 48, 90
          ])),
          expected: { value: '2024-08-02T00:00:00.000Z', isValid: false }
        }
      ]

      test.each(testValues)('test %j', ({ input, expected }) => {
        expect(formattingBuffer(input, KeyValueFormat.DateTime)).toEqual(expected)
      })
    })
  })
})
