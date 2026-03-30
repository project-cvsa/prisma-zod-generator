import { readdir } from "node:fs/promises";
import path from "node:path";

const getCheckTemplate = (modelName: string) => `
import { z } from "zod";
import { ${modelName}Schema } from "../prisma/zod";
import type { Equal, Expect } from "./utils";
import type { ${modelName} } from "../prisma/generated/client";

type ${modelName}SchemaType = z.infer<typeof ${modelName}Schema>;

export type Result = Expect<Equal<${modelName}SchemaType, ${modelName}>>;
`;

const UTILS_CONTENT = `
export type Equal<X, Y> =
  [X] extends [Y]
    ? ([Y] extends [X] ? true : false)
    : false;
export type Expect<T extends true> = T;
`;

export async function runTypeTest(cwd: string, testName: string) {
	const tmpDir = path.join(cwd, "tmp");
	const zodDir = path.join(cwd, "prisma/zod");

	await Bun.$`bunx --bun prisma generate`.cwd(cwd);
	await Bun.write(path.join(tmpDir, "utils.ts"), UTILS_CONTENT);

	const files = await readdir(zodDir);
	const modelNames = files
		.filter((f) => f.endsWith(".ts") && f !== "index.ts")
		.map((f) => f.replace(/\.ts$/, ""));

	for (const modelName of modelNames) {
		await Bun.write(path.join(tmpDir, `Check${modelName}.ts`), getCheckTemplate(modelName));
	}

	const result = await Bun.$`tsgo --noEmit`.cwd(tmpDir);
	return { testName, exitCode: result.exitCode };
}
