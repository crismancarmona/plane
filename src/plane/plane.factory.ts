import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PlaneService } from './plane.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plane } from 'types/dist/domain/plane';
import { Action } from 'types/dist/process/Action';

@Injectable()
export class PlaneFactory {
  private currentPlane: Plane | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly planeService: PlaneService,
    private readonly configService: ConfigService,
  ) {}

  createPlane(id: string): Plane {
    const plane: Plane = new Plane(id);
    this.currentPlane = plane;
    this.planeService.executeAction(Action.PREPARE, plane);
    return plane;
  }

  getCurrentPlane(): Plane | undefined {
    return this.currentPlane;
  }

  async registerPlane(plane: Plane): Promise<Plane | undefined> {
    try {
      console.log('registrando avion');
      const response = await firstValueFrom(
        this.httpService.post(
          `http://127.0.0.1:3000/status/plane/register/${plane.id}`,
          {
            port: this.configService.getOrThrow<string>('AVION_PORT'),
          },
        ),
      );
      return response.data === true ? plane : undefined;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
