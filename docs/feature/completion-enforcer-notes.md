# Completion Enforcer Plugin: Design Review & Revision Plan

## 1. Overview

This document reviews the current state of the Completion Enforcer plugin design,
identifies key issues, and provides a structured plan for revision. It is intended to
guide the alignment of the plugin documentation, implementation, and event taxonomy
with current OpenCode standards.

---

## 2. Key Issues & Mismatches

- **Filename/Content Mismatch:**
  - The file content describes a "completion enforcement" plugin, not autocomplete.
    Rename the file or rewrite content to match the intended feature.
- **Purpose Misalignment:**
  - The document lacks autocomplete-related scope and focuses on completion
    enforcement.

---

## 3. Structural & Technical Issues

- **Missing Sections:**
  - No problem statement, goals, or architecture overview.
- **Event List Format:**
  - Uses outdated colon-form events (e.g., `agent:response`). Update to dot-form
    events (e.g., `tool.execute.before`).
- **Plugin Path:**
  - Incorrect path (`~/opencode/plugins`). Use `.opencode/plugin` (per-project) or
    `~/.config/opencode/plugin` (global).
- **Manifest Key:**
  - Uses `main` instead of `"entry": "main.js"` in `opencode-plugin.json`.
- **API Style:**
  - Mixed return-based hooks and exported functions. Standardize per current plugin
    docs.

---

## 4. Non-Essential & Redundant Content

- Remove marketing-style endings and interactive prompts.
- Compress repetitive summary sections.
- Move optional schema enforcement to an appendix unless core.

---

## 5. Event Corrections & Mapping

- Replace colon events with dot-form events or clarify mapping:
  - `agent:response` → `message.updated` / `message.part.updated`
  - `agent:request` → `session.status` or internal dispatch
  - `tool:execute` / `tool:result` → `tool.execute.before` / `tool.execute.after`
  - `session:start` / `session:end` → `session.created` / `session.deleted` /
    `session.idle`

---

## 6. Recommended Revisions (by Section)

- **Filename & Title:**
  - Align filename and document title with actual content.
- **Plugin Path:**
  - Use `.opencode/plugin/completion-enforcer/` (per-project) and
    `~/.config/opencode/plugin/completion-enforcer/` (global).
- **Manifest:**
  - Use `"entry": "main.js"` and update schema as needed.
- **API Style:**
  - Consolidate to a single, consistent API style.
- **Event List:**
  - Update to current event taxonomy and document payload structure.
- **Detection Patterns:**
  - Expand `INCOMPLETE_PATTERNS` to cover more cases (truncated markers, unclosed
    code fences, etc).
- **Agent Injection:**
  - Use documented tool/message API if available.
- **Event Cancellation:**
  - Clarify semantics of `event.cancel`.

---

## 7. Missing Technical Details

- Describe integration with retry limits, backoff, and streaming tokens.
- Add a state machine or decision diagram for incomplete → retry loop.
- Add metrics/logging (e.g., retry counts, failure types).
- Provide configuration options (patterns override, max retries, strict JSON mode).
- Address performance (avoid loops, streaming intercept strategy).
- Define error handling for persistent incomplete outputs.

---

## 8. Enhancements & Best Practices

- Add a lifecycle diagram: model output → plugin intercept → validation → retry.
- Provide a TypeScript version of `main.js` with types.
- Include a test strategy (unit tests for detection, integration for retry loop).
- Document failure fallbacks (after N retries, return best effort + warning).

---

## 9. Next Steps

1. **Decide Direction:**
   - Confirm whether to keep as a completion enforcement plugin or convert to an
     autocomplete design document.
2. **Apply Revisions:**
   - Implement the above recommendations.
3. **Add Event Payload Examples:**
   - E.g., `tool.execute.before` handler signature.
4. **Draft Corrected Version:**
   - Once direction is confirmed, rewrite the document accordingly.

---

## 10. Appendix: If Converting to Autocomplete Design

If the intent is to design an autocomplete feature, include:

- Goals (latency, context-awareness, multi-source)
- Suggestion sources (file paths, symbols, previous messages, tool names, agent
  commands)
- Ranking strategies (recency, frequency, Levenshtein, semantic vector fallback)
- Architecture (collector → normalizer → ranker → cache → UI)
- Events to hook (file.edited, tool.execute.after, message.updated)
- Data structures (prefix trie, LRU cache, embedding index)
- API surface (`/complete <prefix>`, streaming, debounce)
- Security/Permissions (exclude .env, binaries, permission events)

---

_This document supersedes previous drafts and serves as the authoritative checklist
for revising the Completion Enforcer plugin design._
