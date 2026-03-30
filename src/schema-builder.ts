import type { Field, Model, DatamodelEnum } from "@prisma/dmmf";
import type { EnumMap } from "./types";
import type { GeneratorOptions } from "@prisma/generator-helper";

const TYPE_MAP: Record<string, string> = {
	String: "z.string()",
	BigInt: "z.bigint()",
	Int: "z.number().int()",
	Float: "z.number()",
	Boolean: "z.boolean()",
	DateTime: "z.coerce.date()",
	Json: "JsonValueSchema",
	Decimal: "z.number()",
};

const JSON_VALUE_SCHEMA_DEFINITION = `const JsonValueSchema: z.ZodType<JsonValue> = z.lazy((): z.ZodType<JsonValue> =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(JsonValueSchema),
		z.record(z.string(), JsonValueSchema),
	])
);

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue | undefined };
type JsonArray = Array<JsonValue>;`;

function getBaseZodType(field: Field, enumMap: EnumMap): string | null {
	if (field.type === "Json") return null;
	const result = TYPE_MAP[field.type];
	if (result) return result;
	if (field.kind === "enum") {
		const values = enumMap.get(field.type);
		if (!values) return null;
		return `z.enum(${JSON.stringify(values)})`;
	}
	return null;
}

function applyModifiers(zodType: string, field: Field): string {
	let result = zodType;
	if (field.isList) result += ".array()";
	if (!field.isRequired) result += ".nullable()";
	return result;
}

function getJsonFieldLine(field: Field, useExtendSchema: boolean = false): string {
	const identifierRegex = /\[([\p{ID_Start}_$][\p{ID_Continue}_$]*)\]/u;
	const identifierMatchResult = field.documentation?.match(identifierRegex);
	if (useExtendSchema && identifierMatchResult) {
		const identifier = identifierMatchResult[1];
		let result = `ExtendSchema.${identifier}`;
		if (!field.isRequired) result += ".nullable()";
		return `\t${field.name}: ${result},`;
	}
	let result = `JsonValueSchema`;
	if (field.isList) result += ".array()";
	if (!field.isRequired) result += ".nullable()";
	return `\t${field.name}: ${result},`;
}

export function generateModelFile(
	model: Model,
	enumMap: EnumMap,
	options: GeneratorOptions
): string {
	const hasJsonFields = model.fields.some((f) => f.type === "Json");
	const extendSchemaFile = (() => {
		const extendSchemaFile = options.generator.config.extendSchema;
		if (typeof extendSchemaFile === "string") {
			return extendSchemaFile;
		}
		return null;
	})();

	const lines: string[] = ['import { z } from "zod";'];

	if (extendSchemaFile) {
		lines.push(`import * as ExtendSchema from "../${extendSchemaFile}";`);
	}

	if (hasJsonFields) {
		lines.push("", JSON_VALUE_SCHEMA_DEFINITION);
	}

	const fieldLines = model.fields
		.map((field) => {
			if (field.type === "Json") {
				return getJsonFieldLine(field, extendSchemaFile !== null);
			}
			const base = getBaseZodType(field, enumMap);
			return base ? `\t${field.name}: ${applyModifiers(base, field)},` : null;
		})
		.filter(Boolean)
		.join("\n");

	lines.push("", `export const ${model.name}Schema = z.object({`, fieldLines, "});");

	return lines.join("\n");
}

export function generateEnumFile(soureEnum: DatamodelEnum): string {
	const lines: string[] = ['import { z } from "zod";'];

	const values = soureEnum.values.map((item) => item.name);

	lines.push("", `export const ${soureEnum.name}Schema = z.enum(${JSON.stringify(values)})`);

	return lines.join("\n");
}
