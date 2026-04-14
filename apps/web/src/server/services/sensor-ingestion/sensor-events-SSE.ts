import { EventEmitter } from 'node:events';
import { SelectSensorReading } from '@/lib/db-goodies';

type Pins = Pick<SelectSensorReading, 'p1Ohms' | 'p2Ohms' | 'p3Ohms' | 'p4Ohms' | 'p5Ohms' | 'p6Ohms' >

export type SensorReadingEvent = {
  id: SelectSensorReading['id']
  pins: {pin: keyof Pins, value: number}[]
  datacenterId: number
  machineId: number
}

export type SensorEvents = {
  reading: [SensorReadingEvent]
}

export const sensorEvents = new EventEmitter<SensorEvents>(); //in prod use MQTT subscribe
