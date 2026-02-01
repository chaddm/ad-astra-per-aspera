# Calculator Tool Specification

... (content omitted for brevity) ...

### Live Testing with @cli Agent

**For live testing within an active OpenCode session**, use the @cli agent to execute `opencode run` commands:

**Syntax**:
```
@cli opencode run "<natural language request>"
```

**Important Requirements**:
- **CRITICAL: Restart OpenCode before live testing** if you've made any changes to the calculator tool code - tools are loaded at startup and changes will not be reflected in the current session
- **Wait at least 25 seconds** for the tool to load, execute, and return results
- The @cli agent has full permissions and can execute shell commands
- Live testing validates the tool works in a real OpenCode environment
- This is especially useful for testing after making changes without restarting the OpenCode session

**Example Live Tests**:

```markdown
# Test basic arithmetic
@cli opencode run "Use the calculator tool to evaluate 2 + 2"
# Wait 25+ seconds for result
# Expected: Tool returns 4

# Test LaTeX expression
@cli opencode run "Use the calculator tool to calculate \\frac{1}{2} + \\frac{1}{4}"
# Wait 25+ seconds for result  
# Expected: Tool returns 0.75

# Test variable substitution
@cli opencode run "Use the calculator tool to evaluate x^2 + 1 where x is 3"
# Wait 25+ seconds for result
# Expected: Tool returns 10

# Test error handling
@cli opencode run "Use the calculator to evaluate an invalid expression \\invalid{syntax}"
# Wait 25+ seconds for result
# Expected: Clear error message about invalid LaTeX syntax
```

**Live testing acceptance criteria**:
- [ ] @cli agent successfully executes `opencode run` commands
- [ ] Results are returned within reasonable time (25+ seconds)
- [ ] Tool calculations are accurate and match expected results
- [ ] Error messages are clear and properly surfaced
- [ ] LaTeX syntax is correctly parsed and evaluated

### Running Tests

... (content omitted for brevity) ...
