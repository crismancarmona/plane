import {
  Action,
  Plane,
  PlaneFunction,
  PlaneState,
} from '@crisman999/plane-types';
import { Injectable, Logger } from '@nestjs/common';
import { SnsService } from '../core/notifications/sns/sns.service';

@Injectable()
export class PlaneService {
  private readonly logger = new Logger(PlaneService.name);
  private engine: NodeJS.Timeout | undefined;

  constructor(private readonly snsService: SnsService) {}

  private readonly actionsByName = new Map<Action, Function>([
    [Action.PREPARE, this.prepare.bind(this)],
    [Action.TAKE_OFF, this.takeOff.bind(this)],
    [Action.STOP_ENGINE, this.stopEngine.bind(this)],
    [Action.ROTATE, this.rotate.bind(this)],
    [Action.ACELERATE, this.acelerate.bind(this)],
  ]);

  async executeAction(
    action: Action,
    plane: Plane,
    params?: Record<string, string>,
  ): Promise<void> {
    const func = this.actionsByName.get(action);
    if (func) {
      func(plane, params);
    }
  }

  private prepare(plane: Plane) {
    this.logger.log('Turning on: ', plane.id);
    plane.stats.state = PlaneState.READY;
    plane.stats.velocity = 250;
    plane.stats.angle = 0;

    this.acelerate(plane, { velocity: String(plane.stats.velocity) });
  }

  private takeOff(plane: Plane): void {
    this.logger.log('Taking off');

    if (plane.stats.state !== PlaneState.READY) {
      this.logger.warn('the engine is off');
    } else {
      plane.stats.state = PlaneState.RUNNING;
      const planeVelocity = plane.stats.velocity ?? 250;

      plane.functions?.set(PlaneFunction.MOVE_X, (planeLocal: Plane) => {
        planeLocal.stats!.x = (planeLocal.stats.x ?? 0) + planeVelocity / 500;
      });

      setTimeout(() => {
        plane.functions?.set(PlaneFunction.MOVE_Z, (planeLocal: Plane) => {
          planeLocal.stats!.z = (planeLocal.stats.z ?? 0) + planeVelocity / 500;
        });

        plane.stats.state = PlaneState.ON_AIR;

        setTimeout(() => {
          plane.functions?.delete(PlaneFunction.MOVE_Z);
        }, planeVelocity * 48);
      }, planeVelocity * 192);
    }
  }

  private stopEngine(plane: Plane): void {
    plane.functions?.delete(PlaneFunction.MOVE_X);
    plane.functions?.delete(PlaneFunction.MOVE_Y);
    plane.functions?.delete(PlaneFunction.MOVE_Z);

    plane.stats.state = PlaneState.OFF;

    if ((plane.stats.z ?? 0) > 0) {
      plane.functions?.set(PlaneFunction.MOVE_Z, (planeLocal: Plane) => {
        if ((planeLocal.stats.z ?? 0) <= 0) {
          planeLocal.stats.z = 0;
        } else {
          planeLocal.stats.z = (plane.stats.z ?? 0) - 1;
        }
      });
    }
  }

  private rotate(plane: Plane, params: { angle: string }): void {
    const angle = (plane.stats.angle ?? 0) + Number(params.angle);
    plane.stats.angle = angle;

    const angleInRadians = (angle * Math.PI) / 180;

    const cosTheta = Math.cos(angleInRadians);
    const sinTheta = Math.sin(angleInRadians);

    const planeVelocity = plane.stats.velocity ?? 250;

    plane.functions?.set(PlaneFunction.MOVE_X, (planeLocal: Plane) => {
      const newPos = (cosTheta * planeVelocity) / 500;
      plane.stats!.x = (plane.stats.x ?? 0) + newPos;
    });

    plane.functions?.set(PlaneFunction.MOVE_Y, () => {
      const newPos = (sinTheta * planeVelocity) / 500;
      plane.stats!.y = (plane.stats.y ?? 0) + newPos;
    });
  }

  private acelerate(plane: Plane, params: { velocity: string }) {
    plane.stats.velocity = Number(params.velocity);

    if (this.engine) {
      clearInterval(this.engine);
    }
    this.engine = setInterval(async () => {
      const functions = Array.from(plane.functions?.values() ?? []);
      functions.forEach((func) => {
        func(plane);
      });
      await this.snsService.sendStatus(plane);
    }, plane.stats.velocity);
  }
}
