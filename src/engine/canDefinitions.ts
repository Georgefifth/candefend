export const CAN_IDS = {
  ENGINE_RPM_GEAR: 0x188,   // 392: Engine Speed (RPM), Transmission Gear
  VEHICLE_SPEED: 0x244,     // 580: Vehicle Velocity (km/h), Cruise Control
  BODY_DOORS: 0x19B,        // 411: Door Latches, Trunk, Power Locks
  LIGHTING_SIGNALS: 0x208,  // 520: Turn Indicators, Hazard Lights
  BRAKES_ABS: 0x0C9,        // 201: Brake Pedal Switch, Line Pressure, ABS status
  STEERING_ANGLE: 0x1DC,    // 476: Steering Wheel Angle (-540 to +540 deg)
  MALICIOUS_FLOOD_000: 0x000, // 0: Highest priority arbitration ID for DoS starvation
  MALICIOUS_FLOOD_002: 0x002, // 2: High priority arbitration ID
} as const;

export function encodeEngineFrame(rpm: number, gear: 'P' | 'R' | 'N' | 'D', throttle: number, seq: number): Uint8Array {
  const data = new Uint8Array(8);
  const rpmEncoded = Math.min(65535, Math.max(0, Math.round(rpm * 4)));
  data[0] = (rpmEncoded >> 8) & 0xff;
  data[1] = rpmEncoded & 0xff;
  const gearMap = { P: 0, R: 1, N: 2, D: 3 };
  data[2] = gearMap[gear] ?? 3;
  data[3] = Math.min(100, Math.max(0, Math.round(throttle)));
  data[4] = seq & 0x0f; // 4-bit rolling counter
  data[5] = 0x00;
  data[6] = 0x00;
  data[7] = (data[0] ^ data[1] ^ data[2] ^ data[3] ^ data[4]) & 0xff; // Checksum
  return data;
}

export function decodeEngineFrame(data: Uint8Array): { rpm: number; gear: 'P' | 'R' | 'N' | 'D'; throttle: number } {
  const rpmRaw = (data[0] << 8) | data[1];
  const rpm = Math.round(rpmRaw / 4);
  const gearByte = data[2];
  const gears: Array<'P' | 'R' | 'N' | 'D'> = ['P', 'R', 'N', 'D'];
  const gear = gears[gearByte] ?? 'D';
  const throttle = data[3];
  return { rpm, gear, throttle };
}

export function encodeSpeedFrame(speedKmh: number, odometer: number, seq: number): Uint8Array {
  const data = new Uint8Array(8);
  const speedEncoded = Math.min(65535, Math.max(0, Math.round(speedKmh * 100)));
  data[0] = (speedEncoded >> 8) & 0xff;
  data[1] = speedEncoded & 0xff;
  data[2] = 0x01; // Cruise ready
  const odoTicks = Math.round(odometer * 10);
  data[3] = (odoTicks >> 16) & 0xff;
  data[4] = (odoTicks >> 8) & 0xff;
  data[5] = odoTicks & 0xff;
  data[6] = seq & 0x0f;
  data[7] = (data[0] ^ data[1] ^ data[3] ^ data[4] ^ data[5]) & 0xff;
  return data;
}

export function decodeSpeedFrame(data: Uint8Array): { speedKmh: number; speedMph: number } {
  const speedRaw = (data[0] << 8) | data[1];
  const speedKmh = Math.round((speedRaw / 100) * 10) / 10;
  const speedMph = Math.round(speedKmh * 0.621371 * 10) / 10;
  return { speedKmh, speedMph };
}

export function encodeBodyDoorsFrame(driverOpen: boolean, passengerOpen: boolean, trunkOpen: boolean, locked: boolean): Uint8Array {
  const data = new Uint8Array(6);
  data[0] = driverOpen ? 1 : 0;
  data[1] = passengerOpen ? 1 : 0;
  data[2] = trunkOpen ? 1 : 0;
  data[3] = locked ? 1 : 0;
  data[4] = 0xAA;
  data[5] = 0x55;
  return data;
}

export function decodeBodyDoorsFrame(data: Uint8Array): { driverDoorOpen: boolean; passengerDoorOpen: boolean; trunkOpen: boolean; doorsLocked: boolean } {
  return {
    driverDoorOpen: data[0] === 1,
    passengerDoorOpen: data[1] === 1,
    trunkOpen: data[2] === 1,
    doorsLocked: data[3] === 1,
  };
}

export function encodeLightingFrame(left: boolean, right: boolean, hazard: boolean): Uint8Array {
  const data = new Uint8Array(4);
  data[0] = left ? 1 : 0;
  data[1] = right ? 1 : 0;
  data[2] = hazard ? 1 : 0;
  data[3] = 0x00;
  return data;
}

export function decodeLightingFrame(data: Uint8Array): { leftSignal: boolean; rightSignal: boolean; hazardLights: boolean } {
  return {
    leftSignal: data[0] === 1,
    rightSignal: data[1] === 1,
    hazardLights: data[2] === 1,
  };
}

export function formatHexByte(b: number): string {
  return b.toString(16).padStart(2, '0').toUpperCase();
}

export function formatCanIdHex(id: number): string {
  return '0x' + id.toString(16).padStart(3, '0').toUpperCase();
}

export function formatFrameData(data: Uint8Array): string {
  return Array.from(data).map(formatHexByte).join(' ');
}
