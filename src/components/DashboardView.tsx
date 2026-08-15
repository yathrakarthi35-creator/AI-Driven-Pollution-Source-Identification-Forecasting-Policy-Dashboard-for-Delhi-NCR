import React from 'react';
import { MonitoringStation, FarmFireHotspot, GrapStageInfo, PolicySliders } from '../types';
import { TopMetricCards } from './TopMetricCards';
import { AirQualityMap } from './AirQualityMap';
import { AqiForecastCard } from './AqiForecastCard';
import { TopPollutionSourcesCard } from './TopPollutionSourcesCard';
import { PolicySimulatorCard } from './PolicySimulatorCard';
import { GrapAlertCard } from './GrapAlertCard';
import { BottomStatsBar } from './BottomStatsBar';
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
} from 'lucide-react';

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
  return (
    <div className="space-y-4 sm:space-y-5 pb-6">
      {/* 0. Live Mobile & Email Dispatch Gateway Ribbon */}
      <div className="bg-gradient-to-r from-red-950/40 via-black to-cyan-950/40 border border-white/10 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-red-400">
                CITIZEN MOBILE & EMAIL ALERT DISPATCH ENGINE
              </span>
              <span className="text-[9px] font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.2">
                GATEWAY ACTIVE
              </span>
            </div>
            <p className="text-xs text-white/80 font-sans mt-0.5">
              Receiving live emergency broadcasts for <span className="text-white font-bold">{selectedStation.name}</span> (AQI {selectedStation.aqi}) directly to mobile SMS and Email.
            </p>
          </div>
        </div>

        {onOpenMobileAlerts && (
          <button
            onClick={onOpenMobileAlerts}
            className="flex items-center gap-2 px-3.5 py-2 bg-white/10 hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-wider transition-all border border-white/20 shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manage SMS/Email Subscriptions</span>
            <ArrowRight className="w-3.5 h-3.5" />
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

      {/* 3. Specialized Operations & Citizen Safety Add-ons Grid */}
      {onSelectTab && (
        <div className="bg-[#0c0c0c] border border-white/10 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                SPECIALIZED ADVANCED AIR QUALITY ADD-ONS
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">INTEGRATED MODULES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* 1. Citizen Incident Desk (Firebase Firestore) */}
            <div
              onClick={() => onSelectTab('community_reports')}
              className="p-3.5 bg-black/60 border border-white/10 hover:border-cyan-400/60 cursor-pointer transition-all hover:bg-black/90 group"
            >
              <div className="flex items-center justify-between">
                <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Citizen Incident Desk
              </h4>
              <p className="text-[10px] text-white/60 mt-1">
                Firestore ground verification & burning reports.
              </p>
            </div>

            {/* 2. Commute & Exposure Planner */}
            <div
              onClick={() => onSelectTab('commute_planner')}
              className="p-3.5 bg-black/60 border border-white/10 hover:border-blue-400/60 cursor-pointer transition-all hover:bg-black/90 group"
            >
              <div className="flex items-center justify-between">
                <Navigation className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Commute & Inhaled PM2.5
              </h4>
              <p className="text-[10px] text-white/60 mt-1">
                Dosage calculator for Metro, AC cars, and bikes.
              </p>
            </div>

            {/* 2. Indoor Sanctuary CADR */}
            <div
              onClick={() => onSelectTab('indoor_sanctuary')}
              className="p-3.5 bg-black/60 border border-white/10 hover:border-emerald-400/60 cursor-pointer transition-all hover:bg-black/90 group"
            >
              <div className="flex items-center justify-between">
                <Home className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Indoor Sanctuary CADR
              </h4>
              <p className="text-[10px] text-white/60 mt-1">
                Room volume ACH & nocturnal sealing scheduler.
              </p>
            </div>

            {/* 3. Schools & Workplaces */}
            <div
              onClick={() => onSelectTab('institutional_hub')}
              className="p-3.5 bg-black/60 border border-white/10 hover:border-purple-400/60 cursor-pointer transition-all hover:bg-black/90 group"
            >
              <div className="flex items-center justify-between">
                <GraduationCap className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Schools & Workplaces
              </h4>
              <p className="text-[10px] text-white/60 mt-1">
                Sports bans, hybrid classes & parent circulars.
              </p>
            </div>

            {/* 4. Stubble Trajectory */}
            <div
              onClick={() => onSelectTab('stubble_trajectory')}
              className="p-3.5 bg-black/60 border border-white/10 hover:border-amber-400/60 cursor-pointer transition-all hover:bg-black/90 group"
            >
              <div className="flex items-center justify-between">
                <Compass className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Stubble Smoke Plumes
              </h4>
              <p className="text-[10px] text-white/60 mt-1">
                HYSPLIT trajectory dispersion & ETA tracking.
              </p>
            </div>

            {/* 5. Voice Audio Bulletin */}
            <div
              onClick={() => onSelectTab('audio_broadcast')}
              className="p-3.5 bg-black/60 border border-white/10 hover:border-rose-400/60 cursor-pointer transition-all hover:bg-black/90 group"
            >
              <div className="flex items-center justify-between">
                <Volume2 className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <ArrowRight className="w-3.5 h-3.5 text-white/40 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="text-xs font-black uppercase text-white mt-2.5">
                Voice Audio Bulletin
              </h4>
              <p className="text-[10px] text-white/60 mt-1">
                60-second spoken radio briefs in English & Hindi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Row: Policy Simulator (Half) + GRAP Alert Center (Half) */}
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

      {/* 5. Bottom Quick Stats Bar */}
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
