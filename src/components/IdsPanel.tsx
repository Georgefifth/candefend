import React, { useState } from 'react';
import { IdsDefenseConfig, IdsRuleViolation } from '../types/can';
import { Shield, ShieldAlert, ShieldCheck, CheckCircle2, ChevronRight, Lock, Activity } from 'lucide-react';

interface IdsPanelProps {
  violations: IdsRuleViolation[];
  defenses: IdsDefenseConfig;
  onToggleDefense: <K extends keyof IdsDefenseConfig>(key: K, value: boolean) => void;
  onClearViolations: () => void;
}

export const IdsPanel: React.FC<IdsPanelProps> = ({
  violations,
  defenses,
  onToggleDefense,
  onClearViolations,
}) => {
  const [selectedViolation, setSelectedViolation] = useState<IdsRuleViolation | null>(
    violations.length > 0 ? violations[0] : null
  );

  return (
    <div className="bg-carbon-900 border border-carbon-700/80 rounded-lg p-4 flex flex-col gap-4 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-carbon-800 pb-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <h2 className="font-semibold uppercase tracking-wider text-slate-200">
            Intrusion Detection System (IDS) & Security Agent
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            Active Defenses:{' '}
            <strong className="text-emerald-400 font-bold">
              {Object.values(defenses).filter(Boolean).length} / 4 Engaged
            </strong>
          </span>
          {violations.length > 0 && (
            <button
              onClick={onClearViolations}
              className="px-2 py-0.5 rounded bg-carbon-800 text-slate-400 hover:text-white border border-carbon-700 text-[11px]"
            >
              Clear Alerts
            </button>
          )}
        </div>
      </div>

      {/* Active Defense Countermeasures Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Defense 1: Kinematic Rate Limiter */}
        <div
          onClick={() => onToggleDefense('kinematicRateLimiter', !defenses.kinematicRateLimiter)}
          className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between gap-2 select-none ${
            defenses.kinematicRateLimiter
              ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px]">Kinematic Rate Limiter</span>
            {defenses.kinematicRateLimiter ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Shield className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Filters physical acceleration jumps exceeding vehicle mass inertia (|Δv/Δt| &gt; 25 mph/100ms).
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-carbon-800/80 text-[10px]">
            <span>Status:</span>
            <span className={defenses.kinematicRateLimiter ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {defenses.kinematicRateLimiter ? 'FILTERING ACTIVE' : 'BYPASS'}
            </span>
          </div>
        </div>

        {/* Defense 2: Bus Frequency Firewall */}
        <div
          onClick={() => onToggleDefense('busFrequencyFirewall', !defenses.busFrequencyFirewall)}
          className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between gap-2 select-none ${
            defenses.busFrequencyFirewall
              ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px]">Frequency Firewall</span>
            {defenses.busFrequencyFirewall ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Shield className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Quarantines arbitration IDs flooding bus at &gt;180 Hz (stops 0x000 DoS starvation).
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-carbon-800/80 text-[10px]">
            <span>Status:</span>
            <span className={defenses.busFrequencyFirewall ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {defenses.busFrequencyFirewall ? 'FIREWALL ACTIVE' : 'BYPASS'}
            </span>
          </div>
        </div>

        {/* Defense 3: Replay Nonce Filter */}
        <div
          onClick={() => onToggleDefense('replayNonceFilter', !defenses.replayNonceFilter)}
          className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between gap-2 select-none ${
            defenses.replayNonceFilter
              ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px]">Replay Nonce Filter</span>
            {defenses.replayNonceFilter ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Shield className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Enforces strict monotonic sequence counter freshness; drops stale replayed frames.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-carbon-800/80 text-[10px]">
            <span>Status:</span>
            <span className={defenses.replayNonceFilter ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {defenses.replayNonceFilter ? 'NONCE ACTIVE' : 'BYPASS'}
            </span>
          </div>
        </div>

        {/* Defense 4: Strict ID Allowlist */}
        <div
          onClick={() => onToggleDefense('strictIdAllowlist', !defenses.strictIdAllowlist)}
          className={`p-3 rounded border cursor-pointer transition-all flex flex-col justify-between gap-2 select-none ${
            defenses.strictIdAllowlist
              ? 'bg-emerald-950/40 border-emerald-600/80 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-[11px]">Strict ID Allowlist</span>
            {defenses.strictIdAllowlist ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <Shield className="w-4 h-4 text-slate-600" />
            )}
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Drops unregistered or out-of-spec arbitration IDs outside standard vehicle DBC schema.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-carbon-800/80 text-[10px]">
            <span>Status:</span>
            <span className={defenses.strictIdAllowlist ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {defenses.strictIdAllowlist ? 'ALLOWLIST ACTIVE' : 'BYPASS'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Alert Feed & Security Triage Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Intrusion Threat Stream */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Live Threat Alert Log ({violations.length} incidents)</span>
            <span className="text-[10px] text-slate-500">Click incident to inspect triage</span>
          </div>

          <div className="border border-carbon-800 rounded bg-carbon-950 max-h-[340px] overflow-y-auto divide-y divide-carbon-800/80">
            {violations.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/60" />
                <p>No active anomalies detected.</p>
                <p className="text-[10px] text-slate-600">Bus telemetry running within safe operational bounds.</p>
              </div>
            ) : (
              violations.map((violation) => {
                const isSelected = selectedViolation?.id === violation.id;

                return (
                  <div
                    key={violation.id}
                    onClick={() => setSelectedViolation(violation)}
                    className={`p-2.5 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'bg-carbon-800 border-l-2 border-rose-500'
                        : 'hover:bg-carbon-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        <ShieldAlert
                          className={`w-4 h-4 ${
                            violation.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              violation.severity === 'CRITICAL'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}
                          >
                            {violation.severity}
                          </span>
                          <span className="text-slate-200 font-bold">{violation.title}</span>
                          <span className="text-cyan-400 text-[11px]">({violation.canIdHex})</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {violation.details}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          violation.mitigated
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {violation.mitigated ? 'MITIGATED' : 'UNBLOCKED'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Security Agent Triage Diagnosis */}
        <div className="flex flex-col gap-2">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>AI Security Triage & Countermeasure Advisor</span>
            <span className="text-[10px] text-cyan-400">Automotive Cyber Defense</span>
          </div>

          {selectedViolation ? (
            <div className="border border-carbon-800 rounded bg-carbon-950 p-3.5 flex flex-col gap-3">
              {/* Incident Header */}
              <div className="border-b border-carbon-800 pb-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    {selectedViolation.triage.threatName}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-carbon-900 border border-carbon-700 text-slate-400">
                    {selectedViolation.triage.mitreAttackId}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Target CAN Arbitration ID: <strong className="text-cyan-300">{selectedViolation.canIdHex}</strong>
                </p>
              </div>

              {/* Triage Detail Grid */}
              <div className="space-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                    Affected Safety Subsystem:
                  </span>
                  <p className="text-slate-200 font-medium">
                    {selectedViolation.triage.affectedSubsystem}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                    Physical Hazard & Risk:
                  </span>
                  <p className="text-rose-300 font-medium">
                    {selectedViolation.triage.physicalHazard}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                    Technical Root Cause Analysis:
                  </span>
                  <p className="text-slate-300 leading-relaxed bg-carbon-900/80 p-2 rounded border border-carbon-800">
                    {selectedViolation.triage.technicalDiagnosis}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px] block">
                    Industry Standard Defense (AUTOSAR / ISO 21434):
                  </span>
                  <p className="text-emerald-300 leading-relaxed bg-emerald-950/20 p-2 rounded border border-emerald-900/60">
                    {selectedViolation.triage.industryRemediation}
                  </p>
                </div>
              </div>

              {/* Quick Countermeasure Activation Button */}
              <div className="pt-2 border-t border-carbon-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">One-Click Remediation:</span>
                {selectedViolation.ruleCode === 'RULE_KINEMATIC_VIOLATION' && (
                  <button
                    onClick={() => onToggleDefense('kinematicRateLimiter', true)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Engage Kinematic Limiter</span>
                  </button>
                )}
                {selectedViolation.ruleCode === 'RULE_BUS_FLOOD' && (
                  <button
                    onClick={() => onToggleDefense('busFrequencyFirewall', true)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Engage Frequency Firewall</span>
                  </button>
                )}
                {selectedViolation.ruleCode === 'RULE_REPLAY_SEQUENCE' && (
                  <button
                    onClick={() => onToggleDefense('replayNonceFilter', true)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Engage Replay Filter</span>
                  </button>
                )}
                {selectedViolation.ruleCode === 'RULE_UNKNOWN_ARBITRATION' && (
                  <button
                    onClick={() => onToggleDefense('strictIdAllowlist', true)}
                    className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Engage ID Allowlist</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-carbon-800 rounded bg-carbon-950 p-8 flex items-center justify-center text-slate-500 text-center">
              Select an alert from the incident stream to review detailed root cause diagnosis and remediation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
