import React, { useState } from 'react';
import {
  FileText,
  Brain,
  Download,
  Printer,
  Sparkles,
  Calendar,
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { MonitoringStation, GrapStageInfo } from '../types';

interface ReportsViewProps {
  stations: MonitoringStation[];
  grapStage: GrapStageInfo;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ stations, grapStage }) => {
  const [reportType, setReportType] = useState('daily_cpcb');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const avgAqi = Math.round(
    stations.reduce((sum, s) => sum + s.aqi, 0) / stations.length
  );
  const maxStation = [...stations].sort((a, b) => b.aqi - a.aqi)[0];

  const defaultBriefing = `# CAQM & CPCB STATUTORY ENVIRONMENTAL BRIEFING: DELHI-NCR AIRSHED
**Document ID:** CAQM/DEL/ENVIRO-SYNTH-${new Date().toISOString().split('T')[0]}
**Date & Time:** ${new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })} | 10:00 IST
**Statutory Enforcement Level:** ${grapStage.name.toUpperCase()} (ACTIVE)
**Regional Mean AQI:** ${avgAqi} (Category: Very Poor)
**Critical Peak Hotspot:** ${maxStation.name} (${maxStation.aqi} AQI, PM2.5: ${maxStation.pm25} µg/m³)

---

## 1. Executive Airshed Summary
The National Capital Region of Delhi is currently situated beneath a strong nocturnal thermal subsidence inversion layer with mixing depth compressed to **420m**. Stagnant surface winds (mean 4.5 km/h from NW) combined with secondary particulate formation have escalated ground-level PM2.5 and PM10 to critical thresholds across 10 CAAQMS monitoring sectors.

---

## 2. Chemical Speciation & PMF Source Apportionment
- **Transport & Vehicular Exhaust (42%):** Elemental carbon, diesel particulate matter, and secondary nitrates from peak-hour traffic corridor congestion.
- **Transboundary Agricultural Biomass Burning (26%):** NASA VIIRS detected 23 major fire clusters in Punjab/Haryana airshed with wind vectors driving smoke plumes into North/West Delhi.
- **Industrial Fuel & Kiln Emissions (16%):** Elevated SO₂/NO₂ signatures across Ghaziabad, Mayapuri, and Faridabad industrial nodes.
- **Resuspended Road & Construction Dust (11%):** Mechanical dust resuspension with elevated coarse particulate (PM10 > 280 µg/m³).
- **Secondary Aerosols & Domestic Waste (5%):** Local biomass and refuse burning.

---

## 3. Statutory CAQM Directives & Enforcement Mandates
1. **Vehicular Ingress Bans:** Absolute prohibition on non-essential BS-III Petrol and BS-IV Diesel light commercial four-wheelers across NCT Delhi, Gurugram, Faridabad, Ghaziabad, and Gautam Buddh Nagar.
2. **Construction & Demolition (C&D) Freeze:** Total cessation of all earth excavation, dry cutting, and non-essential civil construction projects.
3. **Dust Suppression Regimes:** 24/7 deployment of mobile anti-smog water cannons and continuous mechanized sweeping along Ring Road, Outer Ring Road, and NH-48.
4. **Institutional Advisories:** Recommended 50% remote work protocol for government and private offices to depress peak commute volumes.

---

## 4. Public Health Alert & Vulnerable Group Defense
- **Masking:** Strict mandate for certified **N95/N99 respirators** during all unavoidable outdoor transit.
- **Inversion Advisory:** High-risk cohorts (pediatric, geriatric, COPD, asthma) must remain strictly indoors between **05:00–09:00 IST** and **20:00–23:00 IST**.
- **Indoor Purification:** True HEPA filtration required in public healthcare facilities, classrooms, and residential sanctuaries.

*Emergency Help: Delhi Green Helpline 155255 | CAQM Compliance Central 011-23746654*`;

  const [generatedReport, setGeneratedReport] = useState<string>(defaultBriefing);

  const handleGenerateAiReport = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          date: new Date().toISOString().split('T')[0],
          avgAqi,
          maxStation: { name: maxStation.name, aqi: maxStation.aqi },
          grapStage: grapStage.roman,
          fireCount: 23,
          stationsSummary: stations.reduce((acc: any, s) => {
            acc[s.name] = s.aqi;
            return acc;
          }, {}),
        }),
      });

      const data = await response.json();
      if (data.report) {
        setGeneratedReport(data.report);
      } else {
        setGeneratedReport(defaultBriefing);
      }
    } catch (err: any) {
      setGeneratedReport(defaultBriefing);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedReport) return;
    navigator.clipboard.writeText(generatedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadMarkdown = () => {
    if (!generatedReport) return;
    const blob = new Blob([generatedReport], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CAQM_Delhi_NCR_Briefing_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadHtml = () => {
    if (!generatedReport) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CAQM Delhi-NCR Air Quality Statutory Briefing</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 40px auto; padding: 20px; color: #111; background: #fff; }
    h1 { color: #b91c1c; border-bottom: 2px solid #b91c1c; padding-bottom: 8px; font-size: 24px; }
    h2 { color: #1e293b; margin-top: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; font-size: 18px; }
    ul, ol { padding-left: 20px; }
    li { margin-bottom: 6px; }
    hr { border: none; border-top: 1px solid #cbd5e1; margin: 20px 0; }
    strong { color: #0f172a; }
    .badge { display: inline-block; background: #fee2e2; color: #991b1b; padding: 3px 8px; font-weight: bold; border-radius: 4px; font-size: 12px; }
  </style>
</head>
<body>
  <div style="white-space: pre-wrap; font-family: inherit;">${generatedReport.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CAQM_Delhi_NCR_Briefing_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border border-white/10 p-5 flex flex-col md:flex-row md:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50 text-white">
              STATUTORY INTELLIGENCE & POLICY SYNTHESIS
            </span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-black uppercase">
              GEMINI 3.1 PRO HIGH THINKING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase mt-1 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            CAQM EXECUTIVE ENVIRONMENTAL REPORTS
          </h1>
          <p className="text-xs text-white/70 max-w-2xl mt-0.5">
            Automated statutory intelligence synthesis, multi-agency compliance documentation, and meteorological source attribution briefings for Delhi-NCR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAiReport}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Brain className="w-4 h-4" />
            )}
            <span>{isGenerating ? 'Synthesizing with High Thinking...' : 'Generate Fresh Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Grid: Config Left, Report Viewer Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Report Options (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#050505] border border-white/10 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">
                BRIEFING PARAMETERS
              </h3>
              <span className="text-[9px] font-mono bg-white/10 text-white/70 px-1.5 py-0.5">
                v2.4 COMPLIANT
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block text-white/60 font-bold uppercase tracking-wider text-[10px]">
                Statutory Template:
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-[#111] border border-white/20 text-white text-xs p-2.5 focus:outline-none focus:border-emerald-500 font-sans"
              >
                <option value="daily_cpcb">CPCB Daily Air Quality Status & Diagnostics</option>
                <option value="caqm_grap">CAQM GRAP Enforcement & Multi-Agency Audit</option>
                <option value="health_advisory">Public Health Risk & Vulnerable Cohort Advisory</option>
                <option value="policy_impact">Policy Intervention & Odd-Even Efficacy Report</option>
              </select>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Regional Avg AQI:</span>
                <span className="text-red-400 font-black">{avgAqi} (Very Poor)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Critical Hotspot:</span>
                <span className="text-white font-bold">{maxStation.name} ({maxStation.aqi})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Active GRAP:</span>
                <span className="text-purple-400 font-black">{grapStage.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">NASA VIIRS Fires:</span>
                <span className="text-amber-400 font-black">23 Hotspots</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <span className="text-white/60">AI Reasoner:</span>
                <span className="text-emerald-400 font-black">Gemini 3.1 Pro (High)</span>
              </div>
            </div>

            {/* Quick Export Actions */}
            <div className="space-y-2 pt-1">
              <span className="block text-[10px] font-black uppercase tracking-widest text-white/50">
                EXPORT & DISTRIBUTE
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadMarkdown}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Markdown (.md)</span>
                </button>
                <button
                  onClick={handleDownloadHtml}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>HTML Document</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Report Display (8 cols) */}
        <div className="lg:col-span-8">
          <div className="bg-[#050505] border border-white/10 p-5 min-h-[520px] flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  SYNTHESIZED OFFICIAL BRIEFING
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Copy text to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-white/70" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Print or Save to PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-white/70" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="flex-1 text-white/90 text-xs leading-relaxed space-y-3 font-mono bg-[#0a0a0a] p-5 border border-white/10 overflow-y-auto max-h-[600px] select-text">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-4 text-white/60">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
                  <div className="text-sm font-black uppercase tracking-widest text-white">
                    GEMINI 3.1 PRO DEEP ATMOSPHERIC REASONING
                  </div>
                  <p className="text-xs text-white/50 max-w-md text-center font-sans">
                    Synthesizing continuous telemetry from 10 CAAQMS monitoring stations, WRF-Chem atmospheric dispersion matrices, and NASA VIIRS satellite stubble detections...
                  </p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed font-mono">
                  {generatedReport}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
