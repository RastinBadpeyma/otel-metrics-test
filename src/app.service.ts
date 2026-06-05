import { Injectable, Logger } from '@nestjs/common';
import { trace, SpanStatusCode } from '@opentelemetry/api';

@Injectable()
export class AppService {
  private tracer = trace.getTracer('hospital-module-tracer');
  private readonly logger = new Logger(AppService.name);

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async simulateGatewayRequest(): Promise<string> {
    return this.tracer.startActiveSpan('gateway: validate-request', async (span) => {
      try {
        this.logger.log('Gateway: Request received, validating token...');
        await this.delay(20); 
        
        const result = await this.processEhrRecord();
        
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error:any) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  private async processEhrRecord(): Promise<string> {
    return this.tracer.startActiveSpan('ehr-service: process-patient-data', async (span) => {
      try {
        this.logger.log('EHR Service: Processing patient record...');
        await this.delay(30); 
        
        await this.saveToDatabase();
        
        span.setStatus({ code: SpanStatusCode.OK });
        return 'Patient record processed and saved successfully';
      } finally {
        span.end();
      }
    });
  }

  private async saveToDatabase(): Promise<void> {
    return this.tracer.startActiveSpan('database: insert-record', async (span) => {
      try {
        this.logger.log('Database: Executing INSERT query...');
        
        span.setAttribute('db.system', 'postgresql');
        span.setAttribute('db.statement', 'INSERT INTO patients (name, age) VALUES ($1, $2)');
        
        await this.delay(300); 
        
        span.setStatus({ code: SpanStatusCode.OK });
      } finally {
        span.end();
      }
    });
  }
}