import React, { useState } from 'react';
import {
  Car,
  Flame,
  Factory,
  Building2,
  Truck,
  Brain,
  RotateCcw,
} from 'lucide-react';
import { PolicySliders } from '../types';
import { getAqiCategory } from '../lib/utils';
import confetti from 'canvas-confetti';

interface PolicySimulatorCardProps {
  currentAqi: number;
  onOpenAiPolicyAnalysis: (sliders: PolicySliders, predictedAqi: number) => void;
}

export const PolicySimulatorCard: React.FC<PolicySimulatorCardProps> = ({
  currentAqi,
  onOpenAiPolicyAnalysis,
}) => {
  const [sliders, setSliders] = useState<PolicySliders>({
    traffic: 50,
    stubble: 60,
    industry: 40,
    construction: 60,
    trucks: 50,
  });

  const [isSimulating, setIsSimulating] = useState(false);

  const trafficImpact = (sliders.traffic / 100) * 0.35;
  const stubbleImpact = (sliders.stubble / 100) * 0.28;
  const industryImpact = (sliders.industry / 100) * 0.18;
  const constructionImpact = (sliders.construction / 100) * 0.12;
  const truckImpact = (sliders.trucks / 100) * 0.14;

  const totalReductionFraction = Math.min(
    0.65,
    (trafficImpact + stubbleImpact + industryImpact + constructionImpact + truckImpact) * 0.4
  );

  const rawReduction = Math.round(currentAqi * totalReductionFraction);
  const predictedAqi = Math.max(65, currentAqi - rawReduction);
  const percentageReduction = Math.round((rawReduction / currentAqi) * 100);

  const handleSimulate = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ef4444', '#ffffff', '#f59e0b'],
      });
    }, 400);
  };

  const handleResetSliders = () => {
    setSliders({
      traffic: 50,
      stubble: 60,
      industry: 40,
      construction: 60,
      trucks: 50,
    });
  };

  const sliderConfigs = [
    { key: 'traffic' as const, label: 'TRAFFIC VOLUME REDUCTION', icon: Car },
    { key: 'stubble' as const, label: 'STUBBLE BURNING ZERO-BURN', icon: Flame },
    { key: 'industry' as const, label: 'INDUSTRIAL CLEAN FUEL SWITCH', icon: Factory },
    { key: 'construction' as const, label: 'CONSTRUCTION & DUST STOP', icon: Building2 },
    { key: 'trucks' as const, label: 'NON-ESSENTIAL TRUCK BORDER BAN', icon: Truck },
  ];

  return (
    <div className="bg-[#0f0f0f] border border-white/10 p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-60 text-white">
          POLICY SANDBOX / ATMOSPHERIC RESPONSE
        </h3>
        <button
          onClick={handleResetSliders}
          className="text-[10px] font-black uppercase tracking-wider text-white/50 hover:text-white flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>RESET</span>
        </button>
      </div>

      {/* Grid: Sliders & Prediction Box */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Sliders (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          {sliderConfigs.map((cfg) => {
            const value = sliders[cfg.key];
            return (
              <div key={cfg.key} className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
                  <span className="text-white/80">{cfg.label}</span>
                  <span className="text-red-500 font-mono text-xs">{value}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={value}
                  onChange={(e) =>
                    setSliders({ ...sliders, [cfg.key]: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-white/10 appearance-none cursor-pointer accent-red-600 focus:outline-none"
                />
              </div>
            );
          })}
        </div>

        {/* Prediction Box (5 cols) */}
        <div className="md:col-span-5 bg-black border border-white/15 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-center pb-3 border-b border-white/10">
            <div>
              <span className="text-[9px] font-black tracking-[0.2em] uppercase opacity-50 block text-white">
                CURRENT
              </span>
              <div className="text-3xl font-black tracking-tighter text-red-500 mt-1">
                {currentAqi}
              </div>
            </div>

            <div className="border-l border-white/10 pl-2">
              <span className="text-[9px] font-black tracking-[0.2em] uppercase opacity-50 block text-white">
                SIMULATED
              </span>
              <div className="text-3xl font-black tracking-tighter text-yellow-400 mt-1">
                {predictedAqi}
              </div>
            </div>
          </div>

          {/* Abatement Badge */}
          <div className="bg-red-600/20 border border-red-500/40 p-2 text-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
              NET ABATEMENT: -{rawReduction} AQI ({percentageReduction}%)
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full py-2.5 px-3 bg-white hover:bg-white/90 text-black font-black text-xs uppercase tracking-widest transition-all active:scale-[0.98]"
            >
              {isSimulating ? 'COMPUTING DISPERSION...' : 'SIMULATE INTERVENTION'}
            </button>

            <button
              onClick={() => onOpenAiPolicyAnalysis(sliders, predictedAqi)}
              className="w-full py-2 px-3 bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI POLICY DEEP DIVE (3.1 PRO)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
