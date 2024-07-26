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

  createPlane(id: string, numberId: number, port: string): Plane {
    const plane: Plane = new Plane(id, numberId, port);
    plane.update();
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
      const planeDto = plane.getDTO();
      const response = await firstValueFrom(
        this.httpService.post(
          `http://host.docker.internal:3000/status/plane/register`,
          planeDto,
        ),
      );
      return response.data === true ? plane : undefined;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
