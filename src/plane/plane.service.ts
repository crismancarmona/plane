import { Injectable, Logger } from '@nestjs/common';
import { Plane } from 'types/dist/domain/plane';
import { PlaneIntervals } from 'types/dist/domain/plane-intervals';
import { PlaneState } from 'types/dist/domain/plane-state';
import { Action } from 'types/dist/process/Action';

@Injectable()
export class PlaneService {
  private readonly logger = new Logger(PlaneService.name);

  private readonly actionsByName = new Map<Action, Function>([
    [Action.PREPARE, this.prepare.bind(this)],
    [Action.TAKE_OFF, this.takeOff.bind(this)],
    [Action.STOP_ENGINE, this.stopEngine.bind(this)],
    [Action.ROTATE, this.rotate.bind(this)],
  ]);

  executeAction(action: Action, plane: Plane, params?: Record<string, string>) {
    const func = this.actionsByName.get(action);
    if (func) {
      func(plane, params);
    }
  }

  private prepare(plane: Plane) {
    this.logger.log('Turning on: ' + plane);
    plane.stats.state = PlaneState.READY;
    plane.stats.velocity = 250;
  }

  private takeOff(plane: Plane): void {
    this.logger.log('Taking off');

    if (plane.stats.state !== PlaneState.READY) {
      this.logger.warn('the engine is off');
    } else {
      plane.stats.state = PlaneState.RUNNING;
      const planeVelocity = plane.stats.velocity ?? 250;
      const moveX = setInterval(() => {
        plane.stats!.x = (plane.stats.x ?? 0) + planeVelocity / 500;
      }, planeVelocity);
      plane.intervals?.set(PlaneIntervals.MOVE_X, moveX);
      setTimeout(() => {
        const moveZ = setInterval(() => {
          plane.stats!.z = (plane.stats.z ?? 0) + planeVelocity / 500;
        }, planeVelocity);

        plane.intervals?.set(PlaneIntervals.MOVE_Y, moveZ);
        plane.stats.state = PlaneState.ON_AIR;

        setTimeout(() => {
          clearInterval(moveZ);
        }, planeVelocity * 48);
      }, planeVelocity * 192);
    }
  }

  private stopEngine(plane: Plane): void {
    const moveX = plane.intervals?.get(PlaneIntervals.MOVE_X);
    const moveY = plane.intervals?.get(PlaneIntervals.MOVE_Y);
    const moveZ = plane.intervals?.get(PlaneIntervals.MOVE_Z);
    const intervals = [moveX, moveY, moveZ];

    intervals
      .filter((interval) => !!interval)
      .forEach((interval) => {
        clearInterval(interval);

        this.logger.warn('stoping engine');
      });

    plane.stats.state = PlaneState.OFF;

    if ((plane.stats.z ?? 0) > 0) {
      const gravity = setInterval(() => {
        if ((plane.stats.z ?? 0) <= 0) {
          plane.stats.z = 0;
        } else {
          plane.stats.z = (plane.stats.z ?? 0) - 1;
        }
      }, 50);

      plane.intervals?.set(PlaneIntervals.MOVE_Z, gravity);
    }
  }

  private rotate(plane: Plane, params: { angle: string }): void {
    const angle = (plane.stats.angle ?? 0) + Number(params.angle);
    plane.stats.angle = angle;

    const angleInRadians = (angle * Math.PI) / 180;

    const cosTheta = Math.cos(angleInRadians);
    const sinTheta = Math.sin(angleInRadians);

    const planeVelocity = plane.stats.velocity ?? 250;

    const moveX = plane.intervals?.get(PlaneIntervals.MOVE_X);
    const moveY = plane.intervals?.get(PlaneIntervals.MOVE_Y);

    if (moveX) {
      this.logger.log('cleaning moveX');
      clearInterval(moveX);
    }

    if (moveY) {
      this.logger.log('cleaning moveY');
      clearInterval(moveY);
    }

    plane.intervals?.set(
      PlaneIntervals.MOVE_X,
      setInterval(() => {
        const newPos = (cosTheta * planeVelocity) / 500;
        plane.stats!.x = (plane.stats.x ?? 0) + newPos;
      }, planeVelocity),
    );

    plane.intervals?.set(
      PlaneIntervals.MOVE_Y,
      setInterval(() => {
        const newPos = (sinTheta * planeVelocity) / 500;
        plane.stats!.y = (plane.stats.y ?? 0) + newPos;
      }, planeVelocity),
    );
  }
}
