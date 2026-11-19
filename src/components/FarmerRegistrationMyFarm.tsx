import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Sprout,
  Trash2,
  UserCheck,
} from 'lucide-react';
import { ALL_INDIAN_STATES, DISTRICT_CLIMATOLOGY, getDistrictsForState } from '../data/indianClimatology';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { INDIAN_CROPS, IRRIGATION_EFFICIENCY } from '../lib/fao56CropWater';
import type {
  FarmerProfile,
  FarmPlot,
  GrowthStageKey,
  IrrigationMethod,
  LanguageCode,
  WaterSourceType,
} from '../types/aeroflora';

interface FarmerRegistrationMyFarmProps {
  profile: FarmerProfile;
  plots: FarmPlot[];
  onUpdateProfile: (next: FarmerProfile) => void;
  onUpdatePlots: (next: FarmPlot[]) => void;
  onLogActivity: (category: 'farm', message: string) => void;
}

const SOIL_TYPES = [
  'Sandy Loam',
  'Black Cotton Soil',
  'Clay Loam',
  'Alluvial Soil',
  'Red Sandy Soil',
];

const WATER_SOURCES: { id: WaterSourceType; label: string }[] = [
  { id: 'deep_borewell', label: 'Deep Borewell (>150 m)' },
  { id: 'private_tanker', label: 'Private Water Tanker' },
  { id: 'open_dug_well', label: 'Open Dug Well' },
  { id: 'canal', label: 'Seasonal Canal Supply' },
  { id: 'rainwater_pond', label: 'Farm Retention Pond' },
];

export const FarmerRegistrationMyFarm: React.FC<FarmerRegistrationMyFarmProps> = ({
  profile,
  plots,
  onUpdateProfile,
  onUpdatePlots,
  onLogActivity,
}) => {
  const [expandedPlotId, setExpandedPlotId] = useState<string>(plots[0]?.id || '');
  const [savedToast, setSavedToast] = useState(false);

  const stateDistricts = useMemo(() => getDistrictsForState(profile.state), [profile.state]);
  const hasMappedDistricts = useMemo(
    () => DISTRICT_CLIMATOLOGY.some((d) => d.state.toLowerCase() === profile.state.toLowerCase()),
    [profile.state]
  );

  const summary = useMemo(() => {
    const totalAcres = plots.reduce((acc, p) => acc + (Number(p.areaAcres) || 0), 0);
    const totalHectares = totalAcres * 0.404686;
    const totalMonthlySpendInr = plots.reduce((acc, p) => acc + (Number(p.monthlyWaterSpendInr) || 0), 0);
    const totalStorageKl = plots.reduce((acc, p) => acc + (Number(p.storageTankCapacityL) || 0), 0) / 1000;
    return { totalAcres, totalHectares, totalMonthlySpendInr, totalStorageKl };
  }, [plots]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedToast(true);
    onLogActivity('farm', `Updated farmer dossier for ${profile.fullName} (${profile.village}, ${profile.district}).`);
    setTimeout(() => setSavedToast(false), 2600);
  };

  const handleAddPlot = () => {
    const newId = `plot-${Date.now()}`;
    const newPlot: FarmPlot = {
      id: newId,
      name: `New Orchard Block ${plots.length + 1}`,
      areaAcres: 1.5,
      cropId: 'pomegranate',
      cropVariety: 'Bhagwa',
      growthStage: 'development',
      soilType: 'Sandy Loam',
      irrigationMethod: 'drip',
      waterSource: 'deep_borewell',
      monthlyWaterSpendInr: 5000,
      storageTankCapacityL: 5000,
      dailyWaterAvailabilityL: 1200,
      hasLabWaterReport: false,
    };
    onUpdatePlots([...plots, newPlot]);
    setExpandedPlotId(newId);
    onLogActivity('farm', `Added new plot "${newPlot.name}" (${newPlot.areaAcres} acres).`);
  };

  const handleUpdatePlot = (id: string, patch: Partial<FarmPlot>) => {
    onUpdatePlots(plots.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const handleDeletePlot = (id: string) => {
    if (plots.length <= 1) return;
    const removed = plots.find((p) => p.id === id);
    const next = plots.filter((p) => p.id !== id);
    onUpdatePlots(next);
    if (expandedPlotId === id) {
      setExpandedPlotId(next[0]?.id || '');
    }
    if (removed) {
      onLogActivity('farm', `Removed plot "${removed.name}".`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Holding Summary Banner */}
      <section className="rounded-2xl bg-slate-900 text-white p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-sky-400 mb-1">
              Active Farm Holding · {profile.village}, {profile.blockTehsil}, {profile.district}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">{profile.fullName} — Farm Dossier</h1>
          </div>
          <div className="grid grid-cols-3 gap-6 text-right">
            <div>
              <div className="text-xs text-slate-400">Total Cultivated</div>
              <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {summary.totalAcres.toFixed(2)} Ac
              </div>
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                ({summary.totalHectares.toFixed(2)} Ha)
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Monthly Water Spend</div>
              <div className="text-lg font-bold font-mono text-amber-300 tabular-nums">
                ₹{summary.totalMonthlySpendInr.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-400">Tankers & Pumping</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Buffer Tank Storage</div>
              <div className="text-lg font-bold font-mono text-sky-400 tabular-nums">
                {summary.totalStorageKl.toFixed(1)} kL
              </div>
              <div className="text-xs text-slate-400">{plots.length} Active Plots</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Farmer Identification Form */}
        <form
          onSubmit={handleSaveProfile}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 self-start"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>Farmer Identification & Village Hierarchy</span>
            </h2>
            {savedToast && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profile.fullName}
                onChange={(e) => onUpdateProfile({ ...profile, fullName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number (+91)</label>
              <input
                type="tel"
                value={profile.mobile}
                onChange={(e) => onUpdateProfile({ ...profile, mobile: e.target.value })}
                placeholder="+91 98250 41120"
                className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Language</label>
              <select
                value={profile.language}
                onChange={(e) => onUpdateProfile({ ...profile, language: e.target.value as LanguageCode })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.nativeName} ({l.englishName})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => onUpdateProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State / UT</label>
              <select
                value={profile.state}
                onChange={(e) => {
                  const nextState = e.target.value;
                  const dists = getDistrictsForState(nextState);
                  const mapped = DISTRICT_CLIMATOLOGY.some(
                    (d) => d.state.toLowerCase() === nextState.toLowerCase()
                  );
                  onUpdateProfile({
                    ...profile,
                    state: nextState,
                    district: mapped ? dists[0].district : profile.district,
                  });
                }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {ALL_INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
              {hasMappedDistricts ? (
                <select
                  value={profile.district}
                  onChange={(e) => onUpdateProfile({ ...profile, district: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {stateDistricts.map((d) => (
                    <option key={d.district} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={profile.district}
                  onChange={(e) => onUpdateProfile({ ...profile, district: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Block / Tehsil</label>
              <input
                type="text"
                value={profile.blockTehsil}
                onChange={(e) => onUpdateProfile({ ...profile, blockTehsil: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Gram Panchayat</label>
              <input
                type="text"
                value={profile.village}
                onChange={(e) => onUpdateProfile({ ...profile, village: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-3">
            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.gpsEnabled}
                onChange={(e) => onUpdateProfile({ ...profile, gpsEnabled: e.target.checked })}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>Consent to store optional plot GPS coordinates for solar azimuth alignment</span>
            </label>

            {profile.gpsEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={profile.latitude}
                    onChange={(e) => onUpdateProfile({ ...profile, latitude: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={profile.longitude}
                    onChange={(e) => onUpdateProfile({ ...profile, longitude: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 tabular-nums"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-colors"
          >
            Save Farmer & Village Profile
          </button>
        </form>

        {/* Interactive Farm Plot Manager */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span>Registered Crop Plots ({plots.length})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure soil, drip efficiency, and water spend per plot. Syncs with Crop Planner & ROI.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddPlot}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Plot</span>
            </button>
          </div>

          {plots.map((plot) => {
            const isExpanded = expandedPlotId === plot.id;
            const cropSpec = INDIAN_CROPS.find((c) => c.id === plot.cropId) || INDIAN_CROPS[0];
            const hectares = (plot.areaAcres * 0.404686).toFixed(2);
            const effPct = Math.round(IRRIGATION_EFFICIENCY[plot.irrigationMethod].efficiency * 100);

            return (
              <div key={plot.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setExpandedPlotId(isExpanded ? '' : plot.id)}
                    className="flex-1 text-left min-w-0"
                  >
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                      <span>{cropSpec.name} ({plot.cropVariety})</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{plot.areaAcres} Ac ({hectares} Ha)</span>
                      <span aria-hidden="true">·</span>
                      <span>{effPct}% irrigation eff.</span>
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 truncate">{plot.name}</div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-xs font-mono font-semibold text-slate-700 tabular-nums">
                      ₹{plot.monthlyWaterSpendInr.toLocaleString('en-IN')}/mo
                    </span>
                    {plots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeletePlot(plot.id)}
                        aria-label={`Delete ${plot.name}`}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setExpandedPlotId(isExpanded ? '' : plot.id)}
                      aria-label={isExpanded ? 'Collapse plot' : 'Expand plot'}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-4 border-t border-slate-200 bg-slate-50/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Name</label>
                      <input
                        type="text"
                        value={plot.name}
                        onChange={(e) => handleUpdatePlot(plot.id, { name: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Area (Acres) — {hectares} Ha
                      </label>
                      <input
                        type="number"
                        min={0.25}
                        max={100}
                        step={0.25}
                        value={plot.areaAcres}
                        onChange={(e) => handleUpdatePlot(plot.id, { areaAcres: Number(e.target.value) })}
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Type</label>
                      <select
                        value={plot.cropId}
                        onChange={(e) => {
                          const nextCrop = INDIAN_CROPS.find((c) => c.id === e.target.value);
                          handleUpdatePlot(plot.id, {
                            cropId: e.target.value,
                            cropVariety: nextCrop?.varietyExample.split('/')[0].trim() || plot.cropVariety,
                          });
                        }}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      >
                        {INDIAN_CROPS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.hindiName})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Variety</label>
                      <input
                        type="text"
                        value={plot.cropVariety}
                        onChange={(e) => handleUpdatePlot(plot.id, { cropVariety: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Growth Stage</label>
                      <select
                        value={plot.growthStage}
                        onChange={(e) => handleUpdatePlot(plot.id, { growthStage: e.target.value as GrowthStageKey })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      >
                        <option value="initial">Initial (Bud / Emergence)</option>
                        <option value="development">Development (Vegetative / Bloom)</option>
                        <option value="mid_season">Mid-Season (Peak Fruit Fill)</option>
                        <option value="late_season">Late Season (Ripening)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Soil Type</label>
                      <select
                        value={plot.soilType}
                        onChange={(e) => handleUpdatePlot(plot.id, { soilType: e.target.value })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      >
                        {SOIL_TYPES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Irrigation Method</label>
                      <select
                        value={plot.irrigationMethod}
                        onChange={(e) =>
                          handleUpdatePlot(plot.id, { irrigationMethod: e.target.value as IrrigationMethod })
                        }
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      >
                        {Object.entries(IRRIGATION_EFFICIENCY).map(([key, spec]) => (
                          <option key={key} value={key}>
                            {spec.label} ({Math.round(spec.efficiency * 100)}%)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Water Source</label>
                      <select
                        value={plot.waterSource}
                        onChange={(e) => handleUpdatePlot(plot.id, { waterSource: e.target.value as WaterSourceType })}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
                      >
                        {WATER_SOURCES.map((ws) => (
                          <option key={ws.id} value={ws.id}>
                            {ws.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Water Spend (₹)</label>
                      <input
                        type="number"
                        min={0}
                        step={500}
                        value={plot.monthlyWaterSpendInr}
                        onChange={(e) =>
                          handleUpdatePlot(plot.id, { monthlyWaterSpendInr: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Storage Tank Capacity (L)
                      </label>
                      <input
                        type="number"
                        min={500}
                        step={500}
                        value={plot.storageTankCapacityL}
                        onChange={(e) =>
                          handleUpdatePlot(plot.id, { storageTankCapacityL: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Daily Existing Supply (L/day)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={100}
                        value={plot.dailyWaterAvailabilityL}
                        onChange={(e) =>
                          handleUpdatePlot(plot.id, { dailyWaterAvailabilityL: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 bg-white tabular-nums"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={plot.hasLabWaterReport}
                          onChange={(e) => handleUpdatePlot(plot.id, { hasLabWaterReport: e.target.checked })}
                          className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span>Lab hydrochemistry test report available (EC, SAR, Boron verified)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
