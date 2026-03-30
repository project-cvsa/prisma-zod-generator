import { readdir } from "node:fs/promises";
import path from "node:path";

const getCheckTemplate = (modelName: string, dateSchema: "default" | "string" | "number") => {
	const resultString = (() => {
		switch (dateSchema) {
			case "default":
				return `export type Result = Expect<Equal<${modelName}SchemaType, ${modelName}>>;`;
			case "string":
				return `export type Result = Expect<Equal<${modelName}SchemaType, Serialized<${modelName}, string>>>;`;
			case "number":
				return `export type Result = Expect<Equal<${modelName}SchemaType, Serialized<${modelName}, number>>>;`;
		}
	})();
	return `
import { z } from "zod";
import { ${modelName}Schema } from "../prisma/zod";
import type { Equal, Expect, Serialized } from "./utils";
import type { ${modelName} } from "../prisma/generated/client";

type ${modelName}SchemaType = z.infer<typeof ${modelName}Schema>;

${resultString}
`;
};

const UTILS_CONTENT = `
export type Equal<X, Y> =
  [X] extends [Y]
    ? ([Y] extends [X] ? true : false)
    : false;
export type Expect<T extends true> = T;
export type Serialized<T, X> = T extends Date
	? X
	: T extends Array<infer U>
		? Array<Serialized<U, X>>
		: T extends object
			? { [K in keyof T]: Serialized<T[K], X> }
			: T;
`;

export async function runTypeTest(
	cwd: string,
	testName: string,
	dateSchema: "default" | "string" | "number" = "default"
) {
	const tmpDir = path.join(cwd, "tmp");
	const zodDir = path.join(cwd, "prisma/zod");

	await Bun.$`bunx --bun prisma generate`.cwd(cwd);
	await Bun.write(path.join(tmpDir, "utils.ts"), UTILS_CONTENT);

	const files = await readdir(zodDir);
	const modelNames = files
		.filter((f) => f.endsWith(".ts") && f !== "index.ts")
		.map((f) => f.replace(/\.ts$/, ""));

	for (const modelName of modelNames) {
		await Bun.write(
			path.join(tmpDir, `Check${modelName}.ts`),
			getCheckTemplate(modelName, dateSchema)
		);
	}

	const result = await Bun.$`tsgo --noEmit`.cwd(tmpDir);
	return { testName, exitCode: result.exitCode };
}
