export type AquiferCategory = 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
export type SeasonKey = 'summer' | 'monsoon' | 'winter';

export interface SeasonClimateSnapshot {
  rhPercent: number;
  dayTempC: number;
  nightTempC: number;
  solarKwhM2: number;
}

export interface DistrictClimatology {
  state: string;
  district: string;
  agroClimaticZone: string;
  waterTableDepthM: number;
  aquiferCategory: AquiferCategory;
  monsoonRainfallMm: number;
  awhSuitability: 'Exceptional' | 'High' | 'Moderate-High' | 'Moderate';
  feasibilityNote: string;
  primaryCrops: string[];
  seasons: Record<SeasonKey, SeasonClimateSnapshot>;
}

export const ALL_INDIAN_STATES: string[] = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const DISTRICT_CLIMATOLOGY: DistrictClimatology[] = [
  // Rajasthan (4)
  {
    state: 'Rajasthan',
    district: 'Jodhpur',
    agroClimaticZone: 'Arid Western Plain (Zone Ic)',
    waterTableDepthM: 58.4,
    aquiferCategory: 'Over-Exploited',
    monsoonRainfallMm: 318,
    awhSuitability: 'Exceptional',
    feasibilityNote:
      'High diurnal thermal swing and 6.2+ kWh/m² solar irradiance enable deep MOF-801 desorption cycles even during 18% peak summer RH.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Pearl Millet (Bajra)', 'Cumin & Vegetables'],
    seasons: {
      summer: { rhPercent: 20, dayTempC: 42.5, nightTempC: 26.5, solarKwhM2: 6.6 },
      monsoon: { rhPercent: 61, dayTempC: 35.0, nightTempC: 25.5, solarKwhM2: 5.1 },
      winter: { rhPercent: 34, dayTempC: 26.5, nightTempC: 10.5, solarKwhM2: 5.4 },
    },
  },
  {
    state: 'Rajasthan',
    district: 'Barmer',
    agroClimaticZone: 'Hyper-Arid Partial Irrigated Western Plain',
    waterTableDepthM: 74.2,
    aquiferCategory: 'Over-Exploited',
    monsoonRainfallMm: 265,
    awhSuitability: 'Exceptional',
    feasibilityNote:
      'Severe groundwater salinity (TDS > 2,200 ppm) makes mineralized atmospheric water critical for high-value pomegranate orchards.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Pearl Millet (Bajra)', 'Guar & Aloe Vera'],
    seasons: {
      summer: { rhPercent: 18, dayTempC: 44.0, nightTempC: 27.0, solarKwhM2: 6.8 },
      monsoon: { rhPercent: 56, dayTempC: 36.2, nightTempC: 26.2, solarKwhM2: 5.3 },
      winter: { rhPercent: 31, dayTempC: 27.5, nightTempC: 11.0, solarKwhM2: 5.5 },
    },
  },
  {
    state: 'Rajasthan',
    district: 'Jaisalmer',
    agroClimaticZone: 'Hyper-Arid Thar Desert Zone',
    waterTableDepthM: 86.0,
    aquiferCategory: 'Critical',
    monsoonRainfallMm: 185,
    awhSuitability: 'High',
    feasibilityNote:
      'Nocturnal desert cooling raises night RH to 38–46%, fueling robust night sorption despite 15% afternoon relative humidity.',
    primaryCrops: ['Pearl Millet (Bajra)', 'Medicinal Plants (Ashwagandha)', 'Date Palm'],
    seasons: {
      summer: { rhPercent: 16, dayTempC: 44.8, nightTempC: 26.8, solarKwhM2: 6.9 },
      monsoon: { rhPercent: 52, dayTempC: 37.5, nightTempC: 26.5, solarKwhM2: 5.5 },
      winter: { rhPercent: 29, dayTempC: 25.8, nightTempC: 8.8, solarKwhM2: 5.6 },
    },
  },
  {
    state: 'Rajasthan',
    district: 'Bikaner',
    agroClimaticZone: 'Hyper-Arid Partially Irrigated Zone',
    waterTableDepthM: 64.5,
    aquiferCategory: 'Over-Exploited',
    monsoonRainfallMm: 278,
    awhSuitability: 'High',
    feasibilityNote:
      'Strong solar thermal availability supports dual-stage desorption for off-grid citrus and groundnut blocks.',
    primaryCrops: ['Groundnut / Peanut', 'Sweet Orange / Kinnow', 'Pearl Millet'],
    seasons: {
      summer: { rhPercent: 19, dayTempC: 43.2, nightTempC: 26.0, solarKwhM2: 6.5 },
      monsoon: { rhPercent: 58, dayTempC: 36.0, nightTempC: 26.0, solarKwhM2: 5.2 },
      winter: { rhPercent: 35, dayTempC: 24.5, nightTempC: 8.5, solarKwhM2: 5.1 },
    },
  },

  // Gujarat (3)
  {
    state: 'Gujarat',
    district: 'Banaskantha',
    agroClimaticZone: 'North Gujarat Arid / Semi-Arid Alluvial Zone',
    waterTableDepthM: 52.8,
    aquiferCategory: 'Over-Exploited',
    monsoonRainfallMm: 540,
    awhSuitability: 'Exceptional',
    feasibilityNote:
      'India’s flagship arid pomegranate hub; deep borewells exceed 250 m. AeroFlora arrays displace summer water tankers at 50% PM-KUSUM subsidy.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Groundnut / Peanut', 'Vegetables (Tomato/Chilli)'],
    seasons: {
      summer: { rhPercent: 24, dayTempC: 41.2, nightTempC: 25.5, solarKwhM2: 6.4 },
      monsoon: { rhPercent: 71, dayTempC: 33.4, nightTempC: 25.2, solarKwhM2: 4.8 },
      winter: { rhPercent: 38, dayTempC: 28.0, nightTempC: 12.2, solarKwhM2: 5.4 },
    },
  },
  {
    state: 'Gujarat',
    district: 'Kutch',
    agroClimaticZone: 'North-West Arid Coastal & Rann Fringe',
    waterTableDepthM: 46.0,
    aquiferCategory: 'Critical',
    monsoonRainfallMm: 355,
    awhSuitability: 'Exceptional',
    feasibilityNote:
      'Arabian Sea moisture advection keeps nocturnal RH elevated (48–62%) even in Zaid months, boosting sorbent saturation to >94%.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Mango (Kesar)', 'Bt Cotton'],
    seasons: {
      summer: { rhPercent: 29, dayTempC: 39.8, nightTempC: 25.8, solarKwhM2: 6.5 },
      monsoon: { rhPercent: 74, dayTempC: 32.8, nightTempC: 25.6, solarKwhM2: 4.9 },
      winter: { rhPercent: 42, dayTempC: 28.5, nightTempC: 13.0, solarKwhM2: 5.5 },
    },
  },
  {
    state: 'Gujarat',
    district: 'Rajkot',
    agroClimaticZone: 'North Saurashtra Semi-Arid Basalt Zone',
    waterTableDepthM: 34.5,
    aquiferCategory: 'Semi-Critical',
    monsoonRainfallMm: 615,
    awhSuitability: 'High',
    feasibilityNote:
      'Hard basaltic aquifers dry out by March; passive AWH secures flowering-stage moisture for cotton and groundnut.',
    primaryCrops: ['Bt Cotton', 'Groundnut / Peanut', 'Vegetables'],
    seasons: {
      summer: { rhPercent: 27, dayTempC: 40.5, nightTempC: 24.8, solarKwhM2: 6.3 },
      monsoon: { rhPercent: 75, dayTempC: 32.0, nightTempC: 24.6, solarKwhM2: 4.7 },
      winter: { rhPercent: 40, dayTempC: 29.0, nightTempC: 13.5, solarKwhM2: 5.4 },
    },
  },

  // Maharashtra (3)
  {
    state: 'Maharashtra',
    district: 'Solapur',
    agroClimaticZone: 'Scarcity Zone of Western Maharashtra',
    waterTableDepthM: 38.2,
    aquiferCategory: 'Critical',
    monsoonRainfallMm: 545,
    awhSuitability: 'Exceptional',
    feasibilityNote:
      'High-value pomegranate & export grape farms face ₹1,800–₹2,200/tanker summer stress and borewell Boron/EC spikes.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Table & Export Grapes', 'Sugarcane'],
    seasons: {
      summer: { rhPercent: 23, dayTempC: 40.8, nightTempC: 24.5, solarKwhM2: 6.2 },
      monsoon: { rhPercent: 72, dayTempC: 31.2, nightTempC: 22.8, solarKwhM2: 4.5 },
      winter: { rhPercent: 39, dayTempC: 30.2, nightTempC: 14.8, solarKwhM2: 5.3 },
    },
  },
  {
    state: 'Maharashtra',
    district: 'Ahmednagar',
    agroClimaticZone: 'Rain-Shadow Deccan Plateau',
    waterTableDepthM: 32.6,
    aquiferCategory: 'Semi-Critical',
    monsoonRainfallMm: 520,
    awhSuitability: 'High',
    feasibilityNote:
      'Ideal nocturnal humidity recovery over Deccan plateau supports consistent 455–485 L/day per tower.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Sweet Orange / Mosambi', 'Guava'],
    seasons: {
      summer: { rhPercent: 25, dayTempC: 39.6, nightTempC: 23.2, solarKwhM2: 6.1 },
      monsoon: { rhPercent: 74, dayTempC: 30.4, nightTempC: 22.0, solarKwhM2: 4.4 },
      winter: { rhPercent: 41, dayTempC: 29.4, nightTempC: 13.4, solarKwhM2: 5.3 },
    },
  },
  {
    state: 'Maharashtra',
    district: 'Nashik',
    agroClimaticZone: 'Western Maharashtra Dry & Transition Zone',
    waterTableDepthM: 28.4,
    aquiferCategory: 'Semi-Critical',
    monsoonRainfallMm: 690,
    awhSuitability: 'High',
    feasibilityNote:
      'Export table grape vineyards require low-TDS (<250 ppm) berry-sizing irrigation free from borewell chloride toxicity.',
    primaryCrops: ['Table & Export Grapes', 'Pomegranate (Bhagwa)', 'Vegetables'],
    seasons: {
      summer: { rhPercent: 28, dayTempC: 38.4, nightTempC: 22.0, solarKwhM2: 6.0 },
      monsoon: { rhPercent: 79, dayTempC: 28.8, nightTempC: 21.6, solarKwhM2: 4.1 },
      winter: { rhPercent: 44, dayTempC: 28.6, nightTempC: 12.2, solarKwhM2: 5.2 },
    },
  },

  // Karnataka (3)
  {
    state: 'Karnataka',
    district: 'Vijayapura (Bijapur)',
    agroClimaticZone: 'Northern Dry Zone (Zone 3)',
    waterTableDepthM: 41.5,
    aquiferCategory: 'Critical',
    monsoonRainfallMm: 575,
    awhSuitability: 'Exceptional',
    feasibilityNote:
      'Chronic summer drought threatens Thompson Seedless grapes and Bhagwa pomegranate; 3-tower array cuts tanker reliance by 80%.',
    primaryCrops: ['Table & Export Grapes', 'Pomegranate (Bhagwa)', 'Maize / Corn'],
    seasons: {
      summer: { rhPercent: 26, dayTempC: 39.9, nightTempC: 24.0, solarKwhM2: 6.1 },
      monsoon: { rhPercent: 73, dayTempC: 30.8, nightTempC: 22.2, solarKwhM2: 4.6 },
      winter: { rhPercent: 42, dayTempC: 30.0, nightTempC: 15.2, solarKwhM2: 5.3 },
    },
  },
  {
    state: 'Karnataka',
    district: 'Kolar',
    agroClimaticZone: 'Eastern Dry Zone (Zone 5)',
    waterTableDepthM: 79.0,
    aquiferCategory: 'Over-Exploited',
    monsoonRainfallMm: 710,
    awhSuitability: 'High',
    feasibilityNote:
      'Deepest hard-rock borewells in South India (>300 m). Zero-grid AWH protects high-value tomato, capsicum, and mango plots.',
    primaryCrops: ['Vegetables (Tomato/Capsicum)', 'Mango (Alphonso)', 'Guava'],
    seasons: {
      summer: { rhPercent: 32, dayTempC: 35.8, nightTempC: 21.8, solarKwhM2: 5.9 },
      monsoon: { rhPercent: 74, dayTempC: 29.2, nightTempC: 20.4, solarKwhM2: 4.5 },
      winter: { rhPercent: 48, dayTempC: 27.6, nightTempC: 15.4, solarKwhM2: 5.1 },
    },
  },
  {
    state: 'Karnataka',
    district: 'Bagalkot',
    agroClimaticZone: 'Northern Dry Zone (Malaprabha Basin)',
    waterTableDepthM: 36.8,
    aquiferCategory: 'Semi-Critical',
    monsoonRainfallMm: 560,
    awhSuitability: 'High',
    feasibilityNote:
      'Balanced diurnal humidity enables steady 460+ L/day extraction for high-density horticulture.',
    primaryCrops: ['Pomegranate (Bhagwa)', 'Sugarcane', 'Maize / Corn'],
    seasons: {
      summer: { rhPercent: 27, dayTempC: 39.4, nightTempC: 23.8, solarKwhM2: 6.0 },
      monsoon: { rhPercent: 74, dayTempC: 30.5, nightTempC: 22.0, solarKwhM2: 4.5 },
      winter: { rhPercent: 43, dayTempC: 29.8, nightTempC: 15.0, solarKwhM2: 5.3 },
    },
  },

  // Telangana (2)
  {
    state: 'Telangana',
    district: 'Mahabubnagar',
    agroClimaticZone: 'Southern Telangana Semi-Arid Zone',
    waterTableDepthM: 31.4,
    aquiferCategory: 'Semi-Critical',
    monsoonRainfallMm: 645,
    awhSuitability: 'High',
    feasibilityNote:
      'Granitic hard-rock terrain with seasonal borewell drawdown; ideal for FPO-shared AWH arrays.',
    primaryCrops: ['Bt Cotton', 'Sweet Orange / Mosambi', 'Groundnut / Peanut'],
    seasons: {
      summer: { rhPercent: 28, dayTempC: 40.2, nightTempC: 25.0, solarKwhM2: 6.0 },
      monsoon: { rhPercent: 75, dayTempC: 31.5, nightTempC: 23.0, solarKwhM2: 4.6 },
      winter: { rhPercent: 45, dayTempC: 30.2, nightTempC: 16.0, solarKwhM2: 5.2 },
    },
  },
  {
    state: 'Telangana',
    district: 'Nalgonda',
    agroClimaticZone: 'Southern Telangana Fluoride & Drought Belt',
    waterTableDepthM: 35.0,
    aquiferCategory: 'Critical',
    monsoonRainfallMm: 620,
    awhSuitability: 'High',
    feasibilityNote:
      'Groundwater fluoride and high SAR degrade citrus roots; mineralized atmospheric water provides pure low-sodium irrigation.',
    primaryCrops: ['Sweet Orange / Mosambi', 'Bt Cotton', 'Paddy'],
    seasons: {
      summer: { rhPercent: 29, dayTempC: 41.0, nightTempC: 25.6, solarKwhM2: 6.1 },
      monsoon: { rhPercent: 74, dayTempC: 32.0, nightTempC: 23.5, solarKwhM2: 4.6 },
      winter: { rhPercent: 46, dayTempC: 30.5, nightTempC: 16.5, solarKwhM2: 5.2 },
    },
  },

  // Punjab (1)
  {
    state: 'Punjab',
    district: 'Bathinda',
    agroClimaticZone: 'South-Western Semi-Arid Malwa Cotton Belt',
    waterTableDepthM: 44.2,
    aquiferCategory: 'Over-Exploited',
    monsoonRainfallMm: 410,
    awhSuitability: 'High',
    feasibilityNote:
      'Brackish groundwater in Malwa belt harms Kinnow orchards; solar AWH delivers zero-salinity drip water.',
    primaryCrops: ['Sweet Orange / Kinnow', 'Bt Cotton', 'Wheat (Rabi)'],
    seasons: {
      summer: { rhPercent: 25, dayTempC: 42.0, nightTempC: 26.2, solarKwhM2: 6.2 },
      monsoon: { rhPercent: 69, dayTempC: 35.2, nightTempC: 26.0, solarKwhM2: 5.0 },
      winter: { rhPercent: 49, dayTempC: 21.0, nightTempC: 7.2, solarKwhM2: 4.3 },
    },
  },

  // Uttarakhand (1)
  {
    state: 'Uttarakhand',
    district: 'Tehri Garhwal',
    agroClimaticZone: 'Mid-Himalayan Rain-Fed Terrace Zone',
    waterTableDepthM: 18.5,
    aquiferCategory: 'Safe',
    monsoonRainfallMm: 1180,
    awhSuitability: 'Moderate-High',
    feasibilityNote:
      'Terrace orchards sit high above valley rivers where pumping is infeasible; passive AWH eliminates diesel lift pumps.',
    primaryCrops: ['Vegetables (Off-Season)', 'Guava & Temperate Fruit', 'Medicinal Plants'],
    seasons: {
      summer: { rhPercent: 42, dayTempC: 29.5, nightTempC: 16.5, solarKwhM2: 5.7 },
      monsoon: { rhPercent: 84, dayTempC: 25.0, nightTempC: 18.2, solarKwhM2: 3.9 },
      winter: { rhPercent: 54, dayTempC: 16.8, nightTempC: 5.0, solarKwhM2: 4.4 },
    },
  },
];

export function getDistrictClimatology(state: string, district: string): DistrictClimatology {
  return (
    DISTRICT_CLIMATOLOGY.find(
      (d) => d.state.toLowerCase() === state.toLowerCase() && d.district.toLowerCase() === district.toLowerCase()
    ) ||
    DISTRICT_CLIMATOLOGY.find((d) => d.state.toLowerCase() === state.toLowerCase()) ||
    DISTRICT_CLIMATOLOGY[4] // Banaskantha, Gujarat default
  );
}

export function getDistrictsForState(state: string): DistrictClimatology[] {
  const matches = DISTRICT_CLIMATOLOGY.filter((d) => d.state.toLowerCase() === state.toLowerCase());
  return matches.length > 0 ? matches : [DISTRICT_CLIMATOLOGY[4]];
}
