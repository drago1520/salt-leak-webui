import { z } from 'zod';

const field = {
  pOhms(label: string, place: string) {
    return z.coerce.number({
      error: issue =>
        issue.input === undefined
          ? `${label} is missing. Put the ${place} number there.`
          : `${label} must be a number.`,
    });
  },

  pStatus(label: string, hint: string) {
    return z.coerce
      .number({
        error: issue => (issue.input === undefined ? `${label} is missing. ${hint}` : `${label} must be an integer.`),
      })
      .int();
  },
};

export const sensorOutputSchema = z.preprocess(
  input => {
    if (typeof input !== 'string') return input;

    const rawLine = input.trim();
    const parts = rawLine.split(/\s+/);

    return {
      rawLine,
      p1Ohms: parts[0],
      p2Ohms: parts[1],
      p3Ohms: parts[2],
      p4Ohms: parts[3],
      p5Ohms: parts[4],
      p6Ohms: parts[5],
      p1StatusCode: parts[6],
      p2StatusCode: parts[7],
      p3StatusCode: parts[8],
      p4StatusCode: parts[9],
      p5StatusCode: parts[10],
      p6StatusCode: parts[11],
      boostVoltageV: parts[12],
      boxStatusCode: parts[13],
    };
  },
  z.object({
    rawLine: z.string(),
    p1Ohms: field.pOhms('P1 ohms', 'first'),
    p2Ohms: field.pOhms('P2 ohms', 'second'),
    p3Ohms: field.pOhms('P3 ohms', 'third'),
    p4Ohms: field.pOhms('P4 ohms', 'fourth'),
    p5Ohms: field.pOhms('P5 ohms', 'fifth'),
    p6Ohms: field.pOhms('P6 ohms', 'sixth'),
    p1StatusCode: field.pStatus('P1 status code', 'Put it after the six ohms numbers.'),
    p2StatusCode: field.pStatus('P2 status code', 'Put it after P1 status.'),
    p3StatusCode: field.pStatus('P3 status code', 'Put it after P2 status.'),
    p4StatusCode: field.pStatus('P4 status code', 'Put it after P3 status.'),
    p5StatusCode: field.pStatus('P5 status code', 'Put it after P4 status.'),
    p6StatusCode: field.pStatus('P6 status code', 'Put it after P5 status.'),
    boostVoltageV: z.coerce.number({
      error: issue =>
        issue.input === undefined
          ? 'Boost voltage is missing. Put it after the six status codes.'
          : 'Boost voltage must be a number.',
    }),
    boxStatusCode: z
      .string({
        error: issue =>
          issue.input === undefined
            ? 'Box status code is missing. Put it last, like 0x00000001.'
            : 'Box status code must be text like 0x00000001.',
      })
      .refine(value => value.startsWith('0x'), 'Box status code must start with 0x.')
      .refine(value => value.length > 2, 'Box status code is missing the hex part after 0x.')
      .refine(
        value => !Number.isNaN(Number.parseInt(value.slice(2), 16)),
        'Box status code must be valid hex, like 0x00000001.',
      )
      .transform(value => Number.parseInt(value, 16)),
  }),
);

export type SensorOutput = z.infer<typeof sensorOutputSchema>;
