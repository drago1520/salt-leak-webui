import mqtt from 'mqtt';
import { sensorChannelSchema, toMqttTopic } from '@ca/shared/sensor-channel.ts';
import { BROKER_URL, COMPANY_ID, LOCATION_ID, DATACENTER_ID, MACHINE_ID } from './env-schema.ts';

const channel = sensorChannelSchema.parse({ companyId: COMPANY_ID, locationId: LOCATION_ID, sensorType: 'salt-leak', datacenterId: DATACENTER_ID, machineId: MACHINE_ID });
const client = mqtt.connect(BROKER_URL, { protocolVersion: 4, reconnectPeriod: 3000 });

client.on('connect', () => console.log('MQTT connected'));
client.on('reconnect', () => console.log('MQTT reconnecting...'));
client.on('error', (error) => console.error('MQTT error:', error.message));

export async function handleMessage(rawLine: string) {
  client.publish(toMqttTopic(channel), rawLine);
}
