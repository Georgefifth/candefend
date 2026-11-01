import React from 'react';
import { Shield, Play, Pause, RotateCcw, Download, BookOpen, AlertTriangle, Cpu } from 'lucide-react';

interface HeaderProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onResetBus: () => void;
  onExportCandump: () => void;
  onExportJson: () => void;
  alertCount: number;
  activeTab: 'cluster' | 'attacks' | 'monitor' | 'ids' | 'labs';
  setActiveTab: (tab: 'cluster' | 'attacks' | 'monitor' | 'ids' | 'labs') => void;
  activeLabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onToggleRunning,
  onResetBus,
  onExportCandump,
  onExportJson,
  alertCount,
  activeTab,
  setActiveTab,
  activeLabTitle,
}) => {
  return (
    <header className="bg-carbon-950 border-b border-carbon-700/80 px-4 py-2.5 sticky top-0 z-40 select-none">
      <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2.5">
        {/* Brand & VBUS Telemetry Status */}
        <div className="flex items-center justify-between md:justify-start gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 tracking-wider text-base">CANDefend</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-semibold tracking-wide">
                  STUDIO v1.0
                </span>
                {activeLabTitle && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/80 hidden xl:inline">
                    {activeLabTitle}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Automotive CAN Bus Security Lab & Anomaly Agent
              </p>
            </div>
          </div>

          {/* VBUS Status Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-carbon-900 border border-carbon-700/80 font-mono text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]' : 'bg-amber-400'
              } animate-pulse`}
            />
            <span className="text-slate-300 font-medium hidden sm:inline">VBUS:</span>
            <span className="text-cyan-400 font-semibold">500 kbps</span>
            <span className="text-slate-500 text-[10px]">CAN 2.0B</span>
          </div>
        </div>

        {/* Navigation Tabs (Mobile & Desktop switcher) */}
        <div className="flex items-center justify-center gap-1 bg-carbon-900 p-1 rounded border border-carbon-700/80 text-xs font-mono flex-wrap sm:flex-nowrap flex-shrink-0">
          <button
            onClick={() => setActiveTab('cluster')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'cluster'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Cockpit</span>
          </button>

          <button
            onClick={() => setActiveTab('attacks')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'attacks'
                ? 'bg-rose-950 text-rose-300 border border-rose-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Attack Sandbox</span>
          </button>

          <button
            onClick={() => setActiveTab('monitor')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'monitor'
                ? 'bg-blue-950 text-blue-300 border border-blue-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Bus Sniffer</span>
          </button>

          <button
            onClick={() => setActiveTab('ids')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'ids'
                ? 'bg-amber-950 text-amber-300 border border-amber-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>IDS Agent</span>
            {alertCount > 0 && (
              <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('labs')}
            className={`px-3 py-1.5 rounded transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'labs'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/80 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guided Labs</span>
          </button>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={onToggleRunning}
            title={isRunning ? 'Pause Virtual Bus' : 'Resume Virtual Bus'}
            className={`px-3 py-1.5 rounded font-mono text-xs flex items-center gap-1.5 border transition-all ${
              isRunning
                ? 'bg-carbon-800 text-amber-400 border-amber-700/60 hover:bg-carbon-700'
                : 'bg-emerald-950 text-emerald-300 border-emerald-600 hover:bg-emerald-900'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isRunning ? 'Pause Bus' : 'Run Bus'}</span>
          </button>

          <button
            onClick={onResetBus}
            title="Reset Vehicle Telemetry & Defenses"
            className="px-2.5 py-1.5 rounded font-mono text-xs bg-carbon-800 text-slate-300 border border-carbon-700 hover:bg-carbon-700 hover:text-white transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={onExportCandump}
            title="Export standard Linux 'candump -l' log file"
            className="px-2.5 py-1.5 rounded font-mono text-xs bg-carbon-800 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-950 hover:border-cyan-600 transition-all flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">.log (candump)</span>
          </button>

          <button
            onClick={onExportJson}
            title="Export captured telemetry as JSON"
            className="px-2.5 py-1.5 rounded font-mono text-xs bg-carbon-800 text-slate-300 border border-carbon-700 hover:bg-carbon-700 hover:text-white transition-all hidden sm:flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>.json</span>
          </button>
        </div>
      </div>
    </header>
  );
};
