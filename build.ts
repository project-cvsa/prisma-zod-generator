await Bun.build({
	entrypoints: ["./src/index.ts"],
	target: "node",
	outdir: "./dist",
	external: ["@prisma/generator-helper"],
	packages: "external",
	format: "esm",
});
