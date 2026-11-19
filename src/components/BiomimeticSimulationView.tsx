import React, { useMemo, useState } from 'react';
import { Clock, Droplets, Moon, Sun, Zap } from 'lucide-react';
import {
  generate24HourBiomimeticCycle,
  getRhSensitivityCurve,
} from '../lib/thermodynamics';

interface BiomimeticSimulationViewProps {
  initialRhPercent: number;
  peakTempC: number;
  onSyncRh: (rhPercent: number) => void;
}

export const BiomimeticSimulationView: React.FC<BiomimeticSimulationViewProps> = ({
  initialRhPercent,
  peakTempC,
  onSyncRh,
}) => {
  const [selectedRh, setSelectedRh] = useState<number>(initialRhPercent);
  const [selectedHour, setSelectedHour] = useState<number>(12);

  const rhCurve = useMemo(() => getRhSensitivityCurve(peakTempC), [peakTempC]);
  const activeCurvePoint = useMemo(() => {
    const match = rhCurve.find((p) => p.rhPercent === selectedRh);
    if (match) return match;
    return rhCurve[1]; // ~18% fallback benchmark
  }, [rhCurve, selectedRh]);

  const hourlyData = useMemo(
    () => generate24HourBiomimeticCycle(selectedRh, peakTempC, activeCurvePoint.dailyYieldL),
    [selectedRh, peakTempC, activeCurvePoint.dailyYieldL]
  );

  const currentHourPoint = hourlyData[selectedHour] || hourlyData[12];
  const maxRate = Math.max(...hourlyData.map((d) => d.extractionRateLPerHr), 1);

  const handleSelectRh = (rh: number) => {
    setSelectedRh(rh);
    onSyncRh(rh);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-sky-400 mb-1 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Stenocara Biomimetic Condensation · 0.0 kWh Grid Electricity</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Biomimetic 24-Hour Thermodynamic Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Scrub across 24 hours to inspect nocturnal MOF-801 sorption, solar thermal desorption, biomimetic fin
              condensation, and gravity mineralization flow.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-5 text-right shrink-0">
            <div>
              <div className="text-xs text-slate-400">Daily Per-Tower</div>
              <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
                {activeCurvePoint.dailyYieldL} L
              </div>
              <div className="text-xs text-slate-400">@ {selectedRh}% daytime RH</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Grid Power</div>
              <div className="text-xl font-bold font-mono text-sky-400 tabular-nums">0.0 kWh</div>
              <div className="text-xs text-slate-400">100% Passive Solar</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Selected Hour</div>
              <div className="text-xl font-bold font-mono text-white tabular-nums">
                {currentHourPoint.label}
              </div>
              <div className="text-xs text-cyan-300">{currentHourPoint.extractionRateLPerHr} L/hr</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 24-Hour Scrubber + Bar Chart */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" />
              <span>24-Hour Hourly Extraction Velocity (Click any hour bar or scrub)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active Phase at {currentHourPoint.label}:{' '}
              <strong className="text-slate-900">{currentHourPoint.phaseTitle}</strong>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600">Scrub Hour:</span>
            <input
              type="range"
              min={0}
              max={23}
              step={1}
              value={selectedHour}
              onChange={(e) => setSelectedHour(Number(e.target.value))}
              className="w-40 accent-sky-600 cursor-pointer"
            />
            <span className="font-mono text-xs font-bold text-slate-900 tabular-nums w-12">
              {currentHourPoint.label}
            </span>
          </div>
        </div>

        {/* Clickable 24-Hour Bar Chart */}
        <div className="pt-2">
          <div className="h-52 flex items-end gap-1.5 sm:gap-2 border-b border-slate-200 pb-2">
            {hourlyData.map((pt) => {
              const heightPct = pt.extractionRateLPerHr > 0 ? Math.max(10, (pt.extractionRateLPerHr / maxRate) * 100) : 6;
              const isSelected = pt.hour === selectedHour;
              const barColor =
                pt.phase === 'condensation'
                  ? 'bg-sky-500'
                  : pt.phase === 'desorption'
                  ? 'bg-amber-500'
                  : pt.phase === 'mineralization'
                  ? 'bg-emerald-500'
                  : 'bg-slate-300';

              return (
                <button
                  key={pt.hour}
                  type="button"
                  onClick={() => setSelectedHour(pt.hour)}
                  title={`${pt.label} · ${pt.phaseTitle} · ${pt.extractionRateLPerHr} L/hr`}
                  className="flex-1 h-full flex flex-col justify-end items-center group focus:outline-none"
                >
                  <div
                    className={`w-full rounded-t-md transition-all ${barColor} ${
                      isSelected ? 'ring-2 ring-slate-900 ring-offset-1 opacity-100' : 'opacity-80 group-hover:opacity-100'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1.5">
            <span>00:00 (Sorption)</span>
            <span>06:00 (Desorption)</span>
            <span>12:00 (Peak Condensation)</span>
            <span>18:00 (Mineralization)</span>
            <span>23:00 (Sorption)</span>
          </div>
        </div>

        {/* Selected Hour Detailed Telemetry */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 pt-4 border-t border-slate-200">
          <div>
            <div className="text-xs text-slate-500">Ambient Temp / RH</div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {currentHourPoint.ambientTempC}°C · {currentHourPoint.ambientRhPercent}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Vapor Density</div>
            <div className="text-base font-bold font-mono text-sky-700 tabular-nums mt-0.5">
              {currentHourPoint.absoluteHumidityGm3} g/m³
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Sorbent Bed Loading</div>
            <div className="text-base font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
              {currentHourPoint.sorbentLoadingPercent}%
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Solar Core Temp</div>
            <div className="text-base font-bold font-mono text-amber-600 tabular-nums mt-0.5">
              {currentHourPoint.coreTempC}°C
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Cumulative Harvest</div>
            <div className="text-base font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {currentHourPoint.cumulativeHarvestL} L
            </div>
          </div>
        </div>
      </section>

      {/* 4 Diurnal Phases Explained */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            window: '20:00 – 05:00',
            title: '1. Nocturnal Atmospheric Moisture Sorption',
            desc: 'Louvers open passively to cool night air; MOF-801 nanopores bind water vapor even down to 15% daytime RH.',
            icon: <Moon className="w-4 h-4 text-slate-700" />,
            active: currentHourPoint.phase === 'sorption',
          },
          {
            window: '06:00 – 09:00',
            title: '2. Diurnal Solar Thermal Desorption',
            desc: 'Selective black-chrome absorber seals chamber and heats sorbent bed above 65°C, releasing dense hot vapor.',
            icon: <Sun className="w-4 h-4 text-amber-600" />,
            active: currentHourPoint.phase === 'desorption',
          },
          {
            window: '10:00 – 16:00',
            title: '3. Peak Diurnal Biomimetic Condensation',
            desc: 'Stenocara beetle-inspired hydrophilic/superhydrophobic aluminum micro-channels nucleate and shed pure droplets.',
            icon: <Droplets className="w-4 h-4 text-sky-600" />,
            active: currentHourPoint.phase === 'condensation',
          },
          {
            window: '17:00 – 19:00',
            title: '4. Passive Solar Mineralization Flow',
            desc: 'Gravity manifold routes soft condensate through volcanic basalt & calcite media to reach 199 ppm Ca/Mg balance.',
            icon: <Zap className="w-4 h-4 text-emerald-600" />,
            active: currentHourPoint.phase === 'mineralization',
          },
        ].map((phase) => (
          <div
            key={phase.window}
            className={`rounded-xl p-4 border transition-colors ${
              phase.active ? 'bg-sky-50 border-sky-400' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-semibold text-slate-500">{phase.window}</span>
              {phase.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">{phase.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{phase.desc}</p>
          </div>
        ))}
      </section>

      {/* Interactive RH Sensitivity Curve Matrix */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Arid Relative Humidity (RH) Sensitivity Curve Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any ambient RH benchmark card to update the live 24-hour extraction simulation.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">Target ≥ 450 L/day</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {rhCurve.map((pt) => {
            const active = pt.rhPercent === selectedRh;
            return (
              <button
                key={pt.rhPercent}
                type="button"
                onClick={() => handleSelectRh(pt.rhPercent)}
                className={`text-left rounded-xl p-3.5 border transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-sky-400'
                }`}
              >
                <div className={`text-xs font-mono font-bold ${active ? 'text-sky-400' : 'text-sky-700'}`}>
                  {pt.rhPercent}% RH
                </div>
                <div className="text-lg font-bold font-mono tabular-nums mt-1">{pt.dailyYieldL} L</div>
                <div className={`text-[11px] font-mono ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {pt.vaporDensityGm3} g/m³
                </div>
                <div
                  className={`text-[11px] font-semibold mt-1.5 ${
                    pt.meets450Target
                      ? active
                        ? 'text-emerald-400'
                        : 'text-emerald-700'
                      : 'text-amber-500'
                  }`}
                >
                  {pt.meets450Target ? '≥ 450 L Validated' : 'Sub-450 L'}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
