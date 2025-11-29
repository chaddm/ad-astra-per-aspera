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