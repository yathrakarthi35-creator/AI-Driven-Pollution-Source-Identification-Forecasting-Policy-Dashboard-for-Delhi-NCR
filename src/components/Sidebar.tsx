import React from 'react';
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
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
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

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeStage: string;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeStage = 'III',
  onOpenSettings,
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'community_reports', label: 'Citizen Incident Reports', icon: Users },
    { id: 'mobile_alerts', label: 'SMS & Email Alerts', icon: Smartphone },
    { id: 'commute_planner', label: 'Commute & Exposure', icon: Navigation },
    { id: 'indoor_sanctuary', label: 'Indoor Sanctuary CADR', icon: Home },
    { id: 'institutional_hub', label: 'Schools & Workplaces', icon: GraduationCap },
    { id: 'stubble_trajectory', label: 'Stubble Smoke Plumes', icon: Compass },
    { id: 'audio_broadcast', label: 'Voice Audio Bulletin', icon: Radio },
    { id: 'satellite', label: 'Satellite Stream (1s)', icon: Terminal },
    { id: 'forecast', label: '24-72h Rate Predication', icon: TrendingUp },
    { id: 'precautions', label: 'Delhi Precautions Hub', icon: ShieldAlert },
    { id: 'gis_map', label: 'GIS Airshed Map', icon: Map },
    { id: 'sources', label: 'Pollution Sources', icon: PieChart },
    { id: 'policy_sim', label: 'Policy Simulator', icon: SlidersHorizontal },
    { id: 'grap_alerts', label: 'GRAP Alerts', icon: AlertOctagon },
    { id: 'farm_fires', label: 'Farm Fire Monitor', icon: Flame },
    { id: 'reports', label: 'Executive Reports', icon: FileText },
    { id: 'data_explorer', label: 'Sensor Data Table', icon: Database },
  ];

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col shrink-0 h-full">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-600 flex items-center justify-center text-white font-black text-xs">
            NCR
          </div>
          <div>
            <h2 className="text-xs font-black tracking-[0.25em] uppercase opacity-50">
              TERMINAL ID
            </h2>
            <p className="text-lg font-black tracking-tight text-white">
              SIHI035 / INTEL
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-black tracking-[0.25em] uppercase opacity-40">
          SYSTEM VIEWS
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 text-xs font-black uppercase tracking-wider transition-all text-left ${
                isActive
                  ? 'bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.15)]'
                  : 'text-white/70 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-white/60'}`} />
                <span className="truncate">{item.label}</span>
              </div>

              {item.id === 'mobile_alerts' && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 tracking-widest ${
                    isActive ? 'bg-black text-white' : 'bg-emerald-500 text-black'
                  }`}
                >
                  LIVE
                </span>
              )}

              {item.id === 'grap_alerts' && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 tracking-widest ${
                    isActive ? 'bg-black text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  STG {activeStage}
                </span>
              )}

              {item.id === 'farm_fires' && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 tracking-widest ${
                    isActive ? 'bg-black text-white' : 'bg-orange-500 text-black'
                  }`}
                >
                  23 HOT
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 bg-[#050505] space-y-2">
        <div className="flex items-center justify-between text-[10px] font-black tracking-[0.2em] uppercase opacity-50">
          <span>Engine Status</span>
          <span className="text-emerald-400">ONLINE</span>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-black uppercase tracking-widest text-white transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>System Config</span>
        </button>
      </div>
    </aside>
  );
};
