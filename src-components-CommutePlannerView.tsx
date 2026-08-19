import React, { useState } from 'react';
import {
  Navigation,
  Train,
  Car,
  Bike,
  Bus,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingDown,
  Info,
  Layers,
  Wind,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface CommutePlannerViewProps {
  stations: MonitoringStation[];
  grapStage: GrapStageInfo;
}

interface TransitMode {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  filtrationFactor: number; // 0.05 (95% filtered) to 1.0 (0% filtered)
  inhaledRateMultiplier: number; // exertion multiplier
  description: string;
  pros: string;
  cons: string;
}

const TRANSIT_MODES: TransitMode[] = [
  {
    id: 'metro',
    name: 'Delhi Metro (AC Under/Elevated)',
    icon: Train,
    filtrationFactor: 0.18, // 82% particulate reduction inside train
    inhaledRateMultiplier: 1.0,
    description: 'Underground tunnels & elevated AC coaches with MERV-rated HVAC intake filtration.',
    pros: 'Minimal particulate exposure, bypasses surface road dust & vehicle exhaust.',
    cons: 'Last-mile connectivity requires walking through roadside smog.',
  },
  {
    id: 'car_ac',
    name: 'Private Car / Cab (AC Recirculation)',
    icon: Car,
    filtrationFactor: 0.25, // 75% reduction with HEPA/Cabin filter
    inhaledRateMultiplier: 0.9,
    description: 'Closed cabin running AC with Recirculation Mode (Orange indicator ON).',
    pros: 'Shields from direct diesel exhaust plumes.',
    cons: 'Subject to GRAP odd-even & BS-III/IV restrictions in heavy congestion.',
  },
  {
    id: 'ebus',
    name: 'DTC Electric / AC Bus',
    icon: Bus,
    filtrationFactor: 0.45, // 55% reduction
    inhaledRateMultiplier: 1.1,
    description: 'Electric low-floor bus with closed doors and AC.',
    pros: 'Zero tailpipe emissions, protected compared to open rickshaws.',
    cons: 'Frequent door opening at stops allows particulate infiltration.',
  },
  {
    id: 'two_wheeler_n95',
    name: 'Two-Wheeler / Bike + N95 Respirator',
    icon: Bike,
    filtrationFactor: 0.12, // 88% effective filtration if sealed
    inhaledRateMultiplier: 1.8, // physical exertion / wind pressure
    description: 'Motorcycle or bicycle with tight-fitting certified ISI/NIOSH N95 mask.',
    pros: 'High respiratory protection if mask seal is strictly airtight.',
    cons: 'Skin and ocular irritation from acidic sulfur and nitrate aerosols.',
  },
  {
    id: 'two_wheeler_unmasked',
    name: 'Two-Wheeler / Open Auto (Unmasked / Cloth)',
    icon: AlertTriangle,
    filtrationFactor: 0.95, // near zero protection
    inhaledRateMultiplier: 2.0,
    description: 'Direct unfiltered exposure to high-velocity roadside traffic emissions.',
    pros: 'Fastest navigation in bumper-to-bumper gridlock.',
    cons: 'CRITICAL HAZARD: Massive deep-alveolar PM2.5 deposition.',
  },
];

const NCR_LANDMARKS = [
  { name: 'Connaught Place (Central Delhi)', lat: 28.6315, lng: 77.2167, aqi: 310 },
  { name: 'Anand Vihar ISBT (East Hotspot)', lat: 28.6469, lng: 77.316, aqi: 395 },
  { name: 'Cyber City, Gurugram (Haryana)', lat: 28.4952, lng: 77.0894, aqi: 340 },
  { name: 'Sector 62, Noida (UP)', lat: 28.6256, lng: 77.3621, aqi: 360 },
  { name: 'Dwarka Sector 8 (South West)', lat: 28.5714, lng: 77.0708, aqi: 315 },
  { name: 'Rohini Sector 16 (North Delhi)', lat: 28.7325, lng: 77.1189, aqi: 375 },
  { name: 'AIIMS / Safdarjung (South Delhi)', lat: 28.5672, lng: 77.21, aqi: 295 },
  { name: 'IGI Airport Terminal 3', lat: 28.5562, lng: 77.1, aqi: 285 },
];

export const CommutePlannerView: React.FC<CommutePlannerViewProps> = ({ stations, grapStage }) => {
  const [origin, setOrigin] = useState<string>(NCR_LANDMARKS[1].name); // Anand Vihar
  const [destination, setDestination] = useState<string>(NCR_LANDMARKS[2].name); // Cyber City
  const [selectedMode, setSelectedMode] = useState<string>('metro');
  const [departureTime, setDepartureTime] = useState<string>('08:30 AM');
  const [commuteMinutes, setCommuteMinutes] = useState<number>(55);
  const [distanceKm, setDistanceKm] = useState<number>(28);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Compute ambient average AQI & PM2.5
  const regionalAvgAqi = Math.round(
    stations.reduce((acc, st) => acc + st.aqi, 0) / (stations.length || 1)
  );
  const regionalAvgPm25 = Math.round(
    stations.reduce((acc, st) => acc + st.pm25, 0) / (stations.length || 1)
  );

  const currentMode = TRANSIT_MODES.find((m) => m.id === selectedMode) || TRANSIT_MODES[0];

  // Tidal volume ~ 8 liters/min at rest, 14 L/min during light exertion = ~0.6 to 0.9 m3/hr
  const breathingRateM3PerMin = (0.012 * currentMode.inhaledRateMultiplier);
  const totalBreathingM3 = breathingRateM3PerMin * commuteMinutes;
  
  // Effective inhaled PM2.5 in micrograms
  const effectiveAmbientPm25 = regionalAvgPm25;
  const inhaledPm25Ug = Math.round(
    effectiveAmbientPm25 * currentMode.filtrationFactor * totalBreathingM3 * 10
  ) / 10;

  // Cigarette particulate equivalence: ~22 µg PM2.5 ≈ 1 cigarette equivalent
  const cigaretteEquivalent = Math.max(0.1, Math.round((inhaledPm25Ug / 22) * 10) / 10);

  const handleFetchAiCommuteAnalysis = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/commute-exposure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin,
          destination,
          transitMode: currentMode.name,
          departureTime,
          avgAqi: regionalAvgAqi,
          distanceKm,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Error fetching commute analysis', err);
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
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-black tracking-widest uppercase">
              <Navigation className="w-3 h-3 text-cyan-400 animate-pulse" />
              COMMUTE PARTICULATE DOSAGE & ROUTE OPTIMIZER
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              DELHI-NCR INTER-URBAN TRANSIT
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            CLEAN AIR COMMUTE & EXPOSURE PLANNER
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Calculate your exact inhaled particulate dosage (µg PM2.5) across Delhi Metro, private AC vehicle, or road transit. Identify the optimal low-inversion departure window.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-red-950/40 border border-red-500/40 px-3 py-2 text-right">
            <div className="text-[10px] font-black text-red-400 uppercase">
              AIRSHED PM2.5: {regionalAvgPm25} µg/m³
            </div>
            <span className="text-[9px] font-mono text-white/60">
              Mean AQI: {regionalAvgAqi} ({grapStage.name})
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route Configuration & Mode Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Origin & Destination Selector */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-cyan-400" />
              ORIGIN & DESTINATION CONFIGURATION
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  ORIGIN LANDMARK
                </label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2.5 border border-white/20 focus:outline-none focus:border-cyan-400"
                >
                  {NCR_LANDMARKS.map((lm) => (
                    <option key={lm.name} value={lm.name}>
                      {lm.name} (AQI: {lm.aqi})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  DESTINATION LANDMARK
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2.5 border border-white/20 focus:outline-none focus:border-cyan-400"
                >
                  {NCR_LANDMARKS.map((lm) => (
                    <option key={lm.name} value={lm.name}>
                      {lm.name} (AQI: {lm.aqi})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-white/60">
                  DEPARTURE TIME
                </label>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full bg-black text-white text-xs font-mono px-2 py-1.5 border border-white/20"
                >
                  <option value="06:30 AM">06:30 AM (Inversion Peak)</option>
                  <option value="07:30 AM">07:30 AM (Early Rush)</option>
                  <option value="08:30 AM">08:30 AM (Peak Rush)</option>
                  <option value="10:30 AM">10:30 AM (Safe Ventilation)</option>
                  <option value="01:30 PM">01:30 PM (Midday Cleanest)</option>
                  <option value="06:00 PM">06:00 PM (Evening Surge)</option>
                  <option value="09:00 PM">09:00 PM (Nocturnal Trapping)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-white/60">
                  EST. COMMUTE TIME
                </label>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={commuteMinutes}
                  onChange={(e) => setCommuteMinutes(Number(e.target.value))}
                  className="w-full bg-black text-white text-xs font-mono px-2 py-1.5 border border-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-wider text-white/60">
                  DISTANCE (KM)
                </label>
                <input
                  type="number"
                  min={2}
                  max={90}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(Number(e.target.value))}
                  className="w-full bg-black text-white text-xs font-mono px-2 py-1.5 border border-white/20"
                />
              </div>
            </div>
          </div>

          {/* 2. Transit Mode Selection Cards */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white">
                SELECT TRANSIT MODE & FILTRATION
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">5 MODES BENCHMARKED</span>
            </div>

            <div className="space-y-2.5">
              {TRANSIT_MODES.map((mode) => {
                const Icon = mode.icon;
                const isSelected = selectedMode === mode.id;

                return (
                  <div
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`p-3.5 border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-black/50 border-white/10 hover:border-white/25 hover:bg-black/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isSelected ? 'bg-cyan-500 text-black' : 'bg-white/5 text-white/70'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black uppercase text-white tracking-wide">
                            {mode.name}
                          </h4>
                          <p className="text-[10px] text-white/60 mt-0.5">{mode.description}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`px-2 py-0.5 text-[9px] font-black uppercase ${
                            mode.filtrationFactor <= 0.25
                              ? 'bg-emerald-600 text-white'
                              : mode.filtrationFactor <= 0.5
                              ? 'bg-yellow-500 text-black'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {Math.round((1 - mode.filtrationFactor) * 100)}% BARRIER
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Calculated Inhaled Dosage & AI Exposure Advisor (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Inhaled Particulate Intake Card */}
          <div className="bg-[#0f0f0f] border-2 border-red-500/40 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-red-500" />
                ESTIMATED INHALED PARTICULATE DOSAGE
              </h3>
              <span className="text-[9px] font-mono bg-red-600/30 text-red-300 px-2 py-0.5 font-bold uppercase">
                {commuteMinutes} MIN COMMUTE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-black/70 p-3.5 border border-white/10">
                <div className="text-[10px] font-black uppercase tracking-wider text-white/50">
                  INHALED PM2.5 MASS
                </div>
                <div className="text-3xl font-black text-white mt-1">
                  {inhaledPm25Ug} <span className="text-sm font-mono font-normal text-white/60">µg</span>
                </div>
                <div className="text-[9px] font-mono text-white/50 mt-1">
                  ~{Math.round(totalBreathingM3 * 100) / 100} m³ air respired
                </div>
              </div>

              <div className="bg-black/70 p-3.5 border border-white/10">
                <div className="text-[10px] font-black uppercase tracking-wider text-white/50">
                  CIGARETTE EQUIVALENT
                </div>
                <div className="text-3xl font-black text-amber-400 mt-1">
                  {cigaretteEquivalent} <span className="text-sm font-mono font-normal text-white/60">cigs</span>
                </div>
                <div className="text-[9px] font-mono text-white/50 mt-1">
                  Deep alveolar deposition
                </div>
              </div>
            </div>

            <div className="bg-black/50 p-3 rounded-lg border border-white/10 text-xs space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-black uppercase">
                <span className="text-white/60">Protection Level:</span>
                <span className="text-emerald-400">
                  {currentMode.filtrationFactor <= 0.25
                    ? 'HIGH SHIELDING'
                    : currentMode.filtrationFactor <= 0.5
                    ? 'MODERATE SHIELDING'
                    : 'UNPROTECTED SEVERE EXPOSURE'}
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                <strong>Pro:</strong> {currentMode.pros}
              </p>
              <p className="text-[11px] text-red-300">
                <strong>Hazard:</strong> {currentMode.cons}
              </p>
            </div>

            {/* AI Advisor Button */}
            <button
              type="button"
              onClick={handleFetchAiCommuteAnalysis}
              disabled={isLoadingAi}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                  <span>CALCULATING AEROSOL PHYSICS...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GEMINI 3.1 PRO ROUTE ADVISORY</span>
                </>
              )}
            </button>
          </div>

          {/* AI Response Card */}
          {aiAnalysis && (
            <div className="bg-[#0f0f0f] border border-cyan-500/40 p-5 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-cyan-300">
                    SCIENTIFIC COMMUTE PROTOCOL
                  </h4>
                </div>
                <button
                  onClick={() => handleCopy(aiAnalysis)}
                  className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white font-mono"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <div className="text-xs text-white/90 leading-relaxed font-sans whitespace-pre-wrap bg-black/60 p-4 border border-white/10 rounded">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
