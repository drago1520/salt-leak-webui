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
  getData: (request: AgGridQuery) => Promise<{ rows: unknown[]; lastRow: number }>;
  createWhereSql: (request: Pick<AgGridQuery, 'filterModel'>) => string;
  createOrderBySql: (request: Pick<AgGridQuery, 'sortModel'>) => string;
  createLimitOffsetSql: (request: Pick<AgGridQuery, 'startRow' | 'endRow'>) => string;
  getLastRow: (request: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => number;
  cutResultsToPageSize: (request: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => unknown[];
};

export type QueryParts = {
  whereSql: string;
  orderBySql: string;
  limitOffsetSql: string;
};

type SqlServiceConfig = {
  query: (parts: QueryParts) => Promise<unknown[]>;
  textFilters: Record<string, (key: string, item: TextFilterModel) => string>;
  numberFilters: Record<string, (key: string, item: NumberFilterModel) => string>;
  bigintFilters: Record<string, (key: string, item: BigIntFilterModel) => string>;
  dateFilters: Record<string, (key: string, item: DateFilterModel) => string>;
  datePresetFilters: Record<string, (key: string) => string>;
};

export const createSqlService = ({
  query,
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
      const parts: QueryParts = {
        whereSql: service.createWhereSql(request),
        orderBySql: service.createOrderBySql(request),
        limitOffsetSql: service.createLimitOffsetSql(request),
      };
      const results = await query(parts);
      const rows = service.cutResultsToPageSize(request, results);
      const lastRow = service.getLastRow(request, results);

      return { rows, lastRow };
    },

    createWhereSql: ({ filterModel }: Pick<AgGridQuery, 'filterModel'>) => {
      const filterParts = Object.entries((filterModel ?? {}) as Record<string, SupportedFilterModel>).map(
        ([key, item]) => filter(key, item),
      );
      return filterParts.length ? ` where ${filterParts.join(' and ')}` : '';
    },

    createOrderBySql: ({ sortModel }: Pick<AgGridQuery, 'sortModel'>) => {
      if (!sortModel?.length) return '';
      return ` order by ${sortModel.map(item => `${item.colId} ${item.sort}`).join(', ')}`;
    },

    createLimitOffsetSql: ({ startRow, endRow }: Pick<AgGridQuery, 'startRow' | 'endRow'>) =>
      endRow !== undefined && startRow !== undefined ? ` limit ${endRow - startRow + 1} offset ${startRow}` : '',

    getLastRow: ({ startRow, endRow }: Pick<AgGridQuery, 'startRow' | 'endRow'>, results: unknown[]) => {
      if (!results?.length) return startRow;
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
