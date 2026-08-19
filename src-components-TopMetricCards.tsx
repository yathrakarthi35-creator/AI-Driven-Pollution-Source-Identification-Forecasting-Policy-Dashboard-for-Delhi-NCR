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
import { useLanguage } from '../context/LanguageContext';

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
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. AQI (Current) */}
      <div className="bg-[#0b101e] border border-red-500/40 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/80 transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-red-400">
            {t.aqiIndex}
          </span>
          <div className="w-5 h-5 bg-red-600 rounded flex items-center justify-center text-white text-[10px] font-black">
            !
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-red-500 leading-none font-mono">
            {station.aqi}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-red-400 mt-1">
            {station.category}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-400">
          <span className="truncate">{station.name}</span>
          <span className="text-red-400 font-mono">CRITICAL</span>
        </div>
      </div>

      {/* 2. PM2.5 */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-orange-500/60 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-orange-400">
            PM2.5 (µg/m³)
          </span>
          <div className="w-5 h-5 bg-orange-600 rounded flex items-center justify-center text-white text-[9px] font-black">
            PM
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-orange-400 leading-none font-mono">
            {station.pm25}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-orange-400/90 mt-1">
            14X WHO LIMIT
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-orange-400">
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>↑ 12% VS YDAY</span>
        </div>
      </div>

      {/* 3. PM10 */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/60 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-amber-400">
            PM10 (µg/m³)
          </span>
          <div className="w-5 h-5 bg-amber-600 rounded flex items-center justify-center text-black text-[9px] font-black">
            D
          </div>
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-amber-400 leading-none font-mono">
            {station.pm10}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mt-1">
            HAZARDOUS DUST
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-amber-400">
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span>↑ 8% VS YDAY</span>
        </div>
      </div>

      {/* 4. Temperature */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
            TEMPERATURE
          </span>
          <Thermometer className="w-4 h-4 text-slate-400" />
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none font-mono">
            {station.temp}°C
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            CLEAR SKY
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-slate-400">
          <span>SURFACE</span>
          <span className="text-emerald-400 font-mono">STABLE</span>
        </div>
      </div>

      {/* 5. Humidity */}
      <div className="bg-[#0b101e] border border-slate-800 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-400">
            HUMIDITY
          </span>
          <Droplets className="w-4 h-4 text-cyan-400" />
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-cyan-400 leading-none font-mono">
            {station.humidity}%
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
            TRAPPING FOG
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800 flex items-center gap-1 text-[10px] font-bold tracking-wider uppercase text-slate-400">
          <TrendingDown className="w-3 h-3 text-sky-400 shrink-0" />
          <span>↓ 5% VS YDAY</span>
        </div>
      </div>

      {/* 6. GRAP Stage */}
      <div
        onClick={onOpenGrapModal}
        className="bg-gradient-to-br from-red-600 to-rose-700 border border-red-500 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all hover:scale-[1.02]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">
            {t.grapEnforcement}
          </span>
          <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
        </div>

        <div className="mt-3">
          <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-none font-mono">
            STAGE {grapStage.roman}
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-white/90 mt-1">
            {grapStage.status.toUpperCase()}
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-bold tracking-wider uppercase text-white">
          <span>MANDATORY BAN</span>
          <span className="bg-white text-black px-1.5 py-0.2 rounded font-black text-[9px]">ACT</span>
        </div>
      </div>
    </div>
  );
};
