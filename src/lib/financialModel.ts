import type { AcquisitionModel, FinancialConfig } from '../types/aeroflora';

export interface YearCashflowRow {
  year: number;
  label: string;
  capexOrLeaseInr: number;
  maintenanceInr: number;
  grossSavingsInr: number;
  netCashflowInr: number;
  cumulativeCashflowInr: number;
}

export interface FinancialAnalysisResult {
  grossCapexInr: number;
  subsidyAmountInr: number;
  netCapexInr: number;
  annualTankerSavingsInr: number;
  annualDieselSavingsInr: number;
  annualMaintenanceInr: number;
  netAnnualSavingsInr: number;
  paybackMonths: number;
  fiveYearNpvInr: number;
  irrPercent: number;
  fiveYearCumulativeNetInr: number;
  cashflows: YearCashflowRow[];
  modelSummary: string;
}

const TOWER_UNIT_PRICE_INR = 185000; // ₹1.85 Lakh per Mk-IV 450+ L/day autonomous tower
const ANNUAL_CARTRIDGE_OM_PER_TOWER_INR = 3200; // ₹3,200/yr basalt-calcite mineral bed & filter service

export function calculateFinancialROI(config: FinancialConfig): FinancialAnalysisResult {
  const modelFactor: Record<AcquisitionModel, number> = {
    direct_purchase: 1.0,
    fpo_cooperative: 0.90, // 10% FPO bulk procurement discount
    water_as_a_service: 0.20, // 20% refundable security deposit + annual lease fee
  };

  const grossCapexInr = Math.round(config.towerCount * TOWER_UNIT_PRICE_INR * modelFactor[config.acquisitionModel]);
  const subsidyApplicable = config.acquisitionModel !== 'water_as_a_service';
  const subsidyAmountInr = subsidyApplicable
    ? Math.round(grossCapexInr * (config.subsidyPercent / 100))
    : 0;
  const netCapexInr = grossCapexInr - subsidyAmountInr;

  const annualTankerSavingsInr = Math.round(config.tankersReplacedPerMonth * config.costPer5kLTankerInr * 12);
  const annualDieselSavingsInr = Math.round(config.avoidedDieselPerMonthInr * 12);
  const grossAnnualSavingsInr = annualTankerSavingsInr + annualDieselSavingsInr;

  const annualLeaseFeeInr =
    config.acquisitionModel === 'water_as_a_service' ? Math.round(config.towerCount * 24000) : 0;
  const annualMaintenanceInr =
    config.towerCount * ANNUAL_CARTRIDGE_OM_PER_TOWER_INR + annualLeaseFeeInr;

  const netAnnualSavingsInr = grossAnnualSavingsInr - annualMaintenanceInr;

  const paybackMonths =
    netAnnualSavingsInr > 0
      ? Math.max(1, Math.round((netCapexInr / netAnnualSavingsInr) * 12))
      : 999;

  const cashflows: YearCashflowRow[] = [];
  let cumulative = -netCapexInr;

  cashflows.push({
    year: 0,
    label: 'Year 0 (Deployment)',
    capexOrLeaseInr: -netCapexInr,
    maintenanceInr: 0,
    grossSavingsInr: 0,
    netCashflowInr: -netCapexInr,
    cumulativeCashflowInr: cumulative,
  });

  // 4% annual inflation on avoided water tanker & diesel costs
  const cfArray: number[] = [-netCapexInr];
  for (let yr = 1; yr <= 5; yr++) {
    const escalation = Math.pow(1.04, yr - 1);
    const yrSavings = Math.round(grossAnnualSavingsInr * escalation);
    const yrMaint = Math.round(annualMaintenanceInr * Math.pow(1.02, yr - 1));
    const yrNet = yrSavings - yrMaint;
    cumulative += yrNet;
    cfArray.push(yrNet);

    cashflows.push({
      year: yr,
      label: `Year ${yr}`,
      capexOrLeaseInr: 0,
      maintenanceInr: -yrMaint,
      grossSavingsInr: yrSavings,
      netCashflowInr: yrNet,
      cumulativeCashflowInr: cumulative,
    });
  }

  // 5-Year NPV @ 8% NABARD/Agri discount rate
  const discountRate = 0.08;
  const fiveYearNpvInr = Math.round(
    cfArray.reduce((acc, cf, t) => acc + cf / Math.pow(1 + discountRate, t), 0)
  );

  // Simple Newton-Raphson / bisection IRR solver
  let irrPercent = 0;
  if (netCapexInr > 0 && cumulative > 0) {
    let low = -0.5;
    let high = 3.0;
    for (let iter = 0; iter < 40; iter++) {
      const mid = (low + high) / 2;
      const npvAtMid = cfArray.reduce((acc, cf, t) => acc + cf / Math.pow(1 + mid, t), 0);
      if (npvAtMid > 0) low = mid;
      else high = mid;
    }
    irrPercent = Number((((low + high) / 2) * 100).toFixed(1));
  } else if (netCapexInr <= 0) {
    irrPercent = 100;
  }

  const modelSummary =
    config.acquisitionModel === 'direct_purchase'
      ? `Direct Farmer Ownership (${config.subsidyPercent}% PM-KUSUM Grant applied)`
      : config.acquisitionModel === 'fpo_cooperative'
      ? `FPO Pooled Shared Array (10% bulk discount + ${config.subsidyPercent}% subsidy)`
      : 'Solar Water-as-a-Service (20% refundable deposit + ₹2,000/tower/mo lease)';

  return {
    grossCapexInr,
    subsidyAmountInr,
    netCapexInr,
    annualTankerSavingsInr,
    annualDieselSavingsInr,
    annualMaintenanceInr,
    netAnnualSavingsInr,
    paybackMonths,
    fiveYearNpvInr,
    irrPercent,
    fiveYearCumulativeNetInr: cumulative,
    cashflows,
    modelSummary,
  };
}
