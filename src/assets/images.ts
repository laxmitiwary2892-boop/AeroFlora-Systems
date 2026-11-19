export const IMAGES = {
  heroWater: '/src/assets/images/hero_water_1795081765050.jpg',
  farmAerial: '/src/assets/images/farm_aerial_1795081765064.jpg',
  solarTowerMacro: '/src/assets/images/solar_tower_macro_1795081765144.jpg',
  towerDesert: '/src/assets/images/tower_desert_1795081765545.jpg',
  orchardDrought: '/src/assets/images/orchard_drought_1795081765093.jpg',
  solarMineralization: '/src/assets/images/solar_mineralization_1795081764956.jpg',
} as const;

export type ImageKey = keyof typeof IMAGES;
