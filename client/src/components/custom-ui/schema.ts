import { z } from "zod";

const NANOID_ID_PATTERN = /^[A-Za-z0-9_-]{10}$/;
const SEND_URL_PATTERN = /^\/api\/webhook\/[A-Za-z0-9_-]{10}$/;
const INSPECT_URL_PATTERN = /^\/bins\/[A-Za-z0-9_-]{10}$/;

export const PersistedBinSchema = z.object({
  id: z.string().refine((value) => NANOID_ID_PATTERN.test(value), {
    message: "id must be a 10-character nanoid string",
  }),
  created_at: z.coerce.date(),
  expires_at: z.coerce.date(),
});

export const BinSchema = PersistedBinSchema.extend({
  sendUrl: z.string().refine((value) => SEND_URL_PATTERN.test(value), {
    message: "sendUrl must match /api/webhook/{id}",
  }),
  inspectUrl: z.string().refine((value) => INSPECT_URL_PATTERN.test(value), {
    message: "inspectUrl must match /bins/{id}",
  }),
});

export const PersistedBinsSchema = z.array(PersistedBinSchema);
export const BinsSchema = z.array(BinSchema);

export const BinApiResponseSchema = z.object({
  bin: PersistedBinSchema,
  sendUrl: z.string().refine((value) => SEND_URL_PATTERN.test(value), {
    message: "sendUrl must match /api/webhook/{id}",
  }),
  inspectUrl: z.string().refine((value) => INSPECT_URL_PATTERN.test(value), {
    message: "inspectUrl must match /bins/{id}",
  }),
});

export type Bin = z.infer<typeof BinSchema>;
export type Bins = z.infer<typeof BinsSchema>;
export type PersistedBin = z.infer<typeof PersistedBinSchema>;
export type PersistedBins = z.infer<typeof PersistedBinsSchema>;
export type BinApiResponse = z.infer<typeof BinApiResponseSchema>;

export function toBin(response: BinApiResponse): Bin {
  return {
    ...response.bin,
    sendUrl: response.sendUrl,
    inspectUrl: response.inspectUrl,
  };
}

export const BinPathSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Bin name is required")
    .max(40, "Bin name must be 40 characters or fewer")
    .regex(
      /^[a-zA-Z0-9]+$/,
      "Use only lowercase letters, numbers, and hyphens"
    ),
});

export type BinPathFormValues = z.infer<typeof BinPathSchema>;

export function normalizeBinPath(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9]/g, "");
}
