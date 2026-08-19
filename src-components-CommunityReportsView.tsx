import React, { useState, useEffect } from 'react';
import {
  Users,
  AlertTriangle,
  Flame,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  LogIn,
  LogOut,
  Sparkles,
  ShieldCheck,
  Building,
  Camera,
  Layers,
  Filter,
} from 'lucide-react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOut,
  submitCommunityReport,
  subscribeCommunityReports,
  CommunitySmogReport,
} from '../lib/firebase';
import { MonitoringStation, GrapStageInfo } from '../types';

interface CommunityReportsViewProps {
  stations: MonitoringStation[];
  selectedStation: MonitoringStation;
  grapStage: GrapStageInfo;
}

export const CommunityReportsView: React.FC<CommunityReportsViewProps> = ({
  stations,
  selectedStation,
  grapStage,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [reports, setReports] = useState<CommunitySmogReport[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form fields
  const [location, setLocation] = useState<string>(selectedStation.name);
  const [landmark, setLandmark] = useState<string>('');
  const [severity, setSeverity] = useState<
    'Visible Smog Plume' | 'Burning Leaves/Waste' | 'Dust/Construction' | 'Traffic Congestion Choke'
  >('Visible Smog Plume');
  const [description, setDescription] = useState<string>('');
  const [reportedAqi, setReportedAqi] = useState<number>(selectedStation.aqi);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    const unsubscribeReports = subscribeCommunityReports((items) => {
      setReports(items);
    });
    return () => {
      unsubscribeAuth();
      unsubscribeReports();
    };
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!description.trim() || !location.trim()) return;

    setIsSubmitting(true);
    try {
      await submitCommunityReport({
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Citizen Reporter',
        userPhoto: currentUser.photoURL || undefined,
        location,
        landmark,
        severity,
        description,
        reportedAqiEstimate: reportedAqi,
      });

      setDescription('');
      setLandmark('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (filterSeverity === 'ALL') return true;
    return r.severity === filterSeverity;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-black tracking-widest uppercase">
              <Users className="w-3 h-3 text-cyan-400 animate-pulse" />
              FIREBASE CLOUD FIRESTORE PERSISTENCE
            </span>
            <span className="text-[10px] font-mono opacity-50 text-white">
              REAL-TIME CITIZEN GROUND VERIFICATION
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1">
            COMMUNITY SMOG & HOTSPOT INCIDENT DESK
          </h1>
          <p className="text-xs text-white/70 max-w-3xl mt-0.5">
            Report localized garbage burning, unpaved road dust clouds, and industrial emissions directly into the synchronized Cloud Firestore network with Google authentication.
          </p>
        </div>

        {/* User Auth Profile Status Widget */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'User'}
                  className="w-8 h-8 rounded-full border border-cyan-400"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs">
                  {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                </div>
              )}
              <div className="text-left">
                <div className="text-xs font-black uppercase text-white truncate max-w-[140px]">
                  {currentUser.displayName || 'Citizen'}
                </div>
                <span className="text-[9px] font-mono text-emerald-400">VERIFIED REPORTER</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <LogIn className="w-4 h-4" />
              <span>SIGN IN WITH GOOGLE</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Report Submission Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-70 text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                FILE CITIZEN INCIDENT REPORT
              </h3>
              <span className="text-[10px] font-mono text-cyan-400">FIRESTORE SYNC</span>
            </div>

            {!currentUser ? (
              <div className="text-center py-8 px-4 bg-black/50 border border-white/10 rounded space-y-3">
                <ShieldCheck className="w-10 h-10 mx-auto text-cyan-400 opacity-60" />
                <h4 className="text-xs font-black uppercase text-white">
                  AUTHENTICATION REQUIRED TO REPORT
                </h4>
                <p className="text-xs text-white/60">
                  Sign in securely with your Google account to log ground-level pollution spikes, stubble fires, or illegal waste burning.
                </p>
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black uppercase tracking-wider transition-all"
                >
                  SIGN IN TO REPORT
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {submitSuccess && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Report synchronized to Cloud Firestore successfully!</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    WARD / NEIGHBORHOOD / STATION
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-black text-white px-3 py-2 border border-white/20 font-bold"
                  >
                    {stations.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} (Zone: {s.zone})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    SPECIFIC LANDMARK / STREET
                  </label>
                  <input
                    type="text"
                    required
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Ring Road flyover near Gate 4, Sector 62"
                    className="w-full bg-black text-white px-3 py-2 border border-white/20 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    INCIDENT CATEGORY
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-black text-white px-3 py-2 border border-white/20 font-bold"
                  >
                    <option value="Visible Smog Plume">Dense Smog Inversion Layer</option>
                    <option value="Burning Leaves/Waste">Illegal Biomass / Leaf / Garbage Burning</option>
                    <option value="Dust/Construction">Uncovered Construction & Demolition Dust</option>
                    <option value="Traffic Congestion Choke">Severe Vehicular Idling & Chokepoint</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-white/60">
                    OBSERVED SITUATION DETAILS
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe smoke color, eye irritation level, visibility distance, and direction..."
                    className="w-full bg-black text-white px-3 py-2 border border-white/20 font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>PERSISTING TO FIRESTORE...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>SUBMIT VERIFIED REPORT</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed of Community Reports (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0f0f0f] border border-white/10 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  LIVE CITIZEN OBSERVATION FEED ({reports.length} FIRESTORE DOCS)
                </h3>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5 text-[10px]">
                <Filter className="w-3.5 h-3.5 text-white/50" />
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="bg-black text-white px-2 py-1 border border-white/20 font-mono text-[10px]"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Visible Smog Plume">Smog Layer</option>
                  <option value="Burning Leaves/Waste">Waste Burning</option>
                  <option value="Dust/Construction">Construction Dust</option>
                  <option value="Traffic Congestion Choke">Traffic Choke</option>
                </select>
              </div>
            </div>

            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-white/50 space-y-2">
                <Users className="w-10 h-10 mx-auto text-white/20" />
                <p className="text-xs font-mono">No incidents reported in this category yet.</p>
                <p className="text-[10px] text-white/40">Be the first to file a verified report above.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                {filteredReports.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-black/60 border border-white/10 hover:border-white/25 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {item.userPhoto ? (
                          <img
                            src={item.userPhoto}
                            alt={item.userName}
                            className="w-7 h-7 rounded-full border border-white/20"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-white/10 text-white font-bold flex items-center justify-center text-[10px]">
                            {item.userName[0]}
                          </div>
                        )}
                        <div>
                          <div className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                            <span>{item.userName}</span>
                            <span className="text-[9px] bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 px-1 py-0.2 font-mono">
                              CITIZEN
                            </span>
                          </div>
                          <span className="text-[10px] text-white/50 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Just now'}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 tracking-wider border ${
                          item.severity === 'Burning Leaves/Waste'
                            ? 'bg-orange-950/60 border-orange-500 text-orange-400'
                            : item.severity === 'Dust/Construction'
                            ? 'bg-yellow-950/60 border-yellow-500 text-yellow-400'
                            : item.severity === 'Traffic Congestion Choke'
                            ? 'bg-red-950/60 border-red-500 text-red-400'
                            : 'bg-purple-950/60 border-purple-500 text-purple-400'
                        }`}
                      >
                        {item.severity}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.location}</span>
                      {item.landmark && (
                        <span className="text-white/60 font-normal">({item.landmark})</span>
                      )}
                    </div>

                    <p className="text-xs text-white/80 font-sans leading-relaxed pl-5 border-l-2 border-white/10">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
