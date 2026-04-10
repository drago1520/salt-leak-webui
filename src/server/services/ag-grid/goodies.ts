export const escapeSqlString = (value: string) => value.replace(/'/g, "''");
export const validateBigInt = (value: string | null | undefined) => {
  if (value === null || value === undefined) return value;
  if (/^-?\d+$/.test(value)) return value;
  throw new Error(`Invalid bigint filter value: ${value}`);
};
export const validateDate = (value: string | null | undefined) => {
  if (value === null || value === undefined) return value;

  const normalizedValue = value.replace('T', ' ');

  if (/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/.test(normalizedValue)) return normalizedValue.slice(0, 10);
  throw new Error(`Invalid date filter value: ${value}`);
};
export const sqlStringLiteral = (value: string) => `'${escapeSqlString(value)}'`;
export const dateRangeSql = (key: string, start: string, end: string) => `${key} >= ${start} and ${key} < ${end}`;
export const postgresTimestampLiteral = (value: string | null | undefined) =>
  `TIMESTAMP ${sqlStringLiteral(`${validateDate(value)} 00:00:00`)}`;
