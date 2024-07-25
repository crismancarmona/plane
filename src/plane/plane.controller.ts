import { Body, Controller, Get, Post } from '@nestjs/common';
import { Plane } from 'types/dist/domain/plane';
import { PlaneFactory } from './plane.factory';
import { ProcessActionDto } from 'types/dist/process/ProcessActionDto';
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
    return {
      currentPosition: currentPlane?.currentPosition,
      id: currentPlane?.id,
      numberId: currentPlane?.numberId,
    };
  }

  @Post('processAction')
  async processAction(@Body() processActionDto: ProcessActionDto) {
    const currentPlane = this.planeFactory.getCurrentPlane();
    if (currentPlane) {
      this.planeService.executeAction(
        processActionDto.action,
        currentPlane,
        processActionDto.params,
      );
    }
  }
}
