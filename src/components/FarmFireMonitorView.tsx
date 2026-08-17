import React, { useState } from 'react';
import {
  Flame,
  Satellite,
  Wind,
  MapPin,
  Calendar,
  Layers,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Info,
  ShieldAlert,
} from 'lucide-react';
import { FarmFireHotspot } from '../types';

interface FarmFireMonitorViewProps {
  farmFires: FarmFireHotspot[];
}

export const FarmFireMonitorView: React.FC<FarmFireMonitorViewProps> = ({ farmFires }) => {
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedSensor, setSelectedSensor] = useState<string>('all');

  const filteredFires = farmFires.filter((f) => {
    const matchState = selectedState === 'all' || f.state === selectedState;
    const matchSensor = selectedSensor === 'all' || f.satellite === selectedSensor;
    return matchState && matchSensor;
  });

  const totalFires = farmFires.length;
  const punjabFires = farmFires.filter((f) => f.state === 'Punjab').length;
  const haryanaFires = farmFires.filter((f) => f.state === 'Haryana').length;
  const upFires = farmFires.filter((f) => f.state === 'UP').length;

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#0e1626] border border-slate-800 p-4 sm:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Satellite Farm Fire & Stubble Burning Telemetry (NASA VIIRS / MODIS)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time thermal anomaly detection & HYSPLIT transboundary smoke transport vectors into the Delhi-NCR airshed
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold">
            <Satellite className="w-4 h-4" />
            <span>FIRMS Near-Real-Time Stream</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#0a111e] border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Total Active Fires Today</span>
          <div className="text-2xl font-bold font-mono text-orange-400 flex items-center gap-2">
            {totalFires}
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></span>
          </div>
          <span className="text-[10px] text-slate-500">Updated 45 mins ago</span>
        </div>

        <div className="bg-[#0a111e] border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Punjab Clusters</span>
          <div className="text-2xl font-bold font-mono text-red-400">{punjabFires}</div>
          <span className="text-[10px] text-red-400 font-medium">Dominant smoke contributor</span>
        </div>

        <div className="bg-[#0a111e] border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">Haryana Clusters</span>
          <div className="text-2xl font-bold font-mono text-amber-400">{haryanaFires}</div>
          <span className="text-[10px] text-amber-300">↓ 35% vs 2024</span>
        </div>

        <div className="bg-[#0a111e] border border-slate-800 p-3.5 rounded-xl space-y-1">
          <span className="text-xs text-slate-400">NCR PM2.5 Inflow Share</span>
          <div className="text-2xl font-bold font-mono text-purple-400">28.4%</div>
          <span className="text-[10px] text-purple-300">Via NW Winds (5.4 km/h)</span>
        </div>
      </div>

      {/* Filter and Telemetry Table */}
      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-400" />
            Detected Thermal Anomaly Hotspots ({filteredFires.length})
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="all">All States</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="UP">Western UP</option>
            </select>

            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="all">All Satellites</option>
              <option value="VIIRS (Suomi-NPP)">VIIRS (Suomi-NPP)</option>
              <option value="MODIS (Terra/Aqua)">MODIS (Aqua/Terra)</option>
            </select>
          </div>
        </div>

        {/* Hotspots Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080d17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">State & District</th>
                <th className="py-2.5 px-3">Coordinates</th>
                <th className="py-2.5 px-3">Fire Radiative Power (FRP)</th>
                <th className="py-2.5 px-3">Brightness Temp</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Satellite Instrument</th>
                <th className="py-2.5 px-3">Detection Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredFires.map((fire) => (
                <tr key={fire.id} className="hover:bg-slate-850/50 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-white flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    {fire.district}, {fire.state}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {fire.lat.toFixed(2)}°N, {fire.lng.toFixed(2)}°E
                  </td>
                  <td className="py-2.5 px-3 text-orange-400 font-bold">
                    {fire.frp} MW
                  </td>
                  <td className="py-2.5 px-3 text-amber-300">
                    {fire.brightness} K
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {fire.confidence}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">
                    {fire.satellite}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {fire.detectedAt}
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
