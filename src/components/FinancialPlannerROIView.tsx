import React, { useMemo } from 'react';
import { Banknote, Building2, FileSpreadsheet, Landmark, TrendingUp } from 'lucide-react';
import { calculateFinancialROI } from '../lib/financialModel';
import type { AcquisitionModel, FinancialConfig, SubsidyTier } from '../types/aeroflora';

interface FinancialPlannerROIViewProps {
  config: FinancialConfig;
  onChangeConfig: (next: FinancialConfig) => void;
  onOpenBankableProForma: () => void;
}

const MODELS: { id: AcquisitionModel; title: string; subtitle: string }[] = [
  {
    id: 'direct_purchase',
    title: 'Direct Farmer Purchase',
    subtitle: 'Full ownership · Eligible for 30–50% PM-KUSUM / MIDH subsidy',
  },
  {
    id: 'water_as_a_service',
    title: 'Solar Water-as-a-Service',
    subtitle: '20% refundable deposit + ₹2,000/tower/mo lease',
  },
  {
    id: 'fpo_cooperative',
    title: 'FPO Cooperative Shared Array',
    subtitle: '10-farmer pooled share · 10% bulk CapEx discount + subsidy',
  },
];

const SUBSIDY_TIERS: { tier: SubsidyTier; label: string; note: string }[] = [
  { tier: 0, label: '0% Commercial', note: 'Standard private purchase' },
  { tier: 30, label: '30% PM-KUSUM B', note: 'Central MNRE Solar Off-Grid Grant' },
  { tier: 50, label: '50% PM-KUSUM + State', note: 'Arid Horticulture Top-Up (RJ/GJ/MH)' },
];

export const FinancialPlannerROIView: React.FC<FinancialPlannerROIViewProps> = ({
  config,
  onChangeConfig,
  onOpenBankableProForma,
}) => {
  const roi = useMemo(() => calculateFinancialROI(config), [config]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Indian Agri-Finance, PM-KUSUM Grants & Water Tanker Displacement</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">
            Financial Planner, Subsidies & 5-Year ROI Pro-Forma
          </h1>
        </div>
        <button
          type="button"
          onClick={onOpenBankableProForma}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-sky-400" />
          <span>Generate Bankable Pro-Forma</span>
        </button>
      </section>

      {/* Acquisition Model & Subsidy Selectors */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>1. Acquisition Model</span>
          </h2>
          <div className="space-y-2.5">
            {MODELS.map((m) => {
              const active = config.acquisitionModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeConfig({ ...config, acquisitionModel: m.id })}
                  className={`w-full text-left rounded-xl p-3.5 border transition-colors ${
                    active
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-sky-400'
                  }`}
                >
                  <div className="text-xs font-bold">{m.title}</div>
                  <div className={`text-[11px] mt-0.5 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                    {m.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-emerald-600" />
            <span>2. PM-KUSUM & State Horticulture Subsidy</span>
          </h2>
          <div className="space-y-2.5">
            {SUBSIDY_TIERS.map((s) => {
              const active = config.subsidyPercent === s.tier;
              const disabled = config.acquisitionModel === 'water_as_a_service';
              return (
                <button
                  key={s.tier}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChangeConfig({ ...config, subsidyPercent: s.tier })}
                  className={`w-full text-left rounded-xl p-3.5 border transition-colors disabled:opacity-45 ${
                    active && !disabled
                      ? 'bg-emerald-950 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-emerald-400'
                  }`}
                >
                  <div className="text-xs font-bold">{s.label}</div>
                  <div
                    className={`text-[11px] mt-0.5 ${
                      active && !disabled ? 'text-emerald-200' : 'text-slate-500'
                    }`}
                  >
                    {s.note}
                  </div>
                </button>
              );
            })}
          </div>
          {config.acquisitionModel === 'water_as_a_service' && (
            <p className="text-[11px] text-amber-700">
              Capital subsidies apply to direct or FPO asset ownership; Lease mode uses a 20% refundable deposit.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
            Deployment & Avoided Cost Inputs
          </h2>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Tower Units</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">{config.towerCount} towers</span>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={config.towerCount}
              onChange={(e) => onChangeConfig({ ...config, towerCount: Number(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Private Water Tankers Replaced / Mo</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {config.tankersReplacedPerMonth} tankers
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={config.tankersReplacedPerMonth}
              onChange={(e) =>
                onChangeConfig({ ...config, tankersReplacedPerMonth: Number(e.target.value) })
              }
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Cost per 5,000 L Tanker</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                ₹{config.costPer5kLTankerInr.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={800}
              max={2800}
              step={50}
              value={config.costPer5kLTankerInr}
              onChange={(e) => onChangeConfig({ ...config, costPer5kLTankerInr: Number(e.target.value) })}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Avoided Diesel Pumping / Mo</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                ₹{config.avoidedDieselPerMonthInr.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={6000}
              step={100}
              value={config.avoidedDieselPerMonthInr}
              onChange={(e) =>
                onChangeConfig({ ...config, avoidedDieselPerMonthInr: Number(e.target.value) })
              }
              className="w-full accent-sky-600"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-sky-600" />
              <span>NABARD & KCC Credit Eligibility</span>
            </div>
            <p className="text-sky-800 leading-relaxed">
              Eligible under NABARD Dairy/Horticulture Infrastructure Fund & Kisan Credit Card (KCC) allied asset
              financing at 4%–7% interest subvention.
            </p>
          </div>
        </div>

        {/* Summary KPIs + 5-Year Pro-Forma Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6">
            <div className="text-xs text-sky-400 font-medium mb-1">{roi.modelSummary}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
              <div>
                <div className="text-xs text-slate-400">Net CapEx (Post-Grant)</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums mt-0.5">
                  ₹{roi.netCapexInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
                  Grant: -₹{roi.subsidyAmountInr.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Simple Payback</div>
                <div className="text-xl font-bold font-mono text-sky-400 tabular-nums mt-0.5">
                  {roi.paybackMonths >= 999 ? 'N/A' : `${roi.paybackMonths} mo`}
                </div>
                <div className="text-[11px] text-slate-400">
                  {(roi.paybackMonths / 12).toFixed(1)} years
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-400">Net Annual Savings</div>
                <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums mt-0.5">
                  ₹{roi.netAnnualSavingsInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-400">After O&M</div>
              </div>
              <div>
                <div className="text-xs text-slate-400">5-Yr NPV (@8%) · IRR</div>
                <div className="text-xl font-bold font-mono text-cyan-300 tabular-nums mt-0.5">
                  ₹{roi.fiveYearNpvInr.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-emerald-400 font-mono tabular-nums">
                  IRR: {roi.irrPercent}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">5-Year Cashflow Pro-Forma (INR)</h3>
              <span className="text-xs text-slate-500">4% annual tanker inflation · 8% discount rate</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <th className="py-3 px-4 font-semibold">Period</th>
                    <th className="py-3 px-4 font-semibold text-right">CapEx / Deposit</th>
                    <th className="py-3 px-4 font-semibold text-right">O&M / Mineral Bed</th>
                    <th className="py-3 px-4 font-semibold text-right">Gross Savings</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Cashflow</th>
                    <th className="py-3 px-4 font-semibold text-right">Cumulative</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roi.cashflows.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{row.label}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-slate-700">
                        {row.capexOrLeaseInr !== 0
                          ? `₹${row.capexOrLeaseInr.toLocaleString('en-IN')}`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-rose-700">
                        {row.maintenanceInr !== 0
                          ? `₹${row.maintenanceInr.toLocaleString('en-IN')}`
                          : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums text-emerald-700">
                        {row.grossSavingsInr !== 0
                          ? `+₹${row.grossSavingsInr.toLocaleString('en-IN')}`
                          : '—'}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-semibold tabular-nums ${
                          row.netCashflowInr >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        ₹{row.netCashflowInr.toLocaleString('en-IN')}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                          row.cumulativeCashflowInr >= 0 ? 'text-slate-900' : 'text-amber-700'
                        }`}
                      >
                        ₹{row.cumulativeCashflowInr.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
