export type LanguageCode = 'en' | 'hi' | 'gu' | 'mr' | 'pa' | 'kn' | 'te' | 'ta' | 'bn';

export type UserRole = 'farmer' | 'agronomist' | 'technician' | 'fpo_admin' | 'platform_admin';

export type TabId =
  | 'overview'
  | 'farmer_farm'
  | 'water_intel'
  | 'simulator'
  | 'cycle'
  | 'crop_planner'
  | 'mineralization'
  | 'roi'
  | 'equipment'
  | 'community'
  | 'reports'
  | 'help'
  | 'admin'
  | 'results';

export type GrowthStageKey = 'initial' | 'development' | 'mid_season' | 'late_season';

export type IrrigationMethod = 'drip' | 'sprinkler' | 'flood_furrow' | 'micro_jet';

export type WaterSourceType =
  | 'deep_borewell'
  | 'private_tanker'
  | 'open_dug_well'
  | 'canal'
  | 'rainwater_pond';

export type SorbentMaterialId = 'MOF-801' | 'MIL-101(Cr)' | 'Aluminum Fumarate' | 'Zeolite 13X';

export interface UserProfileDoc {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  organization: string;
  state: string;
  district: string;
  authProvider: 'google' | 'password';
  emailVerified: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface FarmPlot {
  id: string;
  name: string;
  areaAcres: number;
  cropId: string;
  cropVariety: string;
  growthStage: GrowthStageKey;
  soilType: string;
  irrigationMethod: IrrigationMethod;
  waterSource: WaterSourceType;
  monthlyWaterSpendInr: number;
  storageTankCapacityL: number;
  dailyWaterAvailabilityL: number;
  hasLabWaterReport: boolean;
}

export interface FarmerProfile {
  fullName: string;
  mobile: string;
  email: string;
  language: LanguageCode;
  state: string;
  district: string;
  blockTehsil: string;
  village: string;
  gpsEnabled: boolean;
  latitude: number;
  longitude: number;
}

export interface SimulatorConfig {
  sorbentId: SorbentMaterialId;
  sorbentMassKg: number;
  adsorptionCapacityLPerKg: number;
  ambientRhPercent: number;
  ambientTempC: number;
  solarIrradianceKwhM2: number;
  desorptionCoreTempC: number;
  condenserEfficiencyPercent: number;
  towerCount: number;
  validationTargetLPerDay: number;
}

export interface WaterQualityInputs {
  presetName: string;
  caMgL: number;
  mgMgL: number;
  naMgL: number;
  kMgL: number;
  clMgL: number;
  hco3MgL: number;
  boronMgL: number;
  ph: number;
}

export type AcquisitionModel = 'direct_purchase' | 'water_as_a_service' | 'fpo_cooperative';
export type SubsidyTier = 0 | 30 | 50;

export interface FinancialConfig {
  acquisitionModel: AcquisitionModel;
  subsidyPercent: SubsidyTier;
  towerCount: number;
  tankersReplacedPerMonth: number;
  costPer5kLTankerInr: number;
  avoidedDieselPerMonthInr: number;
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  district: string;
  state: string;
  towerCount: number;
  sorbentId: SorbentMaterialId;
  dailyHarvestL: number;
  paybackMonths: number;
  netAnnualSavingsInr: number;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  category: 'simulation' | 'farm' | 'fpo' | 'equipment' | 'report' | 'system';
  message: string;
}

export interface TowerDevice {
  id: string;
  serial: string;
  locationLabel: string;
  district: string;
  state: string;
  status: 'nominal' | 'desorbing' | 'standby' | 'maintenance';
  dailyYieldL: number;
  coreTempC: number;
  internalRhPercent: number;
  condenserTempC: number;
  lifetimeLitres: number;
  esp32Online: boolean;
  rssiDbm: number;
  lastSync: string;
  maintenance: {
    glazingWipeDaysLeft: number;
    mineralCartridgeDaysLeft: number;
    damperSealDaysLeft: number;
  };
}
