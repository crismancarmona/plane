import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PlaneService } from './plane.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Plane } from '@crisman999/plane-types';
import { Action } from '@crisman999/plane-types';

@Injectable()
export class PlaneFactory {
  private currentPlane: Plane | undefined;

  constructor(
    private readonly httpService: HttpService,
    private readonly planeService: PlaneService,
    private readonly configService: ConfigService,
  ) {}

  async createPlane(
    id: string,
    numberId: number,
    port: string,
  ): Promise<Plane> {
    const plane: Plane = new Plane(id, numberId, port);
    plane.update();
    this.currentPlane = plane;
    await this.planeService.executeAction(Action.PREPARE, plane);
    return plane;
  }

  getCurrentPlane(): Plane | undefined {
    return this.currentPlane;
  }

  async registerPlane(plane: Plane): Promise<Plane | undefined> {
    try {
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
