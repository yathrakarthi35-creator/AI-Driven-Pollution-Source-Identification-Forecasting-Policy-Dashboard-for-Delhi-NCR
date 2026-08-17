import React, { useState } from 'react';
import { X, Settings, Bell, RefreshCw, Sliders, Shield, Brain } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [notifications, setNotifications] = useState(true);
  const [modelMode, setModelMode] = useState('gemini-3.1-pro-preview');
  const [highThinking, setHighThinking] = useState(true);
  const [windSimulation, setWindSimulation] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1626] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#0a111e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">System Settings & Telemetry Preferences</h3>
              <p className="text-xs text-slate-400">Delhi-NCR Air Quality Decision Support System</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Telemetry Refresh */}
          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>CAAQMS Sensor Sync Interval</span>
              <span className="font-mono text-emerald-400">{refreshInterval} Minutes</span>
            </label>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none"
            >
              <option value="1">1 Minute (Near-Real-Time)</option>
              <option value="5">5 Minutes (Recommended)</option>
              <option value="15">15 Minutes</option>
              <option value="60">60 Minutes</option>
            </select>
          </div>

          {/* AI Model Settings */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Atmospheric Reasoning & Policy Engine</span>
              <span className="text-emerald-400 font-mono">Proprietary / Built-in</span>
            </label>
            <input
              type="text"
              disabled
              value="Proprietary Atmospheric Reasoning Neural Engine (SIHI035)"
              className="w-full bg-slate-900/60 border border-slate-800 rounded-lg p-2 text-slate-300 font-mono text-[11px]"
            />
          </div>

          {/* Feature Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-300">Continuous Wind Trajectory Vector Simulation</span>
              <input
                type="checkbox"
                checked={windSimulation}
                onChange={(e) => setWindSimulation(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-300">Instant GRAP Threshold Alerts</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) => setNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-purple-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0a111e] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
