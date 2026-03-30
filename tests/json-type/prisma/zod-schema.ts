import z from "zod";

export const LogMetaType = z.object({
	timestamp: z.number(),
	host: z.string(),
});
