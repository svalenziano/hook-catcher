
### Note for Ian:
Is this a good approach for setting up the environment and propogating it to the front-end and back-end?  Also, is my `compose.yaml` sensible?  Would love to know if I've unknowlingly ignored any best practices or fallen into any traps.  Thanks for any high-level thoughts you might have ... I don't expect you to carefully check the code for correctness!

### Front-end (`client` directory)

#### Environment
.env is the common configuration file:
```bash
# .env
VITE_APP_URL="http://localhost:5173"
VITE_API_URL="http://localhost:3000"
VITE_OTEL_COLLECTOR_URL="http://localhost:4318"  # get value from compose.yaml
VITE_OTEL_SERVICE_NAME=frontend
HONEYCOMB_METRICS_DATASET=sv-hook-catcher
```

.env.local sets secrets for local testing
```bash
# .env.local
HONEYCOMB_API_KEY=<redacted>
```

.env.production and .env.development modify / add environment for their respective environments (not yet implemented).

#### Using environment in front-end code

Configurations are loaded into a single config module that is subsequently imported into any other modules that need config info.  The module throws an error if any of the config fails zod validation.  Additional config values (e.g. specific endpoints) are created before making the object available to other modules.

.env.ts
```ts
// src/config/env.ts

import * as z from "zod"

const createEnv = () => {
  const EnvSchema = z.object({
    VITE_API_URL: z.string(),
    VITE_APP_URL: z.string(),
    VITE_OTEL_COLLECTOR_URL: z.string(),
    VITE_OTEL_SERVICE_NAME: z.string(),
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
```

### Backend (`server` directory)

#### Environment
Configs and secrets are defined in .env
```bash
# .env
HONEYCOMB_API_KEY=hcaik_01kr1p3wp1rnk24wc6ps1nynwv9f6b58q7hqc8stgnxzcpa2ggdh3j1mnt
OTEL_SERVICE_NAME=sv-hook-catcher
HONEYCOMB_METRICS_DATASET=sv-hook-catcher

SERVER_PORT=3000

MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB_NAME=hookcatcher
MONGO_USER=hookcatcher
MONGO_PASSWORD=supersecretpassword

POSTGRES_HOST=localhost
POSTGRES_PORT=5435   # avoid potential conflict w/ existing Postgres
POSTGRES_NAME=hookcatcher
POSTGRES_USER=hookcatcher
POSTGRES_PASSWORD=supersecretpassword1234
POSTGRES_SSL=false

# For CORS (narrow CORS policy not yet implemented)
CORS_ALLOWED_ORIGIN=http://localhost:5173  
```

#### Using environment in application code
Use the environment in the server application similarly to the frontend: use zod to parse `process.env` and throw an error if the environment is incomplete or invalid.
```ts
// server/src/config.ts

// omitted for brevity
```

#### Using environment in Docker
A necessary, modify the environment in `compose.yaml` and throw an error if any required variables are missing using the `${MYVAR:?error}` syntax.  Env vars that were suitable for non-Docker development are overridden for Docker.


```yaml
name: hookcatcher

services:

  server:
    build: .
    ports:
      - "3000:3000"
    env_file: .env
    environment:
      OTEL_SERVICE_NAME: "${OTEL_SERVICE_NAME:?error}-server"
      OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4317 # otel http receiver
      # inside Docker: use service name, not localhost
      MONGO_HOST: mongodb
      POSTGRES_HOST: postgres  
      # inside Docker: use standard ports
      POSTGRES_PORT: 5432
      MONGO_PORT: 27017
    depends_on:
      - mongodb
      - postgres
      - otel-collector

  mongodb:
    image: mongo:8.0-noble
    container_name: mongodb
    restart: always
    ports:
      - '$MONGO_PORT:27017'
    env_file: .env
    environment:
      OTEL_SERVICE_NAME: "${OTEL_SERVICE_NAME:?error}-mongodb"
      MONGO_INITDB_ROOT_USERNAME: $MONGO_USER
      MONGO_INITDB_ROOT_PASSWORD: $MONGO_PASSWORD
    volumes:
      - mongo_data:/data/db

  postgres:
    image: postgres:17
    env_file: .env
    environment:
      OTEL_SERVICE_NAME: "${OTEL_SERVICE_NAME:?error}-postgres"
      POSTGRES_DB: $POSTGRES_NAME
      POSTGRES_USER: $POSTGRES_USER
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
    ports:
      - "$POSTGRES_PORT:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./src/db_connections/postgres/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
  
  # https://opentelemetry.io/docs/collector/install/docker/
  otel-collector:
    image: otel/opentelemetry-collector
    env_file: .env
    environment:
      HONEYCOMB_API_KEY: ${HONEYCOMB_API_KEY}
    volumes:
      - ./otel-collector-config.yaml:/etc/otelcol/config.yaml
    ports:
      - 1888:1888 # pprof extension
      - 8888:8888 # Prometheus metrics exposed by the Collector
      - 8889:8889 # Prometheus exporter metrics
      - 13133:13133 # health_check extension
      - 4317:4317 # OTLP gRPC receiver
      - 4318:4318 # OTLP http receiver
      - 55679:55679 # zpages extension

volumes:
  mongo_data:
  pgdata:
```

