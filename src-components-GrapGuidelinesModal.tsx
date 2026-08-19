import React from 'react';
import { X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { GrapStageInfo } from '../types';

interface GrapGuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  grapStage: GrapStageInfo;
}

export const GrapGuidelinesModal: React.FC<GrapGuidelinesModalProps> = ({
  isOpen,
  onClose,
  grapStage,
}) => {
  if (!isOpen) return null;

  const stages = [
    {
      stage: 'Stage I: Poor (AQI 201-300)',
      color: '#f97316',
      measures: [
        'Enforce anti-dust measures in Construction & Demolition (C&D) activities strictly.',
        'Intensify water sprinkling and mechanized sweeping on high-density roads.',
        'Strict ban on open burning of municipal solid waste, biomass, and leaves.',
        'Enforce Pollution Under Control (PUC) norm compliance across all vehicles.',
        'Ensure uninterrupted power supply to eliminate reliance on diesel generators.',
      ],
    },
    {
      stage: 'Stage II: Very Poor (AQI 301-400)',
      color: '#ef4444',
      measures: [
        'Mandatory daily water sprinkling with dust suppressants before peak traffic hours.',
        'Ban on use of diesel generator sets except for emergency services (hospitals, metro, water pumping).',
        'Enhance parking fees across commercial centres to discourage personal vehicular trips.',
        'Augment public transport frequency (DTC bus fleet and Delhi Metro train trips).',
        'Issue alerts advising individuals with respiratory/cardiac ailments to avoid early morning outdoor exertion.',
      ],
    },
    {
      stage: 'Stage III: Severe (AQI 401-450)',
      color: '#8b5cf6',
      active: true,
      measures: [
        'Strict ban on non-essential construction and demolition activities across NCR (except critical national infrastructure like railways, metro, airport, healthcare).',
        'Prohibition on plying of BS-III Petrol and BS-IV Diesel 4-wheelers in Delhi, Gurugram, Faridabad, Ghaziabad, and Gautam Buddh Nagar.',
        'State governments may discontinue physical classes up to primary grades (Class V) and transition to online modes.',
        'Close stone crushers and mining activities throughout the NCR region.',
        'Intensify dedicated public transport feeder loops.',
      ],
    },
    {
      stage: 'Stage IV: Severe+ (AQI > 450)',
      color: '#7f1d1d',
      measures: [
        'Stop entry of truck traffic into Delhi (except trucks carrying essential commodities or providing essential services, and all LNG/CNG/Electric trucks).',
        'Ban on plying of Delhi-registered diesel Medium and Heavy Goods Vehicles (MGVs/HGVs) in Delhi.',
        'Ban on C&D activities in linear public projects such as highways, flyovers, overbridges, power transmission lines, pipelines.',
        'NCR state governments and GNCTD to decide on discontinuation of physical classes for Class VI-IX, Class XI.',
        'State governments may consider emergency measures like odd-even scheme and 50% work-from-home mandate for public and private offices.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1626] border border-purple-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a111e]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                CAQM Graded Response Action Plan (GRAP) Matrix
              </h3>
              <p className="text-xs text-slate-400">
                Official statutory schedule under Commission for Air Quality Management (CAQM) Act
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {stages.map((st, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border space-y-2.5 transition-all ${
                st.active
                  ? 'bg-purple-950/20 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                  : 'bg-[#080d17] border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold" style={{ color: st.color }}>
                  {st.stage}
                </h4>
                {st.active && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse"></span>
                    CURRENTLY IN FORCE
                  </span>
                )}
              </div>

              <ul className="space-y-1.5 text-xs text-slate-300">
                {st.measures.map((m, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-500 shrink-0">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a111e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Close Guidelines
          </button>
        </div>
      </div>
    </div>
  );
};
