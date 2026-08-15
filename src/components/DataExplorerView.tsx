import React, { useState } from 'react';
import {
  Database,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  Activity,
  MapPin,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { MonitoringStation } from '../types';
import { getAqiCategory } from '../lib/utils';

interface DataExplorerViewProps {
  stations: MonitoringStation[];
  onSelectStation: (station: MonitoringStation) => void;
  onOpenStationDetail: (station: MonitoringStation) => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({
  stations,
  onSelectStation,
  onOpenStationDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'aqi' | 'pm25' | 'pm10' | 'name'>('aqi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: 'aqi' | 'pm25' | 'pm10' | 'name') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const filteredStations = stations
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.state.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesState = stateFilter === 'all' || s.state === stateFilter;
      const matchesSeverity =
        severityFilter === 'all' ||
        (severityFilter === 'severe' && s.aqi >= 300) ||
        (severityFilter === 'moderate' && s.aqi < 300);
      return matchesSearch && matchesState && matchesSeverity;
    })
    .sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') {
        return sortOrder === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }
      return sortOrder === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  const avgAqi = Math.round(stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length);
  const avgPm25 = Math.round(stations.reduce((sum, s) => sum + s.pm25, 0) / stations.length);
  const severeCount = stations.filter((s) => s.aqi >= 300).length;
  const maxHotspot = [...stations].sort((a, b) => b.aqi - a.aqi)[0];

  const exportCsv = () => {
    const headers =
      'Station ID,Station Name,District,State,AQI,Category,PM2.5 (ug/m3),PM10 (ug/m3),NO2 (ppb),SO2 (ppb),CO (ppm),O3 (ppb),Temp (C),Humidity (%),PBL Height (m)\n';
    const rows = stations
      .map(
        (s) =>
          `"${s.id}","${s.name}","${s.district}","${s.state}",${s.aqi},"${s.category}",${s.pm25},${s.pm10},${s.no2},${s.so2},${s.co},${s.o3},${s.temp},${s.humidity},${s.pblHeight}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delhi_ncr_caa_telemetry_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJson = () => {
    const dataStr = JSON.stringify(stations, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delhi_ncr_caa_telemetry_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50 text-white">
              CPCB / DPCC / HSPCB / UPPCB AIRSHED REPOSITORY
            </span>
            <span className="px-1.5 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[9px] font-black uppercase">
              10 LIVE CAAQMS NODES
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1 flex items-center gap-2">
            <Database className="w-6 h-6 text-cyan-400" />
            CAAQMS TELEMETRY & DATA EXPLORER
          </h1>
          <p className="text-xs text-white/70 max-w-2xl mt-0.5">
            Continuous Ambient Air Quality Monitoring Systems raw chemical speciation, particulate fractions, and boundary layer thermodynamics across Delhi-NCR.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={exportJson}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/10 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Strip (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#050505] border border-white/10 p-3.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/50">REGIONAL MEAN AQI</div>
          <div className="text-2xl font-black font-mono text-red-400 mt-1">{avgAqi}</div>
          <div className="text-[10px] text-white/60 mt-0.5">10 synchronized stations</div>
        </div>

        <div className="bg-[#050505] border border-white/10 p-3.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/50">MEAN PM2.5 DENSITY</div>
          <div className="text-2xl font-black font-mono text-orange-400 mt-1">{avgPm25} <span className="text-xs text-white/50">µg/m³</span></div>
          <div className="text-[10px] text-white/60 mt-0.5">3.0x above 24h standard</div>
        </div>

        <div className="bg-[#050505] border border-white/10 p-3.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/50">SEVERE NODES (AQI ≥ 300)</div>
          <div className="text-2xl font-black font-mono text-purple-400 mt-1">{severeCount} <span className="text-xs text-white/50">/ {stations.length}</span></div>
          <div className="text-[10px] text-white/60 mt-0.5">Under GRAP Stage III mandate</div>
        </div>

        <div className="bg-[#050505] border border-white/10 p-3.5">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/50">MAX CRITICAL HOTSPOT</div>
          <div className="text-lg font-black text-white truncate mt-1">{maxHotspot.name}</div>
          <div className="text-[10px] text-red-400 font-mono font-bold mt-0.5">{maxHotspot.aqi} AQI • PM2.5 {maxHotspot.pm25} µg/m³</div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-[#050505] border border-white/10 p-4 sm:p-5 space-y-4">
        {/* Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search station, district, state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#111] border border-white/20 text-xs text-white pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* State filter buttons */}
            <div className="flex items-center gap-1">
              {['all', 'Delhi', 'Haryana', 'Uttar Pradesh'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStateFilter(st)}
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                    stateFilter === st
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {st === 'all' ? 'All States' : st}
                </button>
              ))}
            </div>

            {/* Severity Filter */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSeverityFilter(severityFilter === 'severe' ? 'all' : 'severe')}
                className={`px-2.5 py-1 text-[11px] font-bold uppercase transition-colors ${
                  severityFilter === 'severe'
                    ? 'bg-red-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Severe Only (≥300)
              </button>
            </div>
          </div>

          <span className="text-[11px] text-white/50 font-mono">
            Showing {filteredStations.length} of {stations.length} active stations
          </span>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#0a0a0a] text-white/60 uppercase text-[10px] tracking-wider border-b border-white/10 font-mono">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Station / Airshed</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3">District / State</th>
                <th
                  onClick={() => handleSort('aqi')}
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>AQI</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pm25')}
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PM2.5</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pm10')}
                  className="py-3 px-3 cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>PM10</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-3 text-right">NO₂</th>
                <th className="py-3 px-3 text-right">SO₂</th>
                <th className="py-3 px-3 text-right">CO</th>
                <th className="py-3 px-3 text-right">PBL Height</th>
                <th className="py-3 px-3 text-right">Wind</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-white/80">
              {filteredStations.map((st) => {
                const cat = getAqiCategory(st.aqi);
                return (
                  <tr
                    key={st.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => {
                      onSelectStation(st);
                      onOpenStationDetail(st);
                    }}
                  >
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      ></span>
                      <span className="truncate">{st.name}</span>
                    </td>
                    <td className="py-3 px-3 font-sans text-white/60">
                      {st.district}, {st.state}
                    </td>
                    <td className={`py-3 px-3 text-right font-black text-sm ${cat.textColor}`}>
                      {st.aqi}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-orange-400">
                      {st.pm25} µg/m³
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-400">
                      {st.pm10} µg/m³
                    </td>
                    <td className="py-3 px-3 text-right text-white/60">{st.no2} ppb</td>
                    <td className="py-3 px-3 text-right text-white/60">{st.so2} ppb</td>
                    <td className="py-3 px-3 text-right text-white/60">{st.co} ppm</td>
                    <td className="py-3 px-3 text-right text-cyan-400 font-bold">{st.pblHeight}m</td>
                    <td className="py-3 px-3 text-right text-white/60">{st.windSpeed} km/h {st.windDir}</td>
                    <td className="py-3 px-3 text-center font-sans" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          onSelectStation(st);
                          onOpenStationDetail(st);
                        }}
                        className="px-2 py-1 bg-white/10 hover:bg-white text-white hover:text-black text-[10px] font-black uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
