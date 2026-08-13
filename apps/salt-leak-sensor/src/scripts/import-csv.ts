import { $ } from "bun";

const [_, __, DB_URL, TABLE, CSV_PATH] = Bun.argv,
  start = performance.now();

await $`psql ${DB_URL} -c ${`\\copy ${TABLE} from '${CSV_PATH}' with (format csv, header true)`}`;

console.log(`Script took ${(performance.now() - start) / 1000}s.`)