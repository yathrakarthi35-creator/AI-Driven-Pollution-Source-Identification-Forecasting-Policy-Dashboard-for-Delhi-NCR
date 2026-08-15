import React, { useState } from 'react';
import {
  GraduationCap,
  Building2,
  HeartPulse,
  HardHat,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  AlertOctagon,
  Clock,
  Send,
  Copy,
  Check,
  FileSpreadsheet,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface InstitutionalHubViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
}

export const InstitutionalHubView: React.FC<InstitutionalHubViewProps> = ({
  stations,
  selectedStation,
  grapStage,
}) => {
  const [facilityType, setFacilityType] = useState<'School' | 'Hospital' | 'Corporate' | 'Construction'>('School');
  const [occupancyCount, setOccupancyCount] = useState<number>(1400);
  const [outdoorFacility, setOutdoorFacility] = useState<string>('Sports Ground & Open Assembly Area');
  const [aiCircular, setAiCircular] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  // Status computation
  const currentAqi = selectedStation.aqi;
  const isSevere = currentAqi >= 400;
  const isVeryPoor = currentAqi >= 300;

  const handleGenerateAiCircular = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/institutional-guidelines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          institutionType: facilityType,
          studentOrStaffCount: occupancyCount,
          currentAqi,
          grapStage: grapStage.title,
          outdoorFacility,
        }),
      });
      const data = await res.json();
      if (data.circular) {
        setAiCircular(data.circular);
      }
    } catch (err) {
      console.error('Error generating circular', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[10px] font-black tracking-widest uppercase">
              <GraduationCap className="w-3 h-3 text-purple-400 animate-pulse" />
              STATUTORY INSTITUTIONAL SAFETY & PROTOCOL HUB
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              DIRECTIVE UNDER CAQM ACT SECTION 12
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            SCHOOLS, HOSPITALS & WORKPLACES HUB
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Automated operational restrictions, outdoor sports cancellation mandates, HVAC indoor safety standards, and instant statutory circular generator for administrators.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-red-950/40 border border-red-500/40 px-3 py-2 text-right">
            <div className="text-[10px] font-black text-red-400 uppercase">
              CURRENT GRAP: {grapStage.name}
            </div>
            <span className="text-[9px] font-mono text-white/60">
              Station: {selectedStation.name} ({currentAqi} AQI)
            </span>
          </div>
        </div>
      </div>

      {/* Facility Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {[
          { id: 'School', label: 'Schools & Colleges', icon: GraduationCap },
          { id: 'Hospital', label: 'Hospitals & Healthcare', icon: HeartPulse },
          { id: 'Corporate', label: 'Offices & IT Parks', icon: Building2 },
          { id: 'Construction', label: 'Construction Sites', icon: HardHat },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = facilityType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setFacilityType(tab.id as any);
                if (tab.id === 'School') setOccupancyCount(1400);
                if (tab.id === 'Hospital') setOccupancyCount(650);
                if (tab.id === 'Corporate') setOccupancyCount(3200);
                if (tab.id === 'Construction') setOccupancyCount(220);
              }}
              className={`p-3.5 border flex items-center gap-2.5 text-xs font-black uppercase tracking-wider transition-all ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                  : 'bg-black/60 text-white/70 border-white/10 hover:border-white/30'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Statutory Directives & Compliance Matrix (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Active Mandates Matrix */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-500" />
                ACTIVE OPERATIONAL RESTRICTIONS MATRIX
              </h3>
              <span className="text-[10px] font-mono text-red-400">ENFORCED</span>
            </div>

            {facilityType === 'School' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-red-400">
                    <span>🚫 Outdoor Sports & Physical Education: SUSPENDED</span>
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5">MANDATORY</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Zero strenuous outdoor physical activity. Morning prayer assemblies must be conducted inside classrooms or audio broadcast.
                  </p>
                </div>

                <div className="p-3 bg-yellow-950/30 border border-yellow-500/40 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-yellow-400">
                    <span>⚠️ Primary Section (Classes Nursery to V) Transition:</span>
                    <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5">
                      {isSevere ? 'ONLINE ONLY' : 'HYBRID ADVISED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Under GRAP Stage III/IV, state governments mandate transition to online classes for primary school children.
                  </p>
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-cyan-400">
                    <span>🚌 School Bus Fleet & Gate Emission Rules:</span>
                    <span className="text-[9px] bg-cyan-500 text-black px-1.5 py-0.5">BS-VI ONLY</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Diesel bus engine idling within 200m of school perimeter strictly prohibited. Drivers must switch engines off immediately upon parking.
                  </p>
                </div>
              </div>
            )}

            {facilityType === 'Hospital' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-red-400">
                    <span>🏥 Pulmonary & Pediatric ICU Air Pressure:</span>
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5">POSITIVE PRESSURE</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Maintain positive room pressure and continuous HEPA H14 recirculation to protect acute respiratory distress patients.
                  </p>
                </div>

                <div className="p-3 bg-yellow-950/30 border border-yellow-500/40 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-yellow-400">
                    <span>⚡ Emergency DG Set Exemption Compliance:</span>
                    <span className="text-[9px] bg-yellow-500 text-black px-1.5 py-0.5">RETROFIT DUAL-FUEL</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Hospitals are exempt from diesel generator bans for emergency power, but must log operational hours and utilize dual-fuel kits.
                  </p>
                </div>
              </div>
            )}

            {facilityType === 'Corporate' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-purple-950/40 border border-purple-500/50 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-purple-300">
                    <span>💼 50% Work-From-Home (WFH) Mandate:</span>
                    <span className="text-[9px] bg-purple-600 text-white px-1.5 py-0.5">
                      {isSevere ? 'ENFORCED' : 'RECOMMENDED'}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Under GRAP Stage IV, corporate enterprises must shift 50% of staff to remote work to curtail peak vehicular congestion.
                  </p>
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-cyan-400">
                    <span>🏢 Central HVAC MERV-13 Upgrade:</span>
                    <span className="text-[9px] bg-cyan-500 text-black px-1.5 py-0.5">ACTIVE</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Close fresh air intake dampers to minimum statutory baseline (15%) during morning peak (07:00-11:00 AM).
                  </p>
                </div>
              </div>
            )}

            {facilityType === 'Construction' && (
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-red-950/40 border border-red-500/50 rounded space-y-1">
                  <div className="flex items-center justify-between font-black uppercase text-red-400">
                    <span>🛑 Demolition & Earthmoving: COMPLETE BAN</span>
                    <span className="text-[9px] bg-red-600 text-white px-1.5 py-0.5">GRAP STAGE III/IV</span>
                  </div>
                  <p className="text-[11px] text-white/70">
                    Complete prohibition on excavation, dry boring, concrete batching, and unpaved site transit. Anti-smog guns must operate continuously on stored raw materials.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Facility Configuration Inputs */}
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white">
              FACILITY PARAMETERS FOR FORMAL CIRCULAR
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  TOTAL OCCUPANCY / STUDENTS / EMPLOYEES
                </label>
                <input
                  type="number"
                  value={occupancyCount}
                  onChange={(e) => setOccupancyCount(Number(e.target.value))}
                  className="w-full bg-black text-white text-xs font-mono font-bold px-3 py-2 border border-white/20"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  OUTDOOR PREMISES DESCRIPTION
                </label>
                <input
                  type="text"
                  value={outdoorFacility}
                  onChange={(e) => setOutdoorFacility(e.target.value)}
                  placeholder="e.g. Cricket Ground, Open Parking..."
                  className="w-full bg-black text-white text-xs font-sans font-bold px-3 py-2 border border-white/20"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerateAiCircular}
              disabled={isLoadingAi}
              className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50"
            >
              {isLoadingAi ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>DRAFTING STATUTORY DIRECTIVE...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>GENERATE FORMAL PARENT / STAFF CIRCULAR</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: AI Generated Official Administrative Circular (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#0f0f0f] border-2 border-purple-500/40 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
                  FORMAL STATUTORY CIRCULAR
                </h3>
              </div>
              {aiCircular && (
                <button
                  onClick={() => handleCopy(aiCircular)}
                  className="flex items-center gap-1 text-[10px] text-white/60 hover:text-white font-mono"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              )}
            </div>

            {aiCircular ? (
              <div className="text-xs text-white/90 leading-relaxed font-sans whitespace-pre-wrap bg-black/60 p-4 rounded border border-white/10">
                {aiCircular}
              </div>
            ) : (
              <div className="text-center py-10 text-white/50 space-y-2">
                <FileSpreadsheet className="w-10 h-10 mx-auto text-purple-400/50" />
                <p className="text-xs">
                  Click <strong>&quot;Generate Formal Parent / Staff Circular&quot;</strong> to draft an authoritative, legally compliant notice ready for instant distribution.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
