import { z } from 'zod';

const sortModelItemSchema = z.object({
  colId: z.string(),
  sort: z.enum(['asc', 'desc']),
});

const textFilterSchema = z.object({
  filterType: z.literal('text'),
  type: z.enum(['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith']),
  filter: z.string().nullable().optional(),
});

const numberFilterSchema = z.object({
  filterType: z.literal('number'),
  type: z.enum(['equals', 'notEqual', 'greaterThan', 'greaterThanOrEqual', 'lessThan', 'lessThanOrEqual', 'inRange']),
  filter: z.number().nullable().optional(),
  filterTo: z.number().nullable().optional(),
});

const bigintFilterSchema = z.object({
  filterType: z.literal('bigint'),
  type: z.enum([
    'equals',
    'notEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
    'inRange',
    'blank',
    'notBlank',
  ]),
  filter: z.string().nullable().optional(),
  filterTo: z.string().nullable().optional(),
});

const dateFilterSchema = z.object({
  filterType: z.literal('date'),
  type: z.enum([
    'equals',
    'notEqual',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual',
    'inRange',
    'blank',
    'notBlank',
    'today',
    'yesterday',
    'tomorrow',
    'thisWeek',
    'lastWeek',
    'nextWeek',
    'thisMonth',
    'lastMonth',
    'nextMonth',
    'thisQuarter',
    'lastQuarter',
    'nextQuarter',
    'thisYear',
    'lastYear',
    'nextYear',
    'yearToDate',
    'last7Days',
    'last30Days',
    'last90Days',
    'last6Months',
    'last12Months',
    'last24Months',
  ]),
  dateFrom: z.string().nullable().optional(),
  dateTo: z.string().nullable().optional(),
});

const unsupportedSetFilterSchema = z
  .object({
    filterType: z.literal('set'),
    values: z.array(z.union([z.string(), z.number(), z.null()])).optional(),
  })
  .superRefine((_, ctx) => {
    ctx.addIssue({
      code: 'custom',
      message: 'Set filters are not supported yet.',
    });
  });

const simpleLeafFilterSchema = z.discriminatedUnion('filterType', [
  textFilterSchema,
  numberFilterSchema,
  bigintFilterSchema,
  dateFilterSchema,
  unsupportedSetFilterSchema,
]);

const unsupportedMultiFilterSchema = z
  .object({
    filterType: z.literal('multi'),
    filterModels: z.array(z.unknown().nullable()).optional(),
  })
  .superRefine((_, ctx) => {
    ctx.addIssue({
      code: 'custom',
      message: 'Multi filters are not supported yet.',
    });
  });

const filterSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    simpleLeafFilterSchema,
    z.object({
      filterType: z.enum(['text', 'number', 'bigint', 'date']),
      operator: z.enum(['AND', 'OR']),
      conditions: z.array(filterSchema).min(1),
    }),
    unsupportedMultiFilterSchema,
  ]),
);

//~IServerSideGetRowsRequest without the paid stuff we don't need
export const agGridQuerySchema = z
  .object({
    startRow: z.number().int().nonnegative(),
    endRow: z.number().int().nonnegative(),
    sortModel: z.array(sortModelItemSchema),
    filterModel: z.record(z.string(), filterSchema).default({}),
  })
  .refine(data => data.endRow >= data.startRow, {
    message: 'endRow must be >= startRow',
    path: ['endRow'],
  });

export type AgGridQuery = z.infer<typeof agGridQuerySchema>;
