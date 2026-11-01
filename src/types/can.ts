export interface CanFrame {
  id: number;
  dlc: number;
  data: Uint8Array;
  timestamp: number;
  deltaMs: number;
  sender: 'ECU_ENGINE' | 'ECU_TRANSMISSION' | 'ECU_CLUSTER' | 'ECU_BODY' | 'ECU_ABS' | 'ATTACK_INJECTOR';
  isAttack?: boolean;
  attackType?: 'DOS_FLOOD' | 'SPEED_SPOOF' | 'REPLAY' | 'FUZZING' | 'CUSTOM';
}

export interface VehicleState {
  speedMph: number;
  speedKmh: number;
  rpm: number;
  gear: 'P' | 'R' | 'N' | 'D';
  throttlePercent: number;
  brakeActive: boolean;
  leftSignal: boolean;
  rightSignal: boolean;
  hazardLights: boolean;
  doorsLocked: boolean;
  driverDoorOpen: boolean;
  passengerDoorOpen: boolean;
  trunkOpen: boolean;
  steeringAngleDeg: number;
  checkEngineLight: boolean;
  absWarning: boolean;
  batteryWarning: boolean;
  odometerMiles: number;
}

export interface IdsRuleViolation {
  id: string;
  timestamp: number;
  canIdHex: string;
  ruleCode: 'RULE_BUS_FLOOD' | 'RULE_KINEMATIC_VIOLATION' | 'RULE_REPLAY_SEQUENCE' | 'RULE_HIGH_ENTROPY' | 'RULE_UNKNOWN_ARBITRATION';
  severity: 'CRITICAL' | 'WARNING' | 'ADVISORY';
  title: string;
  details: string;
  frame: CanFrame;
  mitigated: boolean;
  triage: SecurityTriage;
}

export interface SecurityTriage {
  threatName: string;
  mitreAttackId: string;
  affectedSubsystem: string;
  physicalHazard: string;
  technicalDiagnosis: string;
  industryRemediation: string;
}

export interface IdsDefenseConfig {
  kinematicRateLimiter: boolean; // Rejects sudden speed/RPM jumps violating vehicle mass inertia
  busFrequencyFirewall: boolean; // Quarantines arbitration IDs flooding >200 Hz
  replayNonceFilter: boolean;    // Enforces monotonic counter / SecOC freshness
  strictIdAllowlist: boolean;    // Blocks unallocated or out-of-range CAN IDs
}

export interface LabScenario {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  summary: string;
  description: string;
  hint: string;
  validationCheck: (context: { frames: CanFrame[]; violations: IdsRuleViolation[]; defenses: IdsDefenseConfig; state: VehicleState }) => boolean;
  completed: boolean;
}
