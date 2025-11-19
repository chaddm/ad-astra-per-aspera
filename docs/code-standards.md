# Code Standards

These are the expected code standards for tools and libraries developed within this
project.

## General Guidelines

- Use JSDoc comments for all functions, classes and modules.
  - It is your responsibility to ensure comments are accurate and up to date.
- TypeScript definitions are required, including annotating types for variables,
  functions, etc.
  - Infer types where possible.
  - Create any required if they do not exist, including interfaces and type aliases.
  - When adding new NPM packages, determine if TypeScript definitions are available
    and add them.  If not available, infer types as accurately as possible.
- Determine documentation changes required alongside code changes.
  - Consider if any existing documentation needs to be updated, including the
    `AGENTS.md` file and/or any relevant supporting documentation for the code.
  - You are responsible for ensuring documentation is accurate and up to date.

## Specific Code Standards

**Use guard clauses**

- Use guard clauses to reduce nesting and improve readability.
- Use early returns for invalid or edge-case inputs.
- Prefer single-line guard clauses when possible.
  Instead of:
  ```typescript
  function example(value: number | null): number {
    if (value !== null) {
      // complex logic here
      return value * 2;
    } else {
      return 0;
    }
  }
  ```
  Use:
  ```typescript
  function example(value: number | null): number {
    if (value === null) return 0;

    // complex logic here
    const result = value * 2;
    return result;
  }
  ```

**Return variables or values, not functions**

Use return statements to return values or variables directly, rather than returning
functions that produce those values to make it easier to debug and understand the
code.

**Use multi-line techniques for long lines**

- When chaining multiple methods, use multi-line formatting to enhance readability.
  Instead of:
  ```typescript
  const result = data.filter(item => item.active).map(item => item.value).reduce((a, b) => a + b, 0);
  ```
  Use:
  ```typescript
  const result = data
    .filter(item => item.active)
    .map(item => item.value)
    .reduce((a, b) => a + b, 0);
  ```

- For long function calls with multiple parameters, use multi-line formatting.
  Instead of:
  ```typescript
  someFunction(param1, param2, param3, param4, param5);
  ```
  Use:
  ```typescript
  someFunction(
    param1,
    param2,
    param3,
    param4,
    param5
  );
  ```

**Prefer pure functions**

Aim to write pure functions that do not cause side effects for better testability and
maintainability.  Place these functions at the top of the file to improve
readability and allow the code to be compiled once.

- Consider exactly similar inputs producing exactly similar outputs without side
  effects to be a pure function.  Provide a description, long name for WHAT the
  function does.
