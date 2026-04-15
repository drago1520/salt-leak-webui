import type { SelectSensorReadings } from "@repo/db/db-types.js";

type Pins = Pick<
  SelectSensorReadings,
  "p1Ohms" | "p2Ohms" | "p3Ohms" | "p4Ohms" | "p5Ohms" | "p6Ohms"
>;

export type SensorReadingEvent = {
  id: SelectSensorReadings["id"];
  companyId: string;
  locationId: string;
  sensorType: string;
  pins: { pin: keyof Pins; value: number }[];
  datacenterId: number;
  machineId: number;
};
