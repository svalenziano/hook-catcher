import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const configSchema = z.object({
  MONGO_PORT: z.coerce.number(),
  MONGO_URI: z.string(),
  MONGO_DB_NAME: z.string(),
  MONGO_USER: z.string(),
  MONGO_PASSWORD: z.string(),

  POSTGRES_HOST: z.string(),
  POSTGRES_PORT: z.coerce.number(),
  POSTGRES_NAME: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
})

export const config = configSchema.parse(process.env)
