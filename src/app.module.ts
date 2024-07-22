import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './core/logging.interceptor';
import { PlaneModule } from './plane/plane.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PlaneModule],
  controllers: [],
  providers: [{ provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }],
})
export class AppModule {}
