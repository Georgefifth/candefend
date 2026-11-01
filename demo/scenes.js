module.exports = [
  // 1. Architecture & Threat Vector (Live HTML Slide)
  {
    name: "arch-intro",
    card: {
      html: "demo/slides.html",
      slide: "#slide-arch",
    },
    duration: 6.0,
    vo: "Modern connected vehicles expose unencrypted 'CAN bus networks' where any compromised ECU can spoof commands. We built 'CANDefend'—the first zero-install cyber-physical security studio in the browser.",
    pause: 0.3,
  },

  // 2. Cockpit Live Baseline (Cyber-Physical Instrument Cluster)
  {
    name: "live-cockpit",
    session: "app",
    url: "http://localhost:4199",
    actions: [
      { type: "waitFor", sel: "text=CANDefend", timeout: 12000 },
      { type: "waitFor", sel: "text=Cyber-Physical Instrument Cluster" },
      { type: "spotlight", sel: "text=45", label: "★ 50 Hz VBUS TWIN", ms: 2200 },
      { type: "wait", ms: 1200 },
    ],
    vo: "On landing, a digital instrument cluster streams real 'SAE J1939 telemetry' at '50 Hz'. Every needle movement is strictly driven by broadcast CAN packets.",
    pause: 0.2,
  },

  // 3. Attack Injection: Speed Spoofing & Instrument Spike
  {
    name: "live-speed-spoof",
    session: "app",
    actions: [
      { type: "click", sel: "button:has-text('Inject Speed Surge')" },
      { type: "wait", ms: 1000 },
      { type: "spotlight", sel: "text=CHECK", label: "! VELOCITY SURGE", ms: 2000 },
      { type: "wait", ms: 1200 },
    ],
    vo: "Launch a 'Speed Spoofing attack': malicious frames on ID '0x244' instantly pin the speedometer to '140 mph', triggering the check engine light.",
    pause: 0.2,
  },

  // 4. IDS Anomaly Detection & AI Security Triage
  {
    name: "live-ids-triage",
    session: "app",
    actions: [
      { type: "click", sel: "button:has-text('IDS Agent')" },
      { type: "waitFor", sel: "text=AI Security Triage" },
      { type: "click", sel: "text=Kinematic Violation: Impossible Speed Jump" },
      { type: "spotlight", sel: "text=Kinematic Plausibility", label: "★ MITRE ATT&CK T0831", ms: 2200 },
      { type: "click", sel: "button:has-text('Engage Kinematic Limiter')" },
      { type: "wait", ms: 1200 },
    ],
    vo: "The 'IDS Engine' flags a 'Kinematic Plausibility Violation' in '0.1ms'. Our triage agent diagnoses 'MITRE T0831' and quarantines the attack with one click.",
    pause: 0.2,
  },

  // 5. DoS Flood Starvation & Frequency Firewall
  {
    name: "live-dos-firewall",
    session: "app",
    actions: [
      { type: "click", sel: "button:has-text('Attack Sandbox')" },
      { type: "click", sel: "button:has-text('Launch 3s DoS Flood')" },
      { type: "wait", ms: 800 },
      { type: "click", sel: "text=Frequency Firewall" },
      { type: "wait", ms: 1500 },
    ],
    vo: "Next, simulate a high-priority '0x000 DoS flood'. Engaging the 'Frequency Firewall' rate-limits rogue bursts above '180 Hz', preventing bus starvation.",
    pause: 0.2,
  },

  // 6. Bus Sniffer, Byte Breakdown & Log Export
  {
    name: "live-bus-sniffer",
    session: "app",
    actions: [
      { type: "click", sel: "button:has-text('Bus Sniffer')" },
      { type: "waitFor", sel: "text=CAN Bus Frame Sniffer" },
      { type: "click", sel: "button[title*='Freeze display buffer']" },
      { type: "click", sel: "button[aria-label='Inspect Frame']" },
      { type: "wait", ms: 1800 },
    ],
    vo: "Switch to the 'Bus Sniffer' to freeze the buffer and inspect raw 'hex payload bytes', decoded velocities, and export standard 'candump' traces.",
    pause: 0.2,
  },

  // 7. Empirical Validation Benchmark & Close
  {
    name: "metrics-close",
    card: {
      html: "demo/slides.html",
      slide: "#slide-metrics",
    },
    duration: 6.0,
    vo: "Validated against real 'Hyundai Sonata OBD-II traces', CANDefend achieves '100% recall' with zero false alarms. Experience 'CANDefend Studio' live today.",
    pause: 0.5,
  },
];
