import React, { useMemo } from 'react';
import { CheckCircle2, FlaskConical, ShieldAlert, Sparkles } from 'lucide-react';
import { IMAGES } from '../assets/images';
import { analyzeWaterQuality, WATER_QUALITY_PRESETS } from '../lib/waterQualityAnalysis';
import type { WaterQualityInputs } from '../types/aeroflora';
import { ResilientImage } from './ResilientImage';

interface WaterQualityMineralisationViewProps {
  inputs: WaterQualityInputs;
  onChangeInputs: (next: WaterQualityInputs) => void;
}

export const WaterQualityMineralisationView: React.FC<WaterQualityMineralisationViewProps> = ({
  inputs,
  onChangeInputs,
}) => {
  const analysis = useMemo(() => analyzeWaterQuality(inputs), [inputs]);

  const applyPreset = (presetId: string) => {
    const preset = WATER_QUALITY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    onChangeInputs({
      presetName: preset.presetName,
      caMgL: preset.caMgL,
      mgMgL: preset.mgMgL,
      naMgL: preset.naMgL,
      kMgL: preset.kMgL,
      clMgL: preset.clMgL,
      hco3MgL: preset.hco3MgL,
      boronMgL: preset.boronMgL,
      ph: preset.ph,
    });
  };

  const bannerTone =
    analysis.suitability === 'Excellent'
      ? 'bg-emerald-950 border-emerald-700 text-emerald-100'
      : analysis.suitability === 'Good with Leaching'
      ? 'bg-amber-950 border-amber-700 text-amber-100'
      : 'bg-rose-950 border-rose-700 text-rose-100';

  return (
    <div className="space-y-6">
      {/* Header & 4 One-Click Lab Presets */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <div className="text-xs font-medium text-sky-700 mb-1 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>USDA Handbook 60 & FAO-29 Irrigation Hydrochemistry Calculator</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Water Quality, SAR/RSC Analysis & Passive Solar Mineralization
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {WATER_QUALITY_PRESETS.map((preset) => {
            const active = inputs.presetName === preset.presetName;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset.id)}
                className={`text-left rounded-xl p-3.5 border transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-sky-400'
                }`}
              >
                <div className="text-xs font-bold leading-snug mb-1">{preset.presetName}</div>
                <div className={`text-[11px] leading-relaxed ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Dynamic Suitability Banner */}
      <section className={`rounded-2xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${bannerTone}`}>
        <div className="flex items-start gap-3">
          {analysis.suitability === 'Excellent' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="text-xs font-semibold opacity-80">
              Active Sample: {inputs.presetName}
            </div>
            <div className="text-lg font-bold">
              Irrigation Suitability: {analysis.suitability}
            </div>
            <p className="text-xs opacity-90 mt-1 max-w-3xl leading-relaxed">{analysis.recommendation}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 shrink-0 text-right">
          <div>
            <div className="text-[11px] opacity-75">EC / TDS</div>
            <div className="text-base font-bold font-mono tabular-nums">
              {analysis.ecDsM} dS/m
            </div>
            <div className="text-[11px] font-mono tabular-nums opacity-80">{analysis.tdsPpm} ppm</div>
          </div>
          <div>
            <div className="text-[11px] opacity-75">SAR Index</div>
            <div className="text-base font-bold font-mono tabular-nums">{analysis.sar}</div>
            <div className="text-[11px] opacity-80">{analysis.sodiumHazard}</div>
          </div>
          <div>
            <div className="text-[11px] opacity-75">RSC</div>
            <div className="text-base font-bold font-mono tabular-nums">{analysis.rscMeqL}</div>
            <div className="text-[11px] opacity-80">meq/L</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editable Ion Inputs + Live meq/L Conversions */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">
              Ion Composition (mg/L) & Live Equivalent Weights (meq/L)
            </h2>
            <span className="text-xs font-mono text-slate-500 tabular-nums">
              Σ Cations: {analysis.totalCationsMeqL} meq/L
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'caMgL' as const, label: 'Calcium (Ca²⁺)', meq: analysis.meqL.ca, unit: 'mg/L' },
              { key: 'mgMgL' as const, label: 'Magnesium (Mg²⁺)', meq: analysis.meqL.mg, unit: 'mg/L' },
              { key: 'naMgL' as const, label: 'Sodium (Na⁺)', meq: analysis.meqL.na, unit: 'mg/L' },
              { key: 'kMgL' as const, label: 'Potassium (K⁺)', meq: analysis.meqL.k, unit: 'mg/L' },
              { key: 'clMgL' as const, label: 'Chloride (Cl⁻)', meq: analysis.meqL.cl, unit: 'mg/L' },
              { key: 'hco3MgL' as const, label: 'Bicarbonate (HCO₃⁻)', meq: analysis.meqL.hco3, unit: 'mg/L' },
            ].map((field) => (
              <div key={field.key} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-semibold text-slate-700">{field.label}</label>
                  <span className="font-mono text-sky-700 tabular-nums">{field.meq} meq/L</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={inputs[field.key]}
                    onChange={(e) =>
                      onChangeInputs({
                        ...inputs,
                        presetName: 'Custom Lab Sample',
                        [field.key]: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
                  />
                  <span className="text-xs text-slate-500 shrink-0">{field.unit}</span>
                </div>
              </div>
            ))}

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-700">Boron (B)</label>
                <span className="text-slate-500">{analysis.boronRisk}</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={inputs.boronMgL}
                  onChange={(e) =>
                    onChangeInputs({
                      ...inputs,
                      presetName: 'Custom Lab Sample',
                      boronMgL: Math.max(0, Number(e.target.value)),
                    })
                  }
                  className="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
                />
                <span className="text-xs text-slate-500 shrink-0">mg/L</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <label className="font-semibold text-slate-700">Measured pH</label>
                <span className="text-slate-500">Target 6.8–7.8</span>
              </div>
              <input
                type="number"
                min={4}
                max={10}
                step={0.1}
                value={inputs.ph}
                onChange={(e) =>
                  onChangeInputs({
                    ...inputs,
                    presetName: 'Custom Lab Sample',
                    ph: Number(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 text-xs">
            <div>
              <div className="text-slate-500">Salinity Hazard</div>
              <div className="font-semibold text-slate-900 mt-0.5">{analysis.salinityHazard}</div>
            </div>
            <div>
              <div className="text-slate-500">Infiltration Risk</div>
              <div className="font-semibold text-slate-900 mt-0.5">{analysis.infiltrationHazard}</div>
            </div>
            <div>
              <div className="text-slate-500">Chloride Toxicity</div>
              <div className="font-semibold text-slate-900 mt-0.5">{analysis.chlorideRisk}</div>
            </div>
            <div>
              <div className="text-slate-500">Boron Toxicity</div>
              <div className="font-semibold text-slate-900 mt-0.5">{analysis.boronRisk}</div>
            </div>
          </div>
        </div>

        {/* 3-Stage Mineral Cartridge Bed Explainer */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col">
          <div className="h-52 bg-slate-900">
            <ResilientImage
              src={IMAGES.solarMineralization}
              alt="Multi-stage volcanic basalt, calcite, and dolomite passive gravity mineralization column"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6 flex-1 space-y-4">
            <div>
              <div className="text-xs font-semibold text-sky-700 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>3-Stage Gravity Mineralization Bed</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Passive Basalt + Calcite Remineralization (₹3,200/yr)
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Raw atmospheric condensate (~12 ppm TDS, pH 5.8) is too soft for direct soil application and can cause
                crusting. AeroFlora’s zero-pump gravity column restores essential Ca²⁺, Mg²⁺, and K⁺ ions:
              </p>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-200 pt-3">
              <div>
                <div className="font-bold text-slate-900">Stage 1 · Crushed Deccan Volcanic Basalt</div>
                <div className="text-slate-600">Releases trace silica, magnesium, and potassium silicates.</div>
              </div>
              <div>
                <div className="font-bold text-slate-900">Stage 2 · High-Purity Calcite & Dolomite</div>
                <div className="text-slate-600">Buffers pH to 7.6 and injects 54 mg/L Ca²⁺ & 18.6 mg/L Mg²⁺.</div>
              </div>
              <div>
                <div className="font-bold text-slate-900">Stage 3 · Coconut-Shell Micro-Carbon Polish</div>
                <div className="text-slate-600">Removes trace VOCs; guarantees clog-free 2 LPH drip emitters.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
