import React from 'react';
import {
  CloudFog,
  Wind,
  Thermometer,
  Droplets,
  AlertTriangle,
  Flame,
  TrendingUp,
  TrendingDown,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface TopMetricCardsProps {
  station: MonitoringStation;
  grapStage: GrapStageInfo;
  onOpenGrapModal: () => void;
}

export const TopMetricCards: React.FC<TopMetricCardsProps> = ({
  station,
  grapStage,
  onOpenGrapModal,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. AQI (Current) */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/60 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
            AQI INDEX
          </span>
          <div className="w-6 h-6 bg-red-600 flex items-center justify-center text-white text-[10px] font-black">
            !
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-red-500 leading-none">
            {station.aqi}
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider text-red-400 mt-1">
            {station.category}
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-black tracking-wider uppercase opacity-60">
          <span className="truncate">{station.name}</span>
          <span className="text-red-400">CRITICAL</span>
        </div>
      </div>

      {/* 2. PM2.5 */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/60 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
            PM2.5 (µg/m³)
          </span>
          <div className="w-6 h-6 bg-orange-600 flex items-center justify-center text-white text-[10px] font-black">
            PM
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-orange-500 leading-none">
            {station.pm25}
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider text-orange-400 mt-1">
            14X WHO LIMIT
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-orange-400">
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>↑ 12% VS YDAY</span>
        </div>
      </div>

      {/* 3. PM10 */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/60 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
            PM10 (µg/m³)
          </span>
          <div className="w-6 h-6 bg-amber-600 flex items-center justify-center text-white text-[10px] font-black">
            D
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-amber-500 leading-none">
            {station.pm10}
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider text-amber-400 mt-1">
            HAZARDOUS DUST
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-amber-400">
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>↑ 8% VS YDAY</span>
        </div>
      </div>

      {/* 4. Temperature */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-white/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
            TEMPERATURE
          </span>
          <Thermometer className="w-4 h-4 opacity-50" />
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none">
            {station.temp}°C
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider opacity-60 mt-1">
            CLEAR SKY
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] font-black tracking-wider uppercase opacity-60">
          <span>SURFACE</span>
          <span className="text-emerald-400">STABLE</span>
        </div>
      </div>

      {/* 5. Humidity */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col justify-between relative overflow-hidden group hover:border-white/30 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
            HUMIDITY
          </span>
          <Droplets className="w-4 h-4 opacity-50" />
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none">
            {station.humidity}%
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider opacity-60 mt-1">
            TRAPPING FOG
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center gap-1 text-[10px] font-black tracking-wider uppercase opacity-60">
          <TrendingDown className="w-3 h-3 text-sky-400 shrink-0" />
          <span>↓ 5% VS YDAY</span>
        </div>
      </div>

      {/* 6. GRAP Stage */}
      <div
        onClick={onOpenGrapModal}
        className="bg-red-600 border border-red-500 p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-[0_0_25px_rgba(220,38,38,0.3)] transition-all hover:bg-red-700"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
            POLICY STATUS
          </span>
          <ShieldAlert className="w-4 h-4 text-white" />
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none">
            STAGE {grapStage.roman}
          </div>
          <div className="text-[11px] font-black uppercase tracking-wider text-white/90 mt-1">
            ENFORCED
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-[10px] font-black tracking-wider uppercase text-white">
          <span>MANDATORY BAN</span>
          <span className="bg-white text-black px-1 font-black">ACT</span>
        </div>
      </div>
    </div>
  );
};
