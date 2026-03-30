import type z from "zod";
import type { LogMetaType } from "./zod-schema";

declare global {
	namespace PrismaJson {
		type LogMetaType = z.infer<typeof LogMetaType>;
	}
}
