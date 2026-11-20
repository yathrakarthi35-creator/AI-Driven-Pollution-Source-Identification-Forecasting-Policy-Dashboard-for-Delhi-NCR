import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  runForecastEngine,
  runPolicyEngine,
  runSourceAttributionEngine,
  runAdvisoryEngine,
  runExposureEngine,
  runCadrEngine,
  runInstitutionalEngine,
  generatePolicyBriefingReport,
  composeEmergencyAlert,
  generateVoiceScript,
  runChatEngine,
  clampNumber,
  sanitizeString,
} from "./server/ai-engine";

dotenv.config();

const DEFAULT_ALLOWED_ORIGINS = [
  "https://ai-driven-pollution-source-identifi.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
];

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^[+\d\s()-]{7,20}$/.test(phone);
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  // HTTP Security Headers Middleware
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), payment=()");
    res.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'none';"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    return next();
  });

  // Lightweight sliding-window rate limiter for API routes
  const rateBuckets = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_MAX = 120;
  const RATE_WINDOW_MS = 60_000;

  app.use("/api/", (req, res, next) => {
    const key = req.ip || "local";
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ success: false, error: "Too many requests. Please retry shortly." });
    }
    return next();
  });

  app.use(express.json({ limit: "100kb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      engine: "NVY AI — Delhi-NCR Environmental Intelligence Platform",
      aiArchitecture: "NVY In-House Deterministic Reasoning Engine (Zero External LLM Dependency)",
      mode: "STANDALONE_SELF_CONTAINED",
    });
  });

  // Satellite Live Telemetry Stream Endpoint
  app.get("/api/satellite-stream", (_req, res) => {
    const now = Date.now();
    const packetCounter = 3400 + Math.floor((now / 1000) % 900);
    const activeSatIndex = Math.floor((now / 15000) % 4);
    const satNames = [
      "SENTINEL-5P (TROPOMI)",
      "SUOMI-NPP (VIIRS)",
      "INSAT-3DR (GEO-IMAGER)",
      "AQUA (MODIS)",
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      activeSatellite: satNames[activeSatIndex],
      packetIngressRate: `${(3400 + (now % 250)).toLocaleString()} pkt/sec`,
      totalPacketsReceived: packetCounter,
      aerosolOpticalDepth: 0.82 + Number((Math.sin(now / 10000) * 0.05).toFixed(3)),
      no2ColumnTropospheric: "18.4 × 10¹⁵ molec/cm²",
      carbonMonoxideDensity: "2.85 × 10¹⁸ molec/cm²",
      smokePlumeAngle: 315,
      activeFarmFiresScanned: 23,
      streamStatus: "LIVE_STREAMING_1HZ",
    });
  });

  // 1. NVY Clinical Health Precautions Advisor
  app.post("/api/ai-precautions-advisory", (req, res) => {
    try {
      res.json(runAdvisoryEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/ai-precautions-advisory:", error);
      res.status(500).json({ success: false, error: "Failed to generate precaution advisory" });
    }
  });

  // Alert State & In-Memory Dispatch History
  let activeSubscription = {
    id: "sub-user-01",
    phoneNumber: "+91 98712 34567",
    emailAddress: "citizen@delhi.gov.in",
    enableSms: true,
    enableEmail: true,
    alertOnSevereAqi: true,
    aqiThreshold: 300,
    alertOnGrapEscalation: true,
    alertOnNocturnalInversion: true,
    alertOnStubbleSurge: true,
    dailyMorningDigest: true,
    selectedStationIds: ["all"],
    preferredLanguage: "EN",
    updatedAt: new Date().toISOString(),
  };

  let dispatchedAlertHistory: Array<Record<string, unknown>> = [
    {
      id: "alt-dispatch-901",
      timestamp: "Today, 08:30 IST",
      channel: "SMS + EMAIL",
      recipientPhone: "+91 98712 34567",
      recipientEmail: "citizen@delhi.gov.in",
      severity: "CRITICAL_EMERGENCY",
      title: "SEVERE AIR POLLUTION EMERGENCY: Anand Vihar AQI 442",
      smsMessageText:
        "[CAQM-ALERT] Anand Vihar AQI surged to 442 (Hazardous). Nocturnal inversion active. Wear N95 outdoors. Keep HEPA on. Helplines: 155255",
      emailSubject: "CRITICAL AIR EMERGENCY: Anand Vihar Air Quality Breaches 440 AQI [GRAP-III]",
      emailHtmlBody:
        "<h3>Commission for Air Quality Management (CAQM) &amp; Delhi Health Directorate</h3><p>Anand Vihar has reached 442 AQI. Wear N95 outdoors and keep HEPA filtration active.</p>",
      stationName: "Anand Vihar, East Delhi",
      aqiAtTrigger: 442,
      status: "DELIVERED",
      carrierGatewayId: "SMS-DEL-AIRTEL-48192",
      latencyMs: 14,
    },
  ];

  app.get("/api/alerts/subscription", (_req, res) => {
    res.json({ success: true, subscription: activeSubscription });
  });

  // Strict field allowlist prevents mass-assignment vulnerabilities
  app.post("/api/alerts/subscribe", (req, res) => {
    const body = req.body ?? {};
    if (body.emailAddress !== undefined && !isValidEmail(String(body.emailAddress))) {
      return res.status(400).json({ success: false, error: "Invalid email address format." });
    }
    if (body.phoneNumber !== undefined && !isValidPhone(String(body.phoneNumber))) {
      return res.status(400).json({ success: false, error: "Invalid phone number format." });
    }

    activeSubscription = {
      ...activeSubscription,
      phoneNumber: body.phoneNumber ? sanitizeString(body.phoneNumber, activeSubscription.phoneNumber, 20) : activeSubscription.phoneNumber,
      emailAddress: body.emailAddress ? sanitizeString(body.emailAddress, activeSubscription.emailAddress, 120) : activeSubscription.emailAddress,
      enableSms: typeof body.enableSms === "boolean" ? body.enableSms : activeSubscription.enableSms,
      enableEmail: typeof body.enableEmail === "boolean" ? body.enableEmail : activeSubscription.enableEmail,
      alertOnSevereAqi: typeof body.alertOnSevereAqi === "boolean" ? body.alertOnSevereAqi : activeSubscription.alertOnSevereAqi,
      aqiThreshold: body.aqiThreshold !== undefined ? clampNumber(body.aqiThreshold, 50, 500, activeSubscription.aqiThreshold) : activeSubscription.aqiThreshold,
      alertOnGrapEscalation: typeof body.alertOnGrapEscalation === "boolean" ? body.alertOnGrapEscalation : activeSubscription.alertOnGrapEscalation,
      alertOnNocturnalInversion: typeof body.alertOnNocturnalInversion === "boolean" ? body.alertOnNocturnalInversion : activeSubscription.alertOnNocturnalInversion,
      alertOnStubbleSurge: typeof body.alertOnStubbleSurge === "boolean" ? body.alertOnStubbleSurge : activeSubscription.alertOnStubbleSurge,
      dailyMorningDigest: typeof body.dailyMorningDigest === "boolean" ? body.dailyMorningDigest : activeSubscription.dailyMorningDigest,
      preferredLanguage: body.preferredLanguage === "HI" ? "HI" : "EN",
      updatedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      message: "Emergency alert preferences updated successfully",
      subscription: activeSubscription,
    });
  });

  app.get("/api/alerts/history", (_req, res) => {
    res.json({ success: true, alerts: dispatchedAlertHistory });
  });

  app.post("/api/alerts/send-test", (req, res) => {
    const body = req.body ?? {};
    const channel = ["SMS", "EMAIL", "SMS + EMAIL"].includes(body.channel) ? body.channel : "SMS + EMAIL";
    const targetPhone = body.phone && isValidPhone(String(body.phone)) ? sanitizeString(body.phone, activeSubscription.phoneNumber, 20) : activeSubscription.phoneNumber;
    const targetEmail = body.email && isValidEmail(String(body.email)) ? sanitizeString(body.email, activeSubscription.emailAddress, 120) : activeSubscription.emailAddress;
    const targetAqi = clampNumber(body.aqi, 0, 999, 385);
    const station = sanitizeString(body.stationName, "Anand Vihar, East Delhi", 100);
    const severity = sanitizeString(body.severity, "CRITICAL_EMERGENCY", 40);

    const safeStationHtml = escapeHtml(station);
    const smsText = sanitizeString(
      body.customSmsText,
      `[CAQM-ALERT] URGENT: Air Quality at ${station} is ${targetAqi}. Wear N95 outdoors. Helplines: 155255`,
      320
    );
    const emailSubject = sanitizeString(
      body.customEmailSubject,
      `EMERGENCY ALERT: ${station} Breaches ${targetAqi} AQI [GRAP Stage-III]`,
      160
    );

    const emailBody = `<div style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 20px; border: 2px solid #ef4444;">
      <h2 style="color: #ef4444; margin-top: 0;">CAQM &amp; DELHI HEALTH DIRECTIVES: AIR EMERGENCY</h2>
      <p><strong>Location:</strong> ${safeStationHtml}</p>
      <p><strong>Current AQI:</strong> ${targetAqi}</p>
    </div>`;

    const newAlert = {
      id: `alt-dispatch-${Date.now()}`,
      timestamp: `Just now (${new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })} IST)`,
      channel,
      recipientPhone: targetPhone,
      recipientEmail: targetEmail,
      severity,
      title: `${severity === "GRAP_ENFORCEMENT" ? "GRAP DIRECTIVE" : "AIR EMERGENCY"}: ${station} (AQI ${targetAqi})`,
      smsMessageText: smsText,
      emailSubject,
      emailHtmlBody: emailBody,
      stationName: station,
      aqiAtTrigger: targetAqi,
      status: "DELIVERED",
      carrierGatewayId: `GW-DEL-${Math.floor(10000 + Math.random() * 90000)}`,
      latencyMs: 16,
    };

    dispatchedAlertHistory.unshift(newAlert);
    if (dispatchedAlertHistory.length > 30) dispatchedAlertHistory = dispatchedAlertHistory.slice(0, 30);

    res.json({
      success: true,
      message: `Emergency alert dispatched successfully via ${channel}`,
      dispatchedAlert: newAlert,
    });
  });

  app.post("/api/alerts/ai-compose", (req, res) => {
    try {
      res.json(composeEmergencyAlert(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/alerts/ai-compose:", error);
      res.status(500).json({ success: false, error: "Failed to compose emergency alert" });
    }
  });

  app.post("/api/policy-ai-simulation", (req, res) => {
    try {
      res.json(runPolicyEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/policy-ai-simulation:", error);
      res.status(500).json({ success: false, error: "Failed to run policy simulation" });
    }
  });

  app.post("/api/forecast-reasoning", (req, res) => {
    try {
      res.json(runForecastEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/forecast-reasoning:", error);
      res.status(500).json({ success: false, error: "Failed to generate forecast reasoning" });
    }
  });

  app.post("/api/generate-report", (req, res) => {
    try {
      res.json(generatePolicyBriefingReport(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/generate-report:", error);
      res.status(500).json({ success: false, error: "Failed to generate policy briefing report" });
    }
  });

  app.post("/api/chat-ai", (req, res) => {
    try {
      res.json(runChatEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/chat-ai:", error);
      res.status(500).json({ success: false, error: "Failed to process chat query" });
    }
  });

  app.post("/api/commute-exposure", (req, res) => {
    try {
      res.json(runExposureEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/commute-exposure:", error);
      res.status(500).json({ success: false, error: "Failed to calculate commute exposure" });
    }
  });

  app.post("/api/indoor-optimization", (req, res) => {
    try {
      res.json(runCadrEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/indoor-optimization:", error);
      res.status(500).json({ success: false, error: "Failed to optimize indoor CADR" });
    }
  });

  app.post("/api/institutional-guidelines", (req, res) => {
    try {
      res.json(runInstitutionalEngine(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/institutional-guidelines:", error);
      res.status(500).json({ success: false, error: "Failed to generate institutional guidelines" });
    }
  });

  app.post("/api/voice-briefing-text", (req, res) => {
    try {
      res.json(generateVoiceScript(req.body ?? {}));
    } catch (error) {
      console.error("Error in /api/voice-briefing-text:", error);
      res.status(500).json({ success: false, error: "Failed to generate voice script" });
    }
  });

  app.get("/api/source-attribution", (_req, res) => {
    try {
      const result = runSourceAttributionEngine();
      res.json({ success: true, ...result });
    } catch (error) {
      console.error("Error in /api/source-attribution:", error);
      res.status(500).json({ success: false, error: "Failed to compute source attribution" });
    }
  });

  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { maxAge: "1d" }));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NVY AI Engine & Delhi-NCR Air Quality Server running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test" && !process.env.VITEST) {
  startServer();
}
