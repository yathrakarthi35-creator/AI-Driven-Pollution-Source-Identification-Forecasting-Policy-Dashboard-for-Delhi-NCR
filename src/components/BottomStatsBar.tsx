import React from 'react';
import {
  MapPin,
  Flame,
  Database,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface BottomStatsBarProps {
  activeStationsCount: number;
  totalStationsCount: number;
  farmFiresCount: number;
  dataSourcesCount: string;
  modelAccuracy: string;
  nextUpdateMin: number;
}

export const BottomStatsBar: React.FC<BottomStatsBarProps> = ({
  activeStationsCount,
  totalStationsCount,
  farmFiresCount,
  dataSourcesCount = '15+',
  modelAccuracy = '92%',
  nextUpdateMin = 5,
}) => {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-4 space-y-3">
      {/* Top row of mini telemetry columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Monitoring Stations */}
        <div className="border-l-2 border-white/20 pl-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 block text-white">
            CAAQMS STATIONS
          </span>
          <span className="text-lg font-black text-white tracking-tight">
            {activeStationsCount} ACTIVE <span className="opacity-40 text-xs font-normal">/ {totalStationsCount}</span>
          </span>
        </div>

        {/* 2. Farm Fires Detected */}
        <div className="border-l-2 border-orange-500 pl-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 block text-white">
            VIIRS FARM FIRES
          </span>
          <span className="text-lg font-black text-orange-500 tracking-tight">
            {farmFiresCount} DETECTED
          </span>
        </div>

        {/* 3. Data Sources */}
        <div className="border-l-2 border-white/20 pl-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 block text-white">
            INGESTION FEEDS
          </span>
          <span className="text-lg font-black text-white tracking-tight">
            {dataSourcesCount} STREAMS
          </span>
        </div>

        {/* 4. Model Accuracy */}
        <div className="border-l-2 border-emerald-500 pl-3">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 block text-white">
            WRF-CHEM ACCURACY
          </span>
          <span className="text-lg font-black text-emerald-400 tracking-tight">
            {modelAccuracy} ENSEMBLE
          </span>
        </div>

        {/* 5. Next Telemetry Update */}
        <div className="border-l-2 border-red-500 pl-3 col-span-2 sm:col-span-1">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 block text-white">
            NEXT SYNC
          </span>
          <span className="text-lg font-black text-red-500 tracking-tight">
            IN {nextUpdateMin} MIN
          </span>
        </div>
      </div>

      {/* Barcode Spectrum visualization from Design HTML footer */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
        <div className="flex gap-1 items-end h-5 flex-1 opacity-75">
          <div className="w-full bg-red-900 h-[80%]"></div>
          <div className="w-full bg-red-800 h-[90%]"></div>
          <div className="w-full bg-red-600 h-[100%]"></div>
          <div className="w-full bg-red-500 h-[85%]"></div>
          <div className="w-full bg-red-600 h-[70%]"></div>
          <div className="w-full bg-orange-600 h-[50%]"></div>
          <div className="w-full bg-orange-500 h-[40%]"></div>
          <div className="w-full bg-orange-400 h-[45%]"></div>
          <div className="w-full bg-yellow-500 h-[30%]"></div>
          <div className="w-full bg-yellow-400 h-[25%]"></div>
          <div className="w-full bg-emerald-500 h-[20%]"></div>
          <div className="w-full bg-emerald-400 h-[15%]"></div>
          <div className="w-full bg-emerald-500 h-[10%]"></div>
          <div className="w-full bg-emerald-600 h-[12%]"></div>
        </div>

        <div className="flex flex-col items-end shrink-0">
          <span className="text-[9px] font-black uppercase opacity-50 tracking-widest text-white">
            AI AIRSHED FORECAST
          </span>
          <span className="text-xs font-black text-white uppercase tracking-wider">
            ELEVATED RISK TRAJECTORY
          </span>
        </div>
      </div>
    </div>
  );
};
