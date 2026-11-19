import React from 'react';
import { ArrowRight, BookOpen, X } from 'lucide-react';

interface QuickGuideModalProps {
  open: boolean;
  onClose: () => void;
  onStartSimulatorTest: () => void;
}

const STEPS = [
  {
    num: '01',
    title: 'Profile Your Farm & Indian District Climate',
    detail:
      'Enter your plots in Farmer & My Farm, then inspect IMD 30-year RH/temperature normals and CGWB aquifer depth in Water Intelligence.',
  },
  {
    num: '02',
    title: 'Simulate MOF-801 Extraction & 24h Diurnal Cycle',
    detail:
      'Test sorbent mass, collector core temperature, and desert RH curves in the Engineering Simulator & 24h Biomimetic Engine.',
  },
  {
    num: '03',
    title: 'Balance Crop ETc & Hydrochemistry (SAR/RSC)',
    detail:
      'Compute exact FAO-56 water deficits across 15 Indian crops and verify volcanic basalt + calcite mineralization for safe drip irrigation.',
  },
  {
    num: '04',
    title: 'Generate PM-KUSUM ROI & Bankable PDF Dossier',
    detail:
      'Model 30–50% PM-KUSUM subsidies in Financial Planner & ROI, then print or export your audit dossier for NABARD/KCC appraisal.',
  },
];

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({
  open,
  onClose,
  onStartSimulatorTest,
}) => {
  if (!open) return null;

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold">AeroFlora Mk-IV Quick Guide & Testing Playbook</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close guide"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {STEPS.map((s) => (
            <div key={s.num} className="flex items-start gap-3.5 pb-3 border-b border-slate-100 last:border-b-0">
              <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-2 py-1">
                {s.num}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onStartSimulatorTest();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
            >
              <span>Try a Test Run Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
