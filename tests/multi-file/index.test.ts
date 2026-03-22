import { expect, test, afterAll, beforeAll } from "bun:test";
import { rm } from "node:fs/promises";
import path from "node:path";
import { runTypeTest } from "../shared/run-type-test";

const cwd = import.meta.dir;
const tmpDir = path.join(cwd, "tmp");

beforeAll(async () => {
	await rm(tmpDir, { recursive: true, force: true });
});

afterAll(async () => {
	await rm(tmpDir, { recursive: true, force: true });
});

test("multi-file Prisma schema works", async () => {
	const result = await runTypeTest(cwd, "multi-file");
	expect(result.exitCode).toBe(0);
});
