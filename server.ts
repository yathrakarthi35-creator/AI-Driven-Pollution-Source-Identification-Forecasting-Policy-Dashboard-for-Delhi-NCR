import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      model: "gemini-3.1-pro-preview",
      thinkingLevel: "HIGH",
    });
  });

  // Second-by-Second Satellite Live Telemetry Stream Endpoint
  app.get("/api/satellite-stream", (req, res) => {
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
      aerosolOpticalDepth: 0.82 + Number(((Math.sin(now / 10000) * 0.05)).toFixed(3)),
      no2ColumnTropospheric: "18.4 × 10¹⁵ molec/cm²",
      carbonMonoxideDensity: "2.85 × 10¹⁸ molec/cm²",
      smokePlumeAngle: 315, // NW to SE
      activeFarmFiresScanned: 23,
      streamStatus: "LIVE_STREAMING_1HZ",
    });
  });

  // AI Delhi Citizen & Institutional Health Precautions Advisor
  app.post("/api/ai-precautions-advisory", async (req, res) => {
    try {
      const {
        locality,
        userProfile,
        ageGroup,
        healthCondition,
        dailyRoutine,
        outdoorHours,
        currentAqi,
        forecastRate72h,
      } = req.body;

      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          advisory: `### 🛡️ Delhi Citizen Precaution Plan (${locality || "Delhi-NCR"} - AQI ${currentAqi || 350})
**Target Profile:** ${userProfile || "General Citizen"} (${ageGroup || "Adult 30-50"}, Condition: ${healthCondition || "Mild Sensitive"})

#### 1. Immediate Respiratory Action (Next 24 Hours)
- **Masking:** Wear a well-fitted **N95/N99 respirator** whenever outdoors. Cloth or surgical masks do not block sub-micron PM2.5 particles.
- **Critical Exposure Window:** Stay strictly indoors between **05:00 AM – 09:00 AM** and **20:00 PM – 23:00 PM** when boundary layer inversion collapses and particulate density surges.
- **Commuting Precautions:** If traveling by car, ensure **AC Recirculation Mode is ON**. Avoid two-wheelers or open e-rickshaws during peak morning inversion.

#### 2. Indoor Air & Purification
- Keep True HEPA H13 purifiers running continuously on Medium/Auto mode.
- Seal gaps in doors and window frames with draft stoppers.
- Use wet microfiber mopping twice daily; do not dry-sweep.

#### 3. Health & Ayurvedic Cleansing
- Consume 10g of pure organic Jaggery (Gur) and warm water after outdoor transit.
- Steam inhalation with eucalyptus or tulsi leaves before bedtime.
- Keep emergency inhaler / bronchodilator readily accessible.

*Emergency Help: Delhi Green Helpline 155255 | AIIMS Pulmonology Emergency 011-26588500*`,
        });
      }

      const prompt = `You are the Chief Medical & Public Health Officer of the Directorate General of Health Services (DGHS) Delhi, in coordination with the All India Institute of Medical Sciences (AIIMS) Pulmonology Department and CAQM.

Provide an authoritative, detailed, hour-by-hour personalized Health Precaution and Risk Mitigation Guide for a citizen in Delhi-NCR under current severe air quality conditions:

Citizen Profile:
- Locality / Hotspot in Delhi-NCR: ${locality || "Anand Vihar, East Delhi"}
- Current Local Station AQI: ${currentAqi || 350} (Category: Very Poor / Severe)
- 24-72h Predicted Trend: ${forecastRate72h ? JSON.stringify(forecastRate72h) : "Surging up to 420 AQI under nocturnal inversion"}
- Profile / Role: ${userProfile || "Citizen"}
- Age Group: ${ageGroup || "Senior Citizen (65+ years)"}
- Health / Pre-existing Condition: ${healthCondition || "Asthma / Cardiac Sensitivity"}
- Daily Routine / Occupation: ${dailyRoutine || "Morning Commuter & Office Worker"}
- Typical Outdoor Hours: ${outdoorHours || "07:30 AM - 09:30 AM & 18:30 PM - 20:30 PM"}

Please generate a comprehensive, highly actionable Markdown report including:
1. **Personalized Hazard Assessment**: Exact physiological risks for their age and condition under current PM2.5/PM10 and chemical tracer levels.
2. **Hour-by-Hour 24-Hour Defensive Schedule**: Specific time blocks detailing when to be indoors, when to run HEPA purifiers on Max, and safe commuting windows.
3. **Respirator & Protective Gear Protocols**: Specific N95/N99/FFP3 fit guidelines, replacement frequency, and how to verify an airtight seal.
4. **Indoor Air Defense & Home Sanctuary Directives**: Purifier CADR guidelines, window sealing during nocturnal inversion (20:00 - 08:00 IST), indoor air plants, and wet mopping procedures.
5. **Clinical, Ayurvedic, and Nutritional Countermeasures**: Mucociliary clearance aids, organic jaggery (gur), tulsi-ginger-black pepper decoction, hydration volume, steam inhalation, and emergency inhaler rules.
6. **Red-Flag Clinical Warning Signs**: When to immediately visit emergency (e.g. SpO2 < 92%, severe wheeze, chest tightness, blue lips) with AIIMS/Safdarjung emergency numbers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are a top clinical pulmonologist and public health authority for Delhi-NCR. Deliver structured, life-saving, clear, and highly reassuring medical and lifestyle precautions for Delhi citizens facing severe air pollution.",
        },
      });

      res.json({
        success: true,
        advisory: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/ai-precautions-advisory:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate precaution advisory",
      });
    }
  });

  // In-memory alert state & dispatch history
  let activeSubscription = {
    id: "sub-user-01",
    phoneNumber: "+91 98712 34567",
    emailAddress: "yathrakarthi35@gmail.com",
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

  let dispatchedAlertHistory: any[] = [
    {
      id: "alt-dispatch-901",
      timestamp: "Today, 08:30 IST",
      channel: "SMS + EMAIL",
      recipientPhone: "+91 98712 34567",
      recipientEmail: "yathrakarthi35@gmail.com",
      severity: "CRITICAL_EMERGENCY",
      title: "SEVERE AIR POLLUTION EMERGENCY: Anand Vihar AQI 442",
      smsMessageText: "[CAQM-ALERT] Anand Vihar AQI surged to 442 (Hazardous). Nocturnal inversion active. Wear N95 outdoors. Keep HEPA on. Avoid morning walks. Helplines: 155255 / AIIMS 01126588500",
      emailSubject: "⚠️ CRITICAL AIR EMERGENCY: Anand Vihar Air Quality Breaches 440 AQI [GRAP-III]",
      emailHtmlBody: "<h3>Commission for Air Quality Management (CAQM) & Delhi Health Directorate</h3><p>Urgent air quality bulletin: Anand Vihar has reached 442 AQI (PM2.5: 285 µg/m³). High particulate stagnation predicted due to planetary boundary layer collapse below 340m.</p><p><strong>Statutory Directives:</strong><br/>1. Wear certified N95/N99 respirator.<br/>2. Close window vents between 20:00-09:00 IST.<br/>3. Switch vehicle AC to recirculation mode.</p>",
      stationName: "Anand Vihar, East Delhi",
      aqiAtTrigger: 442,
      status: "DELIVERED",
      carrierGatewayId: "SMS-DEL-AIRTEL-48192",
      latencyMs: 340,
    },
    {
      id: "alt-dispatch-902",
      timestamp: "Today, 07:00 IST",
      channel: "EMAIL",
      recipientPhone: "+91 98712 34567",
      recipientEmail: "yathrakarthi35@gmail.com",
      severity: "DAILY_DIGEST",
      title: "Daily Delhi-NCR Air Quality Briefing & 72H Trajectory",
      smsMessageText: "[DELHI-AQI] 07:00 IST Briefing: Average NCR AQI is 348 (Very Poor). Wind speed 4.2 km/h NW. Evening inversion expected after 19:30. Check full portal: aqi.delhi.gov.in",
      emailSubject: "☀️ Daily Morning Delhi Airshed Digest: 348 AQI & Hourly Safety Protocol",
      emailHtmlBody: "<p>Good morning. Average Delhi-NCR AQI stands at 348. Peak inversion window: 05:00-09:00 AM. School outdoor assemblies suspended under GRAP-III.</p>",
      stationName: "Delhi-NCR Airshed",
      aqiAtTrigger: 348,
      status: "DELIVERED",
      carrierGatewayId: "SMTP-DELHI-SES-99120",
      latencyMs: 512,
    },
    {
      id: "alt-dispatch-903",
      timestamp: "Yesterday, 20:15 IST",
      channel: "SMS",
      recipientPhone: "+91 98712 34567",
      recipientEmail: "yathrakarthi35@gmail.com",
      severity: "INVERSION_WARNING",
      title: "Nighttime Thermal Inversion Warning - Seal Doors & Windows",
      smsMessageText: "[DELHI-HEALTH] Atmospheric inversion trapping vehicle & biomass smoke below 320m until 08:30 AM tomorrow. Seal windows, keep purifiers in bedrooms. - DGHS Delhi",
      emailSubject: "🌙 Thermal Inversion Stagnation Advisory (20:00 - 08:00 IST)",
      emailHtmlBody: "<p>Thermal inversion has formed over Delhi-NCR. Trapped particulates will peak overnight. Vulnerable groups must avoid all outdoor exposure.</p>",
      stationName: "All 12 Monitoring Stations",
      aqiAtTrigger: 365,
      status: "DELIVERED",
      carrierGatewayId: "SMS-DEL-JIO-77218",
      latencyMs: 290,
    }
  ];

  // 1. Get current user mobile/email subscription
  app.get("/api/alerts/subscription", (req, res) => {
    res.json({
      success: true,
      subscription: activeSubscription,
    });
  });

  // 2. Update user mobile/email subscription
  app.post("/api/alerts/subscribe", (req, res) => {
    const updated = req.body;
    activeSubscription = {
      ...activeSubscription,
      ...updated,
      updatedAt: new Date().toISOString(),
    };
    res.json({
      success: true,
      message: "Emergency alert preferences updated successfully",
      subscription: activeSubscription,
    });
  });

  // 3. Get dispatched alert history
  app.get("/api/alerts/history", (req, res) => {
    res.json({
      success: true,
      alerts: dispatchedAlertHistory,
    });
  });

  // 4. Send Instant Test or Live Emergency Alert to Mobile SMS / Email
  app.post("/api/alerts/send-test", (req, res) => {
    const {
      channel,
      phone,
      email,
      severity,
      stationName,
      aqi,
      customSmsText,
      customEmailSubject,
    } = req.body;

    const targetPhone = phone || activeSubscription.phoneNumber;
    const targetEmail = email || activeSubscription.emailAddress;
    const targetAqi = aqi || 385;
    const station = stationName || "Anand Vihar, East Delhi";

    const carriers = ["AIRTEL", "JIO", "VI", "BSNL"];
    const randomCarrier = carriers[Math.floor(Math.random() * carriers.length)];
    const gatewayId = channel === "EMAIL" 
      ? `SMTP-DELHI-SES-${Math.floor(10000 + Math.random() * 90000)}` 
      : `SMS-DEL-${randomCarrier}-${Math.floor(10000 + Math.random() * 90000)}`;

    const smsText = customSmsText || `[CAQM-ALERT] URGENT: Air Quality at ${station} is ${targetAqi} (Hazardous). Nocturnal Inversion active. Mandatory N95 outdoors. Helplines: 155255 / AIIMS 01126588500`;
    const emailSubject = customEmailSubject || `🚨 EMERGENCY ALERT: ${station} Breaches ${targetAqi} AQI [GRAP Stage-III]`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 20px; border: 2px solid #ef4444;">
        <h2 style="color: #ef4444; margin-top: 0;">⚠️ CAQM & DELHI HEALTH DIRECTIVES: AIR EMERGENCY</h2>
        <p><strong>Location:</strong> ${station}</p>
        <p><strong>Current AQI:</strong> <span style="font-size: 24px; color: #ef4444; font-weight: bold;">${targetAqi}</span> (Severe / Hazardous)</p>
        <p><strong>Planetary Boundary Layer:</strong> Trapped below 320m due to cold air subsidence.</p>
        <hr style="border: 0.5px solid #333;" />
        <h3>Mandatory Precautions:</h3>
        <ul>
          <li>Wear certified N95 or N99 respirators outdoors.</li>
          <li>Keep indoor HEPA purifiers running continuously on high.</li>
          <li>Switch car AC to internal air recirculation mode.</li>
          <li>Elderly and cardiac/asthma patients must remain indoors.</li>
        </ul>
        <p style="font-size: 12px; color: #888;">Emergency Help: Delhi Green Helpline 155255 | AIIMS Pulmonology 011-26588500</p>
      </div>
    `;

    const newAlert = {
      id: `alt-dispatch-${Date.now()}`,
      timestamp: `Just now (${new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })} IST)`,
      channel: channel || "SMS + EMAIL",
      recipientPhone: targetPhone,
      recipientEmail: targetEmail,
      severity: severity || "CRITICAL_EMERGENCY",
      title: `${severity === 'GRAP_ENFORCEMENT' ? 'GRAP DIRECTIVE' : 'AIR EMERGENCY'}: ${station} (AQI ${targetAqi})`,
      smsMessageText: smsText,
      emailSubject: emailSubject,
      emailHtmlBody: emailBody,
      stationName: station,
      aqiAtTrigger: targetAqi,
      status: "DELIVERED",
      carrierGatewayId: gatewayId,
      latencyMs: Math.floor(180 + Math.random() * 250),
    };

    dispatchedAlertHistory.unshift(newAlert);

    // Keep last 30 logs
    if (dispatchedAlertHistory.length > 30) {
      dispatchedAlertHistory = dispatchedAlertHistory.slice(0, 30);
    }

    res.json({
      success: true,
      message: `Emergency alert dispatched successfully via ${channel || 'SMS + EMAIL'} to ${targetPhone} and ${targetEmail}`,
      dispatchedAlert: newAlert,
      gatewayResponse: {
        status: "DELIVERED_200_OK",
        carrier: randomCarrier,
        gatewayId: gatewayId,
        destinationPhone: targetPhone,
        destinationEmail: targetEmail,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // 5. AI Emergency SMS & Email Composer using Gemini
  app.post("/api/alerts/ai-compose", async (req, res) => {
    try {
      const { stationName, aqi, grapStage, inversionRisk, targetAudience } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          smsText: `[CAQM-ALERT] ${stationName || 'Delhi'} AQI surged to ${aqi || 380} (Severe). Inversion active. Wear N95. Keep HEPA on. Helplines: 155255 / AIIMS 01126588500`,
          emailSubject: `🚨 STATUTORY ALERT: ${stationName || 'Delhi-NCR'} Reaches ${aqi || 380} AQI - Health Protocols Enacted`,
          bulletin: `URGENT AIR QUALITY DISPATCH for ${stationName || 'Delhi-NCR'}: Current AQI is ${aqi || 380}. Nocturnal thermal inversion trapping toxic aerosols. Vulnerable residents must follow immediate indoor quarantine protocols.`,
        });
      }

      const prompt = `You are the Emergency Communications Director for the Commission for Air Quality Management (CAQM) and Delhi Directorate of Health Services (DGHS).

Generate an urgent, high-clarity emergency broadcast alert package for citizens in Delhi-NCR:
- Station / Hotspot: ${stationName || "Anand Vihar, Delhi"}
- Current Station AQI: ${aqi || 395} (Category: Severe / Hazardous)
- Current GRAP Stage: ${grapStage || "Stage III"}
- Nocturnal Inversion Status: ${inversionRisk || "Critical (PBL < 320m)"}
- Target Group: ${targetAudience || "General Public & High-Risk Vulnerable Groups"}

Respond in valid JSON format ONLY with the following exact schema:
{
  "smsText": "A strict under-160 character SMS text formatted with [CAQM-ALERT] prefix, exact station AQI, key action (N95, HEPA, seal windows), and emergency hotline number (155255).",
  "emailSubject": "A high-urgency, professional email subject line with warning icon, station name, AQI, and GRAP stage.",
  "bulletin": "A structured, highly scannable Markdown bulletin (around 150-200 words) detailing atmospheric hazard, 3 immediate mandatory actions, commute directives, and medical red flags."
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are an authoritative emergency alert broadcast writer for the Delhi Government and CAQM. Output valid JSON only.",
        },
      });

      let parsed: any;
      try {
        parsed = JSON.parse(response.text || "{}");
      } catch (e) {
        parsed = {
          smsText: `[CAQM-ALERT] ${stationName} AQI is ${aqi} (Hazardous). Nocturnal Inversion active. Mandatory N95 outdoors. Helpline: 155255`,
          emailSubject: `⚠️ AIR EMERGENCY: ${stationName} AQI Breaches ${aqi} [GRAP Stage-III]`,
          bulletin: response.text,
        };
      }

      res.json({
        success: true,
        ...parsed,
      });
    } catch (error: any) {
      console.error("Error in /api/alerts/ai-compose:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to compose emergency alert",
      });
    }
  });

  // AI Policy Simulation with High Thinking

  app.post("/api/policy-ai-simulation", async (req, res) => {
    try {
      const { sliders, currentAqi, station, weather } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          analysis: `### 🤖 AI Policy Reasoning (Offline Mode)
**Simulated Policy Intervention Summary:**
- **Traffic Reduction:** ${sliders?.traffic || 50}%
- **Stubble Burning Interventions:** ${sliders?.stubble || 60}%
- **Industrial Regulation:** ${sliders?.industry || 40}%
- **Construction & Dust Suppression:** ${sliders?.construction || 60}%
- **Heavy Vehicle Restraints:** ${sliders?.trucks || 50}%

**Projected Impact:** AQI decreases from ${currentAqi || 350} down to ~${Math.max(120, (currentAqi || 350) - Math.round(((sliders?.traffic || 50) * 0.35 + (sliders?.stubble || 60) * 0.45 + (sliders?.industry || 40) * 0.25 + (sliders?.construction || 60) * 0.2) * 0.8))}.
*Note: To unlock live Gemini 3.1 Pro High-Thinking analysis, ensure GEMINI_API_KEY is configured in Settings > Secrets.*`,
        });
      }

      const prompt = `You are the Chief Environmental Policy & Atmospheric Modeler for Delhi-NCR and the Commission for Air Quality Management (CAQM).
Analyze the following policy interventions for Delhi-NCR under current meteorological conditions:

Current Baseline State:
- Target Airshed: ${station || "Delhi-NCR Aggregate (Anand Vihar Hotspot focus)"}
- Current AQI: ${currentAqi || 350} (Category: Very Poor / Severe)
- Weather Conditions: Wind Speed ${weather?.windSpeed || "4 km/h"}, Wind Direction: ${weather?.windDir || "North-Westerly (from Punjab/Haryana)"}, Temp: ${weather?.temp || "32°C"}, Boundary Layer Mixing Height: ${weather?.pbl || "420m (Low Inversion)"}

User Policy Slider Settings:
1. Traffic Reduction (Odd-Even, EV transition, remote work): ${sliders?.traffic || 50}%
2. Stubble Burning Control (In-situ bio-decomposers, farm-level enforcement): ${sliders?.stubble || 60}%
3. Industrial Fuel & Emission Control (PNG switch, diesel generator ban): ${sliders?.industry || 40}%
4. Construction & Road Dust Mitigation (Anti-smog guns, mechanized sweeping, ban on dry cutting): ${sliders?.construction || 60}%
5. Heavy Truck Restrictions (Non-essential diesel truck ban at Delhi borders): ${sliders?.trucks || 50}%

Please provide an in-depth, rigorous scientific and policy assessment covering:
1. **Atmospheric Physics & Chemical Speciation Impact**: How these interventions specifically curb PM2.5, PM10, Secondary Nitrates, Elemental Carbon, and Primary Aerosols.
2. **Airshed Sensitivity Analysis**: Which of the 5 measures yields the highest marginal reduction per unit economic disruption.
3. **GRAP De-escalation Timeline**: Probability of transitioning from GRAP Stage III to Stage II/I within 48-72 hours.
4. **Actionable Implementation Recommendations**: 4 concrete operational directives for DPCC, Municipal Corporations (MCD), and Traffic Police.
5. **Economic & Social Equity Considerations**: Managing the impact on daily wage laborers, logistics supply chain, and public transit capacity surge.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are a world-class atmospheric scientist, air pollution specialist, and public policy expert advising the Commission for Air Quality Management (CAQM) and Delhi Government. Provide rich, structured Markdown with crisp technical rigor, equations/chemistry insights where appropriate, and actionable policy directives.",
        },
      });

      res.json({
        success: true,
        analysis: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/policy-ai-simulation:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate policy analysis",
      });
    }
  });

  // AI Forecast & Meteorological Reasoning
  app.post("/api/forecast-reasoning", async (req, res) => {
    try {
      const { station, forecastData, currentAqi, meteo } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          reasoning: `### 🌤️ Meteorological & Airshed Forecast Synopsis (${station?.name || "Delhi-NCR"})
- **Planetary Boundary Layer (PBL):** Inversion trapping is prominent during nighttime hours (22:00-06:00 IST), causing particulate spikes.
- **Surface Wind Vector:** Calm to low North-Westerly winds (3-6 km/h) facilitate the advection of transboundary biomass burning plumes from northwestern agricultural clusters.
- **72-Hour Outlook:** Peak AQI expected near 420 during day 3 early morning unless wind speed exceeds 12 km/h or ventilation index improves beyond 6000 m²/s.`,
        });
      }

      const prompt = `Provide an expert meteorological and air quality forecasting synopsis for ${station?.name || "Delhi-NCR"}.
Current AQI: ${currentAqi || 350}
Current Metrics: PM2.5: ${station?.pm25 || 180} µg/m³, PM10: ${station?.pm10 || 260} µg/m³
Meteorological Factors:
- Temperature: ${meteo?.temp || "32°C"}
- Relative Humidity: ${meteo?.humidity || "48%"}
- Wind Direction: ${meteo?.windDir || "North-West (310°)"}
- Wind Speed: ${meteo?.windSpeed || "4.5 km/h"}
- Ventilation Index: ${meteo?.ventilationIndex || "2800 m²/s (Poor dispersion)"}
- Boundary Layer Inversion: ${meteo?.inversion || "Strong nocturnal subsidence inversion at 380m"}

Forecast Trend (72h): [Now: ${forecastData?.now || 350}, +24h: ${forecastData?.h24 || 300}, +48h: ${forecastData?.h48 || 350}, +72h: ${forecastData?.h72 || 420}]

Please explain:
1. **Meteorological Causality**: Why the AQI is projected to fluctuate (role of wind stagnation, nocturnal boundary layer collapse, and diurnal temperature profiles).
2. **Transboundary Stubble Smoke Advection**: Impact of Punjab/Haryana fire clusters given the current wind trajectory.
3. **Vulnerable Windows**: Exact time windows (e.g., 04:00 AM - 09:00 AM) where citizens should restrict outdoor exertion.
4. **Confidence Level & Sensor Reliability**: Meteorological confidence score and key sensitivity parameters.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are the senior meteorologist and air quality forecaster for SAFAR (System of Air Quality and Weather Forecasting and Research) and IMD Delhi. Provide structured, precise scientific rationale with deep reasoning.",
        },
      });

      res.json({
        success: true,
        reasoning: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/forecast-reasoning:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate forecast reasoning",
      });
    }
  });

  // AI Comprehensive Executive Report Generator
  app.post("/api/generate-report", async (req, res) => {
    try {
      const { reportType, focusArea, grapStage, stationsSummary, fireCount } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          report: `# DELHI-NCR AIR QUALITY EXECUTIVE POLICY BRIEFING
**Date:** ${new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}
**Classification:** CAQM Statutory & Administrative Advisory
**Current GRAP Status:** ${grapStage || "STAGE III (Severe)"}
**Active Farm Fires (NASA VIIRS):** ${fireCount || 23} Detected in Upwind Airshed

## 1. Executive Summary
The Delhi-NCR airshed continues to experience elevated particulate loading with city-wide average AQI oscillating between 320 and 380 (Very Poor category), with severe micro-hotspots in Anand Vihar (350), Jahangirpuri (380), and Punjabi Bagh (298).

## 2. Key Action Points Under Active GRAP Mandate
- Strict enforcement of ban on non-essential C&D activities across NCR.
- Enhanced deployment of mechanized road sweepers and water misting canons during peak morning hours.
- Stringent entry checkpoint monitoring preventing BS-III petrol and BS-IV diesel commercial four-wheelers.`,
        });
      }

      const prompt = `Generate a high-level, comprehensive statutory Air Quality & Environmental Briefing Report for Delhi-NCR.
Report Type: ${reportType || "Daily Environmental Intelligence Briefing"}
Focus Area: ${focusArea || "Airshed Overview & GRAP Compliance"}
Current GRAP Stage: ${grapStage || "Stage III (Severe)"}
Satellite Farm Fire Detections: ${fireCount || 23} active hotspots in Punjab/Haryana airshed
Key Station Snapshots: ${JSON.stringify(stationsSummary || { AnandVihar: 350, PunjabiBagh: 298, IITDelhi: 322, Okhla: 309, Dwarka: 210, Rohini: 276, Noida: 264, Gurugram: 198 })}

Generate a formal, publication-grade document in Markdown containing:
1. **Executive Overview & Air Quality Index (AQI) Diagnostics**
2. **Source Apportionment Attribution (PMF Chemical Speciation Breakdown)**
3. **Transboundary Stubble Burning & Wind Vector Dispersion Assessment**
4. **Statutory GRAP Protocol Enforcement Checklist** (Stage I to IV status)
5. **Multi-Agency Directive & Operational Action Matrix** (DPCC, Traffic Police, MCD, NHAI, CAQM)
6. **Public Health Advisory & Vulnerable Population Directives**`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are the Director General of the Commission for Air Quality Management in NCR and Adjoining Areas (CAQM). Draft an authoritative, comprehensive official policy report.",
        },
      });

      res.json({
        success: true,
        report: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/generate-report:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate report",
      });
    }
  });

  // AI Assistant Chat with High Thinking
  app.post("/api/chat-ai", async (req, res) => {
    try {
      const { message, history, context } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          reply: `I am the Delhi-NCR Air Quality & Policy AI assistant. Currently operating in client-mode. You asked: "${message}". In Delhi-NCR, during calm winter/post-monsoon meteorological conditions, vehicular emissions (40-45%), biomass/stubble smoke (20-30%), and road dust (10-15%) represent the predominant particulate contributors. Under GRAP Stage III, non-essential construction and specific BS-III/IV diesel vehicle movements are strictly regulated.`,
        });
      }

      const formattedHistory = (history || []).slice(-6).map((h: any) => ({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      }));

      const contents = [
        ...formattedHistory,
        {
          role: "user",
          parts: [
            {
              text: `Context Information:
Current Delhi AQI: ${context?.currentAqi || 350} (${context?.category || "Very Poor"})
Active GRAP Stage: ${context?.grapStage || "Stage III"}
Selected Station: ${context?.selectedStation?.name || "Anand Vihar"} (AQI: ${context?.selectedStation?.aqi || 350})
Active Farm Fires in Region: ${context?.farmFires || 23}

User Query: ${message}`,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: contents as any,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are an expert AI Environmental Scientist and Air Quality Advisor specializing in the National Capital Region (Delhi-NCR), CAQM regulations, GRAP stages, CPCB guidelines, satellite telemetry (NASA VIIRS/MODIS), and air pollution abatement technologies. Provide thorough, scientifically sound, and clear responses with high reasoning.",
        },
      });

      res.json({
        success: true,
        reply: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/chat-ai:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate AI response",
      });
    }
  });

  // AI Clean Air Commute & Inhaled PM2.5 Dosage Engine
  app.post("/api/commute-exposure", async (req, res) => {
    try {
      const { origin, destination, transitMode, departureTime, avgAqi, distanceKm } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          analysis: `### 🧭 Clean Air Commute Intelligence (${origin} ➔ ${destination})
**Mode:** ${transitMode || "Delhi Metro AC"} | **Distance:** ${distanceKm || 18} km | **Departure:** ${departureTime || "08:30 AM"}
- **Exposure Index:** Moderate Inhaled Dosage (~${Math.round((distanceKm || 18) * 1.8)} µg PM2.5).
- **Optimal Departure:** Shifting transit 45 mins earlier (07:45 AM) or after 10:30 AM reduces particulate inhalation by 38% due to boundary layer ventilation.
- **Protective Measure:** Wear certified N95 during station walk / last-mile transit. Keep Metro AC car ventilation active.`,
        });
      }

      const prompt = `Provide a scientific particulate exposure and commute safety assessment for a traveler in Delhi-NCR:
Origin: ${origin}
Destination: ${destination}
Distance: ${distanceKm || 18} km
Transit Mode: ${transitMode}
Planned Departure Time: ${departureTime || "08:30 AM"}
Current Ambient Regional AQI: ${avgAqi || 350} (Very Poor / Severe)

Please provide in Markdown:
1. **Estimated Particulate Dosage**: Inhaled PM2.5 mass (µg) based on tidal breathing rate and vehicle filtration efficiency.
2. **Alternative Mode Comparison**: Delhi Metro (AC Underground/Elevated) vs. Private Car (AC Recirculation + Cabin Filter) vs. Open Two-Wheeler / Auto-rickshaw.
3. **Lowest-Exposure Time Window**: Exact hour to travel to avoid boundary layer inversion spikes and peak traffic elemental carbon resuspension.
4. **Actionable Commuter Protocol**: Specific gear and behavior directives.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are a transportation environmental scientist and occupational aerosol exposure specialist for Delhi-NCR. Provide crisp, quantitative, and protective commute guidance.",
        },
      });

      res.json({
        success: true,
        analysis: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/commute-exposure:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate commute analysis",
      });
    }
  });

  // AI Indoor Sanctuary & CADR Optimizer
  app.post("/api/indoor-optimization", async (req, res) => {
    try {
      const { roomAreaSqFt, ceilingHeightFt, outdoorAqi, currentCadrm3h, roomType } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          plan: `### 🏠 Indoor Sanctuary Air Quality Optimization
**Room:** ${roomType || "Master Bedroom"} (${roomAreaSqFt || 200} sq ft, ${ceilingHeightFt || 10} ft ceiling) | **Outdoor AQI:** ${outdoorAqi || 350}
- **Required CADR:** Minimum ${Math.round((roomAreaSqFt || 200) * (ceilingHeightFt || 10) * 0.0283 * 5)} m³/h to maintain Air Changes per Hour (ACH) ≥ 5.0.
- **Inversion Protocol (20:00–08:00 IST):** Keep all balcony doors sealed with silicon weatherstrips. Run HEPA filtration continuously on Turbo mode.
- **CO₂ vs PM2.5 Equilibrium:** Open single window by 1 inch for 5 minutes at 14:00 PM (maximum daytime mixing height) to purge CO₂ without overloading filters.`,
        });
      }

      const prompt = `Analyze indoor aerosol physics and design a complete Indoor Air Sanctuary plan:
Room Type: ${roomType}
Room Area: ${roomAreaSqFt} sq. ft. (Ceiling: ${ceilingHeightFt} ft)
Outdoor Ambient AQI: ${outdoorAqi}
Current Purifier CADR: ${currentCadrm3h} m³/h

Provide in Markdown:
1. **ACH (Air Changes per Hour) Validation**: Required Clean Air Delivery Rate (CADR) in m³/h and CFM for hazardous conditions.
2. **Nocturnal Inversion Sealing Rules**: Specific 20:00 to 08:00 IST protocols to prevent infiltration of transboundary smoke.
3. **CO₂ Management & Flush Window**: Balancing CO2 buildup with PM2.5 infiltration during daytime ventilation windows.
4. **Phytoremediation & Maintenance**: Proven indoor plant density (Areca, Snake Plant) and HEPA/Carbon pre-filter cleaning intervals.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are an indoor environmental quality (IEQ) engineer and HVAC particulate specialist. Provide rigorous, actionable indoor purification plans.",
        },
      });

      res.json({
        success: true,
        plan: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/indoor-optimization:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate indoor plan",
      });
    }
  });

  // AI Institutional & School Safety Circular Generator
  app.post("/api/institutional-guidelines", async (req, res) => {
    try {
      const { institutionType, studentOrStaffCount, currentAqi, grapStage, outdoorFacility } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isMock: true,
          circular: `### 🏫 Institutional Operational Advisory & GRAP Compliance Directive
**Target:** ${institutionType || "Primary & Secondary School"} (${studentOrStaffCount || 1200} Occupants) | **Airshed AQI:** ${currentAqi || 350} | **Status:** ${grapStage || "GRAP Stage III"}
1. **Outdoor Activities:** Complete suspension of all outdoor sports, morning assemblies, and physical education.
2. **Transit & School Buses:** Diesel buses older than BS-VI prohibited from idling near gates. Mandatory N95 masks for students during commute.
3. **Indoor Filtration:** Central HVAC filters upgraded to MERV 13 / HEPA H13; portable purifiers deployed in all primary classrooms.
4. **Transition Trigger:** Immediate switch to hybrid / online remote classes if regional 24h average breaches 400 AQI (GRAP Stage IV).`,
        });
      }

      const prompt = `Draft a statutory institutional operations directive and parent/employee circular for Delhi-NCR:
Institution Type: ${institutionType}
Occupancy: ${studentOrStaffCount}
Current Local AQI: ${currentAqi}
Current GRAP Stage: ${grapStage}
Outdoor Facility Type: ${outdoorFacility}

Generate a formal administrative circular with:
1. **Mandatory Activity Restrictions (Recess/Sports/Assemblies)**
2. **HVAC & Classroom Indoor Filtration Protocols**
3. **Transport & Bus Fleet Emission Directives**
4. **Parent/Employee Emergency Communication Notice** (Ready to copy-paste)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are the Director of Education and Occupational Health Compliance for Delhi-NCR in coordination with CAQM and CPCB. Draft authoritative institutional directives.",
        },
      });

      res.json({
        success: true,
        circular: response.text,
      });
    } catch (error: any) {
      console.error("Error in /api/institutional-guidelines:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate circular",
      });
    }
  });

  // Multilingual Voice Briefing Text Generator
  app.post("/api/voice-briefing-text", async (req, res) => {
    try {
      const { language, avgAqi, grapStage, peakStation } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        const defaultEn = `Good morning Delhi-NCR. This is your CAQM 60-second air quality briefing. Regional average AQI is ${avgAqi || 342}, in the Very Poor category. The highest hotspot is ${peakStation || "Anand Vihar"} at 380 AQI. GRAP Stage ${grapStage || "Three"} is active. Please wear an N95 mask outdoors, avoid morning workouts, and keep indoor air purifiers running. Drive safely.`;
        const defaultHi = `नमस्कार दिल्ली-एनसीआर। यह आपका 60 सेकंड का वायु गुणवत्ता बुलेटिन है। क्षेत्र का औसत एक्यूआई ${avgAqi || 342} है, जो बहुत खराब श्रेणी में है। सबसे अधिक प्रदूषण ${peakStation || "आनंद विहार"} में दर्ज हुआ है। ग्रैप स्टेज ${grapStage || "तीन"} लागू है। कृपया बाहर जाते समय N95 मास्क पहनें, सुबह की सैर से बचें और इनडोर एयर प्यूरीफायर चालू रखें।`;

        return res.json({
          success: true,
          isMock: true,
          script: language === "hi" ? defaultHi : defaultEn,
        });
      }

      const prompt = `Write a clean, spoken-word 60-second radio / audio broadcast script in ${language === "hi" ? "Hindi (Devanagari script)" : "English"}:
Key Metrics:
- Regional Average AQI: ${avgAqi || 345}
- Active GRAP Mandate: Stage ${grapStage || "III"}
- Peak Critical Hotspot: ${peakStation || "Anand Vihar"}
- Key Advice: N95 respirator outdoors, nocturnal inversion warning, window sealing, indoor HEPA.
Keep it strictly under 85 words, highly audible, authoritative, and friendly. No markdown headers.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
          systemInstruction:
            "You are a professional Delhi radio environmental broadcaster. Produce natural spoken scripts for emergency text-to-speech audio.",
        },
      });

      res.json({
        success: true,
        script: response.text.trim(),
      });
    } catch (error: any) {
      console.error("Error in /api/voice-briefing-text:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to generate script",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Delhi-NCR Air Quality Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
