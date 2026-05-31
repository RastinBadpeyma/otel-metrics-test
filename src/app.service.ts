import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { trace, SpanStatusCode, metrics } from '@opentelemetry/api';

@Injectable()
export class AppService {
  private tracer = trace.getTracer('app-service-tracer');
  private readonly logger = new Logger(AppService.name);
  
  private workCounter = metrics.getMeter('app-service-meter').createCounter('custom_work_requests_total', {
    description: 'Total number of custom work requests processed',
  });

  getHello(): string { return 'Hello Observability!'; }

  async simulateWork(): Promise<string> {
    return this.tracer.startActiveSpan('simulate-complex-work', async (span) => {
      try {
        const delay = Math.floor(Math.random() * 400) + 100;
        this.logger.log(`Starting work with simulated delay of ${delay}ms`);

        await new Promise(resolve => setTimeout(resolve, delay));

        if (Math.random() < 0.1) {
          this.logger.error('Database connection failed randomly!');
          this.workCounter.add(1, { status: 'error' });
          throw new InternalServerErrorException('Database connection failed');
        }

        this.logger.log('Work completed successfully');
        span.setStatus({ code: SpanStatusCode.OK });
        
        this.workCounter.add(1, { status: 'success' });
        
        return `Work completed in ${delay}ms`;
      } catch (error) {
        throw error;
      } finally {
        span.end();
      }
    });
  }
}