import React, { useMemo } from 'react';
import { Download, Printer, X } from 'lucide-react';
import { calculateFinancialROI } from '../lib/financialModel';
import { runEngineeringSimulation } from '../lib/thermodynamics';
import { analyzeWaterQuality } from '../lib/waterQualityAnalysis';
import type {
  FarmerProfile,
  FarmPlot,
  FinancialConfig,
  SimulatorConfig,
  WaterQualityInputs,
} from '../types/aeroflora';

interface ExecutiveReportModalProps {
  open: boolean;
  onClose: () => void;
  farmerProfile: FarmerProfile;
  plots: FarmPlot[];
  simulatorConfig: SimulatorConfig;
  waterQuality: WaterQualityInputs;
  financialConfig: FinancialConfig;
}

export const ExecutiveReportModal: React.FC<ExecutiveReportModalProps> = ({
  open,
  onClose,
  farmerProfile,
  plots,
  simulatorConfig,
  waterQuality,
  financialConfig,
}) => {
  const sim = useMemo(() => runEngineeringSimulation(simulatorConfig), [simulatorConfig]);
  const wq = useMemo(() => analyzeWaterQuality(waterQuality), [waterQuality]);
  const roi = useMemo(() => calculateFinancialROI(financialConfig), [financialConfig]);

  if (!open) return null;

  const totalAcres = plots.reduce((acc, p) => acc + p.areaAcres, 0);

  const handleDownloadJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      system: 'AeroFlora Systems Mk-IV OS',
      farmerProfile,
      plots,
      simulatorConfig,
      technicalOutput: sim,
      waterQuality: { inputs: waterQuality, analysis: wq },
      financialProForma: roi,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeroflora_audit_${farmerProfile.district.toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="no-print px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold">Executive Feasibility Audit & Bankable Dossier (A4)</h2>
            <p className="text-[11px] text-slate-300">
              {farmerProfile.fullName} · {farmerProfile.district}, {farmerProfile.state}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download JSON</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close report"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable A4 Dossier Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-slate-900 text-xs">
          <div className="border-b border-slate-300 pb-4 flex items-start justify-between">
            <div>
              <div className="text-xs font-semibold text-sky-700">AEROFLORA SYSTEMS · MK-IV AUDIT DOSSIER</div>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                Autonomous Solar AWH & Irrigation Feasibility Report
              </h1>
              <p className="text-slate-600 mt-1">
                Prepared for {farmerProfile.fullName} · {farmerProfile.village}, {farmerProfile.blockTehsil},{' '}
                {farmerProfile.district}, {farmerProfile.state}
              </p>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                Portal: https://aero-flora-systems-l1f1-gold.vercel.app
              </p>
            </div>
            <div className="text-right font-mono">
              <div className="text-slate-500">Validation Status</div>
              <div
                className={`text-sm font-bold ${
                  sim.isTargetMet ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {sim.isTargetMet ? 'VALIDATED (≥450 L/tower)' : 'BELOW TARGET'}
              </div>
            </div>
          </div>

          {/* 1. Customer Farm Baseline */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. Customer Farm Holding Baseline</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div>
                <div className="text-slate-500">Total Cultivated Area</div>
                <div className="font-mono font-bold text-sm tabular-nums">{totalAcres.toFixed(2)} Acres</div>
              </div>
              <div>
                <div className="text-slate-500">Registered Plots</div>
                <div className="font-mono font-bold text-sm tabular-nums">{plots.length} Active Blocks</div>
              </div>
              <div>
                <div className="text-slate-500">Monthly Water Spend</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  ₹{plots.reduce((a, p) => a + p.monthlyWaterSpendInr, 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-slate-500">GPS Coordinates</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  {farmerProfile.latitude.toFixed(3)}°N, {farmerProfile.longitude.toFixed(3)}°E
                </div>
              </div>
            </div>
          </section>

          {/* 2. Technical Extraction Output */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">2. Technical Atmospheric Extraction Output</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div>
                <div className="text-slate-500">Sorbent Chemistry</div>
                <div className="font-mono font-bold text-sm">{simulatorConfig.sorbentId}</div>
              </div>
              <div>
                <div className="text-slate-500">Per-Tower Harvest</div>
                <div className="font-mono font-bold text-sm tabular-nums">{sim.dailyYieldPerTowerL} L/day</div>
              </div>
              <div>
                <div className="text-slate-500">Fleet Harvest ({simulatorConfig.towerCount} towers)</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  {sim.totalArrayYieldDailyL.toLocaleString('en-IN')} L/day
                </div>
              </div>
              <div>
                <div className="text-slate-500">Annual Volume</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  {sim.totalArrayYieldAnnualKl} kL/year
                </div>
              </div>
            </div>
          </section>

          {/* 3. Solar Mineralization Profile */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">3. Solar Mineralization & Hydrochemistry Profile</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div>
                <div className="text-slate-500">Suitability</div>
                <div className="font-bold text-sm text-emerald-700">{wq.suitability}</div>
              </div>
              <div>
                <div className="text-slate-500">EC / TDS</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  {wq.ecDsM} dS/m ({wq.tdsPpm} ppm)
                </div>
              </div>
              <div>
                <div className="text-slate-500">SAR / RSC</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  {wq.sar} / {wq.rscMeqL} meq/L
                </div>
              </div>
              <div>
                <div className="text-slate-500">pH</div>
                <div className="font-mono font-bold text-sm tabular-nums">{waterQuality.ph}</div>
              </div>
              <div>
                <div className="text-slate-500">Boron</div>
                <div className="font-mono font-bold text-sm tabular-nums">{waterQuality.boronMgL} mg/L</div>
              </div>
            </div>
          </section>

          {/* 4. 5-Year Financial Pro-Forma */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              4. 5-Year Financial Pro-Forma ({roi.modelSummary})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-3">
              <div>
                <div className="text-slate-500">Net CapEx</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  ₹{roi.netCapexInr.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Payback Period</div>
                <div className="font-mono font-bold text-sm tabular-nums">{roi.paybackMonths} months</div>
              </div>
              <div>
                <div className="text-slate-500">5-Year NPV (@8%)</div>
                <div className="font-mono font-bold text-sm tabular-nums">
                  ₹{roi.fiveYearNpvInr.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-slate-500">Internal Rate of Return</div>
                <div className="font-mono font-bold text-sm tabular-nums">{roi.irrPercent}% IRR</div>
              </div>
            </div>

            <table className="w-full text-left border border-slate-200 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200">
                  <th className="py-2 px-3">Year</th>
                  <th className="py-2 px-3 text-right">CapEx</th>
                  <th className="py-2 px-3 text-right">O&M</th>
                  <th className="py-2 px-3 text-right">Gross Savings</th>
                  <th className="py-2 px-3 text-right">Net Cashflow</th>
                  <th className="py-2 px-3 text-right">Cumulative</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {roi.cashflows.map((cf) => (
                  <tr key={cf.year}>
                    <td className="py-2 px-3 font-medium">{cf.label}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      ₹{cf.capexOrLeaseInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      ₹{cf.maintenanceInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums">
                      ₹{cf.grossSavingsInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold tabular-nums">
                      ₹{cf.netCashflowInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold tabular-nums">
                      ₹{cf.cumulativeCashflowInr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
};
