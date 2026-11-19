import heroWater from './images/hero_water_1795081765050.jpg';
import farmAerial from './images/farm_aerial_1795081765064.jpg';
import solarTowerMacro from './images/solar_tower_macro_1795081765144.jpg';
import towerDesert from './images/tower_desert_1795081765545.jpg';
import orchardDrought from './images/orchard_drought_1795081765093.jpg';
import solarMineralization from './images/solar_mineralization_1795081764956.jpg';

export const IMAGES = {
  heroWater,
  farmAerial,
  solarTowerMacro,
  towerDesert,
  orchardDrought,
  solarMineralization,
} as const;

export type ImageKey = keyof typeof IMAGES;
