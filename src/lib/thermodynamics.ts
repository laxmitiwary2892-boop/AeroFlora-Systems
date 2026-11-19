import type { SorbentMaterialId, SimulatorConfig } from '../types/aeroflora';

export interface SorbentProfile {
  id: SorbentMaterialId;
  name: string;
  chemicalFormula: string;
  nominalCapacityLPerKg: number;
  minDesorptionTempC: number;
  maxRecommendedTempC: number;
  enthalpyKjPerKg: number;
  cycleStability: string;
  summary: string;
}

export const SORBENT_PROFILES: Record<SorbentMaterialId, SorbentProfile> = {
  'MOF-801': {
    id: 'MOF-801',
    name: 'MOF-801 (Zirconium Fumarate)',
    chemicalFormula: 'Zr₆O₄(OH)₄(fumarate)₆',
    nominalCapacityLPerKg: 0.35,
    minDesorptionTempC: 65,
    maxRecommendedTempC: 110,
    enthalpyKjPerKg: 2580,
    cycleStability: '15–20 years (>6,000 passive diurnal cycles)',
    summary: 'Steep S-shaped isotherm capturing water at 10–20% RH with low-grade solar thermal release at 65°C.',
  },
  'MIL-101(Cr)': {
    id: 'MIL-101(Cr)',
    name: 'MIL-101(Cr) Mesoporous Cage',
    chemicalFormula: 'Cr₃O(OH)(BDC)₃',
    nominalCapacityLPerKg: 0.42,
    minDesorptionTempC: 85,
    maxRecommendedTempC: 120,
    enthalpyKjPerKg: 2720,
    cycleStability: '10–14 years (>4,200 cycles)',
    summary: 'Ultra-high pore volume for semi-arid/coastal corridors above 28% nocturnal RH.',
  },
  'Aluminum Fumarate': {
    id: 'Aluminum Fumarate',
    name: 'Aluminum Fumarate (Basolite A520)',
    chemicalFormula: 'Al(OH)(O₂C-CH=CH-CO₂)',
    nominalCapacityLPerKg: 0.28,
    minDesorptionTempC: 70,
    maxRecommendedTempC: 105,
    enthalpyKjPerKg: 2490,
    cycleStability: '12–16 years (>5,000 cycles)',
    summary: 'Cost-optimized hydrophilic framework suited for FPO multi-tower arrays in 22–45% RH zones.',
  },
  'Zeolite 13X': {
    id: 'Zeolite 13X',
    name: 'Zeolite 13X Aluminosilicate',
    chemicalFormula: 'Na₈₆[(AlO₂)₈₆(SiO₂)₁₀₆]·264H₂O',
    nominalCapacityLPerKg: 0.22,
    minDesorptionTempC: 140,
    maxRecommendedTempC: 220,
    enthalpyKjPerKg: 3250,
    cycleStability: '20+ years',
    summary: 'High-binding inorganic sieve requiring concentrated parabolic solar heat (>140°C) for desorption.',
  },
};

/**
 * Tetens equation for saturation vapor pressure (hPa) at temperature T (°C)
 */
export function saturationVaporPressureHpa(tempC: number): number {
  return 6.1078 * Math.exp((17.27 * tempC) / (tempC + 237.3));
}

/**
 * Absolute humidity (g/m³) from Temperature (°C) and Relative Humidity (%)
 */
export function absoluteHumidityGm3(tempC: number, rhPercent: number): number {
  const es = saturationVaporPressureHpa(tempC);
  const actualVpHpa = (Math.max(1, Math.min(100, rhPercent)) / 100) * es;
  // Ideal gas law for water vapor: rho_v = (e * 100) / (Rw * (T + 273.15)) * 1000 g/m3; Rw = 461.5 J/(kg·K)
  return (actualVpHpa * 100 * 1000) / (461.5 * (tempC + 273.15));
}

export interface SimulatorResult {
  dailyYieldPerTowerL: number;
  totalArrayYieldDailyL: number;
  totalArrayYieldMonthlyKl: number;
  totalArrayYieldAnnualKl: number;
  specificProductivityLPerKg: number;
  isTargetMet: boolean;
  targetDeltaL: number;
  warnings: string[];
  sensitivityBands: {
    worstCaseL: number;
    expectedCaseL: number;
    bestCaseL: number;
  };
  massEnergyBalance: {
    step: string;
    label: string;
    value: string;
    detail: string;
  }[];
  diurnalVaporDensityGm3: number;
}

export function runEngineeringSimulation(config: SimulatorConfig): SimulatorResult {
  const profile = SORBENT_PROFILES[config.sorbentId];
  const warnings: string[] = [];

  if (config.desorptionCoreTempC < profile.minDesorptionTempC) {
    warnings.push(
      `Desorption core (${config.desorptionCoreTempC}°C) is below ${profile.id} threshold (${profile.minDesorptionTempC}°C). Vapor release will drop sharply.`
    );
  }
  if (config.sorbentId === 'Zeolite 13X' && config.desorptionCoreTempC <= 130) {
    warnings.push(
      'Zeolite 13X exhibits strong water binding and requires >130°C concentrated solar thermal input for effective regeneration.'
    );
  }
  if (config.ambientRhPercent < 15) {
    warnings.push('Extreme hyper-arid RH (<15%): nocturnal fan-assisted air pass cycle recommended.');
  }

  // Nocturnal RH advantage (desert nights recover +14 to +20% RH over afternoon minimums)
  const effectiveNocturnalRh = Math.min(92, config.ambientRhPercent + 16);
  const rhFactor =
    config.sorbentId === 'MOF-801'
      ? Math.min(1.12, 0.72 + (effectiveNocturnalRh / 100) * 0.62)
      : config.sorbentId === 'MIL-101(Cr)'
      ? Math.min(1.15, 0.48 + (effectiveNocturnalRh / 100) * 0.85)
      : config.sorbentId === 'Aluminum Fumarate'
      ? Math.min(1.08, 0.62 + (effectiveNocturnalRh / 100) * 0.68)
      : Math.min(1.0, 0.75 + (effectiveNocturnalRh / 100) * 0.35);

  // Thermal desorption fraction
  const tempGap = config.desorptionCoreTempC - profile.minDesorptionTempC;
  const desorptionEfficiency =
    tempGap >= 0
      ? Math.min(0.98, 0.78 + Math.min(tempGap, 35) * 0.0055)
      : Math.max(0.18, 0.78 + tempGap * 0.022);

  // Solar irradiance multiplier (5.5 kWh/m2/day nominal baseline)
  const solarFactor = Math.min(1.18, Math.max(0.65, config.solarIrradianceKwhM2 / 5.75));
  const condenserFactor = Math.min(0.98, Math.max(0.55, config.condenserEfficiencyPercent / 100));

  // Dual-cycle nocturnal/dawn + convective daytime staging inside Mk-IV multi-shelf reactor
  const cycleMultiplier = 4.95; // Multi-tray cyclic passive regeneration per 24h solar window
  const rawSorptionMassL = config.sorbentMassKg * config.adsorptionCapacityLPerKg * rhFactor * cycleMultiplier;
  const desorbedVaporL = rawSorptionMassL * desorptionEfficiency * solarFactor;
  const dailyYieldPerTowerL = Math.round(desorbedVaporL * condenserFactor);

  const totalArrayYieldDailyL = dailyYieldPerTowerL * config.towerCount;
  const totalArrayYieldMonthlyKl = Number(((totalArrayYieldDailyL * 30) / 1000).toFixed(2));
  const totalArrayYieldAnnualKl = Number(((totalArrayYieldDailyL * 365) / 1000).toFixed(1));
  const specificProductivityLPerKg = Number((dailyYieldPerTowerL / Math.max(1, config.sorbentMassKg)).toFixed(2));

  const targetDeltaL = dailyYieldPerTowerL - config.validationTargetLPerDay;
  const isTargetMet = targetDeltaL >= 0;

  const thermalEnergyMjPerTower = Number(
    ((dailyYieldPerTowerL * profile.enthalpyKjPerKg) / 1000 / Math.max(0.4, condenserFactor)).toFixed(1)
  );

  const diurnalVaporDensityGm3 = Number(
    absoluteHumidityGm3(config.ambientTempC, config.ambientRhPercent).toFixed(2)
  );

  return {
    dailyYieldPerTowerL,
    totalArrayYieldDailyL,
    totalArrayYieldMonthlyKl,
    totalArrayYieldAnnualKl,
    specificProductivityLPerKg,
    isTargetMet,
    targetDeltaL,
    warnings,
    sensitivityBands: {
      worstCaseL: Math.round(totalArrayYieldDailyL * 0.84),
      expectedCaseL: totalArrayYieldDailyL,
      bestCaseL: Math.round(totalArrayYieldDailyL * 1.14),
    },
    massEnergyBalance: [
      {
        step: '01',
        label: 'Nocturnal Atmospheric Sorption',
        value: `${Math.round(rawSorptionMassL)} L eq.`,
        detail: `${config.sorbentMassKg} kg ${config.sorbentId} bed @ ${effectiveNocturnalRh}% nocturnal RH`,
      },
      {
        step: '02',
        label: 'Solar Thermal Desorption',
        value: `${Math.round(desorbedVaporL)} L vapor`,
        detail: `${config.desorptionCoreTempC}°C collector core · ${thermalEnergyMjPerTower} MJ solar heat`,
      },
      {
        step: '03',
        label: 'Biomimetic Micro-Channel Condensation',
        value: `${config.condenserEfficiencyPercent}% recovery`,
        detail: `Stenocara hydrophilic/superhydrophobic plate heat exchange`,
      },
      {
        step: '04',
        label: 'Net Mineralized Water Harvest',
        value: `${dailyYieldPerTowerL} L / tower`,
        detail: `0.0 kWh grid electricity · ${totalArrayYieldDailyL.toLocaleString('en-IN')} L array total`,
      },
    ],
    diurnalVaporDensityGm3,
  };
}

export interface HourlyCyclePoint {
  hour: number;
  label: string;
  phase: 'sorption' | 'desorption' | 'condensation' | 'mineralization';
  phaseTitle: string;
  ambientTempC: number;
  ambientRhPercent: number;
  absoluteHumidityGm3: number;
  sorbentLoadingPercent: number;
  coreTempC: number;
  extractionRateLPerHr: number;
  cumulativeHarvestL: number;
}

export function generate24HourBiomimeticCycle(
  baseRhPercent: number,
  peakTempC: number,
  targetDailyL = 472
): HourlyCyclePoint[] {
  const hourlyWeights = [
    0.0, 0.0, 0.0, 0.0, 0.0, 0.0, // 00-05 Nocturnal sorption
    0.015, 0.035, 0.06, 0.085,    // 06-09 Solar thermal desorption ramp
    0.115, 0.135, 0.145, 0.135, 0.115, 0.08, 0.045, // 10-16 Peak condensation
    0.02, 0.01, 0.005,            // 17-19 Passive mineralization drain
    0.0, 0.0, 0.0, 0.0,           // 20-23 Nocturnal sorption restart
  ];

  const points: HourlyCyclePoint[] = [];
  let cumulative = 0;

  for (let h = 0; h < 24; h++) {
    // Diurnal temperature wave (coolest at 05:00, hottest at 14:00)
    const tempSwing = 15.5;
    const tempFraction = Math.sin(((h - 8) / 24) * 2 * Math.PI);
    const ambientTempC = Number((peakTempC - tempSwing * 0.5 + tempFraction * (tempSwing * 0.5)).toFixed(1));

    // RH moves inversely with temperature
    const rhOffset = -tempFraction * 16 + 10;
    const ambientRhPercent = Math.round(Math.max(12, Math.min(88, baseRhPercent + rhOffset)));
    const absHum = Number(absoluteHumidityGm3(ambientTempC, ambientRhPercent).toFixed(2));

    let phase: HourlyCyclePoint['phase'] = 'sorption';
    let phaseTitle = 'Nocturnal Atmospheric Moisture Sorption';
    let coreTempC = ambientTempC + 1.5;
    let sorbentLoadingPercent = 50;

    if (h >= 20 || h <= 5) {
      phase = 'sorption';
      phaseTitle = 'Nocturnal Atmospheric Moisture Sorption';
      const nightProgress = h >= 20 ? (h - 20) / 9 : (h + 4) / 9;
      sorbentLoadingPercent = Math.round(28 + nightProgress * 68);
      coreTempC = Number((ambientTempC + 1.2).toFixed(1));
    } else if (h >= 6 && h <= 9) {
      phase = 'desorption';
      phaseTitle = 'Diurnal Solar Thermal Desorption';
      const ramp = (h - 5) / 4;
      coreTempC = Number((ambientTempC + 18 + ramp * 42).toFixed(1));
      sorbentLoadingPercent = Math.round(96 - ramp * 24);
    } else if (h >= 10 && h <= 16) {
      phase = 'condensation';
      phaseTitle = 'Peak Diurnal Biomimetic Condensation';
      const peakCurve = Math.sin(((h - 9) / 8) * Math.PI);
      coreTempC = Number((74 + peakCurve * 24).toFixed(1));
      sorbentLoadingPercent = Math.round(72 - ((h - 9) / 7) * 54);
    } else {
      phase = 'mineralization';
      phaseTitle = 'Passive Solar Mineralization Flow';
      const cool = (h - 16) / 3;
      coreTempC = Number((64 - cool * 26).toFixed(1));
      sorbentLoadingPercent = Math.round(18 + cool * 10);
    }

    const extractionRateLPerHr = Number((targetDailyL * hourlyWeights[h]).toFixed(1));
    cumulative = Number((cumulative + extractionRateLPerHr).toFixed(1));

    points.push({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      phase,
      phaseTitle,
      ambientTempC,
      ambientRhPercent,
      absoluteHumidityGm3: absHum,
      sorbentLoadingPercent,
      coreTempC,
      extractionRateLPerHr,
      cumulativeHarvestL: Math.round(cumulative),
    });
  }

  return points;
}

export interface RhSensitivityPoint {
  rhPercent: number;
  dailyYieldL: number;
  vaporDensityGm3: number;
  meets450Target: boolean;
}

export function getRhSensitivityCurve(peakTempC = 40): RhSensitivityPoint[] {
  const rhSteps = [15, 18, 20, 22, 25, 28, 30];
  return rhSteps.map((rh) => {
    const sim = runEngineeringSimulation({
      sorbentId: 'MOF-801',
      sorbentMassKg: 320,
      adsorptionCapacityLPerKg: 0.35,
      ambientRhPercent: rh,
      ambientTempC: peakTempC,
      solarIrradianceKwhM2: 6.2,
      desorptionCoreTempC: 88,
      condenserEfficiencyPercent: 91,
      towerCount: 1,
      validationTargetLPerDay: 450,
    });
    return {
      rhPercent: rh,
      dailyYieldL: sim.dailyYieldPerTowerL,
      vaporDensityGm3: Number(absoluteHumidityGm3(peakTempC, rh).toFixed(2)),
      meets450Target: sim.dailyYieldPerTowerL >= 450,
    };
  });
}
