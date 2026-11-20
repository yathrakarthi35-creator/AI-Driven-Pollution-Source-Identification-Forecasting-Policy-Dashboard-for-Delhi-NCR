import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ErrorBoundary } from './components/ErrorBoundary';

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

// Code-split secondary views for faster initial bundle load (Efficiency)
const SatelliteStreamView = lazy(() =>
  import('./components/SatelliteStreamView').then((m) => ({ default: m.SatelliteStreamView }))
);
const DelhiPrecautionsView = lazy(() =>
  import('./components/DelhiPrecautionsView').then((m) => ({ default: m.DelhiPrecautionsView }))
);
const GisMapView = lazy(() =>
  import('./components/GisMapView').then((m) => ({ default: m.GisMapView }))
);
const PollutionSourcesView = lazy(() =>
  import('./components/PollutionSourcesView').then((m) => ({ default: m.PollutionSourcesView }))
);
const AqiForecastView = lazy(() =>
  import('./components/AqiForecastView').then((m) => ({ default: m.AqiForecastView }))
);
const PolicySimulatorView = lazy(() =>
  import('./components/PolicySimulatorView').then((m) => ({ default: m.PolicySimulatorView }))
);
const GrapAlertsView = lazy(() =>
  import('./components/GrapAlertsView').then((m) => ({ default: m.GrapAlertsView }))
);
const FarmFireMonitorView = lazy(() =>
  import('./components/FarmFireMonitorView').then((m) => ({ default: m.FarmFireMonitorView }))
);
const ReportsView = lazy(() =>
  import('./components/ReportsView').then((m) => ({ default: m.ReportsView }))
);
const DataExplorerView = lazy(() =>
  import('./components/DataExplorerView').then((m) => ({ default: m.DataExplorerView }))
);
const EmergencyMobileAlertsView = lazy(() =>
  import('./components/EmergencyMobileAlertsView').then((m) => ({ default: m.EmergencyMobileAlertsView }))
);
const CommunityReportsView = lazy(() =>
  import('./components/CommunityReportsView').then((m) => ({ default: m.CommunityReportsView }))
);
const CommutePlannerView = lazy(() =>
  import('./components/CommutePlannerView').then((m) => ({ default: m.CommutePlannerView }))
);
const IndoorSanctuaryView = lazy(() =>
  import('./components/IndoorSanctuaryView').then((m) => ({ default: m.IndoorSanctuaryView }))
);
const InstitutionalHubView = lazy(() =>
  import('./components/InstitutionalHubView').then((m) => ({ default: m.InstitutionalHubView }))
);
const StubbleTrajectoryView = lazy(() =>
  import('./components/StubbleTrajectoryView').then((m) => ({ default: m.StubbleTrajectoryView }))
);
const AudioBroadcastView = lazy(() =>
  import('./components/AudioBroadcastView').then((m) => ({ default: m.AudioBroadcastView }))
);

const ViewLoadingFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex items-center justify-center py-16 text-sm text-slate-300"
  >
    Loading environmental telemetry module...
  </div>
);

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [stations, setStations] = useState<MonitoringStation[]>(DELHI_NCR_STATIONS);
  const [selectedStation, setSelectedStation] = useState<MonitoringStation>(DELHI_NCR_STATIONS[0]);
  const [farmFires] = useState(NASA_FARM_FIRES);
  const [grapStage] = useState(GRAP_STAGE_DATA);

  // Live Satellite Stream Telemetry State
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const [livePacketCount, setLivePacketCount] = useState(3420);
  const [liveAod, setLiveAod] = useState(0.82);
  const [activeSatellite, setActiveSatellite] = useState('SENTINEL-5P (TROPOMI)');

  // Throttled 3-second telemetry update to reduce unnecessary full-tree re-renders
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
      setLivePacketCount((prev) => prev + 3);
      const aodDelta = Math.sin(now / 8000) * 0.04;
      setLiveAod(Number((0.82 + aodDelta).toFixed(2)));
      setActiveSatellite(satNames[Math.floor((now / 12000) % 4)]);
      setStations((prevStations) =>
        prevStations.map((st) => {
          const jitter = (Math.random() - 0.5) * 0.4;
          return {
            ...st,
            liveRateOfChange: Number((st.liveRateOfChange || 0.1) + jitter * 0.05),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  const [activePolicySliders, setActivePolicySliders] = useState<PolicySliders>({
    traffic: 50,
    stubble: 60,
    industry: 40,
    construction: 60,
    trucks: 50,
  });

  const [inspectStation, setInspectStation] = useState<MonitoringStation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalMode, setAiModalMode] = useState<'policy' | 'forecast' | 'general'>('general');
  const [isGrapModalOpen, setIsGrapModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenStationDetail = useCallback((station: MonitoringStation) => {
    setInspectStation(station);
    setIsDetailModalOpen(true);
  }, []);

  const handleOpenForecastReasoning = useCallback((station: MonitoringStation) => {
    setSelectedStation(station);
    setAiModalMode('forecast');
    setIsAiModalOpen(true);
  }, []);

  const handleOpenAiPolicyAnalysis = useCallback((sliders: PolicySliders, _predictedAqi: number) => {
    setActivePolicySliders(sliders);
    setAiModalMode('policy');
    setIsAiModalOpen(true);
  }, []);

  const handleOpenSourcesModal = useCallback(() => {
    setCurrentTab('sources');
  }, []);

  const handleOpenGeneralAi = useCallback(() => {
    setAiModalMode('general');
    setIsAiModalOpen(true);
  }, []);

  return (
    <div className="flex h-screen bg-[#070b14] text-slate-100 font-sans overflow-hidden">
      {/* WCAG 2.4.1 Bypass Blocks: Keyboard Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:ring-2 focus:ring-sky-400"
      >
        Skip to main content
      </a>

      {/* Polite Screen-Reader Live Announcer */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Active view: {currentTab.replace(/_/g, ' ')}. Selected station: {selectedStation.name}, AQI {selectedStation.aqi}.
      </div>

      {/* 1. Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeStage={grapStage.roman}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* 2. Main Dashboard Content Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header
          selectedStation={selectedStation}
          stations={stations}
          onSelectStation={setSelectedStation}
          onOpenAiReasoning={handleOpenGeneralAi}
          onOpenGrapModal={() => setIsGrapModalOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenMobileAlerts={() => setCurrentTab('mobile_alerts')}
        />

        <main
          id="main-content"
          tabIndex={-1}
          aria-label="Delhi-NCR Air Quality Dashboard Content"
          className="flex-1 overflow-y-auto p-3 sm:p-5 bg-[#080808] focus:outline-none"
        >
          <div className="max-w-[1700px] mx-auto">
            <ErrorBoundary>
              <Suspense fallback={<ViewLoadingFallback />}>
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
                  <CommutePlannerView stations={stations} grapStage={grapStage} />
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
                  <StubbleTrajectoryView stations={stations} grapStage={grapStage} />
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

                {currentTab === 'grap_alerts' && <GrapAlertsView grapStage={grapStage} />}
                {currentTab === 'farm_fires' && <FarmFireMonitorView farmFires={farmFires} />}
                {currentTab === 'reports' && <ReportsView stations={stations} grapStage={grapStage} />}
                {currentTab === 'data_explorer' && (
                  <DataExplorerView
                    stations={stations}
                    onSelectStation={setSelectedStation}
                    onOpenStationDetail={handleOpenStationDetail}
                  />
                )}
              </Suspense>
            </ErrorBoundary>
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
