import { readdir } from "node:fs/promises";
import path from "node:path";

const getCheckTemplate = (modelName: string, checkStatement: string) => {
	return `
import { z } from "zod";
import { ${modelName}Schema } from "../prisma/zod";
import * as Utils from "./utils";
import type { ${modelName} } from "../prisma/generated/client";

type ${modelName}SchemaType = z.infer<typeof ${modelName}Schema>;

${checkStatement}
`;
};

const UTILS_CONTENT = `
export type Equal<X, Y> =
  [X] extends [Y]
    ? ([Y] extends [X] ? true : false)
    : false;
export type Expect<T extends true> = T;
`;

const defaultGetStatement = (modelName: string) => {
	return `export type Result = Utils.Expect<Utils.Equal<${modelName}SchemaType, ${modelName}>>;`;
};

export async function runTypeTest(
	cwd: string,
	getCheckStatement: (modelName: string) => string = defaultGetStatement,
	extraUtils: string = ""
) {
	const tmpDir = path.join(cwd, "tmp");
	const zodDir = path.join(cwd, "prisma/zod");

	await Bun.$`bunx --bun prisma generate`.cwd(cwd);
	await Bun.write(path.join(tmpDir, "utils.ts"), `${UTILS_CONTENT}\n${extraUtils}`);

	const files = await readdir(zodDir);
	const modelNames = files
		.filter((f) => f.endsWith(".ts") && f !== "index.ts")
		.map((f) => f.replace(/\.ts$/, ""));

	for (const modelName of modelNames) {
		const checkStatement = getCheckStatement(modelName) || defaultGetStatement(modelName);
		await Bun.write(
			path.join(tmpDir, `Check${modelName}.ts`),
			getCheckTemplate(modelName, checkStatement)
		);
	}

	const result =
		await Bun.$`tsgo --noEmit --ignoreConfig --allowImportingTsExtensions true ./tmp/*.ts`.cwd(
			cwd
		);
	return result.exitCode;
}
