import { BROKER_PASS, BROKER_URL, DATACENTER_ID, MACHINE_ID } from "./env-schema.ts";

export async function handleMessage(rawLine:string) {
  await fetch(BROKER_URL, {
        method: 'POST',
        body: JSON.stringify({machineId: MACHINE_ID, datacenterId: DATACENTER_ID, rawLine, pass: BROKER_PASS})
    })
}