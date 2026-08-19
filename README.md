# NVY AI — Delhi-NCR Air Quality Decision Support Platform

An advanced, real-time environmental decision support system and public health command center for the Delhi-NCR airshed. Built entirely from the ground up with **zero premium third-party AI APIs** (no OpenAI, no Google Gemini, no Anthropic) and **zero proprietary analytical SaaS** (no Mapbox Studio, no Firebase, no cloud ML black-boxes).

Powered by **NVY AI Core**, an in-house deep learning and deterministic atmospheric modeling engine with pure PyTorch LSTM architectures, Chemical Mass Balance receptor math, and open-source PostGIS spatial indexing.

---

## 🌟 Key Features & Feature Modules

### 🏛️ Airshed Command & Governance
- **CAAQMS Command Center:** Real-time continuous ambient telemetry across 10 monitoring stations in Delhi, Noida, Ghaziabad, Gurugram, and Faridabad.
- **Statutory GRAP Protocol Engine:** Statutory enforcement checklists and departmental compliance matrices for CAQM GRAP Stages I through IV.
- **Executive Policy Reports:** Automated synthesis of CPCB/CAQM daily briefings, compliance audits, and source apportionment documents.

### 🔬 Environmental Intelligence & Deep Learning
- **72-Hour PyTorch LSTM Regressor:** Custom sequence-to-sequence recurrent neural network (`DelhiAQILSTM`) mapping 168 hours (7 days) of lookback features ($PM_{2.5}$, $PM_{10}$, Temperature, Humidity, Wind Speed, Boundary Layer Height) into a 72-hour forecast curve.
- **Physical Chemical Mass Balance (CMB) Model:** Physical receptor model solving $\mathbf{C}_i = \sum \mathbf{F}_{ij} \cdot \mathbf{S}_j + \mathbf{\epsilon}_i$ via Non-Negative Least Squares (NNLS) optimization matching receptor observations against IIT-Kanpur/DPCC chemical fingerprint vectors.
- **Interactive Policy Sandbox:** Multi-lever simulator modeling marginal abatement from vehicular restrictions, stubble suppression, industrial fuel conversion, dust misting, and truck bans.
- **Satellite Stream Telemetry:** Live telemetry monitor tracking NASA FIRMS (VIIRS & MODIS active thermal anomalies) and ESA Copernicus Sentinel-5P TROPOMI tropospheric $NO_2$ column grids.
- **HTML5 Canvas Wind Particle Layer:** Pure trigonometric particle tracking loop animating wind vectors over OpenStreetMap with zero external map library dependencies.

### 🛡️ Citizen Health & Urban Protection
- **Clinical Health Precautions:** Personalized 24-hour health defense plans tailored to age group, medical conditions (Asthma/COPD, Cardiac, Pediatric), and transit schedules.
- **Clean Air Commute Planner:** Inhaled $PM_{2.5}$ dosage calculation across Delhi Metro (Underground AC), Private Car (Recirculation ON), AC Bus, and Two-Wheelers with optimal departure window recommendations.
- **Indoor Sanctuary & CADR Optimizer:** Room volume air changes per hour (ACH) calculator, CADR sizing ($m^3/h$ and CFM), phytoremediation density, and nocturnal inversion sealing schedules.
- **Institutional & School Hub:** Statutory operational circular generator enforcing sports suspensions, online learning triggers, and HVAC recirculation settings.
- **Emergency Mobile Alerts Console:** SMS & Email emergency alert dispatch simulator with carrier gateway telemetry.
- **Multilingual Audio Broadcast:** Spoken 60-second environmental radio bulletins in English and Hindi with Web Speech API text-to-speech synthesis.

---

## 📱 Cross-Platform Responsive Layout (Mobile-First)

The dashboard is designed for seamless operation on wide desktop monitors and mobile touchscreens:
- **Laptop / Desktop View (`lg:grid-cols-5`):** 2 grid columns for touch-friendly policy sliders, 3 grid columns for the 72-hour prediction curve and physical CMB source apportionment output.
- **Mobile View (`grid-cols-1`):** Automatically collapses into a single-column layout with `touch-action: pan-x` slider performance rules.
- **Zero-Dependency SVG Charting:** Mathematical SVG bezier curve graphs that scale responsively to any screen size without heavy third-party chart libraries.

---

## 🧠 NVY AI Architecture & Sovereign Tech Stack

- **Deep Learning Core:** PyTorch 2.2 (`DelhiAQILSTM` Sequence-to-Sequence Regressor).
- **Mathematical Optimization:** SciPy / NumPy Non-Negative Least Squares (NNLS) solver for Chemical Mass Balance.
- **Spatial Database:** TimescaleDB & PostGIS (PostgreSQL 15) with spatial geometry indexes.
- **Satellite Ingestion:** NASA FIRMS API + Sentinel-5P TROPOMI NetCDF4 arrays.
- **Backend Gateways:**
  - **FastAPI Gateway (`backend/app/main.py`):** Asynchronous Python REST API for PyTorch inference and PostGIS spatial math.
  - **NVY Node Core (`server.ts`):** Self-contained, deterministic sub-millisecond reasoning engine.
- **Frontend Dashboard:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, Leaflet GIS (OpenStreetMap / CartoDB Dark).

---

## 🚀 Getting Started

### Option 1: Quick Local Development (Node / Vite)
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build & start for production
npm run build
npm start
```
Open **`http://localhost:3000`** in your browser.

---

### Option 2: Full Sovereign Multi-Container Stack (Docker Compose)
To launch the complete self-hosted architecture including **TimescaleDB / PostGIS**, the **FastAPI PyTorch ML Backend**, and the **React Frontend**:
```bash
docker compose up --build -d
```
- **Frontend Dashboard:** `http://localhost:3000`
- **FastAPI ML Gateway & Interactive Docs:** `http://localhost:8000/docs`
- **TimescaleDB / PostGIS:** `localhost:5432`

---

## 🧪 Code Validation & Linting
```bash
# Verify TypeScript compilation (0 errors)
npx tsc --noEmit

# Run production build
npm run build
```
