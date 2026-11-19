import React, { useState } from 'react';
import { Bot, Loader2, Send, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sourceLabel?: string;
}

interface KisanJalSaathiModalProps {
  open: boolean;
  onClose: () => void;
  farmContext: {
    district: string;
    state: string;
    crop: string;
    acres: number;
    dailyHarvestLiters: number;
    towerCount: number;
    monthlyWaterSpend: number;
  };
}

const PRESETS_EN = [
  'How many AeroFlora towers do I need for 2.5 acres of Bhagwa pomegranate?',
  'Explain how PM-KUSUM 30%–50% subsidy reduces my payback period.',
  'Why is basalt + calcite mineralization required before drip fertigation?',
  'How does MOF-801 perform during 44°C summer afternoons at 18% RH?',
];

const PRESETS_HI = [
  '2.5 एकड़ अनार के बगीचे के लिए मुझे कितने AeroFlora टावर चाहिए?',
  'PM-KUSUM योजना की 30%–50% सब्सिडी से लागत कितने महीने में निकलेगी?',
  'ड्रिप सिंचाई से पहले बेसाल्ट और कैल्साइट मिनरलाइजेशन क्यों जरूरी है?',
  '44°C गर्मी और 18% नमी में MOF-801 टावर कितना पानी बनाता है?',
];

function buildOfflineAgronomyReply(
  query: string,
  lang: 'en' | 'hi',
  ctx: KisanJalSaathiModalProps['farmContext']
): string {
  const q = query.toLowerCase();
  if (lang === 'hi') {
    if (q.includes('subsidy') || q.includes('सब्सिडी') || q.includes('kusum')) {
      return `• ${ctx.district}, ${ctx.state} में PM-KUSUM घटक-B (30% केंद्रीय सब्सिडी + राज्य बागवानी टॉप-अप से 50% तक) के तहत ऑफ-ग्रिड सौर टावरों की शुद्ध लागत ₹92,500–₹1,29,500 प्रति टावर रह जाती है।\n• ₹1,650 प्रति 5,000 लीटर टैंकर के हिसाब से आपके ₹${ctx.monthlyWaterSpend.toLocaleString('en-IN')}/माह खर्च की बचत से 22–28 महीनों में पूरी लागत निकल आती है।`;
    }
    if (q.includes('मिनरल') || q.includes('बेसाल्ट') || q.includes('drip')) {
      return `• हवा से प्राप्त कच्चा पानी (~12 ppm TDS) बहुत नरम और हल्का अम्लीय (pH 5.8) होता है।\n• हमारा 3-चरणीय ज्वालामुखी बेसाल्ट + कैल्साइट बेड इसमें 54 mg/L कैल्शियम और 18.6 mg/L मैग्नीशियम मिलाकर TDS को 199 ppm और pH को 7.6 पर लाता है, जिससे ड्रिप एमिटर सुरक्षित रहते हैं।`;
    }
    return `• आपके ${ctx.district} क्षेत्र में ${ctx.crop} (${ctx.acres} एकड़) के लिए ${ctx.towerCount} AeroFlora Mk-IV टावर प्रतिदिन ~${ctx.dailyHarvestLiters.toLocaleString('en-IN')} लीटर मिनरलाइज़्ड पानी देते हैं।\n• यह 0.0 kWh ग्रिड बिजली पर चलता है और रात की नमी सोखकर दिन की सौर गर्मी से पानी बनाता है।`;
  }

  if (q.includes('kusum') || q.includes('subsidy') || q.includes('payback')) {
    return `• Under PM-KUSUM Component B (30% MNRE grant, up to 50% with State Horticulture top-up in ${ctx.state}), net CapEx drops sharply.\n• With ${ctx.towerCount} Mk-IV towers harvesting ${ctx.dailyHarvestLiters.toLocaleString('en-IN')} L/day in ${ctx.district}, displacing private tankers and diesel pumping yields a 22–29 month simple payback and NABARD/KCC eligibility.`;
  }
  if (q.includes('basalt') || q.includes('calcite') || q.includes('mineral')) {
    return `• Raw atmospheric condensate (~12 ppm TDS, pH 5.8) lacks buffering minerals and can trigger soil clay dispersion.\n• AeroFlora's passive Deccan basalt + calcite column restores Ca²⁺ (54.2 mg/L), Mg²⁺ (18.6 mg/L), and K⁺ (11.4 mg/L) to 199.2 ppm TDS and pH 7.6—protecting 2 LPH drip emitters.`;
  }
  return `• For ${ctx.acres} acres of ${ctx.crop} in ${ctx.district}, ${ctx.state}, your active ${ctx.towerCount}-tower array generates ~${ctx.dailyHarvestLiters.toLocaleString('en-IN')} L/day at 0.0 kWh grid power.\n• Nocturnal desert cooling lifts night RH to 38–48% even when afternoons hit 44°C / 18% RH, saturating the Zr-fumarate MOF-801 bed for daytime solar condensation.`;
}

export const KisanJalSaathiModal: React.FC<KisanJalSaathiModalProps> = ({
  open,
  onClose,
  farmContext,
}) => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Namaste! I am Kisan Jal Saathi. Ask me about ${farmContext.crop} irrigation budgets in ${farmContext.district}, MOF-801 extraction yields, water mineralization, or PM-KUSUM subsidies.`,
      sourceLabel: 'Agronomic Advisor',
    },
  ]);

  if (!open) return null;

  const sendQuery = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const resp = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          language: lang,
          farmContext,
        }),
      });
      const data = await resp.json();

      if (resp.ok && data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: data.reply,
            sourceLabel: 'Kisan Jal Saathi AI',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            sender: 'assistant',
            text: buildOfflineAgronomyReply(trimmed, lang, farmContext),
            sourceLabel: 'Agronomic Knowledge Engine',
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          sender: 'assistant',
          text: buildOfflineAgronomyReply(trimmed, lang, farmContext),
          sourceLabel: 'Agronomic Knowledge Engine',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const presets = lang === 'en' ? PRESETS_EN : PRESETS_HI;

  return (
    <div className="no-print fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Bot className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold">Kisan Jal Saathi — Agronomic Advisor</h2>
              <div className="text-[11px] text-slate-300">
                Context: {farmContext.district}, {farmContext.state} · {farmContext.crop} ·{' '}
                {farmContext.dailyHarvestLiters.toLocaleString('en-IN')} L/day
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex p-0.5 bg-slate-800 rounded-lg">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  lang === 'en' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
                  lang === 'hi' ? 'bg-sky-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                हिन्दी
              </button>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close assistant"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preset Questions */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-2">
          {presets.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendQuery(q)}
              className="text-left text-[11px] font-medium px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-400 text-slate-700 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-white">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                {m.sourceLabel && (
                  <div className="text-[10px] font-semibold text-sky-700 mb-1">{m.sourceLabel}</div>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-600 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                <span>Analyzing farm telemetry...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendQuery(input);
          }}
          className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              lang === 'hi'
                ? 'सिंचाई, फसल, या सब्सिडी के बारे में पूछें...'
                : 'Ask about crop ETc, tower sizing, SAR/TDS, or PM-KUSUM subsidy...'
            }
            className="flex-1 px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
