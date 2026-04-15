import { z } from 'zod';

export const sensorChannelSchema = z.object({
  companyId: z.string().min(1),
  locationId: z.string().min(1),
  sensorType: z.string().min(1),
  datacenterId: z.number().int().min(0).max(31),
  machineId: z.number().int().min(0).max(31),
});

export type SensorChannel = z.infer<typeof sensorChannelSchema>;

export function toMqttTopic(c: SensorChannel) {
  return `${c.companyId}/${c.locationId}/${c.sensorType}/${c.datacenterId}/${c.machineId}`;
}
