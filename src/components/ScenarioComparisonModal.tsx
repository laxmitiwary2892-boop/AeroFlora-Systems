import React from 'react';
import { CheckCircle2, Layers, X } from 'lucide-react';
import { calculateFinancialROI } from '../lib/financialModel';
import type { FinancialConfig } from '../types/aeroflora';

interface ScenarioComparisonModalProps {
  open: boolean;
  onClose: () => void;
  financialConfig: FinancialConfig;
  perTowerYieldL: number;
  onLoadTowers: (towerCount: number) => void;
}

export const ScenarioComparisonModal: React.FC<ScenarioComparisonModalProps> = ({
  open,
  onClose,
  financialConfig,
  perTowerYieldL,
  onLoadTowers,
}) => {
  if (!open) return null;

  const tiers = [
    {
      title: 'Status Quo Water Trucking',
      towers: 0,
      badge: 'Baseline Risk',
      dailyL: 0,
      netCapexInr: 0,
      paybackMonths: 0,
      fiveYearNetInr: -(financialConfig.tankersReplacedPerMonth * financialConfig.costPer5kLTankerInr * 12 * 5),
      summary: '100% exposure to summer tanker price spikes, high-salinity/boron groundwater, and diesel pump outages.',
    },
    {
      title: '2-Tower Tactical Buffer',
      towers: 2,
      badge: 'Starter Block',
      ...(() => {
        const res = calculateFinancialROI({
          ...financialConfig,
          towerCount: 2,
          tankersReplacedPerMonth: Math.max(4, Math.round(financialConfig.tankersReplacedPerMonth * 0.65)),
        });
        return {
          dailyL: perTowerYieldL * 2,
          netCapexInr: res.netCapexInr,
          paybackMonths: res.paybackMonths,
          fiveYearNetInr: res.fiveYearCumulativeNetInr,
        };
      })(),
      summary: 'Covers emergency flowering/fruit-set stress for up to 1.5 acres of drip-irrigated pomegranate.',
    },
    {
      title: '3-Tower Optimal Deployment',
      towers: 3,
      badge: 'Recommended',
      ...(() => {
        const res = calculateFinancialROI({
          ...financialConfig,
          towerCount: 3,
        });
        return {
          dailyL: perTowerYieldL * 3,
          netCapexInr: res.netCapexInr,
          paybackMonths: res.paybackMonths,
          fiveYearNetInr: res.fiveYearCumulativeNetInr,
        };
      })(),
      summary: 'Balanced CapEx-to-yield sweet spot eliminating 80%+ summer tanker dependence for 2.5–3.0 acre orchards.',
    },
    {
      title: '5-Tower Full Independence',
      towers: 5,
      badge: 'Estate / FPO Scale',
      ...(() => {
        const res = calculateFinancialROI({
          ...financialConfig,
          towerCount: 5,
          tankersReplacedPerMonth: Math.min(30, financialConfig.tankersReplacedPerMonth + 6),
        });
        return {
          dailyL: perTowerYieldL * 5,
          netCapexInr: res.netCapexInr,
          paybackMonths: res.paybackMonths,
          fiveYearNetInr: res.fiveYearCumulativeNetInr,
        };
      })(),
      summary: 'Full off-grid water sovereignty with surplus volume for communal FPO water token credits.',
    },
  ];

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-sky-400" />
            <div>
              <h2 className="text-sm font-bold">Array Sizing & 4-Tier Economic Trade-Off Matrix</h2>
              <p className="text-[11px] text-slate-300">
                Computed at {financialConfig.subsidyPercent}% PM-KUSUM subsidy and ₹
                {financialConfig.costPer5kLTankerInr.toLocaleString('en-IN')}/tanker
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close scenario comparison"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiers.map((tier) => {
            const isRecommended = tier.badge === 'Recommended';
            return (
              <div
                key={tier.title}
                className={`rounded-xl p-5 border flex flex-col justify-between ${
                  isRecommended
                    ? 'bg-slate-900 text-white border-sky-500'
                    : 'bg-slate-50 text-slate-900 border-slate-200'
                }`}
              >
                <div>
                  <div
                    className={`text-[11px] font-bold mb-1 ${
                      isRecommended ? 'text-sky-400' : 'text-slate-500'
                    }`}
                  >
                    {tier.badge}
                  </div>
                  <h3 className="text-base font-bold mb-3">{tier.title}</h3>

                  <div className="space-y-2.5 text-xs border-t border-slate-700/20 pt-3">
                    <div className="flex justify-between">
                      <span className={isRecommended ? 'text-slate-400' : 'text-slate-500'}>Daily AWH Yield</span>
                      <span className="font-mono font-bold tabular-nums">
                        {tier.dailyL.toLocaleString('en-IN')} L/d
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isRecommended ? 'text-slate-400' : 'text-slate-500'}>Net CapEx</span>
                      <span className="font-mono font-bold tabular-nums">
                        ₹{tier.netCapexInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isRecommended ? 'text-slate-400' : 'text-slate-500'}>Payback</span>
                      <span className="font-mono font-bold tabular-nums">
                        {tier.towers === 0 ? 'Never' : `${tier.paybackMonths} mo`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isRecommended ? 'text-slate-400' : 'text-slate-500'}>5-Yr Net Position</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          tier.fiveYearNetInr >= 0
                            ? isRecommended
                              ? 'text-emerald-400'
                              : 'text-emerald-700'
                            : 'text-rose-600'
                        }`}
                      >
                        ₹{tier.fiveYearNetInr.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <p
                    className={`text-[11px] leading-relaxed mt-3 ${
                      isRecommended ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {tier.summary}
                  </p>
                </div>

                {tier.towers > 0 ? (
                  <button
                    type="button"
                    onClick={() => {
                      onLoadTowers(tier.towers);
                      onClose();
                    }}
                    className={`mt-5 w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isRecommended
                        ? 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Load {tier.towers} Towers</span>
                  </button>
                ) : (
                  <div className="mt-5 text-center text-[11px] font-medium text-rose-600 py-2">
                    Unmitigated Drought Exposure
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
