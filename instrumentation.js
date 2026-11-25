
instrumentation.js
100%
require('dotenv').config();

const { trace } = require('@opentelemetry/api');
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');

const rawEndpoint = (process.env.ELASTIC_OTLP_ENDPOINT || 'http://187.41.104.18:8200').trim().replace(/[\[\]]/g, '');
const url = rawEndpoint.endsWith('/v1/traces') ? rawEndpoint : `${rawEndpoint.replace(/\/+$/, '')}/v1/traces`;

const headers = {};
for (const part of (process.env.ELASTIC_OTLP_HEADERS || '').split(',')) {
  const idx = part.indexOf('=');
  if (idx > 0) headers[part.slice(0, idx).trim()] = part.slice(idx + 1).trim();
}

const traceExporter = new OTLPTraceExporter({ url, headers });

const sdk = new NodeSDK({
  resource: new Resource({
    'service.name': 'github-testeaula17',
    'service.version': '1.0.0',
    'deployment.environment': 'production',
  }),
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

sdk.start();

// Span de verificação imediata no boot
const tracer = trace.getTracer('manual-boot-check');
const bootSpan = tracer.startSpan('boot-check-aula17');
bootSpan.end();

process.on('SIGINT', async () => {
  await sdk.shutdown();
  process.exit(0);
});
Exibindo package.json…
