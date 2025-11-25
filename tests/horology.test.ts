import { describe, it, expect, beforeEach, afterEach, jest } from "bun:test"
import { get_current_date_and_time, is_leap_year } from "../tool/horology"
import horology from "../tool/horology"

// ... (rest of the file unchanged)

// Add leap year tests at the end

describe("is_leap_year", () => {
  let originalDate: typeof Date
  let mockDate: jest.Mock

  beforeEach(() => {
    originalDate = global.Date
    mockDate = jest.fn()
    global.Date = mockDate as any
  })

  afterEach(() => {
    global.Date = originalDate
  })

  const createMockDate = (year: number) => {
    const mockDateInstance = {
      getFullYear: jest.fn().mockReturnValue(year)
    }
    mockDate.mockReturnValue(mockDateInstance)
    return mockDateInstance
  }

  it("returns true for 2024 (leap year)", () => {
    createMockDate(2024)
    expect(is_leap_year()).toBe(true)
  })

  it("returns false for 2023 (not a leap year)", () => {
    createMockDate(2023)
    expect(is_leap_year()).toBe(false)
  })

  it("returns true for 2000 (divisible by 400)", () => {
    createMockDate(2000)
    expect(is_leap_year()).toBe(true)
  })

  it("returns false for 1900 (divisible by 100 but not 400)", () => {
    createMockDate(1900)
    expect(is_leap_year()).toBe(false)
  })

  it("returns true for 2400 (future leap year)", () => {
    createMockDate(2400)
    expect(is_leap_year()).toBe(true)
  })

  it("returns false for 2100 (future non-leap year)", () => {
    createMockDate(2100)
    expect(is_leap_year()).toBe(false)
  })
})
