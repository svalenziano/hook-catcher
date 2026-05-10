import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const configSchema = z.object({
  SERVER_PORT: z.coerce.number(),
  OTEL_SERVICE_NAME: z.string(),
  OTEL_INSTRUMENTATION_SCOPE_VERSION: z.string(),

  MONGO_HOST: z.string(),
  MONGO_PORT: z.coerce.number(),
  MONGO_DB_NAME: z.string(),
  MONGO_USER: z.string(),
  MONGO_PASSWORD: z.string(),

  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_NAME: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_SSL: z.string().transform(v => v.toLowerCase() === 'true')
})

const result = configSchema.safeParse(process.env)

if (!result.success) {
  throw new Error(`Invalid environment config:\n${result.error.toString()}`)
}

export const config = {
  ...result.data,
  MONGO_URI: `mongodb://${result.data.MONGO_USER}:${result.data.MONGO_PASSWORD}@${result.data.MONGO_HOST}:${result.data.MONGO_PORT}`,
}
