import React from 'react';
import { Download, FileCheck2, FileSpreadsheet, FileText, Printer } from 'lucide-react';
import { generate24HourBiomimeticCycle } from '../lib/thermodynamics';
import type { FarmerProfile, SimulatorConfig } from '../types/aeroflora';

interface ReportsDocumentsViewProps {
  profile: FarmerProfile;
  simulatorConfig: SimulatorConfig;
  onOpenExecutiveReport: () => void;
  onLogReportAction: (msg: string) => void;
}

export const ReportsDocumentsView: React.FC<ReportsDocumentsViewProps> = ({
  profile,
  simulatorConfig,
  onOpenExecutiveReport,
  onLogReportAction,
}) => {
  const handleDownloadCsv = () => {
    const rows = generate24HourBiomimeticCycle(
      simulatorConfig.ambientRhPercent,
      simulatorConfig.ambientTempC,
      472
    );
    const header = [
      'Hour_IST',
      'Phase',
      'Ambient_Temp_C',
      'Ambient_RH_Pct',
      'Vapor_Density_gm3',
      'Sorbent_Loading_Pct',
      'Core_Temp_C',
      'Extraction_Rate_L_hr',
      'Cumulative_L',
    ].join(',');

    const lines = rows.map((r) =>
      [
        r.label,
        `"${r.phaseTitle}"`,
        r.ambientTempC,
        r.ambientRhPercent,
        r.absoluteHumidityGm3,
        r.sorbentLoadingPercent,
        r.coreTempC,
        r.extractionRateLPerHr,
        r.cumulativeHarvestL,
      ].join(',')
    );

    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aeroflora_24h_telemetry_${profile.district.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onLogReportAction(`Exported 24h thermodynamic telemetry CSV for ${profile.district}.`);
  };

  const templates = [
    {
      title: 'Detailed Project Report (DPR) for Bank Loans (NABARD / KCC)',
      code: 'DPR-NABARD-MK4',
      summary:
        'Complete 5-year pro-forma cashflow, PM-KUSUM Component B subsidy computation, land holding dossier, and IRR/NPV table formatted for Rural Bank & KCC branch appraisal.',
      icon: <FileSpreadsheet className="w-5 h-5 text-emerald-600" />,
    },
    {
      title: 'Thermodynamic & MOF-801 Sorption Audit',
      code: 'AUD-THERM-801',
      summary:
        '4-step mass and energy balance, Tetens absolute humidity curve, and 3-tier meteorological sensitivity bands validated for arid districts.',
      icon: <FileText className="w-5 h-5 text-sky-600" />,
    },
    {
      title: 'ISO 17025 Hydrochemistry & Mineral Certificate',
      code: 'LAB-ISO17025-WQ',
      summary:
        'USDA Handbook 60 SAR/RSC ion balance, volcanic basalt & calcite bed outlet verification (199.2 ppm TDS, pH 7.6), and drip emitter anti-scaling certification.',
      icon: <FileCheck2 className="w-5 h-5 text-cyan-600" />,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-medium text-sky-400 mb-1">
            Audit-Ready Documentation · {profile.district}, {profile.state}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">Reports, Telemetry Exports & Bankable Dossiers</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Generate print-formatted PDF audit reports or export raw 24-hour thermodynamic CSV datasets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export 24h Telemetry CSV</span>
          </button>
          <button
            type="button"
            onClick={onOpenExecutiveReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap"
          >
            <Printer className="w-4 h-4" />
            <span>Open Print / PDF Dossier</span>
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((tpl) => (
          <article key={tpl.code} className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-slate-500">{tpl.code}</span>
                {tpl.icon}
              </div>
              <h2 className="text-base font-bold text-slate-900 mb-2">{tpl.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{tpl.summary}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onOpenExecutiveReport}
                className="text-xs font-semibold text-sky-700 hover:text-sky-800"
              >
                Preview & Print PDF
              </button>
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Download CSV Data
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};
