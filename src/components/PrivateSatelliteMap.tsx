import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Satellite,
  Wind,
  Flame,
  Layers,
  MapPin,
  ExternalLink,
  Info,
  Maximize2,
  Minimize2,
  Compass,
  Radio,
  Eye,
  Sliders,
  Sparkles,
  Zap,
  Activity,
  Crosshair,
  RotateCcw,
} from 'lucide-react';
import { MonitoringStation, FarmFireHotspot } from '../types';
import { getAqiCategory } from '../lib/utils';

// Satellite Tile Layer Configurations
const SATELLITE_PROVIDERS = {
  trueColor: {
    name: 'Sentinel/ESRI True Color',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Sentinel-2 & High-Res Earth Observation',
    maxZoom: 18,
  },
  darkAirshed: {
    name: 'CartoDB Dark Multispectral',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    maxZoom: 19,
  },
  terrainTopography: {
    name: 'Topographic Airshed Elevation',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM',
    maxZoom: 17,
  },
};

// Simulated Wind Vector Streamline Nodes across Delhi-NCR
interface WindStationPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  speedKmh: number;
  directionDeg: number;
  directionLabel: string;
  gustKmh: number;
}

const WIND_STREAMLINE_NODES: WindStationPoint[] = [
  { id: 'w1', name: 'North Corridor (Narela)', lat: 28.85, lng: 77.08, speedKmh: 19.5, directionDeg: 315, directionLabel: 'NW', gustKmh: 26.2 },
  { id: 'w2', name: 'North-West (Rohini)', lat: 28.74, lng: 77.11, speedKmh: 18.2, directionDeg: 320, directionLabel: 'NW', gustKmh: 24.0 },
  { id: 'w3', name: 'West Airshed (Punjabi Bagh)', lat: 28.67, lng: 77.13, speedKmh: 17.6, directionDeg: 310, directionLabel: 'NW', gustKmh: 23.5 },
  { id: 'w4', name: 'Central Basin (Connaught Place)', lat: 28.63, lng: 77.22, speedKmh: 14.8, directionDeg: 305, directionLabel: 'WNW', gustKmh: 19.4 },
  { id: 'w5', name: 'South Airshed (R.K. Puram)', lat: 28.56, lng: 77.17, speedKmh: 15.1, directionDeg: 315, directionLabel: 'NW', gustKmh: 20.2 },
  { id: 'w6', name: 'South-West (IGI Airport)', lat: 28.56, lng: 77.09, speedKmh: 16.4, directionDeg: 300, directionLabel: 'WNW', gustKmh: 22.8 },
  { id: 'w7', name: 'East Corridor (Anand Vihar)', lat: 28.65, lng: 77.31, speedKmh: 12.3, directionDeg: 325, directionLabel: 'NW', gustKmh: 17.0 },
  { id: 'w8', name: 'Noida-Yamuna Basin', lat: 28.53, lng: 77.39, speedKmh: 13.5, directionDeg: 315, directionLabel: 'NW', gustKmh: 18.2 },
  { id: 'w9', name: 'Gurgaon Tech Corridor', lat: 28.46, lng: 77.03, speedKmh: 16.8, directionDeg: 305, directionLabel: 'WNW', gustKmh: 23.1 },
  { id: 'w10', name: 'Ghaziabad Industrial Zone', lat: 28.67, lng: 77.44, speedKmh: 11.6, directionDeg: 330, directionLabel: 'NNW', gustKmh: 15.8 },
];

interface PrivateSatelliteMapProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  farmFires: FarmFireHotspot[];
  onOpenStationDetail: (station: MonitoringStation) => void;
  fullHeight?: boolean;
}

export const PrivateSatelliteMap: React.FC<PrivateSatelliteMapProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  onOpenStationDetail,
  fullHeight = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const plumesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const windLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const firesLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [activeProviderKey, setActiveProviderKey] = useState<keyof typeof SATELLITE_PROVIDERS>('trueColor');
  const [activeMultispectralFilter, setActiveMultispectralFilter] = useState<'optical' | 'no2' | 'aod' | 'thermal'>('optical');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStation, setActiveStation] = useState<MonitoringStation | null>(selectedStation);
  const [activeFire, setActiveFire] = useState<FarmFireHotspot | null>(null);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lng: number }>({ lat: 28.6139, lng: 77.209 });

  // Layer toggles
  const [showStations, setShowStations] = useState(true);
  const [showPlumes, setShowPlumes] = useState(true);
  const [showWindVectors, setShowWindVectors] = useState(true);
  const [showFarmFires, setShowFarmFires] = useState(true);
  const [showSatelliteGrid, setShowSatelliteGrid] = useState(true);

  // Sync selectedStation prop
  useEffect(() => {
    if (selectedStation) {
      setActiveStation(selectedStation);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo([selectedStation.lat, selectedStation.lng], {
          animate: true,
          duration: 0.6,
        });
      }
    }
  }, [selectedStation]);

  const getStationColor = (aqi: number) => {
    if (aqi > 400) return '#9333ea'; // Severe (Purple)
    if (aqi > 300) return '#dc2626'; // Very Poor (Red)
    if (aqi > 200) return '#ea580c'; // Poor (Orange)
    if (aqi > 100) return '#eab308'; // Moderate (Yellow)
    return '#16a34a'; // Good (Green)
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.209],
      zoom: 11,
      zoomControl: false,
      attributionControl: false,
      maxBounds: [
        [27.5, 75.8],
        [29.8, 78.5],
      ],
    });

    mapInstanceRef.current = map;

    // Tile Layer
    const provider = SATELLITE_PROVIDERS[activeProviderKey];
    tileLayerRef.current = L.tileLayer(provider.url, {
      attribution: provider.attribution,
      maxZoom: provider.maxZoom,
      subdomains: 'abcd',
    }).addTo(map);

    // Layer Groups
    plumesLayerGroupRef.current = L.layerGroup().addTo(map);
    windLayerGroupRef.current = L.layerGroup().addTo(map);
    firesLayerGroupRef.current = L.layerGroup().addTo(map);
    markersLayerGroupRef.current = L.layerGroup().addTo(map);

    // Mouse movement coordinate tracking
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(4)),
        lng: Number(e.latlng.lng.toFixed(4)),
      });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer when provider changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = SATELLITE_PROVIDERS[activeProviderKey];
    tileLayerRef.current.setUrl(provider.url);
  }, [activeProviderKey]);

  // Render CAAQMS Station Markers & Plumes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerGroupRef.current;
    const plumesGroup = plumesLayerGroupRef.current;

    if (!map || !markersGroup || !plumesGroup) return;

    markersGroup.clearLayers();
    plumesGroup.clearLayers();

    if (showPlumes) {
      stations.forEach((st) => {
        const color = getStationColor(st.aqi);
        const radius = st.aqi > 400 ? 5200 : st.aqi > 300 ? 4200 : 3200;
        const opacity = st.aqi > 400 ? 0.35 : st.aqi > 300 ? 0.25 : 0.18;

        const circle = L.circle([st.lat, st.lng], {
          radius: radius,
          color: color,
          fillColor: color,
          fillOpacity: opacity,
          weight: 1.5,
          dashArray: '3, 4',
        });
        plumesGroup.addLayer(circle);
      });
    }

    if (showStations) {
      stations.forEach((st) => {
        const color = getStationColor(st.aqi);
        const isSelected = activeStation?.id === st.id;

        const customHtml = `
          <div class="relative flex flex-col items-center cursor-pointer group" style="transform: translate(-50%, -50%);">
            ${
              st.aqi >= 350
                ? `<span class="absolute -inset-1 rounded-full animate-ping opacity-75" style="background-color: ${color};"></span>`
                : ''
            }
            <div class="relative px-2 py-0.5 rounded shadow-2xl border ${
              isSelected ? 'border-white ring-2 ring-cyan-400 scale-110' : 'border-white/80'
            } text-center select-none backdrop-blur-md" style="background-color: ${color}; min-width: 46px;">
              <div class="text-[11px] font-black text-white leading-none font-mono drop-shadow">${st.aqi}</div>
              <div class="text-[7px] font-black text-white/90 uppercase tracking-tighter truncate max-w-[42px] leading-tight">${
                st.name.split(' ')[0]
              }</div>
            </div>
            <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] mx-auto" style="border-top-color: ${color};"></div>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'satellite-station-pin',
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        });

        const marker = L.marker([st.lat, st.lng], { icon: icon });
        marker.on('click', () => {
          setActiveStation(st);
          onSelectStation(st);
        });

        markersGroup.addLayer(marker);
      });
    }
  }, [stations, activeStation, showStations, showPlumes]);

  // Render NASA VIIRS Farm Fire Hotspots
  useEffect(() => {
    const firesGroup = firesLayerGroupRef.current;
    if (!firesGroup) return;

    firesGroup.clearLayers();

    if (showFarmFires) {
      farmFires.forEach((fire) => {
        const fireHtml = `
          <div class="relative flex items-center justify-center cursor-pointer hover:scale-125 transition-transform" style="transform: translate(-50%, -50%);">
            <span class="absolute inset-0 rounded-full bg-orange-500/60 animate-ping"></span>
            <div class="w-7 h-7 bg-orange-600 border border-yellow-300 rounded-full flex items-center justify-center shadow-lg">
              <span class="text-xs">🔥</span>
            </div>
          </div>
        `;

        const fireIcon = L.divIcon({
          html: fireHtml,
          className: 'satellite-fire-pin',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([fire.lat, fire.lng], { icon: fireIcon });
        marker.on('click', () => {
          setActiveFire(fire);
        });

        firesGroup.addLayer(marker);
      });
    }
  }, [farmFires, showFarmFires]);

  // Render Wind Streamlines & Vectors
  useEffect(() => {
    const windGroup = windLayerGroupRef.current;
    if (!windGroup) return;

    windGroup.clearLayers();

    if (showWindVectors) {
      // Wind direction streamlines
      const streamlines = [
        [
          [28.90, 76.95],
          [28.75, 77.10],
          [28.60, 77.25],
          [28.45, 77.40],
        ],
        [
          [28.82, 77.05],
          [28.68, 77.20],
          [28.52, 77.35],
          [28.38, 77.48],
        ],
        [
          [28.75, 76.90],
          [28.62, 77.05],
          [28.48, 77.20],
          [28.35, 77.32],
        ],
      ];

      streamlines.forEach((path) => {
        const polyline = L.polyline(path as [number, number][], {
          color: '#2dd4bf',
          weight: 2,
          opacity: 0.65,
          dashArray: '6, 8',
          lineCap: 'round',
        });
        windGroup.addLayer(polyline);
      });

      // Wind Station Vector Pills
      WIND_STREAMLINE_NODES.forEach((w) => {
        const windHtml = `
          <div class="flex items-center gap-1.5 bg-black/85 border border-teal-400/80 text-teal-300 px-2 py-1 rounded shadow-xl backdrop-blur-md select-none font-mono" style="transform: translate(-50%, -50%); min-width: 90px;">
            <div class="w-3.5 h-3.5 flex items-center justify-center" style="transform: rotate(${w.directionDeg}deg);">
              <span class="text-teal-400 font-bold text-xs">▲</span>
            </div>
            <div class="flex flex-col text-[8px] leading-none">
              <span class="font-black text-teal-200">${w.speedKmh}k ${w.directionLabel}</span>
              <span class="text-white/60">Gust ${w.gustKmh}k</span>
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: windHtml,
          className: 'satellite-wind-pin',
          iconSize: [92, 28],
          iconAnchor: [46, 14],
        });

        const marker = L.marker([w.lat, w.lng], { icon: icon });
        windGroup.addLayer(marker);
      });
    }
  }, [showWindVectors]);

  // Preset camera navigations
  const handleFlyToRegion = (lat: number, lng: number, zoom: number) => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo([lat, lng], zoom, {
      duration: 1.2,
    });
  };

  const getFilterStyle = () => {
    switch (activeMultispectralFilter) {
      case 'no2':
        return 'hue-rotate-180 contrast-125 saturate-200';
      case 'aod':
        return 'sepia contrast-150 saturate-150';
      case 'thermal':
        return 'invert hue-rotate-90 contrast-200';
      default:
        return 'contrast-110 brightness-95';
    }
  };

  return (
    <div
      className={`relative bg-[#02050c] border border-white/20 overflow-hidden select-none flex flex-col font-sans ${
        fullHeight ? 'h-[750px]' : 'h-[500px] sm:h-[540px]'
      }`}
    >
      {/* 1. Private Satellite Top HUD Header */}
      <div className="absolute top-3 left-4 z-[1000] flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 border border-cyan-500/50 flex items-center gap-2.5 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <Satellite className="w-4 h-4 text-cyan-400 relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                PRIVATE SATELLITE AIRSHED RADAR
              </h3>
              <span className="px-1.5 py-0.2 bg-cyan-950 border border-cyan-500/60 text-cyan-300 text-[8px] font-mono font-bold">
                SENTINEL-5P / MODIS
              </span>
            </div>
            <p className="text-[9px] font-mono text-cyan-200/70">
              MULTISPECTRAL TROPOSPHERIC TELEMETRY • DELHI-NCR
            </p>
          </div>
        </div>

        {/* Live Coordinate Crosshair Readout */}
        <div className="bg-black/80 backdrop-blur-md px-2.5 py-1.5 border border-white/20 hidden md:flex items-center gap-2 text-[9px] font-mono text-white/80">
          <Crosshair className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>LAT: {cursorCoords.lat}° N</span>
          <span className="text-white/30">|</span>
          <span>LNG: {cursorCoords.lng}° E</span>
          <span className="text-white/30">|</span>
          <span className="text-emerald-400 font-bold">ORBIT ACTIVE</span>
        </div>
      </div>

      {/* 2. Top-Right Satellite Layer & Mode Switchers */}
      <div className="absolute top-3 right-4 z-[1000] flex items-center gap-1.5">
        {/* Satellite Basemap Selector */}
        <div className="bg-black/90 backdrop-blur-md border border-white/25 p-1 flex items-center gap-1 text-[10px] font-bold shadow-xl">
          <button
            onClick={() => setActiveProviderKey('trueColor')}
            className={`px-2 py-1 uppercase tracking-wider transition-all ${
              activeProviderKey === 'trueColor'
                ? 'bg-cyan-600 text-white font-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            True Color
          </button>
          <button
            onClick={() => setActiveProviderKey('darkAirshed')}
            className={`px-2 py-1 uppercase tracking-wider transition-all ${
              activeProviderKey === 'darkAirshed'
                ? 'bg-cyan-600 text-white font-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Dark Scan
          </button>
          <button
            onClick={() => setActiveProviderKey('terrainTopography')}
            className={`px-2 py-1 uppercase tracking-wider transition-all ${
              activeProviderKey === 'terrainTopography'
                ? 'bg-cyan-600 text-white font-black shadow-md'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            Topography
          </button>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title="Toggle Fullscreen"
          className="p-2 bg-black/90 hover:bg-white hover:text-black text-white border border-white/25 transition-colors shadow-xl"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3. Multispectral Filter Bar (Top Subheader) */}
      <div className="absolute top-14 left-4 z-[1000] hidden lg:flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 border border-white/20 text-[9px] font-mono">
        <span className="px-2 text-white/50 font-bold flex items-center gap-1">
          <Sliders className="w-2.5 h-2.5 text-cyan-400" />
          SPECTRAL BAND:
        </span>
        <button
          onClick={() => setActiveMultispectralFilter('optical')}
          className={`px-2 py-0.5 rounded-xs transition-colors ${
            activeMultispectralFilter === 'optical'
              ? 'bg-white text-black font-bold'
              : 'text-white/70 hover:text-white'
          }`}
        >
          OPTICAL RGB
        </button>
        <button
          onClick={() => setActiveMultispectralFilter('no2')}
          className={`px-2 py-0.5 rounded-xs transition-colors ${
            activeMultispectralFilter === 'no2'
              ? 'bg-purple-600 text-white font-bold'
              : 'text-purple-300/80 hover:text-purple-200'
          }`}
        >
          TROPOMI NO₂
        </button>
        <button
          onClick={() => setActiveMultispectralFilter('aod')}
          className={`px-2 py-0.5 rounded-xs transition-colors ${
            activeMultispectralFilter === 'aod'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-amber-300/80 hover:text-amber-200'
          }`}
        >
          MODIS AOD
        </button>
        <button
          onClick={() => setActiveMultispectralFilter('thermal')}
          className={`px-2 py-0.5 rounded-xs transition-colors ${
            activeMultispectralFilter === 'thermal'
              ? 'bg-red-600 text-white font-bold'
              : 'text-red-300/80 hover:text-red-200'
          }`}
        >
          THERMAL IR
        </button>
      </div>

      {/* 4. Region Preset Jump Buttons (Right Under Filter) */}
      <div className="absolute top-14 right-4 z-[1000] hidden sm:flex items-center gap-1 bg-black/85 backdrop-blur-md p-1 border border-white/20 text-[9px] font-mono">
        <span className="px-1.5 text-white/50 font-bold">FOCUS:</span>
        <button
          onClick={() => handleFlyToRegion(28.6139, 77.209, 11)}
          className="px-1.5 py-0.5 text-white/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
        >
          All NCR
        </button>
        <button
          onClick={() => handleFlyToRegion(28.74, 77.11, 12)}
          className="px-1.5 py-0.5 text-white/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
        >
          North-West
        </button>
        <button
          onClick={() => handleFlyToRegion(28.65, 77.31, 13)}
          className="px-1.5 py-0.5 text-white/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
        >
          East Corridor
        </button>
        <button
          onClick={() => handleFlyToRegion(28.56, 77.09, 13)}
          className="px-1.5 py-0.5 text-white/80 hover:text-cyan-300 hover:bg-white/10 transition-colors"
        >
          Airport Basin
        </button>
      </div>

      {/* 5. AQI Scale Legend (Left Middle) */}
      <div className="absolute top-24 left-4 z-[1000] bg-black/90 backdrop-blur-md p-2.5 border border-white/20 text-[9px] space-y-1 font-mono shadow-2xl hidden md:block">
        <div className="text-[10px] font-black tracking-widest text-cyan-300 mb-1 flex items-center justify-between">
          <span>AQI SPECTRUM</span>
          <Radio className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
          <span className="text-white/80">0-50 GOOD</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-yellow-500 rounded-xs"></span>
          <span className="text-white/80">101-200 MODERATE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-orange-500 rounded-xs"></span>
          <span className="text-white/80">201-300 POOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-xs"></span>
          <span className="text-white font-bold">301-400 V. POOR</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-purple-600 rounded-xs"></span>
          <span className="text-white font-bold">401+ SEVERE</span>
        </div>
      </div>

      {/* 6. GIS Layer Toggles (Bottom Left) */}
      <div className="absolute bottom-5 left-4 z-[1000] bg-black/90 backdrop-blur-md p-3 border border-white/20 text-[10px] space-y-2 min-w-[180px] shadow-2xl">
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            SATELLITE LAYERS
          </span>
        </div>

        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1.5">
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
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
            AQI PLUME DIFFUSION
          </span>
          <input
            type="checkbox"
            checked={showPlumes}
            onChange={(e) => setShowPlumes(e.target.checked)}
            className="accent-red-500 w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1.5 text-teal-300">
            <Wind className="w-3 h-3 text-teal-400" />
            WIND VECTORS (NW 18k)
          </span>
          <input
            type="checkbox"
            checked={showWindVectors}
            onChange={(e) => setShowWindVectors(e.target.checked)}
            className="accent-teal-500 w-3.5 h-3.5"
          />
        </label>

        <label className="flex items-center justify-between text-white/90 cursor-pointer select-none">
          <span className="flex items-center gap-1.5 text-orange-400">
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
      </div>

      {/* 7. Selected Station Telemetry Inspector Drawer */}
      {activeStation && (
        <div className="absolute top-24 right-4 z-[1000] w-64 sm:w-72 bg-black/95 backdrop-blur-md p-4 border border-cyan-500/40 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/15">
            <div>
              <span className="px-2 py-0.5 bg-white text-black text-[9px] font-black uppercase tracking-widest inline-block mb-1">
                {activeStation.name.toUpperCase()}
              </span>
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-300/80 font-mono">
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
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50 font-mono">
              AQI INDEX
            </span>
            <div className="text-right">
              <span
                className="text-3xl font-black leading-none font-mono"
                style={{ color: getStationColor(activeStation.aqi) }}
              >
                {activeStation.aqi}
              </span>
              <span
                className="block text-[9px] font-black uppercase mt-0.5"
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
            className="mt-3 w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all shadow-lg"
          >
            <span>INSPECT TELEMETRY</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 8. Farm Fire Info Drawer */}
      {activeFire && (
        <div className="absolute top-24 right-4 z-[1000] w-64 bg-black/95 backdrop-blur-md p-4 border border-orange-500/50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-orange-500/30">
            <div className="flex items-center gap-1.5 text-orange-400 font-black text-xs uppercase">
              <Flame className="w-4 h-4 text-orange-500 animate-bounce" />
              <span>VIIRS THERMAL FIRE</span>
            </div>
            <button
              onClick={() => setActiveFire(null)}
              className="text-white/40 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-white/80 font-mono">
            <p className="font-bold text-white text-sm">{activeFire.district}, {activeFire.state}</p>
            <p className="text-orange-300">FRP: <span className="font-bold">{activeFire.frpMw} MW</span></p>
            <p className="text-white/60">Capture: {activeFire.acqTime}</p>
            <p className="text-[10px] text-red-400 font-bold pt-1 border-t border-white/10">
              Plume Trajectory: Infiltration into Delhi Airshed
            </p>
          </div>
        </div>
      )}

      {/* 9. Leaflet Private Satellite Map Canvas */}
      <div
        ref={mapContainerRef}
        className={`w-full h-full relative z-0 transition-all duration-300 ${getFilterStyle()}`}
        style={{ minHeight: '100%' }}
      />
    </div>
  );
};
