import React, { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  PieChart,
  TrendingUp,
  SlidersHorizontal,
  AlertOctagon,
  Flame,
  FileText,
  Database,
  Settings,
  ShieldAlert,
  Terminal,
  Smartphone,
  Navigation,
  Home,
  GraduationCap,
  Compass,
  Radio,
  Users,
  Columns,
  ChevronDown,
  ChevronRight,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type NavTab =
  | 'dashboard'
  | 'compare'
  | 'satellite'
  | 'mobile_alerts'
  | 'community_reports'
  | 'commute_planner'
  | 'indoor_sanctuary'
  | 'institutional_hub'
  | 'stubble_trajectory'
  | 'audio_broadcast'
  | 'forecast'
  | 'precautions'
  | 'gis_map'
  | 'sources'
  | 'policy_sim'
  | 'grap_alerts'
  | 'farm_fires'
  | 'reports'
  | 'data_explorer';

interface NavItemConfig {
  id: NavTab;
  labelKey: string;
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

interface PillarGroup {
  id: string;
  titleKey: string;
  defaultTitle: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItemConfig[];
}

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeStage: string;
  onOpenSettings: () => void;
  onCloseMobileDrawer?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeStage = 'III',
  onOpenSettings,
  onCloseMobileDrawer,
}) => {
  const { t } = useLanguage();

  // Accordion open/collapse state for 4 pillars
  const [openPillars, setOpenPillars] = useState<Record<string, boolean>>({
    command: true,
    intelligence: true,
    governance: true,
    citizen: true,
  });

  const togglePillar = (id: string) => {
    setOpenPillars((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleTabClick = (id: string) => {
    onSelectTab(id);
    if (onCloseMobileDrawer) {
      onCloseMobileDrawer();
    }
  };

  // 4 Mission Pillars
  const pillars: PillarGroup[] = [
    {
      id: 'command',
      titleKey: 'pillarCommand',
      defaultTitle: 'Live Airshed Command',
      icon: Activity,
      items: [
        { id: 'dashboard', labelKey: 'tabDashboard', defaultLabel: 'Command Center', icon: LayoutDashboard },
        { id: 'compare', labelKey: 'tabCompare', defaultLabel: 'Multi-Station Compare', icon: Columns, badge: 'NEW', badgeColor: 'bg-cyan-500 text-black' },
        { id: 'gis_map', labelKey: 'tabGisMap', defaultLabel: 'GIS Airshed Map', icon: Map },
        { id: 'satellite', labelKey: 'tabSatellite', defaultLabel: 'Satellite Stream (1s)', icon: Terminal, badge: '1s', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' },
        { id: 'data_explorer', labelKey: 'tabDataExplorer', defaultLabel: 'Sensor Data Table', icon: Database },
      ],
    },
    {
      id: 'intelligence',
      titleKey: 'pillarIntelligence',
      defaultTitle: 'AI & Predictive Intelligence',
      icon: Sparkles,
      items: [
        { id: 'forecast', labelKey: 'tabForecast', defaultLabel: '24-72h Rate Predication', icon: TrendingUp },
        { id: 'stubble_trajectory', labelKey: 'tabStubbleTrajectory', defaultLabel: 'Stubble Smoke Plumes', icon: Compass },
        { id: 'sources', labelKey: 'tabSources', defaultLabel: 'Pollution Sources', icon: PieChart },
        { id: 'policy_sim', labelKey: 'tabPolicySim', defaultLabel: 'Policy Simulator', icon: SlidersHorizontal },
      ],
    },
    {
      id: 'governance',
      titleKey: 'pillarGovernance',
      defaultTitle: 'Governance & Compliance',
      icon: Layers,
      items: [
        { id: 'grap_alerts', labelKey: 'tabGrapAlerts', defaultLabel: 'GRAP Action Center', icon: AlertOctagon, badge: `STG ${activeStage}`, badgeColor: 'bg-red-600 text-white' },
        { id: 'farm_fires', labelKey: 'tabFarmFires', defaultLabel: 'Farm Fire Monitor', icon: Flame, badge: '23 HOT', badgeColor: 'bg-orange-500 text-black' },
        { id: 'reports', labelKey: 'tabReports', defaultLabel: 'Decision Support Dossier', icon: FileText },
      ],
    },
    {
      id: 'citizen',
      titleKey: 'pillarCitizenSafety',
      defaultTitle: 'Citizen & Public Safety',
      icon: ShieldAlert,
      items: [
        { id: 'community_reports', labelKey: 'tabCommunityReports', defaultLabel: 'Citizen Incident Reports', icon: Users },
        { id: 'mobile_alerts', labelKey: 'tabMobileAlerts', defaultLabel: 'SMS & Email Alerts', icon: Smartphone, badge: 'LIVE', badgeColor: 'bg-emerald-500 text-black' },
        { id: 'commute_planner', labelKey: 'tabCommutePlanner', defaultLabel: 'Commute & Exposure', icon: Navigation },
        { id: 'indoor_sanctuary', labelKey: 'tabIndoorSanctuary', defaultLabel: 'Indoor Sanctuary CADR', icon: Home },
        { id: 'institutional_hub', labelKey: 'tabInstitutionalHub', defaultLabel: 'Schools & Workplaces', icon: GraduationCap },
        { id: 'audio_broadcast', labelKey: 'tabAudioBroadcast', defaultLabel: 'Voice Audio Bulletin', icon: Radio },
        { id: 'precautions', labelKey: 'tabPrecautions', defaultLabel: 'Delhi Precautions Hub', icon: ShieldAlert },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#080c16] border-r border-slate-800/80 flex flex-col shrink-0 h-full select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#060912]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-white font-black text-xs shadow-[0_0_12px_rgba(220,38,38,0.5)] shrink-0">
            NCR
          </div>
          <div className="min-w-0">
            <h2 className="text-[10px] font-black tracking-[0.25em] uppercase text-cyan-400">
              AIRSHED NODE
            </h2>
            <p className="text-sm font-black tracking-tight text-white truncate">
              DELHI-NCR / CAAQMS
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Navigation Pillars */}
      <nav className="flex-1 px-2.5 py-4 space-y-3 overflow-y-auto">
        {pillars.map((pillar) => {
          const PillarIcon = pillar.icon;
          const isOpen = openPillars[pillar.id] ?? true;
          const translatedPillarTitle = (t as unknown as Record<string, string>)[pillar.titleKey] || pillar.defaultTitle;

          return (
            <div key={pillar.id} className="space-y-1">
              {/* Accordion Pillar Header */}
              <button
                onClick={() => togglePillar(pillar.id)}
                className="w-full flex items-center justify-between px-2.5 py-1.5 text-[10px] font-black tracking-widest uppercase text-slate-400 hover:text-white transition-colors"
              >
                <div className="flex items-center gap-2 truncate">
                  <PillarIcon className="w-3.5 h-3.5 text-cyan-400/80 shrink-0" />
                  <span className="truncate">{translatedPillarTitle}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                )}
              </button>

              {/* Pillar Menu Items */}
              {isOpen && (
                <div className="space-y-0.5 pl-1 animate-in fade-in duration-100">
                  {pillar.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;
                    const translatedLabel = (t as unknown as Record<string, string>)[item.labelKey] || item.defaultLabel;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleTabClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all text-left ${
                          isActive
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.35)] ring-1 ring-white/20'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{translatedLabel}</span>
                        </div>

                        {item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.2 rounded tracking-wider shrink-0 ${
                              isActive ? 'bg-black text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060912] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-slate-400 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t.engineOnline}
          </span>
          <span className="text-cyan-400">SIH 2024</span>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold rounded-lg text-slate-300 hover:text-white transition-colors"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>{t.systemConfig}</span>
        </button>
      </div>
    </aside>
  );
};
