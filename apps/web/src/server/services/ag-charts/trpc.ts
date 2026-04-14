import { publicProcedure } from "@/server/trpc";
import { on } from "events";
import { sensorEvents, SensorReadingEvent } from "../sensor-ingestion/sensor-events-SSE";

export const sensorReadingsLive = publicProcedure.subscription(async function* ({ signal }): AsyncGenerator<SensorReadingEvent, void, void> {
  for await (const [reading] of on(sensorEvents, 'reading', { signal })) 
  {
    
      console.log('reading :', reading);
      yield reading; //validated in route.ts
    }
  
});