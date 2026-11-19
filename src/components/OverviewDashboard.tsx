import React, { useMemo } from 'react';
import {
  ArrowRight,
  Bot,
  Calculator,
  Compass,
  Droplets,
  FileText,
  FlaskConical,
  MapPin,
  Sprout,
  TrendingUp,
} from 'lucide-react';
import { IMAGES } from '../assets/images';
import {
  DISTRICT_CLIMATOLOGY,
  getDistrictClimatology,
  getDistrictsForState,
} from '../data/indianClimatology';
import { TRANSLATIONS } from '../i18n/translations';
import type { LanguageCode, SimulatorConfig, TabId } from '../types/aeroflora';
import { runEngineeringSimulation } from '../lib/thermodynamics';
import { ResilientImage } from './ResilientImage';

interface OverviewDashboardProps {
  language: LanguageCode;
  stateName: string;
  districtName: string;
  simulatorConfig: SimulatorConfig;
  totalAcres: number;
  monthlyWaterSpendInr: number;
  onSelectLocation: (state: string, district: string) => void;
  onNavigateTab: (tab: TabId) => void;
  onOpenAssistant: () => void;
  onOpenExecutiveReport: () => void;
  onOpenScenarios: () => void;
}

const UNIQUE_STATES = Array.from(new Set(DISTRICT_CLIMATOLOGY.map((d) => d.state)));

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  language,
  stateName,
  districtName,
  simulatorConfig,
  totalAcres,
  monthlyWaterSpendInr,
  onSelectLocation,
  onNavigateTab,
  onOpenAssistant,
  onOpenExecutiveReport,
  onOpenScenarios,
}) => {
  const t = TRANSLATIONS[language];
  const simResult = useMemo(() => runEngineeringSimulation(simulatorConfig), [simulatorConfig]);
  const climate = useMemo(
    () => getDistrictClimatology(stateName, districtName),
    [stateName, districtName]
  );
  const availableDistricts = useMemo(() => getDistrictsForState(stateName), [stateName]);

  const targetProgressPct = Math.min(
    100,
    Math.round((simResult.dailyYieldPerTowerL / Math.max(1, simulatorConfig.validationTargetLPerDay)) * 100)
  );

  const pillars: {
    id: TabId;
    title: string;
    kicker: string;
    metric: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'simulator',
      title: 'Engineering Simulator',
      kicker: '01 · Sorption & Thermal',
      metric: `${simResult.dailyYieldPerTowerL} L/day/tower`,
      description: 'Tune MOF-801 sorbent mass, diurnal RH, and collector core temperature.',
      icon: <Compass className="w-5 h-5 text-sky-600" />,
    },
    {
      id: 'crop_planner',
      title: 'Crop Water Planner',
      kicker: '02 · FAO-56 Penman-Monteith',
      metric: `${totalAcres.toFixed(1)} Acres Active`,
      description: 'Compute exact stage-wise ETc moisture deficits across 15 Indian crops.',
      icon: <Sprout className="w-5 h-5 text-emerald-600" />,
    },
    {
      id: 'mineralization',
      title: 'Water Quality & Minerals',
      kicker: '03 · USDA Hydrochemistry',
      metric: 'SAR · RSC · TDS',
      description: 'Verify Ca/Mg basalt mineralization and prevent borewell Boron/sodium toxicity.',
      icon: <FlaskConical className="w-5 h-5 text-cyan-600" />,
    },
    {
      id: 'roi',
      title: 'Financial ROI & Subsidies',
      kicker: '04 · PM-KUSUM & NABARD',
      metric: `₹${monthlyWaterSpendInr.toLocaleString('en-IN')}/mo spend`,
      description: 'Compare Direct Purchase, Lease, and FPO arrays with 30–50% grants.',
      icon: <TrendingUp className="w-5 h-5 text-amber-600" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Obsidian-to-Cyan Hero Banner */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-sky-950 text-white border border-slate-800 p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-medium text-sky-300 mb-3 flex flex-wrap items-center gap-2">
                <span>AeroFlora Mk-IV OS</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{climate.district}, {climate.state}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-emerald-400">Zero-Grid Solar Operation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight text-balance mb-3">
                {t.heroTitle}
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                {t.heroSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('simulator')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Calculator className="w-4 h-4" />
                <span>{t.launchSimulator}</span>
              </button>
              <button
                type="button"
                onClick={onOpenAssistant}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <Bot className="w-4 h-4 text-sky-400" />
                <span>{t.askAiButton}</span>
              </button>
              <button
                type="button"
                onClick={onOpenExecutiveReport}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 text-sm font-medium transition-colors whitespace-nowrap shrink-0"
              >
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>{t.auditReportBtn}</span>
              </button>
            </div>
          </div>

          {/* Live Today's AWH Generation Telemetry Widget */}
          <div className="lg:col-span-5 bg-slate-900/85 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4" />
                  <span>{t.todaysGeneration}</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenScenarios}
                  className="text-xs font-medium text-slate-300 hover:text-white underline underline-offset-4 whitespace-nowrap shrink-0"
                >
                  Compare Array Sizing
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400">Array Output</div>
                  <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
                    {simResult.totalArrayYieldDailyL.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-sky-400 font-mono">{t.litresPerDayUnit}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Volume</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                    {(simResult.totalArrayYieldDailyL / 1000).toFixed(2)}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">{t.kilolitresPerDayUnit}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Active Fleet</div>
                  <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums mt-0.5">
                    {simulatorConfig.towerCount}
                  </div>
                  <div className="text-xs text-slate-400">Mk-IV Towers</div>
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300">{t.validationTargetLabel}</span>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {simResult.dailyYieldPerTowerL} / {simulatorConfig.validationTargetLPerDay} L ({targetProgressPct}%)
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    simResult.isTargetMet ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${targetProgressPct}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400">
                <span>Sorbent: {simulatorConfig.sorbentId}</span>
                <span className={simResult.isTargetMet ? 'text-emerald-400 font-medium' : 'text-amber-300 font-medium'}>
                  {simResult.isTargetMet
                    ? `+${simResult.targetDeltaL} L/tower above target`
                    : `${Math.abs(simResult.targetDeltaL)} L/tower below target`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* India Agro-Climatic Zone & Groundwater Status Bar */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>India Agro-Climatic Zone & CGWB Groundwater Telemetry</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {climate.district}, {climate.state} — {climate.agroClimaticZone}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label htmlFor="overview-state" className="sr-only">State</label>
              <select
                id="overview-state"
                value={climate.state}
                onChange={(e) => {
                  const nextState = e.target.value;
                  const nextDistricts = getDistrictsForState(nextState);
                  onSelectLocation(nextState, nextDistricts[0].district);
                }}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {UNIQUE_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="overview-district" className="sr-only">District</label>
              <select
                id="overview-district"
                value={climate.district}
                onChange={(e) => onSelectLocation(climate.state, e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {availableDistricts.map((d) => (
                  <option key={d.district} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('water_intel')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <span>Full Climate Engine</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 py-5 border-b border-slate-200">
          <div>
            <div className="text-xs text-slate-500">Summer Ambient RH</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.seasons.summer.rhPercent}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Peak Summer Temp</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.seasons.summer.dayTempC}°C
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Solar Irradiance</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.seasons.summer.solarKwhM2} <span className="text-xs font-normal text-slate-500">kWh/m²/d</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">CGWB Water Table</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.waterTableDepthM} m
            </div>
            <div
              className={`text-xs font-semibold mt-0.5 ${
                climate.aquiferCategory === 'Over-Exploited'
                  ? 'text-rose-600'
                  : climate.aquiferCategory === 'Critical'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {climate.aquiferCategory}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Monsoon Rainfall</div>
            <div className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.monsoonRainfallMm} mm
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">AWH Suitability</div>
            <div className="text-lg font-bold text-sky-700 mt-0.5">{climate.awhSuitability}</div>
          </div>
        </div>

        <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
          <p className="leading-relaxed">{climate.feasibilityNote}</p>
          <div className="shrink-0 font-medium text-slate-800">
            Primary Crops: {climate.primaryCrops.join(' · ')}
          </div>
        </div>
      </section>

      {/* 4 Interactive Pillar Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {pillars.map((pillar) => (
          <button
            key={pillar.id}
            type="button"
            onClick={() => onNavigateTab(pillar.id)}
            className="text-left bg-white border border-slate-200 hover:border-sky-400 rounded-xl p-5 transition-colors flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-xs font-medium text-slate-500">{pillar.kicker}</span>
                {pillar.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-700 transition-colors mb-1">
                {pillar.title}
              </h3>
              <div className="text-sm font-mono font-semibold text-sky-700 tabular-nums mb-2">
                {pillar.metric}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{pillar.description}</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-sky-700">
              <span>Open Module</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </section>

      {/* 3 Engineering Showcase Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="h-48 overflow-hidden bg-slate-900">
            <ResilientImage
              src={IMAGES.farmAerial}
              alt="Precision drip-irrigated arid orchard and central water retention reservoir"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-emerald-700 mb-1">
                Orchard Micro-Catchment · 90% Drip Efficiency
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Smart Orchard & Reservoir Array
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paired AWH manifolds feed lined retention sumps directly into inline drip fertigation networks,
                protecting Bhagwa pomegranate & Thomson grapes during flowering stress.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('farmer_farm')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
            >
              <span>Manage Farm Plots</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="h-48 overflow-hidden bg-slate-900">
            <ResilientImage
              src={IMAGES.solarTowerMacro}
              alt="Micro-channel atmospheric condensation core and aluminum heat exchanger fins"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-sky-700 mb-1">
                Stenocara Biomimetics · 0.0 kWh Grid Power
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Micro-Channel Sorbent Exchanger
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zr-fumarate MOF-801 trays capture ambient vapor overnight and release purified moisture across
                hydrophilic-hydrophobic finned condensers under solar thermal heat.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('cycle')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
            >
              <span>Inspect 24h Thermodynamic Cycle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="h-48 overflow-hidden bg-slate-900">
            <ResilientImage
              src={IMAGES.towerDesert}
              alt="Rural Indian FPO array of passive solar atmospheric water harvesting towers"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium text-amber-700 mb-1">
                PM-KUSUM 30–50% · Replaces ₹1,200–₹2,200/5kL Tankers
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Community Water Token Distribution
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                FPO cooperatives pool shared tower arrays to eliminate emergency summer water trucking and dispatch
                scheduled morning irrigation tokens to member plots.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('community')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800"
            >
              <span>Open FPO Cooperative Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};
