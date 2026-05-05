/**
  This module assumes that the environment is loaded via 
  Vite's built-in .env support.

  Only environment vars prefixed with the value of PREFIX (see below) 
  will be imported.

  Inspiration: 
  https://github.com/alan2207/bulletproof-react/blob/master/apps/react-vite/src/config/env.ts
 */

import * as z from "zod"

const createEnv = () => {
  const EnvSchema = z.object({
    VITE_API_URL: z.string(),
    VITE_APP_URL: z.string(),
    VITE_OTEL_COLLECTOR_URL: z.string(),
    VITE_OTEL_SERVICE_NAME: z.string(),
    // ENABLE_API_MOCKING: z
    //   .string()
    //   .refine((s) => s === 'true' || s === 'false')
    //   .transform((s) => s === 'true')
    //   .optional(),
    // APP_MOCK_API_PORT: z.string().optional().default('8080'),
  })

  const parsedEnv = EnvSchema.safeParse(import.meta.env)

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid env provided.
The following variables are missing or invalid:
${Object.entries(parsedEnv.error.flatten().fieldErrors)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}
`
    )
  }

  return parsedEnv.data
}

const parsed = createEnv()

export const env = {
  ...parsed,
  API_BASE: new URL(`${parsed.VITE_API_URL}/api/`),
  API_WEBHOOK: new URL(`${parsed.VITE_API_URL}/api/webhook`),
  API_BINS: new URL(`${parsed.VITE_API_URL}/api/bins`),
  API_WEBSOCKET: new URL(`${parsed.VITE_API_URL}/api/ws`),
  PRODUCTION: import.meta.env.PROD,
}

console.log("Loaded environment using dotenv.")
// console.log(env)
