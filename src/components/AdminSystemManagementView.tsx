import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Database,
  Download,
  RotateCcw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { ActivityLogItem, UserProfileDoc, UserRole } from '../types/aeroflora';

interface AdminSystemManagementViewProps {
  activeRole: UserRole;
  userProfile: UserProfileDoc;
  activityLogs: ActivityLogItem[];
  onChangeRole: (role: UserRole) => void;
  onExportDatabaseJson: () => void;
  onResetDemoState: () => void;
}

const ROLES: { id: UserRole; title: string; scope: string }[] = [
  {
    id: 'farmer',
    title: 'Farmer / Grower',
    scope: 'Manage personal plots, view daily AWH harvest, redeem FPO water tokens.',
  },
  {
    id: 'agronomist',
    title: 'KVK Agronomist',
    scope: 'Full access to FAO-56 crop budgets, USDA SAR/RSC hydrochemistry, and district alerts.',
  },
  {
    id: 'technician',
    title: 'Field IoT Technician',
    scope: 'Monitor ESP32-S3 telemetry, SHT45 sensor streams, and preventive maintenance logs.',
  },
  {
    id: 'fpo_admin',
    title: 'FPO Cooperative Admin',
    scope: 'Manage pooled 40 kL storage allocations, member water tokens, and PM-KUSUM dossiers.',
  },
  {
    id: 'platform_admin',
    title: 'Platform System Admin',
    scope: 'Full workspace configuration, JSON state backup/restore, and security verification.',
  },
];

export const AdminSystemManagementView: React.FC<AdminSystemManagementViewProps> = ({
  activeRole,
  userProfile,
  activityLogs,
  onChangeRole,
  onExportDatabaseJson,
  onResetDemoState,
}) => {
  const [resetToast, setResetToast] = useState(false);

  const handleReset = () => {
    onResetDemoState();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2600);
  };

  // Clean workspace persona directory referencing the authenticated Firebase user + standard FPO roles
  const directoryRows = [
    {
      name: userProfile.fullName,
      email: userProfile.email,
      role: activeRole,
      unit: `${userProfile.organization || 'Active Holding'} · ${userProfile.district}`,
      auth: userProfile.authProvider === 'google' ? 'Google SSO (Verified)' : 'Firebase Auth (Verified)',
      isCurrent: true,
    },
    {
      name: 'Dr. Kavita Deshmukh',
      email: 'agronomy.kvk@aeroflora.example.in',
      role: 'agronomist' as UserRole,
      unit: 'KVK Deesa Extension Advisory',
      auth: 'FPO Service Role',
      isCurrent: false,
    },
    {
      name: 'Mahendra Singh Rathore',
      email: 'field.ops@aeroflora.example.in',
      role: 'technician' as UserRole,
      unit: 'Thar & Banaskantha IoT Fleet',
      auth: 'FPO Service Role',
      isCurrent: false,
    },
    {
      name: 'Banaskantha FPO Desk',
      email: 'fpo.coordinator@aeroflora.example.in',
      role: 'fpo_admin' as UserRole,
      unit: 'Banaskantha Arid Farmers Producer Co.',
      auth: 'Cooperative Desk',
      isCurrent: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* RBAC Role Simulator */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
          <div>
            <div className="text-xs font-medium text-sky-700 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Role-Based Access Control (RBAC) & System Governance</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Interactive 5-Role Simulator & Workspace Administration
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onExportDatabaseJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export Database JSON</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>

        {resetToast && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Workspace parameters restored to Banaskantha Mk-IV baseline defaults.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ROLES.map((r) => {
            const active = activeRole === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onChangeRole(r.id)}
                className={`text-left rounded-xl p-4 border transition-colors ${
                  active
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-900 border-slate-200 hover:border-sky-400'
                }`}
              >
                <div className={`text-xs font-mono mb-1 ${active ? 'text-sky-400' : 'text-sky-700'}`}>
                  {r.id}
                </div>
                <div className="text-sm font-bold mb-1">{r.title}</div>
                <p className={`text-[11px] leading-relaxed ${active ? 'text-slate-300' : 'text-slate-600'}`}>
                  {r.scope}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clean Authentication & FPO Directory */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-600" />
              <span>Authenticated Workspace & FPO Role Directory</span>
            </h2>
            <span className="text-xs text-slate-500">Zero-Trust `/users/&#123;uid&#125;` Rules</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-3 px-4 font-semibold">Operator</th>
                  <th className="py-3 px-4 font-semibold">Role</th>
                  <th className="py-3 px-4 font-semibold">Affiliation</th>
                  <th className="py-3 px-4 font-semibold">Auth Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {directoryRows.map((row) => (
                  <tr key={row.email} className={row.isCurrent ? 'bg-sky-50/50' : 'hover:bg-slate-50'}>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {row.name} {row.isCurrent ? '(You)' : ''}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{row.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-sky-700 font-semibold">{row.role}</td>
                    <td className="py-3 px-4 text-slate-700">{row.unit}</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">{row.auth}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Logs */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>System Activity Ledger</span>
            </h2>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                  <span className="font-mono font-semibold text-sky-700">{log.category}</span>
                  <span className="font-mono">{log.timestamp}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
