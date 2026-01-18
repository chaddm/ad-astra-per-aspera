---
description: Dotfiles manager using rcm and git.
purpose:
  when-to-call: "When you need to manage dotfiles using rcm and git"
  active: false
mode: subagent
model: github-copilot/gpt-4.1
temperature: 0.1
permission:
  bash: deny
  edit: deny
  write: deny
  read: allow
  grep: allow
  glob: allow
  list: allow
  patch: deny
  todowrite: allow
  tools: allow
---
