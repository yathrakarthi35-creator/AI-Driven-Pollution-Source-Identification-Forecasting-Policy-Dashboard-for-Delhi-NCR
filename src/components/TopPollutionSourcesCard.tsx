import React from 'react';
import { Info, Factory, Car, Flame, Building2, Trees } from 'lucide-react';
import { MonitoringStation } from '../types';

interface TopPollutionSourcesCardProps {
  station: MonitoringStation;
  onOpenSourcesModal: () => void;
}

export const TopPollutionSourcesCard: React.FC<TopPollutionSourcesCardProps> = ({
  station,
  onOpenSourcesModal,
}) => {
  const sources = [
    { name: 'Vehicular Emissions', percentage: station.sources.vehicles, color: 'text-red-500', barColor: 'bg-red-500' },
    { name: 'Stubble Burning (Punjab/HR)', percentage: station.sources.stubble, color: 'text-orange-500', barColor: 'bg-orange-500' },
    { name: 'Industrial Emissions', percentage: station.sources.industry, color: 'text-yellow-500', barColor: 'bg-yellow-500' },
    { name: 'Construction Dust (NCR)', percentage: station.sources.construction, color: 'text-emerald-500', barColor: 'bg-emerald-500' },
    { name: 'Biomass & Waste Burning', percentage: station.sources.biomass, color: 'text-sky-500', barColor: 'bg-sky-500' },
  ];

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-5 flex flex-col justify-between h-[250px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white flex items-center gap-1.5">
          PRIMARY SOURCES / {station.name.toUpperCase()}
        </h3>
        <button
          onClick={onOpenSourcesModal}
          className="text-[10px] font-black uppercase tracking-wider text-white hover:text-red-500 transition-colors"
        >
          EXPLORE →
        </button>
      </div>

      {/* Sources list with bold percentage typography */}
      <div className="space-y-2.5 my-auto">
        {sources.slice(0, 3).map((item, idx) => (
          <div key={item.name} className={`flex items-end justify-between ${idx > 0 ? 'border-t border-white/10 pt-2' : ''}`}>
            <div className="flex items-end gap-3">
              <span className={`text-3xl sm:text-4xl font-black ${item.color} leading-none tracking-tighter`}>
                {item.percentage}%
              </span>
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-tight mb-0.5 opacity-70 text-white">
                {item.name}
              </span>
            </div>
            <div className="w-16 bg-white/10 h-1.5 rounded-none overflow-hidden hidden sm:block">
              <div className={`h-full ${item.barColor}`} style={{ width: `${item.percentage * 2}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Alert Block */}
      <div className="bg-red-600 px-3 py-2 flex items-center justify-between">
        <p className="text-[9px] font-black uppercase tracking-widest text-white">
          CRITICAL TRACER: LEVOGLUCOSAN & EC
        </p>
        <span className="text-[9px] font-mono font-bold bg-black text-white px-1.5 py-0.5">
          PMF R² = 0.94
        </span>
      </div>
    </div>
  );
};
