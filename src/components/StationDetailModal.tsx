import React from 'react';
import {
  X,
  MapPin,
  Wind,
  Droplets,
  Thermometer,
  Layers,
  Activity,
  Car,
  Flame,
  Factory,
  Building2,
  Trees,
  TrendingUp,
  Brain,
} from 'lucide-react';
import { MonitoringStation } from '../types';
import { getAqiCategory } from '../lib/utils';

interface StationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: MonitoringStation | null;
  onOpenForecastReasoning: (station: MonitoringStation) => void;
}

export const StationDetailModal: React.FC<StationDetailModalProps> = ({
  isOpen,
  onClose,
  station,
  onOpenForecastReasoning,
}) => {
  if (!isOpen || !station) return null;

  const aqiInfo = getAqiCategory(station.aqi);

  const pollutants = [
    { name: 'PM2.5', value: `${station.pm25} µg/m³`, limit: '60 µg/m³', status: 'Severe' },
    { name: 'PM10', value: `${station.pm10} µg/m³`, limit: '100 µg/m³', status: 'Severe' },
    { name: 'NO2 (Nitrogen Dioxide)', value: `${station.no2} ppb`, limit: '80 ppb', status: 'Moderate' },
    { name: 'SO2 (Sulfur Dioxide)', value: `${station.so2} ppb`, limit: '80 ppb', status: 'Good' },
    { name: 'CO (Carbon Monoxide)', value: `${station.co} ppm`, limit: '2.0 ppm', status: 'Moderate' },
    { name: 'O3 (Ozone 8h)', value: `${station.o3} ppb`, limit: '100 ppb', status: 'Good' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a111e]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-white text-lg"
              style={{ backgroundColor: aqiInfo.color }}
            >
              {station.aqi}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {station.name}
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${aqiInfo.color}25`,
                    color: aqiInfo.color,
                  }}
                >
                  {station.category}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {station.district}, {station.state} • Coordinates: {station.lat.toFixed(2)}°N, {station.lng.toFixed(2)}°E
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Weather & Boundary Layer */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#080d17] border border-slate-800/80 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Temperature</span>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {station.temp}°C
              </div>
            </div>

            <div className="bg-[#080d17] border border-slate-800/80 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Relative Humidity</span>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {station.humidity}%
              </div>
            </div>

            <div className="bg-[#080d17] border border-slate-800/80 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Surface Wind</span>
              <div className="text-base font-bold font-mono text-slate-200 mt-0.5">
                {station.windDir} ({station.windSpeed} km/h)
              </div>
            </div>

            <div className="bg-[#080d17] border border-slate-800/80 p-3 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Mixing Layer (PBL)</span>
              <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                {station.pblHeight} m
              </div>
            </div>
          </div>

          {/* Full Pollutant Concentration Breakdown */}
          <div className="bg-[#080d17] border border-slate-800/80 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Real-time Pollutant Speciation vs National Ambient Air Quality Standards (NAAQS)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {pollutants.map((p) => (
                <div
                  key={p.name}
                  className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{p.name}</span>
                    <span className="text-[10px] text-slate-500">Standard 24h: {p.limit}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-100">{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Source Contributions */}
          <div className="bg-[#080d17] border border-slate-800/80 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Receptor Source Apportionment Share
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-300">Vehicles & Road Transport</span>
                <span className="font-mono font-bold text-red-400">{station.sources.vehicles}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Transboundary Stubble Burning (Punjab/Haryana)</span>
                <span className="font-mono font-bold text-orange-400">{station.sources.stubble}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Industrial Stacks & Boilers</span>
                <span className="font-mono font-bold text-amber-400">{station.sources.industry}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Construction & Resuspended Dust</span>
                <span className="font-mono font-bold text-green-400">{station.sources.construction}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Waste & Domestic Biomass</span>
                <span className="font-mono font-bold text-blue-400">{station.sources.biomass}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a111e] flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenForecastReasoning(station);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all"
          >
            <Brain className="w-4 h-4" />
            <span>Launch AI Forecast Reasoning</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
