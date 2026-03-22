# AGENTS.md - prisma-zod-generator

## Project Overview

This is a Prisma generator plugin that generates Zod schemas from Prisma models. It uses Bun as the runtime and package manager, Biome for formatting, and Turbo for build orchestration.

## Project Structure

```
prisma-zod-generator/
├── src/                    # Main source code
│   ├── index.ts           # Entry point (CLI handler)
│   ├── generator.ts       # Main generator logic
│   ├── schema-builder.ts  # Zod schema generation
│   └── types.ts          # Shared type utilities
├── tests/                 # Test suites
│   ├── single-file/      # Single schema file tests
│   └── multi-file/       # Multi-file/multi-model schema tests
├── build.ts              # Bun build configuration
├── biome.json            # Biome formatter/linter config
├── turbo.json            # Turbo build pipeline config
└── package.json          # Package manifest
```

## Build, Lint, and Test Commands

### Installation & Setup
```bash
bun i              # Install dependencies
bun link           # Link globally for local development
bun link @cvsa/prisma-zod  # Link the package
```

### Build Commands
```bash
bun run build      # Build with Turbo (runs build:raw)
bun run build:raw  # Direct Bun build: bun build.ts
```

### Lint & Format Commands
```bash
bun run format     # Format all files with Biome
# Biome is configured in biome.json - it handles formatting ONLY (no linting)
```

### Test Commands
```bash
bun run test                    # Run all tests via Turbo
bun run test:raw               # Run tests directly: bun test
bun test                        # Run all tests
bun test tests/single-file     # Run specific test file
bun test tests/multi-file      # Run multi-file tests
```

### Running Prisma Generator (Development)
```bash
bunx --bun prisma generate     # Generate using local generator
```

---

## Code Style Guidelines

### General

- **Module System**: ESM only (type: "module" in package.json)
- **Runtime**: Bun (not Node.js) - use `import.meta.dir`, `Bun.$`, etc.
- **TypeScript**: Strict mode enabled (see tsconfig.json)

### TypeScript Configuration (tsconfig.json)
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "moduleResolution": "bundler",
  "verbatimModuleSyntax": true
}
```

### Formatting (Biome - biome.json)

| Setting | Value |
|---------|-------|
| Indent Style | Tab |
| Indent Width | 4 |
| Line Width | 100 |
| Quote Style | Double |
| Semicolons | Always |
| Trailing Commas | ES5 |

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Variables/functions | camelCase | `runGenerator`, `outputDir` |
| Types/Interfaces | PascalCase | `GeneratorOptions`, `Field` |
| Constants | PascalCase (if exported), camelCase otherwise | `TYPE_MAP` |
| Files | kebab-case | `schema-builder.ts`, `multi-file/` |
| Prisma models | PascalCase | `User`, `Post`, `Voicebank` |
| Zod schemas | PascalCase | `UserSchema`, `PostSchema` |

### Import Conventions

```typescript
// Node.js built-ins - use node: prefix
import fs from "node:fs/promises";
import path from "node:path";

// External packages
import { generatorHandler } from "@prisma/generator-helper";
import type { Field, Model } from "@prisma/dmmf";

// Internal modules (relative)
import { generateModelFile } from "./schema-builder";

// Type-only imports (use type modifier)
import type { GeneratorOptions } from "@prisma/generator-helper";
```

### Error Handling

- Use standard try/catch for async operations
- Prefer async/await over .then() chains
- Let errors propagate when appropriate (no empty catch blocks)

### Code Patterns

#### Async Generator Function
```typescript
export async function runGenerator(options: GeneratorOptions) {
  // ... implementation
}
```

#### Schema Generation Pattern
```typescript
export function generateModelFile(model: Model): string {
  const fieldLines = model.fields
    .map((field) => {
      const base = getBaseZodType(field);
      return base ? `  ${field.name}: ${applyModifiers(base, field)},` : null;
    })
    .filter(Boolean)
    .join("\n");

  return [
    'import { z } from "zod";',
    "",
    `export const ${model.name}Schema = z.object({`,
    fieldLines,
    "});",
  ].join("\n");
}
```

#### Test Pattern (Bun)
```typescript
import { expect, test, afterAll, beforeAll } from "bun:test";

test("description", async () => {
  // Test implementation
  expect(result).toBe(expected);
});
```

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@prisma/generator-helper` | Prisma generator API |
| `@prisma/dmmf` | Prisma DMMF types |
| `zod` | Zod schema library (peer dep, v4+) |
| `@biomejs/biome` | Formatting only |
| `bun` | Runtime, package manager, test runner |

## Common Workflows

### Making a Change
1. Edit source in `src/`
2. Run `bun run build` to compile
3. Run `bun test` to verify
4. Run `bun run format` before committing

### Running a Specific Test
```bash
bun test tests/single-file/index.test.ts
```

### Debugging Generated Output
```bash
cd tests/single-file
bunx --bun prisma generate
# Check prisma/zod/ for generated output
```

---

## Notes

- Biome is used for formatting ONLY - no ESLint or other linters
- Turbo runs `build:raw` before `test:raw` automatically
- Generated Zod schemas use `z.object()` with PascalCase schema names
- The generator outputs one file per model plus an `index.ts` with exports
