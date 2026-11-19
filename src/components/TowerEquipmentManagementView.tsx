import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Radio,
  Thermometer,
  Wrench,
} from 'lucide-react';
import type { TowerDevice } from '../types/aeroflora';

interface TowerEquipmentManagementViewProps {
  towers: TowerDevice[];
  onLogMaintenance: (serial: string, task: string) => void;
}

export const TowerEquipmentManagementView: React.FC<TowerEquipmentManagementViewProps> = ({
  towers,
  onLogMaintenance,
}) => {
  const [selectedId, setSelectedId] = useState<string>(towers[0]?.id || '');
  const [subTab, setSubTab] = useState<'sensors' | 'esp32' | 'maintenance'>('sensors');
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const activeTower = towers.find((t) => t.id === selectedId) || towers[0];

  const handleToggleTask = (taskKey: string, taskLabel: string) => {
    const nextVal = !completedTasks[taskKey];
    setCompletedTasks((prev) => ({ ...prev, [taskKey]: nextVal }));
    if (nextVal && activeTower) {
      onLogMaintenance(activeTower.serial, taskLabel);
    }
  };

  return (
    <div className="space-y-6">
      {/* Selectable Fleet Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {towers.map((tower) => {
          const selected = tower.id === activeTower.id;
          return (
            <button
              key={tower.id}
              type="button"
              onClick={() => setSelectedId(tower.id)}
              className={`text-left rounded-2xl p-5 border transition-colors ${
                selected
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-sky-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-xs font-mono font-bold ${selected ? 'text-sky-400' : 'text-sky-700'}`}>
                  {tower.serial}
                </span>
                <span
                  className={`text-xs font-semibold ${
                    tower.esp32Online
                      ? selected
                        ? 'text-emerald-400'
                        : 'text-emerald-600'
                      : 'text-rose-500'
                  }`}
                >
                  {tower.esp32Online ? `ESP32 Online · ${tower.lastSync}` : 'Offline'}
                </span>
              </div>
              <div className="text-base font-bold mb-1">{tower.locationLabel}</div>
              <div className={`text-xs mb-3 ${selected ? 'text-slate-300' : 'text-slate-500'}`}>
                {tower.district}, {tower.state} · Status: {tower.status}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/30 text-xs">
                <div>
                  <div className={selected ? 'text-slate-400' : 'text-slate-500'}>Daily Yield</div>
                  <div className="font-mono font-bold tabular-nums">{tower.dailyYieldL} L</div>
                </div>
                <div>
                  <div className={selected ? 'text-slate-400' : 'text-slate-500'}>Core Temp</div>
                  <div className="font-mono font-bold tabular-nums">{tower.coreTempC}°C</div>
                </div>
                <div>
                  <div className={selected ? 'text-slate-400' : 'text-slate-500'}>Lifetime</div>
                  <div className="font-mono font-bold tabular-nums">
                    {(tower.lifetimeLitres / 1000).toFixed(1)} kL
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Sub-Tabs */}
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-5 pt-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'sensors' as const, label: 'Real-Time Sensor Streams', icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'esp32' as const, label: 'ESP32 Pinout & Gateway Setup', icon: <Cpu className="w-3.5 h-3.5" /> },
              { id: 'maintenance' as const, label: 'Preventive Maintenance Checklist', icon: <Wrench className="w-3.5 h-3.5" /> },
            ].map((tab) => {
              const active = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSubTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    active
                      ? 'border-sky-600 text-sky-700'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="text-xs font-mono text-slate-500 pb-2">Unit: {activeTower.serial}</div>
        </div>

        <div className="p-6">
          {subTab === 'sensors' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Sorbent Chamber Temp</span>
                  <Thermometer className="w-4 h-4 text-amber-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {activeTower.coreTempC}°C
                </div>
                <div className="text-xs text-slate-500 mt-1">MOF-801 bed thermistor #1–#4</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Internal Chamber RH</span>
                  <Radio className="w-4 h-4 text-sky-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-sky-700 tabular-nums">
                  {activeTower.internalRhPercent}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Sensirion SHT45 I2C Bus</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Condenser Plate Temp</span>
                  <Thermometer className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {activeTower.condenserTempC}°C
                </div>
                <div className="text-xs text-slate-500 mt-1">Biomimetic radiator delta: 64.8°C</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Lifetime Accumulated</span>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                  {activeTower.lifetimeLitres.toLocaleString('en-IN')} L
                </div>
                <div className="text-xs text-slate-500 mt-1">Sensirion SLF3S pulse flow totalizer</div>
              </div>
            </div>
          )}

          {subTab === 'esp32' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">
                  Edge Telemetry Controller (ESP32-S3 WROOM-1)
                </h3>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl text-xs">
                  {[
                    { pin: 'GPIO 21 (SDA) / GPIO 22 (SCL)', fn: 'Sensirion SHT45 Internal Temp & RH I2C Bus' },
                    { pin: 'GPIO 4 (UART1 RX) / GPIO 5 (TX)', fn: 'Sensirion SLF3S-1300F Liquid Flow Meter' },
                    { pin: 'GPIO 12 / GPIO 13 (PWM)', fn: 'Nocturnal Louver Linear Actuator Damper Control' },
                    { pin: 'GPIO 16 / GPIO 17 (UART2)', fn: 'SIM7600E 4G LTE-M Fallback Cellular Modem' },
                    { pin: '16 MB Onboard SPIFFS Flash', fn: '90-day offline telemetry ring buffer (zero data loss)' },
                  ].map((row) => (
                    <div key={row.pin} className="p-3 flex items-center justify-between gap-4">
                      <span className="font-mono font-semibold text-sky-700">{row.pin}</span>
                      <span className="text-slate-700 text-right">{row.fn}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2 border border-slate-800">
                <div className="text-sky-400 font-semibold">MQTT / TLS 1.3 Gateway Payload Sample</div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">{`{
  "device_id": "${activeTower.serial}",
  "mcu": "ESP32-S3-WROOM-1",
  "transport": "WiFi + 4G LTE-M Fallback",
  "rssi_dbm": ${activeTower.rssiDbm},
  "core_temp_c": ${activeTower.coreTempC},
  "internal_rh_pct": ${activeTower.internalRhPercent},
  "condenser_temp_c": ${activeTower.condenserTempC},
  "daily_yield_l": ${activeTower.dailyYieldL},
  "spiffs_buffer_days_free": 88
}`}</pre>
              </div>
            </div>
          )}

          {subTab === 'maintenance' && (
            <div className="space-y-3">
              {[
                {
                  key: `${activeTower.id}-glazing`,
                  title: 'Bi-Weekly Solar Collector Glazing Wipe',
                  detail: 'Remove desert dust film from low-iron tempered collector glass to preserve >91% transmittance.',
                  due: `${activeTower.maintenance.glazingWipeDaysLeft} days remaining`,
                },
                {
                  key: `${activeTower.id}-cartridge`,
                  title: 'Annual Volcanic Basalt & Calcite Cartridge Swap',
                  detail: 'Replace Stage 2 calcite/dolomite media pack to maintain target 199 ppm TDS & pH 7.6.',
                  due: `${activeTower.maintenance.mineralCartridgeDaysLeft} days remaining`,
                },
                {
                  key: `${activeTower.id}-seal`,
                  title: '6-Month Silicone Chamber Damper Seal Inspection',
                  detail: 'Verify airtight gasket compression on nocturnal intake louvers prior to desorption cycle.',
                  due: `${activeTower.maintenance.damperSealDaysLeft} days remaining`,
                },
              ].map((item) => {
                const done = Boolean(completedTasks[item.key]);
                return (
                  <div
                    key={item.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.title}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{item.detail}</div>
                      <div className="text-xs font-mono text-sky-700 mt-1">{item.due}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleTask(item.key, item.title)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                        done
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{done ? 'Logged Complete' : 'Mark Completed'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
