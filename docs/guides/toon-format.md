---
created: 2025-11-20T19:41:46 (UTC -06:00)
tags: []
source: https://github.com/toon-format/toon
author: johannschopplich
---

# toon-format/toon: 🎒 Token-Oriented Object Notation (TOON) – Compact, human-readable, schema-aware JSON for LLM prompts. Spec, benchmarks, TypeScript SDK.

> ## Excerpt

---

[![TOON logo with step‑by‑step guide](https://github.com/toon-format/toon/raw/main/.github/og.png)](https://github.com/toon-format/toon/blob/main/.github/og.png)

[![CI](https://github.com/toon-format/toon/actions/workflows/ci.yml/badge.svg)](https://github.com/toon-format/toon/actions)
[![npm version](https://camo.githubusercontent.com/90773484c58963d31f3761e80e97931bc1b20484582cbfae5e60bad5005935a3/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f762f40746f6f6e2d666f726d61742f746f6f6e2e737667)](https://www.npmjs.com/package/@toon-format/toon)
[![SPEC v2.0](https://camo.githubusercontent.com/6d335d2bd8c7cd6ff25ffc9161fabaf4c04b07cc1dce7c23b610499655bc2e11/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f737065632d76322e302d6c6967687467726179)](https://github.com/toon-format/spec)
[![npm downloads (total)](https://camo.githubusercontent.com/63e416de1d60e0b157eb885db905a77dca9e3bf03f820d6bdd15068e28187132/68747470733a2f2f696d672e736869656c64732e696f2f6e706d2f64742f40746f6f6e2d666f726d61742f746f6f6e2e737667)](https://www.npmjs.com/package/@toon-format/toon)
[![License: MIT](https://camo.githubusercontent.com/7013272bd27ece47364536a221edb554cd69683b68a46fc0ee96881174c4214c/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f6c6963656e73652d4d49542d626c75652e737667)](https://github.com/toon-format/toon/blob/main/LICENSE)

**Token-Oriented Object Notation** is a compact, human-readable encoding of the JSON
data model that minimizes tokens and makes structure easy for models to follow. It's
intended for _LLM input_ as a drop-in, lossless representation of your existing JSON.

TOON combines YAML's indentation-based structure for nested objects with a CSV-style
tabular layout for uniform arrays. TOON's sweet spot is uniform arrays of objects
(multiple fields per row, same structure across items), achieving CSV-like
compactness while adding explicit structure that helps LLMs parse and validate data
reliably. For deeply nested or non-uniform data, JSON may be more efficient.

The similarity to CSV is intentional: CSV is simple and ubiquitous, and TOON aims to
keep that familiarity while remaining a lossless, drop-in representation of JSON for
Large Language Models.

Think of it as a translation layer: use JSON programmatically, and encode it as TOON
for LLM input.

Tip

The TOON format is stable, but also an idea in progress. Nothing's set in stone –
help shape where it goes by contributing to the
[spec](https://github.com/toon-format/spec) or sharing feedback.

## Table of Contents

- [Why TOON?](https://github.com/toon-format/toon#why-toon)
- [Key Features](https://github.com/toon-format/toon#key-features)
- [When Not to Use TOON](https://github.com/toon-format/toon#when-not-to-use-toon)
- [Benchmarks](https://github.com/toon-format/toon#benchmarks)
- [Installation & Quick Start](https://github.com/toon-format/toon#installation--quick-start)
- [Playgrounds](https://github.com/toon-format/toon#playgrounds)
- [CLI](https://github.com/toon-format/toon#cli)
- [Format Overview](https://github.com/toon-format/toon#format-overview)
- [Using TOON with LLMs](https://github.com/toon-format/toon#using-toon-with-llms)
- [Documentation](https://github.com/toon-format/toon#documentation)
- [Other Implementations](https://github.com/toon-format/toon#other-implementations)
- [📋 Full Specification](https://github.com/toon-format/spec/blob/main/SPEC.md)

## Why TOON?

AI is becoming cheaper and more accessible, but larger context windows allow for
larger data inputs as well. **LLM tokens still cost money** – and standard JSON is
verbose and token-expensive:

```json
{
  "context": {
    "task": "Our favorite hikes together",
    "location": "Boulder",
    "season": "spring_2025"
  },
  "friends": ["ana", "luis", "sam"],
  "hikes": [
    {
      "id": 1,
      "name": "Blue Lake Trail",
      "distanceKm": 7.5,
      "elevationGain": 320,
      "companion": "ana",
      "wasSunny": true
    },
    {
      "id": 2,
      "name": "Ridge Overlook",
      "distanceKm": 9.2,
      "elevationGain": 540,
      "companion": "luis",
      "wasSunny": false
    },
    {
      "id": 3,
      "name": "Wildflower Loop",
      "distanceKm": 5.1,
      "elevationGain": 180,
      "companion": "sam",
      "wasSunny": true
    }
  ]
}
```

YAML already conveys the same information with **fewer tokens**.

```yaml
context:
  task: Our favorite hikes together
  location: Boulder
  season: spring_2025

friends:
  - ana
  - luis
  - sam

hikes:
  - id: 1
    name: Blue Lake Trail
    distanceKm: 7.5
    elevationGain: 320
    companion: ana
    wasSunny: true
  - id: 2
    name: Ridge Overlook
    distanceKm: 9.2
    elevationGain: 540
    companion: luis
    wasSunny: false
  - id: 3
    name: Wildflower Loop
    distanceKm: 5.1
    elevationGain: 180
    companion: sam
    wasSunny: true
```

TOON conveys the same information with **even fewer tokens** – combining YAML-like
indentation with CSV-style tabular arrays:

```yaml
context:
  task: Our favorite hikes together
  location: Boulder
  season: spring_2025
friends[3]: ana,luis,sam
hikes[3]{id,name,distanceKm,elevationGain,companion,wasSunny}:
  1,Blue Lake Trail,7.5,320,ana,true 2,Ridge Overlook,9.2,540,luis,false 3,Wildflower
  Loop,5.1,180,sam,true
```

## Key Features

- 📊 **Token-Efficient & Accurate:** TOON reaches 74% accuracy (vs JSON's 70%) while
  using ~40% fewer tokens in mixed-structure benchmarks across 4 models.
- 🔁 **JSON Data Model:** Encodes the same objects, arrays, and primitives as JSON
  with deterministic, lossless round-trips.
- 🛤️ **LLM-Friendly Guardrails:** Explicit \[N\] lengths and {fields} headers give
  models a clear schema to follow, improving parsing reliability.
- 📐 **Minimal Syntax:** Uses indentation instead of braces and minimizes quoting,
  giving YAML-like readability with CSV-style compactness.
- 🧺 **Tabular Arrays:** Uniform arrays of objects collapse into tables that declare
  fields once and stream row values line by line.
- 🌐 **Multi-Language Ecosystem:** Spec-driven implementations in TypeScript, Python,
  Go, Rust, .NET, and other languages.

## When Not to Use TOON

TOON excels with uniform arrays of objects, but there are cases where other formats
are better:

- **Deeply nested or non-uniform structures** (tabular eligibility ≈ 0%):
  JSON-compact often uses fewer tokens. Example: complex configuration objects with
  many nested levels.
- **Semi-uniform arrays** (~40–60% tabular eligibility): Token savings diminish.
  Prefer JSON if your pipelines already rely on it.
- **Pure tabular data**: CSV is smaller than TOON for flat tables. TOON adds minimal
  overhead (~5-10%) to provide structure (array length declarations, field headers,
  delimiter scoping) that improves LLM reliability.
- **Latency-critical applications**: If end-to-end response time is your top
  priority, benchmark on your exact setup. Some deployments (especially
  local/quantized models like Ollama) may process compact JSON faster despite TOON's
  lower token count. Measure TTFT, tokens/sec, and total time for both formats and
  use whichever is faster.

See [benchmarks](https://github.com/toon-format/toon#benchmarks) for concrete
comparisons across different data structures.

## Benchmarks

Benchmarks are organized into two tracks to ensure fair comparisons:

- **Mixed-Structure Track**: Datasets with nested or semi-uniform structures (TOON vs
  JSON, YAML, XML). CSV excluded as it cannot properly represent these structures.
- **Flat-Only Track**: Datasets with flat tabular structures where CSV is applicable
  (CSV vs TOON vs JSON, YAML, XML).

### Retrieval Accuracy

Benchmarks test LLM comprehension across different input formats using 209 data
retrieval questions on 4 models.

**Show Dataset Catalog**

#### Dataset Catalog

| Dataset                                             | Rows | Structure    | CSV Support | Eligibility |
| --------------------------------------------------- | ---- | ------------ | ----------- | ----------- |
| Uniform employee records                            | 100  | uniform      | ✓           | 100%        |
| E-commerce orders with nested structures            | 50   | nested       | ✗           | 33%         |
| Time-series analytics data                          | 60   | uniform      | ✓           | 100%        |
| Top 100 GitHub repositories                         | 100  | uniform      | ✓           | 100%        |
| Semi-uniform event logs                             | 75   | semi-uniform | ✗           | 50%         |
| Deeply nested configuration                         | 11   | deep         | ✗           | 0%          |
| Valid complete dataset (control)                    | 20   | uniform      | ✓           | 100%        |
| Array truncated: 3 rows removed from end            | 17   | uniform      | ✓           | 100%        |
| Extra rows added beyond declared length             | 23   | uniform      | ✓           | 100%        |
| Inconsistent field count (missing salary in row 10) | 20   | uniform      | ✓           | 100%        |
| Missing required fields (no email in multiple rows) | 20   | uniform      | ✓           | 100%        |

**Structure classes:**

- **uniform**: All objects have identical fields with primitive values
- **semi-uniform**: Mix of uniform and non-uniform structures
- **nested**: Objects with nested structures (nested objects or arrays)
- **deep**: Highly nested with minimal tabular eligibility

**CSV Support:** ✓ (supported), ✗ (not supported – would require lossy flattening)

**Eligibility:** Percentage of arrays that qualify for TOON's tabular format (uniform
objects with primitive values)

**Show detailed examples**

#### 📈 Time-series analytics data

**Savings:** 13,130 tokens (59.0% reduction vs JSON)

**JSON** (22,250 tokens):

```json
{
  "metrics": [
    {
      "date": "2025-01-01",
      "views": 5715,
      "clicks": 211,
      "conversions": 28,
      "revenue": 7976.46,
      "bounceRate": 0.47
    },
    {
      "date": "2025-01-02",
      "views": 7103,
      "clicks": 393,
      "conversions": 28,
      "revenue": 8360.53,
      "bounceRate": 0.32
    },
    {
      "date": "2025-01-03",
      "views": 7248,
      "clicks": 378,
      "conversions": 24,
      "revenue": 3212.57,
      "bounceRate": 0.5
    },
    {
      "date": "2025-01-04",
      "views": 2927,
      "clicks": 77,
      "conversions": 11,
      "revenue": 1211.69,
      "bounceRate": 0.62
    },
    {
      "date": "2025-01-05",
      "views": 3530,
      "clicks": 82,
      "conversions": 8,
      "revenue": 462.77,
      "bounceRate": 0.56
    }
  ]
}
```

**TOON** (9,120 tokens):

```
metrics[5]{date,views,clicks,conversions,revenue,bounceRate}:
  2025-01-01,5715,211,28,7976.46,0.47
  2025-01-02,7103,393,28,8360.53,0.32
  2025-01-03,7248,378,24,3212.57,0.5
  2025-01-04,2927,77,11,1211.69,0.62
  2025-01-05,3530,82,8,462.77,0.56
```

---

#### ⭐ Top 100 GitHub repositories

**Savings:** 6,400 tokens (42.3% reduction vs JSON)

**JSON** (15,145 tokens):

```json
{
  "repositories": [
    {
      "id": 28457823,
      "name": "freeCodeCamp",
      "repo": "freeCodeCamp/freeCodeCamp",
      "description": "freeCodeCamp.org's open-source codebase and curriculum. Learn math, programming,…",
      "createdAt": "2014-12-24T17:49:19Z",
      "updatedAt": "2025-10-28T11:58:08Z",
      "pushedAt": "2025-10-28T10:17:16Z",
      "stars": 430886,
      "watchers": 8583,
      "forks": 42146,
      "defaultBranch": "main"
    },
    {
      "id": 132750724,
      "name": "build-your-own-x",
      "repo": "codecrafters-io/build-your-own-x",
      "description": "Master programming by recreating your favorite technologies from scratch.",
      "createdAt": "2018-05-09T12:03:18Z",
      "updatedAt": "2025-10-28T12:37:11Z",
      "pushedAt": "2025-10-10T18:45:01Z",
      "stars": 430877,
      "watchers": 6332,
      "forks": 40453,
      "defaultBranch": "master"
    },
    {
      "id": 21737465,
      "name": "awesome",
      "repo": "sindresorhus/awesome",
      "description": "😎 Awesome lists about all kinds of interesting topics",
      "createdAt": "2014-07-11T13:42:37Z",
      "updatedAt": "2025-10-28T12:40:21Z",
      "pushedAt": "2025-10-27T17:57:31Z",
      "stars": 410052,
      "watchers": 8017,
      "forks": 32029,
      "defaultBranch": "main"
    }
  ]
}
```

**TOON** (8,745 tokens):

```
repositories[3]{id,name,repo,description,createdAt,updatedAt,pushedAt,stars,watchers,forks,defaultBranch}:
  28457823,freeCodeCamp,freeCodeCamp/freeCodeCamp,"freeCodeCamp.org's open-source codebase and curriculum. Learn math, programming,…","2014-12-24T17:49:19Z","2025-10-28T11:58:08Z","2025-10-28T10:17:16Z",430886,8583,42146,main
  132750724,build-your-own-x,codecrafters-io/build-your-own-x,Master programming by recreating your favorite technologies from scratch.,"2018-05-09T12:03:18Z","2025-10-28T12:37:11Z","2025-10-10T18:45:01Z",430877,6332,40453,master
  21737465,awesome,sindresorhus/awesome,😎 Awesome lists about all kinds of interesting topics,"2014-07-11T13:42:37Z","2025-10-28T12:40:21Z","2025-10-27T17:57:31Z",410052,8017,32029,main
```

## Installation & Quick Start

### CLI (No Installation Required)

Try TOON instantly with npx:

```shell
# Convert JSON to TOON
npx @toon-format/cli input.json -o output.toon

# Pipe from stdin
echo '{"name": "Ada", "role": "dev"}' | npx @toon-format/cli
```

See the [CLI section](https://github.com/toon-format/toon#cli) for all options and
examples.

### TypeScript Library

```shell
# npm
npm install @toon-format/toon

# pnpm
pnpm add @toon-format/toon

# yarn
yarn add @toon-format/toon
```

**Example usage:**

```ts
import { encode } from "@toon-format/toon";

const data = {
  users: [
    { id: 1, name: "Alice", role: "admin" },
    { id: 2, name: "Bob", role: "user" },
  ],
};

console.log(encode(data));
// users[2]{id,name,role}:
//   1,Alice,admin
//   2,Bob,user
```

## Playgrounds

Experiment with TOON format interactively using these community-built tools for token
comparison, format conversion, and validation:

- [Format Tokenization Playground](https://www.curiouslychase.com/playground/format-tokenization-exploration)
- [TOON Tools](https://toontools.vercel.app/)

## CLI

Command-line tool for quick JSON↔TOON conversions, token analysis, and pipeline
integration. Auto-detects format from file extension, supports stdin/stdout
workflows, and offers delimiter options for maximum efficiency.

```shell
# Encode JSON to TOON (auto-detected)
npx @toon-format/cli input.json -o output.toon

# Decode TOON to JSON (auto-detected)
npx @toon-format/cli data.toon -o output.json

# Pipe from stdin (no argument needed)
cat data.json | npx @toon-format/cli
echo '{"name": "Ada"}' | npx @toon-format/cli

# Output to stdout
npx @toon-format/cli input.json

# Show token savings
npx @toon-format/cli data.json --stats
```

## Format Overview

Detailed syntax references, implementation guides, and quick lookups for
understanding and using the TOON format.

- [Format Overview](https://toonformat.dev/guide/format-overview) – Complete syntax
  documentation
- [Syntax Cheatsheet](https://toonformat.dev/reference/syntax-cheatsheet) – Quick
  reference
- [API Reference](https://toonformat.dev/reference/api) – Encode/decode usage
  (TypeScript)

## Using TOON with LLMs

TOON works best when you show the format instead of describing it. The structure is
self-documenting – models parse it naturally once they see the pattern. Wrap data in
` ```toon ` code blocks for input, and show the expected header template when asking
models to generate TOON. Use tab delimiters for even better token efficiency.

Follow the detailed [LLM integration guide](https://toonformat.dev/guide/llm-prompts)
for strategies, examples, and validation techniques.

## Documentation

Comprehensive guides, references, and resources to help you get the most out of the
TOON format and tools.

**Getting Started**

- [Introduction & Installation](https://toonformat.dev/guide/getting-started) – What
  TOON is, when to use it, first steps
- [Format Overview](https://toonformat.dev/guide/format-overview) – Complete syntax
  with examples
- [Benchmarks](https://toonformat.dev/guide/benchmarks) – Accuracy & token efficiency
  results

**Tools & Integration**

- [CLI](https://toonformat.dev/cli/) – Command-line tool for JSON↔TOON conversions
- [Using TOON with LLMs](https://toonformat.dev/guide/llm-prompts) – Prompting
  strategies & validation
- [Playgrounds](https://toonformat.dev/ecosystem/tools-and-playgrounds) – Interactive
  tools

**Reference**

- [API Reference](https://toonformat.dev/reference/api) – TypeScript/JavaScript
  encode/decode API
- [Syntax Cheatsheet](https://toonformat.dev/reference/syntax-cheatsheet) – Quick
  format lookup
- [Specification v2.0](https://github.com/toon-format/spec/blob/main/SPEC.md) –
  Normative rules for implementers

## Other Implementations

Note

When implementing TOON in other languages, please follow the
[specification](https://github.com/toon-format/spec/blob/main/SPEC.md) (currently
v2.0) to ensure compatibility across implementations. The
[conformance tests](https://github.com/toon-format/spec/tree/main/tests) provide
language-agnostic test fixtures that validate your implementations.

### Official Implementations

Tip

These implementations are actively being developed by dedicated teams. Contributions
are welcome! Join the effort by opening issues, submitting PRs, or discussing
implementation details in the respective repositories.

- **.NET:** [toon_format](https://github.com/toon-format/toon-dotnet) _(in
  development)_
- **Dart:** [toon](https://github.com/toon-format/toon-dart) _(in development)_
- **Go:** [toon-go](https://github.com/toon-format/toon-go) _(in development)_
- **Python:** [toon_format](https://github.com/toon-format/toon-python) _(in
  development)_
- **Rust:** [toon_format](https://github.com/toon-format/toon-rust) _(in
  development)_

### Community Implementations

- **Apex:** [ApexToon](https://github.com/Eacaw/ApexToon)
- **C++:** [ctoon](https://github.com/mohammadraziei/ctoon)
- **Clojure:** [toon](https://github.com/vadelabs/toon)
- **Crystal:** [toon-crystal](https://github.com/mamantoha/toon-crystal)
- **Elixir:** [toon_ex](https://github.com/kentaro/toon_ex)
- **Gleam:** [toon_codec](https://github.com/axelbellec/toon_codec)
- **Go:** [gotoon](https://github.com/alpkeskin/gotoon)
- **Java:** [JToon](https://github.com/felipestanzani/JToon)
- **Scala:** [toon4s](https://github.com/vim89/toon4s)
- **Lua/Neovim:** [toon.nvim](https://github.com/thalesgelinger/toon.nvim)
- **OCaml:** [ocaml-toon](https://github.com/davesnx/ocaml-toon)
- **PHP:** [toon-php](https://github.com/HelgeSverre/toon-php)
- **Laravel Framework:** [laravel-toon](https://github.com/jobmetric/laravel-toon)
- **R**: [toon](https://github.com/laresbernardo/toon)
- **Ruby:** [toon-ruby](https://github.com/andrepcg/toon-ruby)
- **Swift:** [TOONEncoder](https://github.com/mattt/TOONEncoder)
- **Kotlin:**
  [Kotlin-Toon Encoder/Decoder](https://github.com/vexpera-br/kotlin-toon)

## Credits

- Logo design by [鈴木ックス(SZKX)](https://x.com/szkx_art)

## License

[MIT](https://github.com/toon-format/toon/blob/main/LICENSE) License © 2025-PRESENT
[Johann Schopplich](https://github.com/johannschopplich)
