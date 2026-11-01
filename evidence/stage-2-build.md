# Stage 2 — Build & Competitive Execution Evidence: CANDefend Studio

> Hackathon: **GenHacks 2026** (https://genhacks-open.devpost.com/)  
> Chosen Theme: **CANDefend (CANShield Studio)** — Interactive Browser CAN Bus Security Lab & Anomaly Detection Agent  
> Target Track: **AI, Agentic Systems, Cybersecurity, and Dev Tools** (Eligible for 1st Place $CAD 500 + Track Prize $CAD 50)  
> GitHub Repository: https://github.com/Georgefifth/candefend  
> Production Deployment URL (Vercel): https://genhacks.vercel.app  
> Fallback Deployment URL (GitHub Pages): https://georgefifth.github.io/candefend/  
> Build Status: Clean, Type-checked, 11/11 Vitest Unit Tests Passing, Verified in Playwright

---

## 1. Competitive Analysis & Direct Competitor Study

We performed an in-depth empirical audit of existing automotive CAN bus security and diagnostic tools:

| Dimension | ICSim (Craig Smith) | SavvyCAN (Collin Kidder) | Caring Caribou | Upstream Security | **CANDefend Studio (Ours)** |
|---|---|---|---|---|---|
| **Architecture** | Linux C / SDL2 / SocketCAN | C++ / Qt Desktop | Python CLI | Cloud SaaS (B2B) | **Zero-Install Web-Native (React/Vite/TS)** |
| **Setup Friction** | High (requires Linux kernel `vcan` modules, compilation) | High (requires desktop OS install & hardware transceivers) | Medium (CLI only, Linux/SocketCAN) | Extreme (Enterprise contract, $100k+) | **Instant (Zero install, opens in browser in <1s)** |
| **Cluster Feedback** | Basic 2D dials | None (raw graph plots only) | None (terminal text only) | Abstract fleet dashboards | **Real-Time Synchronized Cyber-Physical Cluster** |
| **Attack Sandbox** | None (requires external `cansend` scripts) | Manual frame sending | CLI fuzzing scripts | Passive telemetry ingestion | **1-Click Presets: Speed Spoof, RPM Surge, DoS, Replay, Fuzzing + Custom** |
| **Intrusion Detection (IDS)** | None | None | None | Proprietary cloud ML | **Dual-Layer Real-Time Engine (Kinematic Physics + Frequency Firewall)** |
| **Security Agent Triage** | None | None | None | Enterprise SOC analyst | **Integrated AI Triage Agent with MITRE ATT&CK for ICS mapping & AUTOSAR SecOC advice** |
| **Educational Labs** | Textbook reading | None | None | None | **4 Built-in Interactive Challenge Labs with automated verification** |
| **Export Formats** | Linux candump logs | `.asc`, `.csv`, `.log` | Text dumps | Proprietary JSON | **Standard Linux `.log` (candump -l compatible) & JSON** |

### Competitor References & Verification Links:
1. **ICSim**: https://github.com/zombieCraig/ICSim (Classical benchmark tool; strictly Linux-only, no IDS, no web support).
2. **SavvyCAN**: https://github.com/collin80/SavvyCAN (Powerful reverse-engineering tool; desktop-only, high visual complexity, no active attack/IDS simulation).
3. **Caring Caribou**: https://github.com/CaringCaribou/caringcaribou (Python CLI security scanner; no visual cluster or browser sandbox).
4. **Upstream Security**: https://upstream.auto/ (Commercial automotive cybersecurity SaaS; enterprise only, completely closed).

---

## 2. Issues Discovered in Existing Workflows & Prioritization

1. **P0 (Critical Blocker)**: Traditional automotive security learning requires compiling C code on Linux with root kernel permissions for `socketcan`. Windows and Mac students are excluded.
   - *Fix*: Implemented 100% browser-native CAN Bus engine running at 50 Hz base rate with zero external driver dependencies.
2. **P0 (Visual Disconnect)**: Existing packet sniffers (Wireshark, SavvyCAN) show raw hexadecimal rows without visual cause-and-effect link to vehicle dials.
   - *Fix*: Created tightly coupled Cyber-Physical Twin where cluster dials (Speedometer, Tachometer, Indicators, Doors) are driven strictly by CAN IDs (`0x244`, `0x188`, `0x19B`, `0x208`).
3. **P1 (Lack of Explainable Triage)**: When attacks occur on CAN buses, students do not understand *why* an attack is dangerous or *how* to remediate it in industry.
   - *Fix*: Built Security Agent Triage cards mapping every anomaly to MITRE ATT&CK for ICS (T0814, T0816, T0831), affected safety subsystems, and AUTOSAR SecOC / ISO 21434 standards.
4. **P1 (One-Click Active Defense Countermeasures)**: Students had no way to test whether defensive algorithms actually stop attacks.
   - *Fix*: Implemented 4 live toggleable countermeasures (Kinematic Rate Limiter, Frequency Firewall, Replay Nonce Filter, Strict ID Allowlist) that actively quarantine malicious packets in real time.

---

## 3. Product Specification & Completed Optimizations

### 3.1 UX Contract Adherence (`design/UX.md`)
- **Visual Direction**: Cyber-Physical, Telemetric, High-Density.
- **Palette**: Deep automotive carbon-black (`#0b0f14`), telemetry cyan (`#06b6d4`), tachometer redline (`#ef4444`), phosphor amber (`#f59e0b`).
- **Typography**: `JetBrains Mono` for all telemetry/hex grids + `Inter` for interface controls.
- **Generic SaaS Test Passed**: Visual cluster gauges and hex byte sniffers are completely domain-specific; impossible to confuse with generic SaaS.

### 3.2 Engineering Modules
- `src/types/can.ts`: Full TypeScript definitions for CAN frames, vehicle state, IDS rule violations, security triage, defense config, and lab challenges.
- `src/engine/canDefinitions.ts`: Encoders and decoders for SAE J1939 / ICSim arbitration IDs (`0x188`, `0x244`, `0x19B`, `0x208`, `0x0C9`, `0x1DC`).
- `src/engine/vehiclePhysics.ts`: Vehicle dynamics engine with realistic throttle response, brake deceleration, and gear progression.
- `src/engine/idsEngine.ts`: Dual-layer intrusion detection pipeline evaluating inter-arrival time Δt, frequency bursts, kinematic velocity gradient, monotonic sequence counter, and ID allowlist.
- `src/engine/canBusManager.ts`: Virtual CAN transceiver, frame buffering, attack injectors (Speed Spoof, RPM Surge, DoS Flood, Replay, Fuzzing, Custom Frame), and candump log exporter.
- `src/engine/labScenarios.ts`: 4 guided hands-on security challenge labs with live automated validation logic.
- `src/components/ClusterView.tsx`: SVG speedometer, tachometer, telltale warning indicators, odometer, door latches, and driver controls.
- `src/components/BusMonitor.tsx`: Rolling packet sniffer table with byte diffs, ID filter, payload search, and detailed frame decoder drawer.
- `src/components/AttackSandbox.tsx`: Attack preset launchers, active attack banner with kill-switch, and manual custom frame injector.
- `src/components/IdsPanel.tsx`: Countermeasure toggle switches, real-time threat alert feed, and AI Security Triage advisor.
- `src/components/LabChallenges.tsx`: Interactive challenge tracker with automated verification and celebration feedback.

---

## 4. Verification Evidence & Test Results

### 4.1 Automated Unit Tests (Vitest)
```
✓ src/engine/__tests__/canEngine.test.ts (11 tests passed in 151ms)
  ✓ CAN Frame Encoders and Decoders > correctly encodes and decodes vehicle speed (0x244)
  ✓ CAN Frame Encoders and Decoders > correctly encodes and decodes engine RPM, gear, and throttle (0x188)
  ✓ CAN Frame Encoders and Decoders > correctly encodes and decodes body doors and lock states (0x19B)
  ✓ CAN Frame Encoders and Decoders > correctly encodes and decodes lighting and turn signal indicators (0x208)
  ✓ Vehicle Physics Simulation > initializes in standard cruising state
  ✓ Vehicle Physics Simulation > accelerates toward target speed when throttle increases
  ✓ Vehicle Physics Simulation > brings vehicle to halt when brake is engaged
  ✓ Intrusion Detection System (IDS) Engine > detects Kinematic Plausibility Violation when speed jumps erratically
  ✓ Intrusion Detection System (IDS) Engine > quarantines and rejects spoofed frames when Kinematic Rate Limiter defense is engaged
  ✓ Intrusion Detection System (IDS) Engine > detects High-Frequency Bus Flooding (DoS) and rate-limits when firewall engaged
  ✓ Intrusion Detection System (IDS) Engine > detects Unregistered Arbitration ID (Rogue Node) and blocks when allowlist engaged
```

### 4.2 Frontend Screenshots (Evidence Directory)
- `evidence/stage-2-build/frontend/desktop-1440px-baseline.png`: Desktop 1440px baseline cockpit with normal cruise telemetry.
- `evidence/stage-2-build/frontend/desktop-1440px-attack-injected.png`: Speed spoof attack active; cluster speedometer spikes to 136 mph; IDS triggers critical alert.
- `evidence/stage-2-build/frontend/desktop-1440px-bus-monitor.png`: Bus sniffer table with active frame inspection and byte breakdowns.
- `evidence/stage-2-build/frontend/mobile-390px-cockpit.png`: Mobile 390px responsive cockpit layout with vertical gauge stack and drive controls.
- `evidence/stage-2-build/frontend/mobile-390px-ids-agent.png`: Mobile 390px IDS agent view with defense toggles and incident stream.
- `evidence/stage-2-build/deployed-verification.png`: Live headless browser verification on production Vercel deployment.

---

## 5. Deployment Information

- **GitHub Repository**: https://github.com/Georgefifth/candefend (Public, clean git history, 0 secrets, 0 private keys)
- **Primary Production URL (Vercel)**: https://genhacks.vercel.app (HTTP 200, verified live)
- **Secondary Static URL (GitHub Pages)**: https://georgefifth.github.io/candefend/ (gh-pages branch deployed)
- **Build Output**: Single-page application bundle (Vite + React + Tailwind CSS), client-side Web Workers/Timers, zero database dependency.

---

## 6. Known Remaining Limitations (Documented for Stage 3 QA & 3.5 Validation)

1. **Physical Dongle WebUSB / WebSerial Interface**: Currently runs simulated virtual CAN transceiver. Hardware bridge via WebSerial (e.g. CANable / slcan firmware) is architectural next step.
2. **Extended 29-bit CAN IDs**: Currently focuses on standard 11-bit CAN 2.0B arbitration IDs (most common for powertrain/cockpit). Extended 29-bit J1939 IDs can be added in future iterations.
3. **DBC File Upload Customization**: Built-in DBC matrix covers standard ICSim vehicle signals; dynamic user `.dbc` file parsing could expand to arbitrary vehicle models.
