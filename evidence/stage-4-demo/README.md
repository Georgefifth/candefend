# Stage 4 — Demo Video & Visual Presentation Evidence

> Product: **CANDefend (CANShield Studio)**  
> Hackathon: **GenHacks 2026** (Devpost: https://genhacks-open.devpost.com/)  
> Track: **AI, Agentic Systems, Cybersecurity, and Dev Tools**  
> Output Artifact: `evidence/stage-4-demo/demo.mp4` (1080p H.264 / AAC, 92.6 seconds)

---

## 1. Demo Video Specifications

- **Format**: MPEG-4 (H.264 High Profile, AAC Stereo)
- **Resolution**: 1920 × 1080 (1080p Full HD, 16:9)
- **Frame Rate**: 30 fps
- **Duration**: **92.6 seconds (01:32.6)** — Well within Devpost's ≤ 3:00 minute limit
- **File Size**: **10.1 MB** (Clean compression, high fidelity)
- **Narrator Voice**: `en-US-AndrewMultilingualNeural` (Neural Text-to-Speech)
- **Audio Features**: Procedural UI Foley SFX (whooshes, clicks, switches) + `cyber-pulse` theme-matched background music with automatic `sidechaincompress` voiceover ducking
- **Framing**: Screen Studio-style floating macOS desktop window on dark grid canvas for live app scenes; full-bleed live HTML slides for technical architecture and empirical benchmarks

---

## 2. Storyboard & Scene Breakdown

| # | Scene Name | Type | Duration | Visual Highlights | Narrative Focus |
|---|---|---|---|---|---|
| **1** | `arch-intro` | Live HTML Slide (`#slide-arch`) | 11.1s | 3-column architecture diagram: Inherent CAN bus flaws vs CANDefend 50 Hz VBUS Twin vs AUTOSAR SecOC defenses | Explains unencrypted broadcast CAN bus vulnerability and introduces CANDefend's zero-install web lab |
| **2** | `live-cockpit` | Live App (macOS frame) | 13.9s | Animated SVG Speedometer (45 mph) & Tachometer (2200 RPM, Gear D), telltale indicators | Digital instrument cluster driven at 50 Hz by standard SAE J1939 broadcast CAN packets |
| **3** | `live-speed-spoof` | Live App (macOS frame) | 13.0s | Velocity surge to 140 mph, check engine light illuminates, spotlight on physical anomaly | Demonstrates attack injection on ID 0x244 overriding cluster velocity readings |
| **4** | `live-ids-triage` | Live App (macOS frame) | 15.3s | AI Security Triage card, MITRE ATT&CK T0831 mapping, "Engage Kinematic Limiter" countermeasure | Evaluates kinematic acceleration violation (|Δv/Δt|) and quarantines attack packets with one click |
| **5** | `live-dos-firewall` | Live App (macOS frame) | 15.2s | Dominant 0x000 DoS burst at 330 Hz, Frequency Firewall card toggled to FILTERING ACTIVE | Prevents arbitration priority starvation by rate-limiting rogue bursts exceeding 180 Hz |
| **6** | `live-bus-sniffer` | Live App (macOS frame) | 11.2s | Buffer freeze, Frame Decoder drawer, byte-by-byte hex & decimal breakdown, decoded speed in km/h | Inspects raw payload bytes, decodes signals, and highlights Linux candump log compatibility |
| **7** | `metrics-close` | Live HTML Slide (`#slide-metrics`) | 12.5s | 4 giant KPI cards (100% TPR, 0.0% FPR, <0.1ms latency, 100% quarantine) + Ground Truth Benchmark table | Summarizes empirical validation against Korea University HCRL Hyundai Sonata dataset |

---

## 3. Visual QA & Verification Frames

Extracted QA frames in `evidence/stage-4-demo/qa/`:
- `frame-2.png`: Technical Architecture & Threat Vector slide (cyber-terminal aesthetic, burned-in captions).
- `frame-18.png`: Live Cyber-Physical Twin cockpit with 50 Hz VBUS telemetry.
- `frame-32.png`: Speed Spoofing attack injection with cluster needle surge.
- `frame-48.png`: AI Security Triage diagnosis & MITRE ATT&CK for ICS T0831 classification.
- `frame-62.png`: High-priority 0x000 DoS flood & Frequency Firewall mitigation.
- `frame-76.png`: Bus Sniffer packet inspector with raw byte breakdown.
- `frame-86.png`: Empirical Ground Truth Benchmark scorecard (100% recall).

All frames verified for:
1. Zero text truncation or caption overlap.
2. Perfect 1080p alignment with floating window drop shadows.
3. Authentic technical data and empirical metrics derived directly from Stage 3.5.
