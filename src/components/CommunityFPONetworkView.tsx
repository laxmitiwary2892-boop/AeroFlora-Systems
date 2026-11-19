import React, { useState } from 'react';
import { Bell, CheckCircle2, Coins, Droplets, Users } from 'lucide-react';
import type { FarmPlot } from '../types/aeroflora';

interface CommunityFPONetworkViewProps {
  plots: FarmPlot[];
  tokenBalanceLitres: number;
  onRedeemTokens: (plotName: string, volumeLitres: number) => void;
}

export const CommunityFPONetworkView: React.FC<CommunityFPONetworkViewProps> = ({
  plots,
  tokenBalanceLitres,
  onRedeemTokens,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>(plots[0]?.id || '');
  const [redeemVolume, setRedeemVolume] = useState<number>(Math.min(1500, tokenBalanceLitres || 500));
  const [dispatchToast, setDispatchToast] = useState<string | null>(null);

  const selectedPlot = plots.find((p) => p.id === selectedPlotId) || plots[0];

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (redeemVolume <= 0 || redeemVolume > tokenBalanceLitres || !selectedPlot) return;
    onRedeemTokens(selectedPlot.name, redeemVolume);
    setDispatchToast(
      `Automated 05:00 AM solar manifold valve dispatch scheduled: ${redeemVolume.toLocaleString('en-IN')} L to ${selectedPlot.name}.`
    );
    setRedeemVolume(Math.min(1000, Math.max(0, tokenBalanceLitres - redeemVolume)));
    setTimeout(() => setDispatchToast(null), 4500);
  };

  return (
    <div className="space-y-6">
      {/* FPO Cooperative Header */}
      <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-sky-400 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>FPO Shared Atmospheric Water Cooperative</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Banaskantha Arid Farmers Producer Co. Ltd.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Pooled 6-tower array feeding a 40 kL insulated communal sump with fair-share digital water tokens.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 text-right shrink-0">
            <div>
              <div className="text-xs text-slate-400">Member Farmers</div>
              <div className="text-xl font-bold font-mono tabular-nums text-white">42</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Shared Towers</div>
              <div className="text-xl font-bold font-mono tabular-nums text-sky-400">6</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Communal Storage</div>
              <div className="text-xl font-bold font-mono tabular-nums text-cyan-300">40 kL</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Your Token Balance</div>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
                {tokenBalanceLitres.toLocaleString('en-IN')} L
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Redeem Communal Water Tokens */}
        <form
          onSubmit={handleDispatch}
          className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Redeem Communal Water Tokens</span>
            </h2>
            <span className="text-xs font-mono font-semibold text-emerald-700 tabular-nums">
              Available: {tokenBalanceLitres.toLocaleString('en-IN')} L
            </span>
          </div>

          {dispatchToast && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{dispatchToast}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Destination Farm Plot
            </label>
            <select
              value={selectedPlot?.id || ''}
              onChange={(e) => setSelectedPlotId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-slate-300 bg-white"
            >
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.areaAcres} Acres)
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Dispatch Volume</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {redeemVolume.toLocaleString('en-IN')} L
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, tokenBalanceLitres)}
              step={100}
              value={redeemVolume}
              onChange={(e) => setRedeemVolume(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <button
            type="submit"
            disabled={redeemVolume <= 0 || tokenBalanceLitres <= 0}
            className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Droplets className="w-4 h-4" />
            <span>Schedule 05:00 AM Solar Manifold Valve Dispatch</span>
          </button>
        </form>

        {/* KVK & FPO Agronomic Bulletin Board */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
            <Bell className="w-4 h-4 text-sky-600" />
            <span>KVK & FPO Agronomic Bulletin Board</span>
          </h2>

          <div className="space-y-3">
            {[
              {
                tag: 'Urgent Moisture Alert · KVK Deesa',
                title: 'Mrig Bahar Pomegranate Fruit-Set Deficit Window',
                body: 'Daytime RH expected at 21%–24% for next 9 days. Prioritize mineralized AWH drip pulses at 05:30 AM to prevent flower drop.',
                date: 'Today · 07:30 AM',
              },
              {
                tag: 'FPO Maintenance Notice',
                title: 'Communal Manifold Calcite Bed Flush Completed',
                body: 'Shared 40 kL reservoir mineralization cartridge inspected; outlet water verified at 198 ppm TDS and pH 7.55.',
                date: 'Yesterday · 04:15 PM',
              },
              {
                tag: 'PM-KUSUM Cluster Subsidy',
                title: 'District Horticulture Officer Verification Camp',
                body: 'Bring 7/12 land extract and Aadhaar-linked bank passbook to FPO Bhildi office for 50% cluster grant sign-off.',
                date: '2 days ago',
              },
            ].map((item) => (
              <article key={item.title} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                  <span className="font-semibold text-sky-700">{item.tag}</span>
                  <span>{item.date}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
