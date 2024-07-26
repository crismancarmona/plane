import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PlaneFactory } from './plane/plane.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const planePort = configService.getOrThrow<string>('PLANE_PORT');
  const planeName = configService.getOrThrow<string>('PLANE_NAME');
  const planeNumberId = configService.getOrThrow<number>('PLANE_NUMBER_ID');
  const planeFactory = app.get(PlaneFactory);

  await planeFactory.registerPlane(
    planeFactory.createPlane(planeName, planeNumberId, planePort),
  );

  await app.listen(planePort);
}
bootstrap();
