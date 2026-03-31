import { expect, test, afterAll, beforeAll } from "vitest";
import { rm } from "node:fs/promises";
import path from "node:path";
import { runTypeTest } from "../shared/run-type-test";

const cwd = import.meta.dirname;
const tmpDir = path.join(cwd, "tmp");
const SECOND = 1000;

beforeAll(async () => {
	await rm(tmpDir, { recursive: true, force: true });
});

afterAll(async () => {
	await rm(tmpDir, { recursive: true, force: true });
});

const getCheckStatement = (modelName: string) => {
	if (modelName === "User") {
		return `
export type Result = Utils.Expect<
	Utils.Equal<
		${modelName}SchemaType,
		Utils.Replace<${modelName}, 'id', number>>
>;`;
	}
	return `
export type Result = Utils.Expect<
Utils.Equal<
	${modelName}SchemaType,
	Utils.Replace<${modelName}, 'id' | 'authorId', string>>
>;`
};

const extraUtils = "export type Replace<T, K extends keyof T, V> = Omit<T, K> & { [P in K]: V };";

test(
	"BigInt fields work",
	async () => {
		const result = await runTypeTest(cwd, getCheckStatement, extraUtils);
		expect(result).toBe(0);
	},
	30 * SECOND
);
