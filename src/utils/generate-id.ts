import { ENV } from "./env-schema.ts";

const DATACENTER_ID = BigInt(ENV.DATACENTER_ID);
const MACHINE_ID = BigInt(ENV.MACHINE_ID);

let lastTimestamp = 0n;
let sequence = 0n;

export function generateID(): bigint {
  let timestamp = BigInt(Date.now());

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & 0xfffn; //assumption: drop sensor messages if > 4095 in the same milisecond. We'll not hit it.

    if (sequence === 0n) while (timestamp <= lastTimestamp) timestamp = BigInt(Date.now());
  } else sequence = 0n;

  lastTimestamp = timestamp;

  return ((timestamp - 1704067200000n) << 22n) | (DATACENTER_ID << 17n) | (MACHINE_ID << 12n) | sequence;
}
