export type AqiCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface StationSourceBreakdown {
  vehicles: number;
  stubble: number;
  industry: number;
  construction: number;
  biomass: number;
  other?: number;
}

export interface StationForecast {
  now: number;
  h24: number;
  h48: number;
  h72: number;
  d5?: number;
  d7?: number;
  rateOfChange24h?: number; // e.g. -2.1 AQI/hr
  rateOfChange48h?: number; // e.g. +2.1 AQI/hr
  rateOfChange72h?: number; // e.g. +2.9 AQI/hr
  peakSurgeWindow?: string;
}

export interface MonitoringStation {
  id: string;
  name: string;
  district: string;
  state: 'Delhi' | 'Haryana' | 'Uttar Pradesh';
  lat: number;
  lng: number;
  aqi: number;
  category: AqiCategory;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  nh3: number;
  temp: number;
  humidity: number;
  windSpeed: number;
  windDir: string;
  windDegree: number;
  pblHeight: number; // Planetary Boundary Layer height in meters
  lastUpdated: string;
  isHotspot?: boolean;
  sources: StationSourceBreakdown;
  forecast: StationForecast;
  sensorReliability: number; // percentage (e.g., 98%)
  // Live Satellite telemetry attributes
  liveAod?: number; // Aerosol Optical Depth from Satellite
  livePacketTimestamp?: string;
  liveRateOfChange?: number; // instant delta AQI/min
}

export interface SatelliteFeedInfo {
  id: string;
  name: string;
  agency: 'NASA' | 'ESA / Copernicus' | 'ISRO / IMD' | 'NOAA';
  sensor: string;
  orbitType: 'Polar LEO' | 'Geostationary' | 'Sun-Synchronous';
  swathResolution: string;
  passTimeUtc: string;
  passTimeIst: string;
  aodMeasurement: number; // Aerosol Optical Depth
  no2ColumnDensity: string;
  carbonMonoxideColumn: string;
  smokePlumeVector: string;
  activeFiresScanned: number;
  status: 'STREAMING' | 'PASSING_OVER_NCR' | 'CALIBRATING';
  lastTelemetryTick: number;
}

export interface RateForecastPoint {
  hourOffset: number;
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  rateOfChangePerHour: number; // e.g. +3.5 AQI/hr
  category: AqiCategory;
  conditionDescription: string;
  dominantSource: string;
  inversionRisk: 'Low' | 'Moderate' | 'Severe' | 'Critical';
}

export interface DelhiPrecautionCategory {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  items: {
    heading: string;
    description: string;
    tag: string;
    isMandatory?: boolean;
  }[];
}

export interface FarmFireHotspot {
  id: string;
  lat: number;
  lng: number;
  district: string;
  state: 'Punjab' | 'Haryana' | 'Uttar Pradesh' | 'Rajasthan';
  brightness: number; // in Kelvin
  frp: number; // Fire Radiative Power (MW)
  confidence: number; // percentage
  satellite: 'VIIRS (Suomi-NPP)' | 'MODIS (Aqua/Terra)' | 'NOAA-20' | 'Sentinel-5P TROPOMI';
  detectedAt: string;
  smokeTrajectoryAngle: number; // wind drift degree
}

export interface GrapStageInfo {
  stage: 'Stage I' | 'Stage II' | 'Stage III' | 'Stage IV';
  roman: 'I' | 'II' | 'III' | 'IV';
  title: string;
  aqiRange: string;
  condition: string;
  status: 'In Effect' | 'Standby' | 'Enforced';
  effectiveDate: string;
  color: string;
  recommendedActions: {
    id: string;
    text: string;
    department: string;
    implemented: boolean;
  }[];
  statutoryDirectives: string[];
}

export interface PolicySliders {
  traffic: number;
  stubble: number;
  industry: number;
  construction: number;
  trucks: number;
}

export interface ChemicalTracer {
  chemical: string;
  tracerFor: string;
  concentration: string;
  unit: string;
  standardLimit: string;
  status: 'Normal' | 'Elevated' | 'Critical';
}

export interface AirReport {
  id: string;
  title: string;
  type: 'Executive Briefing' | 'GRAP Compliance' | 'Source Apportionment' | 'Meteorological Forecast';
  generatedAt: string;
  summary: string;
  content: string;
  grapStage: string;
  averageAqi: number;
  author: string;
}

export interface AlertSubscription {
  id: string;
  phoneNumber: string;
  emailAddress: string;
  enableSms: boolean;
  enableEmail: boolean;
  alertOnSevereAqi: boolean;
  aqiThreshold: number; // e.g. 300 or 400
  alertOnGrapEscalation: boolean;
  alertOnNocturnalInversion: boolean;
  alertOnStubbleSurge: boolean;
  dailyMorningDigest: boolean;
  selectedStationIds: string[]; // or ['all']
  preferredLanguage: 'EN' | 'HI';
  updatedAt: string;
}

export interface DispatchedAlertLog {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'EMAIL' | 'SMS + EMAIL';
  recipientPhone?: string;
  recipientEmail?: string;
  severity: 'CRITICAL_EMERGENCY' | 'GRAP_ENFORCEMENT' | 'INVERSION_WARNING' | 'DAILY_DIGEST';
  title: string;
  smsMessageText: string;
  emailSubject: string;
  emailHtmlBody: string;
  stationName: string;
  aqiAtTrigger: number;
  status: 'DELIVERED' | 'DISPATCHED' | 'FAILED';
  carrierGatewayId: string;
  latencyMs: number;
}
