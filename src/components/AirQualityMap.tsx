import React, { useState, useRef } from 'react';
import {
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  RotateCcw,
  Flame,
  Wind,
  Layers,
  Star,
  ExternalLink,
  MapPin,
  Info,
  Compass,
  Key,
} from 'lucide-react';
import { MonitoringStation, FarmFireHotspot } from '../types';
import { getAqiCategory } from '../lib/utils';
import { GoogleAirQualityMap, hasGoogleMapsKey } from './GoogleAirQualityMap';

interface AirQualityMapProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  farmFires: FarmFireHotspot[];
  onOpenStationDetail: (station: MonitoringStation) => void;
  fullHeight?: boolean;
}

export const AirQualityMap: React.FC<AirQualityMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  onOpenStationDetail,
  fullHeight = false,
}) => {
  const [mapEngine, setMapEngine] = useState<'google' | 'geospatial'>(
    hasGoogleMapsKey ? 'google' : 'google'
  );
  const [showKeySetupModal, setShowKeySetupModal] = useState(false);

  // If user selected google and hasValidKey is true, render the GoogleAirQualityMap component
  if (mapEngine === 'google' && hasGoogleMapsKey) {
    return (
      <div className="relative">
        <GoogleAirQualityMap
          stations={stations}
          selectedStation={selectedStation}
          onSelectStation={onSelectStation}
          farmFires={farmFires}
          onOpenStationDetail={onOpenStationDetail}
          fullHeight={fullHeight}
        />
        {/* Switch Engine Tab on Bottom Right */}
        <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2.5 py-1 border border-white/20 text-[9px] font-mono text-white">
          <span className="text-emerald-400 font-bold">● Google Maps Active</span>
          <button
            onClick={() => setMapEngine('geospatial')}
            className="text-white/60 hover:text-white underline ml-1"
          >
            Switch to Radar View
          </button>
        </div>
      </div>
    );
  }

  // If user selected google but has no API key yet, show the Google Maps setup card + interactive toggle
  if (mapEngine === 'google' && !hasGoogleMapsKey) {
    return (
      <div
        className={`relative bg-[#070d19] border border-white/15 overflow-hidden flex flex-col items-center justify-center p-6 text-center ${
          fullHeight ? 'h-[750px]' : 'h-[480px] sm:h-[520px]'
        }`}
      >
        <div className="max-w-lg bg-black/90 border border-white/20 p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-full bg-cyan-600/20 border border-cyan-400 flex items-center justify-center">
              <Compass className="w-5 h-5 text-cyan-400" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-black uppercase text-white tracking-wider">
              GOOGLE MAPS™ PLATFORM INTEGRATION
            </h3>
            <p className="text-xs text-white/70 mt-1">
              Connect Google Maps to visualize real-time CAAQMS pollution readings, live wind velocity vectors, and NASA VIIRS farm fire hotspots on official Google Satellite & Terrain tiles.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 p-3 text-left text-xs text-white/80 space-y-1.5 font-mono">
            <div className="font-bold text-cyan-300 text-[11px]">QUICK API KEY ACTIVATION:</div>
            <div>1. Open <strong className="text-white">Settings</strong> (⚙️ top right corner) → <strong className="text-white">Secrets</strong></div>
            <div>2. Add secret name: <code className="bg-cyan-950 text-cyan-300 px-1 py-0.5 border border-cyan-500/40">GOOGLE_MAPS_PLATFORM_KEY</code></div>
            <div>3. Paste your Google Maps API key & press Enter</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <span>GET GOOGLE MAPS KEY</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setMapEngine('geospatial')}
              className="w-full sm:w-auto px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black uppercase tracking-wider transition-all border border-white/20 flex items-center justify-center gap-1.5"
            >
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              <span>VIEW RADAR AIRSHED MODE</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Radar Geospatial View with Wind & Pollution Vectors
  return <GeospatialCanvasMap
    stations={stations}
    selectedStation={selectedStation}
    onSelectStation={onSelectStation}
    farmFires={farmFires}
    onOpenStationDetail={onOpenStationDetail}
    fullHeight={fullHeight}
    onSwitchToGoogle={() => setMapEngine('google')}
  />;
};

// Internal Subcomponent for Canvas/Vector Map
const GeospatialCanvasMap: React.FC<AirQualityMapProps & { onSwitchToGoogle: () => void }> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  onOpenStationDetail,
  fullHeight,
  onSwitchToGoogle,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer toggles
  const [showStations, setShowStations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showFarmFires, setShowFarmFires] = useState(true);
  const [showWindVectors, setShowWindVectors] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  const mapCenter = { lat: 28.6139, lng: 77.209 };
  const latSpan = 0.55;
  const lngSpan = 0.85;

  const projectCoord = (lat: number, lng: number) => {
    const x = ((lng - (mapCenter.lng - lngSpan / 2)) / lngSpan) * 800;
    const y = (((mapCenter.lat + latSpan / 2) - lat) / latSpan) * 520;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, z + 0.25));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.75, z - 0.25));
  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-[#050505] border border-white/10 overflow-hidden select-none flex flex-col ${
        fullHeight ? 'h-[750px]' : 'h-[460px] sm:h-[500px]'
      }`}
    >
      {/* Map Header Overlay */}
      <div className="absolute top-3.5 left-4 z-20 flex items-center gap-2">
        <h3 className="text-xs font-black uppercase tracking-[0.25em] text-white">
          GEOSPATIAL AIRSHED TELEMETRY / DELHI-NCR
        </h3>
        <button
          onClick={onSwitchToGoogle}
          className="ml-2 px-2 py-0.5 bg-cyan-600 hover:bg-cyan-500 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
        >
          <Compass className="w-2.5 h-2.5" />
          <span>USE GOOGLE MAPS</span>
        </button>
      </div>

      {/* Map Control Buttons */}
      <div className="absolute top-3.5 right-4 z-20 flex items-center gap-1">
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Toggle Fullscreen"
          className="p-1.5 bg-[#0a0a0a] hover:bg-white hover:text-black text-white border border-white/20 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 bg-[#0a0a0a] hover:bg-white hover:text-black text-white border border-white/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 bg-[#0a0a0a] hover:bg-white hover:text-black text-white border border-white/20 transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleReset}
          title="Reset View"
          className="p-1.5 bg-[#0a0a0a] hover:bg-white hover:text-black text-white border border-white/20 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* AQI Scale Legend (Top Left) */}
      <div className="absolute top-10 left-4 z-20 bg-black/90 p-2 border border-white/10 text-[9px] space-y-1 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-500"></span>
          <span className="text-white/80">0-50 GOOD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-yellow-500"></span>
          <span className="text-white/80">101-200 MODERATE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-orange-500"></span>
          <span className="text-white/80">201-300 POOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-red-600"></span>
          <span className="text-white font-bold">301-400 V. POOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-purple-600"></span>
          <span className="text-white font-bold">401+ SEVERE</span>
        </div>
      </div>

      {/* Layer Toggles (Bottom Left) */}
      <div className="absolute bottom-10 left-4 z-20 bg-black/90 p-3 border border-white/10 text-[10px] space-y-1.5 min-w-[155px]">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-red-500" />
          GIS LAYERS
        </div>
        <label className="flex items-center justify-between text-white/80 cursor-pointer select-none">
          <span>MONITORING NODES</span>
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            className="accent-red-600 w-3.5 h-3.5"
          />
        </label>
        <label className="flex items-center justify-between text-white/80 cursor-pointer select-none">
          <span>AQI PLUME HEATMAP</span>
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="accent-red-600 w-3.5 h-3.5"
          />
        </label>
        <label className="flex items-center justify-between text-white/80 cursor-pointer select-none">
          <span className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3 h-3" />
            VIIRS FARM FIRES
          </span>
          <input
            type="checkbox"
            checked={showFarmFires}
            onChange={(e) => setShowFarmFires(e.target.checked)}
            className="accent-orange-500 w-3.5 h-3.5"
          />
        </label>
        <label className="flex items-center justify-between text-white/80 cursor-pointer select-none">
          <span className="flex items-center gap-1 text-teal-400">
            <Wind className="w-3 h-3" />
            WIND TRAJECTORY
          </span>
          <input
            type="checkbox"
            checked={showWindVectors}
            onChange={(e) => setShowWindVectors(e.target.checked)}
            className="accent-teal-500 w-3.5 h-3.5"
          />
        </label>
      </div>

      {/* Selected Station Inspector */}
      {selectedStation && (
        <div className="absolute top-12 right-4 z-20 w-56 sm:w-64 bg-[#0a0a0a] p-4 border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div>
              <p className="px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                STATION: {selectedStation.name.toUpperCase()}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-50 text-white">
                {selectedStation.district}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50 text-white">
              AQI INDEX
            </span>
            <div className="text-right">
              <span className="text-3xl font-black text-red-500 leading-none">
                {selectedStation.aqi}
              </span>
              <span className="block text-[9px] font-black uppercase text-red-400">
                {selectedStation.category}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] bg-black p-2 border border-white/10 font-mono">
            <div className="flex justify-between text-white/60">
              <span>PM2.5</span>
              <span className="text-white font-bold">{selectedStation.pm25}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>PM10</span>
              <span className="text-white font-bold">{selectedStation.pm10}</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>TEMP</span>
              <span className="text-white font-bold">{selectedStation.temp}°C</span>
            </div>
            <div className="flex justify-between text-white/60">
              <span>WIND</span>
              <span className="text-white font-bold">{selectedStation.windSpeed}k</span>
            </div>
          </div>

          <button
            onClick={() => onOpenStationDetail(selectedStation)}
            className="mt-3 w-full py-2 bg-white hover:bg-white/90 text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all"
          >
            <span>INSPECT TELEMETRY</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* SVG Canvas Map */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center relative bg-[#040404]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          viewBox="0 0 800 520"
          className="w-full h-full object-cover transition-transform duration-75"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${
              panOffset.y / zoomLevel
            }px)`,
          }}
        >
          <defs>
            <radialGradient id="delhi-heat-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#eab308" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid lines */}
          <g opacity="0.12" stroke="#ffffff" strokeWidth="0.5" strokeDasharray="3 3">
            {[100, 200, 300, 400, 500, 600, 700].map((x) => (
              <line key={`vx-${x}`} x1={x} y1="0" x2={x} y2="520" />
            ))}
            {[80, 160, 240, 320, 400, 480].map((y) => (
              <line key={`hy-${y}`} x1="0" y1={y} x2="800" y2={y} />
            ))}
          </g>

          {/* Heatmap Layer */}
          {showHeatmap && (
            <g>
              <ellipse cx="400" cy="270" rx="280" ry="180" fill="url(#delhi-heat-core)" />
            </g>
          )}

          {/* Wind Trajectory Vectors */}
          {showWindVectors && (
            <g opacity="0.45" stroke="#2dd4bf" strokeWidth="1.2" strokeDasharray="4 2">
              <path d="M 120 80 Q 250 160 400 240 T 680 380" fill="none" />
              <path d="M 150 40 Q 290 120 440 210 T 720 350" fill="none" />
              <path d="M 90 130 Q 220 210 370 290 T 640 430" fill="none" />
            </g>
          )}

          {/* Farm Fire Hotspots */}
          {showFarmFires &&
            farmFires.map((fire) => {
              const { x, y } = projectCoord(fire.lat, fire.lng);
              return (
                <g key={fire.id} transform={`translate(${x}, ${y})`} className="cursor-pointer">
                  <circle r="12" fill="#ff5722" opacity="0.3" className="animate-ping" />
                  <circle r="6" fill="#f97316" stroke="#fff" strokeWidth="1" />
                </g>
              );
            })}

          {/* Monitoring Stations */}
          {showStations &&
            stations.map((st) => {
              const { x, y } = projectCoord(st.lat, st.lng);
              const isSelected = selectedStation?.id === st.id;
              const aqiColor = st.aqi > 400 ? '#9333ea' : st.aqi > 300 ? '#dc2626' : '#ea580c';
              return (
                <g
                  key={st.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => onSelectStation(st)}
                >
                  <circle
                    r={isSelected ? '14' : '9'}
                    fill={aqiColor}
                    stroke="#ffffff"
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    opacity="0.95"
                  />
                  <text
                    y="-12"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    className="font-mono tracking-tight"
                  >
                    {st.name} ({st.aqi})
                  </text>
                </g>
              );
            })}
        </svg>
      </div>
    </div>
  );
};
