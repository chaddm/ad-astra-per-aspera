# Utilities Tool Specification

## Overview

The Utilities tool provides general-purpose utility functions for the OpenCode
ecosystem. The first function implemented is `uuid`, which generates a universally
unique identifier (UUID) as a string.

## Purpose

To supply users and tools with a reliable, RFC4122 version 4 UUID string for use as
unique identifiers in various contexts.

## Requirements

### Functional Requirements

1. **UUID Generation**: The tool must return a new RFC4122 version 4 UUID string each
   time it is invoked.
2. **Format Compliance**: The UUID must match the canonical format:
   `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`, where `x` is a hexadecimal digit and `y`
   is one of [8, 9, a, b].
3. **No Arguments**: The function must not require any input arguments.
4. **Uniqueness**: Multiple invocations must return different UUIDs with extremely
   high probability.
5. **Error Handling**: If UUID generation fails, the tool must return a clear error
   message.

### Non-Functional Requirements

1. **Language Independence**: The specification must be implementable in any
   programming language.
2. **Standard Library Usage**: The tool should use the Node.js/Bun `crypto` module's
   `randomUUID()` as the primary method for UUID generation, with a compliant
   polyfill as a fallback.
3. **Readability**: The output string must be suitable for use as a unique identifier
   in databases, files, etc.

## Acceptance Criteria

- [ ] When invoked, the tool returns a string containing a valid RFC4122 version 4
      UUID.
- [ ] The output matches the regex:
      `/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`
- [ ] Multiple calls return different values.
- [ ] The tool does not require any input arguments.
- [ ] If an error occurs, a clear error message is returned.
- [ ] The output is a single, machine-usable string.

## Example Output

```
3fa85f64-5717-4562-b3fc-2c963f66afa6
```

## Out of Scope

- Generation of UUIDs of other versions (v1, v3, v5)
- Customization of output format
- Support for input arguments or configuration
