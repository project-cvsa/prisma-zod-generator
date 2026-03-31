export const SERIALIZED = `
export type Serialized<T, X> = T extends Date
	? X
	: T extends Array<infer U>
		? Array<Serialized<U, X>>
		: T extends object
			? { [K in keyof T]: Serialized<T[K], X> }
			: T;
`;
