Orchestrate a web search by delegating to the @web-research subagent then prompt the
user if further research is needed or to save the report to a file.

Workflow:

- You will immediately delegate to @web-research the user prompt.
- After receiving the web-research results, present them to the user exactly as-is.
- Ask the user if they would like:
  - Perform research again with refinements
  - Save the report to a file with the suggestion of
    `docs/research/<topic>-YYYYMMDD.md`.
    - The front matter shall have:
      - title: <topic>
      - description: <short version user prompt>
      - created_on
      - updated_on
      - prompt: <full user prompt>
      - tags: [web-research] (and any other relevant tags)
    - The body shall contain the exact research results, as-is.

---

User Prompt: $ARGUMENTS
