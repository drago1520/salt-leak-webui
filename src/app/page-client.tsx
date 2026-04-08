'use client';

import { AllCommunityModule } from 'ag-grid-community';
import { AgGridProvider } from 'ag-grid-react';
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { agGridTheme } from '@/lib/theme';
import { columnNamesSensorReading, SelectSensorReading } from '@/lib/db-types';
/**
 * 300196823040004096n
    300197074698248193n
    300197326356492290n
 */
export default function Grid({ rows }: { rows: SelectSensorReading[] }) {
  // prettier-ignore
  const rowData: SelectSensorReading[] = [
    { id: 300196823040004096n, receivedAt: '2026-04-08 09:15:00', rawLine: 'dc=3 machine=14 box=1 boost=47.8 p=[8.4,11.2,9.7,15.6,6.3,18.9]', p1Ohms: 8.4, p2Ohms: 11.2, p3Ohms: 9.7, p4Ohms: 15.6, p5Ohms: 6.3, p6Ohms: 18.9, p1StatusCode: 1, p2StatusCode: 0, p3StatusCode: 1, p4StatusCode: 0, p5StatusCode: 1, p6StatusCode: 0, boostVoltageV: 47.8, boxStatusCode: 1, datacenterId: 3, machineId: 14 },
    { id: 300197074698248193n, receivedAt: '2026-04-08 09:16:00', rawLine: 'dc=12 machine=7 box=1 boost=48.2 p=[12.5,7.1,14.8,9.9,16.4,5.8]', p1Ohms: 12.5, p2Ohms: 7.1, p3Ohms: 14.8, p4Ohms: 9.9, p5Ohms: 16.4, p6Ohms: 5.8, p1StatusCode: 0, p2StatusCode: 1, p3StatusCode: 0, p4StatusCode: 1, p5StatusCode: 0, p6StatusCode: 1, boostVoltageV: 48.2, boxStatusCode: 1, datacenterId: 12, machineId: 7 },
    { id: 300197326356492290n, receivedAt: '2026-04-08 09:17:00', rawLine: 'dc=31 machine=0 box=1 boost=48.5 p=[19.4,13.2,10.0,4.6,8.8,17.3]', p1Ohms: 19.4, p2Ohms: 13.2, p3Ohms: 10.0, p4Ohms: 4.6, p5Ohms: 8.8, p6Ohms: 17.3, p1StatusCode: 0, p2StatusCode: 0, p3StatusCode: 0, p4StatusCode: 1, p5StatusCode: 1, p6StatusCode: 0, boostVoltageV: 48.5, boxStatusCode: 1, datacenterId: 31, machineId: 0 },
  ];

  const colDefs = columnNamesSensorReading.map(field => ({ field }));
  return (
    <div>
      <p></p>
      <AgGridProvider modules={[AllCommunityModule]}>
        <div className="h-150 w-full">
          <AgGridReact
            //@ts-ignore-error too many overloads I guess
            columnDefs={colDefs}
            rowData={rows}
            theme={agGridTheme}
            rowSelection={{ mode: 'multiRow' }}
            defaultColDef={{ filter: true }}
          />
        </div>
      </AgGridProvider>
    </div>
  );
}
