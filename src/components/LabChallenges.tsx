import React from 'react';
import { LabScenario } from '../types/can';
import { BookOpen, CheckCircle, HelpCircle, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LabChallengesProps {
  labs: LabScenario[];
  activeLabIndex: number;
  setActiveLabIndex: (idx: number) => void;
  onCheckCurrentLab: () => void;
  onSwitchToCockpit: () => void;
  onSwitchToAttacks: () => void;
}

export const LabChallenges: React.FC<LabChallengesProps> = ({
  labs,
  activeLabIndex,
  setActiveLabIndex,
  onCheckCurrentLab,
  onSwitchToCockpit,
  onSwitchToAttacks,
}) => {
  const currentLab = labs[activeLabIndex] ?? labs[0];
  const completedCount = labs.filter((l) => l.completed).length;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="bg-carbon-900 border border-carbon-700/80 rounded-lg p-4 flex flex-col gap-4 shadow-xl font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-carbon-800 pb-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <h2 className="font-semibold uppercase tracking-wider text-slate-200">
            Interactive Automotive Security Labs
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-carbon-950 border border-carbon-800 text-[11px]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Progress:</span>
            <strong className="text-emerald-400">
              {completedCount} / {labs.length} Completed
            </strong>
          </div>
        </div>
      </div>

      {/* Lab Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {labs.map((lab, idx) => (
          <button
            key={lab.id}
            onClick={() => setActiveLabIndex(idx)}
            className={`p-2.5 rounded border text-left transition-all flex flex-col justify-between gap-1.5 ${
              activeLabIndex === idx
                ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : lab.completed
                ? 'bg-carbon-950 border-emerald-900/60 text-slate-300'
                : 'bg-carbon-950 border-carbon-800 text-slate-400 hover:border-carbon-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {lab.difficulty}
              </span>
              {lab.completed ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-carbon-700" />
              )}
            </div>
            <span className="font-semibold text-xs leading-snug line-clamp-1">{lab.title}</span>
          </button>
        ))}
      </div>

      {/* Active Lab Detail Card */}
      <div className="bg-carbon-950 border border-carbon-800 rounded p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-carbon-800 pb-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100">{currentLab.title}</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-carbon-900 text-emerald-300 border border-emerald-800">
                {currentLab.difficulty}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{currentLab.summary}</p>
          </div>

          <div>
            {currentLab.completed ? (
              <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                <span>COMPLETED</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                IN PROGRESS
              </span>
            )}
          </div>
        </div>

        {/* Detailed Objective */}
        <div className="space-y-2 text-slate-300 text-xs">
          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold mb-1">
              Instructions & Challenge Objective:
            </span>
            <p className="bg-carbon-900/80 p-3 rounded border border-carbon-800 leading-relaxed text-slate-200">
              {currentLab.description}
            </p>
          </div>

          <div>
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block font-semibold mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Triage Hint:
            </span>
            <p className="bg-cyan-950/20 p-2.5 rounded border border-cyan-900/60 text-cyan-300 leading-relaxed">
              {currentLab.hint}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-carbon-800">
          <div className="flex items-center gap-2">
            <button
              onClick={onSwitchToAttacks}
              className="px-3 py-1.5 rounded bg-carbon-800 text-slate-300 hover:text-white border border-carbon-700 transition-all flex items-center gap-1"
            >
              <span>Go to Attack Sandbox</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onSwitchToCockpit}
              className="px-3 py-1.5 rounded bg-carbon-800 text-slate-300 hover:text-white border border-carbon-700 transition-all hidden sm:flex items-center gap-1"
            >
              <span>View Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => {
              onCheckCurrentLab();
              if (!currentLab.completed) {
                triggerConfetti();
              }
            }}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)]"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Validate Challenge</span>
          </button>
        </div>
      </div>
    </div>
  );
};
