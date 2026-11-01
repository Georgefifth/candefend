# UX Contract — CANDefend (CANShield Studio)

> Acceptance contract for CANDefend frontend. Every implementation must conform
> to this specification.

## 1. Product

- **One-liner**: Web-native interactive CAN bus security lab and real-time intrusion detection agent with simulated instrument cluster feedback.
- **Primary user**: Cybersecurity students, ethical automotive hackers, and embedded systems developers learning vehicle bus security.
- **Job to be done**: Safely simulate, inject, analyze, and detect automotive CAN bus attacks (DoS, spoofing, replay, fuzzing) in a zero-install browser environment.
- **Core success action**: User injects an attack (e.g. Speed Spoofing or DoS), sees the instrument cluster react realistically, and observes the IDS agent flag and explain the anomalous frame within 100ms.
- **What the user should never have to guess**:
  1. Which packet ID controls which vehicle gauge.
  2. Why a specific frame was flagged as an intrusion (exact threshold or rule violated).
  3. Whether the virtual vehicle bus is currently running, paused, or under attack.

## 2. Core flow

| # | Step | User action | System feedback | Next step is obvious? |
|---|---|---|---|---|
| 1 | Land & Inspect Baseline | Lands on studio, virtual vehicle is driving normally (45 mph, 2200 RPM) | Live cluster needles animate; green packets scroll at 50 Hz in bus monitor; IDS shows "Bus Normal / 0 Alerts" | Yes: Attack sandbox panel is highlighted on right |
| 2 | Select & Inject Attack | Clicks "Inject Speed Spoof" preset in Attack Sandbox | Cluster speedometer violently spikes to 140 mph; red badge pulses on bus monitor; IDS alert card triggers with audio/visual warning | Yes: View Incident Triage details in drawer/panel |
| 3 | Triage & Mitigate | Reads AI Security Agent root-cause diagnosis (Kinematic Speed Jump >40mph/100ms); clicks "Enable Kinematic Rate Limiter" | Packet is quarantined in IDS log; speedometer returns to true physical speed (45 mph); incident status switches to "MITIGATED" | Yes: Can export security log or try next lab challenge |

Target: ≤ 2 clicks and < 15 seconds from landing to first verified attack injection and IDS detection.

## 3. Pages / Layout

CANDefend is an engineering workbench organized as a synchronized 3-pane responsive studio with zero dead navigation:

| Zone / Component | Purpose | Primary action | Secondary actions |
|---|---|---|---|
| **Top Navigation** | System state, bus speed, presets & lab challenges | Toggle Bus (Run/Pause) | Select Lab Scenario, Reset Bus, Export Log (`.asc`/`.json`) |
| **Zone A: Cyber-Physical Cluster** | Real-time vehicle visualization driven strictly by CAN IDs | View speedometer, tachometer, gear, warnings | Manual drive controls (throttle / brake / turn signals) |
| **Zone B: CAN Bus Traffic Monitor** | Real-time rolling packet sniffer with byte diffs | Filter by CAN ID or search payload | Pause stream, inspect frame byte breakdown |
| **Zone C: Attack Sandbox & IDS Agent** | Attack injection controls + real-time intrusion detection triage | "Inject Attack" button | Adjust attack frequency, toggle IDS defense filters, read remediation advice |

One primary action per zone. Clear, unambiguous visual states.

## 4. Required states

For every component and interactive control:

- [x] **Empty / First visit**: Bus runs a clean 45 mph cruise baseline so the user immediately sees activity; instructions explain what each ID does.
- [x] **Loading**: Sub-second instantaneous client-side initialization with animated bus connection status indicator (`● VBUS CONNECTED 500 kbps`).
- [x] **Success**: Attack mitigation successfully restores cluster stability; clear green badge confirms countermeasure engaged.
- [x] **Error / Intrusion**: High-visibility amber/red threat banner with specific arbitration ID, payload byte diff, and rule trigger.
- [x] **Invalid input**: Manual packet injector highlights invalid hex characters (`[0-9A-Fa-f]` only) and bounds checks DLC (0–8).
- [x] **Mobile 390px layout**: Stacked responsive view prioritizing Cluster Gauge + Attack Trigger + Alert Triage with bottom sheet packet inspector.

## 5. Design tokens

- **Font family**:
  - Monospace (Telemetry, IDs, Hex bytes, Gauges): `JetBrains Mono`, `SF Mono`, `Menlo`, `monospace`
  - Sans-serif (UI controls, labels, agent analysis): `Inter`, `system-ui`, `-apple-system`, `sans-serif`
- **Spacing scale**: 4px, 8px, 12px, 16px, 20px, 24px, 32px
- **Colors**:
  - Background (Studio canvas): `#0b0f14` (Deep automotive carbon black)
  - Surface Panel / Cards: `#121a24` (Dark telemetry slate)
  - Surface Highlight / Hover: `#1a2636`
  - Borders: `#1e2c3d`
  - Text Primary: `#f8fafc` (High contrast crisp white)
  - Text Secondary / Muted: `#94a3b8`
  - Telemetry Normal (Cyan): `#06b6d4`
  - Normal Status (Green): `#10b981`
  - Warning / Caution (Amber): `#f59e0b`
  - Attack / Intrusion Threat (Red): `#ef4444`
  - ECU ID Badges:
    - Engine/Speed (`0x244`): `#38bdf8`
    - RPM/Transmission (`0x188`): `#818cf8`
    - Doors/Brakes (`0x19B`): `#34d399`
    - Attack/Malicious (`0x000` / Spoofed): `#f43f5e`
- **Radius**: `4px` (Sharp, precision instrument feel, strictly no oversized pill cards)
- **Button and input height**: Minimum 44px touch targets on mobile; compact 36px on desktop with crisp 1px borders.
- **Icon style**: Crisp geometric SVG glyphs (shields, hazard triangles, waveforms, play/pause).

## 6. References

| Reference (URL or screenshot) | What to borrow | What not to copy |
|---|---|---|
| **ICSim (Craig Smith)** | Classical CAN arbitration IDs (`0x188`, `0x244`), instrument cluster layout | Linux SocketCAN dependency, outdated C/SDL2 rendering |
| **Wireshark / SavvyCAN** | Dense rolling packet sniffer table with byte highlighting and delta-T timing | Cluttered desktop menus, intimidating modal dialogs |
| **Datadog / Sentry Incident UI** | Actionable alert triage cards with root cause, affected subsystem, and remediation | Enterprise marketing chrome, complex cloud billing flows |

## 7. Mobile (390px)

- **390px Layout**: Vertical stack with responsive tab switcher:
  - Tab 1: **Cluster & Drive** (compact SVG speedometer/tachometer + throttle sliders).
  - Tab 2: **Attack & IDS Agent** (1-tap attack triggers + live threat banner).
  - Tab 3: **Bus Sniffer** (compact 5-column hex stream with auto-scroll toggle).
- **Primary action reachable**: "Inject Attack" / "Mitigate" button is sticky or accessible within one thumb tap.
- **Collapsed**: Byte breakdown table collapses into expandable accordion cards on narrow screens.

## 8. Visual direction

- **Three adjectives**: **Cyber-Physical (信息物理), Telemetric (遥测精确), High-Density (高信息密度)**.
- **Product archetype**: **Automotive Instrument Cluster Canvas + Terminal / Security Workbench**.
- **Palette and why it fits**: Deep carbon-black `#0b0f14` with phosphor amber `#f59e0b` and telemetry cyan `#06b6d4`. Matches high-end automotive digital cockpits and automotive engineering oscilloscopes.
- **Type pairing**: `JetBrains Mono` for all automotive telemetry/hex data + `Inter` for interface typography.
- **Density**: High density. Engineers need to see packet streams, cluster dials, and threat explanations simultaneously without scrolling through massive blank spaces.
- **Signature element**: **Live Cyber-Physical Synchronizer**: Animated SVG/Canvas instrument cluster dynamically reactive to byte-level CAN frame injections with red-highlighted spoofed byte diffs.
- **Motion rules**: Dials and needles interpolate smoothly via standard spring/damping physics (60 FPS); threat alerts pulse once upon detection; no decorative particle blobs or gratuitous hover flips.
- **Rejected clichés**: Purple gradients, glassmorphism, three-card landing page, generic KPI dashboards with meaningless percentages, emoji icons, abstract vector illustrations.

**Generic test passed**: A screenshot of CANDefend immediately reads as an automotive cybersecurity lab and instrument cluster twin—it cannot be mistaken for any generic CRM or marketing SaaS.

## 9. UX acceptance criteria

- [x] A first-time user can explain the product's purpose within 5 seconds ("Interactive CAN bus car hacking and security detection lab in the browser").
- [x] The core task (inject attack -> see cluster spike -> view IDS alert) is reachable from the landing screen in ≤2 clicks without reading manuals.
- [x] Every packet dispatch and attack injection produces visual feedback within <16ms (60 FPS).
- [x] Every IDS alert explicitly states: (1) Detected Signature, (2) Target CAN ID, (3) Anomaly Reason, (4) Recommended Defense.
- [x] Desktop (1440px) and mobile (390px) layouts are fully functional.
- [x] Real-time engine runs 100% locally in browser without external cloud dependencies.
