import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Mail,
  BellRing,
  Send,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Sparkles,
  Settings2,
  RefreshCw,
  Copy,
  Check,
  Flame,
  Layers,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Info,
  Sliders,
  Volume2,
  VolumeX,
  Download,
  Code2,
  MessageSquare,
} from 'lucide-react';
import {
  MonitoringStation,
  GrapStageInfo,
  AlertSubscription,
  DispatchedAlertLog,
} from '../types';
import {
  DEFAULT_ALERT_SUBSCRIPTION,
  INITIAL_DISPATCHED_ALERTS,
} from '../data/mockData';
import { auth, saveUserAlertPrefs, getUserAlertPrefs, signInWithGoogle } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface EmergencyMobileAlertsViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
}

export const EmergencyMobileAlertsView: React.FC<EmergencyMobileAlertsViewProps> = ({
  stations,
  selectedStation,
  grapStage,
}) => {
  // Subscription Configuration State
  const [subscription, setSubscription] = useState<AlertSubscription>(DEFAULT_ALERT_SUBSCRIPTION);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Dispatch History Logs
  const [dispatchLogs, setDispatchLogs] = useState<DispatchedAlertLog[]>(INITIAL_DISPATCHED_ALERTS);

  // Test Dispatch State
  const [testChannel, setTestChannel] = useState<'SMS' | 'EMAIL' | 'SMS + EMAIL'>('SMS + EMAIL');
  const [selectedStationId, setSelectedStationId] = useState<string>(selectedStation.id);
  const [isDispatching, setIsDispatching] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dispatchToast, setDispatchToast] = useState<{
    show: boolean;
    title: string;
    msg: string;
    gatewayId: string;
  } | null>(null);

  // AI Alert Draft Composer
  const [isComposingAi, setIsComposingAi] = useState(false);
  const [aiCustomSms, setAiCustomSms] = useState<string>('');
  const [aiCustomEmailSubject, setAiCustomEmailSubject] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Interactive Inbound SMS Chat Simulation
  const [inboundChat, setInboundChat] = useState<Array<{ sender: 'user' | 'caqm'; text: string; time: string }>>([
    {
      sender: 'caqm',
      text: `[CAQM-ALERT] Welcome to Delhi Air Quality Cellular Broadcast. Text AQI, HEALTH, GRAP, or HELP for instant live status.`,
      time: '10:00 AM',
    },
  ]);
  const [smsInput, setSmsInput] = useState('');

  // Audio synthesis helper for EAS / Cell Broadcast Siren
  const playAlertSiren = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(853, now); // EAS tone 1
      osc2.frequency.setValueAtTime(960, now); // EAS tone 2

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.6);
      osc2.stop(now + 0.6);
    } catch (e) {
      console.warn('AudioContext not allowed or supported', e);
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Load latest subscription & logs from server and Firestore on mount
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const firestorePrefs = await getUserAlertPrefs(user.uid);
          if (firestorePrefs) {
            setSubscription((prev) => ({
              ...prev,
              phoneNumber: firestorePrefs.phone || prev.phoneNumber,
              emailAddress: firestorePrefs.email || prev.emailAddress,
              smsAlertsEnabled: firestorePrefs.smsEnabled !== undefined ? firestorePrefs.smsEnabled : prev.smsAlertsEnabled,
              emailAlertsEnabled: firestorePrefs.emailEnabled !== undefined ? firestorePrefs.emailEnabled : prev.emailAlertsEnabled,
              preferredStationId: firestorePrefs.stationId || prev.preferredStationId,
              aqiThreshold: firestorePrefs.thresholdAqi || prev.aqiThreshold,
            }));
          }
        } catch (e) {
          console.warn('Could not read from Firestore', e);
        }
      }
    });

    fetch('/api/alerts/subscription')
      .then((res) => res.json())
      .then((data) => {
        if (data.subscription) setSubscription(data.subscription);
      })
      .catch((err) => console.warn('Could not load subscription from server', err));

    fetch('/api/alerts/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts) setDispatchLogs(data.alerts);
      })
      .catch((err) => console.warn('Could not load history from server', err));

    return () => unsubAuth();
  }, []);

  // Save updated preferences to server and Firestore
  const handleSaveSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (currentUser) {
        await saveUserAlertPrefs(currentUser.uid, {
          phone: subscription.phoneNumber,
          email: subscription.emailAddress,
          smsEnabled: subscription.smsAlertsEnabled,
          emailEnabled: subscription.emailAlertsEnabled,
          stationId: subscription.preferredStationId,
          thresholdAqi: subscription.aqiThreshold,
        });
      }

      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving subscription', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Dispatch instant test emergency alert
  const handleSendTestAlert = async () => {
    setIsDispatching(true);
    const targetStation = stations.find((s) => s.id === selectedStationId) || selectedStation;

    playAlertSiren();

    try {
      const res = await fetch('/api/alerts/send-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: testChannel,
          phone: subscription.phoneNumber,
          email: subscription.emailAddress,
          severity: targetStation.aqi >= 400 ? 'CRITICAL_EMERGENCY' : 'GRAP_ENFORCEMENT',
          stationName: targetStation.name,
          aqi: targetStation.aqi,
          customSmsText: aiCustomSms || undefined,
          customEmailSubject: aiCustomEmailSubject || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.dispatchedAlert) {
        setDispatchLogs((prev) => [data.dispatchedAlert, ...prev]);
        setDispatchToast({
          show: true,
          title: `EMERGENCY ALERT DISPATCHED VIA ${testChannel}`,
          msg: `Successfully delivered to ${subscription.phoneNumber} & ${subscription.emailAddress}`,
          gatewayId: data.gatewayResponse?.gatewayId || 'GATEWAY-OK',
        });

        // Add to phone chat
        setInboundChat((prev) => [
          ...prev,
          {
            sender: 'caqm',
            text:
              aiCustomSms ||
              `[CAQM-ALERT] AQI at ${targetStation.name} reached ${targetStation.aqi}. Inversion active. Keep HEPA filters running.`,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          },
        ]);

        setTimeout(() => setDispatchToast(null), 5000);
      }
    } catch (err) {
      console.error('Error dispatching test alert', err);
    } finally {
      setIsDispatching(false);
    }
  };

  // Handle citizen SMS interactive reply
  const handleSendSmsReply = (customCmd?: string) => {
    const cmd = (customCmd || smsInput).trim().toUpperCase();
    if (!cmd) return;

    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const targetStation = stations.find((s) => s.id === selectedStationId) || selectedStation;

    // User message
    const userMsg = { sender: 'user' as const, text: cmd, time: timeStr };
    setInboundChat((prev) => [...prev, userMsg]);
    setSmsInput('');

    // Generate automated CAQM response
    setTimeout(() => {
      let botReply = '';
      if (cmd === 'AQI' || cmd.startsWith('AQI')) {
        botReply = `[CAQM-BOT] ${targetStation.name}: AQI ${targetStation.aqi} (${targetStation.category}). PM2.5: ${targetStation.pm25} µg/m³, PBL: ${targetStation.pblHeight}m. Winds NW @ ${targetStation.windSpeed} km/h.`;
      } else if (cmd === 'HEALTH' || cmd === 'PRECAUTIONS') {
        botReply = `[CAQM-BOT] Health Advisory: N95 respirator mandatory outdoors. Restrict morning walks (05:00-09:00). High-risk cohorts stay indoors with HEPA purifiers. Helpline: 155255.`;
      } else if (cmd === 'GRAP' || cmd === 'STATUS') {
        botReply = `[CAQM-BOT] ${grapStage.name} is in effect. Ban on non-essential construction and BS-III Petrol/BS-IV Diesel 4-wheelers across Delhi-NCR.`;
      } else {
        botReply = `[CAQM-BOT] Commands available: "AQI" (Station telemetry), "HEALTH" (Precaution directives), "GRAP" (Enforcement rules), "HELP" (Emergency speed-dials).`;
      }

      setInboundChat((prev) => [
        ...prev,
        {
          sender: 'caqm',
          text: botReply,
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 400);
  };

  // AI Emergency Alert Generator
  const handleGenerateAiAlertDraft = async () => {
    setIsComposingAi(true);
    const targetStation = stations.find((s) => s.id === selectedStationId) || selectedStation;

    try {
      const res = await fetch('/api/alerts/ai-compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stationName: targetStation.name,
          aqi: targetStation.aqi,
          grapStage: grapStage.title,
          inversionRisk: targetStation.pblHeight < 350 ? 'Critical' : 'Moderate',
          targetAudience: 'Delhi Citizens, Schools & Commuters',
        }),
      });

      const data = await res.json();
      if (data.smsText) {
        setAiCustomSms(data.smsText);
      }
      if (data.emailSubject) {
        setAiCustomEmailSubject(data.emailSubject);
      }
    } catch (err) {
      console.error('Error generating AI alert draft', err);
    } finally {
      setIsComposingAi(false);
    }
  };

  const handleExportLogsCsv = () => {
    const headers = 'ID,Timestamp,Channel,Phone,Email,Severity,Station,GatewayID,LatencyMs,Status\n';
    const rows = dispatchLogs
      .map(
        (l) =>
          `"${l.id}","${l.timestamp}","${l.channel}","${l.recipientPhone}","${l.recipientEmail}","${l.severity}","${l.stationName}","${l.carrierGatewayId}",${l.latencyMs},"${l.status}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delhi_alert_carrier_audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const currentStation = stations.find((s) => s.id === selectedStationId) || selectedStation;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-black tracking-widest uppercase">
              <Radio className="w-3 h-3 text-red-500 animate-ping" />
              NATIONAL CAPITAL REGION CELLULAR & SMTP DISPATCH GATEWAY
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              TELCO CARRIERS: AIRTEL / JIO / VI / BSNL
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            MOBILE SMS & EMAIL EMERGENCY ALERTS
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Instant real-time dispatch of hazardous AQI breaches, statutory GRAP restrictions, nocturnal thermal inversion lockdowns, and morning digests directly to citizen mobile phones via SMS text and Email.
          </p>
        </div>

        {/* Live Channel Status Pills */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playAlertSiren();
            }}
            className={`px-3 py-2 border text-xs font-bold flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-red-950/50 border-red-500/50 text-red-400 hover:bg-red-900/50'
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
            title="Toggle Emergency Siren Audio"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'SIREN ON' : 'MUTED'}</span>
          </button>

          <div className="bg-emerald-950/40 border border-emerald-500/40 px-3 py-2 text-right">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-400 uppercase">
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS: ONLINE</span>
            </div>
            <span className="text-[9px] font-mono text-white/60">240ms Latency</span>
          </div>

          <div className="bg-cyan-950/40 border border-cyan-500/40 px-3 py-2 text-right">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-cyan-400 uppercase">
              <Mail className="w-3.5 h-3.5" />
              <span>SMTP: ONLINE</span>
            </div>
            <span className="text-[9px] font-mono text-white/60">99.8% Rate</span>
          </div>
        </div>
      </div>

      {/* Toast Notification for Dispatched Alert */}
      {dispatchToast && (
        <div className="bg-red-600 text-white p-4 border border-red-400 shadow-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 animate-bounce shrink-0" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider">{dispatchToast.title}</h4>
              <p className="text-xs text-white/90 font-mono mt-0.5">{dispatchToast.msg}</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-black/40 px-2 py-1 uppercase tracking-widest">
            {dispatchToast.gatewayId}
          </span>
        </div>
      )}

      {/* 2. Main 2-Column Deck: Mobile & Email Simulator on Left + Configuration & AI Composer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Live Interactive Mobile SMS & Email Mockup Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-red-500" />
              LIVE CITIZEN SMARTPHONE SIMULATOR
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">2-WAY INTERACTIVE</span>
          </div>

          {/* Smartphone Frame Mockup */}
          <div className="bg-[#121212] border-4 border-[#262626] rounded-3xl p-4 shadow-2xl space-y-3 relative overflow-hidden">
            {/* Phone Speaker & Camera Notch */}
            <div className="flex justify-center pb-1">
              <div className="w-20 h-3 bg-black rounded-full flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-6 h-1 rounded-full bg-white/10"></span>
              </div>
            </div>

            {/* Phone Status Bar */}
            <div className="flex justify-between items-center text-[10px] font-mono text-white/60 px-2">
              <span>{new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold">5G</span>
                <span>AIRTEL</span>
                <span className="w-4 h-2 border border-white/60 rounded-xs inline-block relative">
                  <span className="absolute inset-0.5 bg-emerald-400"></span>
                </span>
              </div>
            </div>

            {/* Interactive 2-Way Chat Stream */}
            <div className="bg-black/90 border border-white/10 p-3 rounded-xl space-y-2 max-h-56 overflow-y-auto">
              <div className="text-[9px] font-mono text-center text-white/40 uppercase tracking-widest border-b border-white/10 pb-1">
                VK-CAQM-DEL EMERGENCY BROADCAST CHANNEL
              </div>

              {inboundChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-2 rounded-lg text-xs font-mono leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-cyan-600 text-white rounded-br-none'
                        : 'bg-[#1c1c1c] text-white border border-red-500/30 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] font-mono text-white/40 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Quick SMS Commands */}
            <div className="flex flex-wrap gap-1 pt-1">
              {['AQI', 'HEALTH', 'GRAP', 'HELP'].map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => handleSendSmsReply(cmd)}
                  className="px-2 py-0.5 bg-white/10 hover:bg-white text-white hover:text-black text-[9px] font-mono font-bold transition-colors"
                >
                  +{cmd}
                </button>
              ))}
            </div>

            {/* Inbound SMS Input */}
            <div className="flex items-center gap-1.5 pt-1">
              <input
                type="text"
                value={smsInput}
                onChange={(e) => setSmsInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSmsReply()}
                placeholder="Reply to CAQM (e.g. AQI)..."
                className="flex-1 bg-black border border-white/20 text-white text-[11px] px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={() => handleSendSmsReply()}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Email Inbox Preview Tile */}
            <div className="bg-black/90 border border-cyan-500/50 p-3 rounded-xl space-y-2 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span className="text-[11px] font-black text-cyan-300 uppercase tracking-tight">
                    Delhi Health Directorate & CAQM
                  </span>
                </div>
                <span className="text-[9px] font-mono text-white/50">Inbox</span>
              </div>

              <div className="text-xs font-sans text-white/90 space-y-1 bg-[#1a1a1a] p-2.5 rounded-lg border border-white/10">
                <h5 className="font-bold text-white leading-snug">
                  {aiCustomEmailSubject ||
                    `🚨 EMERGENCY AIR ADVISORY: ${currentStation.name} Exceeds ${currentStation.aqi} AQI`}
                </h5>
                <p className="text-[11px] text-white/70 font-sans leading-relaxed">
                  Commission for Air Quality Management (CAQM) statutory notification for{' '}
                  <span className="text-white font-bold">{subscription.emailAddress}</span>. Planetary boundary layer compressed to {currentStation.pblHeight}m.
                </p>
                <div className="pt-1 flex gap-2">
                  <span className="px-1.5 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase">
                    AQI: {currentStation.aqi}
                  </span>
                  <span className="px-1.5 py-0.5 bg-white/10 text-white text-[8px] font-mono uppercase">
                    PM2.5: {currentStation.pm25} µg
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Home Indicator Bar */}
            <div className="flex justify-center pt-1">
              <div className="w-28 h-1 bg-white/30 rounded-full"></div>
            </div>
          </div>

          {/* Quick Dispatch Action Bar */}
          <div className="bg-[#0f0f0f] border border-white/10 p-4 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-red-500" />
              ONE-CLICK INSTANT TEST DISPATCH
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTestChannel('SMS')}
                className={`py-2 px-1 text-center text-[10px] font-black uppercase border transition-all ${
                  testChannel === 'SMS'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-black text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                SMS ONLY
              </button>
              <button
                type="button"
                onClick={() => setTestChannel('EMAIL')}
                className={`py-2 px-1 text-center text-[10px] font-black uppercase border transition-all ${
                  testChannel === 'EMAIL'
                    ? 'bg-cyan-600 text-white border-cyan-500'
                    : 'bg-black text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                EMAIL ONLY
              </button>
              <button
                type="button"
                onClick={() => setTestChannel('SMS + EMAIL')}
                className={`py-2 px-1 text-center text-[10px] font-black uppercase border transition-all ${
                  testChannel === 'SMS + EMAIL'
                    ? 'bg-white text-black border-white font-black'
                    : 'bg-black text-white/70 border-white/10 hover:border-white/30'
                }`}
              >
                SMS + EMAIL
              </button>
            </div>

            <button
              type="button"
              onClick={handleSendTestAlert}
              disabled={isDispatching}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50"
            >
              {isDispatching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>DISPATCHING VIA CARRIER & SMTP GATEWAY...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>DISPATCH LIVE TEST ALERT TO MY PHONE & EMAIL</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column (7 Cols): Subscription Settings Form & AI Alert Composer */}
        <div className="lg:col-span-7 space-y-5">
          {/* A. User Mobile & Email Notification Configuration */}
          <form
            onSubmit={handleSaveSubscription}
            className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-cyan-400" />
                USER MOBILE PHONE & EMAIL ALERT PREFERENCES
              </h3>
              {saveSuccess && (
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  SAVED SUCCESSFULLY
                </span>
              )}
            </div>

            {/* Phone & Email Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 flex items-center justify-between">
                  <span>MOBILE PHONE (SMS CARRIER)</span>
                  <span className="text-emerald-400 text-[9px]">OTP VERIFIED</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={subscription.phoneNumber}
                    onChange={(e) =>
                      setSubscription({ ...subscription, phoneNumber: e.target.value })
                    }
                    placeholder="+91 98712 34567"
                    className="w-full bg-black text-white text-xs font-mono font-bold px-3.5 py-2.5 border border-white/20 focus:outline-none focus:border-red-500"
                    required
                  />
                  <Smartphone className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60 flex items-center justify-between">
                  <span>EMAIL ADDRESS (SMTP BULLETINS)</span>
                  <span className="text-cyan-400 text-[9px]">DELIVERY ACTIVE</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={subscription.emailAddress}
                    onChange={(e) =>
                      setSubscription({ ...subscription, emailAddress: e.target.value })
                    }
                    placeholder="user@gmail.com"
                    className="w-full bg-black text-white text-xs font-mono font-bold px-3.5 py-2.5 border border-white/20 focus:outline-none focus:border-cyan-400"
                    required
                  />
                  <Mail className="w-4 h-4 text-white/40 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Target Locality / Station */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                PRIMARY PINPOINT MONITORING STATION
              </label>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="w-full bg-black text-white text-xs font-black uppercase px-3.5 py-2.5 border border-white/20 focus:outline-none focus:border-white"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} — Current AQI: {st.aqi} ({st.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Granular Alert Trigger Toggles */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[10px] font-black uppercase tracking-wider text-white/60 block">
                AUTOMATIC DISPATCH TRIGGERS & POLICIES
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {/* Severe AQI Breach */}
                <label className="flex items-start gap-2.5 p-3 bg-black/60 border border-white/10 cursor-pointer hover:border-white/25">
                  <input
                    type="checkbox"
                    checked={subscription.alertOnSevereAqi}
                    onChange={(e) =>
                      setSubscription({ ...subscription, alertOnSevereAqi: e.target.checked })
                    }
                    className="mt-0.5 accent-red-600"
                  />
                  <div>
                    <span className="font-black text-white uppercase block leading-tight">
                      AQI Threshold Surge (&gt;{subscription.aqiThreshold} AQI)
                    </span>
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      Triggers immediately when station enters Severe / Hazardous category.
                    </span>
                  </div>
                </label>

                {/* GRAP Stage Changes */}
                <label className="flex items-start gap-2.5 p-3 bg-black/60 border border-white/10 cursor-pointer hover:border-white/25">
                  <input
                    type="checkbox"
                    checked={subscription.alertOnGrapEscalation}
                    onChange={(e) =>
                      setSubscription({
                        ...subscription,
                        alertOnGrapEscalation: e.target.checked,
                      })
                    }
                    className="mt-0.5 accent-red-600"
                  />
                  <div>
                    <span className="font-black text-white uppercase block leading-tight">
                      GRAP Stage Escalations (I / II / III / IV)
                    </span>
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      Statutory vehicular, construction, and school closure orders.
                    </span>
                  </div>
                </label>

                {/* Nocturnal Inversion Warning */}
                <label className="flex items-start gap-2.5 p-3 bg-black/60 border border-white/10 cursor-pointer hover:border-white/25">
                  <input
                    type="checkbox"
                    checked={subscription.alertOnNocturnalInversion}
                    onChange={(e) =>
                      setSubscription({
                        ...subscription,
                        alertOnNocturnalInversion: e.target.checked,
                      })
                    }
                    className="mt-0.5 accent-red-600"
                  />
                  <div>
                    <span className="font-black text-white uppercase block leading-tight">
                      Nocturnal Inversion Alert (20:00 IST)
                    </span>
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      Window sealing and bedroom HEPA purifier warnings.
                    </span>
                  </div>
                </label>

                {/* Daily Morning Digest */}
                <label className="flex items-start gap-2.5 p-3 bg-black/60 border border-white/10 cursor-pointer hover:border-white/25">
                  <input
                    type="checkbox"
                    checked={subscription.dailyMorningDigest}
                    onChange={(e) =>
                      setSubscription({
                        ...subscription,
                        dailyMorningDigest: e.target.checked,
                      })
                    }
                    className="mt-0.5 accent-red-600"
                  />
                  <div>
                    <span className="font-black text-white uppercase block leading-tight">
                      Daily 07:00 AM Airshed Digest
                    </span>
                    <span className="text-[10px] text-white/50 block mt-0.5">
                      24h-72h predicted rate trajectory and morning commute guide.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-white hover:bg-gray-200 text-black text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
              >
                {isSaving ? 'SAVING SUBSCRIBER PROFILE...' : 'SAVE ALERT PREFERENCES'}
              </button>
            </div>
          </form>

          {/* B. AI Emergency Broadcast Composer (Gemini 3.1 Pro) */}
          <div className="bg-[#0f0f0f] border-2 border-cyan-500/40 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400">
                    GEMINI 3.1 PRO CRISIS ENGINE
                  </span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white">
                  CUSTOM EMERGENCY ALERT COMPOSER
                </h3>
              </div>

              <button
                type="button"
                onClick={handleGenerateAiAlertDraft}
                disabled={isComposingAi}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              >
                {isComposingAi ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>COMPOSING ALERT...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>AI DRAFT CRISIS SMS & EMAIL</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom Draft Fields */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    SMS BROADCAST PAYLOAD (MAX 160 CHARS)
                  </label>
                  <span className="text-[10px] font-mono text-white/50">
                    {aiCustomSms.length} / 160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={aiCustomSms}
                  onChange={(e) => setAiCustomSms(e.target.value)}
                  placeholder="Draft or generate localized under-160 char SMS text with [CAQM-ALERT] prefix..."
                  className="w-full bg-black text-white text-xs font-mono p-2.5 border border-white/20 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                  EMAIL SUBJECT HEADER
                </label>
                <input
                  type="text"
                  value={aiCustomEmailSubject}
                  onChange={(e) => setAiCustomEmailSubject(e.target.value)}
                  placeholder="Draft or generate email subject header..."
                  className="w-full bg-black text-white text-xs font-sans font-bold px-3 py-2 border border-white/20 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Dispatched Emergency Audit & Telco Carrier Gateway Log */}
      <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400" />
              DISPATCHED EMERGENCY SMS & EMAIL CARRIER AUDIT LOG
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              Verified delivery receipts from Airtel, Jio, Vodafone-Idea, and Amazon SES SMTP gateways.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportLogsCsv}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit CSV</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-400 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20">
              {dispatchLogs.length} LOGGED DISPATCHES
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-black text-white/50 uppercase text-[10px] font-mono tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3 px-3">Timestamp (IST)</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-3">Recipient Details</th>
                <th className="py-3 px-3">Alert Severity & Hotspot</th>
                <th className="py-3 px-3">Carrier Gateway ID</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-3 text-right">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-white/80">
              {dispatchLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-3 text-white font-bold">{log.timestamp}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 bg-white/10 text-white text-[9px] font-black uppercase">
                      {log.channel}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans text-xs">
                    <div className="font-bold text-white">{log.recipientPhone}</div>
                    <div className="text-[11px] text-white/50">{log.recipientEmail}</div>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <span
                      className={`text-[9px] font-black uppercase px-1.5 py-0.5 mr-1.5 ${
                        log.severity === 'CRITICAL_EMERGENCY'
                          ? 'bg-red-600 text-white'
                          : log.severity === 'GRAP_ENFORCEMENT'
                          ? 'bg-purple-600 text-white'
                          : log.severity === 'INVERSION_WARNING'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-cyan-600 text-white'
                      }`}
                    >
                      {log.severity.replace('_', ' ')}
                    </span>
                    <span className="text-white font-bold text-xs">{log.stationName}</span>
                  </td>
                  <td className="py-3 px-3 text-cyan-400 font-mono text-[11px]">
                    {log.carrierGatewayId}
                  </td>
                  <td className="py-3 px-3 text-white/60">{log.latencyMs} ms</td>
                  <td className="py-3 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-black text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
