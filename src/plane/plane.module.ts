import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HealthService } from 'src/core/health.service';
import { SnsService } from 'src/core/notifications/sns/sns.service';
import { SqsService } from 'src/core/notifications/sqs/sqs.service';
import { PlaneController } from './plane.controller';
import { PlaneFactory } from './plane.factory';
import { PlaneService } from './plane.service';

@Module({
  imports: [HttpModule],
  providers: [
    PlaneService,
    PlaneFactory,
    HealthService,
    SnsService,
    SqsService,
  ],
  controllers: [PlaneController],
})
export class PlaneModule {}
