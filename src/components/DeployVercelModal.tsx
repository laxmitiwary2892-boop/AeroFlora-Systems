import React, { useState } from 'react';
import { Check, Copy, Rocket, X } from 'lucide-react';

interface DeployVercelModalProps {
  open: boolean;
  onClose: () => void;
}

const VERCEL_JSON_SNIPPET = `{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

const CLI_SNIPPET = `npm i -g vercel
vercel login
vercel --prod
# Optional domain alias check:
vercel alias set <deployment-url> aero-flora-systems-l1f1-gold.vercel.app`;

export const DeployVercelModal: React.FC<DeployVercelModalProps> = ({ open, onClose }) => {
  const [copiedKey, setCopiedKey] = useState<'cli' | 'json' | 'domain' | null>(null);

  if (!open) return null;

  const copyText = async (text: string, key: 'cli' | 'json' | 'domain') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold">Deploy AeroFlora Systems to Vercel / Cloud Run</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close deploy modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700">
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold text-sky-800">Target Production Reference URL</div>
              <div className="font-mono font-bold text-slate-900 text-xs mt-0.5">
                https://aero-flora-systems-l1f1-gold.vercel.app
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyText('aero-flora-systems-l1f1-gold.vercel.app', 'domain')}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 hover:text-sky-800 font-semibold shrink-0"
            >
              {copiedKey === 'domain' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'domain' ? 'Copied' : 'Copy Domain'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">1. GitHub + Vercel Dashboard Flow</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 leading-relaxed">
              <li>Push this repository to GitHub and import it inside Vercel Dashboard.</li>
              <li>Set environment variables (`GEMINI_API_KEY`) in Project Settings → Environment Variables.</li>
              <li>
                Add <code className="font-mono text-slate-900">aero-flora-systems-l1f1-gold.vercel.app</code> in
                Firebase Console → Authentication → Settings → Authorized Domains so Google SSO works on Vercel.
              </li>
            </ol>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">2. Vercel CLI Commands</span>
              <button
                type="button"
                onClick={() => copyText(CLI_SNIPPET, 'cli')}
                className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-semibold"
              >
                {copiedKey === 'cli' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'cli' ? 'Copied' : 'Copy CLI'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
              {CLI_SNIPPET}
            </pre>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">3. Included `vercel.json` Configuration</span>
              <button
                type="button"
                onClick={() => copyText(VERCEL_JSON_SNIPPET, 'json')}
                className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-800 font-semibold"
              >
                {copiedKey === 'json' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'json' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 text-slate-200 rounded-xl p-3 font-mono overflow-x-auto text-[11px]">
              {VERCEL_JSON_SNIPPET}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
