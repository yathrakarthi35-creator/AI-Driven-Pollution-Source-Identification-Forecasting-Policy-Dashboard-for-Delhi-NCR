import React, { useState, useEffect } from 'react';
import {
  Bell,
  Brain,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Settings,
  ShieldAlert,
  ChevronDown,
  MapPin,
  Smartphone,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Clock,
  Languages,
} from 'lucide-react';
import { MonitoringStation } from '../types';
import { getAqiCategory } from '../lib/utils';
import { auth, signInWithGoogle, logOut } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useLanguage } from '../context/LanguageContext';

interface HeaderProps {
  selectedStation: MonitoringStation;
  stations: MonitoringStation[];
  onSelectStation: (station: MonitoringStation) => void;
  onOpenAiReasoning: () => void;
  onOpenGrapModal: () => void;
  onOpenSettings: () => void;
  onOpenMobileAlerts?: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedStation,
  stations,
  onSelectStation,
  onOpenAiReasoning,
  onOpenGrapModal,
  onOpenSettings,
  onOpenMobileAlerts,
  onToggleMobileSidebar,
  isMobileSidebarOpen = false,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const aqiInfo = getAqiCategory(selectedStation.aqi);

  // Live IST Ticking Clock
  const [istTime, setIstTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setIstTime(`${formatted} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  const handleAuthAction = async () => {
    if (user) {
      await logOut();
    } else {
      await signInWithGoogle();
    }
  };

  const notifications = [
    {
      id: 1,
      title: 'GRAP STAGE III ENFORCED',
      desc: 'Severe AQI threshold active. Non-essential construction prohibited.',
      time: '10M AGO',
      type: 'critical',
      icon: ShieldAlert,
      color: 'text-red-500',
    },
    {
      id: 2,
      title: 'STUBBLE SMOKE PLUME SURGE',
      desc: '23 NASA VIIRS active fire clusters detected in Punjab/Haryana.',
      time: '25M AGO',
      type: 'warning',
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      id: 3,
      title: 'CAAQMS TELEMETRY RE-SYNC',
      desc: '10 continuous monitoring sensor feeds calibrated successfully.',
      time: '1H AGO',
      type: 'info',
      icon: CheckCircle2,
      color: 'text-emerald-400',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#090d18]/95 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
      {/* Left: Mobile Menu Trigger & Brand / Node Selector */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            aria-label="Toggle navigation drawer"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex flex-col">
          <span className="text-[10px] font-black tracking-[0.25em] uppercase text-cyan-400 hidden sm:inline">
            {t.airshedCommand}
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
              {t.appTitle} <span className="text-red-500 font-mono text-xs">{t.version}</span>
            </h1>
          </div>
        </div>

        {/* Station Node Dropdown */}
        <div className="flex items-center gap-1.5 ml-1 sm:ml-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase hidden lg:inline">
            {t.nodeSelect}
          </span>
          <div className="relative">
            <select
              value={selectedStation.id}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-lg px-2.5 py-1.5 pr-7 cursor-pointer focus:outline-none focus:border-cyan-400"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-950 text-white">
                  {s.name} ({s.aqi} AQI)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right: IST Clock, Language Toggle, AQI Pill & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live Delhi IST Clock */}
        <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{istTime}</span>
        </div>

        {/* Global Bilingual Language Switch */}
        <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-bold">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 py-0.5 rounded transition-all ${
              language === 'en'
                ? 'bg-cyan-500 text-black font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('hi')}
            className={`px-2 py-0.5 rounded transition-all ${
              language === 'hi'
                ? 'bg-cyan-500 text-black font-black shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            हिं
          </button>
        </div>

        {/* Current AQI Quick Badge */}
        <div className="text-right hidden sm:block">
          <span className="text-[9px] font-bold text-slate-400 uppercase block leading-tight">
            {selectedStation.name}
          </span>
          <span className={`text-xs font-black tracking-tight uppercase ${aqiInfo.textClass}`}>
            {selectedStation.aqi} &bull; {selectedStation.category}
          </span>
        </div>

        {/* Gemini 3.1 Pro AI Reasoning Button */}
        <button
          onClick={onOpenAiReasoning}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] shrink-0"
        >
          <Brain className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden md:inline">{t.aiReasoningBtn}</span>
          <span className="md:hidden">AI</span>
        </button>

        {/* Mobile SMS Alerts Button */}
        {onOpenMobileAlerts && (
          <button
            onClick={onOpenMobileAlerts}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-400 text-xs font-bold rounded-lg transition-colors"
            title="Mobile SMS & Email Emergency Alerts"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Alerts</span>
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[9px] font-black text-white rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c101d] border border-slate-700 shadow-2xl rounded-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[11px] font-black uppercase text-white tracking-wider">
                  {t.systemAlertsDirectives}
                </span>
                <span className="text-[10px] font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/30">
                  3 {t.unresolved}
                </span>
              </div>
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const NIcon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-2.5 bg-slate-900/70 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <NIcon className={`w-4 h-4 mt-0.5 shrink-0 ${n.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white uppercase">
                              {n.title}
                            </h4>
                            <span className="text-[9px] font-mono text-slate-400">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-300 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Google Auth Status */}
        {user ? (
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-800">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User'}
                className="w-7 h-7 rounded-full border border-cyan-400"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                {user.displayName ? user.displayName[0] : 'U'}
              </div>
            )}
            <button
              onClick={handleAuthAction}
              className="p-1.5 bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-800 rounded-lg transition-colors text-[10px] font-bold uppercase flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden xl:inline">{t.signOut}</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleAuthAction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-slate-200 text-xs font-black uppercase rounded-lg transition-all"
            title="Sign In with Google"
          >
            <LogIn className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">{t.signIn}</span>
          </button>
        )}
      </div>
    </header>
  );
};
