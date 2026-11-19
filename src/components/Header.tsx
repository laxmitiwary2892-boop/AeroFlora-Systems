import React, { useState } from 'react';
import {
  Bot,
  BookOpen,
  ChevronDown,
  Droplets,
  Globe,
  LogOut,
  Menu,
  Rocket,
  Shield,
  Sprout,
  X,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from '../i18n/translations';
import type { LanguageCode, TabId, UserProfileDoc, UserRole } from '../types/aeroflora';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  language: LanguageCode;
  onChangeLanguage: (lang: LanguageCode) => void;
  userProfile: UserProfileDoc;
  activeRole: UserRole;
  onOpenAssistant: () => void;
  onOpenGuide: () => void;
  onOpenDeploy: () => void;
  onSignOut: () => void;
}

const PRIMARY_TABS: TabId[] = [
  'overview',
  'farmer_farm',
  'water_intel',
  'simulator',
  'cycle',
  'crop_planner',
  'mineralization',
  'roi',
  'equipment',
  'community',
  'reports',
  'help',
  'admin',
];

const ROLE_LABELS: Record<UserRole, string> = {
  farmer: 'Farmer / Grower',
  agronomist: 'Agronomist',
  technician: 'Field Technician',
  fpo_admin: 'FPO Admin',
  platform_admin: 'Platform Admin',
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  language,
  onChangeLanguage,
  userProfile,
  activeRole,
  onOpenAssistant,
  onOpenGuide,
  onOpenDeploy,
  onSignOut,
}) => {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[language];
  const currentLangMeta = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const initials = (userProfile.fullName || 'AF')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Bar */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand Wordmark + PM-KUSUM marker */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('overview')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus:outline-none"
          >
            <span className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Droplets className="w-4 h-4" />
            </span>
            <span className="text-base font-bold tracking-tight text-white">AeroFlora Systems</span>
          </button>
          <span className="hidden xl:inline-flex items-center text-xs font-medium text-emerald-400 whitespace-nowrap shrink-0">
            <span aria-hidden="true" className="text-slate-600 mr-2">·</span>
            {t.pmKusumBadge}
          </span>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenAssistant}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <Bot className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{t.askAiButton}</span>
            <span className="sm:hidden">Jal Saathi</span>
          </button>

          <button
            type="button"
            onClick={onOpenGuide}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.guideButton}</span>
          </button>

          <button
            type="button"
            onClick={onOpenDeploy}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>{t.deployButton}</span>
          </button>

          {/* 9-Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setLangMenuOpen((o) => !o);
                setUserMenuOpen(false);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              aria-label="Switch language"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{currentLangMeta.nativeName}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1.5 z-50">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      onChangeLanguage(lang.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-800 transition-colors ${
                      lang.code === language ? 'text-sky-400 font-semibold' : 'text-slate-200'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-slate-400">{lang.englishName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Account Chip & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen((o) => !o);
                setLangMenuOpen(false);
              }}
              className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <span className="w-6 h-6 rounded-md bg-sky-500 text-slate-950 text-xs font-bold flex items-center justify-center">
                {initials || 'AF'}
              </span>
              <span className="hidden md:inline text-xs font-medium text-slate-100 max-w-[120px] truncate">
                {userProfile.fullName}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50">
                <div className="pb-3 mb-2 border-b border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-white truncate">{userProfile.fullName}</span>
                    {userProfile.authProvider === 'google' && (
                      <span className="text-[11px] font-medium text-sky-400 shrink-0">Google SSO</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-0.5">{userProfile.email}</div>
                  <div className="text-xs text-emerald-400 font-medium mt-1">
                    {ROLE_LABELS[activeRole]} · {userProfile.district}
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('farmer_farm');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Sprout className="w-3.5 h-3.5 text-emerald-400" />
                    <span>My Farm Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('admin');
                      setUserMenuOpen(false);
                    }}
                    className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Shield className="w-3.5 h-3.5 text-sky-400" />
                    <span>Security & Roles</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onSignOut();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg text-left text-xs text-rose-300 hover:bg-rose-950/50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.signOut}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Desktop 13-Module Navigation Strip */}
      <nav
        aria-label="Primary modules"
        className="hidden lg:block border-t border-slate-800/80 bg-slate-950/60"
      >
        <div className="max-w-[1440px] mx-auto px-6 flex items-center gap-1 overflow-x-auto">
          {PRIMARY_TABS.map((tabId) => {
            const isActive = activeTab === tabId || (activeTab === 'results' && tabId === 'simulator');
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => onSelectTab(tabId)}
                className={`px-3 py-2.5 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                  isActive
                    ? 'border-sky-400 text-sky-300 bg-slate-900/60'
                    : 'border-transparent text-slate-400 hover:text-slate-100 hover:border-slate-700'
                }`}
              >
                {t.tabs[tabId]}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-1.5">
            {PRIMARY_TABS.map((tabId) => {
              const isActive = activeTab === tabId;
              return (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => {
                    onSelectTab(tabId);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 rounded-lg text-left text-xs font-medium truncate ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {t.tabs[tabId]}
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenGuide();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-900 text-xs font-medium text-slate-200 text-center"
            >
              {t.guideButton}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDeploy();
              }}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-900 text-xs font-medium text-slate-200 text-center"
            >
              {t.deployButton}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
