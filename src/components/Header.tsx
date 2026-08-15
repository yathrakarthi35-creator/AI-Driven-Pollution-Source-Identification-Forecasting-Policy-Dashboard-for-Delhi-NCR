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
} from 'lucide-react';
import { MonitoringStation } from '../types';
import { getAqiCategory } from '../lib/utils';
import { auth, signInWithGoogle, logOut } from '../lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';

interface HeaderProps {
  selectedStation: MonitoringStation;
  stations: MonitoringStation[];
  onSelectStation: (station: MonitoringStation) => void;
  onOpenAiReasoning: () => void;
  onOpenGrapModal: () => void;
  onOpenSettings: () => void;
  onOpenMobileAlerts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  selectedStation,
  stations,
  onSelectStation,
  onOpenAiReasoning,
  onOpenGrapModal,
  onOpenSettings,
  onOpenMobileAlerts,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const aqiInfo = getAqiCategory(selectedStation.aqi);

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
    <header className="sticky top-0 z-30 bg-[#0a0a0a] border-b border-white/10 px-4 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-baseline justify-between gap-3">
      {/* Left: Terminal Brand & Station Selector */}
      <div className="flex flex-wrap items-baseline gap-4">
        <div className="flex flex-col">
          <h1 className="text-[10px] sm:text-xs font-black tracking-[0.3em] uppercase opacity-50 text-white">
            System Terminal / Delhi-NCR
          </h1>
          <p className="text-xl sm:text-2xl font-black tracking-tighter text-white">
            POLLUTION INTEL AI <span className="text-red-500">V2.4</span>
          </p>
        </div>

        {/* Station Quick Selector */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase opacity-40 hidden sm:inline">
            Node:
          </span>
          <div className="relative">
            <select
              value={selectedStation.id}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) onSelectStation(found);
              }}
              className="bg-white text-black text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-none border border-white appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id} className="bg-black text-white font-mono">
                  {s.name} ({s.aqi} AQI)
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-black absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Right: AQI Status & Quick Action Buttons */}
      <div className="flex items-center gap-3 sm:gap-4 self-end md:self-auto">
        {/* Local AQI Status Badge */}
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black tracking-[0.2em] uppercase opacity-50">
            Current Airshed Status
          </p>
          <p className="text-base font-black tracking-tight text-red-500">
            {selectedStation.aqi} / {aqiInfo.category.toUpperCase()}
          </p>
        </div>

        {/* Gemini 3.1 Pro High-Thinking Reasoning Button */}
        <button
          onClick={onOpenAiReasoning}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(220,38,38,0.4)]"
        >
          <Brain className="w-4 h-4 text-white animate-pulse" />
          <span className="hidden sm:inline">AI Reasoning (High Thinking)</span>
          <span className="sm:hidden">AI Intel</span>
        </button>

        {/* Mobile SMS & Email Alerts Button */}
        {onOpenMobileAlerts && (
          <button
            onClick={onOpenMobileAlerts}
            className="flex items-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-emerald-500/40 text-emerald-400 text-xs font-black uppercase tracking-wider transition-colors"
            title="Mobile SMS & Email Emergency Alerts"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="hidden md:inline">SMS & Email Alerts</span>
          </button>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-[9px] font-black text-white flex items-center justify-center">
              3
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0a0a0a] border border-white/20 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white">
                  System Alerts & Directives
                </span>
                <span className="text-[10px] font-bold text-red-500">3 UNRESOLVED</span>
              </div>
              <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
                {notifications.map((n) => {
                  const NIcon = n.icon;
                  return (
                    <div
                      key={n.id}
                      className="p-3 bg-white/5 hover:bg-white/10 border-l-4 border-red-600 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <NIcon className={`w-4 h-4 mt-0.5 shrink-0 ${n.color}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black uppercase text-white tracking-wide">
                              {n.title}
                            </h4>
                            <span className="text-[9px] font-mono opacity-50">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-white/70 mt-1 leading-snug">
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
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/15 text-white transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Google Sign-In & Auth Status */}
        {user ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/15">
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
              className="p-1.5 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 border border-white/10 transition-colors text-[10px] font-black uppercase flex items-center gap-1"
              title="Sign Out"
            >
              <LogOut className="w-3 h-3" />
              <span className="hidden lg:inline">Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleAuthAction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black hover:bg-white/90 text-xs font-black uppercase tracking-wider transition-all"
            title="Sign In with Google"
          >
            <LogIn className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
