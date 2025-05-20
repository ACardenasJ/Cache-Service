/* eslint-disable prettier/prettier */
import tracer from 'dd-trace';
import { Request } from 'express';
import { Span } from 'dd-trace';

// Initialize the tracer
tracer.init({
  service: 'cache-service',
  env: process.env.NODE_ENV || 'development',
  version: process.env.npm_package_version || '1.0.0',
  logInjection: true,
  runtimeMetrics: true,
  profiling: true,
});

// Configure specific integrations
tracer.use('express', {
  hooks: {
    request: (span: Span | undefined, req: Request | undefined) => {
      if (span && req?.params?.key) {
        span.setTag('cache.key', req.params.key);
      }
    },
  },
});

tracer.use('redis', {
  service: 'redis-cache',
});

tracer.use('winston', {
  service: 'cache-service-logs',
});

export default tracer; 