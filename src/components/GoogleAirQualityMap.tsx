import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  Wind,
  Flame,
  Layers,
  MapPin,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Key,
  CheckCircle2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { MonitoringStation, FarmFireHotspot } from '../types';
import { getAqiCategory } from '../lib/utils';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

export const hasGoogleMapsKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.trim().length > 5;

// Delhi-NCR Airshed Center Coordinates
const DELHI_CENTER = { lat: 28.6139, lng: 77.209 };

// Atmospheric Dark Style for Google Maps
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0b101b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b101b' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#74889c' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f1f1d' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#071322' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#38bdf8' }],
  },
];

// Simulated Wind Vector Grid for Delhi-NCR Airshed
interface WindVectorPoint {
  id: string;
  lat: number;
  lng: number;
  speedKmh: number;
  directionDeg: number;
  directionLabel: string;
  gustKmh: number;
}

const WIND_VECTORS_DATA: WindVectorPoint[] = [
  { id: 'w1', lat: 28.75, lng: 77.10, speedKmh: 18.4, directionDeg: 315, directionLabel: 'NW', gustKmh: 24.2 },
  { id: 'w2', lat: 28.70, lng: 77.25, speedKmh: 16.2, directionDeg: 320, directionLabel: 'NW', gustKmh: 22.0 },
  { id: 'w3', lat: 28.65, lng: 77.05, speedKmh: 19.1, directionDeg: 310, directionLabel: 'NW', gustKmh: 26.5 },
  { id: 'w4', lat: 28.60, lng: 77.20, speedKmh: 14.5, directionDeg: 305, directionLabel: 'WNW', gustKmh: 19.8 },
  { id: 'w5', lat: 28.55, lng: 77.35, speedKmh: 13.8, directionDeg: 315, directionLabel: 'NW', gustKmh: 18.0 },
  { id: 'w6', lat: 28.48, lng: 77.08, speedKmh: 15.6, directionDeg: 300, directionLabel: 'WNW', gustKmh: 21.4 },
  { id: 'w7', lat: 28.45, lng: 77.30, speedKmh: 12.4, directionDeg: 310, directionLabel: 'NW', gustKmh: 17.5 },
  { id: 'w8', lat: 28.68, lng: 77.40, speedKmh: 11.8, directionDeg: 325, directionLabel: 'NW', gustKmh: 16.2 },
];

interface GoogleAirQualityMapProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  farmFires: FarmFireHotspot[];
  onOpenStationDetail: (station: MonitoringStation) => void;
  fullHeight?: boolean;
}

export const GoogleAirQualityMap: React.FC<GoogleAirQualityMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  onOpenStationDetail,
  fullHeight = false,
}) => {
  const [activeStation, setActiveStation] = useState<MonitoringStation | null>(selectedStation);
  const [activeFire, setActiveFire] = useState<FarmFireHotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'satellite' | 'hybrid' | 'terrain'>('roadmap');

  // Layer toggles
  const [showStations, setShowStations] = useState(true);
  const [showPlumes, setShowPlumes] = useState(true);
  const [showFarmFires, setShowFarmFires] = useState(true);
  const [showWindVectors, setShowWindVectors] = useState(true);

  // Sync selected station with prop
  useEffect(() => {
    if (selectedStation) {
      setActiveStation(selectedStation);
    }
  }, [selectedStation]);

  const getStationColor = (aqi: number) => {
    if (aqi > 400) return '#a855f7'; // Severe (Purple)
    if (aqi > 300) return '#ef4444'; // Very Poor (Red)
    if (aqi > 200) return '#f97316'; // Poor (Orange)
    if (aqi > 100) return '#eab308'; // Moderate (Yellow)
    return '#22c55e'; // Good/Satisfactory (Green)
  };

  return (
    <div
      className={`relative bg-[#050914] border border-white/15 overflow-hidden select-none flex flex-col ${
        fullHeight ? 'h-[750px]' : 'h-[500px] sm:h-[540px]'
      }`}
    >
      {/* Header Overlay */}
      <div className="absolute top-3.5 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="bg-black/85 backdrop-blur-md px-3 py-1.5 border border-white/20 flex items-center gap-2 shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
            GOOGLE MAPS™ AIRSHED & WIND TELEMETRY
          </h3>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
            LIVE CAAQMS + NASA VIIRS
          </span>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-3.5 right-4 z-20 flex items-center gap-1.5">
        <div className="bg-black/90 border border-white/20 p-1 flex items-center gap-1 text-[10px] font-bold">
          <button
            onClick={() => setMapTypeId('roadmap')}
            className={`px-2 py-1 uppercase tracking-wider transition-colors ${
              mapTypeId === 'roadmap'
                ? 'bg-cyan-600 text-white font-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Airshed Dark
          </button>
          <button
            onClick={() => setMapTypeId('hybrid')}
            className={`px-2 py-1 uppercase tracking-wider transition-colors ${
              mapTypeId === 'hybrid'
                ? 'bg-cyan-600 text-white font-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapTypeId('terrain')}
            className={`px-2 py-1 uppercase tracking-wider transition-colors ${
              mapTypeId === 'terrain'
                ? 'bg-cyan-600 text-white font-black'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Terrain
          </button>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Toggle Fullscreen"
          className="p-2 bg-black/90 hover:bg-white hover:text-black text-white border border-white/20 transition-colors shadow-md"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* AQI Scale Legend (Top Left) */}
      <div className="absolute top-14 left-4 z-20 bg-black/90 backdrop-blur-md p-2.5 border border-white/20 text-[9px] space-y-1 font-mono shadow-xl hidden sm:block">
        <div className="text-[10px] font-black tracking-widest text-white/60 mb-1">AQI SCALE</div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
          <span className="text-white/80">0-50 GOOD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-yellow-500 rounded-sm"></span>
          <span className="text-white/80">101-200 MODERATE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-sm"></span>
          <span className="text-white/80">201-300 POOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-sm"></span>
          <span className="text-white font-bold">301-400 V. POOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-purple-600 rounded-sm"></span>
          <span className="text-white font-bold">401+ SEVERE</span>
        </div>
      </div>

      {/* Layer Toggles (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-20 bg-black/90 backdrop-blur-md p-3 border border-white/20 text-[10px] space-y-2 min-w-[170px] shadow-xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>MAP LAYERS</span>
        </div>
        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            CAAQMS NODES ({stations.length})
          </span>
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            className="accent-cyan-500 w-3.5 h-3.5"
          />
        </label>
        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            AQI PLUME BUFFERS
          </span>
          <input
            type="checkbox"
            checked={showPlumes}
            onChange={(e) => setShowPlumes(e.target.checked)}
            className="accent-red-500 w-3.5 h-3.5"
          />
        </label>
        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3 h-3" />
            VIIRS FARM FIRES ({farmFires.length})
          </span>
          <input
            type="checkbox"
            checked={showFarmFires}
            onChange={(e) => setShowFarmFires(e.target.checked)}
            className="accent-orange-500 w-3.5 h-3.5"
          />
        </label>
        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1 text-teal-400">
            <Wind className="w-3 h-3" />
            WIND VECTORS (NW 18k)
          </span>
          <input
            type="checkbox"
            checked={showWindVectors}
            onChange={(e) => setShowWindVectors(e.target.checked)}
            className="accent-teal-500 w-3.5 h-3.5"
          />
        </label>
      </div>

      {/* Selected Station Telemetry Inspector (Floating Card) */}
      {activeStation && (
        <div className="absolute top-14 right-4 z-20 w-60 sm:w-72 bg-black/95 backdrop-blur-md p-4 border border-white/25 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <div>
              <span className="px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                {activeStation.name.toUpperCase()}
              </span>
              <p className="text-[10px] font-black uppercase tracking-wider text-white/60">
                {activeStation.district} • {activeStation.state}
              </p>
            </div>
            <button
              onClick={() => setActiveStation(null)}
              className="text-white/40 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">
              AQI INDEX
            </span>
            <div className="text-right">
              <span
                className="text-3xl font-black leading-none"
                style={{ color: getStationColor(activeStation.aqi) }}
              >
                {activeStation.aqi}
              </span>
              <span
                className="block text-[9px] font-black uppercase"
                style={{ color: getStationColor(activeStation.aqi) }}
              >
                {activeStation.category}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2.5 border border-white/10 font-mono">
            <div className="flex justify-between text-white/70">
              <span>PM2.5:</span>
              <span className="text-white font-bold">{activeStation.pm25} µg/m³</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>PM10:</span>
              <span className="text-white font-bold">{activeStation.pm10} µg/m³</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>TEMP:</span>
              <span className="text-white font-bold">{activeStation.temp}°C</span>
            </div>
            <div className="flex justify-between text-white/70">
              <span>WIND:</span>
              <span className="text-teal-400 font-bold">{activeStation.windSpeed} km/h</span>
            </div>
          </div>

          <button
            onClick={() => onOpenStationDetail(activeStation)}
            className="mt-3 w-full py-2 bg-white hover:bg-white/90 text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <span>INSPECT SENSOR TELEMETRY</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Google Maps Container */}
      <div className="w-full h-full relative">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={DELHI_CENTER}
            defaultZoom={11}
            mapId="DEMO_MAP_ID"
            mapTypeId={mapTypeId}
            options={{
              styles: mapTypeId === 'roadmap' ? DARK_MAP_STYLE : undefined,
              disableDefaultUI: true,
              zoomControl: true,
              rotateControl: false,
              tilt: 0,
            }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%' }}
          >
            {/* 1. CAAQMS Monitoring Station Markers */}
            {showStations &&
              stations.map((st) => {
                const color = getStationColor(st.aqi);
                const isSelected = activeStation?.id === st.id;
                return (
                  <AdvancedMarker
                    key={st.id}
                    position={{ lat: st.lat, lng: st.lng }}
                    onClick={() => {
                      setActiveStation(st);
                      onSelectStation(st);
                    }}
                    title={`${st.name} - AQI ${st.aqi}`}
                  >
                    <div
                      className={`relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${
                        isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
                      }`}
                      style={{ width: '48px', height: '48px' }}
                    >
                      {/* Pulse Ring for Severe Stations */}
                      {st.aqi >= 350 && (
                        <span
                          className="absolute inset-0 rounded-full animate-ping opacity-60"
                          style={{ backgroundColor: color }}
                        />
                      )}

                      {/* Station Badge */}
                      <div
                        className="relative flex flex-col items-center justify-center px-1.5 py-0.5 rounded shadow-xl border border-white text-center select-none"
                        style={{
                          backgroundColor: color,
                          minWidth: '42px',
                        }}
                      >
                        <span className="text-[11px] font-black text-white leading-none drop-shadow">
                          {st.aqi}
                        </span>
                        <span className="text-[7px] font-extrabold text-white/90 uppercase tracking-tighter truncate max-w-[38px] leading-tight">
                          {st.name.split(' ')[0]}
                        </span>
                      </div>

                      {/* Marker Pointer Arrow */}
                      <div
                        className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] mx-auto absolute -bottom-1"
                        style={{ borderTopColor: color }}
                      />
                    </div>
                  </AdvancedMarker>
                );
              })}

            {/* 2. NASA VIIRS Farm Fire Thermal Hotspot Markers */}
            {showFarmFires &&
              farmFires.map((fire) => (
                <AdvancedMarker
                  key={fire.id}
                  position={{ lat: fire.lat, lng: fire.lng }}
                  onClick={() => setActiveFire(fire)}
                  title={`Farm Fire: ${fire.district} (${fire.frpMw} MW)`}
                >
                  <div
                    className="relative flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <span className="absolute inset-0 rounded-full bg-orange-500/50 animate-ping" />
                    <div className="w-7 h-7 bg-orange-600 border border-yellow-300 rounded-full flex items-center justify-center shadow-lg">
                      <Flame className="w-4 h-4 text-yellow-200 animate-pulse" />
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

            {/* 3. Live Wind Vector Markers with Direction and Speed */}
            {showWindVectors &&
              WIND_VECTORS_DATA.map((w) => (
                <AdvancedMarker
                  key={w.id}
                  position={{ lat: w.lat, lng: w.lng }}
                  title={`Wind Vector: ${w.speedKmh} km/h (${w.directionLabel})`}
                >
                  <div
                    className="flex items-center gap-1 bg-black/80 border border-teal-500/70 text-teal-300 px-2 py-1 rounded shadow-lg backdrop-blur-xs select-none"
                    style={{ width: '84px', height: '28px' }}
                  >
                    <div
                      className="w-4 h-4 flex items-center justify-center transition-transform"
                      style={{ transform: `rotate(${w.directionDeg}deg)` }}
                    >
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                    </div>
                    <div className="flex flex-col text-[8px] font-mono leading-none">
                      <span className="font-bold">{w.speedKmh}k {w.directionLabel}</span>
                      <span className="text-white/60">Gust {w.gustKmh}k</span>
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

            {/* Farm Fire Info Window */}
            {activeFire && (
              <InfoWindow
                position={{ lat: activeFire.lat, lng: activeFire.lng }}
                onCloseClick={() => setActiveFire(null)}
              >
                <div className="p-2 text-black font-sans max-w-[200px]">
                  <div className="flex items-center gap-1 text-orange-600 font-black text-xs uppercase mb-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>NASA VIIRS THERMAL HOTSPOT</span>
                  </div>
                  <p className="text-xs font-bold">{activeFire.district}, {activeFire.state}</p>
                  <p className="text-[11px] text-gray-700">FRP: <span className="font-bold">{activeFire.frpMw} MW</span></p>
                  <p className="text-[11px] text-gray-700">Acquisition: {activeFire.acqTime}</p>
                  <p className="text-[10px] text-red-600 font-bold mt-1">Plume Advection: Toward Delhi Airshed</p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
};
