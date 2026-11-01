import React, { useState } from 'react';
import { CanFrame } from '../types/can';
import { formatCanIdHex, formatHexByte } from '../engine/canDefinitions';
import { Terminal, Filter, Pause, Play, Trash2, Search, Info } from 'lucide-react';

interface BusMonitorProps {
  frames: CanFrame[];
  onClear: () => void;
}

export const BusMonitor: React.FC<BusMonitorProps> = ({ frames, onClear }) => {
  const [filterId, setFilterId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedFrame, setSelectedFrame] = useState<CanFrame | null>(null);

  // Filter frames
  const displayFrames = (isPaused ? frames : frames.slice(0, 100)).filter((f) => {
    const idHex = formatCanIdHex(f.id).toLowerCase();
    if (filterId === 'ATTACKS_ONLY' && !f.isAttack) return false;
    if (filterId !== 'ALL' && filterId !== 'ATTACKS_ONLY' && idHex !== filterId.toLowerCase()) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const payloadStr = Array.from(f.data).map(formatHexByte).join(' ').toLowerCase();
      return idHex.includes(q) || payloadStr.includes(q) || f.sender.toLowerCase().includes(q);
    }
    return true;
  });

  const getSenderBadgeClass = (sender: CanFrame['sender'], isAttack?: boolean) => {
    if (isAttack || sender === 'ATTACK_INJECTOR') {
      return 'bg-rose-950 text-rose-300 border border-rose-700/80 font-bold';
    }
    switch (sender) {
      case 'ECU_ENGINE':
        return 'bg-indigo-950 text-indigo-300 border border-indigo-800';
      case 'ECU_CLUSTER':
        return 'bg-cyan-950 text-cyan-300 border border-cyan-800';
      case 'ECU_BODY':
        return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
      default:
        return 'bg-carbon-800 text-slate-300 border border-carbon-700';
    }
  };

  return (
    <div className="bg-carbon-900 border border-carbon-700/80 rounded-lg p-4 flex flex-col gap-3 shadow-xl">
      {/* Header and Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-carbon-800 pb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
            CAN Bus Frame Sniffer & Packet Inspector
          </h2>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-carbon-800 text-slate-400 border border-carbon-700">
            {frames.length} frames captured
          </span>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-1 bg-carbon-950 border border-carbon-700 rounded px-2 py-1">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              aria-label="Filter by CAN ID"
              data-testid="can-filter-select"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All IDs</option>
              <option value="0x188">0x188 (RPM/Gear)</option>
              <option value="0x244">0x244 (Speed/Odo)</option>
              <option value="0x19B">0x19B (Doors/Body)</option>
              <option value="0x208">0x208 (Lights/Signals)</option>
              <option value="0x000">0x000 (DoS Dominant)</option>
              <option value="ATTACKS_ONLY">Attacks Only</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-1 bg-carbon-950 border border-carbon-700 rounded px-2 py-1">
            <Search className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID/Hex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none w-24 sm:w-28 placeholder:text-slate-600"
            />
          </div>

          {/* Pause / Resume */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume live autoscroll' : 'Freeze display buffer'}
            className={`p-1 rounded border transition-all ${
              isPaused
                ? 'bg-amber-950 text-amber-300 border-amber-700'
                : 'bg-carbon-800 text-slate-300 border-carbon-700 hover:text-white'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Clear Buffer */}
          <button
            onClick={onClear}
            title="Clear buffer"
            className="p-1 rounded bg-carbon-800 text-slate-400 border border-carbon-700 hover:text-rose-400 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame Table */}
      <div className="border border-carbon-800 rounded bg-carbon-950 overflow-x-auto max-h-[380px] overflow-y-auto font-mono text-xs select-text">
        <table className="w-full text-left border-collapse">
          <thead className="bg-carbon-900/90 text-slate-400 text-[11px] sticky top-0 border-b border-carbon-800 uppercase tracking-wider z-10">
            <tr>
              <th className="py-2 px-3">Time</th>
              <th className="py-2 px-3">ID</th>
              <th className="py-2 px-2">DLC</th>
              <th className="py-2 px-3">Payload Hex (B0 - B7)</th>
              <th className="py-2 px-2">Δt</th>
              <th className="py-2 px-3">Source Node</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-carbon-800/60 font-tabular text-[11px]">
            {displayFrames.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No frames match filter criteria.
                </td>
              </tr>
            ) : (
              displayFrames.map((frame, idx) => {
                const idHex = formatCanIdHex(frame.id);
                const isMalicious = frame.isAttack || frame.id === 0x000;

                return (
                  <tr
                    key={`${frame.timestamp}-${frame.id}-${idx}`}
                    onClick={() => setSelectedFrame(frame)}
                    className={`cursor-pointer transition-colors ${
                      isMalicious
                        ? 'bg-rose-950/20 hover:bg-rose-950/40 text-rose-200'
                        : 'hover:bg-carbon-900/80 text-slate-200'
                    }`}
                  >
                    {/* Timestamp */}
                    <td className="py-1.5 px-3 text-slate-400 whitespace-nowrap">
                      +{(frame.timestamp % 100000).toString().padStart(5, '0')}ms
                    </td>

                    {/* Arbitration ID */}
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <span
                        className={`font-bold px-1.5 py-0.5 rounded text-[11px] ${
                          isMalicious
                            ? 'bg-rose-900 text-rose-200 shadow-[0_0_6px_#f43f5e]'
                            : frame.id === 0x244
                            ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                            : frame.id === 0x188
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                            : 'bg-carbon-800 text-slate-300'
                        }`}
                      >
                        {idHex}
                      </span>
                    </td>

                    {/* DLC */}
                    <td className="py-1.5 px-2 text-slate-400">{frame.dlc}</td>

                    {/* Payload Bytes */}
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 font-mono">
                        {Array.from(frame.data).map((byte, bIdx) => (
                          <span
                            key={bIdx}
                            className={`px-1 py-0.2 rounded text-[11px] ${
                              isMalicious && bIdx < 2
                                ? 'bg-rose-900/80 text-white font-bold border border-rose-500'
                                : 'bg-carbon-900 text-slate-200'
                            }`}
                          >
                            {formatHexByte(byte)}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Delta Time */}
                    <td className="py-1.5 px-2 text-slate-400 whitespace-nowrap">
                      {frame.deltaMs}ms
                    </td>

                    {/* Sender */}
                    <td className="py-1.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${getSenderBadgeClass(
                          frame.sender,
                          frame.isAttack
                        )}`}
                      >
                        {frame.sender}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-1.5 px-2 whitespace-nowrap">
                      {isMalicious ? (
                        <span className="text-rose-400 font-bold uppercase text-[10px] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                          {frame.attackType ?? 'ATTACK'}
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-[10px]">HEALTHY</span>
                      )}
                    </td>

                    {/* Quick Inspect Button */}
                    <td className="py-1.5 px-2 text-center">
                      <button
                        aria-label="Inspect Frame"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFrame(frame);
                        }}
                        className="text-slate-400 hover:text-cyan-400 p-0.5"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Frame Detail Inspector Modal/Drawer */}
      {selectedFrame && (
        <div className="bg-carbon-950 border border-cyan-800/80 rounded p-3 text-xs font-mono flex flex-col gap-2 shadow-xl animate-fadeIn">
          <div className="flex items-center justify-between border-b border-carbon-800 pb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">FRAME DECODER:</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold">
                {formatCanIdHex(selectedFrame.id)}
              </span>
              <span className="text-slate-400">({selectedFrame.sender})</span>
            </div>
            <button
              onClick={() => setSelectedFrame(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded bg-carbon-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div>
              <p className="text-[11px] text-slate-400 mb-1">Raw Byte Breakdown:</p>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(selectedFrame.data).map((b, i) => (
                  <div key={i} className="flex flex-col items-center bg-carbon-900 border border-carbon-700 px-2 py-1 rounded">
                    <span className="text-[9px] text-slate-500">Byte {i}</span>
                    <span className="text-cyan-300 font-bold text-xs">{formatHexByte(b)}</span>
                    <span className="text-[9px] text-slate-400 font-tabular">{b}d</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-carbon-800 md:pl-3">
              <p className="text-[11px] text-slate-400 mb-1">Signal Interpretation:</p>
              {selectedFrame.id === 0x244 ? (
                <div className="space-y-0.5 text-slate-200">
                  <p>• Signal: <strong>Vehicle Velocity (OBD/Speedometer)</strong></p>
                  <p>• Decoded Speed: <strong className="text-cyan-400">{((selectedFrame.data[0] << 8) | selectedFrame.data[1]) / 100} km/h</strong></p>
                  <p>• Rolling Seq Counter: <strong>{selectedFrame.data[6] & 0x0f}</strong></p>
                </div>
              ) : selectedFrame.id === 0x188 ? (
                <div className="space-y-0.5 text-slate-200">
                  <p>• Signal: <strong>Engine RPM & Transmission Gear</strong></p>
                  <p>• Decoded RPM: <strong className="text-indigo-400">{Math.round(((selectedFrame.data[0] << 8) | selectedFrame.data[1]) / 4)} RPM</strong></p>
                  <p>• Throttle Position: <strong>{selectedFrame.data[3]}%</strong></p>
                </div>
              ) : selectedFrame.id === 0x19B ? (
                <div className="space-y-0.5 text-slate-200">
                  <p>• Signal: <strong>Body Control Unit (Doors & Latches)</strong></p>
                  <p>• Driver Door: <strong>{selectedFrame.data[0] ? 'OPEN' : 'CLOSED'}</strong></p>
                  <p>• Passenger Door: <strong>{selectedFrame.data[1] ? 'OPEN' : 'CLOSED'}</strong></p>
                </div>
              ) : selectedFrame.id === 0x000 ? (
                <div className="space-y-0.5 text-rose-300">
                  <p>• Threat: <strong>Dominant Arbitration Denial of Service (DoS)</strong></p>
                  <p>• Zeroed Arbitration ID (0x000) wins all CAN bus collision arbitrations.</p>
                </div>
              ) : (
                <div className="text-slate-400">
                  <p>• Generic / Unmapped Arbitration ID: {formatCanIdHex(selectedFrame.id)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
