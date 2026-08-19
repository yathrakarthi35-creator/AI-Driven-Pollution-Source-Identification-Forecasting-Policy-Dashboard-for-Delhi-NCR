import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  Circle,
  ExternalLink,
} from 'lucide-react';
import { GrapStageInfo } from '../types';

interface GrapAlertCardProps {
  grapData: GrapStageInfo;
  onOpenGrapModal: () => void;
}

export const GrapAlertCard: React.FC<GrapAlertCardProps> = ({
  grapData,
  onOpenGrapModal,
}) => {
  const [actions, setActions] = useState(grapData.recommendedActions);

  const toggleAction = (id: string) => {
    setActions(
      actions.map((act) =>
        act.id === id ? { ...act, implemented: !act.implemented } : act
      )
    );
  };

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white">
          POLICY ACTION / REGULATORY DIRECTIVES
        </h3>
        <span className="text-[10px] font-black uppercase tracking-widest bg-red-600 text-white px-2 py-0.5">
          CAQM MANDATE
        </span>
      </div>

      {/* Grid: Left High-Impact Banner Blocks, Right Statutory Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Banner Blocks (5 cols) */}
        <div className="md:col-span-5 space-y-2.5">
          {/* Active Intervention Block matching Design HTML */}
          <div className="bg-white/5 p-3.5 border-l-4 border-red-600">
            <h4 className="text-[10px] font-black uppercase opacity-50 mb-0.5 tracking-wider text-white">
              Active Intervention
            </h4>
            <p className="text-base font-black tracking-tight text-white">
              GRAP STAGE III ENFORCED
            </p>
            <p className="text-[10px] uppercase mt-1 opacity-70 text-white leading-tight">
              All non-essential C&D + BS-III/IV restrictions in effect
            </p>
          </div>

          {/* Predictive Warning Block matching Design HTML */}
          <div className="bg-white/5 p-3.5 border-l-4 border-yellow-500 opacity-90">
            <h4 className="text-[10px] font-black uppercase opacity-50 mb-0.5 tracking-wider text-white">
              Predictive Warning
            </h4>
            <p className="text-base font-black tracking-tight text-yellow-400">
              STAGE IV / ODD-EVEN IN 48H
            </p>
            <p className="text-[10px] uppercase mt-1 opacity-70 text-white leading-tight">
              92% confidence for atmospheric boundary layer stagnation
            </p>
          </div>
        </div>

        {/* Action Checklist (7 cols) */}
        <div className="md:col-span-7 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-white/80 mb-1">
            <span>Enforcement Checklist</span>
            <span className="text-red-500 font-mono">
              {actions.filter((a) => a.implemented).length}/{actions.length} APPLIED
            </span>
          </div>

          <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
            {actions.slice(0, 4).map((act) => (
              <div
                key={act.id}
                onClick={() => toggleAction(act.id)}
                className={`p-2 border text-xs flex items-start gap-2.5 cursor-pointer transition-all ${
                  act.implemented
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-black border-white/5 text-white/50 hover:text-white'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {act.implemented ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />
                  ) : (
                    <Circle className="w-3.5 h-3.5 text-white/30" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide leading-tight line-clamp-2">
                  {act.text}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={onOpenGrapModal}
            className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 mt-1"
          >
            <span>VIEW COMPLETE CAQM GUIDELINES</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
