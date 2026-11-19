import type { GrowthStageKey, IrrigationMethod } from '../types/aeroflora';

export interface CropStageSpec {
  kc: number;
  durationDays: number;
  label: string;
}

export interface IndianCropSpec {
  id: string;
  name: string;
  hindiName: string;
  scientificName: string;
  varietyExample: string;
  criticalWaterStressStage: string;
  salinitySensitivity: 'Sensitive' | 'Moderately Sensitive' | 'Moderately Tolerant' | 'Tolerant';
  maxTdsPpm: number;
  maxBoronMgL: number;
  stages: Record<GrowthStageKey, CropStageSpec>;
}

export const IRRIGATION_EFFICIENCY: Record<IrrigationMethod, { label: string; efficiency: number }> = {
  drip: { label: 'Sub-Surface / Inline Drip', efficiency: 0.90 },
  micro_jet: { label: 'Micro-Jet / Bubbler', efficiency: 0.82 },
  sprinkler: { label: 'Overhead Sprinkler', efficiency: 0.75 },
  flood_furrow: { label: 'Traditional Flood / Furrow', efficiency: 0.50 },
};

export const INDIAN_CROPS: IndianCropSpec[] = [
  {
    id: 'pomegranate',
    name: 'Pomegranate',
    hindiName: 'अनार (भगवा)',
    scientificName: 'Punica granatum',
    varietyExample: 'Bhagwa / Arakta',
    criticalWaterStressStage: 'Flowering & Fruit Set (Ambe / Mrig Bahar)',
    salinitySensitivity: 'Moderately Sensitive',
    maxTdsPpm: 950,
    maxBoronMgL: 1.0,
    stages: {
      initial: { kc: 0.45, durationDays: 30, label: 'Bahar Initiation & Bud Break' },
      development: { kc: 0.72, durationDays: 45, label: 'Flowering & Canopy Flush' },
      mid_season: { kc: 0.95, durationDays: 75, label: 'Fruit Sizing & Aril Fill' },
      late_season: { kc: 0.70, durationDays: 35, label: 'Ripening & Sugar Accumulation' },
    },
  },
  {
    id: 'bt_cotton',
    name: 'Bt Cotton',
    hindiName: 'बीटी कपास',
    scientificName: 'Gossypium hirsutum',
    varietyExample: 'Long Staple (Bollgard-II)',
    criticalWaterStressStage: 'Square Formation & Boll Development',
    salinitySensitivity: 'Tolerant',
    maxTdsPpm: 1800,
    maxBoronMgL: 2.0,
    stages: {
      initial: { kc: 0.35, durationDays: 30, label: 'Emergence & Seedling' },
      development: { kc: 0.75, durationDays: 45, label: 'Vegetative & Squaring' },
      mid_season: { kc: 1.15, durationDays: 55, label: 'Peak Flowering & Boll Fill' },
      late_season: { kc: 0.65, durationDays: 40, label: 'Boll Opening & Harvest' },
    },
  },
  {
    id: 'wheat',
    name: 'Wheat',
    hindiName: 'गेहूँ (शरबती)',
    scientificName: 'Triticum aestivum',
    varietyExample: 'Rabi / Sharbati / HD-2967',
    criticalWaterStressStage: 'Crown Root Initiation (CRI, 21 DAS) & Milking',
    salinitySensitivity: 'Moderately Tolerant',
    maxTdsPpm: 1400,
    maxBoronMgL: 1.5,
    stages: {
      initial: { kc: 0.35, durationDays: 22, label: 'Germination & CRI Stage' },
      development: { kc: 0.78, durationDays: 35, label: 'Tillering & Jointing' },
      mid_season: { kc: 1.15, durationDays: 45, label: 'Flowering & Grain Filling' },
      late_season: { kc: 0.45, durationDays: 28, label: 'Dough & Physiological Maturity' },
    },
  },
  {
    id: 'grapes',
    name: 'Table & Export Grapes',
    hindiName: 'अंगूर (थॉमसन सीडलेस)',
    scientificName: 'Vitis vinifera',
    varietyExample: 'Thomson Seedless / Sharad',
    criticalWaterStressStage: 'Berry Set & Veraison Sizing',
    salinitySensitivity: 'Sensitive',
    maxTdsPpm: 650,
    maxBoronMgL: 0.5,
    stages: {
      initial: { kc: 0.35, durationDays: 25, label: 'October Pruning & Shoot Break' },
      development: { kc: 0.65, durationDays: 40, label: 'Pre-Bloom & Berry Set' },
      mid_season: { kc: 0.85, durationDays: 60, label: 'Berry Sizing & Veraison' },
      late_season: { kc: 0.55, durationDays: 25, label: 'Brix Accumulation & Harvest' },
    },
  },
  {
    id: 'citrus',
    name: 'Sweet Orange / Mosambi & Kinnow',
    hindiName: 'मौसंबी / किन्नू',
    scientificName: 'Citrus sinensis',
    varietyExample: 'Nucellar Mosambi / Kinnow Mandarin',
    criticalWaterStressStage: 'Fruit Set & Marble-Stage Drop Prevention',
    salinitySensitivity: 'Sensitive',
    maxTdsPpm: 700,
    maxBoronMgL: 0.5,
    stages: {
      initial: { kc: 0.55, durationDays: 45, label: 'Spring Flush & Blossom' },
      development: { kc: 0.70, durationDays: 75, label: 'Fruit Set & Cell Division' },
      mid_season: { kc: 0.80, durationDays: 120, label: 'Juice Sac Expansion' },
      late_season: { kc: 0.65, durationDays: 60, label: 'Color Break & Picking' },
    },
  },
  {
    id: 'groundnut',
    name: 'Groundnut / Peanut',
    hindiName: 'मूंगफली',
    scientificName: 'Arachis hypogaea',
    varietyExample: 'GG-20 / Kadiri-6',
    criticalWaterStressStage: 'Pegging & Pod Formation (40–75 DAS)',
    salinitySensitivity: 'Moderately Sensitive',
    maxTdsPpm: 900,
    maxBoronMgL: 0.8,
    stages: {
      initial: { kc: 0.40, durationDays: 25, label: 'Emergence & Branching' },
      development: { kc: 0.78, durationDays: 35, label: 'Flowering & Pegging' },
      mid_season: { kc: 1.08, durationDays: 40, label: 'Pod Development & Seed Fill' },
      late_season: { kc: 0.60, durationDays: 20, label: 'Pod Maturation' },
    },
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane',
    hindiName: 'गन्ना',
    scientificName: 'Saccharum officinarum',
    varietyExample: 'Co-86032 / Co-0238',
    criticalWaterStressStage: 'Formative & Grand Growth Phase',
    salinitySensitivity: 'Moderately Sensitive',
    maxTdsPpm: 1100,
    maxBoronMgL: 1.2,
    stages: {
      initial: { kc: 0.45, durationDays: 35, label: 'Germination & Establishment' },
      development: { kc: 0.85, durationDays: 70, label: 'Tillering & Formative' },
      mid_season: { kc: 1.25, durationDays: 160, label: 'Grand Growth & Cane Elongation' },
      late_season: { kc: 0.75, durationDays: 65, label: 'Sucrose Ripening' },
    },
  },
  {
    id: 'paddy',
    name: 'Paddy / Basmati Rice',
    hindiName: 'धान / बासमती',
    scientificName: 'Oryza sativa',
    varietyExample: 'Pusa Basmati 1121 / DSR',
    criticalWaterStressStage: 'Panicle Initiation & Booting',
    salinitySensitivity: 'Moderately Sensitive',
    maxTdsPpm: 1050,
    maxBoronMgL: 1.5,
    stages: {
      initial: { kc: 1.05, durationDays: 25, label: 'Transplanting / DSR Emergence' },
      development: { kc: 1.15, durationDays: 35, label: 'Active Tillering' },
      mid_season: { kc: 1.20, durationDays: 45, label: 'Panicle & Anthesis' },
      late_season: { kc: 0.90, durationDays: 25, label: 'Grain Hardening' },
    },
  },
  {
    id: 'maize',
    name: 'Maize / Corn',
    hindiName: 'मक्का',
    scientificName: 'Zea mays',
    varietyExample: 'Hybrid Kharif / Sweet Corn',
    criticalWaterStressStage: 'Tasseling & Silking Window',
    salinitySensitivity: 'Moderately Sensitive',
    maxTdsPpm: 1000,
    maxBoronMgL: 1.0,
    stages: {
      initial: { kc: 0.35, durationDays: 20, label: 'Seedling Emergence' },
      development: { kc: 0.78, durationDays: 35, label: 'Knee-High Vegetative' },
      mid_season: { kc: 1.20, durationDays: 40, label: 'Tasseling, Silking & Cob Fill' },
      late_season: { kc: 0.60, durationDays: 25, label: 'Dent & Dry-Down' },
    },
  },
  {
    id: 'bajra',
    name: 'Pearl Millet / Bajra',
    hindiName: 'बाजरा',
    scientificName: 'Pennisetum glaucum',
    varietyExample: 'HHB-67 Improved / GHB-558',
    criticalWaterStressStage: 'Booting & Earhead Emergence',
    salinitySensitivity: 'Tolerant',
    maxTdsPpm: 1900,
    maxBoronMgL: 2.0,
    stages: {
      initial: { kc: 0.30, durationDays: 15, label: 'Establishment' },
      development: { kc: 0.70, durationDays: 25, label: 'Tillering' },
      mid_season: { kc: 1.00, durationDays: 30, label: 'Earhead & Milky Grain' },
      late_season: { kc: 0.45, durationDays: 18, label: 'Harvest Maturity' },
    },
  },
  {
    id: 'mango',
    name: 'Mango',
    hindiName: 'आम (अल्फांसो / केसर)',
    scientificName: 'Mangifera indica',
    varietyExample: 'Alphonso / Kesar / Dasheri',
    criticalWaterStressStage: 'Marble to Egg-Size Fruit Retention',
    salinitySensitivity: 'Sensitive',
    maxTdsPpm: 750,
    maxBoronMgL: 0.7,
    stages: {
      initial: { kc: 0.50, durationDays: 40, label: 'Panicle Emergence' },
      development: { kc: 0.75, durationDays: 55, label: 'Fruit Set & Pea Stage' },
      mid_season: { kc: 0.90, durationDays: 65, label: 'Stone Hardening & Pulp Fill' },
      late_season: { kc: 0.65, durationDays: 35, label: 'Maturity & Harvest' },
    },
  },
  {
    id: 'guava',
    name: 'Guava',
    hindiName: 'अमरूद (इलाहाबादी सफेदा)',
    scientificName: 'Psidium guajava',
    varietyExample: 'Allahabad Safeda / VNR Bihi',
    criticalWaterStressStage: 'Mrig Bahar Fruit Expansion',
    salinitySensitivity: 'Moderately Tolerant',
    maxTdsPpm: 1200,
    maxBoronMgL: 1.2,
    stages: {
      initial: { kc: 0.50, durationDays: 30, label: 'Post-Pruning Flush' },
      development: { kc: 0.72, durationDays: 45, label: 'Bloom & Fruit Set' },
      mid_season: { kc: 0.90, durationDays: 55, label: 'Rapid Fruit Swell' },
      late_season: { kc: 0.70, durationDays: 30, label: 'Color Turn & Picking' },
    },
  },
  {
    id: 'coconut',
    name: 'Coconut Palm',
    hindiName: 'नारियल',
    scientificName: 'Cocos nucifera',
    varietyExample: 'West Coast Tall / DxT Hybrid',
    criticalWaterStressStage: 'Year-Round Button Nut Retention',
    salinitySensitivity: 'Tolerant',
    maxTdsPpm: 2000,
    maxBoronMgL: 2.0,
    stages: {
      initial: { kc: 0.75, durationDays: 90, label: 'Post-Monsoon Recovery' },
      development: { kc: 0.85, durationDays: 90, label: 'Winter Spadix Growth' },
      mid_season: { kc: 0.95, durationDays: 95, label: 'Peak Summer Nut Fill' },
      late_season: { kc: 0.85, durationDays: 90, label: 'Monsoon Transition' },
    },
  },
  {
    id: 'vegetables',
    name: 'High-Value Vegetables',
    hindiName: 'सब्जियाँ (टमाटर / मिर्च)',
    scientificName: 'Solanum lycopersicum / Capsicum',
    varietyExample: 'Tomato / Chilli / Capsicum',
    criticalWaterStressStage: 'Blossom & Fruit Set (Blossom-End Rot Prevention)',
    salinitySensitivity: 'Moderately Sensitive',
    maxTdsPpm: 850,
    maxBoronMgL: 0.8,
    stages: {
      initial: { kc: 0.55, durationDays: 25, label: 'Transplant Establishment' },
      development: { kc: 0.82, durationDays: 35, label: 'Vegetative & First Truss' },
      mid_season: { kc: 1.15, durationDays: 45, label: 'Peak Fruit Load' },
      late_season: { kc: 0.80, durationDays: 30, label: 'Multiple Pickings' },
    },
  },
  {
    id: 'medicinal',
    name: 'Medicinal Plants',
    hindiName: 'औषधीय पौधे (अश्वगंधा / एलोवेरा)',
    scientificName: 'Withania somnifera / Aloe barbadensis',
    varietyExample: 'Ashwagandha (JA-20) / Aloe Vera',
    criticalWaterStressStage: 'Root Establishment & Gel Turgor Window',
    salinitySensitivity: 'Moderately Tolerant',
    maxTdsPpm: 1500,
    maxBoronMgL: 1.5,
    stages: {
      initial: { kc: 0.35, durationDays: 25, label: 'Rooting & Canopy Start' },
      development: { kc: 0.55, durationDays: 40, label: 'Foliage Expansion' },
      mid_season: { kc: 0.70, durationDays: 55, label: 'Alkaloid / Gel Accumulation' },
      late_season: { kc: 0.40, durationDays: 30, label: 'Pre-Harvest Drying' },
    },
  },
];

export interface CropWaterCalculation {
  crop: IndianCropSpec;
  kc: number;
  etcMmPerDay: number;
  netCropDemandLPerDay: number;
  grossIrrigationRequiredLPerDay: number;
  existingSupplyLPerDay: number;
  netMoistureDeficitLPerDay: number;
  status: 'Drought Deficit' | 'Balanced' | 'Surplus';
  tankersNeededPerMonth: number;
  towersNeededForZeroDeficit: number;
}

export function calculateFao56CropWater(params: {
  cropId: string;
  stage: GrowthStageKey;
  areaAcres: number;
  irrigationMethod: IrrigationMethod;
  et0MmPerDay: number;
  existingSupplyLPerDay: number;
  yieldPerTowerLPerDay?: number;
}): CropWaterCalculation {
  const crop = INDIAN_CROPS.find((c) => c.id === params.cropId) || INDIAN_CROPS[0];
  const stageSpec = crop.stages[params.stage];
  const kc = stageSpec.kc;
  const etcMmPerDay = Number((kc * params.et0MmPerDay).toFixed(2));

  // 1 Acre = 4046.86 m²; 1 mm over 1 m² = 1 Litre
  const areaM2 = params.areaAcres * 4046.86;
  const netCropDemandLPerDay = Math.round(etcMmPerDay * areaM2);
  const efficiency = IRRIGATION_EFFICIENCY[params.irrigationMethod].efficiency;
  const grossIrrigationRequiredLPerDay = Math.round(netCropDemandLPerDay / efficiency);

  const netMoistureDeficitLPerDay = grossIrrigationRequiredLPerDay - params.existingSupplyLPerDay;
  const status: CropWaterCalculation['status'] =
    netMoistureDeficitLPerDay > 100
      ? 'Drought Deficit'
      : netMoistureDeficitLPerDay < -100
      ? 'Surplus'
      : 'Balanced';

  const positiveDeficit = Math.max(0, netMoistureDeficitLPerDay);
  const tankersNeededPerMonth = Number(((positiveDeficit * 30) / 5000).toFixed(1));
  const perTower = Math.max(250, params.yieldPerTowerLPerDay || 465);
  const towersNeededForZeroDeficit = positiveDeficit > 0 ? Math.ceil(positiveDeficit / perTower) : 0;

  return {
    crop,
    kc,
    etcMmPerDay,
    netCropDemandLPerDay,
    grossIrrigationRequiredLPerDay,
    existingSupplyLPerDay: params.existingSupplyLPerDay,
    netMoistureDeficitLPerDay,
    status,
    tankersNeededPerMonth,
    towersNeededForZeroDeficit,
  };
}
