import React, { useState, useEffect } from 'react';
import {
  Flame,
  Wind,
  Layers,
  Sparkles,
  Clock,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface StubbleTrajectoryViewProps {
  stations: MonitoringStation[];
  grapStage: GrapStageInfo;
}

interface SmokeCluster {
  id: string;
  district: string;
  state: string;
  activeFires: number;
  fireRadiativePowerMw: number;
  plumeEtaHours: number;
  trajectoryAngle: string;
  contributionPct: number;
}

const SMOKE_CLUSTERS: SmokeCluster[] = [
  {
    id: 'sangrur',
    district: 'Sangrur',
    state: 'Punjab',
    activeFires: 412,
    fireRadiativePowerMw: 1850,
    plumeEtaHours: 14,
    trajectoryAngle: '315° NW (Direct Airshed Channel)',
    contributionPct: 18.5,
  },
  {
    id: 'firozpur',
    district: 'Firozpur',
    state: 'Punjab',
    activeFires: 280,
    fireRadiativePowerMw: 1240,
    plumeEtaHours: 22,
    trajectoryAngle: '320° NW (Upper Tropospheric Drift)',
    contributionPct: 11.2,
  },
  {
    id: 'bathinda',
    district: 'Bathinda',
    state: 'Punjab',
    activeFires: 310,
    fireRadiativePowerMw: 1420,
    plumeEtaHours: 18,
    trajectoryAngle: '310° NW (Surface Boundary Advection)',
    contributionPct: 13.8,
  },
  {
    id: 'karnal',
    district: 'Karnal',
    state: 'Haryana',
    activeFires: 94,
    fireRadiativePowerMw: 420,
    plumeEtaHours: 6,
    trajectoryAngle: '340° NNW (Immediate Proximate Impact)',
    contributionPct: 6.4,
  },
  {
    id: 'kaithal',
    district: 'Kaithal',
    state: 'Haryana',
    activeFires: 78,
    fireRadiativePowerMw: 360,
    plumeEtaHours: 8,
    trajectoryAngle: '330° NNW (Low-level Inflow)',
    contributionPct: 4.8,
  },
];

export const StubbleTrajectoryView: React.FC<StubbleTrajectoryViewProps> = ({
  stations,
  grapStage,
}) => {
  const [selectedCluster, setSelectedCluster] = useState<SmokeCluster>(SMOKE_CLUSTERS[0]);
  const [timelineHour, setTimelineHour] = useState<number>(14);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [windSpeedKmh, setWindSpeedKmh] = useState<number>(18);

  // Play animation loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimelineHour((prev) => (prev >= 36 ? 0 : prev + 1));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const totalTransboundaryShare = Math.round(
    SMOKE_CLUSTERS.reduce((acc, c) => acc + c.contributionPct, 0) * 10
  ) / 10;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 text-[10px] font-black tracking-widest uppercase">
              <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
              NOAA-HYSPLIT ATMOSPHERIC BACK-TRAJECTORY MODEL
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              SATELLITE VIIRS/MODIS INTEGRATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            STUBBLE SMOKE BACK-TRAJECTORY SIMULATOR
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Model transboundary agricultural biomass smoke plume vectors from Punjab & Haryana into the Delhi-NCR airshed with forward/backward advection tracking and inversion lid trapping analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-amber-950/40 border border-amber-500/40 px-3 py-2 text-right">
            <div className="text-[10px] font-black text-amber-400 uppercase">
              STUBBLE SHARE: {totalTransboundaryShare}%
            </div>
            <span className="text-[9px] font-mono text-white/60">
              Total Farm Fires: 1,174 Active
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Timeline Control Bar */}
      <div className="bg-[#0f0f0f] border border-white/10 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              setIsPlaying(false);
              setTimelineHour(0);
            }}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Reset to Origin (T-0h)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div>
            <div className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <span>TRAJECTORY TIME:</span>
              <span className="font-mono text-amber-400 font-bold text-sm">
                +{timelineHour} Hours from Ignition
              </span>
            </div>
            <span className="text-[10px] font-mono text-white/50">
              {timelineHour === 0
                ? 'Plume Ignition at Punjab Farm Fires'
                : timelineHour < selectedCluster.plumeEtaHours
                ? `Mid-transit over Indo-Gangetic Plains (${Math.round((timelineHour / selectedCluster.plumeEtaHours) * 100)}% transit)`
                : `Transboundary Plume INFILTRATING Delhi-NCR Airshed (Active Smog Injection)`}
            </span>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex-1 max-w-md">
          <input
            type="range"
            min={0}
            max={36}
            value={timelineHour}
            onChange={(e) => setTimelineHour(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
          <div className="flex justify-between text-[9px] font-mono text-white/40">
            <span>T-0h (Ignition)</span>
            <span>T+12h (Mid-Plains)</span>
            <span>T+24h (NCR Inflow)</span>
            <span>T+36h (Nocturnal Cap)</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Farm Fire Plume Origin Clusters (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" />
              UPWIND BIOMASS FIRE CLUSTERS
            </h3>
            <span className="text-[10px] font-mono text-amber-400">5 ACTIVE CLUSTERS</span>
          </div>

          <div className="space-y-2.5">
            {SMOKE_CLUSTERS.map((cl) => {
              const isSelected = selectedCluster.id === cl.id;
              return (
                <div
                  key={cl.id}
                  onClick={() => {
                    setSelectedCluster(cl);
                    setTimelineHour(cl.plumeEtaHours);
                  }}
                  className={`p-3.5 border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                      : 'bg-black/50 border-white/10 hover:border-white/25'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-white tracking-wide">
                          {cl.district}, {cl.state}
                        </span>
                        <span className="px-1.5 py-0.5 bg-red-600/30 border border-red-500/40 text-red-400 text-[9px] font-mono font-bold">
                          {cl.activeFires} Fires
                        </span>
                      </div>
                      <p className="text-[10px] text-white/60 mt-1">{cl.trajectoryAngle}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-amber-400 font-mono">
                        {cl.contributionPct}%
                      </div>
                      <span className="text-[9px] font-mono text-white/50">
                        ETA: {cl.plumeEtaHours}h
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chemical Tracer Signatures */}
          <div className="bg-[#0f0f0f] border border-white/10 p-4 space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              BIOMASS CHEMICAL TRACER DIAGNOSTICS
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-black/60 p-2.5 border border-white/10">
                <span className="text-[9px] text-white/50 block uppercase">Levoglucosan Tracer</span>
                <span className="font-bold text-amber-400 font-mono text-sm">3.42 µg/m³</span>
                <span className="text-[8px] text-white/40 block mt-0.5">Cellulose pyrolysis biomarker</span>
              </div>
              <div className="bg-black/60 p-2.5 border border-white/10">
                <span className="text-[9px] text-white/50 block uppercase">Potassium (K⁺) Ion</span>
                <span className="font-bold text-amber-400 font-mono text-sm">4.81 µg/m³</span>
                <span className="text-[8px] text-white/40 block mt-0.5">Crop residue combustion fingerprint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Trajectory & Altitude Dispersion Profile (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Visual Plume Simulation Box */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-400" />
                  AIRSHED DISPERSION & INVERSION PROFILE
                </h3>
                <span className="text-[10px] text-white/60">
                  Tracking origin: {selectedCluster.district} ➔ Target: Delhi-NCR
                </span>
              </div>

              <span className="text-[9px] font-mono bg-white/10 text-white px-2 py-1 uppercase">
                WIND: NW @ {windSpeedKmh} KM/H
              </span>
            </div>

            {/* Visual Atmospheric Layer Simulation Diagram */}
            <div className="bg-black/90 border border-white/10 p-4 rounded-lg space-y-4 relative overflow-hidden">
              <div className="text-[9px] font-mono text-white/40 uppercase tracking-widest flex justify-between">
                <span>PUNJAB / HARYANA (UPWIND)</span>
                <span>INDO-GANGETIC CORRIDOR</span>
                <span>DELHI-NCR BASIN</span>
              </div>

              {/* Altitude Layers */}
              <div className="space-y-3 relative">
                {/* 1. Free Troposphere (>800m) */}
                <div className="h-14 bg-blue-950/20 border border-blue-500/20 rounded p-2 flex items-center justify-between text-[10px] text-blue-300">
                  <span>Free Troposphere (&gt;800m)</span>
                  <span className="text-[9px] font-mono">Clean Upper Atmosphere</span>
                </div>

                {/* 2. Plume Transport Altitude (350m - 700m) */}
                <div className="h-16 bg-amber-950/40 border border-amber-500/40 rounded p-2.5 flex items-center justify-between text-xs text-amber-300 relative overflow-hidden">
                  <div className="relative z-10">
                    <span className="font-bold block">Advective Smoke Transport Layer (450m)</span>
                    <span className="text-[10px] text-white/70">
                      Plume speed: ~{windSpeedKmh} km/h (North-Westerly Jet)
                    </span>
                  </div>

                  {/* Animated Smoke Wave */}
                  <div
                    className="absolute inset-y-0 bg-gradient-to-r from-amber-600/40 via-orange-600/60 to-red-600/50 transition-all duration-300"
                    style={{
                      left: '0%',
                      width: `${Math.min(100, (timelineHour / selectedCluster.plumeEtaHours) * 100)}%`,
                    }}
                  ></div>
                  <Flame className="w-5 h-5 text-amber-400 relative z-10 animate-bounce" />
                </div>

                {/* 3. Nocturnal Thermal Inversion Lid (Ground to 280m) */}
                <div className="h-20 bg-red-950/50 border-2 border-red-500/60 rounded p-2.5 flex items-center justify-between text-xs text-red-300 relative">
                  <div>
                    <span className="font-black block uppercase text-red-400">
                      🔒 Planetary Boundary Layer Inversion Trap (&lt; 280m)
                    </span>
                    <span className="text-[10px] text-white/80">
                      Surface radiational cooling seals smoke tightly over Delhi residential wards.
                    </span>
                  </div>
                  <span className="text-[9px] font-black bg-red-600 text-white px-2 py-1 uppercase">
                    NO ESCAPE VENT
                  </span>
                </div>
              </div>

              {/* Progress Tracker Footer */}
              <div className="flex items-center justify-between text-[10px] font-mono text-white/60 pt-1">
                <span>Ignition (T-0h)</span>
                <span className="text-amber-400 font-bold">
                  {timelineHour >= selectedCluster.plumeEtaHours
                    ? `Plume Trapped in Delhi Basin (Severity Peak)`
                    : `In-Flight: ${Math.round((timelineHour / selectedCluster.plumeEtaHours) * 100)}% Progress`}
                </span>
                <span>Delhi Impact (T+{selectedCluster.plumeEtaHours}h)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
