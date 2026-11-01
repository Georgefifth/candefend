import { CanFrame, IdsRuleViolation, VehicleState } from '../types/can';
import {
  CAN_IDS,
  decodeBodyDoorsFrame,
  decodeEngineFrame,
  decodeLightingFrame,
  decodeSpeedFrame,
  encodeBodyDoorsFrame,
  encodeEngineFrame,
  encodeLightingFrame,
  encodeSpeedFrame,
} from './canDefinitions';
import { IdsEngine } from './idsEngine';
import { VehiclePhysics } from './vehiclePhysics';

export type FrameListener = (frame: CanFrame) => void;
export type StateListener = (state: VehicleState) => void;
export type AlertListener = (violation: IdsRuleViolation) => void;

export class CanBusManager {
  private physics: VehiclePhysics;
  private ids: IdsEngine;
  private frameBuffer: CanFrame[] = [];
  private maxBufferSize: number = 300;

  private isRunning: boolean = true;
  private intervalTimer: number | null = null;
  private lastLoopTime: number = Date.now();

  private frameListeners: Set<FrameListener> = new Set();
  private stateListeners: Set<StateListener> = new Set();
  private alertListeners: Set<AlertListener> = new Set();

  private attackActive: boolean = false;
  private activeAttackName: string | null = null;
  private attackIntervalTimer: number | null = null;

  constructor() {
    this.physics = new VehiclePhysics();
    this.ids = new IdsEngine();
    this.startBusLoop();
  }

  public getPhysics(): VehiclePhysics {
    return this.physics;
  }

  public getIds(): IdsEngine {
    return this.ids;
  }

  public getFrameBuffer(): CanFrame[] {
    return [...this.frameBuffer];
  }

  public isBusRunning(): boolean {
    return this.isRunning;
  }

  public setBusRunning(running: boolean) {
    this.isRunning = running;
    if (!running && this.attackIntervalTimer) {
      clearInterval(this.attackIntervalTimer);
      this.attackIntervalTimer = null;
      this.attackActive = false;
    }
  }

  public subscribeFrames(fn: FrameListener) {
    this.frameListeners.add(fn);
    return () => this.frameListeners.delete(fn);
  }

  public subscribeState(fn: StateListener) {
    this.stateListeners.add(fn);
    return () => this.stateListeners.delete(fn);
  }

  public subscribeAlerts(fn: AlertListener) {
    this.alertListeners.add(fn);
    return () => this.alertListeners.delete(fn);
  }

  private startBusLoop() {
    let tickCount = 0;
    this.lastLoopTime = Date.now();

    this.intervalTimer = window.setInterval(() => {
      if (!this.isRunning) return;

      const now = Date.now();
      const deltaSec = (now - this.lastLoopTime) / 1000;
      this.lastLoopTime = now;

      // Update baseline physical movement
      const physState = this.physics.updatePhysics(deltaSec);
      tickCount++;

      // Dispatch Engine frame (0x188) every 20ms (every tick)
      const seq = this.physics.getNextSequence();
      const engineData = encodeEngineFrame(physState.rpm, physState.gear, physState.throttlePercent, seq);
      this.broadcastFrame({
        id: CAN_IDS.ENGINE_RPM_GEAR,
        dlc: 8,
        data: engineData,
        timestamp: now,
        deltaMs: 20,
        sender: 'ECU_ENGINE',
      });

      // Dispatch Speed frame (0x244) every 20ms
      const speedData = encodeSpeedFrame(physState.speedKmh, physState.odometerMiles, seq);
      this.broadcastFrame({
        id: CAN_IDS.VEHICLE_SPEED,
        dlc: 8,
        data: speedData,
        timestamp: now,
        deltaMs: 20,
        sender: 'ECU_CLUSTER',
      });

      // Dispatch Body/Doors (0x19B) every 100ms (every 5 ticks)
      if (tickCount % 5 === 0) {
        const bodyData = encodeBodyDoorsFrame(
          physState.driverDoorOpen,
          physState.passengerDoorOpen,
          physState.trunkOpen,
          physState.doorsLocked
        );
        this.broadcastFrame({
          id: CAN_IDS.BODY_DOORS,
          dlc: 6,
          data: bodyData,
          timestamp: now,
          deltaMs: 100,
          sender: 'ECU_BODY',
        });
      }

      // Dispatch Lighting (0x208) every 100ms
      if (tickCount % 5 === 1) {
        const lightData = encodeLightingFrame(physState.leftSignal, physState.rightSignal, physState.hazardLights);
        this.broadcastFrame({
          id: CAN_IDS.LIGHTING_SIGNALS,
          dlc: 4,
          data: lightData,
          timestamp: now,
          deltaMs: 100,
          sender: 'ECU_BODY',
        });
      }
    }, 20); // 50 Hz base rate
  }

  /**
   * Broadcasts a frame across the virtual CAN bus.
   * Runs through the IDS engine; if accepted, it mutates the cluster display state.
   */
  public broadcastFrame(frame: CanFrame) {
    // Add to rolling history buffer
    this.frameBuffer.unshift(frame);
    if (this.frameBuffer.length > this.maxBufferSize) {
      this.frameBuffer.pop();
    }

    // Evaluate in IDS
    const currentPhys = this.physics.getState();
    const { accepted, violation } = this.ids.evaluateFrame(frame, currentPhys);

    if (violation) {
      this.alertListeners.forEach((fn) => fn(violation));
    }

    // If accepted by bus and defense filters, decode and update vehicle visual state
    if (accepted) {
      this.applyFrameToVehicle(frame);
    }

    // Notify frame subscribers
    this.frameListeners.forEach((fn) => fn(frame));
  }

  private applyFrameToVehicle(frame: CanFrame) {
    if (frame.id === CAN_IDS.VEHICLE_SPEED) {
      const { speedMph, speedKmh } = decodeSpeedFrame(frame.data);
      this.physics.applyExternalState({ speedMph, speedKmh });
      if (frame.isAttack) {
        this.physics.applyExternalState({ checkEngineLight: true });
      }
    } else if (frame.id === CAN_IDS.ENGINE_RPM_GEAR) {
      const { rpm, gear, throttle } = decodeEngineFrame(frame.data);
      this.physics.applyExternalState({ rpm, gear, throttlePercent: throttle });
    } else if (frame.id === CAN_IDS.BODY_DOORS) {
      const doors = decodeBodyDoorsFrame(frame.data);
      this.physics.applyExternalState(doors);
    } else if (frame.id === CAN_IDS.LIGHTING_SIGNALS) {
      const lights = decodeLightingFrame(frame.data);
      this.physics.applyExternalState(lights);
    }

    const updated = this.physics.getState();
    this.stateListeners.forEach((fn) => fn(updated));
  }

  // --- ATTACK INJECTION SUITE ---

  public isAttackActive(): { active: boolean; name: string | null } {
    return { active: this.attackActive, name: this.activeAttackName };
  }

  public stopAllAttacks() {
    if (this.attackIntervalTimer) {
      clearInterval(this.attackIntervalTimer);
      this.attackIntervalTimer = null;
    }
    this.attackActive = false;
    this.activeAttackName = null;
  }

  /**
   * ATTACK 1: Speedometer Spoofing / Kinematic Anomaly
   * Injects malicious speed frames overriding normal vehicle velocity.
   */
  public injectSpeedSpoof(targetMph: number = 140) {
    this.attackActive = true;
    this.activeAttackName = `Speed Spoofing (${targetMph} mph)`;
    const speedKmh = targetMph * 1.60934;
    const spoofedData = encodeSpeedFrame(speedKmh, 99999.9, 0x0f);

    // Blast a burst of spoofed speed packets
    let burstCount = 0;
    const burst = window.setInterval(() => {
      this.broadcastFrame({
        id: CAN_IDS.VEHICLE_SPEED,
        dlc: 8,
        data: spoofedData,
        timestamp: Date.now(),
        deltaMs: 5,
        sender: 'ATTACK_INJECTOR',
        isAttack: true,
        attackType: 'SPEED_SPOOF',
      });
      burstCount++;
      if (burstCount > 8) {
        clearInterval(burst);
        this.attackActive = false;
        this.activeAttackName = null;
      }
    }, 15);
  }

  /**
   * ATTACK 2: Tachometer / RPM Redline Surge Spoofing
   */
  public injectRpmSpoof(targetRpm: number = 7600) {
    this.attackActive = true;
    this.activeAttackName = `RPM Redline Surge (${targetRpm} RPM)`;
    const spoofedData = encodeEngineFrame(targetRpm, 'D', 100, 0x01);

    let count = 0;
    const burst = window.setInterval(() => {
      this.broadcastFrame({
        id: CAN_IDS.ENGINE_RPM_GEAR,
        dlc: 8,
        data: spoofedData,
        timestamp: Date.now(),
        deltaMs: 10,
        sender: 'ATTACK_INJECTOR',
        isAttack: true,
        attackType: 'SPEED_SPOOF',
      });
      count++;
      if (count > 8) {
        clearInterval(burst);
        this.attackActive = false;
        this.activeAttackName = null;
      }
    }, 15);
  }

  /**
   * ATTACK 3: High-Priority Arbitration DoS Flooding
   * Floods arbitration ID 0x000 at 500 Hz, starving lower priority ECUs.
   */
  public injectDosFlood(durationMs: number = 3000) {
    this.stopAllAttacks();
    this.attackActive = true;
    this.activeAttackName = 'High-Priority Arbitration DoS Flood (0x000)';

    const floodData = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
    const startTime = Date.now();

    this.attackIntervalTimer = window.setInterval(() => {
      if (Date.now() - startTime > durationMs) {
        this.stopAllAttacks();
        return;
      }

      this.broadcastFrame({
        id: CAN_IDS.MALICIOUS_FLOOD_000,
        dlc: 8,
        data: floodData,
        timestamp: Date.now(),
        deltaMs: 2,
        sender: 'ATTACK_INJECTOR',
        isAttack: true,
        attackType: 'DOS_FLOOD',
      });
    }, 3); // ~333 Hz flood rate
  }

  /**
   * ATTACK 4: Replay Attack (Stale Sequence Token)
   */
  public injectReplayAttack() {
    this.attackActive = true;
    this.activeAttackName = 'CAN Frame Replay Attack';

    // Transmit frozen sequence frame with identical counter 0x05
    const replayData = encodeEngineFrame(5200, 'D', 80, 0x05);

    let count = 0;
    const burst = window.setInterval(() => {
      this.broadcastFrame({
        id: CAN_IDS.ENGINE_RPM_GEAR,
        dlc: 8,
        data: replayData,
        timestamp: Date.now(),
        deltaMs: 15,
        sender: 'ATTACK_INJECTOR',
        isAttack: true,
        attackType: 'REPLAY',
      });
      count++;
      if (count > 6) {
        clearInterval(burst);
        this.attackActive = false;
        this.activeAttackName = null;
      }
    }, 15);
  }

  /**
   * ATTACK 5: Diagnostic Fuzzing / Unknown ID Mutation
   */
  public injectFuzzingAttack() {
    this.attackActive = true;
    this.activeAttackName = 'Diagnostic Fuzzing Probe';

    let count = 0;
    const burst = window.setInterval(() => {
      const randomId = 0x300 + Math.floor(Math.random() * 0x200);
      const randomBytes = new Uint8Array(8);
      for (let i = 0; i < 8; i++) {
        randomBytes[i] = Math.floor(Math.random() * 256);
      }

      this.broadcastFrame({
        id: randomId,
        dlc: 8,
        data: randomBytes,
        timestamp: Date.now(),
        deltaMs: 8,
        sender: 'ATTACK_INJECTOR',
        isAttack: true,
        attackType: 'FUZZING',
      });

      count++;
      if (count > 10) {
        clearInterval(burst);
        this.attackActive = false;
        this.activeAttackName = null;
      }
    }, 20);
  }

  /**
   * ATTACK 6: Manual Custom Frame Injection
   */
  public injectCustomFrame(id: number, data: Uint8Array) {
    this.broadcastFrame({
      id,
      dlc: data.length,
      data,
      timestamp: Date.now(),
      deltaMs: 20,
      sender: 'ATTACK_INJECTOR',
      isAttack: true,
      attackType: 'CUSTOM',
    });
  }

  // --- LOG EXPORT ---

  public exportCanDumpLog(): string {
    // Format compatible with Linux can-utils 'candump -l' log file format:
    // (timestamp) vcan0 arbitration_id#payload_hex
    return this.frameBuffer
      .map((f) => {
        const timeSec = (f.timestamp / 1000).toFixed(6);
        const idHex = f.id.toString(16).padStart(3, '0').toUpperCase();
        const hexData = Array.from(f.data).map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join('');
        return `(${timeSec}) can0 ${idHex}#${hexData}`;
      })
      .join('\n');
  }

  public exportJsonLog(): string {
    return JSON.stringify(
      this.frameBuffer.map((f) => ({
        timestamp: f.timestamp,
        deltaMs: f.deltaMs,
        idHex: '0x' + f.id.toString(16).padStart(3, '0').toUpperCase(),
        dlc: f.dlc,
        dataHex: Array.from(f.data).map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' '),
        sender: f.sender,
        isAttack: f.isAttack ?? false,
        attackType: f.attackType ?? 'NORMAL',
      })),
      null,
      2
    );
  }

  public destroy() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    if (this.attackIntervalTimer) clearInterval(this.attackIntervalTimer);
  }
}
