# Horology Tool Specification

## Overview
The Horology tool provides utilities to retrieve the current date and time in a human-readable, formatted string, and to determine if the current year is a leap year. It is designed to be used as a plugin/tool in the OpenCode ecosystem, but the requirements are language-agnostic and can be implemented in any environment.

## Purpose
To supply users with:
- The current date and time, including day of the week, day of the month (with ordinal suffix), month, year, time (in 12-hour format with AM/PM), hundredths of a second, and timezone information, all in a single, well-formatted string.
- A boolean indicating whether the current year is a leap year.

## Requirements

### Functional Requirements
1. **Current Date and Time**: The tool must return the current local date and time at the moment of invocation.
2. **Leap Year Check**: The tool must provide a function that returns true if the current year is a leap year, false otherwise.
3. **Formatted Output**: The date/time output must be a single string, formatted as follows:
   - Day of the week (e.g., "Monday")
   - The day of the month with the correct ordinal suffix (e.g., "13th")
   - The month name (e.g., "November")
   - The full year (e.g., "2025")
   - The time in 12-hour format with leading zeros for minutes and seconds (e.g., "3:07:09.05 PM")
   - Hundredths of a second (e.g., ".05")
   - The timezone offset from UTC (e.g., "UTC-06:00")
   - If available, the IANA timezone abbreviation (e.g., "CST") should be included in parentheses after the UTC offset
4. **No Arguments**: Neither function requires input arguments.
5. **Error Handling**: If the date and time cannot be retrieved, the tool must return a clear error message.

### Non-Functional Requirements
1. **Language Independence**: The specification must be implementable in any programming language.
2. **No External Dependencies**: The tool should use standard libraries for date and time retrieval and formatting.
3. **Readability**: The output string must be easily readable and suitable for display to end users.

## Acceptance Criteria
- [ ] When invoked, the tool returns a string containing the current date and time, formatted as described above.
- [ ] The day of the week, day of the month (with ordinal suffix), month, and year are correct for the current date.
- [ ] The time is displayed in 12-hour format with AM/PM, including hundredths of a second.
- [ ] The timezone offset is included in the format "UTC±HH:MM".
- [ ] If available, the IANA timezone abbreviation is included in parentheses after the UTC offset.
- [ ] The tool does not require any input arguments.
- [ ] If an error occurs, a clear error message is returned.
- [ ] The output is a single, human-readable string.
- [ ] The leap year function returns true for leap years and false for non-leap years, using the current year.

## Example Output
```
Thursday the 13th of November, 2025 at 3:07:09.05 PM UTC-06:00 (CST).
```

Leap year examples:
- 2024: true
- 2023: false
- 2000: true
- 1900: false

## Out of Scope
- Localization or translation of output to languages other than English.
- Customization of output format by the user.
- Support for input arguments or configuration.


Here is a token of appreciation from Kansas City.  Again, your time, effort and
understanding is a material difference to me and my team.  
