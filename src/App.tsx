import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
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

import {
  DELHI_NCR_STATIONS,
  NASA_FARM_FIRES,
  GRAP_STAGE_DATA,
} from './data/mockData';
import { MonitoringStation, PolicySliders } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stations, setStations] = useState<MonitoringStation[]>(DELHI_NCR_STATIONS);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation>(DELHI_NCR_STATIONS[0]); // Anand Vihar
  const [farmFires] = useState(NASA_FARM_FIRES);
  const [grapStage] = useState(GRAP_STAGE_DATA);

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

      // Micro station telemetry tick for realism
      setStations((prevStations) =>
        prevStations.map((st) => {
          const jitter = (Math.random() - 0.5) * 0.4;
          return {
            ...st,
            liveRateOfChange: Number((st.liveRateOfChange || 0.1) + (jitter * 0.05)),
          };
        })
      );
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
    setSelectedStation(station);
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
    <div className="flex h-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden select-none">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeStage={grapStage.roman}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Dashboard Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Global Top Header Bar */}
        <Header
          selectedStation={selectedStation}
          stations={stations}
          onSelectStation={setSelectedStation}
          onOpenAiReasoning={() => {
            setAiModalMode('general');
            setIsAiModalOpen(true);
          }}
          onOpenGrapModal={() => setIsGrapModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenMobileAlerts={() => setCurrentTab('mobile_alerts')}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#080808]">
          <div className="max-w-[1700px] mx-auto">
            {currentTab === 'dashboard' && (
              <DashboardView
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
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
                onSelectStation={setSelectedStation}
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
                onSelectStation={setSelectedStation}
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
                onSelectStation={setSelectedStation}
                farmFires={farmFires}
                onOpenStationDetail={handleOpenStationDetail}
              />
            )}

            {currentTab === 'sources' && (
              <PollutionSourcesView
                stations={stations}
                selectedStation={selectedStation}
                onSelectStation={setSelectedStation}
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
                onSelectStation={setSelectedStation}
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
  );
}
