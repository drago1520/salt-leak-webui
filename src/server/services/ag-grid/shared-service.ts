import type {
  BigIntFilterModel,
  DateFilterModel,
  FilterModel,
  ICombinedSimpleModel,
  IMultiFilterModel,
  NumberFilterModel,
  SetFilterModel,
  TextFilterModel,
} from 'ag-grid-community';
import { AgGridQuery } from './schema'; //I need to combine shared-service.ts and postgres-service.ts into 1; I can also simplify.

type SimpleFilterModel = TextFilterModel | NumberFilterModel | DateFilterModel | BigIntFilterModel;
type CombinedSimpleFilterModel =
  | ICombinedSimpleModel<TextFilterModel>
  | ICombinedSimpleModel<NumberFilterModel>
  | ICombinedSimpleModel<DateFilterModel>
  | ICombinedSimpleModel<BigIntFilterModel>;
type SupportedFilterModel = SimpleFilterModel | CombinedSimpleFilterModel; //| SetFilterModel | IMultiFilterModel;

type SqlService = {
  getData: (request: AgGridQuery) => Promise<{ rows: unknown[]; lastRow: number | undefined }>;
  buildSql: (request: AgGridQuery) => string;
  createWhereSql: (request: Pick<AgGridQuery, 'filterModel'>) => string;
  createOrderBySql: (request: Pick<AgGridQuery, 'sortModel'>) => string;
  createLimitOffsetSql: (request: Pick<AgGridQuery, 'startRow' | 'endRow'>) => string;
  getRowCount: (request: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => number | undefined;
  cutResultsToPageSize: (request: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => unknown[];
};

type SqlServiceConfig = {
  query: (sql: string) => Promise<unknown[]>;
  tableName: string;
  textFilters: Record<string, (key: string, item: TextFilterModel) => string>;
  numberFilters: Record<string, (key: string, item: NumberFilterModel) => string>;
  bigintFilters: Record<string, (key: string, item: BigIntFilterModel) => string>;
  dateFilters: Record<string, (key: string, item: DateFilterModel) => string>;
  datePresetFilters: Record<string, (key: string) => string>;
};

export const createSqlService = ({
  query,
  tableName,
  textFilters,
  numberFilters,
  bigintFilters,
  dateFilters,
  datePresetFilters,
}: SqlServiceConfig): SqlService => {
  //used for sub-parts (simple filters) of a CombinedSimpleFilterModel
  const leafFilter = (key: string, item: SimpleFilterModel) => {
    if (item.type == null) throw new Error(`Missing filter type for column: ${key}`);

    switch (item.filterType) {
      case 'text': {
        const filter = textFilters[item.type];

        if (!filter) throw new Error(`Unsupported ${item.filterType} filter type: ${item.type}`);

        return filter(key, item);
      }
      case 'bigint': {
        const filter = bigintFilters[item.type];

        if (!filter) throw new Error(`Unsupported ${item.filterType} filter type: ${item.type}`);

        return filter(key, item);
      }
      case 'number': {
        const filter = numberFilters[item.type];

        if (!filter) throw new Error(`Unsupported ${item.filterType} filter type: ${item.type}`);

        return filter(key, item);
      }
      case 'date': {
        const presetFilter = datePresetFilters[item.type];

        if (presetFilter) return presetFilter(key);

        const filter = dateFilters[item.type];

        if (!filter) throw new Error(`Unsupported ${item.filterType} filter type: ${item.type}`);

        return filter(key, item);
      }
      default:
        throw new Error(`Unsupported filter type: ${item.filterType}`);
    }
  };

  const filter = (key: string, item: SupportedFilterModel | null | undefined): string => {
    if (!item) throw new Error(`Missing filter model for column: ${key}`);

    if (!('conditions' in item)) return leafFilter(key, item);

    const parts = item.conditions.map(condition => filter(key, condition));
    return `(${parts.join(item.operator === 'OR' ? ' or ' : ' and ')})`;
  };

  const service: SqlService = {
    getData: async (request: AgGridQuery) => {
      console.log('request :', request);
      const sql = service.buildSql(request);
      const results = await query(sql);
      const rows = service.cutResultsToPageSize(request, results);
      const lastRow = service.getRowCount(request, results);

      return { rows, lastRow };
    },

    buildSql: (request: AgGridQuery) => {
      const sql = [
        ' select *',
        ` FROM ${tableName} `,
        service.createWhereSql(request),
        service.createOrderBySql(request),
        service.createLimitOffsetSql(request),
      ].join('');

      console.log(sql, '\r\n\n\n');
      return sql;
    },

    createWhereSql: ({ filterModel }: Pick<AgGridQuery, 'filterModel'>) => {
      const simpleFilterModel = (filterModel ?? null) as FilterModel | null;
      const filterEntries = Object.entries((simpleFilterModel ?? {}) as Record<string, SupportedFilterModel>);
      const filterParts = filterEntries.map(([key, item]) => filter(key, item));

      return filterParts.length ? ` where ${filterParts.join(' and ')}` : '';
    },

    createOrderBySql: ({ sortModel }: Pick<AgGridQuery, 'sortModel'>) => {
      if (!sortModel) return '';

      const sortParts = sortModel.map(item => `${item.colId} ${item.sort}`);

      return sortParts.length ? ` order by ${sortParts.join(', ')}` : '';
    },

    createLimitOffsetSql: ({ startRow, endRow }: Pick<AgGridQuery, 'startRow' | 'endRow'>) =>
      endRow !== undefined && startRow !== undefined ? ` limit ${endRow - startRow + 1} offset ${startRow}` : '',

    getRowCount: ({ startRow, endRow }: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => {
      if (!results?.length) return undefined;

      if (startRow === undefined || endRow === undefined) return results.length;

      const currentLastRow = startRow + results.length;
      return currentLastRow <= endRow ? currentLastRow : -1;
    },

    cutResultsToPageSize: ({ startRow, endRow }: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => {
      if (startRow === undefined || endRow === undefined) return results;

      const pageSize = endRow - startRow;
      return results.length > pageSize ? results.slice(0, pageSize) : results;
    },
  };

  return service;
};
