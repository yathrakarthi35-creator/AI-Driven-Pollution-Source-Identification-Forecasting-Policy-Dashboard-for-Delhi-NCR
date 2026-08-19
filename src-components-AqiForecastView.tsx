import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  CloudSun,
  Wind,
  Layers,
  Brain,
  Sparkles,
  AlertTriangle,
  Clock,
  Zap,
  ChevronDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
} from 'lucide-react';
import { MonitoringStation, RateForecastPoint } from '../types';
import { HOURLY_RATE_FORECAST_72H } from '../data/mockData';
import { getAqiCategory } from '../lib/utils';
import { InteractiveTelemetryChart } from './InteractiveTelemetryChart';
import { useLanguage } from '../context/LanguageContext';

interface AqiForecastViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  onOpenForecastReasoning: (station: MonitoringStation) => void;
}

export const AqiForecastView: React.FC<AqiForecastViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  onOpenForecastReasoning,
}) => {
  const { t } = useLanguage();
  const [ratePoints] = useState<RateForecastPoint[]>(HOURLY_RATE_FORECAST_72H);

  // Rate delta calculations for selected station
  const nowAqi = selectedStation.aqi;
  const h24Aqi = selectedStation.forecast.h24;
  const h48Aqi = selectedStation.forecast.h48;
  const h72Aqi = selectedStation.forecast.h72;

  const rateDelta24 = Number(((h24Aqi - nowAqi) / 24).toFixed(2));
  const rateDelta48 = Number(((h48Aqi - h24Aqi) / 24).toFixed(2));
  const rateDelta72 = Number(((h72Aqi - h48Aqi) / 24).toFixed(2));

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header Banner */}
      <div className="bg-[#0a0e1a] border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-cyan-400">
              ATMOSPHERIC WRF-CHEM / SATELLITE ASSIMILATION
            </span>
            <span className="px-1.5 py-0.5 bg-red-600/20 border border-red-500/40 text-red-400 text-[9px] font-mono rounded">
              24H – 72H RATE ENGINE
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase mt-1">
            {t.tabForecast}
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            Predictive hourly rate-of-change models for Delhi-NCR forecasting nocturnal subsidence inversions, transboundary stubble plume advection, and diurnal AQI velocity.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="relative">
            <select
              value={selectedStation.id}
              onChange={(e) => {
                const s = stations.find((item) => item.id === e.target.value);
                if (s) onSelectStation(s);
              }}
              className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-3.5 py-2 pr-8 cursor-pointer focus:outline-none focus:border-cyan-400"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} className="bg-slate-950 text-white font-mono">
                  {st.name} ({st.aqi} AQI)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => onOpenForecastReasoning(selectedStation)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            <Brain className="w-3.5 h-3.5 animate-pulse" />
            <span>AI HIGH-THINKING REASONING</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Time-Series Telemetry Chart with Hover Scrubber */}
      <InteractiveTelemetryChart station={selectedStation} initialHorizon="72h" height={260} />

      {/* 3. 24H, 48H, 72H Rate Prediction Metric Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* +24 Hours Rate Card */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              +24 HOURS PREDICATION
            </span>
            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${rateDelta24 <= 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
              {rateDelta24 <= 0 ? 'IMPROVING' : 'DETERIORATING'}
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tighter">
              {h24Aqi} <span className="text-xs font-normal text-slate-400">AQI</span>
            </div>
            <div className={`text-xs font-mono font-bold flex items-center gap-1 ${rateDelta24 <= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {rateDelta24 <= 0 ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
              <span>{rateDelta24 > 0 ? `+${rateDelta24}` : rateDelta24} AQI/HR</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed font-sans pt-2 border-t border-slate-800">
            <strong className="text-white">PBL Mixing:</strong> Solar convection lifts inversion layer up to 950m during midday, temporarily diluting fine particulates.
          </div>
        </div>

        {/* +48 Hours Rate Card */}
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              +48 HOURS PREDICATION
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
              RE-ACCUMULATION
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tighter">
              {h48Aqi} <span className="text-xs font-normal text-slate-400">AQI</span>
            </div>
            <div className={`text-xs font-mono font-bold flex items-center gap-1 ${rateDelta48 >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {rateDelta48 >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{rateDelta48 > 0 ? `+${rateDelta48}` : rateDelta48} AQI/HR</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed font-sans pt-2 border-t border-slate-800">
            <strong className="text-white">Stagnation Risk:</strong> Wind speeds decline below 4.0 km/h; secondary inorganic aerosols (sulfates/nitrates) build up across NCR.
          </div>
        </div>

        {/* +72 Hours Rate Card */}
        <div className="bg-[#0b101d] border-2 border-red-500/60 rounded-xl p-5 space-y-3 relative overflow-hidden shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">
              +72 HOURS PREDICATION (PEAK)
            </span>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
              SEVERE SURGE
            </span>
          </div>

          <div className="flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono text-red-500 tracking-tighter">
              {h72Aqi} <span className="text-xs font-normal text-slate-400">AQI</span>
            </div>
            <div className="text-xs font-mono font-bold flex items-center gap-1 text-red-400">
              <ArrowUpRight className="w-4 h-4" />
              <span>+{rateDelta72} AQI/HR</span>
            </div>
          </div>

          <div className="text-xs text-slate-300 leading-relaxed font-sans pt-2 border-t border-slate-800">
            <strong className="text-white">GRAP Stage IV Alert:</strong> High probability of exceeding 400 AQI benchmark. Immediate emergency contingency required.
          </div>
        </div>
      </div>

      {/* 4. Diurnal Hourly Rate Timeline */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            72-HOUR DIURNAL POLLUTION RATE & INVERSION SURGE TIMELINE
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            METEOROLOGICAL VENTILATION MODEL (WRF-CHEM 4.4)
          </span>
        </div>

        <div className="space-y-2.5">
          {ratePoints.map((pt, idx) => {
            const isPositive = pt.rateOfChangePerHour > 0;
            return (
              <div
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-700 transition-all"
              >
                {/* Time & Stage */}
                <div className="w-48 shrink-0">
                  <div className="text-xs font-black text-white uppercase">{pt.timestamp}</div>
                  <span
                    className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded mt-0.5 inline-block ${
                      pt.inversionRisk === 'Critical'
                        ? 'bg-red-600 text-white'
                        : pt.inversionRisk === 'Severe'
                        ? 'bg-orange-500 text-black'
                        : pt.inversionRisk === 'Moderate'
                        ? 'bg-yellow-500 text-black'
                        : 'bg-emerald-500 text-black'
                    }`}
                  >
                    {pt.inversionRisk} Inversion Risk
                  </span>
                </div>

                {/* Description */}
                <div className="flex-1 text-xs text-slate-300 font-sans">
                  <p>{pt.conditionDescription}</p>
                  <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                    Dominant: {pt.dominantSource}
                  </span>
                </div>

                {/* AQI & Rate */}
                <div className="flex items-center gap-6 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">PM2.5 / PM10</span>
                    <span className="text-xs font-mono font-bold text-white">
                      {pt.pm25} / {pt.pm10} µg
                    </span>
                  </div>

                  <div className="text-right w-20">
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">RATE DELTA</span>
                    <span
                      className={`text-xs font-mono font-black ${
                        isPositive ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {isPositive ? `+${pt.rateOfChangePerHour}` : pt.rateOfChangePerHour}/hr
                    </span>
                  </div>

                  <div className="text-right w-16">
                    <div className="text-xl font-black font-mono text-white leading-none">
                      {pt.aqi}
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase">AQI</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Multi-Station 72-Hour Comparison Table */}
      <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
          72-HOUR MULTI-STATION AIRSHED TRAJECTORY MATRIX
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-black/50 text-slate-400 uppercase text-[10px] font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Monitoring Station</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Current AQI</th>
                <th className="py-3 px-3">+24h Rate Forecast</th>
                <th className="py-3 px-3">+48h Rate Forecast</th>
                <th className="py-3 px-3 text-red-400">+72h Peak Rate</th>
                <th className="py-3 px-3">Statutory Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {stations.map((st) => (
                <tr key={st.id} className="hover:bg-slate-900/60 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {st.name}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{st.district}</td>
                  <td className="py-2.5 px-3 font-bold text-red-400">{st.forecast.now}</td>
                  <td className="py-2.5 px-3">{st.forecast.h24}</td>
                  <td className="py-2.5 px-3">{st.forecast.h48}</td>
                  <td className="py-2.5 px-3 font-bold text-red-500">{st.forecast.h72}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                        st.forecast.h72 >= 400
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {st.forecast.h72 >= 400 ? 'STAGE III/IV' : 'SEVERE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
