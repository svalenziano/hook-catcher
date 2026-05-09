// OTEL INIT
// https://docs.honeycomb.io/get-started/start-building/application/web

// Load env vars so they are available to OTel
import { env } from "@/config/env.ts"
import { HoneycombWebSDK } from '@honeycombio/opentelemetry-web';
import { getWebAutoInstrumentations } from '@opentelemetry/auto-instrumentations-web';


/**
 * Returns regex that matches both http and https.  
 * Strips trailing slash, if present.
 */
function buildCorsURLs(url: URL) {
  const cleanHostAndPath = `${url.host}${url.pathname.replace(/\/$/, "")}`
  return new RegExp(`^https?:\/\/${cleanHostAndPath}`)
}


const configDefaults = {
  ignoreNetworkEvents: true,
  propagateTraceHeaderCorsUrls: [
    buildCorsURLs(env.API_BASE),
    /.+/,  // TODO - REMOVE: propagates trace headers to ALL origins
  ]
}

// protect against multiple strict mode calls
let started = false

export default function Observability(){
  try {
    if (!started) {
      const sdk = new HoneycombWebSDK({
        debug: !(env.PRODUCTION), // Set to false for production environment.
        endpoint: env.VITE_OTEL_COLLECTOR_URL,
        skipOptionsValidation: true,  // because we're not providing API key
        serviceName: env.VITE_OTEL_SERVICE_NAME, 
        instrumentations: [getWebAutoInstrumentations({
          '@opentelemetry/instrumentation-xml-http-request': configDefaults,
          '@opentelemetry/instrumentation-fetch': configDefaults,
        })],
      });
      sdk.start();
      started = true
    }
  } catch (e) {
      // console.error(e)
      return null;
    }
  return null;
}