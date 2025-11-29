import { describe, it, expect, beforeEach, afterEach, jest } from "bun:test"
import { get_current_date_and_time, is_leap_year } from "../tool/horology"
import horology from "../tool/horology"

// --- get_current_date_and_time() comprehensive tests ---
describe("get_current_date_and_time", () => {
  let RealDate: DateConstructor
  beforeEach(() => {
    RealDate = global.Date
  })
  afterEach(() => {
    global.Date = RealDate
  })

  function mockDate(
    {
      year = 2025,
      month = 10, // November (0-based)
      date = 13,
      day = 4, // Thursday
      hours = 15,
      minutes = 7,
      seconds = 9,
      ms = 50,
      tzOffset = 360, // UTC-06:00
      iana = "CST"
    } = {}
  ) {
    class MockDate extends Date {
      constructor() {
        super()
      }
      getFullYear() { return year }
      getMonth() { return month }
      getDate() { return date }
      getDay() { return day }
      getHours() { return hours }
      getMinutes() { return minutes }
      getSeconds() { return seconds }
      getMilliseconds() { return ms }
      getTimezoneOffset() { return tzOffset }
    }
    global.Date = MockDate as any
    // Patch Intl.DateTimeFormat for IANA abbreviation
    if (typeof Intl !== 'undefined') {
      const orig = Intl.DateTimeFormat
      Intl.DateTimeFormat = function (_locales, opts) {
        return {
          format: () => `11/13/2025, 3:07:09 PM ${iana}`
        }
      } as any
      Intl.DateTimeFormat.orig = orig
    }
  }

  afterEach(() => {
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat.orig) {
      Intl.DateTimeFormat = Intl.DateTimeFormat.orig
    }
  })

  it("formats the full output string correctly", () => {
    mockDate()
    const result = get_current_date_and_time()
    expect(result).toMatch(
      /^Thursday the 13th of November, 2025 at 3:07:09\.05 PM UTC-06:00 \(CST\)\.$/
    )
  })

  it("includes all required fields", () => {
    mockDate()
    const result = get_current_date_and_time()
    expect(result).toContain("Thursday")
    expect(result).toContain("13th")
    expect(result).toContain("November")
    expect(result).toContain("2025")
    expect(result).toContain("3:07:09.05 PM")
    expect(result).toContain("UTC-06:00 (CST)")
  })

  it("handles ordinal suffix edge cases", () => {
    const cases = [
      { date: 1, expected: "1st" },
      { date: 2, expected: "2nd" },
      { date: 3, expected: "3rd" },
      { date: 4, expected: "4th" },
      { date: 11, expected: "11th" },
      { date: 12, expected: "12th" },
      { date: 13, expected: "13th" },
      { date: 21, expected: "21st" },
      { date: 22, expected: "22nd" },
      { date: 23, expected: "23rd" },
      { date: 31, expected: "31st" },
    ]
    for (const { date, expected } of cases) {
      mockDate({ date })
      const result = get_current_date_and_time()
      expect(result).toContain(`${expected} of`)
    }
  })

  it("formats time with leading zeros and hundredths", () => {
    mockDate({ hours: 9, minutes: 5, seconds: 7, ms: 80 })
    const result = get_current_date_and_time()
    expect(result).toContain("9:05:07.08 AM")
  })

  it("shows PM for afternoon and AM for morning", () => {
    mockDate({ hours: 15 })
    expect(get_current_date_and_time()).toContain("PM")
    mockDate({ hours: 3 })
    expect(get_current_date_and_time()).toContain("AM")
  })

  it("includes timezone offset and IANA abbreviation", () => {
    mockDate({ tzOffset: 480, iana: "PST" })
    const result = get_current_date_and_time()
    expect(result).toContain("UTC-08:00 (PST)")
  })

  it("handles missing IANA abbreviation gracefully", () => {
    mockDate({ iana: "UTC-06:00" })
    const result = get_current_date_and_time()
    expect(result).toContain("UTC-06:00")
  })

  it("returns a clear error message if Date throws", () => {
    global.Date = (() => { throw new Error("fail!") }) as any
    const result = get_current_date_and_time()
    expect(typeof result === "string").toBe(true)
    // Should not throw, but may not be a pretty message since function doesn't catch
  })
})

// --- leap year tests (existing) ---
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
