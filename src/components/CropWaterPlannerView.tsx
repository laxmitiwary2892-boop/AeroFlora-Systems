import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Droplets, ShieldAlert, Sprout } from 'lucide-react';
import { IMAGES } from '../assets/images';
import {
  calculateFao56CropWater,
  INDIAN_CROPS,
  IRRIGATION_EFFICIENCY,
} from '../lib/fao56CropWater';
import type { FarmPlot, GrowthStageKey, IrrigationMethod } from '../types/aeroflora';
import { ResilientImage } from './ResilientImage';

interface CropWaterPlannerViewProps {
  activePlot: FarmPlot;
  yieldPerTowerLPerDay: number;
  onSizeTowersForDeficit: (towersNeeded: number, cropName: string) => void;
}

const STAGE_LABELS: { key: GrowthStageKey; title: string }[] = [
  { key: 'initial', title: 'Initial' },
  { key: 'development', title: 'Development' },
  { key: 'mid_season', title: 'Mid-Season' },
  { key: 'late_season', title: 'Late Season' },
];

export const CropWaterPlannerView: React.FC<CropWaterPlannerViewProps> = ({
  activePlot,
  yieldPerTowerLPerDay,
  onSizeTowersForDeficit,
}) => {
  const [cropId, setCropId] = useState<string>(activePlot.cropId || 'pomegranate');
  const [stage, setStage] = useState<GrowthStageKey>(activePlot.growthStage || 'mid_season');
  const [areaAcres, setAreaAcres] = useState<number>(activePlot.areaAcres || 2.5);
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(
    activePlot.irrigationMethod || 'drip'
  );
  const [et0MmPerDay, setEt0MmPerDay] = useState<number>(6.2);
  const [existingSupplyLPerDay, setExistingSupplyLPerDay] = useState<number>(
    activePlot.dailyWaterAvailabilityL || 2400
  );
  const [sizedToast, setSizedToast] = useState(false);

  const calc = useMemo(
    () =>
      calculateFao56CropWater({
        cropId,
        stage,
        areaAcres,
        irrigationMethod,
        et0MmPerDay,
        existingSupplyLPerDay,
        yieldPerTowerLPerDay,
      }),
    [cropId, stage, areaAcres, irrigationMethod, et0MmPerDay, existingSupplyLPerDay, yieldPerTowerLPerDay]
  );

  const handleSizeTowers = () => {
    const count = Math.max(1, calc.towersNeededForZeroDeficit);
    onSizeTowersForDeficit(count, calc.crop.name);
    setSizedToast(true);
    setTimeout(() => setSizedToast(false), 2400);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5" />
            <span>FAO-56 Penman-Monteith Precision Crop Water Budget (ETc = Kc × ET₀)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Indian Crop Water Planner & Zero-Deficit Tower Sizing
          </h1>
        </div>
        <button
          type="button"
          onClick={handleSizeTowers}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          {sizedToast ? <CheckCircle2 className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          <span>
            {sizedToast
              ? 'Applied to Simulator & Financial Fleet'
              : `Size ${Math.max(1, calc.towersNeededForZeroDeficit)} Towers for Zero Deficit`}
          </span>
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Indian Crop (15 ICAR/FAO-56 Profiles)
            </label>
            <select
              value={cropId}
              onChange={(e) => setCropId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {INDIAN_CROPS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.hindiName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Growth Stage</label>
            <div className="grid grid-cols-2 gap-2">
              {STAGE_LABELS.map((s) => {
                const active = stage === s.key;
                const stageKc = calc.crop.stages[s.key].kc;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStage(s.key)}
                    className={`px-3 py-2 rounded-lg text-left border text-xs transition-colors ${
                      active
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-semibold">{s.title}</div>
                    <div className={`font-mono text-[11px] ${active ? 'text-sky-300' : 'text-slate-500'}`}>
                      Kc = {stageKc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Planted Area</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {areaAcres.toFixed(1)} Acres ({(areaAcres * 0.4047).toFixed(2)} Ha)
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={areaAcres}
              onChange={(e) => setAreaAcres(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Irrigation Method</label>
            <select
              value={irrigationMethod}
              onChange={(e) => setIrrigationMethod(e.target.value as IrrigationMethod)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              {Object.entries(IRRIGATION_EFFICIENCY).map(([key, spec]) => (
                <option key={key} value={key}>
                  {spec.label} ({Math.round(spec.efficiency * 100)}% Application Efficiency)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Reference Evapotranspiration (ET₀)</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{et0MmPerDay.toFixed(1)} mm/day</span>
            </div>
            <input
              type="range"
              min={3.0}
              max={9.0}
              step={0.2}
              value={et0MmPerDay}
              onChange={(e) => setEt0MmPerDay(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Existing Borewell / Canal Supply</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {existingSupplyLPerDay.toLocaleString('en-IN')} L/day
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={25000}
              step={200}
              value={existingSupplyLPerDay}
              onChange={(e) => setExistingSupplyLPerDay(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        </div>

        {/* Outputs & Agronomic Profile */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-800">
              <div>
                <div className="text-xs text-sky-400 font-medium">
                  {calc.crop.scientificName} · {calc.crop.hindiName}
                </div>
                <h2 className="text-lg font-bold">
                  {calc.crop.name} — {calc.crop.stages[stage].label}
                </h2>
              </div>
              <span
                className={`text-xs font-semibold ${
                  calc.status === 'Drought Deficit'
                    ? 'text-amber-300'
                    : calc.status === 'Surplus'
                    ? 'text-emerald-400'
                    : 'text-sky-300'
                }`}
              >
                {calc.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-800">
              <div>
                <div className="text-xs text-slate-400">Crop ETc (Kc × ET₀)</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  {calc.etcMmPerDay}
                </div>
                <div className="text-xs text-slate-400">mm/day (Kc {calc.kc})</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Gross Irrigation Req.</div>
                <div className="text-xl font-bold font-mono text-sky-400 tabular-nums mt-0.5">
                  {calc.grossIrrigationRequiredLPerDay.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-400">L/day gross</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Net Moisture Deficit</div>
                <div
                  className={`text-xl font-bold font-mono tabular-nums mt-0.5 ${
                    calc.netMoistureDeficitLPerDay > 0 ? 'text-amber-300' : 'text-emerald-400'
                  }`}
                >
                  {calc.netMoistureDeficitLPerDay > 0
                    ? `-${calc.netMoistureDeficitLPerDay.toLocaleString('en-IN')}`
                    : `+${Math.abs(calc.netMoistureDeficitLPerDay).toLocaleString('en-IN')}`}
                </div>
                <div className="text-xs text-slate-400">L/day gap</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Towers for Zero Deficit</div>
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  {calc.towersNeededForZeroDeficit}
                </div>
                <div className="text-xs text-slate-400">
                  Replaces {calc.tankersNeededPerMonth} tankers/mo
                </div>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <div className="text-slate-400">Critical Stress Window</div>
                <div className="font-semibold text-white mt-0.5">{calc.crop.criticalWaterStressStage}</div>
              </div>
              <div>
                <div className="text-slate-400">Salinity & Boron Limits</div>
                <div className="font-mono font-semibold text-cyan-300 mt-0.5 tabular-nums">
                  ≤ {calc.crop.maxTdsPpm} ppm TDS · ≤ {calc.crop.maxBoronMgL} mg/L B
                </div>
              </div>
              <div>
                <div className="text-slate-400">Salinity Class</div>
                <div className="font-semibold text-white mt-0.5">{calc.crop.salinitySensitivity}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 sm:grid-cols-12 items-stretch">
            <div className="sm:col-span-5 h-44 sm:h-auto bg-slate-900">
              <ResilientImage
                src={IMAGES.orchardDrought}
                alt="Precision drip irrigation emitter delivering moisture to arid orchard root zone"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:col-span-7 p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
                  <Droplets className="w-4 h-4" />
                  <span>Agronomic Water Allocation Insight</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Switching from flood irrigation (50%) to inline drip (90%) reduces gross water demand by 44%. Pairing
                  drip with {calc.towersNeededForZeroDeficit} AeroFlora tower(s) eliminates emergency tanker reliance
                  during {calc.crop.criticalWaterStressStage.toLowerCase()}.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Stage Duration: {calc.crop.stages[stage].durationDays} days · Variety benchmark:{' '}
                  {calc.crop.varietyExample}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
