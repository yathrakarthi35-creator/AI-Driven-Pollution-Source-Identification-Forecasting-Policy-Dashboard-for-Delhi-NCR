import React, { useState } from 'react';
import { TrendingUp, Brain } from 'lucide-react';
import { MonitoringStation } from '../types';

interface AqiForecastCardProps {
  station: MonitoringStation;
  onOpenForecastReasoning: (station: MonitoringStation) => void;
}

export const AqiForecastCard: React.FC<AqiForecastCardProps> = ({
  station,
  onOpenForecastReasoning,
}) => {
  const [timeframe, setTimeframe] = useState<'24h' | '48h' | '72h'>('72h');

  const points =
    timeframe === '24h'
      ? [
          { label: 'NOW', aqi: station.forecast.now },
          { label: '+6H', aqi: Math.round(station.forecast.now * 0.92) },
          { label: '+12H', aqi: Math.round(station.forecast.now * 0.88) },
          { label: '+18H', aqi: Math.round(station.forecast.now * 0.82) },
          { label: '+24H', aqi: station.forecast.h24 },
        ]
      : timeframe === '48h'
      ? [
          { label: 'NOW', aqi: station.forecast.now },
          { label: '+12H', aqi: Math.round(station.forecast.now * 0.88) },
          { label: '+24H', aqi: station.forecast.h24 },
          { label: '+36H', aqi: Math.round((station.forecast.h24 + station.forecast.h48) / 2) },
          { label: '+48H', aqi: station.forecast.h48 },
        ]
      : [
          { label: 'NOW', aqi: station.forecast.now },
          { label: '+24H', aqi: station.forecast.h24 },
          { label: '+48H', aqi: station.forecast.h48 },
          { label: '+72H', aqi: station.forecast.h72 },
        ];

  const width = 360;
  const height = 130;
  const paddingX = 35;
  const paddingY = 20;
  const maxAqi = 500;

  const getCoordinates = (index: number, aqi: number) => {
    const x = paddingX + (index / (points.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - (aqi / maxAqi) * (height - paddingY * 2);
    return { x, y };
  };

  const pathString = points.reduce((acc, point, index) => {
    const { x, y } = getCoordinates(index, point.aqi);
    if (index === 0) return `M ${x} ${y}`;
    const prev = getCoordinates(index - 1, points[index - 1].aqi);
    const cx = (prev.x + x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${y}, ${x} ${y}`;
  }, '');

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-5 flex flex-col justify-between h-[250px] relative">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white">
          72H AQI FORECAST / {station.name.toUpperCase()}
        </h3>

        <div className="flex items-center gap-2">
          {(['24h', '48h', '72h'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`text-[9px] font-black uppercase px-2 py-0.5 transition-all ${
                timeframe === t ? 'bg-white text-black' : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full h-[120px] my-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {[100, 200, 300, 400].map((level) => {
            const y = height - paddingY - (level / maxAqi) * (height - paddingY * 2);
            return (
              <line
                key={level}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="2,2"
              />
            );
          })}

          {/* Stroke Line */}
          <path
            d={pathString}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="square"
          />

          {/* Points */}
          {points.map((p, idx) => {
            const { x, y } = getCoordinates(idx, p.aqi);
            return (
              <g key={idx}>
                <rect x={x - 4} y={y - 4} width="8" height="8" fill="#ffffff" />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="900"
                  fill="#ffffff"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {p.aqi}
                </text>
                <text
                  x={x}
                  y={height - 2}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="900"
                  fill="rgba(255,255,255,0.5)"
                  fontFamily="Space Grotesk, sans-serif"
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] font-black uppercase tracking-wider">
        <span className="text-red-500">PEAK SPIKE +72H: {station.forecast.h72} AQI</span>
        <button
          onClick={() => onOpenForecastReasoning(station)}
          className="text-white hover:text-red-400 flex items-center gap-1 transition-colors"
        >
          <Brain className="w-3.5 h-3.5 text-red-500" />
          <span>AI REASONING →</span>
        </button>
      </div>
    </div>
  );
};
