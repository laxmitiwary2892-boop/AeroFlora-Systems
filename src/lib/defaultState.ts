import { WATER_QUALITY_PRESETS } from './waterQualityAnalysis';
import type {
  ActivityLogItem,
  FarmerProfile,
  FarmPlot,
  FinancialConfig,
  SavedScenario,
  SimulatorConfig,
  TowerDevice,
  UserRole,
  WaterQualityInputs,
} from '../types/aeroflora';

export interface AeroFloraAppState {
  activeRole: UserRole;
  farmerProfile: FarmerProfile;
  plots: FarmPlot[];
  simulatorConfig: SimulatorConfig;
  waterQuality: WaterQualityInputs;
  financialConfig: FinancialConfig;
  savedScenarios: SavedScenario[];
  activityLogs: ActivityLogItem[];
  waterTokensLitres: number;
  towers: TowerDevice[];
}

export const STORAGE_KEY = 'aeroflora_mk4_state_v1';

export function createDefaultState(): AeroFloraAppState {
  return {
    activeRole: 'farmer',
    farmerProfile: {
      fullName: 'Rameshbhai Patel',
      mobile: '+91 98250 41120',
      email: '',
      language: 'en',
      state: 'Gujarat',
      district: 'Banaskantha',
      blockTehsil: 'Deesa',
      village: 'Bhildi',
      gpsEnabled: true,
      latitude: 24.2586,
      longitude: 72.1906,
    },
    plots: [
      {
        id: 'plot-1',
        name: 'North Bhagwa Orchard Block A',
        areaAcres: 2.5,
        cropId: 'pomegranate',
        cropVariety: 'Bhagwa',
        growthStage: 'mid_season',
        soilType: 'Sandy Loam',
        irrigationMethod: 'drip',
        waterSource: 'private_tanker',
        monthlyWaterSpendInr: 12000,
        storageTankCapacityL: 15000,
        dailyWaterAvailabilityL: 2800,
        hasLabWaterReport: true,
      },
      {
        id: 'plot-2',
        name: 'East Groundnut & Fodder Strip',
        areaAcres: 1.5,
        cropId: 'groundnut',
        cropVariety: 'GG-20',
        growthStage: 'development',
        soilType: 'Alluvial Soil',
        irrigationMethod: 'drip',
        waterSource: 'deep_borewell',
        monthlyWaterSpendInr: 4500,
        storageTankCapacityL: 5000,
        dailyWaterAvailabilityL: 1400,
        hasLabWaterReport: false,
      },
    ],
    simulatorConfig: {
      sorbentId: 'MOF-801',
      sorbentMassKg: 320,
      adsorptionCapacityLPerKg: 0.35,
      ambientRhPercent: 24,
      ambientTempC: 41.2,
      solarIrradianceKwhM2: 6.4,
      desorptionCoreTempC: 88,
      condenserEfficiencyPercent: 91,
      towerCount: 3,
      validationTargetLPerDay: 450,
    },
    waterQuality: {
      presetName: WATER_QUALITY_PRESETS[0].presetName,
      caMgL: WATER_QUALITY_PRESETS[0].caMgL,
      mgMgL: WATER_QUALITY_PRESETS[0].mgMgL,
      naMgL: WATER_QUALITY_PRESETS[0].naMgL,
      kMgL: WATER_QUALITY_PRESETS[0].kMgL,
      clMgL: WATER_QUALITY_PRESETS[0].clMgL,
      hco3MgL: WATER_QUALITY_PRESETS[0].hco3MgL,
      boronMgL: WATER_QUALITY_PRESETS[0].boronMgL,
      ph: WATER_QUALITY_PRESETS[0].ph,
    },
    financialConfig: {
      acquisitionModel: 'direct_purchase',
      subsidyPercent: 30,
      towerCount: 3,
      tankersReplacedPerMonth: 8,
      costPer5kLTankerInr: 1650,
      avoidedDieselPerMonthInr: 2400,
    },
    savedScenarios: [
      {
        id: 'scen-1',
        name: 'Banaskantha 3-Tower Pomegranate Baseline',
        createdAt: '2026-11-15',
        district: 'Banaskantha',
        state: 'Gujarat',
        towerCount: 3,
        sorbentId: 'MOF-801',
        dailyHarvestL: 1419,
        paybackMonths: 27,
        netAnnualSavingsInr: 177600,
      },
      {
        id: 'scen-2',
        name: 'Barmer Hyper-Arid 5-Tower Independence',
        createdAt: '2026-11-12',
        district: 'Barmer',
        state: 'Rajasthan',
        towerCount: 5,
        sorbentId: 'MOF-801',
        dailyHarvestL: 2285,
        paybackMonths: 29,
        netAnnualSavingsInr: 266000,
      },
    ],
    activityLogs: [
      {
        id: 'log-1',
        timestamp: '06:15 AM',
        category: 'equipment',
        message: 'AF-MK4-RJ-001 completed nocturnal MOF-801 sorption cycle (94% bed saturation).',
      },
      {
        id: 'log-2',
        timestamp: '10:30 AM',
        category: 'simulation',
        message: 'Banaskantha Zaid climate profile synced to Engineering Simulator (24% RH, 41.2°C).',
      },
      {
        id: 'log-3',
        timestamp: '12:45 PM',
        category: 'fpo',
        message: 'Banaskantha FPO pooled array logged 4,800 L community water token reserve.',
      },
    ],
    waterTokensLitres: 4800,
    towers: [
      {
        id: 'tower-1',
        serial: 'AF-MK4-RJ-001',
        locationLabel: 'Deesa Block A · North Orchard',
        district: 'Banaskantha',
        state: 'Gujarat',
        status: 'nominal',
        dailyYieldL: 478,
        coreTempC: 89.4,
        internalRhPercent: 78,
        condenserTempC: 24.6,
        lifetimeLitres: 84620,
        esp32Online: true,
        rssiDbm: -64,
        lastSync: '2 mins ago',
        maintenance: {
          glazingWipeDaysLeft: 6,
          mineralCartridgeDaysLeft: 214,
          damperSealDaysLeft: 92,
        },
      },
      {
        id: 'tower-2',
        serial: 'AF-MK4-RJ-002',
        locationLabel: 'Chohtan Field Station · West Dune',
        district: 'Barmer',
        state: 'Rajasthan',
        status: 'desorbing',
        dailyYieldL: 459,
        coreTempC: 92.1,
        internalRhPercent: 71,
        condenserTempC: 26.1,
        lifetimeLitres: 69140,
        esp32Online: true,
        rssiDbm: -71,
        lastSync: '4 mins ago',
        maintenance: {
          glazingWipeDaysLeft: 2,
          mineralCartridgeDaysLeft: 168,
          damperSealDaysLeft: 44,
        },
      },
    ],
  };
}

export function loadPersistedState(): AeroFloraAppState {
  const defaults = createDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AeroFloraAppState>;
    return {
      ...defaults,
      ...parsed,
      farmerProfile: { ...defaults.farmerProfile, ...(parsed.farmerProfile || {}) },
      simulatorConfig: { ...defaults.simulatorConfig, ...(parsed.simulatorConfig || {}) },
      waterQuality: { ...defaults.waterQuality, ...(parsed.waterQuality || {}) },
      financialConfig: { ...defaults.financialConfig, ...(parsed.financialConfig || {}) },
      plots: Array.isArray(parsed.plots) && parsed.plots.length > 0 ? parsed.plots : defaults.plots,
      savedScenarios: Array.isArray(parsed.savedScenarios) ? parsed.savedScenarios : defaults.savedScenarios,
      activityLogs: Array.isArray(parsed.activityLogs) ? parsed.activityLogs : defaults.activityLogs,
      towers: Array.isArray(parsed.towers) && parsed.towers.length > 0 ? parsed.towers : defaults.towers,
    };
  } catch {
    return defaults;
  }
}

export function savePersistedState(state: AeroFloraAppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors
  }
}
