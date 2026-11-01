import { VehicleState } from '../types/can';

export class VehiclePhysics {
  private state: VehicleState;
  private targetSpeedMph: number = 45;
  private currentThrottle: number = 30;
  private sequenceCounter: number = 0;

  constructor() {
    this.state = {
      speedMph: 45.0,
      speedKmh: 72.4,
      rpm: 2200,
      gear: 'D',
      throttlePercent: 30,
      brakeActive: false,
      leftSignal: false,
      rightSignal: false,
      hazardLights: false,
      doorsLocked: true,
      driverDoorOpen: false,
      passengerDoorOpen: false,
      trunkOpen: false,
      steeringAngleDeg: 0,
      checkEngineLight: false,
      absWarning: false,
      batteryWarning: false,
      odometerMiles: 14285.4,
    };
  }

  public getState(): VehicleState {
    return { ...this.state };
  }

  public setThrottle(percent: number) {
    this.currentThrottle = Math.max(0, Math.min(100, percent));
    this.targetSpeedMph = Math.round((this.currentThrottle / 100) * 110);
  }

  public setBrake(active: boolean) {
    this.state.brakeActive = active;
    if (active) {
      this.targetSpeedMph = 0;
      this.currentThrottle = 0;
    }
  }

  public toggleLeftSignal() {
    this.state.leftSignal = !this.state.leftSignal;
    if (this.state.leftSignal) this.state.rightSignal = false;
  }

  public toggleRightSignal() {
    this.state.rightSignal = !this.state.rightSignal;
    if (this.state.rightSignal) this.state.leftSignal = false;
  }

  public toggleHazardLights() {
    this.state.hazardLights = !this.state.hazardLights;
    if (this.state.hazardLights) {
      this.state.leftSignal = false;
      this.state.rightSignal = false;
    }
  }

  public toggleDoor(door: 'driver' | 'passenger' | 'trunk') {
    if (door === 'driver') this.state.driverDoorOpen = !this.state.driverDoorOpen;
    if (door === 'passenger') this.state.passengerDoorOpen = !this.state.passengerDoorOpen;
    if (door === 'trunk') this.state.trunkOpen = !this.state.trunkOpen;
  }

  public setSteeringAngle(deg: number) {
    this.state.steeringAngleDeg = Math.max(-540, Math.min(540, deg));
  }

  public getNextSequence(): number {
    this.sequenceCounter = (this.sequenceCounter + 1) & 0x0f;
    return this.sequenceCounter;
  }

  public updatePhysics(deltaSec: number): VehicleState {
    // Smooth speed approach
    const accelRate = this.state.brakeActive ? 35.0 : (this.targetSpeedMph > this.state.speedMph ? 12.0 : 8.0);
    const speedDiff = this.targetSpeedMph - this.state.speedMph;

    if (Math.abs(speedDiff) > 0.1) {
      this.state.speedMph += Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), accelRate * deltaSec);
    } else {
      this.state.speedMph = this.targetSpeedMph;
    }

    this.state.speedMph = Math.max(0, Math.min(160, this.state.speedMph));
    this.state.speedKmh = Math.round(this.state.speedMph * 1.60934 * 10) / 10;
    this.state.throttlePercent = this.currentThrottle;

    // Calculate gear and RPM realistically
    const speed = this.state.speedMph;
    let gear: 'P' | 'R' | 'N' | 'D' = 'D';
    let gearRatio = 1.0;

    if (speed < 0.5 && this.state.brakeActive) {
      gear = 'P';
      this.state.rpm = 850;
    } else {
      gear = 'D';
      if (speed < 18) gearRatio = 3.6;
      else if (speed < 38) gearRatio = 2.2;
      else if (speed < 62) gearRatio = 1.4;
      else if (speed < 85) gearRatio = 1.0;
      else gearRatio = 0.75;

      const baseRpm = 1000 + speed * 35 * gearRatio;
      this.state.rpm = Math.min(7800, Math.max(850, Math.round(baseRpm)));
    }

    this.state.gear = gear;

    // Odometer increment
    this.state.odometerMiles += (this.state.speedMph / 3600) * deltaSec;

    return { ...this.state };
  }

  public applyExternalState(partial: Partial<VehicleState>) {
    Object.assign(this.state, partial);
  }
}
