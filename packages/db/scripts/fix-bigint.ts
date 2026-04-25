const path = 'src/drizzle-kit/schema.ts';
const schema = await Bun.file(path).text();
await Bun.write(path, schema.replaceAll(/bigint\(([^)]*){ mode: "number" }([^)]*)\)/g, 'bigint($1{ mode: "bigint" }$2)'));
