export type Language = 'en' | 'hi';

export interface Translations {
  // Brand & Header
  appTitle: string;
  appSubtitle: string;
  version: string;
  airshedCommand: string;
  nodeSelect: string;
  currentAirshedStatus: string;
  aiReasoningBtn: string;
  smsEmailAlertsBtn: string;
  systemAlertsDirectives: string;
  unresolved: string;
  signIn: string;
  signOut: string;
  liveIstTime: string;

  // Nav Pillars
  pillarCommand: string;
  pillarIntelligence: string;
  pillarGovernance: string;
  pillarCitizenSafety: string;

  // Nav Tabs
  tabDashboard: string;
  tabCompare: string;
  tabGisMap: string;
  tabSatellite: string;
  tabDataExplorer: string;
  tabForecast: string;
  tabStubbleTrajectory: string;
  tabSources: string;
  tabPolicySim: string;
  tabGrapAlerts: string;
  tabFarmFires: string;
  tabReports: string;
  tabCommunityReports: string;
  tabMobileAlerts: string;
  tabCommutePlanner: string;
  tabIndoorSanctuary: string;
  tabInstitutionalHub: string;
  tabAudioBroadcast: string;
  tabPrecautions: string;

  // Demo Mode
  demoModeBadge: string;
  demoSimulationActive: string;
  demoDisclaimer: string;
  resetToLive: string;
  scenarioBaseline: string;
  scenarioStubbleInversion: string;
  scenarioPolicyIntervention: string;
  scenarioIndustrialSpike: string;
  selectScenario: string;

  // Metrics & Stats
  aqiIndex: string;
  pm25Label: string;
  pm10Label: string;
  no2Label: string;
  windSpeedDir: string;
  pblHeight: string;
  grapEnforcement: string;
  safeLimit: string;
  whoLimitExceeded: string;
  rateOfChange: string;
  dominantSource: string;

  // Compare Mode
  compareTitle: string;
  compareSubtitle: string;
  selectStation1: string;
  selectStation2: string;
  selectStation3: string;
  varianceDelta: string;
  criticalStation: string;
  inversionRisk: string;
  pmRatio: string;

  // Common UI
  live: string;
  status: string;
  critical: string;
  severe: string;
  veryPoor: string;
  poor: string;
  moderate: string;
  satisfactory: string;
  good: string;
  systemConfig: string;
  engineOnline: string;
  generateReport: string;
  exportPdf: string;
  disclaimerText: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'DELHI-NCR AIR QUALITY',
    appSubtitle: 'INTEGRATED AIRSHED DECISION SUPPORT SYSTEM',
    version: 'V2.4 SIH',
    airshedCommand: 'Airshed Command / Delhi-NCR',
    nodeSelect: 'Station Node:',
    currentAirshedStatus: 'Current Airshed Status',
    aiReasoningBtn: 'AI Reasoning (High Thinking)',
    smsEmailAlertsBtn: 'SMS & Email Alerts',
    systemAlertsDirectives: 'System Alerts & Directives',
    unresolved: 'UNRESOLVED',
    signIn: 'Sign In',
    signOut: 'Sign Out',
    liveIstTime: 'IST (Delhi)',

    pillarCommand: 'Live Airshed Command',
    pillarIntelligence: 'AI & Predictive Intelligence',
    pillarGovernance: 'Governance & Compliance',
    pillarCitizenSafety: 'Citizen & Public Safety',

    tabDashboard: 'Command Center',
    tabCompare: 'Multi-Station Compare',
    tabGisMap: 'GIS Airshed Map',
    tabSatellite: 'Satellite Stream (1s)',
    tabDataExplorer: 'Sensor Data Table',
    tabForecast: '24-72h Rate Predication',
    tabStubbleTrajectory: 'Stubble Smoke Plumes',
    tabSources: 'Pollution Sources',
    tabPolicySim: 'Policy Simulator',
    tabGrapAlerts: 'GRAP Action Center',
    tabFarmFires: 'Farm Fire Monitor',
    tabReports: 'Decision Support Dossier',
    tabCommunityReports: 'Citizen Incident Reports',
    tabMobileAlerts: 'SMS & Email Alerts',
    tabCommutePlanner: 'Commute & Exposure',
    tabIndoorSanctuary: 'Indoor Sanctuary CADR',
    tabInstitutionalHub: 'Schools & Workplaces',
    tabAudioBroadcast: 'Voice Audio Bulletin',
    tabPrecautions: 'Delhi Precautions Hub',

    demoModeBadge: 'SIH DEMO MODE',
    demoSimulationActive: 'SIMULATION ACTIVE — Not Official Sensor Telemetry',
    demoDisclaimer: 'Simulated scenario for evaluation & pitch demonstration purposes only.',
    resetToLive: 'Reset to Live CAAQMS',
    scenarioBaseline: 'Normal Baseline (Stage II/III)',
    scenarioStubbleInversion: 'Crisis: Stubble Spike + Thermal Inversion (Stage IV)',
    scenarioPolicyIntervention: 'Policy Action: Odd-Even + Construction Freeze',
    scenarioIndustrialSpike: 'Industrial Plume Surge (Ghaziabad/East Delhi)',
    selectScenario: 'Simulate Scenario:',

    aqiIndex: 'AQI INDEX',
    pm25Label: 'PM2.5 (µg/m³)',
    pm10Label: 'PM10 (µg/m³)',
    no2Label: 'NO2 (ppb)',
    windSpeedDir: 'WIND VECTOR',
    pblHeight: 'PBL INVERSION HEIGHT',
    grapEnforcement: 'GRAP STATUS',
    safeLimit: 'Safe Limit',
    whoLimitExceeded: 'WHO Guideline Exceeded',
    rateOfChange: 'Rate of Change',
    dominantSource: 'Dominant Source',

    compareTitle: 'MULTI-STATION COMPARISON MATRIX',
    compareSubtitle: 'Side-by-side differential analysis of CAAQMS ground monitoring nodes across Delhi-NCR',
    selectStation1: 'Primary Node (A)',
    selectStation2: 'Comparison Node (B)',
    selectStation3: 'Benchmark Node (C)',
    varianceDelta: 'Variance Delta',
    criticalStation: 'Most Critical Node',
    inversionRisk: 'Inversion Severity',
    pmRatio: 'PM2.5 / PM10 Ratio',

    live: 'LIVE',
    status: 'STATUS',
    critical: 'CRITICAL',
    severe: 'Severe',
    veryPoor: 'Very Poor',
    poor: 'Poor',
    moderate: 'Moderate',
    satisfactory: 'Satisfactory',
    good: 'Good',
    systemConfig: 'System Config',
    engineOnline: 'ENGINE ONLINE',
    generateReport: 'Generate AI Dossier',
    exportPdf: 'Print / Export Dossier',
    disclaimerText: 'Academic / Decision-support research dashboard. Not an official statutory body endorsement.',
  },

  hi: {
    appTitle: 'दिल्ली-एनसीआर वायु गुणवत्ता',
    appSubtitle: 'एकीकृत वायुक्षेत्र निर्णय समर्थन प्रणाली',
    version: 'V2.4 SIH',
    airshedCommand: 'वायुक्षेत्र कमान / दिल्ली-एनसीआर',
    nodeSelect: 'निगरानी केंद्र:',
    currentAirshedStatus: 'वर्तमान वायु गुणवत्ता स्थिति',
    aiReasoningBtn: 'एआई गहन विश्लेषण (High Thinking)',
    smsEmailAlertsBtn: 'एसएमएस एवं ईमेल अलर्ट',
    systemAlertsDirectives: 'प्रणाली चेतावनियां एवं निर्देश',
    unresolved: 'लंबित',
    signIn: 'साइन इन',
    signOut: 'साइन आउट',
    liveIstTime: 'भारतीय समय (दिल्ली)',

    pillarCommand: 'लाइव वायुक्षेत्र कमान',
    pillarIntelligence: 'एआई एवं पूर्वानुमान विश्लेषण',
    pillarGovernance: 'प्रशासन एवं ग्रैप अनुपालन',
    pillarCitizenSafety: 'नागरिक एवं जन सुरक्षा',

    tabDashboard: 'कमांड सेंटर (मुख्य डैशबोर्ड)',
    tabCompare: 'बहु-स्टेशन तुलनात्मक विश्लेषण',
    tabGisMap: 'जीआईएस वायुक्षेत्र मानचित्र',
    tabSatellite: 'सैटेलाइट लाइव स्ट्रीम (1s)',
    tabDataExplorer: 'सेंसर डेटा तालिका',
    tabForecast: '24-72 घंटे प्रदूषण दर पूर्वानुमान',
    tabStubbleTrajectory: 'पराली धुआं प्रक्षेपवक्र',
    tabSources: 'प्रदूषण स्रोत विश्लेषण',
    tabPolicySim: 'नीति प्रभाव सिम्युलेटर',
    tabGrapAlerts: 'ग्रैप (GRAP) कार्य केंद्र',
    tabFarmFires: 'कृषि अग्नि (पराली) ट्रैकर',
    tabReports: 'निर्णय समर्थन विस्तृत रिपोर्ट',
    tabCommunityReports: 'नागरिक घटना रिपोर्टिंग',
    tabMobileAlerts: 'आपातकालीन मोबाइल अलर्ट',
    tabCommutePlanner: 'यात्रा एवं जोखिम योजना',
    tabIndoorSanctuary: 'घर के भीतर शुद्ध वायु CADR',
    tabInstitutionalHub: 'विद्यालय एवं कार्यस्थल दिशानिर्देश',
    tabAudioBroadcast: 'रेडियो वॉयस बुलेटिन',
    tabPrecautions: 'दिल्ली स्वास्थ्य सावधानी केंद्र',

    demoModeBadge: 'एसआईएच डेमो सिमुलेशन मोड',
    demoSimulationActive: 'सिमुलेशन सक्रिय — वास्तविक सेंसर डेटा नहीं है',
    demoDisclaimer: 'यह केवल मूल्यांकन एवं प्रस्तुति प्रदर्शन हेतु तैयार किया गया सिमुलेशन है।',
    resetToLive: 'वास्तविक लाइव डेटा पर लौटें',
    scenarioBaseline: 'सामान्य स्थिति (स्टेज II/III)',
    scenarioStubbleInversion: 'आपातकालीन संकट: पराली धुआं + शीतकालीन इनवर्जन (स्टेज IV)',
    scenarioPolicyIntervention: 'नीतिगत कार्रवाई: सम-विषम + निर्माण कार्य रोक',
    scenarioIndustrialSpike: 'औद्योगिक गैस उत्सर्जन में तीव्र वृद्धि',
    selectScenario: 'परिदृश्य चुनें:',

    aqiIndex: 'एक्यूआई सूचकांक',
    pm25Label: 'पीएम 2.5 (µg/m³)',
    pm10Label: 'पीएम 10 (µg/m³)',
    no2Label: 'नाइट्रोजन डाइऑक्साइड (ppb)',
    windSpeedDir: 'पवन गति एवं दिशा',
    pblHeight: 'इनवर्जन वायु परत ऊंचाई',
    grapEnforcement: 'ग्रैप (GRAP) चरण',
    safeLimit: 'सुरक्षित सीमा',
    whoLimitExceeded: 'WHO सीमा से अधिक',
    rateOfChange: 'परिवर्तन दर',
    dominantSource: 'प्रमुख प्रदूषण स्रोत',

    compareTitle: 'बहु-स्टेशन तुलनात्मक मैट्रिक्स',
    compareSubtitle: 'दिल्ली-एनसीआर के विभिन्न सीएक्यूएमएस निगरानी स्टेशनों का प्रत्यक्ष तुलनात्मक विश्लेषण',
    selectStation1: 'प्राथमिक स्टेशन (A)',
    selectStation2: 'तुलना स्टेशन (B)',
    selectStation3: 'मानक स्टेशन (C)',
    varianceDelta: 'अंतर (डेल्टा)',
    criticalStation: 'सर्वाधिक गंभीर स्टेशन',
    inversionRisk: 'इनवर्जन जोखिम',
    pmRatio: 'पीएम 2.5 / पीएम 10 अनुपात',

    live: 'लाइव',
    status: 'स्थिति',
    critical: 'अति गंभीर',
    severe: 'गंभीर (Severe)',
    veryPoor: 'बहुत खराब (Very Poor)',
    poor: 'खराब (Poor)',
    moderate: 'मध्यम (Moderate)',
    satisfactory: 'संतोषजनक',
    good: 'अच्छा',
    systemConfig: 'सिस्टम कॉन्फ़िगरेशन',
    engineOnline: 'इंजन सक्रिय',
    generateReport: 'एआई रिपोर्ट तैयार करें',
    exportPdf: 'प्रिंट / पीडीएफ निर्यात',
    disclaimerText: 'शैक्षणिक एवं निर्णय समर्थन अनुसंधान डैशबोर्ड। आधिकारिक वैधानिक निकाय द्वारा समर्थित नहीं।',
  },
};
