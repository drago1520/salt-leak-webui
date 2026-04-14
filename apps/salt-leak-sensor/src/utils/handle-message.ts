import mqtt from 'mqtt';
import { BROKER_URL, DATACENTER_ID, MACHINE_ID } from './env-schema.ts';

const client = mqtt.connect(BROKER_URL, { protocolVersion: 4, reconnectPeriod: 3000 });

client.on('connect', () => console.log('MQTT connected'));
client.on('reconnect', () => console.log('MQTT reconnecting...'));
client.on('error', (error) => console.error('MQTT error:', error.message));

export async function handleMessage(rawLine: string) {
  client.publish(`sensor-readings/${DATACENTER_ID}/${MACHINE_ID}`, rawLine);
}
