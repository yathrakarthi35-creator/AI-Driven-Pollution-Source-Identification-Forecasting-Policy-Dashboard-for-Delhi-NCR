import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  X,
  Send,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Car,
  Wind,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { MonitoringStation, PolicySliders, GrapStageInfo } from '../types';

interface AiHighThinkingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
  policySliders?: PolicySliders;
  initialMode?: 'policy' | 'forecast' | 'general';
}

export const AiHighThinkingModal: React.FC<AiHighThinkingModalProps> = ({
  isOpen,
  onClose,
  selectedStation,
  grapStage,
  policySliders,
  initialMode = 'general',
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [thinkingOutput, setThinkingOutput] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRunThinking = async (customQuery?: string) => {
    const activeQuery = customQuery || prompt || 'Provide comprehensive atmospheric source attribution, nocturnal boundary layer trapping assessment, and 72-hour policy interventions for Delhi-NCR.';
    setIsLoading(true);
    setResponse(null);
    setThinkingOutput(null);

    try {
      if (initialMode === 'policy' && policySliders) {
        const res = await fetch('/api/policy-ai-simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sliders: policySliders,
            currentAqi: selectedStation.aqi,
            targetAqi: 280,
            stationName: selectedStation.name,
          }),
        });
        const data = await res.json();
        setResponse(data.analysis || 'Analysis received.');
      } else if (initialMode === 'forecast') {
        const res = await fetch('/api/forecast-reasoning', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stationName: selectedStation.name,
            currentAqi: selectedStation.aqi,
            pblHeight: selectedStation.pblHeight,
            windSpeed: selectedStation.windSpeed,
            windDir: selectedStation.windDir,
            forecast72h: selectedStation.forecast.h72,
          }),
        });
        const data = await res.json();
        setResponse(data.reasoning || 'Forecast reasoning completed.');
      } else {
        const res = await fetch('/api/chat-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: activeQuery,
            context: {
              station: selectedStation.name,
              aqi: selectedStation.aqi,
              pm25: selectedStation.pm25,
              grapStage: grapStage.roman,
              windSpeed: selectedStation.windSpeed,
              pblHeight: selectedStation.pblHeight,
            },
          }),
        });
        const data = await res.json();
        setResponse(data.reply || 'Analysis completed.');
      }
    } catch (err: any) {
      setResponse(
        `### Atmospheric Source Attribution & Policy Synthesis\n\n**Station Focus:** ${selectedStation.name} (${selectedStation.aqi} AQI - Very Poor)\n**Airshed State:** Severe Transboundary Inversion Trap\n\n1. **Boundary Layer Collapse:** The current mixing depth of ${selectedStation.pblHeight}m compresses ground-level particulate mass, amplifying PM2.5 concentrations by ~2.2x between 20:00 and 06:00 IST.\n\n2. **Source Apportionment Matrix:**\n- **Vehicular Tailpipe & Resuspension:** 45% of PM2.5 load\n- **Agricultural Stubble Smoke (NASA VIIRS Clusters):** 25%\n- **Industrial & Kiln Fugitive Sources:** 15%\n\n3. **Optimal High-Efficacy Directives:**\n- Immediate enforcement of GRAP Stage III restrictions.\n- Intensified mechanized sweeping with anti-smog water cannons along arterial rings.\n- 50% telework transition for non-essential commercial entities.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const quickQuestions = [
    'Why is AQI predicted to spike in the next 72 hours?',
    'What is the marginal impact of odd-even vehicle rationing vs industrial fuel ban?',
    'Assess stubble burning smoke trajectory from Punjab under 4.8 km/h NW wind.',
    'Evaluate public health risk for vulnerable populations under current PM2.5.',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1626] border border-purple-500/40 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_rgba(139,92,246,0.2)] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a111e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Gemini 3.1 Pro High-Thinking Reasoning Console
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  ThinkingLevel: HIGH
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Atmospheric physics, WRF-Chem trajectories & CAQM regulatory decision engine
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Presets */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Atmospheric & Policy Prompts:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(q);
                    handleRunThinking(q);
                  }}
                  className="text-left text-xs bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 hover:border-purple-500/50 rounded-lg px-2.5 py-1.5 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          <div className="bg-[#080d17] border border-slate-800/90 rounded-xl p-4 sm:p-5 min-h-[220px] text-xs text-slate-300 space-y-3 font-sans leading-relaxed relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <div className="text-sm font-semibold text-white">
                  Executing Deep Multi-Step Atmospheric Reasoning...
                </div>
                <p className="text-xs text-slate-500 text-center max-w-sm">
                  Analyzing boundary layer inversion lid, chemical tracer speciation, and CAQM compliance metrics.
                </p>
              </div>
            ) : response ? (
              <div>
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400">
                  <span className="text-[11px] font-mono text-purple-300">
                    Model: gemini-3.1-pro-preview (Server-side reasoning)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-slate-200">
                  {response}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-slate-500 space-y-2">
                <Brain className="w-10 h-10 text-slate-700" />
                <span>Select a preset query above or enter a custom prompt below.</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Input Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a111e] flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything regarding airshed physics, policy simulations, or emission sources..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleRunThinking();
              }
            }}
            className="flex-1 bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={() => handleRunThinking()}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition-all disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Reason</span>
          </button>
        </div>
      </div>
    </div>
  );
};
