'use client';

import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { agGridTheme } from '@/lib/theme';
import { SelectSensorReading } from '@/lib/db-goodies';
import { trpc } from '@/lib/trpc-client';
/**
 * 300196823040004096n
    300197074698248193n
    300197326356492290n
 */
export default function Grid() {
  // prettier-ignore
  const rowData: SelectSensorReading[] = [
    { id: 300196823040004096n, receivedAt: '2026-04-08 09:15:00', rawLine: 'dc=3 machine=14 box=1 boost=47.8 p=[8.4,11.2,9.7,15.6,6.3,18.9]', p1Ohms: 8.4, p2Ohms: 11.2, p3Ohms: 9.7, p4Ohms: 15.6, p5Ohms: 6.3, p6Ohms: 18.9, p1StatusCode: 1, p2StatusCode: 0, p3StatusCode: 1, p4StatusCode: 0, p5StatusCode: 1, p6StatusCode: 0, boostVoltageV: 47.8, boxStatusCode: 1n, datacenterId: 3, machineId: 14 },
    { id: 300197074698248193n, receivedAt: '2026-04-08 09:16:00', rawLine: 'dc=12 machine=7 box=1 boost=48.2 p=[12.5,7.1,14.8,9.9,16.4,5.8]', p1Ohms: 12.5, p2Ohms: 7.1, p3Ohms: 14.8, p4Ohms: 9.9, p5Ohms: 16.4, p6Ohms: 5.8, p1StatusCode: 0, p2StatusCode: 1, p3StatusCode: 0, p4StatusCode: 1, p5StatusCode: 0, p6StatusCode: 1, boostVoltageV: 48.2, boxStatusCode: 1n, datacenterId: 12, machineId: 7 },
    { id: 300197326356492290n, receivedAt: '2026-04-08 09:17:00', rawLine: 'dc=31 machine=0 box=1 boost=48.5 p=[19.4,13.2,10.0,4.6,8.8,17.3]', p1Ohms: 19.4, p2Ohms: 13.2, p3Ohms: 10.0, p4Ohms: 4.6, p5Ohms: 8.8, p6Ohms: 17.3, p1StatusCode: 0, p2StatusCode: 0, p3StatusCode: 0, p4StatusCode: 1, p5StatusCode: 1, p6StatusCode: 0, boostVoltageV: 48.5, boxStatusCode: 1n, datacenterId: 31, machineId: 0 },
  ];
  // prettier-ignore
  const dateFilterOptions = ['empty','equals','notEqual','lessThan','lessThanOrEqual','greaterThan','greaterThanOrEqual','inRange','blank','notBlank','today','yesterday','tomorrow','thisWeek','lastWeek','nextWeek','thisMonth','lastMonth','nextMonth','thisQuarter','lastQuarter','nextQuarter','thisYear','lastYear','nextYear','yearToDate','last7Days','last30Days','last90Days','last6Months','last12Months','last24Months'];
  const colDefs = [
    { field: 'id', filter: 'agBigIntColumnFilter', sortable: true, sort: 'desc' },
    {
      field: 'received_at',
      filter: 'agDateColumnFilter',
      filterParams: {
        filterOptions: dateFilterOptions,
      },
    },
    { field: 'datacenter_id', filter: 'agNumberColumnFilter' },
    { field: 'machine_id', filter: 'agNumberColumnFilter' },
    { field: 'raw_line', filter: 'agTextColumnFilter' },
    { field: 'p1_ohms', filter: 'agNumberColumnFilter' },
    { field: 'p2_ohms', filter: 'agNumberColumnFilter' },
    { field: 'p3_ohms', filter: 'agNumberColumnFilter' },
    { field: 'p4_ohms', filter: 'agNumberColumnFilter' },
    { field: 'p5_ohms', filter: 'agNumberColumnFilter' },
    { field: 'p6_ohms', filter: 'agNumberColumnFilter' },
    { field: 'p1_status_code', filter: 'agNumberColumnFilter' },
    { field: 'p2_status_code', filter: 'agNumberColumnFilter' },
    { field: 'p3_status_code', filter: 'agNumberColumnFilter' },
    { field: 'p4_status_code', filter: 'agNumberColumnFilter' },
    { field: 'p5_status_code', filter: 'agNumberColumnFilter' },
    { field: 'p6_status_code', filter: 'agNumberColumnFilter' },
    { field: 'boost_voltage_v', filter: 'agNumberColumnFilter' },
    { field: 'box_status_code', filter: 'agBigIntColumnFilter' },
  ];
  return (
    <div>
      <AgGridProvider modules={[AllCommunityModule]}>
        <div className="h-150 w-full">
          <AgGridReact
            //@ts-expect-error too many overloads I guess
            columnDefs={colDefs}
            // rowData={rows}
            theme={agGridTheme}
            rowSelection={{ mode: 'multiRow', headerCheckbox: false, checkboxes: true }}
            defaultColDef={{ filter: true, sortable: false, filterParams: { maxNumConditions: 20 } }}
            rowModelType="infinite"
            debug={process.env.NODE_ENV == 'development'}
            datasource={{
              async getRows({ startRow, endRow, sortModel, filterModel, successCallback, failCallback }) {
                try {
                  const { rows, lastRow } = await trpc.agGridSensorReadingsQuery.query({
                    startRow,
                    endRow,
                    sortModel,
                    filterModel,
                  });
                  successCallback(rows, lastRow);
                } catch (error) {
                  failCallback();
                  console.error('error :', error);
                }
              },
            }}
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
