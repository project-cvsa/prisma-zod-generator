# prisma-zod

A [Prisma generator](https://www.prisma.io/docs/orm/prisma-schema/overview/generators) that automatically generates [Zod](https://zod.dev) schemas from your Prisma models.

## Prerequisites

- [Prisma](https://www.npmjs.com/package/prisma) v7+
- [Zod](https://www.npmjs.com/package/zod) v4+

## Installation

> [!NOTE]
> This package is **ESM only**.

Install it with your preferred package manager:

```bash
npm i -D @cvsa/prisma-zod
yarn add -D @cvsa/prisma-zod
pnpm i -D @cvsa/prisma-zod
bun i -D @cvsa/prisma-zod
deno add -D npm:@cvsa/prisma-zod
```

## Usage

Assume your project structure looks like this:

```text
awesome-project/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── prisma.config.ts
└── package.json
```

Add the generator to your `schema.prisma`:

```prisma
generator zod {
    provider = "prisma-zod"
    output   = "./zod"
}
```

Then run `prisma generate` and import the schemas:

```typescript
import { LogSchema } from "root/prisma/zod";
```

## Using with prisma-json-types-generator

If you have `prisma-json-types-generator` installed and have already defined types for your `Json` fields, you can enhance runtime validation and get more precise Zod schemas by providing your own Zod schemas.

To do this, use the `extendSchema` option in the generator config to specify where your schemas are defined.

`schema.prisma`:
```prisma
// ...
generator json {
    provider = "prisma-json-types-generator"
}

generator zod {
    provider     = "prisma-zod"
    output       = "./zod"
    // This file must be placed next to `schema.prisma`
    extendSchema = "zod-schema.ts"
}

model Log {
    id   Int  @id
    /// [LogMetaType]
    meta Json
}
```

Create `zod-schema.ts` next to your `schema.prisma`:

```ts
import z from "zod";

// Use the same name as specified in the AST comment.
// Since the generated Zod schemas will import this schema directly,
// you must export it explicitly.
export const LogMetaType = z.object({
	timestamp: z.number(),
	host: z.string(),
});
```

In `types.ts`:

```ts
import type z from "zod";
import type { LogMetaType } from "./zod-schema";

declare global {
	namespace PrismaJson {
		type LogMetaType = z.infer<typeof LogMetaType>;
	}
}
```

Now `Log.meta` will be strongly typed as `{ timestamp: number; host: string }`, and your generated schema will include the precise Zod definition:

```ts
// typeof LogSchema
z.ZodObject<{
    id: z.ZodNumber;
    meta: z.ZodObject<{
        timestamp: z.ZodNumber;
        host: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>
```

## Contributing

See [CONTRIBUTING](./CONTRIBUTING.md) for development setup and guidelines.

Found a type mismatch between `prisma-client` and the generated Zod schema? Please [open an issue](https://github.com/project-cvsa/prisma-zod-generator/issues/new).

## License

[MIT](./LICENSE)
