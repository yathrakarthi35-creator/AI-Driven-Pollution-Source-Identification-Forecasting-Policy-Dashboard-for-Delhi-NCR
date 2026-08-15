import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Brain,
  Car,
  Flame,
  Factory,
  Building2,
  Truck,
  Zap,
  TrendingDown,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CircleDollarSign,
  Play,
} from 'lucide-react';
import { MonitoringStation, PolicySliders } from '../types';
import { getAqiCategory } from '../lib/utils';
import confetti from 'canvas-confetti';

interface PolicySimulatorViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onOpenAiPolicyAnalysis: (sliders: PolicySliders, predictedAqi: number) => void;
}

export const PolicySimulatorView: React.FC<PolicySimulatorViewProps> = ({
  stations,
  selectedStation,
  onOpenAiPolicyAnalysis,
}) => {
  const [sliders, setSliders] = useState<PolicySliders>({
    traffic: 50,
    stubble: 60,
    industry: 40,
    construction: 60,
    trucks: 50,
  });

  // Additional advanced policy toggles
  const [enableOddEven, setEnableOddEven] = useState(true);
  const [enableEvZone, setEnableEvZone] = useState(true);
  const [smogTowers, setSmogTowers] = useState(false);
  const [cloudSeedingFeasibility, setCloudSeedingFeasibility] = useState(false);

  // Computing combined reduction
  const trafficEff = (sliders.traffic / 100) * 0.35 + (enableOddEven ? 0.08 : 0) + (enableEvZone ? 0.05 : 0);
  const stubbleEff = (sliders.stubble / 100) * 0.28;
  const industryEff = (sliders.industry / 100) * 0.18;
  const constructionEff = (sliders.construction / 100) * 0.12;
  const truckEff = (sliders.trucks / 100) * 0.14;

  const totalEffFraction = Math.min(
    0.68,
    (trafficEff + stubbleEff + industryEff + constructionEff + truckEff) * 0.42
  );

  const baselineAqi = selectedStation.aqi;
  const aqiReduction = Math.round(baselineAqi * totalEffFraction);
  const predictedAqi = Math.max(70, baselineAqi - aqiReduction);
  const percentReduction = Math.round((aqiReduction / baselineAqi) * 100);

  // Economic Impact Calculation
  const economicDisruptionIndex = Math.min(
    100,
    Math.round(
      sliders.traffic * 0.25 +
        sliders.industry * 0.35 +
        sliders.construction * 0.25 +
        sliders.trucks * 0.15
    )
  );

  const handleSimulate = () => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
    });
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-[#0e1626] border border-slate-800 p-4 sm:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
            Delhi-NCR Comprehensive Policy Decision Sandbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate marginal AQI abatement against economic disruption indices and operational enforcement costs
          </p>
        </div>

        <button
          onClick={() => onOpenAiPolicyAnalysis(sliders, predictedAqi)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
        >
          <Brain className="w-4 h-4 text-emerald-200 animate-pulse" />
          <span>Launch AI High-Thinking Policy Reasoning</span>
        </button>
      </div>

      {/* Main Grid: Left Controls, Right Real-Time Impact Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sliders & Toggles (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* 5 Core Sliders */}
          <div className="bg-[#0a111e] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Core Abatement Levers (0 - 100%)
              </h3>
              <button
                onClick={() =>
                  setSliders({
                    traffic: 50,
                    stubble: 60,
                    industry: 40,
                    construction: 60,
                    trucks: 50,
                  })
                }
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            {/* Traffic Reduction */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-red-400" />
                  Traffic Volume Reduction & Work-from-Home Mandate
                </span>
                <span className="font-mono font-bold text-emerald-400">{sliders.traffic}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliders.traffic}
                onChange={(e) => setSliders({ ...sliders, traffic: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Stubble Burning Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-400" />
                  Stubble Burning Interventions (Bio-Decomposers & Zero-Burn Subsidies)
                </span>
                <span className="font-mono font-bold text-emerald-400">{sliders.stubble}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliders.stubble}
                onChange={(e) => setSliders({ ...sliders, stubble: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Industrial Emission Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Factory className="w-4 h-4 text-amber-400" />
                  Industrial Clean Fuel Switch (PNG Transition & DG Set Ban)
                </span>
                <span className="font-mono font-bold text-emerald-400">{sliders.industry}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliders.industry}
                onChange={(e) => setSliders({ ...sliders, industry: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Construction & Dust Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-green-400" />
                  C&D Activity Ban & Mechanized Road Misting Intensification
                </span>
                <span className="font-mono font-bold text-emerald-400">{sliders.construction}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliders.construction}
                onChange={(e) => setSliders({ ...sliders, construction: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Heavy Truck Restrictions */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-teal-400" />
                  Non-Essential Diesel Heavy Truck Border Restrictions
                </span>
                <span className="font-mono font-bold text-emerald-400">{sliders.trucks}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliders.trucks}
                onChange={(e) => setSliders({ ...sliders, trucks: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* Supplementary Interventions Toggles */}
          <div className="bg-[#0a111e] border border-slate-800 rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Supplementary Emergency Directives
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Odd-Even Vehicle Rationing</span>
                <input
                  type="checkbox"
                  checked={enableOddEven}
                  onChange={(e) => setEnableOddEven(e.target.checked)}
                  className="rounded bg-slate-800 text-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Zero-Emission EV Zones</span>
                <input
                  type="checkbox"
                  checked={enableEvZone}
                  onChange={(e) => setEnableEvZone(e.target.checked)}
                  className="rounded bg-slate-800 text-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Smog Towers Deployment (Anand Vihar/CP)</span>
                <input
                  type="checkbox"
                  checked={smogTowers}
                  onChange={(e) => setSmogTowers(e.target.checked)}
                  className="rounded bg-slate-800 text-emerald-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Cloud Seeding Meteorological Prep</span>
                <input
                  type="checkbox"
                  checked={cloudSeedingFeasibility}
                  onChange={(e) => setCloudSeedingFeasibility(e.target.checked)}
                  className="rounded bg-slate-800 text-emerald-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Real-time Assessment Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0e1626] border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">
              Projected Atmospheric Outcome ({selectedStation.name})
            </h3>

            {/* Baseline vs Predicted */}
            <div className="grid grid-cols-2 gap-3 bg-[#080d17] p-3.5 rounded-xl border border-slate-800 text-center">
              <div>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Current AQI
                </span>
                <div className="text-3xl font-bold font-mono text-red-500 mt-1">
                  {baselineAqi}
                </div>
                <span className="text-xs font-semibold text-red-400">
                  {getAqiCategory(baselineAqi).category}
                </span>
              </div>

              <div className="border-l border-slate-800 pl-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
                  Simulated AQI
                </span>
                <div className="text-3xl font-bold font-mono text-emerald-400 mt-1">
                  {predictedAqi}
                </div>
                <span className="text-xs font-semibold text-emerald-400">
                  {getAqiCategory(predictedAqi).category}
                </span>
              </div>
            </div>

            {/* Reduction Metric */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
              <span className="text-slate-300">Net Particulate Load Reduction:</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">
                - {aqiReduction} AQI ({percentReduction}%)
              </span>
            </div>

            {/* Disruption vs Efficacy Tradeoff */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1">
                  <CircleDollarSign className="w-3.5 h-3.5 text-amber-400" />
                  Economic & Supply Chain Disruption Index:
                </span>
                <span className="font-mono font-bold text-amber-400">
                  {economicDisruptionIndex} / 100
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${economicDisruptionIndex}%` }}
                ></div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleSimulate}
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Apply Scenario to Airshed Model</span>
              </button>

              <button
                onClick={() => onOpenAiPolicyAnalysis(sliders, predictedAqi)}
                className="w-full py-2 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Simulate with Gemini 3.1 Pro (High Thinking)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
