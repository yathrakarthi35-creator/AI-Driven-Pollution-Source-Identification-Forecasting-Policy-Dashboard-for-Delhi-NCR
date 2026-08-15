import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  Wind,
  Layers,
  Search,
  Filter,
  Eye,
  Activity,
  Compass,
  Download,
  Maximize2,
} from 'lucide-react';
import { MonitoringStation, FarmFireHotspot } from '../types';
import { AirQualityMap } from './AirQualityMap';
import { getAqiCategory } from '../lib/utils';

interface GisMapViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  farmFires: FarmFireHotspot[];
  onOpenStationDetail: (station: MonitoringStation) => void;
}

export const GisMapView: React.FC<GisMapViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  onOpenStationDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');

  const filteredStations = stations.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || s.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesState = stateFilter === 'all' || s.state === stateFilter;
    return matchesSearch && matchesCategory && matchesState;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0e1626] border border-slate-800 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            Delhi-NCR Geospatial Information System (GIS)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spatial airshed interpolation, CAAQMS sensor telemetry & satellite farm fire dispersion vectors
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search station / district..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-emerald-500 w-44 sm:w-52"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All AQI Levels</option>
            <option value="very poor">Very Poor (301-400)</option>
            <option value="poor">Poor (201-300)</option>
            <option value="moderate">Moderate (101-200)</option>
          </select>

          {/* State Filter */}
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All States</option>
            <option value="Delhi">Delhi NCT</option>
            <option value="Haryana">Haryana (NCR)</option>
            <option value="Uttar Pradesh">UP (NCR)</option>
          </select>
        </div>
      </div>

      {/* Main Map Component with Full Height */}
      <AirQualityMap
        stations={filteredStations}
        selectedStation={selectedStation}
        onSelectStation={onSelectStation}
        farmFires={farmFires}
        onOpenStationDetail={onOpenStationDetail}
        fullHeight={true}
      />

      {/* Quick Station Grid Bar */}
      <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-4">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
          <span>Active Monitoring Stations ({filteredStations.length})</span>
          <span className="text-[11px] text-slate-500 font-normal">Click any node to focus inspection</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {filteredStations.map((st) => {
            const isSelected = selectedStation?.id === st.id;
            const aqiInfo = getAqiCategory(st.aqi);

            return (
              <button
                key={st.id}
                onClick={() => onSelectStation(st)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white truncate">{st.name}</span>
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: aqiInfo.color }}
                  ></span>
                </div>
                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-[10px] text-slate-400">{st.state}</span>
                  <span
                    className={`text-sm font-bold font-mono ${aqiInfo.textColor}`}
                  >
                    {st.aqi}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
