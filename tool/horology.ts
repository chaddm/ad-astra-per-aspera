import { tool } from "@opencode-ai/plugin"

const getOrdinalSuffix = (day: number): string => {
  if (day >= 11 && day <= 13) {
    return 'th'
  }
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

export const is_leap_year = (): boolean => {
  const year = new Date().getFullYear();
  if (year % 4 !== 0) return false;
  if (year % 100 !== 0) return true;
  return year % 400 === 0;
}

export const get_current_date_and_time = (): string => {
  try {
    const now = new Date()

    // Days of the week
  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ]

  // Months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Get date components
  const dayOfWeek = daysOfWeek[now.getDay()]
  const day = now.getDate()
  const month = months[now.getMonth()]
  const year = now.getFullYear()

  // Get time components
  let hours = now.getHours()
  const minutes = now.getMinutes()
  const seconds = now.getSeconds()
  const milliseconds = now.getMilliseconds()

  // Convert to 12-hour format
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12 // Handle midnight and noon

  // Format time with leading zeros
  const formattedMinutes = minutes.toString().padStart(2, '0')
  const formattedSeconds = seconds.toString().padStart(2, '0')
  const hundredths = Math.floor(milliseconds / 10).toString().padStart(2, '0')

  // Build the formatted string
  const ordinalSuffix = getOrdinalSuffix(day)
  // Get timezone info
  const tzOffsetMin = now.getTimezoneOffset()
  const tzSign = tzOffsetMin <= 0 ? '+' : '-'
  const tzAbs = Math.abs(tzOffsetMin)
  const tzHours = Math.floor(tzAbs / 60)
  const tzMinutes = tzAbs % 60
  const tzString = `UTC${tzSign}${tzHours.toString().padStart(2, '0')}:${tzMinutes.toString().padStart(2, '0')}`
  // Try to get IANA timezone name if available
  let tzName = ''
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    try {
      tzName = Intl.DateTimeFormat(undefined, { timeZoneName: 'short' }).format(now).split(' ').pop() || ''
    } catch {}
  }
  const tzDisplay = tzName && tzName !== tzString ? `${tzString} (${tzName})` : tzString
  return `${dayOfWeek} the ${day}${ordinalSuffix} of ${month}, ${year} at ${hours}:${formattedMinutes}:${formattedSeconds}.${hundredths} ${ampm} ${tzDisplay}.`
  } catch (error) {
    return `Error getting current date and time: ${error instanceof Error ? error.message : String(error)}`
  }
}

/**
 * Get timezone information for a given date and timezone
 * @param date - The date object
 * @param timezone - IANA timezone identifier
 * @returns Object with offset string and abbreviation
 */
const getTimezoneInfo = (date: Date, timezone: string): { offset: string; abbreviation: string } => {
  try {
    // Get timezone abbreviation using Intl
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    })
    const parts = formatter.format(date).split(' ')
    const abbreviation = parts[parts.length - 1] || timezone

    // Calculate offset
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
    const offsetMinutes = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60)
    
    const sign = offsetMinutes >= 0 ? '+' : '-'
    const absMinutes = Math.abs(offsetMinutes)
    const hours = Math.floor(absMinutes / 60)
    const minutes = absMinutes % 60
    const offset = `UTC${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    return { offset, abbreviation }
  } catch (error) {
    return { offset: 'UTC+00:00', abbreviation: 'UTC' }
  }
}

/**
 * Get the current date and time in a specific timezone
 * @param timezone - IANA timezone identifier (e.g., "America/New_York", "Europe/London", "Asia/Tokyo")
 * @returns Formatted date/time string in the specified timezone
 */
export const get_time_in_timezone = (timezone: string): string => {
  // Guard clause for empty timezone
  if (!timezone || timezone.trim() === '') {
    return 'Error: Timezone identifier cannot be empty'
  }

  try {
    const now = new Date()

    // Validate timezone by attempting to use it
    let formatter: Intl.DateTimeFormat
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true
      })
    } catch (tzError) {
      return `Error: Invalid timezone identifier: ${timezone}`
    }

    // Get date/time components in the target timezone

    const parts = formatter.formatToParts(now)
    const getPart = (type: string): string => parts.find(p => p.type === type)?.value || '0'

    const year = parseInt(getPart('year'))
    const month = parseInt(getPart('month')) - 1
    const day = parseInt(getPart('day'))
    let hour = parseInt(getPart('hour'))
    const minute = parseInt(getPart('minute'))
    const second = parseInt(getPart('second'))
    const dayPeriod = getPart('dayPeriod')
    const milliseconds = now.getMilliseconds()

    // Months
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    // Get day of week in the target timezone
    const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'long'
    })
    const dayOfWeek = weekdayFormatter.format(now)
    const monthName = months[month]

    // Format time components
    const formattedMinutes = minute.toString().padStart(2, '0')
    const formattedSeconds = second.toString().padStart(2, '0')
    const hundredths = Math.floor(milliseconds / 10).toString().padStart(2, '0')

    // Get ordinal suffix
    const ordinalSuffix = getOrdinalSuffix(day)

    // Get timezone info
    const { offset, abbreviation } = getTimezoneInfo(now, timezone)
    const tzDisplay = abbreviation && abbreviation !== offset ? `${offset} (${abbreviation})` : offset

    return `${dayOfWeek} the ${day}${ordinalSuffix} of ${monthName}, ${year} at ${hour}:${formattedMinutes}:${formattedSeconds}.${hundredths} ${dayPeriod} ${tzDisplay}.`
  } catch (error) {
    return `Error getting time in timezone ${timezone}: ${error instanceof Error ? error.message : String(error)}`
  }
}

export const get_time_in_timezone_tool = tool({
  description: "Get the current date and time in a specific timezone",
  args: {
    timezone: tool.schema.string().describe("IANA timezone identifier (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')")
  },
  async execute(args, context) {
    return get_time_in_timezone(args.timezone)
  }
})

export default tool({
  description: "Get the current date and time in a formatted string",
  args: {
    // No arguments needed
  },
  async execute(args, context) {
    try {
      return get_current_date_and_time()
    } catch (error) {
      return `Error getting current date and time: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})
