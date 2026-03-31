import type { Field, Model, DatamodelEnum } from "@prisma/dmmf";
import type { EnumMap } from "./types";
import type { GeneratorOptions } from "@prisma/generator-helper";

export type DateSchemaOption = "default" | "string" | "number";
export type BigIntSchemaOption = "default" | "number" | "union" | "string";

function getDateTimeSchema(option: DateSchemaOption): string {
	switch (option) {
		case "string":
			return "z.string()";
		case "number":
			return "z.number()";
		default:
			return "z.coerce.date()";
	}
}

function getBigIntSchema(option: BigIntSchemaOption): string {
	switch (option) {
		case "number":
			return "z.number()";
		case "string":
			return "z.string()";
		case "union":
			return "z.union([z.bigint(), z.number()])";
		default:
			return "z.bigint()";
	}
}

const TYPE_MAP: Record<string, string> = {
	String: "z.string()",
	Int: "z.number().int()",
	Float: "z.number()",
	Boolean: "z.boolean()",
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

function getBaseZodType(
	field: Field,
	enumMap: EnumMap,
	dateSchema: DateSchemaOption = "default"
): string | null {
	if (field.type === "Json") return null;
	if (field.type === "DateTime") {
		return getDateTimeSchema(dateSchema);
	}
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
		return `\t${field.name}: ${applyModifiers(`ExtendSchema.${identifier}`, field)},`;
	}
	return `\t${field.name}: ${applyModifiers(`JsonValueSchema`, field)},`;
}

function getBigintFieldLine(field: Field, bigintSchema: BigIntSchemaOption): string {
	const identifierRegex = /\[(string|default|number|union)\]/;
	const identifierMatchResult = field.documentation?.match(identifierRegex);
	if (identifierMatchResult?.[1]) {
		const identifier = identifierMatchResult[1] as BigIntSchemaOption;
		return `\t${field.name}: ${applyModifiers(getBigIntSchema(identifier), field)},`;
	}
	return `\t${field.name}: ${applyModifiers(getBigIntSchema(bigintSchema), field)},`;
}

function getDateTimeFieldLine(field: Field, dateSchema: DateSchemaOption): string {
	const identifierRegex = /\[(string|default|number)\]/;
	const identifierMatchResult = field.documentation?.match(identifierRegex);
	if (identifierMatchResult?.[1]) {
		const identifier = identifierMatchResult[1] as DateSchemaOption;
		return `\t${field.name}: ${applyModifiers(getDateTimeSchema(identifier), field)},`;
	}
	return `\t${field.name}: ${applyModifiers(getDateTimeSchema(dateSchema), field)},`;
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

	const dateSchema = (() => {
		const config = options.generator.config.dateSchema;
		if (config === "string" || config === "number" || config === "default") {
			return config;
		}
		return "default";
	})();

	const bigintSchema = ((): BigIntSchemaOption => {
		const config = options.generator.config.bigintSchema;
		if (!config) return "default";
		if (typeof config === "object") return "default";
		if (["string", "number", "union", "default"].includes(config)) {
			return config as BigIntSchemaOption;
		}
		return "default";
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
			if (field.type === "BigInt") {
				return getBigintFieldLine(field, bigintSchema);
			}
			if (field.type === "DateTime") {
				return getDateTimeFieldLine(field, dateSchema);
			}
			const base = getBaseZodType(field, enumMap, dateSchema);
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
