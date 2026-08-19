import React from 'react';
import { MonitoringStation, FarmFireHotspot, GrapStageInfo, PolicySliders } from '../types';
import { TopMetricCards } from './TopMetricCards';
import { AirQualityMap } from './AirQualityMap';
import { AqiForecastCard } from './AqiForecastCard';
import { TopPollutionSourcesCard } from './TopPollutionSourcesCard';
import { PolicySimulatorCard } from './PolicySimulatorCard';
import { GrapAlertCard } from './GrapAlertCard';
import { BottomStatsBar } from './BottomStatsBar';
import { InteractiveTelemetryChart } from './InteractiveTelemetryChart';
import {
  Smartphone,
  Mail,
  ArrowRight,
  Radio,
  Navigation,
  Home,
  GraduationCap,
  Compass,
  Volume2,
  Sparkles,
  Users,
  Columns,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DashboardViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  onSelectStation: (station: MonitoringStation) => void;
  farmFires: FarmFireHotspot[];
  grapStage: GrapStageInfo;
  onOpenStationDetail: (station: MonitoringStation) => void;
  onOpenForecastReasoning: (station: MonitoringStation) => void;
  onOpenSourcesModal: () => void;
  onOpenAiPolicyAnalysis: (sliders: PolicySliders, predictedAqi: number) => void;
  onOpenGrapModal: () => void;
  onOpenMobileAlerts?: () => void;
  onSelectTab?: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stations,
  selectedStation,
  onSelectStation,
  farmFires,
  grapStage,
  onOpenStationDetail,
  onOpenForecastReasoning,
  onOpenSourcesModal,
  onOpenAiPolicyAnalysis,
  onOpenGrapModal,
  onOpenMobileAlerts,
  onSelectTab,
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* 0. Live Mobile & Email Dispatch Gateway Ribbon */}
      <div className="bg-gradient-to-r from-red-950/40 via-[#0c101c] to-cyan-950/40 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600/20 border border-red-500/50 rounded-lg flex items-center justify-center text-red-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                CITIZEN MOBILE & EMAIL ALERT DISPATCH ENGINE
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2 rounded">
                GATEWAY ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Receiving live emergency broadcasts for <span className="text-white font-bold">{selectedStation.name}</span> (AQI {selectedStation.aqi}) directly to mobile SMS and Email.
            </p>
          </div>
        </div>

        {onOpenMobileAlerts && (
          <button
            onClick={onOpenMobileAlerts}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all border border-slate-700 shrink-0 shadow"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manage SMS/Email Subscriptions</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        )}
      </div>

      {/* 1. Top Metrics Banner (6 Cards) */}
      <TopMetricCards
        station={selectedStation}
        grapStage={grapStage}
        onOpenGrapModal={onOpenGrapModal}
      />

      {/* 2. Middle Row: Air Quality Map (2/3) + Forecast & Sources (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Air Quality Map (8 cols on lg) */}
        <div className="lg:col-span-8">
          <AirQualityMap
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={onSelectStation}
            farmFires={farmFires}
            onOpenStationDetail={onOpenStationDetail}
          />
        </div>

        {/* Right Column: Forecast (Top) + Sources (Bottom) (4 cols on lg) */}
        <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-5">
          <AqiForecastCard
            station={selectedStation}
            onOpenForecastReasoning={onOpenForecastReasoning}
          />
          <TopPollutionSourcesCard
            station={selectedStation}
            onOpenSourcesModal={onOpenSourcesModal}
          />
        </div>
      </div>

      {/* 3. Real-Time Telemetry Curve with Scrubbers */}
      <div>
        <InteractiveTelemetryChart station={selectedStation} initialHorizon="24h" height={220} />
      </div>

      {/* 4. Specialized Operations & Citizen Safety Add-ons Grid */}
      {onSelectTab && (
        <div className="bg-[#0b101d] border border-slate-800 rounded-xl p-4 sm:p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                SPECIALIZED ADVANCED AIR QUALITY MODULES
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">INTEGRATED ECOSYSTEM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Multi-Station Compare Matrix (NEW) */}
            <div
              onClick={() => onSelectTab('compare')}
              className="p-3.5 bg-slate-900/60 border border-cyan-500/40 hover:border-cyan-400 rounded-xl cursor-pointer transition-all hover:bg-slate-900 group shadow"
            >
              <div className="flex items-center justify-between">
                <Columns className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase bg-cyan-500 text-black px-1.5 py-0.2 rounded">
                  NEW
                </span>
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Multi-Station Compare
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Side-by-side differential telemetry & delta variance matrix.
              </p>
            </div>

            {/* 2. Citizen Incident Desk */}
            <div
              onClick={() => onSelectTab('community_reports')}
              className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-cyan-400/60 rounded-xl cursor-pointer transition-all hover:bg-slate-900 group shadow"
            >
              <div className="flex items-center justify-between">
                <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Citizen Incident Desk
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Firestore ground verification & burning reports.
              </p>
            </div>

            {/* 3. Commute & Exposure Planner */}
            <div
              onClick={() => onSelectTab('commute_planner')}
              className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-blue-400/60 rounded-xl cursor-pointer transition-all hover:bg-slate-900 group shadow"
            >
              <div className="flex items-center justify-between">
                <Navigation className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Commute & Inhaled PM2.5
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Dosage calculator for Metro, AC cars, and bikes.
              </p>
            </div>

            {/* 4. Indoor Sanctuary CADR */}
            <div
              onClick={() => onSelectTab('indoor_sanctuary')}
              className="p-3.5 bg-slate-900/60 border border-slate-800 hover:border-emerald-400/60 rounded-xl cursor-pointer transition-all hover:bg-slate-900 group shadow"
            >
              <div className="flex items-center justify-between">
                <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Indoor Sanctuary CADR
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Room volume ACH & nocturnal sealing scheduler.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Bottom Row: Policy Simulator (Half) + GRAP Alert Center (Half) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <PolicySimulatorCard
          currentAqi={selectedStation.aqi}
          onOpenAiPolicyAnalysis={onOpenAiPolicyAnalysis}
        />
        <GrapAlertCard
          grapData={grapStage}
          onOpenGrapModal={onOpenGrapModal}
        />
      </div>

      {/* 6. Bottom Quick Stats Bar */}
      <BottomStatsBar
        activeStationsCount={stations.length}
        totalStationsCount={38}
        farmFiresCount={farmFires.length}
        dataSourcesCount="15+"
        modelAccuracy="92%"
        nextUpdateMin={5}
      />
    </div>
  );
};
