import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { MultiStationCompareView } from './components/MultiStationCompareView';
import { CrisisDemoController, DemoScenarioId, DEMO_SCENARIOS } from './components/CrisisDemoController';
import { SatelliteStreamView } from './components/SatelliteStreamView';
import { DelhiPrecautionsView } from './components/DelhiPrecautionsView';
import { GisMapView } from './components/GisMapView';
import { PollutionSourcesView } from './components/PollutionSourcesView';
import { AqiForecastView } from './components/AqiForecastView';
import { PolicySimulatorView } from './components/PolicySimulatorView';
import { GrapAlertsView } from './components/GrapAlertsView';
import { FarmFireMonitorView } from './components/FarmFireMonitorView';
import { ReportsView } from './components/ReportsView';
import { DataExplorerView } from './components/DataExplorerView';
import { EmergencyMobileAlertsView } from './components/EmergencyMobileAlertsView';
import { CommunityReportsView } from './components/CommunityReportsView';
import { CommutePlannerView } from './components/CommutePlannerView';
import { IndoorSanctuaryView } from './components/IndoorSanctuaryView';
import { InstitutionalHubView } from './components/InstitutionalHubView';
import { StubbleTrajectoryView } from './components/StubbleTrajectoryView';
import { AudioBroadcastView } from './components/AudioBroadcastView';

import { StationDetailModal } from './components/StationDetailModal';
import { AiHighThinkingModal } from './components/AiHighThinkingModal';
import { GrapGuidelinesModal } from './components/GrapGuidelinesModal';
import { SettingsModal } from './components/SettingsModal';
import { LanguageProvider } from './context/LanguageContext';

import {
  DELHI_NCR_STATIONS,
  NASA_FARM_FIRES,
  GRAP_STAGE_DATA,
} from './data/mockData';
import { MonitoringStation, PolicySliders, GrapStageInfo } from './types';
import { getAqiCategory } from './lib/utils';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Demo Scenario State (Default: baseline live operations)
  const [activeScenario, setActiveScenario] = useState<DemoScenarioId>('baseline');

  // Compute active stations based on scenario without corrupting baseline
  const stations = useMemo<MonitoringStation[]>(() => {
    const config = DEMO_SCENARIOS[activeScenario];
    return DELHI_NCR_STATIONS.map((st) => {
      let scaledAqi = Math.round(st.aqi * config.aqiMultiplier);
      let scaledPm25 = Math.round(st.pm25 * config.aqiMultiplier);
      let scaledPm10 = Math.round(st.pm10 * config.aqiMultiplier);
      let scaledNo2 = st.no2;
      let scaledSo2 = st.so2;
      let pbl = Math.max(180, st.pblHeight + config.pblHeightDelta);

      if (activeScenario === 'industrial_spike' && (st.id === 'anand-vihar' || st.id === 'wazirabad' || st.id === 'noida-sec62')) {
        scaledNo2 = Math.round(st.no2 * 1.85);
        scaledSo2 = Math.round(st.so2 * 2.2);
        scaledAqi = Math.round(scaledAqi * 1.15);
      }

      const catInfo = getAqiCategory(scaledAqi);

      return {
        ...st,
        aqi: scaledAqi,
        category: catInfo.category,
        pm25: scaledPm25,
        pm10: scaledPm10,
        no2: scaledNo2,
        so2: scaledSo2,
        pblHeight: pbl,
        forecast: {
          ...st.forecast,
          now: scaledAqi,
          h24: Math.round(st.forecast.h24 * config.aqiMultiplier),
          h48: Math.round(st.forecast.h48 * config.aqiMultiplier),
          h72: Math.round(st.forecast.h72 * config.aqiMultiplier),
        },
      };
    });
  }, [activeScenario]);

  const [selectedStationId, setSelectedStationId] = useState<string>('anand-vihar');
  const selectedStation = stations.find((s) => s.id === selectedStationId) || stations[0];

  // Farm fires adjusted by scenario
  const farmFires = useMemo(() => {
    const count = DEMO_SCENARIOS[activeScenario].fireCount;
    if (count <= NASA_FARM_FIRES.length) {
      return NASA_FARM_FIRES.slice(0, count);
    }
    // duplicate with slight offsets for high fire scenario
    const extended = [...NASA_FARM_FIRES];
    let idx = 0;
    while (extended.length < count) {
      const base = NASA_FARM_FIRES[idx % NASA_FARM_FIRES.length];
      extended.push({
        ...base,
        id: `fire-ext-${extended.length + 1}`,
        lat: base.lat + (Math.random() - 0.5) * 0.4,
        lng: base.lng + (Math.random() - 0.5) * 0.4,
        brightness: Math.round(base.brightness + Math.random() * 20),
        frp: Math.round(base.frp + Math.random() * 40),
      });
      idx++;
    }
    return extended;
  }, [activeScenario]);

  // GRAP Stage adjusted by scenario
  const grapStage = useMemo<GrapStageInfo>(() => {
    const targetRoman = DEMO_SCENARIOS[activeScenario].targetGrapStage;
    if (targetRoman === 'IV') {
      return {
        ...GRAP_STAGE_DATA,
        stage: 'Stage IV',
        roman: 'IV',
        title: 'Severe+ (> 450 AQI) Emergency Directives',
        aqiRange: '> 450 AQI',
        condition: 'Severe+ / Planetary Inversion Emergency Threshold',
        status: 'Enforced',
        color: 'red',
      };
    }
    if (targetRoman === 'II') {
      return {
        ...GRAP_STAGE_DATA,
        stage: 'Stage II',
        roman: 'II',
        title: 'Very Poor (301-400 AQI) Targeted Curbs',
        aqiRange: '301 - 400 AQI',
        condition: 'Targeted Mitigation & Odd-Even Ingress Compliance',
        status: 'In Effect',
        color: 'orange',
      };
    }
    return GRAP_STAGE_DATA;
  }, [activeScenario]);

  // Live Satellite Stream Telemetry State
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [livePacketCount, setLivePacketCount] = useState(3420);
  const [liveAod, setLiveAod] = useState(0.82);
  const [activeSatellite, setActiveSatellite] = useState('SENTINEL-5P (TROPOMI)');

  // 1-Second Satellite Telemetry Ingress Tick
  useEffect(() => {
    if (!isLiveStreaming) return;

    const satNames = [
      'SENTINEL-5P (TROPOMI)',
      'SUOMI-NPP (VIIRS)',
      'INSAT-3DR (GEO-IMAGER)',
      'AQUA (MODIS)',
    ];

    const interval = setInterval(() => {
      const now = Date.now();
      setLivePacketCount((prev) => prev + 1);

      // Micro AOD fluctuation
      const aodDelta = Math.sin(now / 8000) * 0.04;
      setLiveAod(Number((0.82 + aodDelta).toFixed(2)));

      // Active sensor cycle
      const satIdx = Math.floor((now / 12000) % 4);
      setActiveSatellite(satNames[satIdx]);
    }, 1000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Active Policy Sliders
  const [activePolicySliders, setActivePolicySliders] = useState<PolicySliders>({
    traffic: 50,
    stubble: 60,
    industry: 40,
    construction: 60,
    trucks: 50,
  });

  // Modal States
  const [inspectStation, setInspectStation] = useState<MonitoringStation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'policy' | 'forecast' | 'general'>('general');
  const [isGrapModalOpen, setIsGrapModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Handler for opening station inspection
  const handleOpenStationDetail = (station: MonitoringStation) => {
    setInspectStation(station);
    setIsDetailModalOpen(true);
  };

  // Handler for opening AI Forecast reasoning
  const handleOpenForecastReasoning = (station: MonitoringStation) => {
    setSelectedStationId(station.id);
    setAiModalMode('forecast');
    setIsAiModalOpen(true);
  };

  // Handler for opening AI Policy deep dive
  const handleOpenAiPolicyAnalysis = (sliders: PolicySliders, _predictedAqi: number) => {
    setActivePolicySliders(sliders);
    setAiModalMode('policy');
    setIsAiModalOpen(true);
  };

  // Handler for opening Sources modal / navigating to sources tab
  const handleOpenSourcesModal = () => {
    setCurrentTab('sources');
  };

  return (
    <LanguageProvider>
      <div className="flex h-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden select-none">
        {/* 1. Left Navigation Sidebar (Desktop) */}
        <div className="hidden md:flex shrink-0 h-full">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            activeStage={grapStage.roman}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        </div>

        {/* 1b. Mobile Navigation Drawer with Backdrop */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-72 h-full bg-[#080c16] shadow-2xl">
              <Sidebar
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
                activeStage={grapStage.roman}
                onOpenSettings={() => {
                  setIsMobileSidebarOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                onCloseMobileDrawer={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* 2. Main Dashboard Content Column */}
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          {/* Global Top Header Bar */}
          <Header
            selectedStation={selectedStation}
            stations={stations}
            onSelectStation={(s) => setSelectedStationId(s.id)}
            onOpenAiReasoning={() => {
              setAiModalMode('general');
              setIsAiModalOpen(true);
            }}
            onOpenGrapModal={() => setIsGrapModalOpen(true)}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenMobileAlerts={() => setCurrentTab('mobile_alerts')}
            onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            isMobileSidebarOpen={isMobileSidebarOpen}
          />

          {/* SIH Live Demo & Crisis Scenario Controller */}
          <CrisisDemoController
            activeScenario={activeScenario}
            onSelectScenario={setActiveScenario}
            onResetToLive={() => setActiveScenario('baseline')}
          />

          {/* Scrollable View Container */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#070a12]">
            <div className="max-w-[1700px] mx-auto">
              {currentTab === 'dashboard' && (
                <DashboardView
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(s) => setSelectedStationId(s.id)}
                  farmFires={farmFires}
                  grapStage={grapStage}
                  onOpenStationDetail={handleOpenStationDetail}
                  onOpenForecastReasoning={handleOpenForecastReasoning}
                  onOpenSourcesModal={handleOpenSourcesModal}
                  onOpenAiPolicyAnalysis={handleOpenAiPolicyAnalysis}
                  onOpenGrapModal={() => setIsGrapModalOpen(true)}
                  onOpenMobileAlerts={() => setCurrentTab('mobile_alerts')}
                  onSelectTab={setCurrentTab}
                />
              )}

              {currentTab === 'compare' && (
                <MultiStationCompareView
                  stations={stations}
                  onOpenStationDetail={handleOpenStationDetail}
                  onOpenAiReasoning={() => {
                    setAiModalMode('general');
                    setIsAiModalOpen(true);
                  }}
                />
              )}

              {currentTab === 'mobile_alerts' && (
                <EmergencyMobileAlertsView
                  stations={stations}
                  selectedStation={selectedStation}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'community_reports' && (
                <CommunityReportsView
                  stations={stations}
                  selectedStation={selectedStation}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'commute_planner' && (
                <CommutePlannerView
                  stations={stations}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'indoor_sanctuary' && (
                <IndoorSanctuaryView
                  stations={stations}
                  selectedStation={selectedStation}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'institutional_hub' && (
                <InstitutionalHubView
                  stations={stations}
                  selectedStation={selectedStation}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'stubble_trajectory' && (
                <StubbleTrajectoryView
                  stations={stations}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'audio_broadcast' && (
                <AudioBroadcastView
                  stations={stations}
                  selectedStation={selectedStation}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'satellite' && (
                <SatelliteStreamView
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(s) => setSelectedStationId(s.id)}
                  isLiveStreaming={isLiveStreaming}
                  onToggleStreaming={() => setIsLiveStreaming(!isLiveStreaming)}
                  livePacketCount={livePacketCount}
                  liveAod={liveAod}
                  activeSatellite={activeSatellite}
                />
              )}

              {currentTab === 'forecast' && (
                <AqiForecastView
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(s) => setSelectedStationId(s.id)}
                  onOpenForecastReasoning={handleOpenForecastReasoning}
                />
              )}

              {currentTab === 'precautions' && (
                <DelhiPrecautionsView
                  stations={stations}
                  selectedStation={selectedStation}
                  grapStage={grapStage}
                />
              )}

              {currentTab === 'gis_map' && (
                <GisMapView
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(s) => setSelectedStationId(s.id)}
                  farmFires={farmFires}
                  onOpenStationDetail={handleOpenStationDetail}
                />
              )}

              {currentTab === 'sources' && (
                <PollutionSourcesView
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(s) => setSelectedStationId(s.id)}
                />
              )}

              {currentTab === 'policy_sim' && (
                <PolicySimulatorView
                  stations={stations}
                  selectedStation={selectedStation}
                  onOpenAiPolicyAnalysis={handleOpenAiPolicyAnalysis}
                />
              )}

              {currentTab === 'grap_alerts' && (
                <GrapAlertsView grapStage={grapStage} />
              )}

              {currentTab === 'farm_fires' && (
                <FarmFireMonitorView farmFires={farmFires} />
              )}

              {currentTab === 'reports' && (
                <ReportsView stations={stations} grapStage={grapStage} />
              )}

              {currentTab === 'data_explorer' && (
                <DataExplorerView
                  stations={stations}
                  onSelectStation={(s) => setSelectedStationId(s.id)}
                  onOpenStationDetail={handleOpenStationDetail}
                />
              )}
            </div>
          </main>
        </div>

        {/* 3. Global Interactive Modals */}
        <StationDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          station={inspectStation}
          onOpenForecastReasoning={handleOpenForecastReasoning}
        />

        <AiHighThinkingModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          selectedStation={selectedStation}
          grapStage={grapStage}
          policySliders={activePolicySliders}
          initialMode={aiModalMode}
        />

        <GrapGuidelinesModal
          isOpen={isGrapModalOpen}
          onClose={() => setIsGrapModalOpen(false)}
          grapStage={grapStage}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      </div>
    </LanguageProvider>
  );
}
