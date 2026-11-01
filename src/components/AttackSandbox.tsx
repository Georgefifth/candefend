import React, { useState } from 'react';
import { AlertTriangle, Zap, Radio, RefreshCw, Bomb, Send, StopCircle, Flame } from 'lucide-react';

interface AttackSandboxProps {
  onInjectSpeedSpoof: (targetMph: number) => void;
  onInjectRpmSpoof: (targetRpm: number) => void;
  onInjectDosFlood: (durationMs: number) => void;
  onInjectReplayAttack: () => void;
  onInjectFuzzingAttack: () => void;
  onInjectCustomFrame: (id: number, data: Uint8Array) => void;
  onStopAllAttacks: () => void;
  attackStatus: { active: boolean; name: string | null };
}

export const AttackSandbox: React.FC<AttackSandboxProps> = ({
  onInjectSpeedSpoof,
  onInjectRpmSpoof,
  onInjectDosFlood,
  onInjectReplayAttack,
  onInjectFuzzingAttack,
  onInjectCustomFrame,
  onStopAllAttacks,
  attackStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  // Custom frame inputs
  const [customIdHex, setCustomIdHex] = useState<string>('0x208');
  const [customDlc, setCustomDlc] = useState<number>(4);
  const [customPayloadHex, setCustomPayloadHex] = useState<string>('00 00 01 00');
  const [customError, setCustomError] = useState<string | null>(null);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    // Validate ID
    let rawIdStr = customIdHex.trim();
    if (rawIdStr.toLowerCase().startsWith('0x')) {
      rawIdStr = rawIdStr.slice(2);
    }
    const parsedId = parseInt(rawIdStr, 16);
    if (isNaN(parsedId) || parsedId < 0 || parsedId > 0x7ff) {
      setCustomError('Invalid 11-bit CAN arbitration ID (must be 0x000 - 0x7FF).');
      return;
    }

    // Validate Payload
    const cleanBytesStr = customPayloadHex.replace(/\s+/g, ' ').trim();
    const byteTokens = cleanBytesStr ? cleanBytesStr.split(' ') : [];
    if (byteTokens.length !== customDlc) {
      setCustomError(`Payload byte count (${byteTokens.length}) does not match DLC (${customDlc}).`);
      return;
    }

    const payload = new Uint8Array(customDlc);
    for (let i = 0; i < byteTokens.length; i++) {
      const val = parseInt(byteTokens[i], 16);
      if (isNaN(val) || val < 0 || val > 255) {
        setCustomError(`Invalid hex byte at index ${i}: "${byteTokens[i]}"`);
        return;
      }
      payload[i] = val;
    }

    onInjectCustomFrame(parsedId, payload);
  };

  return (
    <div className="bg-carbon-900 border border-carbon-700/80 rounded-lg p-4 flex flex-col gap-3 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-carbon-800 pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            Automotive Attack Injection Sandbox
          </h2>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-carbon-950 p-1 rounded border border-carbon-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === 'presets'
                ? 'bg-rose-950 text-rose-300 border border-rose-700 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Attack Presets
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded transition-all ${
              activeTab === 'custom'
                ? 'bg-rose-950 text-rose-300 border border-rose-700 font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Custom Frame
          </button>
        </div>
      </div>

      {/* Active Attack Status Banner */}
      {attackStatus.active && (
        <div className="bg-rose-950/80 border border-rose-600 rounded p-2.5 flex items-center justify-between text-xs font-mono text-rose-200 animate-pulse">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-rose-400" />
            <span>
              ACTIVE INJECTION: <strong>{attackStatus.name}</strong>
            </span>
          </div>
          <button
            onClick={onStopAllAttacks}
            className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center gap-1 text-[11px]"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Kill Attack</span>
          </button>
        </div>
      )}

      {/* Presets Tab */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
          {/* Preset 1: Speed Spoof */}
          <div className="bg-carbon-950 border border-carbon-800 rounded p-3 flex flex-col justify-between gap-2.5 hover:border-rose-800/80 transition-all">
            <div>
              <div className="flex items-center justify-between text-rose-400 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Speed Spoof (140 MPH)
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-carbon-900 border border-carbon-700 text-slate-400">
                  ID 0x244
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Injects extreme velocity frames overriding physical speedometer telemetry.
              </p>
            </div>
            <button
              onClick={() => onInjectSpeedSpoof(140)}
              className="w-full py-1.5 px-2 rounded bg-rose-950 hover:bg-rose-900 text-rose-200 border border-rose-700 font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>Inject Speed Surge</span>
            </button>
          </div>

          {/* Preset 2: RPM Redline Surge */}
          <div className="bg-carbon-950 border border-carbon-800 rounded p-3 flex flex-col justify-between gap-2.5 hover:border-rose-800/80 transition-all">
            <div>
              <div className="flex items-center justify-between text-indigo-400 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  RPM Redline Surge
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-carbon-900 border border-carbon-700 text-slate-400">
                  ID 0x188
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Spoofs tachometer to 7600 RPM redline without throttle input, violating rotational inertia.
              </p>
            </div>
            <button
              onClick={() => onInjectRpmSpoof(7600)}
              className="w-full py-1.5 px-2 rounded bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-700 font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>Inject RPM Redline</span>
            </button>
          </div>

          {/* Preset 3: DoS Flood */}
          <div className="bg-carbon-950 border border-carbon-800 rounded p-3 flex flex-col justify-between gap-2.5 hover:border-rose-800/80 transition-all">
            <div>
              <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Bomb className="w-3.5 h-3.5" />
                  Dominant DoS Flood
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-carbon-900 border border-carbon-700 text-slate-400">
                  ID 0x000
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Floods highest-priority zeroed arbitration bits at 330 Hz to starve legitimate ECU frames.
              </p>
            </div>
            <button
              onClick={() => onInjectDosFlood(3000)}
              className="w-full py-1.5 px-2 rounded bg-amber-950 hover:bg-amber-900 text-amber-200 border border-amber-700 font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>Launch 3s DoS Flood</span>
            </button>
          </div>

          {/* Preset 4: Replay Attack */}
          <div className="bg-carbon-950 border border-carbon-800 rounded p-3 flex flex-col justify-between gap-2.5 hover:border-rose-800/80 transition-all">
            <div>
              <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Frame Replay Attack
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-carbon-900 border border-carbon-700 text-slate-400">
                  ID 0x188
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Re-transmits captured engine packet with frozen sequence counter, bypassing basic CRC.
              </p>
            </div>
            <button
              onClick={onInjectReplayAttack}
              className="w-full py-1.5 px-2 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-200 border border-cyan-700 font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>Inject Stale Replay</span>
            </button>
          </div>

          {/* Preset 5: Diagnostic Fuzzing */}
          <div className="bg-carbon-950 border border-carbon-800 rounded p-3 flex flex-col justify-between gap-2.5 hover:border-rose-800/80 transition-all">
            <div>
              <div className="flex items-center justify-between text-fuchsia-400 font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  Diagnostic Fuzzing
                </span>
                <span className="text-[10px] px-1 py-0.5 rounded bg-carbon-900 border border-carbon-700 text-slate-400">
                  RANDOM IDs
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Mutates random arbitration IDs and high-entropy byte payloads to provoke firmware faults.
              </p>
            </div>
            <button
              onClick={onInjectFuzzingAttack}
              className="w-full py-1.5 px-2 rounded bg-fuchsia-950 hover:bg-fuchsia-900 text-fuchsia-200 border border-fuchsia-700 font-semibold transition-all flex items-center justify-center gap-1"
            >
              <span>Inject Fuzz Probe</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Frame Tab */}
      {activeTab === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="bg-carbon-950 border border-carbon-800 rounded p-3.5 flex flex-col gap-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* CAN ID */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Arbitration ID (Hex):
              </label>
              <input
                type="text"
                value={customIdHex}
                onChange={(e) => setCustomIdHex(e.target.value)}
                placeholder="0x208"
                className="w-full bg-carbon-900 border border-carbon-700 rounded px-2.5 py-1.5 text-cyan-300 font-bold focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* DLC */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                DLC (Data Length: 0 - 8):
              </label>
              <input
                type="number"
                min="0"
                max="8"
                value={customDlc}
                onChange={(e) => setCustomDlc(Number(e.target.value))}
                className="w-full bg-carbon-900 border border-carbon-700 rounded px-2.5 py-1.5 text-slate-200 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Quick Templates:</label>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'HAZARD_ON') {
                    setCustomIdHex('0x208');
                    setCustomDlc(4);
                    setCustomPayloadHex('00 00 01 00');
                  } else if (val === 'DOOR_OPEN') {
                    setCustomIdHex('0x19B');
                    setCustomDlc(6);
                    setCustomPayloadHex('01 00 00 01 AA 55');
                  } else if (val === 'SPEED_100') {
                    setCustomIdHex('0x244');
                    setCustomDlc(8);
                    setCustomPayloadHex('3E 80 01 00 24 10 03 89');
                  }
                }}
                className="w-full bg-carbon-900 border border-carbon-700 rounded px-2 py-1.5 text-slate-300 text-xs focus:outline-none"
              >
                <option value="">Select preset payload...</option>
                <option value="HAZARD_ON">0x208 - Flash Hazards (00 00 01 00)</option>
                <option value="DOOR_OPEN">0x19B - Open Driver Door (01 00 00 01 AA 55)</option>
                <option value="SPEED_100">0x244 - Force 100 mph (3E 80 01 00 24 10 03 89)</option>
              </select>
            </div>
          </div>

          {/* Payload Bytes */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Payload Hex Bytes (Space separated, e.g. "00 00 01 00"):
            </label>
            <input
              type="text"
              value={customPayloadHex}
              onChange={(e) => setCustomPayloadHex(e.target.value)}
              placeholder="00 00 01 00"
              className="w-full bg-carbon-900 border border-carbon-700 rounded px-2.5 py-1.5 text-slate-200 font-bold tracking-wider focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {customError && (
            <p className="text-rose-400 text-xs bg-rose-950/60 border border-rose-800 p-2 rounded">
              ⚠️ {customError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-black font-bold flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Transmit CAN Frame</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
