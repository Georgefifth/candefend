# CANDefend Studio — QA Test Scenarios

## P0 Scenarios (Critical - Blocks Core Cyber-Physical Security Workflow)

1. **`smoke`**: Initial visit & cockpit rendering.
   - Verify page title, VBUS connection status (500 kbps CAN 2.0B), zero horizontal overflow at desktop (1440px) and mobile (390px).
2. **`core-flow-attack-triage-mitigate`**: End-to-end attack injection, IDS anomaly detection, and one-click mitigation.
   - Cruise baseline at 45 mph.
   - Inject Speed Spoofing (140 mph).
   - Speedometer gauge spikes, Check Engine Light illuminates, IDS generates Critical Kinematic Violation alert.
   - Engage Kinematic Limiter defense countermeasure.
   - Defense engages, attack frames are quarantined, and incident status switches to MITIGATED.
3. **`dos-flood-and-firewall`**: Denial of Service arbitration starvation and frequency firewall.
   - Launch high-priority 0x000 DoS flood.
   - Rapid 330 Hz arbitration injection triggers `RULE_BUS_FLOOD`.
   - Engage Bus Frequency Firewall countermeasure.
   - Flooding frames are dropped and bus normalizes.

## P1 Scenarios (Major Functionality & Usability)

4. **`bus-sniffer-filter-inspect`**: Real-time packet sniffer, ID filtering, and frame decoder drawer.
   - Navigate to Bus Sniffer tab.
   - Filter by ID (0x244), verify tabular packet stream, click row to open Frame Decoder modal.
   - Verify raw byte breakdown and decoded signal readout.
5. **`custom-frame-injection`**: Custom CAN frame crafting and hazard body lighting activation.
   - Switch to Custom Frame tab in Attack Sandbox.
   - Input Arbitration ID `0x208`, DLC `4`, payload `00 00 01 00`.
   - Transmit frame; assert cluster hazard light indicator activates.
6. **`guided-labs-workflow`**: Interactive cybersecurity lab progression and validation.
   - Switch to Guided Labs tab.
   - Run verification check on Lab 1 and Lab 2.
   - Assert challenge status transitions to COMPLETED.

## P2 Scenarios (Polish, Drive Controls & Trace Exports)

7. **`drive-controls-responsiveness`**: Throttle acceleration, braking deceleration, and gear state transitions.
   - Adjust throttle slider; assert velocity increases.
   - Toggle brake pedal; assert brake telltale activates, speed decelerates to 0, gear switches to P.
8. **`data-export-candump`**: Exporting standardized Linux candump traces.
   - Click `.log (candump)` export button; assert clean trace generation without console error.
