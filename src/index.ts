#!/usr/bin/env node
import { generatorHandler } from "@prisma/generator-helper";
import { version } from "../package.json";
import { runGenerator } from "./generator";

generatorHandler({
	onGenerate: runGenerator,
	onManifest: () => ({
		version,
		defaultOutput: "./zod",
		prettyName: "prisma-zod",
	}),
});
