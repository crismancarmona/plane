import { Action, Plane, PlaneState } from '@crisman999/plane-types';
import { PlaneService } from './plane.service';
import { SnsService } from '../core/notifications/sns/sns.service';

describe(PlaneService.name, () => {
  const planeService = new PlaneService({
    sendStatus: jest.fn(),
  } as unknown as SnsService);

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

    jest.advanceTimersByTime(2500);

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

  it('acelerate the plane', () => {
    testTakeOff(planeService, plane);
    const oldVelocity = plane.stats.velocity;
    planeService.executeAction(Action.ACELERATE, plane, { velocity: '100' });

    expect(plane.stats.velocity).not.toEqual(oldVelocity);
    expect(plane.stats.velocity).toEqual(100);

    jest.advanceTimersByTime(100);

    expect(plane.stats.x).toBeCloseTo(104.5, 0.01);

    jest.advanceTimersByTime(100);

    expect(plane.stats.x).toBeCloseTo(104, 0.01);

    jest.advanceTimersByTime(100);

    expect(plane.stats.x).toBeCloseTo(104, 0.01);
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
  expect(plane.stats.x).toBeCloseTo(2);
  jest.advanceTimersByTime(1000);

  expect(plane.stats.x).toBeCloseTo(4);

  jest.advanceTimersByTime(50000);

  expect(plane.stats.state).toEqual<PlaneState>(PlaneState.ON_AIR);
  expect(plane.stats.x).toBeGreaterThan(0);
  expect(plane.stats.z).toBeGreaterThan(0);
}
