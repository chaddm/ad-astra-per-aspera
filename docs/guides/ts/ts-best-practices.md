# TypeScript Best Practices

This guide outlines best practices for writing clean, efficient, and maintainable
TypeScript code. You are expected to follow these guidelines when working on
TypeScript projects. If you must deviate from these practices for a specific reason,
please document the rationale in code comments or project documentation.

**The Prime Directive:** Always leave the codebase cleaner than you found it.

All code rots over time if not actively maintained. If you are working on a file,
consider refactoring or improving related code including:

- Making consistent with the project's coding style and conventions.
- Fixing typos, improving variable names, and enhancing comments.
- Removing unused imports, variables, and functions.
- Updating outdated documentation or comments.
- Rewriting to the newer syntax or patterns if applicable:
  - Deprecated packages for currently supported packages.
  - Replace callbacks with async/await.
  - Use modern operators, e.g., optional chaining, nullish coalescing, etc.
- Create tests for untested code paths you encounter.

## Best Practices

**Place Stateless Code At The Top Level:**

Stateless code (functions, constants, types, interfaces) should be defined at the top
level of the module, outside of classes or functions. This improves readability,
makes it easier to locate reusable code, and avoids requiring the compiler to
recreate these definitions on each function/class invocation.

- Where possible, refactor out functionality that can be stateless.

```ts
// Bad
class UserService {
  getUser(id: string) {
    const formatUser = (user: User) => {
      return `${user.firstName} ${user.lastName}`;
    };
    const user = this.fetchUserFromDb(id);
    return formatUser(user);
  }
}
```

```ts
// Good
const formatUser = (user: User) => {
  return `${user.firstName} ${user.lastName}`;
};
class UserService {
  getUser(id: string) {
    const user = this.fetchUserFromDb(id);
    return formatUser(user);
  }
}
```
