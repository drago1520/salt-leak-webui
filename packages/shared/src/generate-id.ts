let lastTimestamp = 0n; //Tech debt: snowflake ain't exactly the best, but most common so I'll use it as starting point. Biggest wins: no need to allocate bits for 4095 ids/ sec, as we're only generating a few per second (per-machine sequence number). Allocate these bits for higher sensorID combinations, i.e. datacenterID + mechineID.
let sequence = 0n;

export function generateID(datacenterId: number, machineId: number): bigint {
  let timestamp = BigInt(Date.now());

  if (timestamp === lastTimestamp) {
    sequence = (sequence + 1n) & 0xfffn; //assumption: drop sensor messages if > 4095 in the same milisecond. We'll not hit it.

    if (sequence === 0n) while (timestamp <= lastTimestamp) timestamp = BigInt(Date.now());
  } else sequence = 0n;

  lastTimestamp = timestamp;

  return ((timestamp - 1704067200000n) << 22n) | (BigInt(datacenterId) << 17n) | (BigInt(machineId) << 12n) | sequence;
}
