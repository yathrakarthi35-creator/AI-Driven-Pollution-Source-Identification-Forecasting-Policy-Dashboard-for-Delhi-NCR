import React, { useState } from 'react';
import {
  Home,
  Fan,
  Sparkles,
  ShieldAlert,
  Clock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Layers,
  Wind,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface IndoorSanctuaryViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
}

export const IndoorSanctuaryView: React.FC<IndoorSanctuaryViewProps> = ({
  stations,
  selectedStation,
  grapStage,
}) => {
  const [roomType, setRoomType] = useState<string>('Master Bedroom');
  const [roomLengthFt, setRoomLengthFt] = useState<number>(16);
  const [roomWidthFt, setRoomWidthFt] = useState<number>(14);
  const [ceilingHeightFt, setCeilingHeightFt] = useState<number>(10);
  const [targetAch, setTargetAch] = useState<number>(5.0); // 5 Air Changes per Hour
  const [currentCadrm3h, setCurrentCadrm3h] = useState<number>(320); // user's current purifier CADR

  const [aiPlan, setAiPlan] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Calculations
  const roomAreaSqFt = roomLengthFt * roomWidthFt;
  const roomVolumeCuFt = roomAreaSqFt * ceilingHeightFt;
  const roomVolumeM3 = Math.round(roomVolumeCuFt * 0.0283168 * 10) / 10;

  // Required CADR in m3/h = Room Volume (m3) * Target ACH
  const requiredCadrm3h = Math.round(roomVolumeM3 * targetAch);
  const requiredCadrCfm = Math.round(requiredCadrm3h * 0.5886);

  // Actual ACH achieved with current purifier
  const achievedAch = Math.round((currentCadrm3h / (roomVolumeM3 || 1)) * 10) / 10;
  const isCadrSufficient = achievedAch >= targetAch;

  // HEPA Filter degradation calculation (Standard HEPA lasts 3000 hours at 50 AQI; at 350 AQI it lasts ~ 600-800 hours)
  const outdoorAqi = selectedStation.aqi;
  const filterLifespanHours = Math.max(350, Math.round(3000 * (100 / Math.max(100, outdoorAqi))));
  const filterLifespanDays = Math.round(filterLifespanHours / 24);

  // NASA Phytoremediation recommendations: 4 waist-high Areca Palms / person + 6-8 Snake plants per bedroom
  const recommendedArecaPalms = Math.max(2, Math.round(roomAreaSqFt / 75));
  const recommendedSnakePlants = Math.max(3, Math.round(roomAreaSqFt / 50));

  const handleGenerateAiPlan = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/indoor-optimization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomAreaSqFt,
          ceilingHeightFt,
          outdoorAqi: selectedStation.aqi,
          currentCadrm3h,
          roomType,
        }),
      });
      const data = await res.json();
      if (data.plan) {
        setAiPlan(data.plan);
      }
    } catch (err) {
      console.error('Error generating indoor plan', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-black tracking-widest uppercase">
              <Home className="w-3 h-3 text-emerald-400 animate-pulse" />
              INDOOR ENVIRONMENTAL QUALITY & CADR OPTIMIZER
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              STATION: {selectedStation.name} (AQI: {selectedStation.aqi})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            INDOOR AIR SANCTUARY & PURIFIER CADR CALCULATOR
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Optimize your residential or office HEPA air purification setup. Calculate required Clean Air Delivery Rate (CADR), air change rates (ACH), filter lifespan degradation, and inversion window sealing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-cyan-950/40 border border-cyan-500/40 px-3 py-2 text-right">
            <div className="text-[10px] font-black text-cyan-400 uppercase">
              TARGET SANCTUARY AQI: &lt; 25
            </div>
            <span className="text-[9px] font-mono text-white/60">
              Outdoor vs Indoor Target: 94% Drop
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Room Geometry & Purifier Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Room Geometry Inputs */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              ROOM DIMENSIONS & TARGET PURIFICATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  ROOM / ENCLOSURE TYPE
                </label>
                <select
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2.5 border border-white/20 focus:outline-none focus:border-emerald-400"
                >
                  <option value="Master Bedroom">Master Bedroom (Nocturnal Sanctuary)</option>
                  <option value="Kids / Elderly Bedroom">Kids / Elderly Bedroom (High Vulnerability)</option>
                  <option value="Living / Dining Hall">Living / Dining Hall (Large Volume)</option>
                  <option value="Home Office / Study">Home Office / Study (Continuous Occupancy)</option>
                  <option value="Commercial Meeting Room">Commercial Meeting Room</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  TARGET AIR CHANGES PER HOUR (ACH)
                </label>
                <select
                  value={targetAch}
                  onChange={(e) => setTargetAch(Number(e.target.value))}
                  className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2.5 border border-white/20 focus:outline-none focus:border-emerald-400"
                >
                  <option value={3.0}>3.0 ACH (Standard Maintenance)</option>
                  <option value={5.0}>5.0 ACH (Recommended for Delhi Smog)</option>
                  <option value={6.0}>6.0 ACH (High-Efficiency Asthma Shield)</option>
                  <option value={8.0}>8.0 ACH (Clinical Cleanroom Grade)</option>
                </select>
              </div>
            </div>

            {/* Dimensional Sliders */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/60">
                  <span>LENGTH (FT)</span>
                  <span className="font-mono text-emerald-400">{roomLengthFt} ft</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={40}
                  value={roomLengthFt}
                  onChange={(e) => setRoomLengthFt(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/60">
                  <span>WIDTH (FT)</span>
                  <span className="font-mono text-emerald-400">{roomWidthFt} ft</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={40}
                  value={roomWidthFt}
                  onChange={(e) => setRoomWidthFt(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/60">
                  <span>CEILING (FT)</span>
                  <span className="font-mono text-emerald-400">{ceilingHeightFt} ft</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={16}
                  value={ceilingHeightFt}
                  onChange={(e) => setCeilingHeightFt(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>

            {/* Volume Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
              <div className="bg-black/60 p-2 border border-white/10">
                <span className="text-[9px] text-white/50 block uppercase">Floor Area</span>
                <span className="font-bold text-white">{roomAreaSqFt} sq. ft.</span>
              </div>
              <div className="bg-black/60 p-2 border border-white/10">
                <span className="text-[9px] text-white/50 block uppercase">Air Volume</span>
                <span className="font-bold text-white">{roomVolumeM3} m³</span>
              </div>
              <div className="bg-black/60 p-2 border border-white/10">
                <span className="text-[9px] text-white/50 block uppercase">Required CADR</span>
                <span className="font-bold text-emerald-400">{requiredCadrm3h} m³/h</span>
              </div>
              <div className="bg-black/60 p-2 border border-white/10">
                <span className="text-[9px] text-white/50 block uppercase">Required CFM</span>
                <span className="font-bold text-emerald-400">{requiredCadrCfm} CFM</span>
              </div>
            </div>
          </div>

          {/* Current Purifier Benchmarking */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Fan className="w-4 h-4 text-cyan-400" />
              PURIFIER HARDWARE BENCHMARK
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  MY PURIFIER RATED CADR (m³/h)
                </label>
                <span className="font-mono text-cyan-400 font-bold">{currentCadrm3h} m³/h</span>
              </div>
              <input
                type="range"
                min={100}
                max={900}
                step={10}
                value={currentCadrm3h}
                onChange={(e) => setCurrentCadrm3h(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[9px] font-mono text-white/40">
                <span>100 m³/h (Small Desk)</span>
                <span>350 m³/h (Standard Room)</span>
                <span>650 m³/h (Heavy Commercial)</span>
                <span>900 m³/h</span>
              </div>
            </div>

            {/* Performance Verdict */}
            <div
              className={`p-3.5 border text-xs flex items-center justify-between ${
                isCadrSufficient
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/50 text-red-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isCadrSufficient ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <div>
                  <h4 className="font-black uppercase text-xs">
                    {isCadrSufficient
                      ? `OPTIMAL COVERAGE: DELIVERING ${achievedAch} ACH`
                      : `UNDER-CAPACITY: ONLY ${achievedAch} ACH ACHIEVED`}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {isCadrSufficient
                      ? `Your unit meets the ${targetAch} ACH standard to purge incoming smoke leaks.`
                      : `You require at least ${requiredCadrm3h} m³/h CADR (or an auxiliary second purifier).`}
                  </p>
                </div>
              </div>
              <span className="text-sm font-mono font-black shrink-0 px-2 py-1 bg-black/40">
                {achievedAch} / {targetAch} ACH
              </span>
            </div>
          </div>

          {/* NASA Botanical Air Phytoremediation */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" />
              NASA CLEAN AIR BOTANICAL SANCTUARY DENSITY
            </h3>
            <p className="text-xs text-white/70">
              Phytoremediation plants actively metabolize VOCs (benzene, formaldehyde) and absorb CO₂ during night:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/60 p-3 border border-white/10 space-y-1">
                <div className="font-bold text-white uppercase flex justify-between">
                  <span>Areca Palm (Chrysalidocarpus)</span>
                  <span className="text-emerald-400 font-mono">+{recommendedArecaPalms} pots</span>
                </div>
                <p className="text-[10px] text-white/60">
                  Daytime oxygenator and natural room humidifier. Removes xylene and toluene.
                </p>
              </div>

              <div className="bg-black/60 p-3 border border-white/10 space-y-1">
                <div className="font-bold text-white uppercase flex justify-between">
                  <span>Snake Plant (Sansevieria)</span>
                  <span className="text-emerald-400 font-mono">+{recommendedSnakePlants} pots</span>
                </div>
                <p className="text-[10px] text-white/60">
                  Night-time Crassulacean Acid Metabolism (CAM): converts CO₂ into O₂ while you sleep.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Inversion Schedule & AI Plan (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Filter Lifespan & Schedule */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              NOCTURNAL INVERSION TIMING & FILTER HEALTH
            </h3>

            {/* Filter Lifespan Tile */}
            <div className="bg-black/70 p-3.5 border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-white/50 uppercase font-black tracking-wider block">
                  ESTIMATED HEPA FILTER LIFESPAN
                </span>
                <div className="text-2xl font-black text-white mt-0.5">
                  ~{filterLifespanDays} <span className="text-xs font-mono font-normal text-white/60">Days</span>
                </div>
                <span className="text-[9px] font-mono text-white/50">
                  Based on local {outdoorAqi} AQI continuous run
                </span>
              </div>

              <div className="text-right">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/40 text-[9px] font-black uppercase">
                  CLEAN PRE-FILTER BI-WEEKLY
                </span>
              </div>
            </div>

            {/* Daily Ventilation vs Sealing Protocol */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-red-950/30 border border-red-500/30 rounded flex items-center justify-between">
                <div>
                  <span className="font-bold text-red-400 uppercase text-[11px] block">
                    🔒 20:00 - 08:00 IST: CRITICAL SEALING
                  </span>
                  <span className="text-[10px] text-white/70">
                    Nocturnal inversion lid drops below 350m. Keep all windows tightly sealed.
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/30 rounded flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-400 uppercase text-[11px] block">
                    🪟 13:30 - 14:15 IST: DAYTIME CO₂ PURGE
                  </span>
                  <span className="text-[10px] text-white/70">
                    Maximum solar mixing height. Crack cross-ventilation 15 mins to reset CO₂ &lt; 800ppm.
                  </span>
                </div>
              </div>
            </div>

            {/* AI Advisor Button */}
            <button
              type="button"
              onClick={handleGenerateAiPlan}
              disabled={isLoadingAi}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>SIMULATING FLUID DYNAMICS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GEMINI 3.1 PRO SANCTUARY PLAN</span>
                </>
              )}
            </button>
          </div>

          {/* AI Generated Plan */}
          {aiPlan && (
            <div className="bg-[#0f0f0f] border border-emerald-500/40 p-5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                    INDOOR PURIFICATION BLUEPRINT
                  </h4>
                </div>
                <button
                  onClick={() => handleCopy(aiPlan)}
                  className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white font-mono"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="text-xs text-white/90 leading-relaxed font-sans whitespace-pre-wrap bg-black/60 p-4 border border-white/10 rounded">
                {aiPlan}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
