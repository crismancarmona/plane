import { Injectable } from '@nestjs/common';
import { Plane } from 'types/dist/domain/plane';
import { Action } from 'types/dist/process/Action';

@Injectable()
export class PlaneService {
  private readonly actionsByName = new Map<Action, Function>([
    [Action.PREPARE, this.prepare.bind(this)],
    [Action.TAKE_OFF, this.takeOff.bind(this)],
  ]);

  executeAction(action: Action, plane: Plane, params?: Record<string, string>) {
    const func = this.actionsByName.get(action);
    if (func) {
      func(plane, params);
    }
  }

  private prepare(plane: Plane) {
    console.log('Turning on: ' + plane);
    plane.isOn = true;
    plane.intervals = [];
    plane.intervals.push(
      setInterval(() => {
        console.log('engine working');
      }, 500),
    );
  }

  private takeOff(plane: Plane) {
    console.log('Taking off');

    if (!plane.currentPosition || !plane.intervals) {
      console.warn('the engine is off');
    } else {
      const moveX = setInterval(() => {
        plane.currentPosition!.x += 5;
      }, 250);
      setTimeout(() => {
        const moveY = setInterval(() => {
          plane.currentPosition!.y += 5;
        }, 250);

        setTimeout(() => {
          clearInterval(moveY);
        }, 12000);
      }, 12000);
    }
  }
}
