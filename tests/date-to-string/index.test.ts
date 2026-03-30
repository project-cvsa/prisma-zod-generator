import { expect, test, afterAll, beforeAll } from "bun:test";
import { rm } from "node:fs/promises";
import path from "node:path";
import { runTypeTest } from "../shared/run-type-test";

const cwd = import.meta.dir;
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
		const result = await runTypeTest(cwd, "date-to-string", "string");
		expect(result.exitCode).toBe(0);
	},
	30 * SECOND
);
