/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { Droplets, Loader2 } from 'lucide-react';
import { AdminSystemManagementView } from './components/AdminSystemManagementView';
import { AeroFloraEngineeringSimulator } from './components/AeroFloraEngineeringSimulator';
import { BiomimeticSimulationView } from './components/BiomimeticSimulationView';
import { CommunityFPONetworkView } from './components/CommunityFPONetworkView';
import { CropWaterPlannerView } from './components/CropWaterPlannerView';
import { DecisionResultsView } from './components/DecisionResultsView';
import { DeployVercelModal } from './components/DeployVercelModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ExecutiveReportModal } from './components/ExecutiveReportModal';
import { FarmerRegistrationMyFarm } from './components/FarmerRegistrationMyFarm';
import { FinancialPlannerROIView } from './components/FinancialPlannerROIView';
import { Header } from './components/Header';
import { HelpSupportView } from './components/HelpSupportView';
import { KisanJalSaathiModal } from './components/KisanJalSaathiModal';
import { LoginPage, PENDING_META_STORAGE_KEY, type PendingSignupMeta } from './components/LoginPage';
import { OverviewDashboard } from './components/OverviewDashboard';
import { QuickGuideModal } from './components/QuickGuideModal';
import { ReportsDocumentsView } from './components/ReportsDocumentsView';
import { ScenarioComparisonModal } from './components/ScenarioComparisonModal';
import { TowerEquipmentManagementView } from './components/TowerEquipmentManagementView';
import { WaterIntelligenceView } from './components/WaterIntelligenceView';
import { WaterQualityMineralisationView } from './components/WaterQualityMineralisationView';
import { auth, fetchUserProfile, syncUserProfileToFirestore } from './firebase';
import { INDIAN_CROPS } from './lib/fao56CropWater';
import {
  createDefaultState,
  loadPersistedState,
  savePersistedState,
  type AeroFloraAppState,
} from './lib/defaultState';
import { runEngineeringSimulation } from './lib/thermodynamics';
import type {
  ActivityLogItem,
  LanguageCode,
  SavedScenario,
  TabId,
  UserProfileDoc,
  UserRole,
} from './types/aeroflora';

function AeroFloraWorkspace() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileDoc | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [appState, setAppState] = useState<AeroFloraAppState>(() => loadPersistedState());
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Modals
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [scenariosOpen, setScenariosOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [deployOpen, setDeployOpen] = useState(false);

  // Persist appState changes to localStorage
  useEffect(() => {
    savePersistedState(appState);
  }, [appState]);

  const hydrateVerifiedUser = async (user: User) => {
    setProfileLoading(true);
    try {
      const existingDoc = await fetchUserProfile(user.uid);
      let pendingMeta: PendingSignupMeta | null = null;
      try {
        const rawMeta = localStorage.getItem(PENDING_META_STORAGE_KEY);
        if (rawMeta) pendingMeta = JSON.parse(rawMeta) as PendingSignupMeta;
      } catch {
        pendingMeta = null;
      }

      const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
      const synced = existingDoc
        ? existingDoc
        : await syncUserProfileToFirestore({
            uid: user.uid,
            fullName: pendingMeta?.fullName || user.displayName || 'AeroFlora Grower',
            email: user.email || '',
            role: pendingMeta?.role || 'farmer',
            organization: pendingMeta?.organization || 'Banaskantha Arid Farmers FPO',
            state: pendingMeta?.state || 'Gujarat',
            district: pendingMeta?.district || 'Banaskantha',
            authProvider: isGoogle ? 'google' : 'password',
            emailVerified: Boolean(user.emailVerified || isGoogle),
          });

      if (pendingMeta) {
        localStorage.removeItem(PENDING_META_STORAGE_KEY);
      }

      setUserProfile(synced);
      setAppState((prev) => ({
        ...prev,
        activeRole: synced.role || prev.activeRole,
        farmerProfile: {
          ...prev.farmerProfile,
          fullName: synced.fullName || prev.farmerProfile.fullName,
          email: synced.email || prev.farmerProfile.email,
          state: synced.state || prev.farmerProfile.state,
          district: synced.district || prev.farmerProfile.district,
        },
      }));
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
        if (user.emailVerified || isGoogle) {
          await hydrateVerifiedUser(user);
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  const addLog = (category: ActivityLogItem['category'], message: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    setAppState((prev) => ({
      ...prev,
      activityLogs: [
        { id: `log-${Date.now()}`, timestamp: timeStr, category, message },
        ...prev.activityLogs.slice(0, 29),
      ],
    }));
  };

  const simResult = useMemo(
    () => runEngineeringSimulation(appState.simulatorConfig),
    [appState.simulatorConfig]
  );

  const totalAcres = useMemo(
    () => appState.plots.reduce((acc, p) => acc + (Number(p.areaAcres) || 0), 0),
    [appState.plots]
  );

  const monthlyWaterSpendInr = useMemo(
    () => appState.plots.reduce((acc, p) => acc + (Number(p.monthlyWaterSpendInr) || 0), 0),
    [appState.plots]
  );

  const primaryPlot = appState.plots[0];
  const primaryCropName = useMemo(() => {
    const found = INDIAN_CROPS.find((c) => c.id === primaryPlot?.cropId);
    return found?.name || 'Pomegranate';
  }, [primaryPlot]);

  if (!authReady || profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
        <Droplets className="w-8 h-8 text-sky-400 mb-3" />
        <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
          <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
          <span>Initializing AeroFlora Systems Mk-IV OS...</span>
        </div>
      </div>
    );
  }

  const isGoogleUser = firebaseUser?.providerData.some((p) => p.providerId === 'google.com');
  const isUnlocked = Boolean(firebaseUser && (firebaseUser.emailVerified || isGoogleUser) && userProfile);

  if (!isUnlocked) {
    return (
      <LoginPage
        unverifiedUser={firebaseUser && !firebaseUser.emailVerified && !isGoogleUser ? firebaseUser : null}
        onVerificationComplete={async () => {
          if (auth.currentUser) {
            await hydrateVerifiedUser(auth.currentUser);
          }
        }}
      />
    );
  }

  const handleSelectLocation = (state: string, district: string) => {
    setAppState((prev) => ({
      ...prev,
      farmerProfile: { ...prev.farmerProfile, state, district },
    }));
  };

  const handleLanguageChange = (lang: LanguageCode) => {
    setAppState((prev) => ({
      ...prev,
      farmerProfile: { ...prev.farmerProfile, language: lang },
    }));
  };

  const handleRoleChange = (role: UserRole) => {
    setAppState((prev) => ({ ...prev, activeRole: role }));
    addLog('system', `Switched active RBAC role persona to "${role}".`);
  };

  const handleExportDatabaseJson = () => {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aeroflora_database_backup.json';
    a.click();
    URL.revokeObjectURL(url);
    addLog('system', 'Exported full AeroFlora workspace state backup JSON.');
  };

  const handleResetDemoState = () => {
    const fresh = createDefaultState();
    setAppState({
      ...fresh,
      farmerProfile: {
        ...fresh.farmerProfile,
        fullName: userProfile?.fullName || fresh.farmerProfile.fullName,
        email: userProfile?.email || fresh.farmerProfile.email,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        language={appState.farmerProfile.language}
        onChangeLanguage={handleLanguageChange}
        userProfile={userProfile!}
        activeRole={appState.activeRole}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenGuide={() => setGuideOpen(true)}
        onOpenDeploy={() => setDeployOpen(true)}
        onSignOut={() => signOut(auth)}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            language={appState.farmerProfile.language}
            stateName={appState.farmerProfile.state}
            districtName={appState.farmerProfile.district}
            simulatorConfig={appState.simulatorConfig}
            totalAcres={totalAcres}
            monthlyWaterSpendInr={monthlyWaterSpendInr}
            onSelectLocation={handleSelectLocation}
            onNavigateTab={setActiveTab}
            onOpenAssistant={() => setAssistantOpen(true)}
            onOpenExecutiveReport={() => setReportOpen(true)}
            onOpenScenarios={() => setScenariosOpen(true)}
          />
        )}

        {activeTab === 'farmer_farm' && (
          <FarmerRegistrationMyFarm
            profile={appState.farmerProfile}
            plots={appState.plots}
            onUpdateProfile={(next) => setAppState((prev) => ({ ...prev, farmerProfile: next }))}
            onUpdatePlots={(next) => setAppState((prev) => ({ ...prev, plots: next }))}
            onLogActivity={(cat, msg) => addLog(cat, msg)}
          />
        )}

        {activeTab === 'water_intel' && (
          <WaterIntelligenceView
            stateName={appState.farmerProfile.state}
            districtName={appState.farmerProfile.district}
            onSelectLocation={handleSelectLocation}
            onSyncToSimulator={({ rhPercent, tempC, solarKwhM2, district, state }) => {
              setAppState((prev) => ({
                ...prev,
                farmerProfile: { ...prev.farmerProfile, state, district },
                simulatorConfig: {
                  ...prev.simulatorConfig,
                  ambientRhPercent: rhPercent,
                  ambientTempC: tempC,
                  solarIrradianceKwhM2: solarKwhM2,
                },
              }));
              addLog('simulation', `Synced ${district} climate (${rhPercent}% RH, ${tempC}°C) to Simulator.`);
            }}
          />
        )}

        {activeTab === 'simulator' && (
          <AeroFloraEngineeringSimulator
            config={appState.simulatorConfig}
            onChangeConfig={(next) => setAppState((prev) => ({ ...prev, simulatorConfig: next }))}
            onApplySizingToFleet={(towerCount, dailyHarvestL) => {
              setAppState((prev) => ({
                ...prev,
                simulatorConfig: { ...prev.simulatorConfig, towerCount },
                financialConfig: { ...prev.financialConfig, towerCount },
              }));
              addLog(
                'simulation',
                `Applied ${towerCount}-tower array sizing (${dailyHarvestL.toLocaleString('en-IN')} L/day) to fleet & ROI.`
              );
            }}
            onResetBaseline={() => {
              const defaults = createDefaultState();
              setAppState((prev) => ({ ...prev, simulatorConfig: defaults.simulatorConfig }));
              addLog('simulation', 'Reset Engineering Simulator to MOF-801 Banaskantha baseline.');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'cycle' && (
          <BiomimeticSimulationView
            initialRhPercent={appState.simulatorConfig.ambientRhPercent}
            peakTempC={appState.simulatorConfig.ambientTempC}
            onSyncRh={(rhPercent) =>
              setAppState((prev) => ({
                ...prev,
                simulatorConfig: { ...prev.simulatorConfig, ambientRhPercent: rhPercent },
              }))
            }
          />
        )}

        {activeTab === 'crop_planner' && primaryPlot && (
          <CropWaterPlannerView
            activePlot={primaryPlot}
            yieldPerTowerLPerDay={simResult.dailyYieldPerTowerL}
            onSizeTowersForDeficit={(towersNeeded, cropName) => {
              setAppState((prev) => ({
                ...prev,
                simulatorConfig: { ...prev.simulatorConfig, towerCount: towersNeeded },
                financialConfig: { ...prev.financialConfig, towerCount: towersNeeded },
              }));
              addLog('farm', `Sized ${towersNeeded} AeroFlora towers for zero deficit on ${cropName}.`);
            }}
          />
        )}

        {activeTab === 'mineralization' && (
          <WaterQualityMineralisationView
            inputs={appState.waterQuality}
            onChangeInputs={(next) => setAppState((prev) => ({ ...prev, waterQuality: next }))}
          />
        )}

        {activeTab === 'roi' && (
          <FinancialPlannerROIView
            config={appState.financialConfig}
            onChangeConfig={(next) => setAppState((prev) => ({ ...prev, financialConfig: next }))}
            onOpenBankableProForma={() => setReportOpen(true)}
          />
        )}

        {activeTab === 'equipment' && (
          <TowerEquipmentManagementView
            towers={appState.towers}
            onLogMaintenance={(serial, task) =>
              addLog('equipment', `Completed maintenance on ${serial}: ${task}.`)
            }
          />
        )}

        {activeTab === 'community' && (
          <CommunityFPONetworkView
            plots={appState.plots}
            tokenBalanceLitres={appState.waterTokensLitres}
            onRedeemTokens={(plotName, volumeLitres) => {
              setAppState((prev) => ({
                ...prev,
                waterTokensLitres: Math.max(0, prev.waterTokensLitres - volumeLitres),
              }));
              addLog(
                'fpo',
                `Redeemed ${volumeLitres.toLocaleString('en-IN')} L FPO water tokens for ${plotName} (05:00 AM dispatch).`
              );
            }}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsDocumentsView
            profile={appState.farmerProfile}
            simulatorConfig={appState.simulatorConfig}
            onOpenExecutiveReport={() => setReportOpen(true)}
            onLogReportAction={(msg) => addLog('report', msg)}
          />
        )}

        {activeTab === 'help' && (
          <HelpSupportView
            profile={appState.farmerProfile}
            onLogSupportRequest={(msg) => addLog('system', msg)}
          />
        )}

        {activeTab === 'admin' && (
          <AdminSystemManagementView
            activeRole={appState.activeRole}
            userProfile={userProfile!}
            activityLogs={appState.activityLogs}
            onChangeRole={handleRoleChange}
            onExportDatabaseJson={handleExportDatabaseJson}
            onResetDemoState={handleResetDemoState}
          />
        )}

        {activeTab === 'results' && (
          <DecisionResultsView
            profile={appState.farmerProfile}
            simulatorConfig={appState.simulatorConfig}
            financialConfig={appState.financialConfig}
            savedScenarios={appState.savedScenarios}
            onSaveScenario={(scenario: SavedScenario) => {
              setAppState((prev) => ({
                ...prev,
                savedScenarios: [scenario, ...prev.savedScenarios],
              }));
              addLog('simulation', `Saved scenario "${scenario.name}" to decision matrix.`);
            }}
            onOpenExecutiveReport={() => setReportOpen(true)}
          />
        )}
      </main>

      {/* Dark Slate Footer */}
      <footer className="no-print bg-slate-950 text-slate-400 border-t border-slate-800 py-6 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-300">
            <Droplets className="w-4 h-4 text-sky-400" />
            <span className="font-semibold text-white">AeroFlora Systems</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>India AgriTech & Autonomous AWH Intelligence</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono text-sky-400">aero-flora-systems-l1f1-gold.vercel.app</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" onClick={() => setGuideOpen(true)} className="hover:text-white">
              Playbook
            </button>
            <button type="button" onClick={() => setReportOpen(true)} className="hover:text-white">
              Audit Dossier
            </button>
            <button type="button" onClick={() => setDeployOpen(true)} className="hover:text-white">
              Deployment
            </button>
            <button type="button" onClick={() => setActiveTab('help')} className="hover:text-white">
              Kisan Helpline: 1800-180-1551
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Modals */}
      <KisanJalSaathiModal
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        farmContext={{
          district: appState.farmerProfile.district,
          state: appState.farmerProfile.state,
          crop: primaryCropName,
          acres: totalAcres,
          dailyHarvestLiters: simResult.totalArrayYieldDailyL,
          towerCount: appState.simulatorConfig.towerCount,
          monthlyWaterSpend: monthlyWaterSpendInr,
        }}
      />

      <ExecutiveReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        farmerProfile={appState.farmerProfile}
        plots={appState.plots}
        simulatorConfig={appState.simulatorConfig}
        waterQuality={appState.waterQuality}
        financialConfig={appState.financialConfig}
      />

      <ScenarioComparisonModal
        open={scenariosOpen}
        onClose={() => setScenariosOpen(false)}
        financialConfig={appState.financialConfig}
        perTowerYieldL={simResult.dailyYieldPerTowerL}
        onLoadTowers={(count) => {
          setAppState((prev) => ({
            ...prev,
            simulatorConfig: { ...prev.simulatorConfig, towerCount: count },
            financialConfig: { ...prev.financialConfig, towerCount: count },
          }));
          addLog('simulation', `Loaded ${count}-tower array sizing from comparison matrix.`);
        }}
      />

      <QuickGuideModal
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onStartSimulatorTest={() => setActiveTab('simulator')}
      />

      <DeployVercelModal open={deployOpen} onClose={() => setDeployOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AeroFloraWorkspace />
    </ErrorBoundary>
  );
}
