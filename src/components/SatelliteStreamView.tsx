import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Radio,
  Activity,
  Zap,
  Flame,
  Wind,
  Layers,
  Clock,
  ShieldCheck,
  RefreshCw,
  Play,
  Pause,
  ChevronRight,
  Eye,
  Crosshair,
} from 'lucide-react';
import { MonitoringStation, SatelliteFeedInfo } from '../types';
import { SATELLITE_CONSTELLATIONS } from '../data/mockData';

interface SatelliteStreamViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  isLiveStreaming: boolean;
  onToggleStreaming: () => void;
  livePacketCount: number;
  liveAod: number;
  activeSatellite: string;
}

export const SatelliteStreamView: React.FC<SatelliteStreamViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  isLiveStreaming,
  onToggleStreaming,
  livePacketCount,
  liveAod,
  activeSatellite,
}) => {
  const [satellites, setSatellites] = useState<SatelliteFeedInfo[]>(SATELLITE_CONSTELLATIONS);
  const [selectedSat, setSelectedSat] = useState<SatelliteFeedInfo>(SATELLITE_CONSTELLATIONS[0]);
  const [telemetryTick, setTelemetryTick] = useState(0);

  // Local second-by-second ticker
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setTelemetryTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header Banner with Live Satellite Radar */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-black tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              LIVE 1-SEC TELEMETRY INGRESS
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              ORBITAL CONSTELLATION: NASA / COPERNICUS / ISRO
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            REAL-TIME SATELLITE POLLUTION STREAM
          </h1>
          <p className="text-xs text-white/70 max-w-2xl mt-0.5">
            Continuous sub-second telemetry ingestion from earth observation satellites measuring Aerosol Optical Depth (AOD), Tropospheric NO₂ columns, and thermal farm fire radiance across Delhi-NCR airshed.
          </p>
        </div>

        {/* Live Controls */}
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={onToggleStreaming}
            className={`px-4 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-wider border transition-all ${
              isLiveStreaming
                ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                : 'bg-white text-black border-white hover:bg-gray-200'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>RESUME 1-SEC STREAM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Top Telemetry Ingress Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#0f0f0f] border border-white/10 p-3.5 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-white">
            PACKET INGRESS
          </span>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {(3420 + (livePacketCount % 450)).toLocaleString()} <span className="text-xs text-white/50">PKT/S</span>
          </div>
          <div className="text-[10px] font-mono text-white/50 flex items-center gap-1">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            100% Ingress Latency (12ms)
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 p-3.5 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-white">
            ACTIVE SCAN SENSOR
          </span>
          <div className="text-base font-black font-mono text-white tracking-tight truncate">
            {activeSatellite || 'SENTINEL-5P (TROPOMI)'}
          </div>
          <div className="text-[10px] font-mono text-cyan-400">
            Pass: Sun-Synchronous (850 hPa)
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 p-3.5 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-white">
            DELHI AIRSHED AOD
          </span>
          <div className="text-2xl font-black font-mono text-red-400 tracking-tight">
            {liveAod.toFixed(2)} <span className="text-xs text-white/50">AOD (550nm)</span>
          </div>
          <div className="text-[10px] font-mono text-red-500">
            Critical Aerosol Burden (Std: &lt;0.3)
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-white/10 p-3.5 space-y-1">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 text-white">
            THERMAL HOTSPOTS
          </span>
          <div className="text-2xl font-black font-mono text-orange-400 tracking-tight">
            23 <span className="text-xs text-white/50">FIRE CLUSTERS</span>
          </div>
          <div className="text-[10px] font-mono text-orange-400 flex items-center gap-1">
            <Flame className="w-3 h-3" />
            Plume Vector: 315° NW → SE
          </div>
        </div>
      </div>

      {/* 3. Main Grid: Constellation Satellites & Live Station Micro-Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Satellite Feeds (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-cyan-400" />
              SATELLITE SENSORS IN CONSTELLATION
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">4 SENSORS ACTIVE</span>
          </div>

          <div className="space-y-3">
            {satellites.map((sat) => {
              const isSelected = selectedSat.id === sat.id;
              return (
                <div
                  key={sat.id}
                  onClick={() => setSelectedSat(sat)}
                  className={`p-4 border cursor-pointer transition-all space-y-2 ${
                    isSelected
                      ? 'bg-[#141414] border-white'
                      : 'bg-[#0f0f0f] border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black font-mono px-1.5 py-0.5 bg-white/10 text-white tracking-widest uppercase">
                          {sat.agency}
                        </span>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {sat.name}
                        </h4>
                      </div>
                      <p className="text-[11px] text-white/60 mt-0.5">{sat.sensor}</p>
                    </div>

                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold tracking-widest uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      STREAMING
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-2 border-t border-white/5 text-white/70">
                    <div>
                      <span className="opacity-50">RESOLUTION:</span> {sat.swathResolution}
                    </div>
                    <div>
                      <span className="opacity-50">ORBIT:</span> {sat.orbitType}
                    </div>
                    <div>
                      <span className="opacity-50">AOD (550nm):</span>{' '}
                      <strong className="text-red-400">{sat.aodMeasurement}</strong>
                    </div>
                    <div>
                      <span className="opacity-50">NO₂ COLUMN:</span> {sat.no2ColumnDensity}
                    </div>
                  </div>

                  <div className="text-[9px] font-mono text-cyan-400 pt-1 flex items-center justify-between">
                    <span>SMOKE ADVECTION: {sat.smokePlumeVector}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Satellite Spectrometry Inspector Box */}
          <div className="bg-[#0f0f0f] border border-white/10 p-4 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-red-500" />
              {selectedSat.name} SPECTRORADIOMETER SPECS
            </h4>
            <div className="space-y-1.5 text-xs text-white/80 font-mono">
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="opacity-50">Aerosol Optical Depth (AOD):</span>
                <span className="text-red-400 font-bold">{selectedSat.aodMeasurement}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="opacity-50">Tropospheric NO₂ Column:</span>
                <span className="text-white font-bold">{selectedSat.no2ColumnDensity}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="opacity-50">Carbon Monoxide (CO) Column:</span>
                <span className="text-white font-bold">{selectedSat.carbonMonoxideColumn}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span className="opacity-50">Last Pass Time (IST):</span>
                <span className="text-cyan-400 font-bold">{selectedSat.passTimeIst}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="opacity-50">Sub-second Packet Health:</span>
                <span className="text-emerald-400 font-bold">0.00% Packet Loss</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Station Micro-Telemetry Stream (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500" />
              SECOND-BY-SECOND STATION TELEMETRY FEED (12 NODES)
            </h3>
            <span className="text-xs font-mono text-white/60">
              UPDATED: {new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stations.map((st) => {
              const isSelected = selectedStation.id === st.id;
              // Add slight second-by-second micro delta for visual live realism
              const jitter = Number((Math.sin((telemetryTick + st.lat * 100)) * 0.4).toFixed(1));
              const liveAqi = Math.round(st.aqi + jitter);
              const livePm25 = Math.round(st.pm25 + jitter * 0.6);

              return (
                <div
                  key={st.id}
                  onClick={() => onSelectStation(st)}
                  className={`p-3.5 border cursor-pointer transition-all space-y-2 relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#141414] border-white ring-1 ring-white'
                      : 'bg-[#0f0f0f] border-white/10 hover:border-white/30'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-red-600"></div>
                  )}

                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">
                        {st.name}
                      </h4>
                      <span className="text-[10px] font-mono text-white/50 uppercase">
                        {st.district}, {st.state}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-red-500 leading-none">
                        {liveAqi}
                      </div>
                      <span className="text-[9px] font-mono uppercase text-white/50">AQI</span>
                    </div>
                  </div>

                  {/* Micro telemetry bars */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono pt-1.5 border-t border-white/5 text-white/80">
                    <div className="bg-black/60 p-1.5 border border-white/5">
                      <span className="text-[9px] opacity-50 block">PM2.5</span>
                      <strong className="text-red-400">{livePm25}</strong> µg
                    </div>
                    <div className="bg-black/60 p-1.5 border border-white/5">
                      <span className="text-[9px] opacity-50 block">PM10</span>
                      <strong>{st.pm10}</strong> µg
                    </div>
                    <div className="bg-black/60 p-1.5 border border-white/5">
                      <span className="text-[9px] opacity-50 block">AOD SAT</span>
                      <strong className="text-cyan-400">{(liveAod - 0.02 + (st.lat % 0.05)).toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-white/50 pt-1">
                    <span>PBL: {st.pblHeight}m</span>
                    <span>WIND: {st.windSpeed} km/h {st.windDir}</span>
                    <span className="text-emerald-400">● 1s SYNC</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ground Sensor & Satellite Calibration Notes */}
          <div className="bg-white/5 border-l-4 border-cyan-500 p-4 space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              GROUND-TO-SATELLITE RADIATIVE TRANSFER MODELING
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Real-time synchronization pairs CPCB Continuous Ambient Air Quality Monitoring Stations (CAAQMS) with NASA VIIRS and Sentinel-5P TROPOMI radiance pixels via the MODTRAN 6 radiative transfer code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
