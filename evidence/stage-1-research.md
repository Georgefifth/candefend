# Stage 1 — Research & Topic Selection Evidence: Automotive / "Car" Domain

> Hackathon: **GenHacks** (https://genhacks-open.devpost.com/)  
> Deadline: December 26, 2026 @ 12:00am EST  
> Focus Domain: **Car / Automotive / Smart Mobility / Connected Vehicle Software**  
> Status: Research Complete, Awaiting Human Theme Selection (Stage 1 Exit Gate)

---

## 1. Hackathon Landscape & Strategic Alignment

### 1.1 GenHacks Requirements & Tracks
- **Eligibility**: Students only (ages 13+). Individual or team.
- **Tracks**:
  1. **Healthcare & Environmental**: Health, driver wellbeing, emissions reduction, eco-driving, EV battery lifecycle.
  2. **Robotics & IoT**: Hardware telemetry, OBD-II data streaming, CAN bus transceivers, sensor integration.
  3. **AI, Agentic Systems, Cybersecurity, and Dev Tools**: Intelligent agents, automotive cybersecurity, intrusion detection, simulation/benchmark developer tools.
  4. **Open**: General software innovations solving real-world friction.
- **Judging Criteria (25% each)**:
  - **Impact**: Real-world utility and problem resolution for targeted users.
  - **Technical Execution**: Working live software, architectural depth, complexity built during the event.
  - **Creativity**: Originality of approach and product framing.
  - **Presentation**: Clarity of demo video (≤3 min), UI intuitiveness, and evidence-backed claims.
- **Strategic Fit for "Car"**: The automotive domain bridges embedded IoT (OBD-II / CAN), high-stakes safety/cybersecurity (vehicle bus vulnerabilities), critical environmental transitions (EV range/battery health), and high-frequency consumer pain points (used car scams, expensive diagnostic repairs).

---

## 2. Market Exploration & Unmet Needs in Automotive Software

Consumer and developer tools in the automotive space are severely bifurcated:
1. **Commercial / Enterprise Lock-in**: Tools like Upstream Security (CAN IDS), Samsara (fleet telematics), and RepairPal Enterprise are gatekept behind five-figure B2B enterprise contracts.
2. **Predatory Consumer "Freemium" Scams**: Apps like Carly ($60+/yr subscription for basic SAE J2012 codes) and FIXD ($59 hardware + $12/month continuous upsell) exploit car owners' anxiety when a Check Engine Light illuminates without providing transparent, actionable mechanical guidance.
3. **Heavyweight Developer Toolchains**: Tools like CARLA (50GB+ download, requires high-end Linux workstations), ICSim (requires Linux kernel SocketCAN compilation), or SavvyCAN require steep desktop setup that excludes web-first collaboration and rapid student/researcher iteration.
4. **Information Asymmetry**: Used car buyers and EV owners face opaque battery health claims, dealer-wiped fault codes, and unexpected winter range collapse without accessible, transparent, reproducible auditing tools.

---

## 3. Seven Differentiated Candidate Directions

---

### Direction 1: CANDefend (CANShield Studio) — Interactive Browser CAN Bus Security Lab & Anomaly Detection Agent
- **GenHacks Track**: AI, Agentic Systems, Cybersecurity, and Dev Tools / Robotics & IoT
- **Target User**: Cybersecurity students, ethical hackers, and automotive software engineers studying vehicle bus security and connected telematics intrusion detection.
- **Specific Pain Point**: Connected vehicles (telematics dongles, infotainment, OTA gateways) expose unencrypted, unauthenticated CAN buses. Practicing automotive cybersecurity currently requires complex Linux kernel configurations (`vcan`, `socketcan`, C/SDL2 compilation for ICSim) or expensive hardware transceivers ($500+ Kvaser/PEAK). Furthermore, security students lack an interactive browser-based visual attack sandbox to inject fuzzing/spoofing payloads and evaluate Intrusion Detection System (IDS) algorithms in real-time.
- **Current Workarounds**: Setting up local Linux VMs with ICSim and terminal `cansend`/`candump` scripts; reading static textbook datasets; manual log inspection in Wireshark.
- **Existing Products**:
  1. *ICSim (Instrument Cluster Simulator)*: https://github.com/zombieCraig/ICSim (Open-source C/SDL2 tool; Linux only, requires socketcan, no integrated ML/heuristic IDS or modern web interface).
  2. *SavvyCAN*: https://github.com/collin80/SavvyCAN (Desktop C++/Qt tool; complex UI, focused on raw frame sniffing rather than interactive security attack simulation and automated triage).
  3. *Upstream Security*: https://upstream.auto/ (Commercial automotive cloud cybersecurity; enterprise B2B only, closed source, inaccessible to students).
- **Flaws & Evidence**: ICSim issues frequently cite compilation failures on modern Linux distros, zero Windows/macOS support, and lack of automated attack verification. SavvyCAN lacks scenario generation and automated anomaly triage.
- **Our Concrete Improvement**: A 100% browser-based CAN Bus Security Lab featuring:
  - An interactive Virtual Instrument Cluster (Speedometer, Tachometer, Indicators, Doors) driven by real-time simulated CAN frame broadcasts (standard IDs: `0x188`, `0x244`, etc.).
  - Interactive Attack Injection Panel: Denial of Service (DoS flood), Message Replay, ID Spoofing (e.g., injecting 120 mph when vehicle is idling), and Random Fuzzing.
  - Dual-Layer Intrusion Detection Engine: Statistical entropy / frequency monitoring + ML heuristic rule engine that flags anomalous frames with microsecond precision.
  - Security Triage Agent: Explains attacked subsystem, potential physical danger, and recommended countermeasure (e.g., SecOC AUTOSAR message authentication).
- **Why Users Switch**: Instant zero-install web lab; immediate visual cause-and-effect feedback on cluster dials; exportable standard `.log`/`.asc` traces.
- **Feasibility & Risks**: High feasibility. Web Workers handle high-frequency frame dispatching (100 Hz - 1 kHz) without locking UI; canvas renders smooth gauges.
- **MVP Scope**: Interactive cluster + virtual CAN bus engine + 4 attack presets + real-time IDS alert timeline + exportable logs.
- **Success Metric**: Detection of 99%+ injected malicious frames with <10ms alert latency; zero UI frame drops at 500 frames/sec simulation.
- **Epistemic Status**:
  - *Verified Fact*: CAN protocol has no built-in cryptographic authentication or sender IDs.
  - *Reasonable Inference*: An interactive browser sandbox significantly lowers learning barriers for students compared to compiling Linux C code.
  - *Unverified Hypothesis*: Students will use the tool for class assignments and CTF preparation.
- **Scoring (out of 10)**:
  - Practical Value: 8.5/10 (High utility for cyber education & automotive engineering)
  - Innovation: 9.0/10 (First fully web-native interactive CAN attack/IDS sandbox)
  - Competitive Edge: 9.5/10 (No web equivalent exists; ICSim/SavvyCAN are desktop only)
  - User Experience: 9.0/10 (Direct tactile cluster dials, live packet inspector)
  - Feasibility: 9.0/10 (Pure frontend + TypeScript engine, completely deployable to GitHub Pages/Vercel)
  - **Composite Score: 9.0 / 10**

---

### Direction 2: AutoTriage (ClearCar) — Open OBD-II & Mechanical Symptom Triage Engine
- **GenHacks Track**: AI, Agentic Systems, Cybersecurity, and Dev Tools / Open
- **Target User**: Everyday car owners and non-technical drivers facing unexpected Check Engine Lights (CEL) or mechanical noises who fear predatory mechanic repair markups.
- **Specific Pain Point**: A Check Engine Light illuminates; auto parts stores provide a raw diagnostic trouble code (e.g., "P0420" or "P0171"). Drivers do not know if the vehicle is safe to drive, what component failed, or what a fair repair costs. Commercial apps (Carly, FIXD) aggressively upsell expensive subscriptions and provide generic descriptions without localized cost estimates or mechanic negotiation scripts.
- **Current Workarounds**: Googling random forum threads on Reddit r/MechanicAdvice; trusting whatever the local repair shop quotes; ignoring the light until catastrophic breakdown.
- **Existing Products**:
  1. *FIXD*: https://www.fixdapp.com/ ($59 adapter + $12/month continuous subscription; widely criticized on Reddit for spam and low actionable detail).
  2. *Carly*: https://www.mycarly.com/ ($60–$90/yr recurring software subscription on top of hardware; aggressive marketing).
  3. *RepairPal*: https://repairpal.com/ (Fair price estimator; useful but static, lacks diagnostic triage or interactive symptom differential tree).
- **Flaws & Evidence**: Reddit r/MechanicAdvice is flooded daily with users posting: "Mechanic quoted $1,400 for P0420, am I getting ripped off?" FIXD App Store reviews cite constant billing traps for information that is public SAE J2012 documentation.
- **Our Concrete Improvement**:
  - Free, open web-first diagnostic triage engine supporting DTC code input and simulated/uploaded OBD-II freeze-frame CSV logs.
  - Multi-factor Differential Diagnosis: Ranks root causes (e.g., downstream O2 sensor vs. exhaust leak vs. degraded catalytic converter) with contextual probabilities.
  - Immediate Driving Safety Rating: Red (immediate engine damage risk), Yellow (safe for short trips to repair facility), Green (emissions/evap advisory).
  - Anti-Ripoff Negotiation Guide: Computes fair parts MSRP + standard book labor hours; provides a literal script of questions to ask the mechanic.
  - Interactive OBD Simulator: Includes realistic pre-loaded diagnostic scenarios (vacuum leaks, misfires, EVAP leaks) for immediate testing.
- **Why Users Switch**: 100% free and open, zero predatory subscriptions, provides direct actionable cost clarity and negotiation leverage.
- **Feasibility & Risks**: High feasibility. Comprehensive SAE J2012 DTC dictionary is well-documented; vehicle labor times can be estimated using industry standard baseline models.
- **MVP Scope**: DTC search & freeze-frame parser + differential diagnosis engine + fair repair cost calculator + mechanic quote sanity check analyzer + interactive OBD scenario runner.
- **Success Metric**: Accurately triages 200+ common powertrain/chassis DTC codes with transparent part/labor cost bands.
- **Epistemic Status**:
  - *Verified Fact*: Consumer diagnostic tools monetize publicly available OBD codes behind recurring subscriptions.
  - *Reasonable Inference*: Transparent cost breakdown and safety severity triage relieves user panic.
  - *Unverified Hypothesis*: Users will actively bring generated negotiation scripts to mechanics.
- **Scoring (out of 10)**:
  - Practical Value: 9.5/10 (Directly solves high-frequency consumer financial anxiety)
  - Innovation: 8.0/10 (Combines DTC lookup with freeze-frame heuristics and anti-fraud scripts)
  - Competitive Edge: 8.5/10 (Completely open alternative to FIXD/Carly subscription traps)
  - User Experience: 9.0/10 (Intuitive safety traffic-light system and step-by-step triage)
  - Feasibility: 9.5/10 (Clean TypeScript data models, runs instantly on client)
  - **Composite Score: 8.9 / 10**

---

### Direction 3: VoltGuard (BatteryIQ) — EV Battery Health & Real-World Winter Range Auditor
- **GenHacks Track**: Healthcare & Environmental / Robotics & IoT
- **Target User**: Used Electric Vehicle (EV) shoppers and current EV drivers experiencing winter range anxiety and battery degradation uncertainty.
- **Specific Pain Point**: The battery pack is 40–50% of an EV's asset value ($8,000–$20,000 replacement). Used EV dealers frequently clear BMS fault codes or claim "100% battery capacity" based on full dashboard charge display, masking real State of Health (SOH) degradation. Furthermore, sub-zero winter temperatures cause unpredictable 30–45% real-world range collapses that standard EPA ratings fail to communicate.
- **Current Workarounds**: Trusting dealer claims; purchasing niche model-specific OBD adapters (e.g., LeafSpy for Nissan Leaf only); estimating range by guessing.
- **Existing Products**:
  1. *Recurrent Auto*: https://www.recurrentauto.com/ (Focuses on dealership B2B vehicle history; requires linking live telematics accounts, slow and opaque for instant consumer checks).
  2. *A Better Routeplanner (ABRP)*: https://abetterrouteplanner.com/ (Focuses on highway route planning; weather and live consumption require premium subscription and hardware pairing).
  3. *LeafSpy*: https://play.google.com/store/apps/details?id=com.Turbo3.Leaf_Spy_Lite (Niche Android tool strictly for Nissan Leaf; steep technical barrier).
- **Flaws & Evidence**: EV forums (r/electricvehicles, Tesla Motors Club) continuously warn about "hidden battery degradation on used Model 3 / Bolt / Leaf" and surprise winter range drop on highway commutes.
- **Our Concrete Improvement**:
  - Transparent, thermodynamic EV range and degradation auditing tool.
  - Input vehicle model, year, odometer, and charging history / BMS telemetry logs to generate an audited State of Health (SOH) baseline against fleet benchmarks.
  - Real-World Winter & Highway Stress-Tester: Dynamically simulate temperatures (-25°C to +35°C), cabin HVAC heating load, highway speeds (55 mph vs 75 mph), and terrain elevation to calculate exact usable battery range.
  - Shareable "EV Battery Health Certificate": PDF/print-ready verification badge for private party used EV transactions.
- **Why Users Switch**: Instant, multi-vehicle model support without requiring proprietary dealership accounts; transparent thermodynamic calculations.
- **Feasibility & Risks**: High feasibility. Battery cell chemistry degradation curves (NMC vs LFP) and cabin PTC/heat pump thermal loads follow well-established physics equations.
- **MVP Scope**: Multi-model EV degradation simulator (Tesla, Chevy Bolt, Nissan Leaf, Hyundai Ioniq 5) + temperature/speed stress-test calculator + printable Health Certificate generator.
- **Success Metric**: Predicts real-world winter range within 5% error margin of published empirical cold-weather tests (AAA / Recurrent published benchmarks).
- **Epistemic Status**:
  - *Verified Fact*: Cold temperatures reduce usable electrochemical battery capacity and increase resistive cabin heating load by up to 40%.
  - *Reasonable Inference*: Used EV buyers need an independent audit of battery SOH before committing thousands of dollars.
  - *Unverified Hypothesis*: Private sellers will voluntarily attach third-party battery audit certificates to listings.
- **Scoring (out of 10)**:
  - Practical Value: 9.0/10 (Critical for accelerating equitable, trustworthy used EV adoption)
  - Innovation: 8.5/10 (Combines electrochemical degradation models with real-world weather stress testing)
  - Competitive Edge: 8.5/10 (Open, instant consumer alternative to Recurrent/ABRP paywalls)
  - User Experience: 8.5/10 (Clear visual degradation degradation curves and interactive temperature slider)
  - Feasibility: 9.0/10 (Mathematical modeling + client-side analytics)
  - **Composite Score: 8.7 / 10**

---

### Direction 4: SentinelDrive (AwakeEdge) — Client-Side In-Cabin Driver Vigilance & Drowsiness Guardian
- **GenHacks Track**: Healthcare & Environmental / Robotics & IoT / AI
- **Target User**: Long-distance commuters, rideshare drivers (Uber/Lyft), night-shift workers, and student drivers susceptible to highway hypnosis and micro-sleeps.
- **Specific Pain Point**: Drowsy driving contributes to over 100,000 police-reported crashes annually in the US (NHTSA). Commercial fleet monitoring solutions (Samsara, Netradyne) cost $30–$50/month and stream driver in-cabin video to cloud servers, creating severe privacy violations. Smartphone fatigue apps on app stores are largely abandonware with high false-positive rates that fail to adapt to individual facial baselines.
- **Current Workarounds**: Cracking windows; loud music; energy drinks; relying on rudimentary in-dash steering torque monitors (which only trigger after the vehicle drifts across lanes).
- **Existing Products**:
  1. *Samsara Driver Safety Dashcam*: https://www.samsara.com/ (Enterprise fleet B2B; high monthly subscription, cloud video recording).
  2. *Comma.ai openpilot Driver Monitoring*: https://comma.ai/ (High-quality open-source vision monitoring, but requires $1,200 specialized Comma 3X hardware).
  3. *Drive Awake / Mobile Apps*: (Outdated, high false alarm rate, lack adaptive facial landmark calibration).
- **Flaws & Evidence**: Consumer drivers reject in-cabin cloud cameras due to privacy concerns; budget drivers cannot justify $1,000+ proprietary hardware.
- **Our Concrete Improvement**:
  - 100% client-side, zero-cloud in-browser driver vigilance monitor powered by WebAssembly and local face mesh landmark tracking.
  - Multi-metric vigilance engine: Eye Aspect Ratio (EAR), PERCLOS (percentage of eye closure over running time window), Mouth Aspect Ratio (MAR for yawn frequency), and 3D head pose estimation (pitch/yaw for smartphone distraction).
  - 30-Second Adaptive Baseline Calibration: Calibrates to the driver's unique facial proportions and lighting conditions to prevent false alarms.
  - Tiered Audio Alert System: Subtle chime for mild gaze distraction, urgent multi-tone alarm for micro-sleep (>1.2s eye closure).
  - Privacy Guarantee: Zero video frames leave the local device; telemetry logs show vigilance trend without storing camera imagery.
- **Why Users Switch**: Runs immediately on any laptop or mounted smartphone browser with a webcam; zero hardware cost; 100% privacy-preserving.
- **Feasibility & Risks**: Medium-High feasibility. Modern browser WebAssembly / MediaPipe Face Mesh runs comfortably at 30+ FPS client-side; requires robust fallback for low-light camera conditions.
- **MVP Scope**: Live webcam face tracking + real-time EAR/PERCLOS/MAR telemetry dashboard + adaptive calibration wizard + dual-stage audio alert system + session vigilance fatigue report.
- **Success Metric**: Stable 30 FPS tracking; 0% cloud network requests; trigger alert within 500ms of sustained eye closure.
- **Epistemic Status**:
  - *Verified Fact*: PERCLOS is validated by NHTSA and FHWA as the most reliable bio-behavioral metric for driver drowsiness.
  - *Reasonable Inference*: A zero-cloud browser app provides high privacy appeal for independent rideshare drivers.
  - *Unverified Hypothesis*: Drivers will routinely mount phones to run browser-based webcams during nighttime drives.
- **Scoring (out of 10)**:
  - Practical Value: 8.5/10 (Direct life-safety utility against highway fatigue crashes)
  - Innovation: 8.5/10 (Zero-cloud WebAssembly client-side facial landmark fatigue scoring)
  - Competitive Edge: 8.0/10 (Completely free, privacy-first alternative to $1,000 hardware)
  - User Experience: 8.0/10 (Requires webcam permission and proper mounting angle)
  - Feasibility: 8.5/10 (Requires lightweight model loading and audio context integration)
  - **Composite Score: 8.3 / 10**

---

### Direction 5: LemonShield (AutoInspector) — Used Car Pre-Purchase Inspection Copilot & NHTSA Defect Radar
- **GenHacks Track**: AI, Agentic Systems, Cybersecurity, and Dev Tools / Open
- **Target User**: First-time used car buyers, budget shoppers, and private-party vehicle purchasers.
- **Specific Pain Point**: The used vehicle market suffers from severe information asymmetry. Private sellers and used car dealers often conceal mechanical flaws (e.g., timing chain rattle, transmission shudder, fluid leaks). Carfax reports cost $44.99 per vehicle and only reflect reported insurance claims, omitting structural wear, poor maintenance, or known manufacturing engineering defects (such as Hyundai Theta II rod knock or Ford DCT clutch failure).
- **Current Workarounds**: Paying $200+ for mobile pre-purchase mechanics (Lemon Squad); carrying generic paper checklists; hoping the test drive doesn't reveal issues later.
- **Existing Products**:
  1. *Carfax*: https://www.carfax.com/ ($44.99 per lookup; historical paper trail only, does not inspect physical mechanical condition).
  2. *CoPilot Search*: https://www.copilotsearch.com/ (Marketplace aggregator; focuses on listing prices rather than guided mechanical defect triage).
  3. *NHTSA Safety Databases*: https://www.nhtsa.gov/ (Government portal; raw, uncurated recall tables, difficult for casual buyers to interpret).
- **Flaws & Evidence**: Carfax explicitly disclaims mechanical wear and tear. Buyers regularly discover catastrophic engine or transmission failure weeks after purchase because they didn't know which specific components to inspect for that model year.
- **Our Concrete Improvement**:
  - Instant VIN Decoding via free public NHTSA VPIC API (Make, Model, Year, Engine displacement, Plant of manufacture).
  - Dynamic Model-Specific Inspection Matrix: Generates targeted mechanical check items based on historical NHTSA complaint clusters and known Technical Service Bulletins (TSBs) for that specific powertrain.
  - Guided Step-by-Step Inspection Flow: Cold start audio check, fluid condition, panel gap alignment, OBD-II readiness status, and test drive symptoms.
  - Fair Price Negotiation Deductor: Converts discovered defects into instant itemized dollar deductions (e.g., "Worn front control arm bushings: deduct $450 from seller's asking price").
- **Why Users Switch**: Gives casual buyers the inspection knowledge of an experienced mechanic; saves $45+ on Carfax while uncovering real physical defects.
- **Feasibility & Risks**: High feasibility. NHTSA VPIC API is completely free and public; inspection heuristics and defect catalog can be curated into structured schemas.
- **MVP Scope**: VIN decoder + dynamic inspection checklist + symptom severity scoring + repair cost negotiation summary exporter.
- **Success Metric**: Decodes any valid 17-digit VIN and renders targeted inspection checklist in <1.5 seconds.
- **Epistemic Status**:
  - *Verified Fact*: NHTSA VPIC database provides comprehensive vehicle specifications for free.
  - *Reasonable Inference*: Buyers equipped with specific repair cost figures can negotiate lower prices from private sellers.
  - *Unverified Hypothesis*: Casual buyers will thoroughly perform all 15+ mechanical inspection checks in front of a private seller.
- **Scoring (out of 10)**:
  - Practical Value: 8.5/10 (Tangible money saver during high-stakes used car purchases)
  - Innovation: 8.0/10 (Bridges government defect data with on-site inspection negotiation)
  - Competitive Edge: 8.0/10 (Free structured inspection copilot vs $45 static Carfax reports)
  - User Experience: 8.5/10 (Clean mobile-friendly inspection workflow)
  - Feasibility: 9.0/10 (Relies on verified free NHTSA VPIC API)
  - **Composite Score: 8.4 / 10**

---

### Direction 6: TrackSim (MicroCarla) — Web-Native Autonomous Model Car Safety & Trajectory Benchmark Studio
- **GenHacks Track**: AI, Agentic Systems, Cybersecurity, and Dev Tools / Robotics & IoT
- **Target User**: Student robotics teams, autonomous vehicle researchers, and collegiate racing clubs (F1TENTH, DonkeyCar, Duckietown, AWS DeepRacer).
- **Specific Pain Point**: Full-scale autonomous driving simulators like CARLA require 50GB+ installations, high-end dedicated GPUs, and complex ROS2/Linux setups. Student robotics teams competing in 1:10 scale autonomous racing lack a lightweight, web-native environment to test trajectory planners (Pure Pursuit, Stanley, MPC) and evaluate obstacle avoidance safety boundaries against synthetic edge cases without spending hours compiling C++/ROS dependencies.
- **Current Workarounds**: Using simple 2D matplotlib scripts; running desktop-bound Python Gym environments; trial-and-error physical testing on expensive model hardware.
- **Existing Products**:
  1. *CARLA Simulator*: https://carla.org/ (Massive 3D simulator; requires high-end Linux workstation, gaming GPU, steep learning curve).
  2. *F1TENTH Gym*: https://github.com/f1tenth/f1tenth_gym (Python 2D environment; desktop only, no visual web-based scenario editor or instant browser benchmarking).
  3. *Donkey Car Web UI*: https://github.com/autorope/donkeycar (Basic teleoperation interface; lacks sensor simulation or trajectory benchmark analytics).
- **Flaws & Evidence**: Student hackathons and university labs frequently cite the multi-hour friction of installing Gazebo/CARLA; remote team members without dedicated GPUs are excluded from testing autonomous vehicle code.
- **Our Concrete Improvement**:
  - High-performance, WebGL/HTML5 Canvas-based autonomous car simulator running Ackermann steering kinematics and 360-degree 2D LiDAR raycasting.
  - Live Algorithm Comparison Sandbox: Toggle between Pure Pursuit, Stanley Controller, and Vector Field Histogram (VFH) obstacle avoidance with real-time telemetry (cross-track error, slip angle, latency).
  - Interactive Edge-Case Scenario Editor: Drag-and-drop static and moving obstacles, simulate sudden sensor dropout/noise, and benchmark recovery resilience.
  - Performance & Safety Scorecard: Computes lap time, maximum lateral G, collision frequency, and safety violation buffers.
- **Why Users Switch**: 100% browser-based; loads in 2 seconds; zero GPU or ROS dependency; instant URL sharing of tracks and algorithms.
- **Feasibility & Risks**: High feasibility. 2D raycasting and Ackermann vehicle physics are computationally lightweight and run at 60 FPS in standard browser canvas.
- **MVP Scope**: Interactive track canvas + Ackermann vehicle physics + simulated 2D LiDAR visualization + 2 path tracking algorithms + obstacle editor + benchmark metric dashboard.
- **Success Metric**: Consistent 60 FPS rendering; sub-millisecond physics updates; real-time LiDAR raycast across 32 beams.
- **Epistemic Status**:
  - *Verified Fact*: Heavyweight simulators (CARLA/Gazebo) present major setup hurdles for student developers.
  - *Reasonable Inference*: A browser-based Ackermann simulator enables rapid educational experimentation and remote collaboration.
  - *Unverified Hypothesis*: Student robotics clubs will replace local Python scripts with a web-based benchmarking tool.
- **Scoring (out of 10)**:
  - Practical Value: 8.0/10 (High utility for robotics/autonomous vehicle education)
  - Innovation: 8.5/10 (Web-first raycasted LiDAR and vehicle dynamics benchmarking)
  - Competitive Edge: 8.5/10 (Zero-install web alternative to heavyweight CARLA/ROS setups)
  - User Experience: 9.0/10 (Visual track editor, real-time telemetry graphs)
  - Feasibility: 8.5/10 (Requires clean mathematical physics implementation in TypeScript)
  - **Composite Score: 8.5 / 10**

---

### Direction 7: MotorLedger (FleetWise) — Receipt-to-Ledger Vehicle TCO & TSB Recall Radar
- **GenHacks Track**: AI, Agentic Systems, Cybersecurity, and Dev Tools / Open
- **Target User**: Car owners, independent gig drivers, and DIY vehicle hobbyists managing vehicle maintenance and true cost of ownership.
- **Specific Pain Point**: Maintenance records are scattered across glovebox paper receipts, dealer invoices, and oil change stickers. Owners miss preventative maintenance milestones (e.g., timing belt at 90k miles) or pay thousands for repairs that were actually covered under manufacturer Technical Service Bulletins (TSBs) or extended warranty campaigns. Existing apps require tedious manual data entry for every gas stop and repair bill.
- **Current Workarounds**: Excel spreadsheets; physical folders of receipts; basic fuel logging apps like Fuelly.
- **Existing Products**:
  1. *Fuelly*: https://www.fuelly.com/ (Old 2000s web UI; strictly focuses on fuel MPG logging, tedious manual entry).
  2. *Drivvo*: https://www.drivvo.com/ (Mobile tracking app; littered with ads, requires manual entry of all line items, no TSB defect matching).
  3. *CarFax Car Care*: (Closed dealer ecosystem; misses independent and DIY mechanic receipts).
- **Flaws & Evidence**: Users abandon car maintenance apps because manual typing of repair receipts is too tedious.
- **Our Concrete Improvement**:
  - Drag-and-drop repair receipt OCR/parser that automatically extracts date, odometer reading, parts replaced, and labor costs.
  - Dynamic Maintenance Schedule Radar: Automatically calculates remaining service intervals based on vehicle mileage.
  - TSB & Recall Matching Engine: Flags whether recorded repair items match open manufacturer defect campaigns.
  - Real-time Total Cost of Ownership (TCO) Calculator: Cost per mile, depreciation curve, and "Repair vs. Replace" financial decision advisor.
- **Why Users Switch**: Eliminates manual logging friction; proactively surfaces manufacturer defect coverage.
- **Feasibility & Risks**: High feasibility. OCR can be handled with client-side Tesseract.js or lightweight vision parsing; mileage schedules follow structured manufacturer intervals.
- **MVP Scope**: Receipt drag-and-drop parser + vehicle ledger timeline + maintenance interval checklist + cost-per-mile analytics dashboard.
- **Success Metric**: Correctly extracts odometer, date, and total dollar cost from repair invoices with actionable timeline rendering.
- **Epistemic Status**:
  - *Verified Fact*: Car owners frequently misplace maintenance paperwork and miss critical service intervals.
  - *Reasonable Inference*: Automatic receipt parsing reduces tracking drop-off.
  - *Unverified Hypothesis*: Casual drivers will regularly digitize receipts after leaving repair shops.
- **Scoring (out of 10)**:
  - Practical Value: 8.0/10 (Helpful financial & maintenance tracking utility)
  - Innovation: 7.5/10 (Combines receipt parsing with maintenance radar and TSB checking)
  - Competitive Edge: 7.5/10 (Better UX than Fuelly/Drivvo, but competes in a crowded utility niche)
  - User Experience: 8.5/10 (Clean financial dashboard and timeline)
  - Feasibility: 9.0/10 (Standard web data flow and OCR integration)
  - **Composite Score: 8.1 / 10**

---

## 4. Stage 3: Ruthless Critique & Elimination Review

We subject all 7 candidates to the 6 mandatory critical elimination questions:

| # | Critique Question | Direction 1: CANDefend | Direction 2: AutoTriage | Direction 3: VoltGuard | Direction 4: SentinelDrive | Direction 5: LemonShield | Direction 6: TrackSim | Direction 7: MotorLedger |
|---|---|---|---|---|---|---|---|---|
| **Q1** | **Does this product really need to exist?** | **YES.** Automotive cyber education is crippled by Linux C tooling barriers. | **YES.** Millions of drivers are overcharged for basic CEL codes annually. | **YES.** Used EV buyers have zero independent battery SOH verification. | **MAYBE.** Helpful, but drivers already have phone mounts and may find fatigue apps annoying. | **YES.** High-stakes purchase with severe asymmetric information. | **YES.** Student robotics teams waste days configuring ROS2/CARLA. | **BORDERLINE.** Existing spreadsheets or basic notes often suffice for casual drivers. |
| **Q2** | **Why can't existing tools solve it?** | ICSim is Linux-only CLI/C; SavvyCAN is complex desktop Qt. | FIXD & Carly lock public codes behind $60/yr paywalls. | Recurrent is closed dealer B2B; ABRP is highway routing only. | Comma.ai costs $1,200; fleet cams upload private video to cloud. | Carfax costs $45 and misses physical wear/TSBs entirely. | CARLA requires 50GB + gaming GPU; no instant web benchmark. | Drivvo/Fuelly require painful manual data entry. |
| **Q3** | **Is there a simpler, cheaper, or non-AI solution?** | No web-native interactive simulator exists; dual-layer heuristic/IDS is essential. | DTC lookups exist, but context triage and anti-ripoff scripting need structured logic. | Physics equations work, but interactive multi-variable stress testing is missing. | Basic timers exist, but facial PERCLOS vision tracking is needed for actual fatigue. | Checklists exist on paper, but VIN-specific TSB matching requires software. | 2D canvas simulation is already the lightweight alternative to 3D engines. | Paper folders and Excel already exist and require zero software. |
| **Q4** | **Will users bounce after one try?** | No; students/researchers rerun attacks, test custom IDS rules, and export logs. | High retention during vehicle ownership; users consult it whenever issues arise. | Used when evaluating EV purchases or planning seasonal winter trips. | High risk of bounce if camera calibration is finicky or produces false chimes. | High utility during buying window (1–2 weeks), then discarded until next car purchase. | High retention during robotics project lifecycle and competition tuning. | Moderate risk of bounce due to ongoing receipt logging fatigue. |
| **Q5** | **What evidence proves our approach is better?** | Zero install, instantaneous browser cluster feedback, verified packet replay. | Free, zero subscription traps, transparent part/labor cost breakdown. | Empirical winter degradation models without corporate account signups. | 100% client-side WebAssembly privacy guarantee vs cloud dashcams. | Tailored to exact engine/chassis defect history, not just historical insurance claims. | 60 FPS in browser in 2 seconds vs 50GB CARLA install. | Automated OCR extraction vs tedious manual typing. |
| **Q6** | **Fatal Assumption: Which single failure kills this idea?** | If Web Workers cannot maintain stable 100Hz+ simulated CAN packet timing in browser. | If users don't have access to the DTC code from their car or local auto store. | If users cannot obtain basic battery capacity or mileage history. | If camera lighting variations cause unacceptable false alarm rates. | If users refuse to perform hands-on inspection steps in front of the seller. | If 2D Ackermann physics cannot capture meaningful autonomous edge cases. | If OCR parsing accuracy on faded thermal receipts is unacceptably low. |

---

## 5. Stage 4: Candidate Comparison Matrix & Strategic Scoring

### 5.1 Comparative Scoring Matrix

| Direction | Focus / Domain | Practical Value (10) | Innovation (10) | Competitive Edge (10) | User Experience (10) | Feasibility (10) | Composite Score | Best GenHacks Track |
|---|---|---|---|---|---|---|---|---|
| **1. CANDefend** | CAN Bus Security Lab & IDS Agent | 8.5 | 9.0 | 9.5 | 9.0 | 9.0 | **9.0 / 10** | **AI, Cyber & Dev Tools** *(Strongest)* |
| **2. AutoTriage** | OBD-II & Anti-Ripoff Triage Engine | 9.5 | 8.0 | 8.5 | 9.0 | 9.5 | **8.9 / 10** | **AI / Dev Tools & Open** |
| **3. VoltGuard** | EV Battery Health & Winter Range Auditor | 9.0 | 8.5 | 8.5 | 8.5 | 9.0 | **8.7 / 10** | **Healthcare & Environmental** |
| **4. SentinelDrive** | Client-Side Driver Vigilance Guardian | 8.5 | 8.5 | 8.0 | 8.0 | 8.5 | **8.3 / 10** | **Healthcare & Environmental / IoT** |
| **5. LemonShield** | Used Car Inspection Copilot & Defect Radar | 8.5 | 8.0 | 8.0 | 8.5 | 9.0 | **8.4 / 10** | **AI / Dev Tools / Open** |
| **6. TrackSim** | Web Autonomous Model Car Benchmark Studio | 8.0 | 8.5 | 8.5 | 9.0 | 8.5 | **8.5 / 10** | **Robotics & IoT / Dev Tools** |
| **7. MotorLedger** | Receipt-to-Ledger Vehicle TCO & TSB Radar | 8.0 | 7.5 | 7.5 | 8.5 | 9.0 | **8.1 / 10** | **Open** |

---

### 5.2 Strategic Recommendation & Rationale

#### Primary Recommendation: **Direction 1 — CANDefend (CANShield Studio)**
- **Why it is the strongest contender for GenHacks**:
  1. **Direct Track Alignment**: Competes directly for both the overall Grand Prize ($CAD 500) and the **"AI, Agentic Systems, Cybersecurity, and Dev Tools"** track prize ($CAD 50).
  2. **Technical Showstopper**: A live, animated instrument cluster reacting in real-time to simulated CAN bus packet injection (speedometer spiking during attack, tachometer surging, warning lights flickering) provides extraordinary visual impact for the mandatory ≤3 minute demo video.
  3. **High Hackathon Appeal**: Automotive cybersecurity is one of the most prominent yet least accessible topics in student engineering. Creating the first fully web-native, zero-install interactive CAN Bus security lab solves a verified pain point for students, educators, and security researchers.
  4. **Feasibility & Zero Infrastructure Headaches**: Runs completely client-side in TypeScript/Web Workers. Can be deployed seamlessly to GitHub Pages or Vercel with zero database or expensive server dependencies, ensuring instant, robust uptime.

#### Secondary Recommendation (Alternative Consumer Track): **Direction 2 — AutoTriage (ClearCar)**
- **Why it is an exceptional alternative**:
  - Unmatched consumer empathy. Every student and judge has either experienced or knows someone who has been terrified by a Check Engine Light and overcharged by a mechanic.
  - Directly exposes and defeats the predatory subscription models of commercial dongles like FIXD and Carly.
  - Extremely fast to build with rock-solid UX contract, clear differential diagnosis trees, and high practical utility.

---

### 5.3 Risk & Mitigation Matrix

| Candidate | Primary Technical/Product Risk | Concrete Mitigation Strategy |
|---|---|---|
| **1. CANDefend** | High-frequency packet streaming in JavaScript causing UI thread stutter or timer drift | Offload virtual CAN bus bus-state and packet dispatch to a dedicated Web Worker; UI thread throttles gauge repaints to 60 FPS using `requestAnimationFrame`. |
| **2. AutoTriage** | Inaccurate labor rate assumptions across different geographic regions | Use low/median/high labor rate bands ($90/$130/$180/hr) and state-specific averages with manual hourly rate override. |
| **3. VoltGuard** | Empirical battery degradation formulas diverging from real-world cell chemistry | Ground degradation equations in published academic datasets (Idaho National Laboratory EV testing / Geotab fleet benchmarks). |
| **4. SentinelDrive** | Poor performance in low-light webcam environments leading to false alerts | Include ambient contrast validator and explicit calibration state indicating lighting adequacy. |
| **5. LemonShield** | NHTSA VPIC API availability or rate limits during live inspection | Pre-cache top 100 most common vehicle models and store fallback schemas locally. |
| **6. TrackSim** | Complex collision physics causing frame drops on low-end hardware | Keep physics strictly 2D planar Ackermann geometry with circle/box collision primitives and pre-computed LiDAR raycasts. |
| **7. MotorLedger** | Low OCR fidelity on faded thermal receipt paper | Provide instant editable side-by-side verification table allowing one-click corrections. |

---

## 6. Stage 1 Exit Gate

In accordance with `AGENTS.md` and `prompts/01-research.md`:
- Research evidence is recorded in `evidence/stage-1-research.md`.
- Seven distinct candidates analyzed with links, flaws, concrete improvements, scores, and critique.
- Execution is **PAUSED** awaiting human review and theme selection.
- Development will strictly begin only after human confirmation and `STATE.md` update.
