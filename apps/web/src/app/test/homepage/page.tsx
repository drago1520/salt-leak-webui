'use client';
import { AgCharts } from 'ag-charts-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import { AgCartesianChartOptions, AllCommunityModule, ModuleRegistry } from 'ag-charts-community';
import { SensorReadingEvent } from '@/server/services/sensor-ingestion/sensor-events-SSE';

const config = {
  active: { label: 'Active', dot: 'bg-success' },
  failing: { label: 'Failing', dot: 'bg-destructive' },
  inactive: { label: 'Inactive', dot: 'border border-gray-300 bg-transparent' },
} as const;

type SensorType = keyof typeof config;

const sensors: Record<
  SensorType,
  {
    name: string;
    meta: string;
    value: number | null;
    unit: string;
    sparkline: (number | null)[];
  }[]
> = {
  active: [
    { name: 'Salt-01', meta: 'Room A', value: 72, unit: ' kΩ', sparkline: [18, 21, 24, 28, 31, 27, 25] },
    { name: 'Temp-02', meta: 'Room B', value: 69, unit: '°F', sparkline: [14, 16, 19, 22, 24, 21, 20] },
    { name: 'Humid-01', meta: 'Floor 2', value: 54, unit: '%', sparkline: [35, 38, 41, 44, 42, 40, 39] },
    { name: 'CO2-01', meta: 'Lab', value: 412, unit: 'ppm', sparkline: [22, 26, 29, 33, 37, 34, 30] },
    { name: 'Press-01', meta: 'Roof', value: 101, unit: 'kPa', sparkline: [10, 12, 13, 15, 14, 13, 12] },
    { name: 'CO2-03', meta: 'Office', value: 398, unit: 'ppm', sparkline: [20, 23, 27, 30, 32, 29, 28] },
    { name: 'Humid-02', meta: 'Floor 3', value: 61, unit: '%', sparkline: [28, 30, 33, 36, 38, 35, 34] },
    { name: 'Temp-03', meta: 'Hallway', value: 70, unit: '°F', sparkline: [12, 14, 17, 19, 21, 18, 16] },
  ],
  failing: [
    { name: 'Motion-03', meta: 'Corridor C', value: null, unit: '', sparkline: [9, 7, 10, 8, 6, 5, 7] },
    { name: 'Smoke-01', meta: 'Kitchen', value: null, unit: '', sparkline: [11, 10, 9, 8, null, null, null] },
  ],
  inactive: [
    { name: 'Light-02', meta: 'Disabled', value: null, unit: '', sparkline: [] },
    { name: 'Temp-09', meta: 'Maintenance', value: null, unit: '', sparkline: [] },
    { name: 'CO2-02', meta: 'Basement', value: null, unit: '', sparkline: [] },
    { name: 'Temp-05', meta: 'Server Rm', value: null, unit: '', sparkline: [] },
    { name: 'Press-02', meta: 'Attic', value: null, unit: '', sparkline: [] },
  ],
};

ModuleRegistry.registerModules([AllCommunityModule]);
function StaticBars({ data }: { data: (number | null)[] }) {
  const chartData = data
    .map((value, i) => (value == null ? null : { time: i + 1, value }))
    .filter((item): item is { time: number; value: number } => item !== null);

  if (!chartData.length) return <span className="text-muted-foreground text-sm">—</span>;

  //prettier-ignore
  const options: AgCartesianChartOptions = {
    width: 48,
    height: 16,
    data: chartData,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    background: { fill: "transparent" },
    legend: { enabled: false },
    axes: { x : { type: 'time', label: {enabled: false}}, y: { type: 'number',label: {enabled: false}, gridLine: {enabled: false}, line: {enabled: false}}},
    series: [
      {
        type: "bar",
        xKey: "time",
        yKey: "value",
        itemStyler: ({datum}) => ({
          fill: datum.value <= 10 ? "oklch(0.704 0.191 22.216)" : "#9ca3af",
        })
      },
    ],
  };

  return (
    <div className="">
      <AgCharts options={options} />
    </div>
  );
}

function RealTimePinBars({data}: {data?: SensorReadingEvent[]}) {
  // if (!data?.length) return <span className="text-muted-foreground text-sm">—</span>;
  const initialData: SensorReadingEvent['pins'] = [
    { pin: 'p1Ohms', value: 20 },
    { pin: 'p2Ohms', value: 2 },
    { pin: 'p3Ohms', value: 5 },
    { pin: 'p4Ohms', value: 30 },
    { pin: 'p5Ohms', value: 21 },
    { pin: 'p6Ohms', value: 23 },
  ];
  //prettier-ignore
  const options: AgCartesianChartOptions = {
    width: 480,
    height: 160,
    // data,
    data: initialData,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    dataIdKey: 'pin',
    background: { fill: "transparent" },
    legend: { enabled: false },
    axes: { x : { type: 'category', label: {enabled: false}}, y: { type: 'number', label: {enabled: false}, gridLine: {enabled: false}, line: {enabled: false}}},
    series: [
      {
        type: "bar",
        xKey: "pin",
        yKey: "value",
        yName: 'resistance kOhm',
        tooltip: {
          renderer: ({datum}) => `${datum.pin}: ${datum.value} kOhm`
        },
        itemStyler: ({datum}) => ({
          fill: datum.value <= 10 ? "oklch(0.704 0.191 22.216)" : "#9ca3af",
        })
      },
    ],
  };

  return (
    <div className="">
      <AgCharts options={options} />
    </div>
  );
}

function SensorStatusCard({
  type,
  expanded,
  collapsed,
  onClick,
}: {
  type: SensorType;
  expanded: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const { label, dot } = config[type];
  const list = sensors[type];

  return (
    <div
      onClick={onClick}
      className="bg-card flex cursor-pointer flex-col rounded-2xl border p-4 shadow transition-all duration-300"
      style={{
        flex: expanded ? '3 1 0%' : collapsed ? '0.6 1 0%' : '1 1 0%',
        opacity: collapsed ? 0.45 : 1,
        minWidth: 0,
      }}
    >
      {/* dot + label + chevron, number below */}
      <div className="mb-3 flex flex-col">
        <div className="mb-1 flex items-center gap-1.5">
          <span className={`size-3 shrink-0 rounded-full ${dot}`} />
          <span className="text-2xs flex-1 truncate font-medium tracking-wider whitespace-nowrap uppercase">
            {label}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0 transition-transform duration-300"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path d="M4.5 2.5l3 3.5-3 3.5" />
          </svg>
        </div>
        <span className="text-5xl leading-none font-bold">{list.length}</span>
      </div>

      {/* Divider */}
      <Separator className="mb-4" />

      {/* Sensor list — always shown, fixed height, scrollable */}
      <ScrollArea className="relative h-28" type="always">
        {list.map(s => (
          <div key={s.name} className="flex shrink-0 items-center justify-between gap-2 py-1.5 pr-4">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs">{s.name}</span>
              <span className="text-muted-foreground text-2xs truncate">{s.meta}</span>
            </div>
            {!collapsed && (
              <div className="flex shrink-0 items-center gap-2">
                {s.value !== null && (
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {s.value}
                    {s.unit}
                  </span>
                )}
                <StaticBars data={s.sparkline} />
              </div>
            )}
          </div>
        ))}

        {/* Subtle fade */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 transition-opacity duration-200">
          <div className="to-card h-3.5 w-full bg-linear-to-b from-transparent" />
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}

export default function SensorStatusCards() {
  const [expanded, setExpanded] = useState<SensorType | null>(null);
  const total = Object.values(sensors).reduce((s, a) => s + a.length, 0);

  return (
    <div className="w-full rounded-2xl font-mono">
      <RealTimePinBars />
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">Sensors</span>
        <span className="text-muted-foreground text-sm">{total} total</span>
      </div>
      <div className="flex gap-3">
        {(Object.keys(config) as SensorType[]).map(type => (
          <SensorStatusCard
            key={type}
            type={type}
            expanded={expanded === type}
            collapsed={expanded !== null && expanded !== type}
            onClick={() => setExpanded(prev => (prev === type ? null : type))}
          />
        ))}
      </div>
    </div>
  );
}
