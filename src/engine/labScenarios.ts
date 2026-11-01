import { LabScenario } from '../types/can';

export const LAB_SCENARIOS: LabScenario[] = [
  {
    id: 'lab-1',
    title: 'Lab 1: Baseline Telemetry & CAN Sniffing',
    difficulty: 'Beginner',
    summary: 'Identify the arbitration ID governing speedometer velocity.',
    description: 'Inspect the live rolling CAN bus monitor. Locate the frame broadcasting vehicle speed (ID 0x244) and verify its standard 20ms broadcast frequency.',
    hint: 'Look at ID 0x244 in the packet table. Its first two payload bytes encode speed in km/h * 100.',
    validationCheck: ({ frames }) => {
      // Completed if at least 15 frames with ID 0x244 have been captured
      return frames.filter((f) => f.id === 0x244).length >= 15;
    },
    completed: false,
  },
  {
    id: 'lab-2',
    title: 'Lab 2: Speed Spoofing & Kinematic Anomaly',
    difficulty: 'Beginner',
    summary: 'Inject a 140 mph velocity spike and review the IDS physics triage.',
    description: 'Launch the "Inject Speed Spoof (140 mph)" attack preset. Notice the cluster speedometer spike, and observe how the IDS engine flags a Kinematic Plausibility Violation.',
    hint: 'Click "Inject Speed Spoof" in the Attack Sandbox panel, then inspect the red IDS alert card.',
    validationCheck: ({ violations }) => {
      return violations.some((v) => v.ruleCode === 'RULE_KINEMATIC_VIOLATION');
    },
    completed: false,
  },
  {
    id: 'lab-3',
    title: 'Lab 3: Bandwidth Starvation & DoS Mitigation',
    difficulty: 'Intermediate',
    summary: 'Trigger a high-priority 0x000 DoS flood, then activate the frequency firewall.',
    description: 'Simulate a high-frequency DoS flood on ID 0x000. Next, toggle ON the "Bus Frequency Firewall" in the IDS Defenses panel to quarantine malicious flooding frames.',
    hint: 'Launch "Inject DoS Flood (0x000)", then enable the "Bus Frequency Firewall" toggle in Active Countermeasures.',
    validationCheck: ({ violations, defenses }) => {
      const hasFlood = violations.some((v) => v.ruleCode === 'RULE_BUS_FLOOD');
      return hasFlood && defenses.busFrequencyFirewall;
    },
    completed: false,
  },
  {
    id: 'lab-4',
    title: 'Lab 4: Reverse Engineering & Custom Injection',
    difficulty: 'Advanced',
    summary: 'Craft a custom CAN frame to toggle emergency hazard lights.',
    description: 'Switch to the Custom Injector tab. Set Arbitration ID to 0x208 and DLC to 4 with payload "00 00 01 00" to broadcast hazard lighting across the vehicle body bus.',
    hint: 'Enter CAN ID "0x208" with bytes "00 00 01 00" in the Custom Injection panel and click Transmit.',
    validationCheck: ({ frames, state }) => {
      const customLight = frames.some(
        (f) => f.id === 0x208 && f.isAttack && f.attackType === 'CUSTOM' && f.data[2] === 1
      );
      return customLight || state.hazardLights;
    },
    completed: false,
  },
];
