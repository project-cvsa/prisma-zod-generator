import fs from "node:fs/promises";
import path from "node:path";
import type { GeneratorOptions } from "@prisma/generator-helper";
import { generateEnumFile, generateModelFile } from "./schema-builder";
import type { EnumMap } from "./types";

export async function runGenerator(options: GeneratorOptions) {
	const models = options.dmmf.datamodel.models;
	const enums = options.dmmf.datamodel.enums;
	const enumMap: EnumMap = new Map();
	for (const enumItem of enums) {
		enumMap.set(
			enumItem.name,
			enumItem.values.map((item) => item.name)
		);
	}
	const outputDir = options.generator.output?.value ?? "./zod";

	// Prepare directory
	await fs.rm(outputDir, { recursive: true, force: true });
	await fs.mkdir(outputDir, { recursive: true });

	const exportStatements: string[] = [];

	for (const model of models) {
		const content = generateModelFile(model, enumMap);
		const filePath = path.join(outputDir, `${model.name}.ts`);

		await fs.writeFile(filePath, content, "utf-8");
		exportStatements.push(`export * from "./${model.name}";`);
	}

	for (const sourceEnum of enums) {
		const content = generateEnumFile(sourceEnum);
		const filePath = path.join(outputDir, `${sourceEnum.name}.ts`);

		await fs.writeFile(filePath, content, "utf-8");
		exportStatements.push(`export * from "./${sourceEnum.name}";`);
	}

	if (exportStatements.length > 0) {
		const indexContent = exportStatements.join("\n");
		await fs.writeFile(path.join(outputDir, "index.ts"), indexContent, "utf-8");
	}
}
