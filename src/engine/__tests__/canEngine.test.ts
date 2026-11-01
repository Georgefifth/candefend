import { describe, it, expect, beforeEach } from 'vitest';
import {
  encodeSpeedFrame,
  decodeSpeedFrame,
  encodeEngineFrame,
  decodeEngineFrame,
  encodeBodyDoorsFrame,
  decodeBodyDoorsFrame,
  encodeLightingFrame,
  decodeLightingFrame,
  CAN_IDS,
} from '../canDefinitions';
import { VehiclePhysics } from '../vehiclePhysics';
import { IdsEngine } from '../idsEngine';
import { CanFrame } from '../../types/can';

describe('CAN Frame Encoders and Decoders', () => {
  it('correctly encodes and decodes vehicle speed (0x244)', () => {
    const inputSpeedKmh = 100.5;
    const inputOdo = 12345.6;
    const encoded = encodeSpeedFrame(inputSpeedKmh, inputOdo, 1);

    expect(encoded.length).toBe(8);
    const decoded = decodeSpeedFrame(encoded);
    expect(decoded.speedKmh).toBeCloseTo(100.5, 1);
    expect(decoded.speedMph).toBeCloseTo(62.4, 1);
  });

  it('correctly encodes and decodes engine RPM, gear, and throttle (0x188)', () => {
    const inputRpm = 3200;
    const inputGear = 'D' as const;
    const inputThrottle = 45;
    const encoded = encodeEngineFrame(inputRpm, inputGear, inputThrottle, 3);

    expect(encoded.length).toBe(8);
    const decoded = decodeEngineFrame(encoded);
    expect(decoded.rpm).toBe(3200);
    expect(decoded.gear).toBe('D');
    expect(decoded.throttle).toBe(45);
  });

  it('correctly encodes and decodes body doors and lock states (0x19B)', () => {
    const encoded = encodeBodyDoorsFrame(true, false, true, true);
    const decoded = decodeBodyDoorsFrame(encoded);
    expect(decoded.driverDoorOpen).toBe(true);
    expect(decoded.passengerDoorOpen).toBe(false);
    expect(decoded.trunkOpen).toBe(true);
    expect(decoded.doorsLocked).toBe(true);
  });

  it('correctly encodes and decodes lighting and turn signal indicators (0x208)', () => {
    const encoded = encodeLightingFrame(false, true, true);
    const decoded = decodeLightingFrame(encoded);
    expect(decoded.leftSignal).toBe(false);
    expect(decoded.rightSignal).toBe(true);
    expect(decoded.hazardLights).toBe(true);
  });
});

describe('Vehicle Physics Simulation', () => {
  let physics: VehiclePhysics;

  beforeEach(() => {
    physics = new VehiclePhysics();
  });

  it('initializes in standard cruising state', () => {
    const state = physics.getState();
    expect(state.speedMph).toBeGreaterThan(0);
    expect(state.gear).toBe('D');
    expect(state.rpm).toBeGreaterThan(1000);
  });

  it('accelerates toward target speed when throttle increases', () => {
    physics.setThrottle(80);
    const initialSpeed = physics.getState().speedMph;
    physics.updatePhysics(1.0); // 1 second update
    const newSpeed = physics.getState().speedMph;
    expect(newSpeed).toBeGreaterThan(initialSpeed);
  });

  it('brings vehicle to halt when brake is engaged', () => {
    physics.setBrake(true);
    // Simulate 3 seconds of braking
    for (let i = 0; i < 30; i++) {
      physics.updatePhysics(0.1);
    }
    const state = physics.getState();
    expect(state.speedMph).toBe(0);
    expect(state.gear).toBe('P');
  });
});

describe('Intrusion Detection System (IDS) Engine', () => {
  let ids: IdsEngine;
  let physics: VehiclePhysics;

  beforeEach(() => {
    ids = new IdsEngine();
    physics = new VehiclePhysics();
  });

  it('detects Kinematic Plausibility Violation when speed jumps erratically', () => {
    const currentState = physics.getState();

    // Normal baseline frame (45 mph)
    const normalFrame: CanFrame = {
      id: CAN_IDS.VEHICLE_SPEED,
      dlc: 8,
      data: encodeSpeedFrame(72.4, 1000, 1),
      timestamp: Date.now(),
      deltaMs: 20,
      sender: 'ECU_CLUSTER',
    };
    ids.evaluateFrame(normalFrame, currentState);

    // Malicious spoofed frame: speed spikes to 140 mph in 15ms
    const spoofedFrame: CanFrame = {
      id: CAN_IDS.VEHICLE_SPEED,
      dlc: 8,
      data: encodeSpeedFrame(225.3, 1000, 2),
      timestamp: Date.now() + 15,
      deltaMs: 15,
      sender: 'ATTACK_INJECTOR',
      isAttack: true,
      attackType: 'SPEED_SPOOF',
    };

    const result = ids.evaluateFrame(spoofedFrame, currentState);
    expect(result.violation).toBeDefined();
    expect(result.violation?.ruleCode).toBe('RULE_KINEMATIC_VIOLATION');
    expect(result.violation?.severity).toBe('CRITICAL');
  });

  it('quarantines and rejects spoofed frames when Kinematic Rate Limiter defense is engaged', () => {
    const currentState = physics.getState();
    ids.setDefense('kinematicRateLimiter', true);

    // Normal baseline
    ids.evaluateFrame(
      {
        id: CAN_IDS.VEHICLE_SPEED,
        dlc: 8,
        data: encodeSpeedFrame(72.4, 1000, 1),
        timestamp: Date.now(),
        deltaMs: 20,
        sender: 'ECU_CLUSTER',
      },
      currentState
    );

    // Spoofed frame
    const spoofedFrame: CanFrame = {
      id: CAN_IDS.VEHICLE_SPEED,
      dlc: 8,
      data: encodeSpeedFrame(230.0, 1000, 2),
      timestamp: Date.now() + 10,
      deltaMs: 10,
      sender: 'ATTACK_INJECTOR',
      isAttack: true,
      attackType: 'SPEED_SPOOF',
    };

    const result = ids.evaluateFrame(spoofedFrame, currentState);
    expect(result.accepted).toBe(false); // Quarantined by active defense!
    expect(result.violation?.mitigated).toBe(true);
  });

  it('detects High-Frequency Bus Flooding (DoS) and rate-limits when firewall engaged', () => {
    const currentState = physics.getState();
    ids.setDefense('busFrequencyFirewall', true);

    const now = Date.now();
    let floodResult;

    // Send rapid burst of 0x000 frames with 1ms intervals
    for (let i = 0; i < 6; i++) {
      floodResult = ids.evaluateFrame(
        {
          id: CAN_IDS.MALICIOUS_FLOOD_000,
          dlc: 8,
          data: new Uint8Array(8),
          timestamp: now + i * 1,
          deltaMs: 1,
          sender: 'ATTACK_INJECTOR',
          isAttack: true,
          attackType: 'DOS_FLOOD',
        },
        currentState
      );
    }

    expect(floodResult?.violation).toBeDefined();
    expect(floodResult?.violation?.ruleCode).toBe('RULE_BUS_FLOOD');
    expect(floodResult?.accepted).toBe(false);
  });

  it('detects Unregistered Arbitration ID (Rogue Node) and blocks when allowlist engaged', () => {
    const currentState = physics.getState();
    ids.setDefense('strictIdAllowlist', true);

    const rogueFrame: CanFrame = {
      id: 0x488, // Unregistered ID
      dlc: 8,
      data: new Uint8Array([0xde, 0xad, 0xbe, 0xef, 0x00, 0x00, 0x00, 0x00]),
      timestamp: Date.now(),
      deltaMs: 20,
      sender: 'ATTACK_INJECTOR',
      isAttack: true,
      attackType: 'FUZZING',
    };

    const result = ids.evaluateFrame(rogueFrame, currentState);
    expect(result.violation?.ruleCode).toBe('RULE_UNKNOWN_ARBITRATION');
    expect(result.accepted).toBe(false);
  });
});
