import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { HealthService } from 'src/core/health.service';
import { PlaneFactory } from './plane.factory';
import { PlaneService } from './plane.service';
import { PlaneController } from './plane.controller';

@Module({
  imports: [HttpModule],
  providers: [PlaneService, PlaneFactory, HealthService],
  controllers: [PlaneController],
})
export class PlaneModule {}
