import {IS_REAL_DEVICE} from "./utils/env-schema.ts";
import { readFromComPort } from "./read-from-COM.ts";
import { readFromTcp } from "./read-from-TCP.ts";

if (IS_REAL_DEVICE === "true") readFromComPort();
else readFromTcp();
