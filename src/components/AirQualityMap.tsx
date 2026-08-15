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
} from 'lucide-react';
import { MonitoringStation, FarmFireHotspot } from '../types';
import { getAqiCategory } from '../lib/utils';

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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Layer toggles
  const [showStations, setShowStations] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
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

      {/* Selected Station Inspector matching Bold Typography */}
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
          {/* Radial & Linear Gradients */}
          <defs>
            <radialGradient id="delhi-heat-core" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.5" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#eab308" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="east-delhi-hotspot" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#dc2626" stopOpacity="0.6" />
              <stop offset="60%" stopColor="#ef4444" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="fire-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff5722" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Delhi NCR Arterial Road & River Grid */}
          <g stroke="#ffffff" strokeWidth="1" opacity="0.08">
            <circle cx="430" cy="270" r="110" fill="none" strokeWidth="1.5" />
            <circle cx="430" cy="270" r="170" fill="none" strokeWidth="1.5" strokeDasharray="6 3" />
            <path
              d="M 440 20 Q 470 120, 460 210 T 490 340 T 520 490"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="4"
              opacity="0.5"
            />
            <line x1="430" y1="20" x2="430" y2="270" strokeWidth="1.5" />
            <line x1="430" y1="270" x2="680" y2="230" strokeWidth="1.5" />
            <line x1="430" y1="270" x2="310" y2="450" strokeWidth="1.5" />
            <line x1="430" y1="270" x2="520" y2="490" strokeWidth="1.5" />
            <line x1="430" y1="270" x2="210" y2="270" strokeWidth="1.5" />
          </g>

          {/* Delhi NCT Administrative Boundary */}
          <polygon
            points="340,140 460,110 500,180 520,320 480,410 390,400 320,330 310,210"
            fill="#ffffff"
            fillOpacity="0.02"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.3"
          />

          {/* AQI Heatmap Layer */}
          {showHeatmap && (
            <g>
              <circle cx="440" cy="260" r="180" fill="url(#delhi-heat-core)" />
              <circle cx="530" cy="220" r="110" fill="url(#east-delhi-hotspot)" />
              <circle cx="435" cy="150" r="95" fill="url(#east-delhi-hotspot)" />
            </g>
          )}

          {/* Wind Trajectory Vectors */}
          {showWindVectors && (
            <g opacity="0.7">
              <path
                d="M 120 40 Q 280 150, 440 260 T 640 380"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                className="animate-wind"
              />
              <path
                d="M 180 10 Q 320 120, 480 230 T 680 340"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                className="animate-wind"
              />
              <path
                d="M 80 80 Q 240 180, 410 290 T 580 430"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2"
                className="animate-wind"
              />
              <polygon points="440,260 425,255 428,260 425,265" fill="#14b8a6" />
              <polygon points="530,220 515,215 518,220 515,225" fill="#14b8a6" />
              <polygon points="640,380 625,375 628,380 625,385" fill="#14b8a6" />
            </g>
          )}

          {/* Farm Fires */}
          {showFarmFires &&
            farmFires.map((fire) => {
              const fireX = 80 + ((fire.lng - 74.8) / 2.8) * 260;
              const fireY = 30 + ((31.8 - fire.lat) / 3.0) * 220;

              return (
                <g key={fire.id} className="cursor-pointer group">
                  <circle cx={fireX} cy={fireY} r="16" fill="url(#fire-glow)" />
                  <rect
                    x={fireX - 4}
                    y={fireY - 4}
                    width="8"
                    height="8"
                    fill="#f97316"
                    className="animate-pulse"
                  />
                  <title>{`NASA Active Fire: ${fire.district}, ${fire.state} | FRP: ${fire.frp} MW (${fire.satellite})`}</title>
                </g>
              );
            })}

          {/* Monitoring Stations */}
          {showStations &&
            stations.map((st) => {
              const { x, y } = projectCoord(st.lat, st.lng);
              const isSelected = selectedStation?.id === st.id;
              const aqiInfo = getAqiCategory(st.aqi);

              return (
                <g
                  key={st.id}
                  onClick={() => onSelectStation(st)}
                  className="cursor-pointer transition-transform duration-150 hover:scale-110"
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <circle
                      cx={x}
                      cy={y}
                      r="18"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  )}

                  {/* Main Station Square or Circle */}
                  <rect
                    x={x - 12}
                    y={y - 12}
                    width="24"
                    height="24"
                    fill={aqiInfo.color}
                    stroke="#000000"
                    strokeWidth="2"
                  />

                  {/* Station AQI value */}
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="900"
                    fill="#ffffff"
                    fontFamily="Space Grotesk, monospace"
                  >
                    {st.aqi}
                  </text>

                  {/* Station Name Label */}
                  <text
                    x={x}
                    y={y + 24}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="900"
                    letterSpacing="0.05em"
                    fill={isSelected ? '#ffffff' : 'rgba(255,255,255,0.7)'}
                    fontFamily="Space Grotesk, sans-serif"
                  >
                    {st.name.toUpperCase()}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Map Footer Bar */}
      <div className="bg-[#050505] border-t border-white/10 px-4 py-2 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-60">
        <div className="flex items-center gap-2 text-white">
          <MapPin className="w-3 h-3 text-red-500" />
          <span>DELHI-NCR AIRSHED (28.6139° N, 77.2090° E)</span>
        </div>
        <div className="text-white">
          <span>SCALE: {(zoomLevel * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};
