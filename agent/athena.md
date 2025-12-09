---
description: Researches the codebase by coordinating file search and analysis
mode: subagent
model-hold: github-copilot/claude-sonnet-4
model: github-copilot/gpt-4.1
temperature: 0.3
permission:
  edit: deny
  bash: deny
  webfetch: deny
  doom_loop: deny
  external_directory: deny
  tools: allow
tools:
  bash: false
  edit: false
  write: false
  read: true
  grep: true
  glob: true
  list: true
  patch: false
  todowrite: true
  todoread: true
  webfetch: false
  tools: true
---
