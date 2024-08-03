import { Plane } from 'types/dist/domain/plane';
import { PlaneState } from 'types/dist/domain/plane-state';
import { Action } from 'types/dist/process/Action';
import { PlaneService } from './plane.service';

describe(PlaneService.name, () => {
  const planeService = new PlaneService();

  let plane: Plane;

  beforeEach(() => {
    jest.useFakeTimers();
    plane = new Plane('mockId', 1, '3001');
  });

  it('should turn on a plane', () => {
    testTurnOn(planeService, plane);
  });

  it('take off a plane', async () => {
    testTakeOff(planeService, plane);
  });

  it('turn off a plane', () => {
    testTakeOff(planeService, plane);

    jest.advanceTimersByTime(1000);

    expect(plane.stats.z).toBeGreaterThan(0);

    planeService.executeAction(Action.STOP_ENGINE, plane);

    jest.advanceTimersByTime(1000);

    expect(plane.stats.state).toEqual<PlaneState>(PlaneState.OFF);
    expect(plane.stats.z).toEqual(0);
  });

  it('rotate plane', () => {
    testTakeOff(planeService, plane);

    planeService.executeAction(Action.ROTATE, plane, { angle: '180' });

    jest.advanceTimersByTime(1000);

    expect(plane.stats.x).toBeCloseTo(102);
    expect(plane.stats.y).toBeCloseTo(0);

    jest.advanceTimersByTime(250);

    expect(plane.stats.x).toBeCloseTo(101.5);
    expect(plane.stats.y).toBeCloseTo(0);

    planeService.executeAction(Action.ROTATE, plane, { angle: '180' });

    jest.advanceTimersByTime(250);

    expect(plane.stats.x).toBeCloseTo(102);
    expect(plane.stats.y).toBeCloseTo(0);

    jest.advanceTimersByTime(250);

    expect(plane.stats.x).toBeCloseTo(102.5);
    expect(plane.stats.y).toBeCloseTo(0);
  });
});
function testTurnOn(planeService: PlaneService, plane: Plane) {
  planeService.executeAction(Action.PREPARE, plane);

  expect(plane.stats.state).toEqual<PlaneState>(PlaneState.READY);
  expect(typeof plane.stats.velocity).toBe('number');
}

function testTakeOff(planeService: PlaneService, plane: Plane) {
  testTurnOn(planeService, plane);
  planeService.executeAction(Action.TAKE_OFF, plane);

  jest.advanceTimersByTime(1000);

  expect(plane.stats.state).toEqual<PlaneState>(PlaneState.RUNNING);
  expect(plane.stats.x).toEqual(2);

  jest.advanceTimersByTime(1000);

  expect(plane.stats.x).toEqual(4);

  jest.advanceTimersByTime(50000);

  expect(plane.stats.state).toEqual<PlaneState>(PlaneState.ON_AIR);
  expect(plane.stats.x).toBeGreaterThan(0);
  expect(plane.stats.z).toBeGreaterThan(0);
}
