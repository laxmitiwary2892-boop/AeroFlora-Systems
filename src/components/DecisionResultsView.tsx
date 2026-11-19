import React, { useMemo, useState } from 'react';
import { BookmarkPlus, CheckCircle2, Download, FileText } from 'lucide-react';
import { calculateFinancialROI } from '../lib/financialModel';
import { runEngineeringSimulation } from '../lib/thermodynamics';
import type {
  FarmerProfile,
  FinancialConfig,
  SavedScenario,
  SimulatorConfig,
} from '../types/aeroflora';

interface DecisionResultsViewProps {
  profile: FarmerProfile;
  simulatorConfig: SimulatorConfig;
  financialConfig: FinancialConfig;
  savedScenarios: SavedScenario[];
  onSaveScenario: (scenario: SavedScenario) => void;
  onOpenExecutiveReport: () => void;
}

export const DecisionResultsView: React.FC<DecisionResultsViewProps> = ({
  profile,
  simulatorConfig,
  financialConfig,
  savedScenarios,
  onSaveScenario,
  onOpenExecutiveReport,
}) => {
  const [scenarioName, setScenarioName] = useState(
    `${profile.district} ${simulatorConfig.towerCount}-Tower ${simulatorConfig.sorbentId}`
  );
  const [savedToast, setSavedToast] = useState(false);

  const sim = useMemo(() => runEngineeringSimulation(simulatorConfig), [simulatorConfig]);
  const roi = useMemo(() => calculateFinancialROI(financialConfig), [financialConfig]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;
    onSaveScenario({
      id: `scen-${Date.now()}`,
      name: scenarioName.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      district: profile.district,
      state: profile.state,
      towerCount: simulatorConfig.towerCount,
      sorbentId: simulatorConfig.sorbentId,
      dailyHarvestL: sim.totalArrayYieldDailyL,
      paybackMonths: roi.paybackMonths,
      netAnnualSavingsInr: roi.netAnnualSavingsInr,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2400);
  };

  const handleExportCsv = () => {
    const header = 'Scenario,District,State,Towers,Sorbent,Daily_Harvest_L,Payback_Months,Net_Annual_Savings_INR';
    const rows = savedScenarios.map((s) =>
      [
        `"${s.name}"`,
        s.district,
        s.state,
        s.towerCount,
        s.sorbentId,
        s.dailyHarvestL,
        s.paybackMonths,
        s.netAnnualSavingsInr,
      ].join(',')
    );
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aeroflora_saved_scenarios.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-sky-400 mb-1">
            Value Generation & Decision Recommendations
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Active Configuration Summary — {profile.district}, {profile.state}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {sim.isTargetMet
              ? `Recommended Deployment: ${simulatorConfig.towerCount} Mk-IV towers deliver ${sim.totalArrayYieldDailyL.toLocaleString('en-IN')} L/day with ${roi.paybackMonths}-month payback.`
              : `Yield Alert: Per-tower output (${sim.dailyYieldPerTowerL} L) is below ${simulatorConfig.validationTargetLPerDay} L target. Increase sorbent mass or collector core temperature.`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Scenarios CSV</span>
          </button>
          <button
            type="button"
            onClick={onOpenExecutiveReport}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold"
          >
            <FileText className="w-4 h-4" />
            <span>Open Executive Audit</span>
          </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <form
          onSubmit={handleSave}
          className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 self-start"
        >
          <h2 className="text-base font-bold text-slate-900">Save Current Scenario</h2>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
          />
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-2"
          >
            {savedToast ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <BookmarkPlus className="w-4 h-4" />}
            <span>{savedToast ? 'Scenario Saved' : 'Save Scenario to Matrix'}</span>
          </button>
        </form>

        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900">Saved Deployment Scenarios ({savedScenarios.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-semibold">Scenario</th>
                  <th className="py-3 px-4 font-semibold">Location</th>
                  <th className="py-3 px-4 font-semibold text-right">Towers</th>
                  <th className="py-3 px-4 font-semibold text-right">Daily Harvest</th>
                  <th className="py-3 px-4 font-semibold text-right">Payback</th>
                  <th className="py-3 px-4 font-semibold text-right">Annual Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {savedScenarios.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {s.district}, {s.state}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{s.towerCount}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-sky-700 tabular-nums">
                      {s.dailyHarvestL.toLocaleString('en-IN')} L
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">{s.paybackMonths} mo</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 tabular-nums">
                      ₹{s.netAnnualSavingsInr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
