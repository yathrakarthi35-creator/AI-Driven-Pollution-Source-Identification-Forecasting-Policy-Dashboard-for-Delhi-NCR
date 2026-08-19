import React, { useState } from 'react';
import {
  Columns,
  TrendingUp,
  TrendingDown,
  Wind,
  Layers,
  Thermometer,
  Droplets,
  Brain,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ArrowRight,
  ShieldAlert,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { MonitoringStation } from '../types';
import { getAqiCategory } from '../lib/utils';
import { useLanguage } from '../context/LanguageContext';

interface MultiStationCompareViewProps {
  stations: MonitoringStation[];
  onOpenStationDetail?: (station: MonitoringStation) => void;
  onOpenAiReasoning?: () => void;
}

export const MultiStationCompareView: React.FC<MultiStationCompareViewProps> = ({
  stations,
  onOpenStationDetail,
  onOpenAiReasoning,
}) => {
  const { language, t } = useLanguage();

  const [stationAId, setStationAId] = useState<string>(stations[0]?.id || 'anand-vihar');
  const [stationBId, setStationBId] = useState<string>(stations[2]?.id || 'punjabi-bagh');
  const [stationCId, setStationCId] = useState<string>(stations[4]?.id || 'rk-puram');

  const stationA = stations.find((s) => s.id === stationAId) || stations[0];
  const stationB = stations.find((s) => s.id === stationBId) || stations[1] || stations[0];
  const stationC = stations.find((s) => s.id === stationCId) || stations[2] || stations[0];

  const compareList = [stationA, stationB, stationC];

  // Highest AQI station in comparison
  const highestStation = [...compareList].sort((a, b) => b.aqi - a.aqi)[0];
  const lowestStation = [...compareList].sort((a, b) => a.aqi - b.aqi)[0];
  const maxDelta = highestStation.aqi - lowestStation.aqi;

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-[#0b101d] border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-cyan-400">
              CAAQMS DIFFERENTIAL TELEMETRY
            </span>
            <span className="px-1.5 py-0.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[9px] font-mono rounded">
              3-NODE MATRIX
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-1">
            {t.compareTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            {t.compareSubtitle}
          </p>
        </div>

        {onOpenAiReasoning && (
          <button
            onClick={onOpenAiReasoning}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] shrink-0"
          >
            <Brain className="w-4 h-4 animate-pulse" />
            <span>AI Multi-Node Synthesis</span>
          </button>
        )}
      </div>

      {/* Node Selectors & Quick Delta Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Node A Selector */}
        <div className="bg-[#0f1629] border border-slate-800 p-3.5 rounded-xl">
          <label className="block text-[10px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
            {t.selectStation1}
          </label>
          <select
            value={stationAId}
            onChange={(e) => setStationAId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                {s.name} ({s.aqi} AQI - {s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Node B Selector */}
        <div className="bg-[#0f1629] border border-slate-800 p-3.5 rounded-xl">
          <label className="block text-[10px] font-black uppercase tracking-wider text-purple-400 mb-1.5">
            {t.selectStation2}
          </label>
          <select
            value={stationBId}
            onChange={(e) => setStationBId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-purple-400"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                {s.name} ({s.aqi} AQI - {s.category})
              </option>
            ))}
          </select>
        </div>

        {/* Node C Selector */}
        <div className="bg-[#0f1629] border border-slate-800 p-3.5 rounded-xl">
          <label className="block text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-1.5">
            {t.selectStation3}
          </label>
          <select
            value={stationCId}
            onChange={(e) => setStationCId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-400"
          >
            {stations.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                {s.name} ({s.aqi} AQI - {s.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Comparison Summary Pill Bar */}
      <div className="bg-slate-900/60 border border-slate-800 px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Critical Airshed Node:</span>
          <span className="font-bold text-red-400 bg-red-950/60 border border-red-500/30 px-2 py-0.5 rounded">
            {highestStation.name} ({highestStation.aqi} AQI)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">{t.varianceDelta}:</span>
          <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded">
            Δ {maxDelta} AQI Points
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium">Cleanest Micro-Basin:</span>
          <span className="font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            {lowestStation.name} ({lowestStation.aqi} AQI)
          </span>
        </div>
      </div>

      {/* Side-by-Side 3-Card Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {compareList.map((st, idx) => {
          const catInfo = getAqiCategory(st.aqi);
          const isMax = st.id === highestStation.id;
          const nodeLabel = idx === 0 ? 'NODE A' : idx === 1 ? 'NODE B' : 'NODE C';
          const nodeColor = idx === 0 ? 'border-cyan-500/40' : idx === 1 ? 'border-purple-500/40' : 'border-emerald-500/40';

          return (
            <div
              key={`${st.id}-${idx}`}
              className={`bg-[#0c111e] border ${nodeColor} rounded-xl p-5 flex flex-col justify-between relative overflow-hidden shadow-lg`}
            >
              {isMax && (
                <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-bl">
                  MAX HOTSPOT
                </div>
              )}

              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-60 text-slate-400">
                    {nodeLabel} &bull; {st.district}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mt-1">
                  {st.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {st.state} &bull; Lat {st.lat.toFixed(2)}, Lng {st.lng.toFixed(2)}
                </span>

                {/* AQI Big Stat */}
                <div className="mt-4 p-3.5 bg-black/40 border border-slate-800 rounded-lg flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      AQI INDEX
                    </span>
                    <div className="text-3xl font-black text-white leading-none mt-1">
                      {st.aqi}
                    </div>
                  </div>
                  <span className={`text-xs font-black uppercase px-2 py-1 rounded border ${catInfo.bgClass} ${catInfo.textClass}`}>
                    {st.category}
                  </span>
                </div>

                {/* Granular Pollutants Grid */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                    <span className="text-[9px] text-slate-400 font-mono block">PM2.5</span>
                    <span className="text-sm font-bold text-orange-400">{st.pm25} µg/m³</span>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                    <span className="text-[9px] text-slate-400 font-mono block">PM10</span>
                    <span className="text-sm font-bold text-amber-400">{st.pm10} µg/m³</span>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                    <span className="text-[9px] text-slate-400 font-mono block">NO2</span>
                    <span className="text-sm font-bold text-cyan-400">{st.no2} ppb</span>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded">
                    <span className="text-[9px] text-slate-400 font-mono block">SO2</span>
                    <span className="text-sm font-bold text-slate-300">{st.so2} ppb</span>
                  </div>
                </div>

                {/* Meteorology Breakdown */}
                <div className="mt-4 p-3 bg-slate-900/40 border border-slate-800 rounded-lg space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Wind className="w-3.5 h-3.5 text-cyan-400" />
                      Wind Vector:
                    </span>
                    <span className="font-mono font-bold text-white">
                      {st.windSpeed} km/h ({st.windDir} {st.windDegree}°)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-purple-400" />
                      PBL Mixing Height:
                    </span>
                    <span className={`font-mono font-bold ${st.pblHeight < 300 ? 'text-red-400' : 'text-slate-300'}`}>
                      {st.pblHeight} m
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                      Temp / Humidity:
                    </span>
                    <span className="font-mono text-slate-300">
                      {st.temp}°C / {st.humidity}%
                    </span>
                  </div>
                </div>

                {/* Source Breakdown Mini-Bars */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Source Apportionment
                  </span>

                  <div className="space-y-1 text-[10px]">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Vehicles ({st.sources.vehicles}%)</span>
                      <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-red-500 h-full rounded" style={{ width: `${st.sources.vehicles}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Stubble ({st.sources.stubble}%)</span>
                      <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-orange-500 h-full rounded" style={{ width: `${st.sources.stubble}%` }} />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-slate-400">
                      <span>Industry ({st.sources.industry}%)</span>
                      <div className="w-24 bg-slate-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-amber-500 h-full rounded" style={{ width: `${st.sources.industry}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action */}
              {onOpenStationDetail && (
                <button
                  onClick={() => onOpenStationDetail(st)}
                  className="mt-5 w-full py-2 bg-white/5 hover:bg-white/10 border border-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>Inspect Full Node Telemetry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
