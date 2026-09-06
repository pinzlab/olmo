import { describe, it, expect } from 'vitest'
import { add, subtract } from '../src/math'

describe('math module', () => {
  it('should add two numbers correctly', () => {
    expect(add(2, 3)).toBe(5)
    expect(add(-1, 1)).toBe(0)
  })

  it('should subtract two numbers correctly', () => {
    expect(subtract(5, 2)).toBe(3)
    expect(subtract(10, 10)).toBe(0)
  })
})
