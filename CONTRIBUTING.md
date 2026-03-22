# Contributing to prisma-zod

## Development Setup

This package uses [Bun](https://bun.sh/) for development. Get started with:

```bash
bun i              # Install dependencies
bun run build      # Build the package
bun link           # Link globally
bun link @cvsa/prisma-zod  # Link the package
```

## How It Works

The generator iterates through all models in your Prisma schema using `@prisma/generator-helper` and outputs corresponding Zod schemas as TypeScript files.

## Testing

```bash
bun run test # Run all tests
```

## Pull Requests

Use the `master` branch as your base. All PRs must reference an existing issue—open one first to describe the bug or feature before submitting a PR.
