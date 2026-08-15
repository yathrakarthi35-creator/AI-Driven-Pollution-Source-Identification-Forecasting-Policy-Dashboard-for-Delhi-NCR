import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  Circle,
  Building,
  Truck,
  Car,
  Flame,
  Factory,
  BellRing,
  ExternalLink,
  Share2,
  FileCheck,
} from 'lucide-react';
import { GrapStageInfo } from '../types';

interface GrapAlertsViewProps {
  grapStage: GrapStageInfo;
}

export const GrapAlertsView: React.FC<GrapAlertsViewProps> = ({ grapStage }) => {
  const [activeTab, setActiveTab] = useState<'current' | 'stage1' | 'stage2' | 'stage3' | 'stage4'>('current');
  const [actions, setActions] = useState(grapStage.recommendedActions);

  const toggleAction = (id: string) => {
    setActions(
      actions.map((act) =>
        act.id === id ? { ...act, implemented: !act.implemented } : act
      )
    );
  };

  const stagesList = [
    {
      id: 'stage1',
      roman: 'I',
      title: 'Stage I: Poor',
      range: 'AQI 201 - 300',
      status: 'Enforced',
      color: '#f97316',
      actionsCount: 14,
      desc: 'Enforce anti-dust measures at construction sites; strict ban on open garbage burning; PUC checks intensified.',
    },
    {
      id: 'stage2',
      roman: 'II',
      title: 'Stage II: Very Poor',
      range: 'AQI 301 - 400',
      status: 'Enforced',
      color: '#ef4444',
      actionsCount: 18,
      desc: 'Daily water sprinkling; ban on use of diesel generator sets (except essential services); hike parking fees to discourage private vehicles.',
    },
    {
      id: 'stage3',
      roman: 'III',
      title: 'Stage III: Severe',
      range: 'AQI 401 - 450 (or projected)',
      status: 'In Effect (Active)',
      color: '#8b5cf6',
      actionsCount: 22,
      desc: 'Strict ban on non-essential construction and demolition; restrictions on BS-III petrol & BS-IV diesel 4-wheelers; discontinue physical classes up to primary levels.',
    },
    {
      id: 'stage4',
      roman: 'IV',
      title: 'Stage IV: Severe+',
      range: 'AQI > 450',
      status: 'Standby Emergency',
      color: '#7f1d1d',
      actionsCount: 28,
      desc: 'Total ban on entry of non-electric/non-CNG commercial trucks into Delhi; ban on linear public projects (highways, flyovers); remote work for 50% offices.',
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#0e1626] border border-slate-800 p-4 sm:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-purple-400" />
            Graded Response Action Plan (GRAP) Regulatory Command Center
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Statutory enforcement under the Commission for Air Quality Management in NCR & Adjoining Areas Act, 2021
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            ACTIVE: GRAP STAGE III (SEVERE)
          </span>
        </div>
      </div>

      {/* 4 GRAP Stage Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stagesList.map((st) => (
          <div
            key={st.id}
            onClick={() => setActiveTab(st.id as any)}
            className={`bg-[#0a111e] border rounded-xl p-4 cursor-pointer transition-all hover:scale-[1.01] ${
              st.id === 'stage3'
                ? 'border-purple-500/60 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-[#120f26]'
                : 'border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold font-serif" style={{ color: st.color }}>
                Stage {st.roman}
              </span>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: `${st.color}20`,
                  color: st.color,
                  borderColor: `${st.color}40`,
                }}
              >
                {st.status}
              </span>
            </div>

            <div className="mt-2">
              <h4 className="text-xs font-bold text-slate-200">{st.title}</h4>
              <span className="text-[11px] font-mono text-slate-400">{st.range}</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2 line-clamp-3 leading-snug">
              {st.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Main Enforcement Dashboard: Active Stage Action Items */}
      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Active Mandatory Directive Checklist (GRAP Stage III)
            </h3>
            <span className="text-xs text-slate-400">
              Responsible agencies: DPCC, Delhi Traffic Police, MCD, PWD, Transport Dept, NHAI
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
              {actions.filter((a) => a.implemented).length}/{actions.length} Statutory Measures Enforced
            </span>
          </div>
        </div>

        {/* Action Items List */}
        <div className="space-y-2.5">
          {actions.map((act) => (
            <div
              key={act.id}
              onClick={() => toggleAction(act.id)}
              className={`p-3 rounded-xl border flex items-start justify-between gap-3 cursor-pointer transition-all ${
                act.implemented
                  ? 'bg-purple-950/20 border-purple-500/30 text-slate-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {act.implemented ? (
                    <CheckCircle2 className="w-4 h-4 text-purple-400 fill-purple-900/40" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-200">{act.text}</h4>
                  <span className="text-[11px] text-purple-300/80 font-mono mt-0.5 block">
                    Lead Authority: {act.department}
                  </span>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                  act.implemented
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}
              >
                {act.implemented ? 'Active & Monitored' : 'Pending Action'}
              </span>
            </div>
          ))}
        </div>

        {/* Statutory Legal Citations */}
        <div className="bg-[#090f1a] border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
          <h4 className="font-bold text-slate-300 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            Statutory Legal Basis & Penalty Enforcement
          </h4>
          <ul className="space-y-1 text-[11px] text-slate-400 list-disc pl-4">
            {grapStage.statutoryDirectives.map((dir, idx) => (
              <li key={idx}>{dir}</li>
            ))}
            <li>
              Violations subject to environmental compensation fines up to ₹5,00,000 for construction infractions and vehicle impoundment under Motor Vehicles Act.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
