import React, { useState, useRef, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Wind,
  Activity,
  Zap,
  Sparkles,
  Maximize2,
  Info,
} from 'lucide-react';
import { MonitoringStation, RateForecastPoint } from '../types';
import { HOURLY_RATE_FORECAST_72H } from '../data/mockData';

export type HorizonOption = '6h' | '24h' | '48h' | '72h';
export type PollutantMetric = 'aqi' | 'pm25' | 'pm10' | 'rateOfChange';

interface InteractiveTelemetryChartProps {
  station: MonitoringStation;
  initialHorizon?: HorizonOption;
  height?: number;
  showControls?: boolean;
}

export const InteractiveTelemetryChart: React.FC<InteractiveTelemetryChartProps> = ({
  station,
  initialHorizon = '24h',
  height = 240,
  showControls = true,
}) => {
  const [horizon, setHorizon] = useState<HorizonOption>(initialHorizon);
  const [activeMetric, setActiveMetric] = useState<PollutantMetric>('aqi');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Generate responsive hourly data points based on horizon and station baseline
  const dataPoints = useMemo(() => {
    const horizonHours = horizon === '6h' ? 6 : horizon === '24h' ? 24 : horizon === '48h' ? 48 : 72;
    const baseList = HOURLY_RATE_FORECAST_72H.slice(0, horizonHours);

    // Adjust values dynamically based on selected station
    const stationFactor = station.aqi / 350; // normalized to Anand Vihar

    return baseList.map((pt, idx) => {
      const scaledAqi = Math.round(pt.aqi * stationFactor);
      const scaledPm25 = Math.round(pt.pm25 * stationFactor);
      const scaledPm10 = Math.round(pt.pm10 * stationFactor);
      const scaledRate = Number((pt.rateOfChangePerHour * stationFactor).toFixed(1));

      return {
        ...pt,
        hourIndex: idx,
        scaledAqi,
        scaledPm25,
        scaledPm10,
        scaledRate,
      };
    });
  }, [horizon, station]);

  // Determine min & max for Y-Axis scaling
  const { values, metricLabel, metricUnit, metricColor, gradientId } = useMemo(() => {
    switch (activeMetric) {
      case 'pm25':
        return {
          values: dataPoints.map((d) => d.scaledPm25),
          metricLabel: 'PM2.5 Concentration',
          metricUnit: 'µg/m³',
          metricColor: '#f97316', // orange-500
          gradientId: 'grad-pm25',
        };
      case 'pm10':
        return {
          values: dataPoints.map((d) => d.scaledPm10),
          metricLabel: 'PM10 Particulate',
          metricUnit: 'µg/m³',
          metricColor: '#eab308', // yellow-500
          gradientId: 'grad-pm10',
        };
      case 'rateOfChange':
        return {
          values: dataPoints.map((d) => d.scaledRate),
          metricLabel: 'Velocity Rate (Δ AQI/hr)',
          metricUnit: 'AQI/hr',
          metricColor: '#06b6d4', // cyan-500
          gradientId: 'grad-rate',
        };
      case 'aqi':
      default:
        return {
          values: dataPoints.map((d) => d.scaledAqi),
          metricLabel: 'Air Quality Index',
          metricUnit: 'AQI',
          metricColor: '#ef4444', // red-500
          gradientId: 'grad-aqi',
        };
    }
  }, [activeMetric, dataPoints]);

  const minValue = Math.min(...values, 0);
  const maxValue = Math.max(...values, 500);
  const range = maxValue - minValue || 1;

  const width = 800; // coordinate space
  const paddingX = 40;
  const paddingY = 25;
  const plotWidth = width - paddingX * 2;
  const plotHeight = height - paddingY * 2;

  // Build SVG path
  const pointsString = dataPoints
    .map((pt, i) => {
      const val = values[i];
      const x = paddingX + (i / (dataPoints.length - 1 || 1)) * plotWidth;
      const y = paddingY + plotHeight - ((val - minValue) / range) * plotHeight;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPath = `M ${paddingX},${paddingY + plotHeight} L ${pointsString.replace(/,/g, ' ')} L ${
    paddingX + plotWidth
  },${paddingY + plotHeight} Z`;

  // Handle Mouse Move for Scrubber
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const normalizedRatio = Math.max(0, Math.min(1, (relativeX - (paddingX * rect.width) / width) / ((plotWidth * rect.width) / width)));
    const targetIdx = Math.round(normalizedRatio * (dataPoints.length - 1));
    setHoverIndex(targetIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activePoint = hoverIndex !== null ? dataPoints[hoverIndex] : dataPoints[dataPoints.length - 1];
  const activeValue = hoverIndex !== null ? values[hoverIndex] : values[values.length - 1];

  return (
    <div className="bg-[#0b101c] border border-slate-800 rounded-xl p-4 sm:p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Header & Controls Bar */}
      {showControls && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Telemetry:
            </span>

            <button
              onClick={() => setActiveMetric('aqi')}
              className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                activeMetric === 'aqi'
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              AQI
            </button>

            <button
              onClick={() => setActiveMetric('pm25')}
              className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                activeMetric === 'pm25'
                  ? 'bg-orange-500 text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              PM2.5
            </button>

            <button
              onClick={() => setActiveMetric('pm10')}
              className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                activeMetric === 'pm10'
                  ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(234,179,8,0.4)] font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              PM10
            </button>

            <button
              onClick={() => setActiveMetric('rateOfChange')}
              className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                activeMetric === 'rateOfChange'
                  ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)] font-black'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Δ Velocity Rate
            </button>
          </div>

          {/* Horizon Selector */}
          <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-slate-800 self-start sm:self-auto">
            {(['6h', '24h', '48h', '72h'] as HorizonOption[]).map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded transition-all ${
                  horizon === h
                    ? 'bg-white text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scrubber Value Indicator Overlay */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {metricLabel} &bull; <span className="text-white font-mono">{activePoint.timestamp}</span>
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl sm:text-3xl font-black text-white leading-none font-mono">
              {activeValue} <span className="text-xs text-slate-400 font-sans font-normal">{metricUnit}</span>
            </span>
            <span className="text-xs font-bold text-slate-300">
              {activePoint.category} &bull; <span className="text-cyan-400 font-mono">{activePoint.conditionDescription}</span>
            </span>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-mono text-slate-400 block">Inversion Risk</span>
          <span className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
            activePoint.inversionRisk === 'Critical' ? 'bg-red-600/30 text-red-400 border border-red-500/40' : 'bg-slate-800 text-slate-300'
          }`}>
            {activePoint.inversionRisk}
          </span>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="w-full relative">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto cursor-crosshair select-none"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={metricColor} stopOpacity="0.45" />
              <stop offset="100%" stopColor={metricColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={paddingX + plotWidth}
            y2={paddingY}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + plotHeight * 0.5}
            x2={paddingX + plotWidth}
            y2={paddingY + plotHeight * 0.5}
            stroke="rgba(255,255,255,0.06)"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingY + plotHeight}
            x2={paddingX + plotWidth}
            y2={paddingY + plotHeight}
            stroke="rgba(255,255,255,0.12)"
          />

          {/* Threshold Guide line for CPCB Safe standard / Severe threshold */}
          {activeMetric === 'aqi' && (
            <line
              x1={paddingX}
              y1={paddingY + plotHeight - ((400 - minValue) / range) * plotHeight}
              x2={paddingX + plotWidth}
              y2={paddingY + plotHeight - ((400 - minValue) / range) * plotHeight}
              stroke="rgba(239, 68, 68, 0.4)"
              strokeDasharray="3 3"
            />
          )}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Main Stroke Line */}
          <polyline
            fill="none"
            stroke={metricColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={dataPoints
              .map((_, i) => {
                const val = values[i];
                const x = paddingX + (i / (dataPoints.length - 1 || 1)) * plotWidth;
                const y = paddingY + plotHeight - ((val - minValue) / range) * plotHeight;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Data Points */}
          {dataPoints.map((_, i) => {
            const val = values[i];
            const x = paddingX + (i / (dataPoints.length - 1 || 1)) * plotWidth;
            const y = paddingY + plotHeight - ((val - minValue) / range) * plotHeight;
            const isHovered = hoverIndex === i;

            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={isHovered ? 5.5 : 2.5}
                fill={isHovered ? '#ffffff' : metricColor}
                stroke={isHovered ? metricColor : '#0b101c'}
                strokeWidth={isHovered ? 2.5 : 1}
                className="transition-all"
              />
            );
          })}

          {/* Hover Crosshair Vertical Line */}
          {hoverIndex !== null && (
            <line
              x1={paddingX + (hoverIndex / (dataPoints.length - 1 || 1)) * plotWidth}
              y1={paddingY}
              x2={paddingX + (hoverIndex / (dataPoints.length - 1 || 1)) * plotWidth}
              y2={paddingY + plotHeight}
              stroke="rgba(255,255,255,0.4)"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      {/* Footer Axis Ticks */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 px-1 pt-1.5 border-t border-slate-800/40">
        <span>T+0h (Now)</span>
        <span>T+{Math.round(dataPoints.length / 2)}h</span>
        <span>T+{dataPoints.length}h ({horizon.toUpperCase()} Horizon)</span>
      </div>
    </div>
  );
};
