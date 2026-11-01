import React from 'react';
import { VehicleState } from '../types/can';
import { AlertCircle, Disc, Battery, AlertOctagon, ArrowLeft, ArrowRight, TriangleAlert, Gauge } from 'lucide-react';

interface ClusterViewProps {
  state: VehicleState;
  onThrottleChange: (percent: number) => void;
  onBrakeToggle: (active: boolean) => void;
  onLeftSignalToggle: () => void;
  onRightSignalToggle: () => void;
  onHazardToggle: () => void;
  onDoorToggle: (door: 'driver' | 'passenger' | 'trunk') => void;
}

export const ClusterView: React.FC<ClusterViewProps> = ({
  state,
  onThrottleChange,
  onBrakeToggle,
  onLeftSignalToggle,
  onRightSignalToggle,
  onHazardToggle,
  onDoorToggle,
}) => {
  // Speedometer angle (0 to 160 mph -> -120 deg to +120 deg)
  const speedRatio = Math.min(1, Math.max(0, state.speedMph / 160));
  const speedAngle = -120 + speedRatio * 240;

  // Tachometer angle (0 to 8000 RPM -> -120 deg to +120 deg)
  const rpmRatio = Math.min(1, Math.max(0, state.rpm / 8000));
  const rpmAngle = -120 + rpmRatio * 240;

  const isRedlining = state.rpm >= 6500;

  return (
    <div className="bg-carbon-900 border border-carbon-700/80 rounded-lg p-4 flex flex-col gap-4 shadow-xl">
      {/* Cluster Frame Header */}
      <div className="flex items-center justify-between border-b border-carbon-800 pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            Cyber-Physical Instrument Cluster (ECU Twin)
          </h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span>CAN ID SYNC:</span>
          <span className="text-cyan-400 font-semibold">0x244 (SPD)</span>
          <span>•</span>
          <span className="text-indigo-400 font-semibold">0x188 (RPM)</span>
        </div>
      </div>

      {/* Main Digital Cockpit Display */}
      <div className="relative bg-carbon-950 rounded-lg border border-carbon-800 p-4 overflow-hidden shadow-inner">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        {/* Telltale Warning Lights Bar */}
        <div className="flex items-center justify-between px-6 pb-2 border-b border-carbon-800/80 text-xs font-mono">
          {/* Left Signal */}
          <div
            className={`flex items-center gap-1 transition-all ${
              state.leftSignal || state.hazardLights
                ? 'text-emerald-400 drop-shadow-[0_0_8px_#10b981]'
                : 'text-carbon-700'
            }`}
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </div>

          {/* Central Diagnostic Telltales */}
          <div className="flex items-center gap-4">
            {/* Check Engine Light */}
            <div
              title="Malfunction Indicator Lamp (MIL) / Check Engine"
              className={`flex items-center gap-1 transition-all ${
                state.checkEngineLight
                  ? 'text-amber-400 drop-shadow-[0_0_8px_#f59e0b] animate-pulse'
                  : 'text-carbon-700'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">CHECK</span>
            </div>

            {/* Brake Light */}
            <div
              title="Braking System Active"
              className={`flex items-center gap-1 transition-all ${
                state.brakeActive
                  ? 'text-rose-400 drop-shadow-[0_0_8px_#ef4444]'
                  : 'text-carbon-700'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">BRAKE</span>
            </div>

            {/* ABS Warning */}
            <div
              title="Anti-lock Braking System"
              className={`flex items-center gap-1 transition-all ${
                state.absWarning ? 'text-amber-400' : 'text-carbon-700'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">ABS</span>
            </div>

            {/* Hazard Alert */}
            <div
              title="Hazard Warning Flasher"
              className={`flex items-center gap-1 transition-all ${
                state.hazardLights
                  ? 'text-rose-500 drop-shadow-[0_0_8px_#f43f5e] animate-pulse'
                  : 'text-carbon-700'
              }`}
            >
              <TriangleAlert className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">HAZARD</span>
            </div>

            {/* Battery Warning */}
            <div
              title="12V Charging Circuit"
              className={`flex items-center gap-1 transition-all ${
                state.batteryWarning ? 'text-rose-400' : 'text-carbon-700'
              }`}
            >
              <Battery className="w-4 h-4" />
              <span className="text-[10px] hidden sm:inline">BATTERY</span>
            </div>
          </div>

          {/* Right Signal */}
          <div
            className={`flex items-center gap-1 transition-all ${
              state.rightSignal || state.hazardLights
                ? 'text-emerald-400 drop-shadow-[0_0_8px_#10b981]'
                : 'text-carbon-700'
            }`}
          >
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Dual Round Gauges (Speedometer & Tachometer) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 items-center justify-items-center">
          {/* SPEEDOMETER */}
          <div className="relative w-64 h-64 flex flex-col items-center justify-center">
            {/* SVG Speed Arc */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Outer Track */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#121a24"
                strokeWidth="12"
                strokeDasharray="335 167"
              />
              {/* Active Speed Arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="12"
                strokeDasharray={`${Math.round(speedRatio * 335)} 335`}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            </svg>

            {/* Needle Pivot & Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
              style={{ transform: `rotate(${speedAngle}deg)` }}
            >
              <div className="w-1 h-20 bg-gradient-to-t from-cyan-400 to-white rounded-full shadow-[0_0_10px_#06b6d4] translate-y-[-28px]" />
            </div>

            {/* Speed Digital Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none">
              <span className="text-4xl font-bold tracking-tight text-white font-tabular drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                {state.speedMph.toFixed(0)}
              </span>
              <span className="text-xs text-cyan-400 font-semibold tracking-wider">MPH</span>
              <span className="text-[11px] text-slate-400 font-tabular mt-0.5">
                {state.speedKmh.toFixed(0)} km/h
              </span>
            </div>

            {/* Bottom Scale Label */}
            <div className="absolute bottom-2 text-[10px] font-mono text-slate-500">
              VEHICLE VELOCITY (ID 0x244)
            </div>
          </div>

          {/* TACHOMETER */}
          <div className="relative w-64 h-64 flex flex-col items-center justify-center">
            {/* SVG Tachometer Arc */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Outer Track */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#121a24"
                strokeWidth="12"
                strokeDasharray="335 167"
              />
              {/* Active RPM Arc */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={isRedlining ? '#ef4444' : '#818cf8'}
                strokeWidth="12"
                strokeDasharray={`${Math.round(rpmRatio * 335)} 335`}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
              {/* Redline Warning Segment */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeDasharray="60 275"
                strokeDashoffset="-275"
                opacity="0.6"
              />
            </svg>

            {/* Needle */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
              style={{ transform: `rotate(${rpmAngle}deg)` }}
            >
              <div
                className={`w-1 h-20 rounded-full translate-y-[-28px] ${
                  isRedlining
                    ? 'bg-gradient-to-t from-rose-500 to-white shadow-[0_0_12px_#ef4444]'
                    : 'bg-gradient-to-t from-indigo-400 to-white shadow-[0_0_10px_#818cf8]'
                }`}
              />
            </div>

            {/* RPM Digital Readout & Gear */}
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none">
              <span
                className={`text-4xl font-bold tracking-tight font-tabular ${
                  isRedlining ? 'text-rose-400 drop-shadow-[0_0_12px_#ef4444]' : 'text-white'
                }`}
              >
                {state.rpm}
              </span>
              <span className="text-xs text-indigo-400 font-semibold tracking-wider">RPM x1000</span>

              {/* Transmission Gear Selector */}
              <div className="flex items-center gap-1.5 mt-1 font-bold text-xs">
                {(['P', 'R', 'N', 'D'] as const).map((g) => (
                  <span
                    key={g}
                    className={`px-1.5 py-0.5 rounded ${
                      state.gear === g
                        ? 'bg-indigo-600 text-white shadow-[0_0_8px_#818cf8]'
                        : 'text-slate-600 bg-carbon-900'
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Scale Label */}
            <div className="absolute bottom-2 text-[10px] font-mono text-slate-500">
              ENGINE SPEED (ID 0x188)
            </div>
          </div>
        </div>

        {/* Central Vehicle Status & Odometer */}
        <div className="mt-4 pt-3 border-t border-carbon-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-3">
            <span>
              ODO: <strong className="text-slate-200 font-tabular">{state.odometerMiles.toFixed(1)} MI</strong>
            </span>
            <span>•</span>
            <span>
              THROTTLE: <strong className="text-cyan-400 font-tabular">{state.throttlePercent}%</strong>
            </span>
          </div>

          {/* Door Status Pills */}
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] ${
                state.driverDoorOpen ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-carbon-900 text-slate-500'
              }`}
            >
              L-DOOR: {state.driverDoorOpen ? 'OPEN' : 'SHUT'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] ${
                state.passengerDoorOpen ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-carbon-900 text-slate-500'
              }`}
            >
              R-DOOR: {state.passengerDoorOpen ? 'OPEN' : 'SHUT'}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] ${
                state.trunkOpen ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-carbon-900 text-slate-500'
              }`}
            >
              TRUNK: {state.trunkOpen ? 'OPEN' : 'SHUT'}
            </span>
          </div>
        </div>
      </div>

      {/* Manual Driver Input Controls */}
      <div className="bg-carbon-950/70 border border-carbon-800 rounded p-3 flex flex-col gap-3 font-mono">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Manual Drive Controls</span>
          <span className="text-[10px] text-slate-500">Injects physical telemetry over simulated CAN bus</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {/* Accelerator Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Throttle Pedal</span>
              <span className="text-cyan-400 font-bold">{state.throttlePercent}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={state.throttlePercent}
              onChange={(e) => onThrottleChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-carbon-800 rounded-lg"
            />
          </div>

          {/* Brake Pedal Toggle */}
          <div className="flex items-center">
            <button
              onClick={() => onBrakeToggle(!state.brakeActive)}
              className={`w-full py-2 px-3 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                state.brakeActive
                  ? 'bg-rose-600 text-white shadow-[0_0_12px_#ef4444]'
                  : 'bg-carbon-800 text-slate-300 border border-carbon-700 hover:bg-carbon-700'
              }`}
            >
              <Disc className="w-4 h-4" />
              <span>{state.brakeActive ? 'Release Brake' : 'Apply Brake'}</span>
            </button>
          </div>

          {/* Signals & Hazards */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onLeftSignalToggle}
              className={`flex-1 py-2 px-1 rounded text-xs font-semibold flex items-center justify-center border transition-all ${
                state.leftSignal
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-carbon-800 text-slate-400 border-carbon-700 hover:text-slate-200'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-[11px] ml-1">Left</span>
            </button>

            <button
              onClick={onHazardToggle}
              className={`flex-1 py-2 px-1 rounded text-xs font-semibold flex items-center justify-center border transition-all ${
                state.hazardLights
                  ? 'bg-rose-950 text-rose-300 border-rose-600 shadow-[0_0_8px_#f43f5e]'
                  : 'bg-carbon-800 text-slate-400 border-carbon-700 hover:text-slate-200'
              }`}
            >
              <TriangleAlert className="w-3.5 h-3.5" />
              <span className="text-[11px] ml-1">Hazard</span>
            </button>

            <button
              onClick={onRightSignalToggle}
              className={`flex-1 py-2 px-1 rounded text-xs font-semibold flex items-center justify-center border transition-all ${
                state.rightSignal
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-carbon-800 text-slate-400 border-carbon-700 hover:text-slate-200'
              }`}
            >
              <span className="text-[11px] mr-1">Right</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Door Latches */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => onDoorToggle('driver')}
              className={`flex-1 py-2 rounded border transition-all ${
                state.driverDoorOpen
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-carbon-800 text-slate-400 border-carbon-700'
              }`}
            >
              L-Door
            </button>
            <button
              onClick={() => onDoorToggle('passenger')}
              className={`flex-1 py-2 rounded border transition-all ${
                state.passengerDoorOpen
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-carbon-800 text-slate-400 border-carbon-700'
              }`}
            >
              R-Door
            </button>
            <button
              onClick={() => onDoorToggle('trunk')}
              className={`flex-1 py-2 rounded border transition-all ${
                state.trunkOpen
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-carbon-800 text-slate-400 border-carbon-700'
              }`}
            >
              Trunk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
