import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthService {
  @Get()
  getHealth() {
    return true;
  }
}
