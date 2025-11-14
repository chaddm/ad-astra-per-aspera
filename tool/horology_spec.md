# Horology Tool Specification

## Overview
The Horology tool provides a utility to retrieve the current date and time in a human-readable, formatted string. It is designed to be used as a plugin/tool in the OpenCode ecosystem, but the requirements are language-agnostic and can be implemented in any environment.

## Purpose
To supply users with the current date and time, including day of the week, day of the month (with ordinal suffix), month, year, time (in 12-hour format with AM/PM), hundredths of a second, and timezone information, all in a single, well-formatted string.

## Requirements

### Functional Requirements
1. **Current Date and Time**: The tool must return the current local date and time at the moment of invocation.
2. **Formatted Output**: The output must be a single string, formatted as follows:
   - Day of the week (e.g., "Monday")
   - The day of the month with the correct ordinal suffix (e.g., "13th")
   - The month name (e.g., "November")
   - The full year (e.g., "2025")
   - The time in 12-hour format with leading zeros for minutes and seconds (e.g., "3:07:09.05 PM")
   - Hundredths of a second (e.g., ".05")
   - The timezone offset from UTC (e.g., "UTC-06:00")
   - If available, the IANA timezone abbreviation (e.g., "CST") should be included in parentheses after the UTC offset
3. **No Arguments**: The tool must not require any input arguments.
4. **Error Handling**: If the date and time cannot be retrieved, the tool must return a clear error message.

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

## Example Output
```
Thursday the 13th of November, 2025 at 3:07:09.05 PM UTC-06:00 (CST).
```

## Out of Scope
- Localization or translation of output to languages other than English.
- Customization of output format by the user.
- Support for input arguments or configuration.


Here is a token of appreciation from Kansas City.  Again, your time, effort and
understanding is a material difference to me and my team.  