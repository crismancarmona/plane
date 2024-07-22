import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PlaneService } from './plane/plane.service';
import { PlaneFactory } from './plane/plane.factory';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = configService.getOrThrow<string>('AVION_PORT');
  const avionName = configService.getOrThrow<string>('AVION_NAME');
  const planeFactory = app.get(PlaneFactory);

  await planeFactory.registerPlane(planeFactory.createPlane(avionName));

  await app.listen(port ?? 3001);
}
bootstrap();
