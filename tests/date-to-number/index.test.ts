import { expect, test, afterAll, beforeAll } from "vitest";
import { rm } from "node:fs/promises";
import path from "node:path";
import { runTypeTest, SERIALIZED, getCheckStatement } from "../shared";

const cwd = import.meta.dirname;
const tmpDir = path.join(cwd, "tmp");
const SECOND = 1000;

beforeAll(async () => {
	await rm(tmpDir, { recursive: true, force: true });
});

afterAll(async () => {
	await rm(tmpDir, { recursive: true, force: true });
});

test(
	"dateSchema = 'string' works",
	async () => {
		const result = await runTypeTest(cwd, (m) => getCheckStatement(m, "number"), SERIALIZED);
		expect(result).toBe(0);
	},
	30 * SECOND
);
