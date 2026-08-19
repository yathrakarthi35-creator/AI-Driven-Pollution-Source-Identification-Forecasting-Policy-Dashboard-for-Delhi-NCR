import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  ShieldAlert,
  SlidersHorizontal,
  RotateCcw,
  AlertOctagon,
  Factory,
  CheckCircle2,
  Volume2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type DemoScenarioId = 'baseline' | 'stubble_inversion' | 'policy_intervention' | 'industrial_spike';

export interface DemoScenarioConfig {
  id: DemoScenarioId;
  name: string;
  nameHi: string;
  badge: string;
  description: string;
  descriptionHi: string;
  targetGrapStage: 'I' | 'II' | 'III' | 'IV';
  aqiMultiplier: number;
  fireCount: number;
  pblHeightDelta: number;
  trafficReduction: number;
  highlightStationId?: string;
  accentColor: string;
}

export const DEMO_SCENARIOS: Record<DemoScenarioId, DemoScenarioConfig> = {
  baseline: {
    id: 'baseline',
    name: 'Normal Telemetry (Baseline)',
    nameHi: 'सामान्य स्थिति (आधारभूत)',
    badge: 'LIVE CAAQMS',
    description: 'Ground baseline data from 10 Continuous Ambient Air Quality Monitoring Stations in Delhi-NCR.',
    descriptionHi: 'दिल्ली-एनसीआर में 10 निगरानी स्टेशनों से सामान्य जमीनी डेटा।',
    targetGrapStage: 'III',
    aqiMultiplier: 1.0,
    fireCount: 23,
    pblHeightDelta: 0,
    trafficReduction: 0,
    accentColor: 'text-emerald-400',
  },
  stubble_inversion: {
    id: 'stubble_inversion',
    name: 'Crisis: Stubble Surge + Nocturnal Inversion',
    nameHi: 'आपातकाल: पराली धुआं + वायु इनवर्जन',
    badge: 'GRAP IV SEVERE+',
    description: 'Simulates 52 NASA VIIRS fire clusters with stagnant NW winds & 210m inversion compressing smoke into Delhi.',
    descriptionHi: '52 उपग्रह पराली आग क्लस्टर और 210 मीटर इनवर्जन परत के साथ गंभीर वायु आपातकाल का सिमुलेशन।',
    targetGrapStage: 'IV',
    aqiMultiplier: 1.38,
    fireCount: 52,
    pblHeightDelta: -170,
    trafficReduction: 0,
    highlightStationId: 'anand-vihar',
    accentColor: 'text-red-500',
  },
  policy_intervention: {
    id: 'policy_intervention',
    name: 'Policy Action: Odd-Even & Construction Ban',
    nameHi: 'नीतिगत हस्तक्षेप: सम-विषम एवं निर्माण रोक',
    badge: 'MITIGATION ACTIVE',
    description: 'Simulates enforcement of 50% traffic reduction, anti-smog water cannons, and industrial curbs.',
    descriptionHi: '50% यातायात कमी, एंटी-स्मॉग गन एवं औद्योगिक नियंत्रण के प्रभाव का सिमुलेशन।',
    targetGrapStage: 'II',
    aqiMultiplier: 0.72,
    fireCount: 15,
    pblHeightDelta: +120,
    trafficReduction: 50,
    accentColor: 'text-cyan-400',
  },
  industrial_spike: {
    id: 'industrial_spike',
    name: 'Chemical & Industrial Plume Surge',
    nameHi: 'औद्योगिक एवं रासायनिक गैस उत्सर्जन स्पाइक',
    badge: 'TOXIC GAS ALERT',
    description: 'Simulates localized industrial NO2 & SO2 surge across Ghaziabad & East Delhi transport corridors.',
    descriptionHi: 'गाजियाबाद एवं पूर्वी दिल्ली में नाइट्रोजन डाइऑक्साइड और सल्फर डाइऑक्साइड का तीव्र स्थानीय उत्सर्जन।',
    targetGrapStage: 'IV',
    aqiMultiplier: 1.25,
    fireCount: 28,
    pblHeightDelta: -80,
    trafficReduction: 10,
    highlightStationId: 'anand-vihar',
    accentColor: 'text-amber-400',
  },
};

interface CrisisDemoControllerProps {
  activeScenario: DemoScenarioId;
  onSelectScenario: (scenario: DemoScenarioId) => void;
  onResetToLive: () => void;
}

export const CrisisDemoController: React.FC<CrisisDemoControllerProps> = ({
  activeScenario,
  onSelectScenario,
  onResetToLive,
}) => {
  const { language, t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const isSimulating = activeScenario !== 'baseline';

  const triggerAudioBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.16);
    } catch {
      // ignore audio context restrictions
    }
  };

  const handleScenarioChange = (id: DemoScenarioId) => {
    triggerAudioBeep();
    onSelectScenario(id);
  };

  const currentConfig = DEMO_SCENARIOS[activeScenario];

  return (
    <div className={`transition-all duration-300 border-b ${
      isSimulating
        ? 'bg-gradient-to-r from-red-950/80 via-slate-950 to-amber-950/80 border-red-500/40 shadow-[0_4px_20px_rgba(220,38,38,0.2)]'
        : 'bg-[#090d16] border-slate-800/80'
    }`}>
      {/* Top Banner Bar */}
      <div className="max-w-[1700px] mx-auto px-4 py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Left Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded flex items-center justify-center shrink-0 ${
            isSimulating ? 'bg-red-600 text-white animate-pulse' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
          </div>

          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
              isSimulating ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              {t.demoModeBadge}
            </span>

            {isSimulating ? (
              <span className="text-xs font-bold text-red-400 truncate flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
                <span>{language === 'hi' ? currentConfig.nameHi : currentConfig.name}</span>
                <span className="text-[10px] text-slate-400 font-normal hidden md:inline">
                  ({t.demoSimulationActive})
                </span>
              </span>
            ) : (
              <span className="text-xs text-slate-300 truncate">
                {t.scenarioBaseline} — <span className="text-emerald-400 font-semibold">{t.engineOnline}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Quick Scenario Selector Pills */}
          <div className="hidden lg:flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-slate-800">
            {(Object.keys(DEMO_SCENARIOS) as DemoScenarioId[]).map((id) => {
              const item = DEMO_SCENARIOS[id];
              const isSelected = activeScenario === id;
              return (
                <button
                  key={id}
                  onClick={() => handleScenarioChange(id)}
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-white text-black shadow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {id === 'stubble_inversion' && <Flame className="w-3 h-3 text-red-500" />}
                  {id === 'policy_intervention' && <ShieldAlert className="w-3 h-3 text-cyan-500" />}
                  {id === 'industrial_spike' && <Factory className="w-3 h-3 text-amber-500" />}
                  {id === 'baseline' && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                  <span>{id === 'baseline' ? 'Live' : id.split('_')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Reset button if simulating */}
          {isSimulating && (
            <button
              onClick={() => {
                triggerAudioBeep();
                onResetToLive();
              }}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-[10px] font-black uppercase tracking-wider rounded flex items-center gap-1 transition-all"
              title={t.resetToLive}
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span>{t.resetToLive}</span>
            </button>
          )}

          {/* Expand/Collapse details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded transition-colors text-xs flex items-center gap-1"
            aria-label="Toggle Demo Controls"
          >
            <span className="text-[10px] uppercase font-bold hidden sm:inline">
              {isExpanded ? 'Hide Scenarios' : 'Scenarios'}
            </span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Scenario Dashboard */}
      {isExpanded && (
        <div className="border-t border-slate-800/80 bg-black/70 px-4 py-3.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="max-w-[1700px] mx-auto space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                {t.selectScenario}
              </span>
              <span className="text-[10px] text-amber-400/90 font-mono flex items-center gap-1">
                <Info className="w-3 h-3" />
                {t.demoDisclaimer}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.keys(DEMO_SCENARIOS) as DemoScenarioId[]).map((id) => {
                const item = DEMO_SCENARIOS[id];
                const isSelected = activeScenario === id;

                return (
                  <div
                    key={id}
                    onClick={() => handleScenarioChange(id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,0.15)] ring-1 ring-cyan-400/50'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.badge}
                      </span>
                      {isSelected && <span className="text-[9px] font-mono text-cyan-400">ACTIVE</span>}
                    </div>

                    <h4 className="text-xs font-bold text-white mt-2 leading-snug">
                      {language === 'hi' ? item.nameHi : item.name}
                    </h4>

                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {language === 'hi' ? item.descriptionHi : item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
