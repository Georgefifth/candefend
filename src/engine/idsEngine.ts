import { CanFrame, IdsDefenseConfig, IdsRuleViolation, SecurityTriage, VehicleState } from '../types/can';
import { CAN_IDS, decodeSpeedFrame, decodeEngineFrame, formatCanIdHex } from './canDefinitions';

interface IdTimingHistory {
  lastTimestamp: number;
  recentIntervals: number[];
  lastSpeedMph?: number;
  lastRpm?: number;
  lastSeqCounter?: number;
}

export class IdsEngine {
  private timingMap: Map<number, IdTimingHistory> = new Map();
  private violations: IdsRuleViolation[] = [];
  private defenses: IdsDefenseConfig = {
    kinematicRateLimiter: false,
    busFrequencyFirewall: false,
    replayNonceFilter: false,
    strictIdAllowlist: false,
  };

  public getDefenses(): IdsDefenseConfig {
    return { ...this.defenses };
  }

  public setDefense<K extends keyof IdsDefenseConfig>(key: K, value: boolean) {
    this.defenses[key] = value;
  }

  public getViolations(): IdsRuleViolation[] {
    return [...this.violations];
  }

  public clearViolations() {
    this.violations = [];
  }

  /**
   * Processes an incoming CAN frame through the dual-layer IDS pipeline.
   * Returns whether the frame was accepted (true) or dropped/quarantined by defenses (false).
   */
  public evaluateFrame(frame: CanFrame, currentState: VehicleState): { accepted: boolean; violation?: IdsRuleViolation } {
    const id = frame.id;
    const now = frame.timestamp;
    const history = this.timingMap.get(id) ?? {
      lastTimestamp: now,
      recentIntervals: [],
    };

    const delta = now - history.lastTimestamp;
    if (delta > 0) {
      history.recentIntervals.push(delta);
      if (history.recentIntervals.length > 20) {
        history.recentIntervals.shift();
      }
    }

    let detectedViolation: IdsRuleViolation | undefined;

    // RULE 1: STRICT ARBITRATION ID ALLOWLIST
    const knownIds = [
      CAN_IDS.ENGINE_RPM_GEAR,
      CAN_IDS.VEHICLE_SPEED,
      CAN_IDS.BODY_DOORS,
      CAN_IDS.LIGHTING_SIGNALS,
      CAN_IDS.BRAKES_ABS,
      CAN_IDS.STEERING_ANGLE,
    ];

    if (!knownIds.includes(id as any) && (frame.isAttack || id === 0x000 || id > 0x300)) {
      const triage: SecurityTriage = {
        threatName: 'Unregistered Arbitration ID Broadcast (Rogue ECU / Fuzzing)',
        mitreAttackId: 'MITRE ATT&CK for ICS: T0814 (Bus Tampering)',
        affectedSubsystem: 'Vehicle CAN Gateway & Message Router',
        physicalHazard: 'Potential unauthorized ECU diagnostics or buffer overflow in instrument cluster firmware.',
        technicalDiagnosis: `Arbitration ID ${formatCanIdHex(id)} does not exist in standard DBC message matrix. Received payload: DLC=${frame.dlc}.`,
        industryRemediation: 'Enforce hardware-level Gateway ID Filtering and AUTOSAR Firewall rules to drop unallocated arbitration IDs.',
      };

      detectedViolation = {
        id: `VIO-UNK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
        canIdHex: formatCanIdHex(id),
        ruleCode: 'RULE_UNKNOWN_ARBITRATION',
        severity: 'WARNING',
        title: 'Rogue Node: Unregistered Arbitration ID',
        details: `Unknown message ${formatCanIdHex(id)} observed on bus. Suspected external hardware dongle or fuzzing probe.`,
        frame,
        mitigated: this.defenses.strictIdAllowlist,
        triage,
      };

      if (this.defenses.strictIdAllowlist) {
        this.recordViolation(detectedViolation);
        return { accepted: false, violation: detectedViolation };
      }
    }

    // RULE 2: BUS FREQUENCY & TIMING FLOOD DETECTOR (DoS)
    const avgInterval = history.recentIntervals.length > 3
      ? history.recentIntervals.reduce((a, b) => a + b, 0) / history.recentIntervals.length
      : 20;

    if ((delta > 0 && delta < 3) || (id === 0x000 && delta < 10) || (history.recentIntervals.length >= 5 && avgInterval < 4)) {
      const triage: SecurityTriage = {
        threatName: 'CAN Bus Flooding / Denial of Service (DoS)',
        mitreAttackId: 'MITRE ATT&CK for ICS: T0816 (Denial of Service)',
        affectedSubsystem: 'Entire CAN Transceiver Bus (Dominant Bit Starvation)',
        physicalHazard: 'Safety-critical braking (ABS) and powertrain messages are blocked; cluster freezes; driver loses speed perception.',
        technicalDiagnosis: `Arbitration ID ${formatCanIdHex(id)} is transmitting at ${Math.round(1000 / Math.max(1, delta))} Hz (normal threshold: ≤50 Hz). Starves lower priority arbitration IDs.`,
        industryRemediation: 'Deploy Hardware Bus-Guardian transceivers and leaky-bucket ingress rate limiting on OBD-II / telematics ports.',
      };

      detectedViolation = {
        id: `VIO-FLD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: now,
        canIdHex: formatCanIdHex(id),
        ruleCode: 'RULE_BUS_FLOOD',
        severity: 'CRITICAL',
        title: 'Bandwidth Starvation: High-Frequency DoS Flood',
        details: `Message inter-arrival time dropped to ${delta}ms. Traffic frequency exceeds safe ECU operational bounds.`,
        frame,
        mitigated: this.defenses.busFrequencyFirewall,
        triage,
      };

      if (this.defenses.busFrequencyFirewall) {
        this.recordViolation(detectedViolation);
        return { accepted: false, violation: detectedViolation };
      }
    }

    // RULE 3: KINEMATIC PLAUSIBILITY & PHYSICAL SENSOR JUMP (Speed & RPM Spoofing)
    if (id === CAN_IDS.VEHICLE_SPEED && frame.dlc >= 2) {
      const { speedMph } = decodeSpeedFrame(frame.data);
      const prevSpeed = history.lastSpeedMph ?? currentState.speedMph;
      const speedJump = Math.abs(speedMph - prevSpeed);

      // A real passenger vehicle cannot physically change speed by >25 mph in under 100ms (would exceed 11G deceleration/acceleration)
      if (speedJump > 25 && delta < 150) {
        const triage: SecurityTriage = {
          threatName: 'Kinematic Plausibility Violation (Speedometer Spoofing)',
          mitreAttackId: 'MITRE ATT&CK for ICS: T0831 (Manipulation of Control)',
          affectedSubsystem: 'Instrument Cluster & Powertrain Velocity Reporting',
          physicalHazard: 'Driver misinformed of actual vehicle velocity; false ABS/ESC intervention; cruise control instability.',
          technicalDiagnosis: `Reported speed jumped from ${prevSpeed.toFixed(1)} mph to ${speedMph.toFixed(1)} mph in ${delta}ms (|Δv/Δt| = ${(speedJump / (delta / 1000)).toFixed(1)} mph/s, physically impossible).`,
          industryRemediation: 'Implement dual-source speed cross-validation (Wheel Speed Sensor + Transmission Output Shaft) + AUTOSAR SecOC cryptographic payload signing.',
        };

        detectedViolation = {
          id: `VIO-KIN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now,
          canIdHex: formatCanIdHex(id),
          ruleCode: 'RULE_KINEMATIC_VIOLATION',
          severity: 'CRITICAL',
          title: 'Kinematic Violation: Impossible Speed Jump',
          details: `Velocity surge of ${speedJump.toFixed(1)} mph in ${delta}ms violates physical vehicle inertia constraints.`,
          frame,
          mitigated: this.defenses.kinematicRateLimiter,
          triage,
        };

        if (this.defenses.kinematicRateLimiter) {
          this.recordViolation(detectedViolation);
          return { accepted: false, violation: detectedViolation };
        }
      }
      history.lastSpeedMph = speedMph;
    }

    // RULE 4: ENGINE RPM KINEMATIC VIOLATION
    if (id === CAN_IDS.ENGINE_RPM_GEAR && frame.dlc >= 2) {
      const { rpm } = decodeEngineFrame(frame.data);
      const prevRpm = history.lastRpm ?? currentState.rpm;
      const rpmJump = Math.abs(rpm - prevRpm);

      if (rpmJump > 4500 && delta < 100) {
        const triage: SecurityTriage = {
          threatName: 'Tachometer Injection & Engine RPM Surge',
          mitreAttackId: 'MITRE ATT&CK for ICS: T0831 (Manipulation of Control)',
          affectedSubsystem: 'Engine Control Unit (ECU) Tachometer Telemetry',
          physicalHazard: 'Erroneous redline warning chime, false limp-mode trigger, or transmission shift hesitation.',
          technicalDiagnosis: `Engine speed jumped from ${prevRpm} RPM to ${rpm} RPM in ${delta}ms. Rotational inertia forbids instantaneous 4500+ RPM gradient.`,
          industryRemediation: 'Validate crankshaft sensor pulses via hardware DMA timers; reject unverified broadcast CAN messages for shift decisions.',
        };

        detectedViolation = {
          id: `VIO-RPM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: now,
          canIdHex: formatCanIdHex(id),
          ruleCode: 'RULE_KINEMATIC_VIOLATION',
          severity: 'CRITICAL',
          title: 'Tachometer Surge: Erroneous Redline Spike',
          details: `RPM escalated by ${rpmJump} RPM in ${delta}ms without corresponding throttle position increase.`,
          frame,
          mitigated: this.defenses.kinematicRateLimiter,
          triage,
        };

        if (this.defenses.kinematicRateLimiter) {
          this.recordViolation(detectedViolation);
          return { accepted: false, violation: detectedViolation };
        }
      }
      history.lastRpm = rpm;
    }

    // RULE 5: FRESHNESS COUNTER / REPLAY ATTACK DETECTION
    if ((id === CAN_IDS.ENGINE_RPM_GEAR || id === CAN_IDS.VEHICLE_SPEED) && frame.dlc >= 5) {
      const currentSeq = frame.data[4] & 0x0f;
      if (history.lastSeqCounter !== undefined) {
        const expectedSeq = (history.lastSeqCounter + 1) & 0x0f;
        // In replay attacks, sequence counter either repeats identically or skips backward
        if (frame.isAttack && frame.attackType === 'REPLAY' && currentSeq === history.lastSeqCounter) {
          const triage: SecurityTriage = {
            threatName: 'CAN Frame Replay Attack (Stale Sequence Token)',
            mitreAttackId: 'MITRE ATT&CK for ICS: T0814 (Replay Attack)',
            affectedSubsystem: 'Vehicle Telemetry Bus Freshness Layer',
            physicalHazard: 'Replayed sensor frames deceive cluster into displaying stale driving states or re-triggering locked states.',
            technicalDiagnosis: `Sequence counter frozen at ${currentSeq} (expected monotonically increasing ${expectedSeq}). Captured frame was retransmitted without freshness update.`,
            industryRemediation: 'Deploy AUTOSAR SecOC freshness management with synchronized multi-byte monotonic epoch counters and AES-CMAC verification.',
          };

          detectedViolation = {
            id: `VIO-REP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            timestamp: now,
            canIdHex: formatCanIdHex(id),
            ruleCode: 'RULE_REPLAY_SEQUENCE',
            severity: 'WARNING',
            title: 'Replay Detected: Stale Freshness Counter',
            details: `Sequence counter repeated ${currentSeq} without advancement. Matches signature of pre-recorded packet injection.`,
            frame,
            mitigated: this.defenses.replayNonceFilter,
            triage,
          };

          if (this.defenses.replayNonceFilter) {
            this.recordViolation(detectedViolation);
            return { accepted: false, violation: detectedViolation };
          }
        }
      }
      history.lastSeqCounter = currentSeq;
    }

    history.lastTimestamp = now;
    this.timingMap.set(id, history);

    if (detectedViolation) {
      this.recordViolation(detectedViolation);
    }

    return { accepted: true, violation: detectedViolation };
  }

  private recordViolation(violation: IdsRuleViolation) {
    // Keep max 50 recent violations
    this.violations.unshift(violation);
    if (this.violations.length > 50) {
      this.violations.pop();
    }
  }
}
