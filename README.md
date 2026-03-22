# prisma-zod

A [Prisma generator](https://www.prisma.io/docs/orm/prisma-schema/overview/generators) that auto-generates [Zod](https://zod.dev) schemas from your Prisma models.

## Prerequisites

- [Prisma](https://www.npmjs.com/package/prisma) v7+
- [Zod](https://www.npmjs.com/package/zod) v4+

## Installation

> [!NOTE]
> This package is **ESM only**.

Pick your favorite package manager:

```bash
npm i -D @cvsa/prisma-zod
yarn add -D @cvsa/prisma-zod
pnpm i -D @cvsa/prisma-zod
bun i -D @cvsa/prisma-zod
deno add -D npm:@cvsa/prisma-zod
```

## Usage

Add the generator to your `schema.prisma`:

```prisma
generator zod {
    provider = "prisma-zod"
    output   = "./zod"
}
```

Run `prisma generate`, then import your schemas:

```typescript
import { UserSchema, PostSchema } from "./zod"
```

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for development setup and guidelines.

Found a type mismatch between `prisma-client` and the generated Zod schema? Please [open an issue](https://github.com/project-cvsa/prisma-zod-generator/issues/new).

## License

[MIT](./LICENSE)
