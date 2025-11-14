import { describe, it, expect, beforeEach, afterEach, jest } from "bun:test"
import { get_current_date_and_time } from "../tool/horology"
import horology from "../tool/horology"

describe("Horology Tool Tests", () => {
  describe("get_current_date_and_time", () => {
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

    const createMockDate = (
      year: number,
      month: number, // 0-based (0 = January)
      day: number,
      hours: number,
      minutes: number,
      seconds: number,
      milliseconds: number = 0
    ) => {
      const mockDateInstance = {
        getDay: jest.fn().mockReturnValue(new originalDate(year, month, day).getDay()),
        getDate: jest.fn().mockReturnValue(day),
        getMonth: jest.fn().mockReturnValue(month),
        getFullYear: jest.fn().mockReturnValue(year),
        getHours: jest.fn().mockReturnValue(hours),
        getMinutes: jest.fn().mockReturnValue(minutes),
        getSeconds: jest.fn().mockReturnValue(seconds),
        getMilliseconds: jest.fn().mockReturnValue(milliseconds),
        getTimezoneOffset: jest.fn().mockReturnValue(0)
      }
      mockDate.mockReturnValue(mockDateInstance)
      return mockDateInstance
    }

    describe("Midnight (12:00:00 AM)", () => {
      it("should format midnight correctly", () => {
        // January 1, 2024 at midnight (Sunday)
        createMockDate(2024, 0, 1, 0, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Monday the 1st of January, 2024 at 12:00:00.00 AM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle midnight with milliseconds", () => {
        // March 15, 2024 at midnight with 567ms (Friday)
        createMockDate(2024, 2, 15, 0, 0, 0, 567)
        const result = get_current_date_and_time()
        expect(result).toContain("Friday the 15th of March, 2024 at 12:00:00.56 AM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })
    })

    describe("Noon (12:00:00 PM)", () => {
      it("should format noon correctly", () => {
        // July 4, 2024 at noon (Thursday)
        createMockDate(2024, 6, 4, 12, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Thursday the 4th of July, 2024 at 12:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle noon with milliseconds", () => {
        // December 25, 2024 at noon with 123ms (Wednesday)
        createMockDate(2024, 11, 25, 12, 0, 0, 123)
        const result = get_current_date_and_time()
        expect(result).toContain("Wednesday the 25th of December, 2024 at 12:00:00.12 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })
    })

    describe("Various AM times", () => {
      it("should format 1:30:45 AM correctly", () => {
        // February 29, 2024 at 1:30:45 AM (Thursday - leap year)
        createMockDate(2024, 1, 29, 1, 30, 45, 890)
        const result = get_current_date_and_time()
        expect(result).toContain("Thursday the 29th of February, 2024 at 1:30:45.89 AM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should format 11:59:59 AM correctly", () => {
        // September 22, 2024 at 11:59:59 AM (Sunday)
        createMockDate(2024, 8, 22, 11, 59, 59, 999)
        const result = get_current_date_and_time()
        expect(result).toContain("Sunday the 22nd of September, 2024 at 11:59:59.99 AM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle single digit hours in AM", () => {
        // May 3, 2024 at 5:07:08 AM (Friday)
        createMockDate(2024, 4, 3, 5, 7, 8, 456)
        const result = get_current_date_and_time()
        expect(result).toContain("Friday the 3rd of May, 2024 at 5:07:08.45 AM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })
    })

    describe("Various PM times", () => {
      it("should format 1:15:30 PM correctly", () => {
        // June 21, 2024 at 1:15:30 PM (Friday)
        createMockDate(2024, 5, 21, 13, 15, 30, 234)
        const result = get_current_date_and_time()
        expect(result).toContain("Friday the 21st of June, 2024 at 1:15:30.23 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should format 11:45:15 PM correctly", () => {
        // October 31, 2024 at 11:45:15 PM (Thursday)
        createMockDate(2024, 9, 31, 23, 45, 15, 678)
        const result = get_current_date_and_time()
        expect(result).toContain("Thursday the 31st of October, 2024 at 11:45:15.67 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle afternoon single digit hours", () => {
        // August 8, 2024 at 3:33:33 PM (Thursday)
        createMockDate(2024, 7, 8, 15, 33, 33, 333)
        const result = get_current_date_and_time()
        expect(result).toContain("Thursday the 8th of August, 2024 at 3:33:33.33 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })
    })

    describe("Different days with ordinal suffixes", () => {
      it("should handle 1st correctly", () => {
        // April 1, 2024 at 2:00:00 PM (Monday)
        createMockDate(2024, 3, 1, 14, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Monday the 1st of April, 2024 at 2:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle 2nd correctly", () => {
        // November 2, 2024 at 3:00:00 PM (Saturday)
        createMockDate(2024, 10, 2, 15, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Saturday the 2nd of November, 2024 at 3:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle 3rd correctly", () => {
        // January 3, 2025 at 4:00:00 PM (Friday)
        createMockDate(2025, 0, 3, 16, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Friday the 3rd of January, 2025 at 4:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle 11th correctly", () => {
        // February 11, 2024 at 5:00:00 PM (Sunday)
        createMockDate(2024, 1, 11, 17, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Sunday the 11th of February, 2024 at 5:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle 21st correctly", () => {
        // March 21, 2024 at 6:00:00 PM (Thursday)
        createMockDate(2024, 2, 21, 18, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Thursday the 21st of March, 2024 at 6:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle 22nd correctly", () => {
        // April 22, 2024 at 7:00:00 PM (Monday)
        createMockDate(2024, 3, 22, 19, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Monday the 22nd of April, 2024 at 7:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle 23rd correctly", () => {
        // May 23, 2024 at 8:00:00 PM (Thursday)
        createMockDate(2024, 4, 23, 20, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("Thursday the 23rd of May, 2024 at 8:00:00.00 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })
    })

    describe("Different months and years", () => {
      const monthTests = [
        { month: 0, name: "January" },
        { month: 1, name: "February" },
        { month: 2, name: "March" },
        { month: 3, name: "April" },
        { month: 4, name: "May" },
        { month: 5, name: "June" },
        { month: 6, name: "July" },
        { month: 7, name: "August" },
        { month: 8, name: "September" },
        { month: 9, name: "October" },
        { month: 10, name: "November" },
        { month: 11, name: "December" }
      ]

      monthTests.forEach(({ month, name }) => {
        it(`should format ${name} correctly`, () => {
          createMockDate(2024, month, 15, 12, 0, 0, 0)
          const result = get_current_date_and_time()
          expect(result).toContain(`of ${name}, 2024`)
        })
      })

      it("should handle different years correctly", () => {
        createMockDate(2023, 0, 1, 12, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain("2023")

        createMockDate(2025, 0, 1, 12, 0, 0, 0)
        const result2 = get_current_date_and_time()
        expect(result2).toContain("2025")
      })
    })

    describe("Hundredths of seconds formatting", () => {
      it("should format single digit hundredths with leading zero", () => {
        // 50ms = 5 hundredths = "05"
        createMockDate(2024, 0, 1, 12, 0, 0, 50)
        const result = get_current_date_and_time()
        expect(result).toContain(".05 PM")
      })

      it("should format double digit hundredths correctly", () => {
        // 567ms = 56 hundredths = "56"
        createMockDate(2024, 0, 1, 12, 0, 0, 567)
        const result = get_current_date_and_time()
        expect(result).toContain(".56 PM")
      })

      it("should handle zero milliseconds", () => {
        // 0ms = 0 hundredths = "00"
        createMockDate(2024, 0, 1, 12, 0, 0, 0)
        const result = get_current_date_and_time()
        expect(result).toContain(".00 PM")
      })

      it("should handle max hundredths (999ms)", () => {
        // 999ms = 99 hundredths = "99"
        createMockDate(2024, 0, 1, 12, 0, 0, 999)
        const result = get_current_date_and_time()
        expect(result).toContain(".99 PM")
      })

      it("should truncate hundredths correctly", () => {
        // 123ms = 12 hundredths = "12"
        createMockDate(2024, 0, 1, 12, 0, 0, 123)
        const result = get_current_date_and_time()
        expect(result).toContain(".12 PM")
      })
    })

    describe("Complete format verification", () => {
      it("should match exact format specification", () => {
        // Wednesday, January 17th, 2024 at 3:45:23.78 PM
        createMockDate(2024, 0, 17, 15, 45, 23, 789)
        const result = get_current_date_and_time()
        expect(result).toContain("Wednesday the 17th of January, 2024 at 3:45:23.78 PM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })

      it("should handle all format components together", () => {
        // Saturday, December 2nd, 2023 at 9:05:07.04 AM
        createMockDate(2023, 11, 2, 9, 5, 7, 45)
        const result = get_current_date_and_time()
        expect(result).toContain("Saturday the 2nd of December, 2023 at 9:05:07.04 AM")
        expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
      })
    })
  })

  describe("Main tool export", () => {
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

    it("should return a properly formatted string", async () => {
      // Mock a specific date/time
      const mockDateInstance = {
        getDay: jest.fn().mockReturnValue(1), // Monday
        getDate: jest.fn().mockReturnValue(15),
        getMonth: jest.fn().mockReturnValue(5), // June
        getFullYear: jest.fn().mockReturnValue(2024),
        getHours: jest.fn().mockReturnValue(14), // 2 PM
        getMinutes: jest.fn().mockReturnValue(30),
        getSeconds: jest.fn().mockReturnValue(45),
        getMilliseconds: jest.fn().mockReturnValue(678),
        getTimezoneOffset: jest.fn().mockReturnValue(0)
      }
      mockDate.mockReturnValue(mockDateInstance)

      const result = await horology.execute({}, {} as any)
      expect(typeof result).toBe("string")
      expect(result).toContain("Monday the 15th of June, 2024 at 2:30:45.67 PM")
      expect(result).toMatch(/UTC[+-]\d{2}:\d{2}/)
    })

    it("should handle errors gracefully", async () => {
      // Mock Date constructor to throw an error
      mockDate.mockImplementation(() => {
        throw new Error("Date creation failed")
      })

      const result = await horology.execute({}, {} as any)
      expect(typeof result).toBe("string")
      expect(result).toContain("Error getting current date and time:")
      expect(result).toContain("Date creation failed")
    })

    it("should handle non-Error objects in catch block", async () => {
      // Mock Date constructor to throw a non-Error object
      mockDate.mockImplementation(() => {
        throw "String error"
      })

      const result = await horology.execute({}, {} as any)
      expect(typeof result).toBe("string")
      expect(result).toBe("Error getting current date and time: String error")
    })

    it("should have correct tool description", () => {
      expect(horology.description).toBe("Get the current date and time in a formatted string")
    })

    it("should have no required arguments", () => {
      expect(horology.args).toEqual({})
    })
  })
})
