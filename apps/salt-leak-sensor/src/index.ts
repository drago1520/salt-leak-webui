import {IS_REAL_DEVICE} from "./utils/env-schema.ts";
import { readFromComPort } from "./read-from-COM.ts";
import { readFromUdp } from "./read-from-UDP.ts";

if (IS_REAL_DEVICE === "true") readFromComPort();
else readFromUdp();
