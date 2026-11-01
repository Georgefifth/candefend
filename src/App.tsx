import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CanBusManager } from './engine/canBusManager';
import { CanFrame, IdsDefenseConfig, IdsRuleViolation, LabScenario, VehicleState } from './types/can';
import { LAB_SCENARIOS } from './engine/labScenarios';
import { Header } from './components/Header';
import { ClusterView } from './components/ClusterView';
import { BusMonitor } from './components/BusMonitor';
import { AttackSandbox } from './components/AttackSandbox';
import { IdsPanel } from './components/IdsPanel';
import { LabChallenges } from './components/LabChallenges';

export const App: React.FC = () => {
  const busManagerRef = useRef<CanBusManager | null>(null);

  // Core application reactive states
  const [vehicleState, setVehicleState] = useState<VehicleState>({
    speedMph: 45.0,
    speedKmh: 72.4,
    rpm: 2200,
    gear: 'D',
    throttlePercent: 30,
    brakeActive: false,
    leftSignal: false,
    rightSignal: false,
    hazardLights: false,
    doorsLocked: true,
    driverDoorOpen: false,
    passengerDoorOpen: false,
    trunkOpen: false,
    steeringAngleDeg: 0,
    checkEngineLight: false,
    absWarning: false,
    batteryWarning: false,
    odometerMiles: 14285.4,
  });

  const [frames, setFrames] = useState<CanFrame[]>([]);
  const [violations, setViolations] = useState<IdsRuleViolation[]>([]);
  const [defenses, setDefenses] = useState<IdsDefenseConfig>({
    kinematicRateLimiter: false,
    busFrequencyFirewall: false,
    replayNonceFilter: false,
    strictIdAllowlist: false,
  });

  const [labs, setLabs] = useState<LabScenario[]>(LAB_SCENARIOS);
  const [activeLabIndex, setActiveLabIndex] = useState<number>(0);
  const [isBusRunning, setIsBusRunning] = useState<boolean>(true);
  const [attackStatus, setAttackStatus] = useState<{ active: boolean; name: string | null }>({
    active: false,
    name: null,
  });

  // Navigation tab state ('cluster' | 'attacks' | 'monitor' | 'ids' | 'labs')
  const [activeTab, setActiveTab] = useState<'cluster' | 'attacks' | 'monitor' | 'ids' | 'labs'>('cluster');

  // Initialize CAN Bus Manager
  useEffect(() => {
    const manager = new CanBusManager();
    busManagerRef.current = manager;

    // Subscriptions
    const unsubState = manager.subscribeState((newState) => {
      setVehicleState(newState);
    });

    const unsubAlerts = manager.subscribeAlerts((alert) => {
      setViolations((prev) => [alert, ...prev.slice(0, 49)]);
    });

    // Throttled frame buffer update for UI rendering
    const frameInterval = setInterval(() => {
      setFrames(manager.getFrameBuffer());
      setAttackStatus(manager.isAttackActive());
    }, 60);

    return () => {
      clearInterval(frameInterval);
      unsubState();
      unsubAlerts();
      manager.destroy();
    };
  }, []);

  // Sync defenses when updated
  const handleToggleDefense = useCallback(
    <K extends keyof IdsDefenseConfig>(key: K, value: boolean) => {
      if (!busManagerRef.current) return;
      busManagerRef.current.getIds().setDefense(key, value);
      setDefenses(busManagerRef.current.getIds().getDefenses());
    },
    []
  );

  // Manual drive handlers
  const handleThrottleChange = (val: number) => {
    busManagerRef.current?.getPhysics().setThrottle(val);
  };

  const handleBrakeToggle = (active: boolean) => {
    busManagerRef.current?.getPhysics().setBrake(active);
  };

  const handleLeftSignalToggle = () => {
    busManagerRef.current?.getPhysics().toggleLeftSignal();
  };

  const handleRightSignalToggle = () => {
    busManagerRef.current?.getPhysics().toggleRightSignal();
  };

  const handleHazardToggle = () => {
    busManagerRef.current?.getPhysics().toggleHazardLights();
  };

  const handleDoorToggle = (door: 'driver' | 'passenger' | 'trunk') => {
    busManagerRef.current?.getPhysics().toggleDoor(door);
  };

  // Attack handlers
  const handleInjectSpeedSpoof = (targetMph: number) => {
    busManagerRef.current?.injectSpeedSpoof(targetMph);
    setAttackStatus(busManagerRef.current?.isAttackActive() ?? { active: false, name: null });
  };

  const handleInjectRpmSpoof = (targetRpm: number) => {
    busManagerRef.current?.injectRpmSpoof(targetRpm);
    setAttackStatus(busManagerRef.current?.isAttackActive() ?? { active: false, name: null });
  };

  const handleInjectDosFlood = (durationMs: number) => {
    busManagerRef.current?.injectDosFlood(durationMs);
    setAttackStatus(busManagerRef.current?.isAttackActive() ?? { active: false, name: null });
  };

  const handleInjectReplay = () => {
    busManagerRef.current?.injectReplayAttack();
    setAttackStatus(busManagerRef.current?.isAttackActive() ?? { active: false, name: null });
  };

  const handleInjectFuzzing = () => {
    busManagerRef.current?.injectFuzzingAttack();
    setAttackStatus(busManagerRef.current?.isAttackActive() ?? { active: false, name: null });
  };

  const handleInjectCustom = (id: number, data: Uint8Array) => {
    busManagerRef.current?.injectCustomFrame(id, data);
  };

  const handleStopAllAttacks = () => {
    busManagerRef.current?.stopAllAttacks();
    setAttackStatus({ active: false, name: null });
  };

  const handleToggleRunning = () => {
    if (!busManagerRef.current) return;
    const next = !isBusRunning;
    busManagerRef.current.setBusRunning(next);
    setIsBusRunning(next);
  };

  const handleResetBus = () => {
    if (!busManagerRef.current) return;
    busManagerRef.current.destroy();
    const fresh = new CanBusManager();
    busManagerRef.current = fresh;
    setViolations([]);
    setDefenses(fresh.getIds().getDefenses());
    setFrames([]);
  };

  const handleClearFrames = () => {
    setFrames([]);
  };

  const handleClearViolations = () => {
    busManagerRef.current?.getIds().clearViolations();
    setViolations([]);
  };

  // Log exports
  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCandump = () => {
    if (!busManagerRef.current) return;
    const log = busManagerRef.current.exportCanDumpLog();
    downloadFile(log, `candefend-trace-${Date.now()}.log`, 'text/plain');
  };

  const handleExportJson = () => {
    if (!busManagerRef.current) return;
    const log = busManagerRef.current.exportJsonLog();
    downloadFile(log, `candefend-telemetry-${Date.now()}.json`, 'application/json');
  };

  // Lab verification check
  const handleCheckCurrentLab = () => {
    const currentLab = labs[activeLabIndex];
    if (!currentLab) return;

    const isPassed = currentLab.validationCheck({
      frames,
      violations,
      defenses,
      state: vehicleState,
    });

    if (isPassed) {
      setLabs((prev) =>
        prev.map((l, i) => (i === activeLabIndex ? { ...l, completed: true } : l))
      );
    }
  };

  return (
    <div className="min-h-screen bg-carbon-900 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Application Header */}
      <Header
        isRunning={isBusRunning}
        onToggleRunning={handleToggleRunning}
        onResetBus={handleResetBus}
        onExportCandump={handleExportCandump}
        onExportJson={handleExportJson}
        alertCount={violations.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeLabTitle={labs[activeLabIndex]?.title ?? 'Lab 1'}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-3 sm:p-4 flex flex-col gap-4">
        {/* Tab 1: Cockpit View (Primary Visual Cluster + Drive Controls) */}
        {activeTab === 'cluster' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <ClusterView
              state={vehicleState}
              onThrottleChange={handleThrottleChange}
              onBrakeToggle={handleBrakeToggle}
              onLeftSignalToggle={handleLeftSignalToggle}
              onRightSignalToggle={handleRightSignalToggle}
              onHazardToggle={handleHazardToggle}
              onDoorToggle={handleDoorToggle}
            />

            {/* Side-by-side Attack Quick Launch & Alert Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AttackSandbox
                onInjectSpeedSpoof={handleInjectSpeedSpoof}
                onInjectRpmSpoof={handleInjectRpmSpoof}
                onInjectDosFlood={handleInjectDosFlood}
                onInjectReplayAttack={handleInjectReplay}
                onInjectFuzzingAttack={handleInjectFuzzing}
                onInjectCustomFrame={handleInjectCustom}
                onStopAllAttacks={handleStopAllAttacks}
                attackStatus={attackStatus}
              />

              <IdsPanel
                violations={violations}
                defenses={defenses}
                onToggleDefense={handleToggleDefense}
                onClearViolations={handleClearViolations}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Attack Sandbox View */}
        {activeTab === 'attacks' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <AttackSandbox
              onInjectSpeedSpoof={handleInjectSpeedSpoof}
              onInjectRpmSpoof={handleInjectRpmSpoof}
              onInjectDosFlood={handleInjectDosFlood}
              onInjectReplayAttack={handleInjectReplay}
              onInjectFuzzingAttack={handleInjectFuzzing}
              onInjectCustomFrame={handleInjectCustom}
              onStopAllAttacks={handleStopAllAttacks}
              attackStatus={attackStatus}
            />

            <ClusterView
              state={vehicleState}
              onThrottleChange={handleThrottleChange}
              onBrakeToggle={handleBrakeToggle}
              onLeftSignalToggle={handleLeftSignalToggle}
              onRightSignalToggle={handleRightSignalToggle}
              onHazardToggle={handleHazardToggle}
              onDoorToggle={handleDoorToggle}
            />
          </div>
        )}

        {/* Tab 3: Bus Sniffer / Monitor View */}
        {activeTab === 'monitor' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <BusMonitor frames={frames} onClear={handleClearFrames} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ClusterView
                state={vehicleState}
                onThrottleChange={handleThrottleChange}
                onBrakeToggle={handleBrakeToggle}
                onLeftSignalToggle={handleLeftSignalToggle}
                onRightSignalToggle={handleRightSignalToggle}
                onHazardToggle={handleHazardToggle}
                onDoorToggle={handleDoorToggle}
              />
              <AttackSandbox
                onInjectSpeedSpoof={handleInjectSpeedSpoof}
                onInjectRpmSpoof={handleInjectRpmSpoof}
                onInjectDosFlood={handleInjectDosFlood}
                onInjectReplayAttack={handleInjectReplay}
                onInjectFuzzingAttack={handleInjectFuzzing}
                onInjectCustomFrame={handleInjectCustom}
                onStopAllAttacks={handleStopAllAttacks}
                attackStatus={attackStatus}
              />
            </div>
          </div>
        )}

        {/* Tab 4: IDS Security Agent View */}
        {activeTab === 'ids' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <IdsPanel
              violations={violations}
              defenses={defenses}
              onToggleDefense={handleToggleDefense}
              onClearViolations={handleClearViolations}
            />

            <ClusterView
              state={vehicleState}
              onThrottleChange={handleThrottleChange}
              onBrakeToggle={handleBrakeToggle}
              onLeftSignalToggle={handleLeftSignalToggle}
              onRightSignalToggle={handleRightSignalToggle}
              onHazardToggle={handleHazardToggle}
              onDoorToggle={handleDoorToggle}
            />
          </div>
        )}

        {/* Tab 5: Guided Labs View */}
        {activeTab === 'labs' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <LabChallenges
              labs={labs}
              activeLabIndex={activeLabIndex}
              setActiveLabIndex={setActiveLabIndex}
              onCheckCurrentLab={handleCheckCurrentLab}
              onSwitchToCockpit={() => setActiveTab('cluster')}
              onSwitchToAttacks={() => setActiveTab('attacks')}
            />

            <ClusterView
              state={vehicleState}
              onThrottleChange={handleThrottleChange}
              onBrakeToggle={handleBrakeToggle}
              onLeftSignalToggle={handleLeftSignalToggle}
              onRightSignalToggle={handleRightSignalToggle}
              onHazardToggle={handleHazardToggle}
              onDoorToggle={handleDoorToggle}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-carbon-800 bg-carbon-950 px-4 py-3 text-xs font-mono text-slate-500">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">CANDefend Studio</span>
            <span>•</span>
            <span>Standard SAE J1939 / ISO 11898-1 CAN 2.0B</span>
            <span>•</span>
            <span>AUTOSAR SecOC / MITRE ATT&CK for ICS</span>
          </div>
          <div>
            Built for <strong className="text-cyan-400">GenHacks 2026</strong> (AI, Agentic Systems, Cybersecurity & Dev Tools Track)
          </div>
        </div>
      </footer>
    </div>
  );
};
