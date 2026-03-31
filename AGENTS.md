# AGENTS.md - prisma-zod-generator

## Project Overview

This is a Prisma generator plugin that generates Zod schemas from Prisma models. It uses Bun as the runtime and package manager, Biome for formatting, and Turborepo for workflow orchestration.

## Project Structure

```
prisma-zod-generator/
├── src/                   # Main source code
│   ├── index.ts           # Entry point (CLI handler)
│   ├── generator.ts       # Main generator logic
│   ├── schema-builder.ts  # Zod schema generation
│   └── types.ts           # Shared type utilities
├── tests/                 # Test suites
├── build.ts               # build sciprt
├── biome.json             # Biome config
├── turbo.json             # Turbo build pipeline config
└── package.json           # Package manifest
```

## Build, Lint, and Test Commands

```bash
bun i              # Install dependencies
bun run build      # Build with Turbo (runs build:raw)
bun run format     # Format all files with Biome

# Run all tests
# You should always use this command.
# [PROHIBITED]: DO NOT use `bun test`
bun run test
```

## Common Workflows

1. Edit source in `src/`
2. Run `bun run build` to compile
3. Run `bun run test` to verify
4. Run `bun run format` before committing
