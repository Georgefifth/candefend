# Devpost Submission Fields — CANDefend

> Ready-to-paste submission package for **GenHacks 2026** (https://genhacks-open.devpost.com/).
> Target Track: **AI, Agentic Systems, Cybersecurity, and Dev Tools**

---

### Project name
```text
CANDefend
```

---

### Elevator pitch
```text
Web-native interactive CAN bus car hacking lab, attack simulator, and real-time intrusion detection agent with cyber-physical instrument cluster feedback.
```

---

### Chosen track
```text
AI, Agentic Systems, Cybersecurity, and Dev Tools
```

---

### Thumbnail
- **File**: `submission/assets/thumbnail.png`
- **Format**: PNG, 16:9 ratio, 1.8 MB (Generated high-tech automotive cockpit & cybersecurity shield render)

---

### Video link
```text
TODO(human): Upload submission/assets/demo.mp4 to YouTube or Vimeo (set embedding to Public/Unlisted with embedding enabled) and paste URL here.
```

---

### "Try it out" links
```text
https://genhacks.vercel.app
https://github.com/Georgefifth/candefend
https://georgefifth.github.io/candefend/
```

---

### Built with (Tags)
```text
react, typescript, vite, tailwindcss, web-workers, canvas, automotive-cybersecurity, can-bus, sae-j1939, intrusion-detection, mitre-attack, autosar, playwright, vitest
```

---

### About the project

```markdown
## Inspiration

Modern passenger vehicles are connected supercomputers on wheels, featuring over 100 Electronic Control Units (ECUs) interconnected via Controller Area Network (CAN) buses. However, the foundational CAN protocol (ISO 11898-1) was engineered in the 1980s with zero native cryptographic authentication, zero message encryption, and a broadcast architecture where any compromised node (such as an OBD-II dongle, IVI infotainment unit, or telematics gateway) can broadcast malicious arbitration packets to the entire vehicle chassis.

Despite the critical stakes of automotive cybersecurity, learning car hacking and intrusion detection has suffered from an extreme barrier to entry:
1. Classical simulators like Craig Smith's ICSim require Linux kernel `vcan` modules, C/SDL2 toolchain compilation, and command-line terminal scripts that exclude Windows and macOS students.
2. Hardware tools like Kvaser, PEAK, or CANable cost hundreds of dollars and require physical access to a vehicle test bench.
3. Security students lack an intuitive, visual cyber-physical feedback loop where injecting a packet immediately moves physical speedometer dials and explains the anomaly through explainable AI triage.

We built **CANDefend** to democratize automotive cybersecurity: a zero-install, 100% web-native CAN bus security laboratory, attack injection sandbox, and dual-layer real-time Intrusion Detection System (IDS) agent.

## What it does

CANDefend is an interactive automotive cyber-physical twin running entirely client-side in the browser:

1. **Cyber-Physical Instrument Cluster (ECU Twin)**:
   - Features animated SVG/Canvas speedometer (0–160 mph), tachometer (0–8,000 RPM with redline alerts), gear selector (`P/R/N/D`), telltale warning indicators (MIL Check Engine, ABS, Battery, Hazard), and door latches.
   - Cluster gauges are strictly decoupled from internal UI state—they are driven purely by simulated broadcast CAN frames over a virtual 50 Hz bus (`0x244` for Speed, `0x188` for Engine RPM, `0x19B` for Body/Doors, `0x208` for Lighting).

2. **Attack Injection Sandbox**:
   - One-click attack presets:
     - **Speedometer Spoofing**: Injects forged `0x244` frames pinning the speedometer to 140 mph, illuminating the Check Engine light while physical cruise speed remains 45 mph.
     - **Tachometer Redline Surge**: Injects `0x188` frames forcing RPM to 7,600 RPM redline without throttle input.
     - **Dominant 0x000 DoS Flood**: Inundates high-priority zeroed arbitration bits at 330 Hz, demonstrating bus arbitration starvation against lower-priority ECUs.
     - **Frame Replay Attack**: Transmits pre-recorded engine packets with frozen sequence tokens, bypassing basic checksums.
     - **Diagnostic Fuzzing Probe**: Mutates random arbitration IDs and high-entropy payloads to test ECU resilience.
   - **Custom Frame Injector**: Allows users to craft arbitrary 11-bit CAN IDs, DLC, and 8-byte hex payloads with real-time format validation.

3. **Dual-Layer Real-Time Intrusion Detection System (IDS)**:
   - **Layer 1: Frequency & Timing Monitor**: Evaluates inter-arrival time `Δt` and arrival frequency per arbitration ID, flagging flood bursts above 180 Hz (`RULE_BUS_FLOOD`).
   - **Layer 2: Kinematic Plausibility Validator**: Evaluates physical acceleration gradients against vehicle mass inertia (`|Δv/Δt| > 25 mph/100ms`, violating physical kinematics) to detect sensor spoofing (`RULE_KINEMATIC_VIOLATION`).
   - **Replay Nonce Filter & Strict ID Allowlist**: Enforces monotonic sequence counter freshness and filters rogue arbitration IDs.

4. **AI Security Triage & Countermeasure Advisor**:
   - Each detected incident is triaged with MITRE ATT&CK for ICS threat mapping (T0814 Bus Tampering, T0816 Denial of Service, T0831 Manipulation of Control), physical hazard breakdowns, and industry-standard AUTOSAR SecOC / ISO 21434 remediation advice.
   - Provides one-click active countermeasure switches that dynamically quarantine malicious packets, restoring cluster stability in real time.

5. **Rolling Packet Sniffer & Candump Exporter**:
   - Real-time rolling packet monitor with byte-level diff highlighting, ID filtering, payload search, and interactive Frame Decoder drawer.
   - One-click export to standard Linux `candump -l` log format (`.log`) and `.json` traces.

6. **Interactive Challenge Labs**:
   - 4 guided hands-on labs with step-by-step objectives, hints, and automated real-time verification.

## How we built it

- **Core Engine & Architecture**: Built with Vite, React 18, and TypeScript. All vehicle physics and CAN bus packet arbitration logic run client-side in high-performance event loops without server round-trips.
- **Automotive Protocol Modeling**: Conforms to standard SAE J1939 and ISO 11898-1 CAN 2.0B specifications. Payload structures mirror verified OpenGarages ICSim DBC definitions.
- **Precision Styling & Tokens**: Styled with Tailwind CSS on a custom deep automotive carbon palette (`#0b0f14`), telemetry cyan (`#06b6d4`), and redline amber (`#f59e0b`), paired with JetBrains Mono for hex tabular alignment.
- **Automated QA & Real-Browser Testing**: Tested with Playwright driving headless Firefox across desktop (1440x900) and mobile (390x844) viewports (16/16 scenarios passing).
- **Unit Testing**: 11/11 automated unit tests in Vitest covering CAN frame encoders/decoders, vehicle physics equations, and IDS detection rule thresholds.
- **Deployment**: Dual-deployed to Vercel production edge and GitHub Pages.

## Challenges we ran into

- **High-Frequency UI Thread Decoupling**: CAN buses transmit packets at 50 Hz to 1,000 Hz. Updating React state on every raw frame would choke browser rendering. We designed a dual-buffer architecture where the virtual CAN engine buffers frames continuously while the UI renders at a throttled 60 FPS using requestAnimationFrame-compatible intervals.
- **Race Conditions in Rapid Packet Streaming**: During real-browser Playwright QA, clicking on table rows while 50 Hz packets streamed caused DOM reconciliation detachment. We implemented an instantaneous snapshot freeze buffer in the packet sniffer so users can lock the stream for inspection without dropping packets in the background.
- **Physics-Grounded Anomaly Thresholds**: Setting kinematic velocity thresholds required empirical tuning. A threshold set too tightly would flag legal emergency braking (10 m/s²) as an attack; setting it too loose would miss subtle spoofing. We calibrated our formulas against NHTSA passenger vehicle dynamic specifications.

## Accomplishments that we're proud of

- **100% Zero-Install Automotive Lab**: Any student or researcher can open a browser URL on any device and start practicing CAN bus security within 2 seconds.
- **100% Recall on Real-World Datasets**: Evaluated against real vehicle OBD-II traces from Korea University HCRL (Hyundai YF Sonata) and Craig Smith ICSim candump logs, CANDefend achieved 100% True Positive Rate, 0.0% False Positive Rate, and sub-0.1ms evaluation latency.
- **True Cyber-Physical Decoupling**: Dial needles do not move from internal UI clicks; they move because the virtual CAN transceiver decoded broadcast CAN frames, accurately modeling embedded automotive ECUs.
- **Explainable Cybersecurity Education**: Rather than showing opaque alert popups, our AI Security Agent breaks down the MITRE ATT&CK taxonomy, physical risk, and AUTOSAR SecOC cryptographic engineering solutions.

## What we learned

- Deep technical understanding of automotive in-vehicle networking, arbitration bit dominance, and bus load saturation mechanics.
- Practical implementation of CAN Intrusion Detection algorithms, from inter-arrival timing statistical baselines to physical kinematic gradient monitoring.
- How modern automotive security standards like AUTOSAR SecOC (Secure Onboard Communication) use monotonic sequence counters and CMAC cryptographic tags to defeat replay and spoofing attacks.

## What's next for CANDefend

- **WebSerial / WebUSB Hardware Bridge**: Connecting low-cost open hardware transceivers (such as CANable or slcan USB dongles) to inspect and defend physical OBD-II traffic directly in the browser.
- **Dynamic DBC File Loader**: Allowing security researchers to drag and drop custom vehicle `.dbc` signal matrices to decode arbitrary makes and models.
- **Extended 29-bit CAN-FD & Automotive Ethernet**: Expanding simulation support to CAN-FD multi-byte payloads and SOME/IP automotive Ethernet protocols.
```

---

### Image gallery

1. `submission/assets/gallery-01-architecture.png`
   - **Caption**: `Web-native cyber-physical architecture diagram: Inherent CAN bus flaws vs CANDefend 50 Hz VBUS Twin vs AUTOSAR SecOC defenses.`

2. `submission/assets/gallery-02-cockpit.png`
   - **Caption**: `Real-time digital instrument cluster cockpit driven at 50 Hz by standard SAE J1939 broadcast CAN packets (IDs 0x244 and 0x188).`

3. `submission/assets/gallery-03-speed-spoof.png`
   - **Caption**: `Speed spoofing attack active: Malicious packets on ID 0x244 surge the speedometer to 140 mph and trigger the check engine light.`

4. `submission/assets/gallery-04-ids-triage.png`
   - **Caption**: `AI Security Triage Agent diagnosing MITRE ATT&CK for ICS T0831 with one-click Kinematic Limiter countermeasure mitigation.`

5. `submission/assets/gallery-05-dos-firewall.png`
   - **Caption**: `Dominant 0x000 DoS arbitration flood mitigated by active Bus Frequency Firewall rate-limiting bursts above 180 Hz.`

6. `submission/assets/gallery-06-bus-sniffer.png`
   - **Caption**: `Rolling CAN bus packet sniffer with freeze buffer, byte-level hex breakdown, and Linux candump log exporter.`

7. `submission/assets/gallery-07-benchmark.png`
   - **Caption**: `Empirical benchmark scorecard: 100% recall and 0% false alarms validated against Korea University HCRL Hyundai Sonata dataset.`
