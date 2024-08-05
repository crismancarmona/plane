import { Plane, ProcessActionDto } from '@crisman999/plane-types';
import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { PlaneFactory } from './plane.factory';
import { PlaneService } from './plane.service';

@Controller('/plane')
export class PlaneController {
  constructor(
    private readonly planeFactory: PlaneFactory,
    private readonly planeService: PlaneService,
  ) {}

  @Get('status')
  async getCurrentStatus(): Promise<Partial<Plane>> {
    const currentPlane = this.planeFactory.getCurrentPlane();

    if (!currentPlane) {
      throw new NotFoundException();
    }

    return currentPlane.getDTO();
  }

  @Post('processAction')
  async processAction(@Body() processActionDto: ProcessActionDto) {
    const currentPlane = this.planeFactory.getCurrentPlane();
    if (currentPlane) {
      await this.planeService.executeAction(
        processActionDto.action,
        currentPlane,
        processActionDto.params,
      );
    }
  }
}
