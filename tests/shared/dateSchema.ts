export const getCheckStatement = (modelName: string, type: string) =>
	`export type Result = Utils.Expect<Utils.Equal<${modelName}SchemaType, Utils.Serialized<${modelName}, ${type}>>>;`;
