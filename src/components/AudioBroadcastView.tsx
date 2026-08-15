import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Radio,
  Languages,
  Mic,
  Sliders,
  CheckCircle2,
  Copy,
  Check,
  Download,
  AlertOctagon,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface AudioBroadcastViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
}

export const AudioBroadcastView: React.FC<AudioBroadcastViewProps> = ({
  stations,
  selectedStation,
  grapStage,
}) => {
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [broadcastScript, setBroadcastScript] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComposing, setIsComposing] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [copied, setCopied] = useState<boolean>(false);

  const avgAqi = Math.round(
    stations.reduce((acc, s) => acc + s.aqi, 0) / (stations.length || 1)
  );
  const peakStation = stations.reduce(
    (max, s) => (s.aqi > max.aqi ? s : max),
    stations[0] || selectedStation
  );

  // Load default script on mount or language switch
  useEffect(() => {
    handleGenerateBroadcastScript(language);
  }, [language]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerateBroadcastScript = async (lang: 'en' | 'hi') => {
    setIsComposing(true);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsPlaying(false);

    try {
      const res = await fetch('/api/voice-briefing-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: lang,
          avgAqi,
          grapStage: grapStage.roman,
          peakStation: peakStation.name,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setBroadcastScript(data.script);
      }
    } catch (err) {
      console.error('Error generating voice briefing script', err);
    } finally {
      setIsComposing(false);
    }
  };

  const [speechWarning, setSpeechWarning] = useState<string | null>(null);

  const handlePlayVoice = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechWarning('Web Speech Synthesis is not available in this preview environment. You can copy the broadcast script directly.');
      setTimeout(() => setSpeechWarning(null), 4000);
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel(); // clear previous

    const utterance = new SpeechSynthesisUtterance(broadcastScript);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find((v) =>
      language === 'hi'
        ? v.lang.startsWith('hi') || v.name.includes('Hindi')
        : v.lang.startsWith('en-IN') || v.lang.startsWith('en')
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setIsPlaying(false);
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to invoke speech synthesis:', err);
      setIsPlaying(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(broadcastScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-black tracking-widest uppercase">
              <Radio className="w-3 h-3 text-rose-500 animate-ping" />
              60-SECOND CITIZEN RADIO & MULTILINGUAL VOICE BROADCAST
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              LANGUAGES: ENGLISH / हिन्दी
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            MULTILINGUAL VOICE AIR ADVISORY & AUDIO BULLETIN
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Automated spoken-word audio briefs for morning commuters, radio broadcast stations, visually impaired citizens, and emergency siren announcements across Delhi-NCR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher Buttons */}
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-2 text-xs font-black uppercase transition-all ${
              language === 'en'
                ? 'bg-rose-600 text-white'
                : 'bg-black text-white/60 border border-white/10 hover:border-white/30'
            }`}
          >
            ENGLISH (EN-IN)
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-3 py-2 text-xs font-black uppercase transition-all ${
              language === 'hi'
                ? 'bg-rose-600 text-white'
                : 'bg-black text-white/60 border border-white/10 hover:border-white/30'
            }`}
          >
            हिन्दी (HINDI)
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Radio Player Console (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#121212] border-2 border-rose-500/40 p-6 rounded-2xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  AIR QUALITY RADIO FREQUENCY 102.6 FM
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 uppercase">
                ON AIR
              </span>
            </div>

            {/* Simulated Dynamic Audio Visualizer Waves */}
            <div className="h-24 bg-black rounded-xl p-4 flex items-end justify-center gap-1.5 border border-white/10 relative overflow-hidden">
              {[18, 35, 60, 85, 45, 95, 70, 50, 80, 100, 65, 40, 90, 75, 30, 85, 55, 92, 40, 65].map(
                (height, i) => (
                  <span
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${
                      isPlaying ? 'bg-rose-500' : 'bg-white/20'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(15, (height * (i % 3 + 1)) % 100)}%` : '15%',
                    }}
                  ></span>
                )
              )}

              <div className="absolute top-2 left-3 text-[9px] font-mono text-white/40 uppercase">
                {isPlaying ? 'VOICE SYNTHESIS ACTIVE • SPEECH STREAMING' : 'AUDIO ENGINE READY'}
              </div>
            </div>

            {speechWarning && (
              <div className="p-2.5 bg-amber-950/60 border border-amber-500/50 rounded text-amber-200 text-xs flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{speechWarning}</span>
              </div>
            )}

            {/* Player Main Controls */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={handlePlayVoice}
                disabled={isComposing || !broadcastScript}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.5)] transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button
                onClick={() => handleGenerateBroadcastScript(language)}
                disabled={isComposing}
                className="p-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Regenerate Voice Script with Gemini 3.1 Pro"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Pitch & Speed Controls */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase text-white/60">
                  <span>VOICE SPEED</span>
                  <span className="font-mono text-rose-400">{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min={0.7}
                  max={1.4}
                  step={0.05}
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-black uppercase text-white/60">
                  <span>VOICE PITCH</span>
                  <span className="font-mono text-rose-400">{speechPitch}x</span>
                </div>
                <input
                  type="range"
                  min={0.8}
                  max={1.3}
                  step={0.05}
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(Number(e.target.value))}
                  className="w-full accent-rose-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Spoken Script & Teleprompter (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-rose-300">
                  SPOKEN BROADCAST TRANSCRIPT ({language === 'hi' ? 'हिन्दी' : 'ENGLISH'})
                </h3>
              </div>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            {isComposing ? (
              <div className="py-12 text-center text-white/50 space-y-2">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs font-mono">DRAFTING 60-SECOND VOICE BROADCAST SCRIPT...</p>
              </div>
            ) : (
              <div className="bg-black/70 p-4 rounded border border-white/10 text-sm font-sans leading-relaxed text-white/90 min-h-[160px]">
                {broadcastScript}
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] font-mono text-white/50 pt-2 border-t border-white/10">
              <span>Airshed Avg: {avgAqi} AQI</span>
              <span>Hotspot: {peakStation.name}</span>
              <span className="text-rose-400 font-bold">GRAP {grapStage.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
