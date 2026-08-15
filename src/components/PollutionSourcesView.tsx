import React, { useState } from 'react';
import {
  PieChart,
  Car,
  Flame,
  Factory,
  Building2,
  Trees,
  FlaskConical,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { MonitoringStation, ChemicalTracer } from '../types';
import { CHEMICAL_TRACERS } from '../data/mockData';

interface PollutionSourcesViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
}

export const PollutionSourcesView: React.FC<PollutionSourcesViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
}) => {
  const sources = [
    {
      name: 'Vehicles & Transport',
      percentage: selectedStation.sources.vehicles,
      color: 'text-red-500',
      barColor: 'bg-red-500',
      icon: Car,
      desc: 'Tailpipe emissions, unburned hydrocarbons, diesel exhaust particulates (PM2.5 & EC)',
      primaryTracers: 'NOx, Elemental Carbon (EC), Hopanes',
      dailyTons: '185 TONS/DAY',
    },
    {
      name: 'Stubble & Agricultural Burning',
      percentage: selectedStation.sources.stubble,
      color: 'text-orange-500',
      barColor: 'bg-orange-500',
      icon: Flame,
      desc: 'Transboundary biomass smoke advection from Punjab/Haryana paddy burning clusters',
      primaryTracers: 'Levoglucosan, Potassium (K+), Mannosan',
      dailyTons: '120 TONS/DAY',
    },
    {
      name: 'Industrial Units & Power Plants',
      percentage: selectedStation.sources.industry,
      color: 'text-yellow-500',
      barColor: 'bg-yellow-500',
      icon: Factory,
      desc: 'Brick kilns, industrial boilers, fly ash, secondary sulfate aerosol generation',
      primaryTracers: 'Sulfate (SO42-), Selenium (Se), Arsenic (As)',
      dailyTons: '74 TONS/DAY',
    },
    {
      name: 'Construction & Road Dust',
      percentage: selectedStation.sources.construction,
      color: 'text-emerald-500',
      barColor: 'bg-emerald-500',
      icon: Building2,
      desc: 'Re-suspended mineral dust from unpaved roads, excavation, building construction',
      primaryTracers: 'Silicon (Si), Aluminum (Al), Calcium (Ca)',
      dailyTons: '95 TONS/DAY',
    },
    {
      name: 'Domestic & Biomass Fuel',
      percentage: selectedStation.sources.biomass,
      color: 'text-sky-500',
      barColor: 'bg-sky-500',
      icon: Trees,
      desc: 'Open municipal solid waste incineration, wood/dung stoves, local biomass',
      primaryTracers: 'Polycyclic Aromatic Hydrocarbons (PAHs)',
      dailyTons: '32 TONS/DAY',
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase opacity-50 text-white">
            RECEPTOR MODELING / PMF 5.0 SPECIATION
          </h1>
          <p className="text-2xl font-black tracking-tighter text-white">
            POLLUTION SOURCE APPORTIONMENT
          </p>
        </div>

        {/* Station Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
            TARGET NODE:
          </span>
          <div className="relative">
            <select
              value={selectedStation.id}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="bg-white text-black text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-none border border-white appearance-none pr-7 cursor-pointer focus:outline-none"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id} className="bg-black text-white font-mono">
                  {st.name} ({st.aqi} AQI)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-black absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Source Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white">
              SOURCE BREAKDOWN / {selectedStation.name.toUpperCase()}
            </h3>
            <span className="text-xs font-mono font-bold text-red-500">
              PM2.5: {selectedStation.pm25} µg/m³
            </span>
          </div>

          <div className="space-y-3">
            {sources.map((src) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.name}
                  className="bg-[#0f0f0f] border border-white/10 p-4 hover:border-white/25 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-black border border-white/15 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {src.name}
                        </h4>
                        <span className="text-[11px] opacity-60 text-white leading-tight block">
                          {src.desc}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-black ${src.color} leading-none tracking-tighter`}>
                        {src.percentage}%
                      </div>
                      <span className="text-[9px] font-mono opacity-50 uppercase text-white">
                        {src.dailyTons}
                      </span>
                    </div>
                  </div>

                  {/* High Contrast Progress Bar */}
                  <div className="w-full bg-black h-2 overflow-hidden border border-white/10">
                    <div
                      className={`h-full ${src.barColor}`}
                      style={{ width: `${src.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider opacity-60 text-white pt-1 border-t border-white/5">
                    <span>Tracers: {src.primaryTracers}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chemical Speciation & Fingerprints (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-red-500" />
              CHEMICAL TRACER SPECTROMETRY
            </h3>
            <p className="text-[11px] opacity-70 leading-snug text-white">
              Filter-based speciation from CAQM, IIT Delhi & CPCB reference laboratories.
            </p>

            <div className="space-y-2 mt-3">
              {CHEMICAL_TRACERS.map((tracer) => (
                <div
                  key={tracer.chemical}
                  className="bg-black border border-white/10 p-3 space-y-1"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-black text-white uppercase tracking-tight">
                      {tracer.chemical}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 tracking-widest ${
                        tracer.status === 'Critical'
                          ? 'bg-red-600 text-white'
                          : 'bg-yellow-500 text-black'
                      }`}
                    >
                      {tracer.status}
                    </span>
                  </div>

                  <div className="text-[10px] opacity-60 uppercase text-white">
                    <span>Fingerprint: </span>
                    <strong className="text-white opacity-100">{tracer.tracerFor}</strong>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono font-bold pt-1 text-white/70 border-t border-white/5">
                    <span>MEASURED: <strong className="text-red-400">{tracer.concentration}</strong></span>
                    <span>LIMIT: {tracer.standardLimit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diurnal Inversion Notice */}
          <div className="bg-white/5 border-l-4 border-red-600 p-4 space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-500" />
              NOCTURNAL BOUNDARY LAYER COLLAPSE
            </h4>
            <p className="text-xs text-white/80 leading-relaxed">
              Vehicular and stubble particulate plumes surge between <strong>22:00 IST and 06:00 IST</strong> due to boundary layer height compressing below 350m.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
