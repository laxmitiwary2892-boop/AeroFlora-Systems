import React, { useMemo, useState } from 'react';
import { CloudSun, Database, MapPin, RefreshCw, Sun, Thermometer } from 'lucide-react';
import {
  DISTRICT_CLIMATOLOGY,
  getDistrictClimatology,
  getDistrictsForState,
  type SeasonKey,
} from '../data/indianClimatology';
import { absoluteHumidityGm3, generate24HourBiomimeticCycle } from '../lib/thermodynamics';

interface WaterIntelligenceViewProps {
  stateName: string;
  districtName: string;
  onSelectLocation: (state: string, district: string) => void;
  onSyncToSimulator: (params: {
    rhPercent: number;
    tempC: number;
    solarKwhM2: number;
    district: string;
    state: string;
  }) => void;
}

const UNIQUE_STATES = Array.from(new Set(DISTRICT_CLIMATOLOGY.map((d) => d.state)));

const SEASONS: { key: SeasonKey; label: string; subtitle: string }[] = [
  { key: 'summer', label: 'Summer / Zaid', subtitle: 'Peak Water Stress (Mar–Jun)' },
  { key: 'monsoon', label: 'Monsoon / Kharif', subtitle: 'Southwest Monsoon (Jul–Oct)' },
  { key: 'winter', label: 'Winter / Rabi', subtitle: 'Cool Dry Diurnal (Nov–Feb)' },
];

export const WaterIntelligenceView: React.FC<WaterIntelligenceViewProps> = ({
  stateName,
  districtName,
  onSelectLocation,
  onSyncToSimulator,
}) => {
  const [season, setSeason] = useState<SeasonKey>('summer');
  const [syncedFlash, setSyncedFlash] = useState(false);

  const climate = useMemo(
    () => getDistrictClimatology(stateName, districtName),
    [stateName, districtName]
  );
  const availableDistricts = useMemo(() => getDistrictsForState(climate.state), [climate.state]);
  const snapshot = climate.seasons[season];

  const dayVaporDensity = useMemo(
    () => absoluteHumidityGm3(snapshot.dayTempC, snapshot.rhPercent).toFixed(2),
    [snapshot]
  );
  const nightRhEst = Math.min(92, snapshot.rhPercent + 22);
  const nightVaporDensity = useMemo(
    () => absoluteHumidityGm3(snapshot.nightTempC, nightRhEst).toFixed(2),
    [snapshot.nightTempC, nightRhEst]
  );

  const diurnalRows = useMemo(
    () => generate24HourBiomimeticCycle(snapshot.rhPercent, snapshot.dayTempC, 472),
    [snapshot.rhPercent, snapshot.dayTempC]
  );

  const handleSync = () => {
    onSyncToSimulator({
      rhPercent: snapshot.rhPercent,
      tempC: snapshot.dayTempC,
      solarKwhM2: snapshot.solarKwhM2,
      district: climate.district,
      state: climate.state,
    });
    setSyncedFlash(true);
    setTimeout(() => setSyncedFlash(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Header & District Selector */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="text-xs font-medium text-sky-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>IMD 30-Year Climatology & CGWB Aquifer Intelligence</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              {climate.district}, {climate.state} — {climate.agroClimaticZone}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={climate.state}
              onChange={(e) => {
                const nextState = e.target.value;
                const dists = getDistrictsForState(nextState);
                onSelectLocation(nextState, dists[0].district);
              }}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white"
            >
              {UNIQUE_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={climate.district}
              onChange={(e) => onSelectLocation(climate.state, e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white"
            >
              {availableDistricts.map((d) => (
                <option key={d.district} value={d.district}>
                  {d.district}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSync}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{syncedFlash ? 'Synced to Simulator' : 'Sync to Simulator'}</span>
            </button>
          </div>
        </div>

        {/* Season Selector Tabs */}
        <div className="pt-5 flex flex-wrap gap-2">
          {SEASONS.map((s) => {
            const active = season === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSeason(s.key)}
                className={`px-4 py-2.5 rounded-xl text-left border transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs font-bold">{s.label}</div>
                <div className={`text-[11px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                  {s.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Season KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-5 mt-5 border-t border-slate-200">
          <div>
            <div className="text-xs text-slate-500">Daytime Ambient RH</div>
            <div className="text-xl font-bold font-mono text-sky-700 tabular-nums mt-0.5">
              {snapshot.rhPercent}%
            </div>
            <div className="text-[11px] text-slate-500">Nocturnal est. {nightRhEst}%</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Day / Night Temp</div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {snapshot.dayTempC}° / {snapshot.nightTempC}°
            </div>
            <div className="text-[11px] text-slate-500">
              ΔT {(snapshot.dayTempC - snapshot.nightTempC).toFixed(1)}°C swing
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Solar Insolation</div>
            <div className="text-xl font-bold font-mono text-amber-600 tabular-nums mt-0.5">
              {snapshot.solarKwhM2}
            </div>
            <div className="text-[11px] text-slate-500">kWh/m²/day</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Vapor Density (Tetens)</div>
            <div className="text-xl font-bold font-mono text-emerald-700 tabular-nums mt-0.5">
              {dayVaporDensity} <span className="text-xs font-normal">g/m³</span>
            </div>
            <div className="text-[11px] text-slate-500">Night: {nightVaporDensity} g/m³</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">CGWB Aquifer Depth</div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.waterTableDepthM} m
            </div>
            <div className="text-[11px] font-semibold text-rose-600">{climate.aquiferCategory}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Annual Monsoon</div>
            <div className="text-xl font-bold font-mono text-slate-900 tabular-nums mt-0.5">
              {climate.monsoonRainfallMm} mm
            </div>
            <div className="text-[11px] text-sky-700 font-medium">{climate.awhSuitability} AWH</div>
          </div>
        </div>
      </section>

      {/* 24-Hour Micro-Climate Diurnal Trajectory Table + Provenance Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-sky-600" />
                <span>24-Hour Micro-Climate Diurnal Trajectory</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hourly vapor density (Tetens equation) and MOF-801 phase windows for {climate.district}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">3-hour checkpoints</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-semibold">Hour (IST)</th>
                  <th className="py-3 px-4 font-semibold">Diurnal Phase</th>
                  <th className="py-3 px-4 font-semibold text-right">Ambient Temp</th>
                  <th className="py-3 px-4 font-semibold text-right">RH (%)</th>
                  <th className="py-3 px-4 font-semibold text-right">Vapor (g/m³)</th>
                  <th className="py-3 px-4 font-semibold text-right">Harvest Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {diurnalRows
                  .filter((_, idx) => idx % 3 === 0)
                  .map((row) => (
                    <tr key={row.hour} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900 tabular-nums">
                        {row.label}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700">{row.phaseTitle}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-800 tabular-nums">
                        {row.ambientTempC}°C
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-sky-700 tabular-nums">
                        {row.ambientRhPercent}%
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-700 tabular-nums">
                        {row.absoluteHumidityGm3}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {row.extractionRateLPerHr} L/hr
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
              <Database className="w-4 h-4 text-sky-600" />
              <span>Data Transparency & Provenance</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Climatological baselines combine India Meteorological Department (IMD) 30-year gridded temperature/RH
              normals with Central Ground Water Board (CGWB) dynamic groundwater block categorizations.
            </p>
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Psychrometric Model</span>
                <span className="font-mono text-slate-800">Tetens + Ideal Gas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Solar Radiation Baseline</span>
                <span className="font-mono text-slate-800">MNRE / NREL India</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aquifer Classification</span>
                <span className="font-mono text-slate-800">CGWB 2024 Assessment</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
              <CloudSun className="w-4 h-4" />
              <span>District Feasibility Summary</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{climate.feasibilityNote}</p>
            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div className="font-semibold text-white mb-1 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Horticultural Focus</span>
              </div>
              <p>{climate.primaryCrops.join(' · ')}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
