import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs';

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTLP_TRACE_URL || 'http://localhost:4318/v1/traces',
});

const resource = resourceFromAttributes({  
  [ATTR_SERVICE_NAME]: 'observability-demo-app',
  [ATTR_SERVICE_VERSION]: '1.0.0',
});

const logExporter = new OTLPLogExporter({
  url: process.env.OTLP_LOG_URL || 'http://localhost:4318/v1/logs',
});

const metricExporter = new OTLPMetricExporter({
  url: process.env.OTLP_METRICS_URL || 'http://localhost:4318/v1/metrics',
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000,
});

export const otelSDK = new NodeSDK({
  resource,
  traceExporter,
  logRecordProcessor: new BatchLogRecordProcessor(logExporter),
  metricReader,
  instrumentations: [getNodeAutoInstrumentations()], // Auto Instrumentation : http, express, nest و
});

process.on('SIGTERM', () => {
  otelSDK.shutdown().then(() => console.log('OTel SDK shut down successfully')).catch(console.error);
});