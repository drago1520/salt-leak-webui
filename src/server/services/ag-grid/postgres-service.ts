import type { BigIntFilterModel, DateFilterModel, NumberFilterModel, TextFilterModel } from 'ag-grid-community';
import { createSqlService } from './shared-service';
import { sql } from 'drizzle-orm';
import { db } from '@/server/db/db';
import { dateRangeSql, postgresTimestampLiteral, sqlStringLiteral, validateBigInt } from './goodies';

const textFilters: Record<string, (key: string, item: TextFilterModel) => string> = {
  equals: (key, item) => `${key} = ${sqlStringLiteral(String(item.filter ?? ''))}`,
  notEqual: (key, item) => `${key} != ${sqlStringLiteral(String(item.filter ?? ''))}`,
  contains: (key, item) => `${key} like ${sqlStringLiteral(`%${String(item.filter ?? '')}%`)}`,
  notContains: (key, item) => `${key} not like ${sqlStringLiteral(`%${String(item.filter ?? '')}%`)}`,
  startsWith: (key, item) => `${key} like ${sqlStringLiteral(`${String(item.filter ?? '')}%`)}`,
  endsWith: (key, item) => `${key} like ${sqlStringLiteral(`%${String(item.filter ?? '')}`)}`,
};

const numberFilters: Record<string, (key: string, item: NumberFilterModel) => string> = {
  equals: (key, item) => `${key} = ${item.filter}`,
  notEqual: (key, item) => `${key} != ${item.filter}`,
  greaterThan: (key, item) => `${key} > ${item.filter}`,
  greaterThanOrEqual: (key, item) => `${key} >= ${item.filter}`,
  lessThan: (key, item) => `${key} < ${item.filter}`,
  lessThanOrEqual: (key, item) => `${key} <= ${item.filter}`,
  inRange: (key, item) => `(${key} >= ${item.filter} and ${key} <= ${item.filterTo})`,
};

const bigintFilters: Record<string, (key: string, item: BigIntFilterModel) => string> = {
  equals: (key, item) => `${key} = ${validateBigInt(item.filter)}`,
  notEqual: (key, item) => `${key} != ${validateBigInt(item.filter)}`,
  greaterThan: (key, item) => `${key} > ${validateBigInt(item.filter)}`,
  greaterThanOrEqual: (key, item) => `${key} >= ${validateBigInt(item.filter)}`,
  lessThan: (key, item) => `${key} < ${validateBigInt(item.filter)}`,
  lessThanOrEqual: (key, item) => `${key} <= ${validateBigInt(item.filter)}`,
  inRange: (key, item) => `(${key} >= ${validateBigInt(item.filter)} and ${key} <= ${validateBigInt(item.filterTo)})`,
  blank: key => `${key} is null`,
  notBlank: key => `${key} is not null`,
};

const dateFilters = {
  equals: (key: string, item: DateFilterModel) =>
    dateRangeSql(
      key,
      postgresTimestampLiteral(item.dateFrom),
      `${postgresTimestampLiteral(item.dateFrom)} + INTERVAL '1 day'`,
    ),
  notEqual: (key: string, item: DateFilterModel) =>
    `${key} is not null and not (${dateRangeSql(
      key,
      postgresTimestampLiteral(item.dateFrom),
      `${postgresTimestampLiteral(item.dateFrom)} + INTERVAL '1 day'`,
    )})`,
  greaterThan: (key: string, item: DateFilterModel) =>
    `${key} >= ${postgresTimestampLiteral(item.dateFrom)} + INTERVAL '1 day'`,
  greaterThanOrEqual: (key: string, item: DateFilterModel) => `${key} >= ${postgresTimestampLiteral(item.dateFrom)}`,
  lessThan: (key: string, item: DateFilterModel) => `${key} < ${postgresTimestampLiteral(item.dateFrom)}`,
  lessThanOrEqual: (key: string, item: DateFilterModel) =>
    `${key} < ${postgresTimestampLiteral(item.dateFrom)} + INTERVAL '1 day'`,
  inRange: (key: string, item: DateFilterModel) =>
    dateRangeSql(
      key,
      postgresTimestampLiteral(item.dateFrom),
      `${postgresTimestampLiteral(item.dateTo)} + INTERVAL '1 day'`,
    ),
  blank: (key: string) => `${key} is null`,
  notBlank: (key: string) => `${key} is not null`,
};

const datePresetFilters = {
  today: (key: string) => dateRangeSql(key, 'CURRENT_DATE', "CURRENT_DATE + INTERVAL '1 day'"),
  yesterday: (key: string) => dateRangeSql(key, "CURRENT_DATE - INTERVAL '1 day'", 'CURRENT_DATE'),
  tomorrow: (key: string) => dateRangeSql(key, "CURRENT_DATE + INTERVAL '1 day'", "CURRENT_DATE + INTERVAL '2 day'"),
  thisWeek: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('week', CURRENT_DATE)::date",
      "date_trunc('week', CURRENT_DATE)::date + INTERVAL '7 day'",
    ),
  lastWeek: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('week', CURRENT_DATE)::date - INTERVAL '7 day'",
      "date_trunc('week', CURRENT_DATE)::date",
    ),
  nextWeek: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('week', CURRENT_DATE)::date + INTERVAL '7 day'",
      "date_trunc('week', CURRENT_DATE)::date + INTERVAL '14 day'",
    ),
  thisMonth: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('month', CURRENT_DATE)::date",
      "date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month'",
    ),
  lastMonth: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('month', CURRENT_DATE)::date - INTERVAL '1 month'",
      "date_trunc('month', CURRENT_DATE)::date",
    ),
  nextMonth: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('month', CURRENT_DATE)::date + INTERVAL '1 month'",
      "date_trunc('month', CURRENT_DATE)::date + INTERVAL '2 month'",
    ),
  thisQuarter: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('quarter', CURRENT_DATE)::date",
      "date_trunc('quarter', CURRENT_DATE)::date + INTERVAL '3 month'",
    ),
  lastQuarter: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('quarter', CURRENT_DATE)::date - INTERVAL '3 month'",
      "date_trunc('quarter', CURRENT_DATE)::date",
    ),
  nextQuarter: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('quarter', CURRENT_DATE)::date + INTERVAL '3 month'",
      "date_trunc('quarter', CURRENT_DATE)::date + INTERVAL '6 month'",
    ),
  thisYear: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('year', CURRENT_DATE)::date",
      "date_trunc('year', CURRENT_DATE)::date + INTERVAL '1 year'",
    ),
  lastYear: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('year', CURRENT_DATE)::date - INTERVAL '1 year'",
      "date_trunc('year', CURRENT_DATE)::date",
    ),
  nextYear: (key: string) =>
    dateRangeSql(
      key,
      "date_trunc('year', CURRENT_DATE)::date + INTERVAL '1 year'",
      "date_trunc('year', CURRENT_DATE)::date + INTERVAL '2 year'",
    ),
  yearToDate: (key: string) =>
    dateRangeSql(key, "date_trunc('year', CURRENT_DATE)::date", "CURRENT_DATE + INTERVAL '1 day'"),
  last7Days: (key: string) => dateRangeSql(key, "CURRENT_DATE - INTERVAL '7 day'", "CURRENT_DATE + INTERVAL '1 day'"),
  last30Days: (key: string) => dateRangeSql(key, "CURRENT_DATE - INTERVAL '30 day'", "CURRENT_DATE + INTERVAL '1 day'"),
  last90Days: (key: string) => dateRangeSql(key, "CURRENT_DATE - INTERVAL '90 day'", "CURRENT_DATE + INTERVAL '1 day'"),
  last6Months: (key: string) =>
    dateRangeSql(key, "CURRENT_DATE - INTERVAL '6 month'", "CURRENT_DATE + INTERVAL '1 day'"),
  last12Months: (key: string) =>
    dateRangeSql(key, "CURRENT_DATE - INTERVAL '12 month'", "CURRENT_DATE + INTERVAL '1 day'"),
  last24Months: (key: string) =>
    dateRangeSql(key, "CURRENT_DATE - INTERVAL '24 month'", "CURRENT_DATE + INTERVAL '1 day'"),
};

const postgresService = createSqlService({
  query: async (query: string) => {
    const result = await db.execute(sql.raw(query));
    return result.rows as unknown[];
  },
  tableName: 'sensor_readings',
  textFilters,
  numberFilters,
  bigintFilters,
  dateFilters,
  datePresetFilters,
});

export default postgresService;
