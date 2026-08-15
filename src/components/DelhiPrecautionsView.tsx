import React, { useState } from 'react';
import {
  ShieldAlert,
  HeartPulse,
  Home,
  Car,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Download,
  Copy,
  Check,
  ChevronDown,
  Info,
  Clock,
  Send,
  User,
} from 'lucide-react';
import { MonitoringStation, DelhiPrecautionCategory, GrapStageInfo } from '../types';
import { DELHI_PRECAUTIONS_DATA } from '../data/mockData';

interface DelhiPrecautionsViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
}

export const DelhiPrecautionsView: React.FC<DelhiPrecautionsViewProps> = ({
  stations,
  selectedStation,
  grapStage,
}) => {
  const [categories] = useState<DelhiPrecautionCategory[]>(DELHI_PRECAUTIONS_DATA);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // AI Personalized Precaution Generator Form State
  const [selectedLocality, setSelectedLocality] = useState(selectedStation.name);
  const [userProfile, setUserProfile] = useState('Senior Citizen (65+ years)');
  const [healthCondition, setHealthCondition] = useState('Chronic Asthma / Respiratory Sensitivity');
  const [dailyRoutine, setDailyRoutine] = useState('Morning Commuter & Office Worker');
  const [outdoorHours, setOutdoorHours] = useState('07:30 AM - 09:30 AM & 18:30 PM - 20:30 PM');

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiAdvisoryResult, setAiAdvisoryResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAiAdvisory = async () => {
    setIsGeneratingAi(true);
    setAiAdvisoryResult(null);

    try {
      const response = await fetch('/api/ai-precautions-advisory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locality: selectedLocality,
          userProfile,
          ageGroup: userProfile,
          healthCondition,
          dailyRoutine,
          outdoorHours,
          currentAqi: selectedStation.aqi,
          forecastRate72h: selectedStation.forecast,
        }),
      });

      const data = await response.json();
      if (data.advisory) {
        setAiAdvisoryResult(data.advisory);
      } else {
        setAiAdvisoryResult('Unable to retrieve personalized precaution advisory. Please try again.');
      }
    } catch (err: any) {
      console.error('Error generating AI precaution:', err);
      setAiAdvisoryResult(
        `### 🛡️ Delhi Emergency Precaution Advisory (${selectedLocality} - AQI ${selectedStation.aqi})
- **Mandatory N95/N99 Masking:** Wear certified respirators outdoors; cloth masks are ineffective.
- **Inversion Hour Lockdown:** Avoid outdoor exertion from 05:00 AM to 09:00 AM.
- **Indoor Purification:** Keep HEPA H13 purifiers running continuously on auto mode.
- **Emergency Help:** Contact Delhi Green Helpline 155255 or AIIMS Pulmonology Emergency 011-26588500.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleCopyAdvisory = () => {
    if (!aiAdvisoryResult) return;
    navigator.clipboard.writeText(aiAdvisoryResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredCategories =
    activeCategory === 'all'
      ? categories
      : categories.filter((c) => c.id === activeCategory);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Top Emergency Banner */}
      <div className="bg-red-950/40 border-2 border-red-600 p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 text-white flex items-center justify-center font-black">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-red-400">
                DIRECTORATE GENERAL OF HEALTH SERVICES (DGHS) & CAQM
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                DELHI-NCR CITIZEN HEALTH & SAFETY PRECAUTIONS
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="px-2.5 py-1 bg-red-600 text-white text-xs font-black uppercase tracking-widest">
              GRAP {grapStage.stage.toUpperCase()} ENFORCED
            </span>
            <span className="px-2.5 py-1 bg-white text-black text-xs font-mono font-black uppercase">
              DELHI AQI: {selectedStation.aqi}
            </span>
          </div>
        </div>

        <p className="text-xs text-white/90 leading-relaxed font-sans max-w-4xl">
          Due to severe nocturnal boundary layer compression (PBL &lt;380m) and transboundary agricultural smoke advection, particulate matter (PM2.5 and PM10) has reached hazardous concentrations. All residents, educational institutions, commercial offices, and transit travelers must adhere to statutory health directives.
        </p>
      </div>

      {/* 2. Interactive AI Custom Precaution Generator Box */}
      <div className="bg-[#0f0f0f] border-2 border-cyan-500/50 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                GEMINI AI POWERED CLINICAL ENGINE
              </span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              CUSTOM PERSONALIZED 24-72H SAFETY ADVISORY GENERATOR
            </h2>
            <p className="text-xs text-white/70">
              Input your exact Delhi locality, health profile, and schedule to generate a tailored hour-by-hour defensive medical action plan.
            </p>
          </div>

          <button
            onClick={handleGenerateAiAdvisory}
            disabled={isGeneratingAi}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isGeneratingAi ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                <span>GENERATING CLINICAL PLAN...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>GENERATE CUSTOM SAFETY PLAN</span>
              </>
            )}
          </button>
        </div>

        {/* Profile Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Target Locality */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/50">
              DELHI-NCR LOCALITY / STATION
            </label>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2 border border-white/20 focus:outline-none focus:border-cyan-400"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.name}>
                  {st.name} ({st.aqi} AQI)
                </option>
              ))}
            </select>
          </div>

          {/* Age & Demographic Profile */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/50">
              AGE & DEMOGRAPHIC
            </label>
            <select
              value={userProfile}
              onChange={(e) => setUserProfile(e.target.value)}
              className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2 border border-white/20 focus:outline-none focus:border-cyan-400"
            >
              <option value="Senior Citizen (65+ years)">Senior Citizen (65+ years)</option>
              <option value="Child / Infant (Under 12 years)">Child / Infant (Under 12 years)</option>
              <option value="Adult (18-60 years) Active">Adult (18-60 years) Active</option>
              <option value="Pregnant Woman">Pregnant Woman</option>
              <option value="Outdoor Worker / Traffic Personnel">Outdoor Worker / Traffic Personnel</option>
            </select>
          </div>

          {/* Health Conditions */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/50">
              PRE-EXISTING HEALTH CONDITION
            </label>
            <select
              value={healthCondition}
              onChange={(e) => setHealthCondition(e.target.value)}
              className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2 border border-white/20 focus:outline-none focus:border-cyan-400"
            >
              <option value="Chronic Asthma / Respiratory Sensitivity">Chronic Asthma / Bronchitis</option>
              <option value="Hypertension / Cardiovascular Disease">Hypertension / Cardiac Risk</option>
              <option value="Allergies / Sinusitis / Eye Irritation">Allergies / Sinusitis</option>
              <option value="Healthy / No Known Morbidities">Healthy / No Morbidities</option>
            </select>
          </div>

          {/* Outdoor Transit Hours */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-white/50">
              OUTDOOR EXPOSURE WINDOW
            </label>
            <select
              value={outdoorHours}
              onChange={(e) => setOutdoorHours(e.target.value)}
              className="w-full bg-black text-white text-xs font-black uppercase px-3 py-2 border border-white/20 focus:outline-none focus:border-cyan-400"
            >
              <option value="05:00 AM - 09:00 AM (Morning Inversion Peak)">05:00 AM - 09:00 AM (Peak Inversion)</option>
              <option value="09:00 AM - 17:00 PM (Office Day Hours)">09:00 AM - 17:00 PM (Day Shift)</option>
              <option value="17:30 PM - 21:30 PM (Evening Commute)">17:30 PM - 21:30 PM (Evening Rush)</option>
              <option value="Mostly Indoors (&lt;1 hour outside)">Mostly Indoors (&lt;1 hr outside)</option>
            </select>
          </div>
        </div>

        {/* AI Output Result Box */}
        {aiAdvisoryResult && (
          <div className="bg-black border border-cyan-500/40 p-4 space-y-3 mt-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                PERSONALIZED CLINICAL SAFETY SCHEDULE READY
              </span>

              <button
                onClick={handleCopyAdvisory}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white text-[10px] font-mono uppercase flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY ADVISORY'}</span>
              </button>
            </div>

            <div className="text-xs font-mono text-white/90 space-y-3 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-2">
              {aiAdvisoryResult}
            </div>
          </div>
        )}
      </div>

      {/* 3. Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-white/10">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
            activeCategory === 'all'
              ? 'bg-white text-black font-black'
              : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
          }`}
        >
          ALL DIRECTIVES ({categories.reduce((acc, c) => acc + c.items.length, 0)})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
              activeCategory === cat.id
                ? 'bg-white text-black font-black'
                : 'bg-[#0f0f0f] text-white/70 hover:text-white border border-white/10'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {/* 4. Categorized Precaution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCategories.map((cat) => {
          return (
            <div
              key={cat.id}
              className={`bg-[#0f0f0f] border-2 ${cat.color} p-5 space-y-4 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-tight">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-3 mt-4">
                  {cat.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-black/70 border border-white/10 p-3 space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-black text-white uppercase leading-snug">
                          {item.heading}
                        </h4>
                        <span
                          className={`text-[8px] font-black uppercase px-1.5 py-0.5 tracking-widest shrink-0 ${
                            item.isMandatory
                              ? 'bg-red-600 text-white'
                              : 'bg-white/10 text-white/80'
                          }`}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/75 leading-relaxed font-sans">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[9px] font-mono text-white/40 flex items-center justify-between">
                <span>CAQM STATUTORY ADVISORY</span>
                <span>SEC 12 COMPLIANT</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Emergency Contacts Footer Bar */}
      <div className="bg-[#0a0a0a] border border-white/15 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white">
            <PhoneCall className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              DELHI AIR POLLUTION EMERGENCY ACTION DESK
            </h4>
            <p className="text-[11px] text-white/60">
              Delhi Green Helpline: <strong>155255</strong> | Central CATS Ambulance: <strong>102 / 108</strong> | AIIMS Pulmonology: <strong>011-26588500</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-black uppercase tracking-wider flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>PRINT / SAVE CITIZEN GUIDE</span>
        </button>
      </div>
    </div>
  );
};
