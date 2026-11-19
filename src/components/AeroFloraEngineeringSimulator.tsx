import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FlaskConical,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { runEngineeringSimulation, SORBENT_PROFILES } from '../lib/thermodynamics';
import type { SimulatorConfig, SorbentMaterialId, TabId } from '../types/aeroflora';

interface AeroFloraEngineeringSimulatorProps {
  config: SimulatorConfig;
  onChangeConfig: (next: SimulatorConfig) => void;
  onApplySizingToFleet: (towerCount: number, dailyHarvestL: number) => void;
  onResetBaseline: () => void;
  onNavigateTab: (tab: TabId) => void;
}

const SORBENT_IDS: SorbentMaterialId[] = [
  'MOF-801',
  'MIL-101(Cr)',
  'Aluminum Fumarate',
  'Zeolite 13X',
];

export const AeroFloraEngineeringSimulator: React.FC<AeroFloraEngineeringSimulatorProps> = ({
  config,
  onChangeConfig,
  onApplySizingToFleet,
  onResetBaseline,
  onNavigateTab,
}) => {
  const [appliedToast, setAppliedToast] = useState(false);

  const result = useMemo(() => runEngineeringSimulation(config), [config]);
  const activeSorbent = SORBENT_PROFILES[config.sorbentId];

  const handleSelectSorbent = (id: SorbentMaterialId) => {
    const profile = SORBENT_PROFILES[id];
    onChangeConfig({
      ...config,
      sorbentId: id,
      adsorptionCapacityLPerKg: profile.nominalCapacityLPerKg,
      desorptionCoreTempC: Math.max(config.desorptionCoreTempC, profile.minDesorptionTempC + 12),
    });
  };

  const handleApply = () => {
    onApplySizingToFleet(config.towerCount, result.totalArrayYieldDailyL);
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 2400);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-sky-700 mb-1 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>Mk-IV Parametric Sorption & Solar Desorption Simulator</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            AeroFlora Engineering Simulator & Mass-Energy Balance
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onResetBaseline}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Baseline</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('results')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Decision Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{appliedToast ? 'Fleet Sizing Synced' : 'Apply Sizing to Fleet'}</span>
          </button>
        </div>
      </section>

      {/* Sorbent Material Selector */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SORBENT_IDS.map((id) => {
          const prof = SORBENT_PROFILES[id];
          const selected = config.sorbentId === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => handleSelectSorbent(id)}
              className={`text-left rounded-xl p-4 border transition-colors ${
                selected
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-sky-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className={`text-xs font-mono ${selected ? 'text-sky-300' : 'text-sky-700'}`}>
                  {prof.chemicalFormula}
                </span>
                <FlaskConical className={`w-4 h-4 ${selected ? 'text-sky-400' : 'text-slate-400'}`} />
              </div>
              <div className="text-sm font-bold mb-1">{prof.id}</div>
              <div className={`text-xs mb-2 ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                Cap: <span className="font-mono font-semibold">{prof.nominalCapacityLPerKg} L/kg</span> · Min{' '}
                <span className="font-mono font-semibold">{prof.minDesorptionTempC}°C</span>
              </div>
              <p className={`text-[11px] leading-relaxed ${selected ? 'text-slate-300' : 'text-slate-600'}`}>
                {prof.summary}
              </p>
            </button>
          );
        })}
      </section>

      {/* Boundary Warnings */}
      {result.warnings.length > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 space-y-1.5">
          {result.warnings.map((w, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* Sliders + Outputs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parametric Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
            Operating Parameters
          </h2>

          {[
            {
              label: 'Sorbent Mass per Tower',
              value: config.sorbentMassKg,
              unit: 'kg',
              min: 50,
              max: 500,
              step: 10,
              onChange: (v: number) => onChangeConfig({ ...config, sorbentMassKg: v }),
            },
            {
              label: 'Adsorption Capacity',
              value: config.adsorptionCapacityLPerKg,
              unit: 'L/kg',
              min: 0.15,
              max: 0.48,
              step: 0.01,
              onChange: (v: number) => onChangeConfig({ ...config, adsorptionCapacityLPerKg: v }),
            },
            {
              label: 'Ambient Daytime RH',
              value: config.ambientRhPercent,
              unit: '%',
              min: 10,
              max: 75,
              step: 1,
              onChange: (v: number) => onChangeConfig({ ...config, ambientRhPercent: v }),
            },
            {
              label: 'Solar Irradiance',
              value: config.solarIrradianceKwhM2,
              unit: 'kWh/m²/d',
              min: 3.5,
              max: 8.0,
              step: 0.1,
              onChange: (v: number) => onChangeConfig({ ...config, solarIrradianceKwhM2: v }),
            },
            {
              label: 'Desorption Core Temperature',
              value: config.desorptionCoreTempC,
              unit: '°C',
              min: 50,
              max: 160,
              step: 1,
              onChange: (v: number) => onChangeConfig({ ...config, desorptionCoreTempC: v }),
            },
            {
              label: 'Condenser Recovery Efficiency',
              value: config.condenserEfficiencyPercent,
              unit: '%',
              min: 65,
              max: 98,
              step: 1,
              onChange: (v: number) => onChangeConfig({ ...config, condenserEfficiencyPercent: v }),
            },
            {
              label: 'Deployed Tower Units',
              value: config.towerCount,
              unit: 'towers',
              min: 1,
              max: 12,
              step: 1,
              onChange: (v: number) => onChangeConfig({ ...config, towerCount: v }),
            },
          ].map((ctrl) => (
            <div key={ctrl.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700">{ctrl.label}</span>
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {ctrl.value} {ctrl.unit}
                </span>
              </div>
              <input
                type="range"
                min={ctrl.min}
                max={ctrl.max}
                step={ctrl.step}
                value={ctrl.value}
                onChange={(e) => ctrl.onChange(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          ))}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
            <label htmlFor="target-l-day" className="text-xs font-semibold text-slate-700">
              Per-Tower Validation Target (L/day)
            </label>
            <input
              id="target-l-day"
              type="number"
              min={200}
              max={1000}
              step={10}
              value={config.validationTargetLPerDay}
              onChange={(e) =>
                onChangeConfig({ ...config, validationTargetLPerDay: Number(e.target.value) || 450 })
              }
              className="w-28 px-3 py-1.5 text-sm font-mono font-semibold text-right rounded-lg border border-slate-300 tabular-nums"
            />
          </div>
        </div>

        {/* Live Telemetry & Mass-Energy Balance */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs text-sky-400 font-medium">{activeSorbent.name}</div>
                <h2 className="text-lg font-bold">Simulated Array Water Yield</h2>
              </div>
              <span
                className={`text-xs font-semibold ${
                  result.isTargetMet ? 'text-emerald-400' : 'text-amber-300'
                }`}
              >
                {result.isTargetMet
                  ? `Target Met (+${result.targetDeltaL} L/tower)`
                  : `${Math.abs(result.targetDeltaL)} L/tower Shortfall`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Yield / Tower</div>
                <div className="text-2xl font-bold font-mono text-sky-400 tabular-nums mt-0.5">
                  {result.dailyYieldPerTowerL}
                </div>
                <div className="text-xs text-slate-400">L/day</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Array / Day</div>
                <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  {result.totalArrayYieldDailyL.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400">{config.towerCount} towers</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Monthly / Annual</div>
                <div className="text-2xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {result.totalArrayYieldMonthlyKl}
                </div>
                <div className="text-xs text-slate-400">
                  kL/mo ({result.totalArrayYieldAnnualKl} kL/yr)
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Specific Productivity</div>
                <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums mt-0.5">
                  {result.specificProductivityLPerKg}
                </div>
                <div className="text-xs text-slate-400">L / kg sorbent</div>
              </div>
            </div>

            {/* 3-Tier Sensitivity Bands */}
            <div className="pt-5">
              <div className="text-xs font-semibold text-slate-300 mb-3">
                3-Tier Meteorological Sensitivity Bands (Array Daily Total)
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Worst Case (Cloud / Dust)</div>
                  <div className="text-base font-bold font-mono text-amber-300 tabular-nums mt-1">
                    {result.sensitivityBands.worstCaseL.toLocaleString('en-IN')} L/d
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-sky-500/40 rounded-xl p-3">
                  <div className="text-[11px] text-sky-300">Expected Baseline</div>
                  <div className="text-base font-bold font-mono text-white tabular-nums mt-1">
                    {result.sensitivityBands.expectedCaseL.toLocaleString('en-IN')} L/d
                  </div>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
                  <div className="text-[11px] text-slate-400">Best Case (Clear Nocturnal)</div>
                  <div className="text-base font-bold font-mono text-emerald-400 tabular-nums mt-1">
                    {result.sensitivityBands.bestCaseL.toLocaleString('en-IN')} L/d
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Step Mass & Energy Balance */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Stage-by-Stage 4-Step Mass & Energy Balance
            </h3>
            <div className="divide-y divide-slate-200">
              {result.massEnergyBalance.map((item) => (
                <div key={item.step} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-xs font-bold text-sky-700 pt-0.5">{item.step}.</span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.detail}</div>
                    </div>
                  </div>
                  <div className="text-sm font-mono font-bold text-slate-900 tabular-nums shrink-0">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>Enthalpy of Desorption: {activeSorbent.enthalpyKjPerKg} kJ/kg</span>
              <span>Cycle Stability: {activeSorbent.cycleStability}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
