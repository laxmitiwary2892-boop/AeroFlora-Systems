import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, HelpCircle, PhoneCall, Send } from 'lucide-react';
import type { FarmerProfile } from '../types/aeroflora';

interface HelpSupportViewProps {
  profile: FarmerProfile;
  onLogSupportRequest: (msg: string) => void;
}

interface FaqItem {
  qEn: string;
  aEn: string;
  qHi: string;
  aHi: string;
}

const FAQS: FaqItem[] = [
  {
    qEn: 'How does AeroFlora harvest water without any grid electricity?',
    aEn: 'AeroFlora Mk-IV towers use nocturnal passive moisture sorption inside Zr-fumarate MOF-801 beds when night air cools, followed by direct solar-thermal desorption during the day across biomimetic aluminum condenser plates—requiring 0.0 kWh from the electric grid.',
    qHi: 'AeroFlora बिना बिजली के हवा से पानी कैसे बनाता है?',
    aHi: 'AeroFlora Mk-IV टावर रात में ठंडी हवा से MOF-801 सोर्बेंट में नमी सोखते हैं और दिन में सीधी सौर गर्मी से भाप को बायोमिमेटिक कंडेंसर पर ठंडा कर शुद्ध पानी बनाते हैं। इसमें ग्रिड बिजली (0.0 kWh) की बिल्कुल आवश्यकता नहीं होती।',
  },
  {
    qEn: 'Does it really produce 450+ Litres/day at 44°C and 15% afternoon RH?',
    aEn: 'Yes. Even in hyper-arid districts like Barmer or Jaisalmer where afternoon RH drops to 15–18%, nocturnal desert cooling raises nighttime RH to 38–46%. The multi-tray MOF-801 bed captures moisture overnight and delivers 450–490 L/day during solar desorption.',
    qHi: 'क्या 44°C तापमान और 15% नमी वाले रेगिस्तानी इलाकों में भी 450+ लीटर पानी मिलता है?',
    aHi: 'हाँ। बाड़मेर और जैसलमेर जैसे शुष्क जिलों में दोपहर की नमी 15–18% होने पर भी रात में नमी 38–46% तक पहुँच जाती है। MOF-801 रात की नमी सोखकर दिन में 450–490 लीटर/दिन पानी देता है।',
  },
  {
    qEn: 'What is the lifespan of the MOF-801 sorbent material?',
    aEn: 'Laboratory and field cycling confirms 15–20 years (>6,000 passive diurnal sorption-desorption cycles) with zero chemical leaching. Only the external basalt-calcite mineral cartridge is refreshed annually (₹3,200/year).',
    qHi: 'MOF-801 सामग्री कितने साल चलती है और रखरखाव कितना है?',
    aHi: 'MOF-801 की आयु 15–20 वर्ष (6,000+ चक्र) है। केवल बाहरी बेसाल्ट-कैल्साइट मिनरल कार्ट्रिज को साल में एक बार बदलना होता है (लगभग ₹3,200/वर्ष)।',
  },
  {
    qEn: 'Is atmospheric water safe for sensitive drip emitters and pomegranate/grape roots?',
    aEn: 'Raw condensate is routed through our 3-stage volcanic basalt, calcite, and dolomite gravity bed, bringing TDS to ~199 ppm (Ca²⁺ 54 mg/L, Mg²⁺ 18.6 mg/L, pH 7.6) with zero Boron or Sodium hazard—completely safe for 2 LPH inline drip emitters.',
    qHi: 'क्या यह पानी ड्रिप इरिगेशन और अनार/अंगूर की जड़ों के लिए सुरक्षित है?',
    aHi: 'जी हाँ। 3-चरणीय बेसाल्ट व कैल्साइट मिनरलाइजेशन के बाद पानी का TDS ~199 ppm और pH 7.6 रहता है, जिससे ड्रिप एमिटर में स्केलिंग नहीं होती और जड़ों को संतुलित कैल्शियम-मैग्नीशियम मिलता है।',
  },
  {
    qEn: 'Can farmers claim PM-KUSUM 30%–50% subsidy for AeroFlora arrays?',
    aEn: 'Yes. Off-grid solar water harvesting assets qualify under PM-KUSUM Component B (30% Central MNRE share + 20%–30% State Horticulture/Agriculture top-up in Rajasthan, Gujarat, and Maharashtra) as well as NABARD & KCC allied infrastructure loans.',
    qHi: 'क्या किसानों को PM-KUSUM योजना के तहत 30%–50% सब्सिडी मिल सकती है?',
    aHi: 'हाँ। ऑफ-ग्रिड सौर जल संचयन इकाइयाँ PM-KUSUM घटक B (30% केंद्रीय सब्सिडी + राज्य बागवानी टॉप-अप से कुल 50% तक) तथा NABARD/KCC कृषि ऋण के लिए पात्र हैं।',
  },
];

export const HelpSupportView: React.FC<HelpSupportViewProps> = ({
  profile,
  onLogSupportRequest,
}) => {
  const [faqLang, setFaqLang] = useState<'en' | 'hi'>('en');
  const [openIdx, setOpenIdx] = useState<number>(0);

  const [reqName, setReqName] = useState(profile.fullName);
  const [reqPhone, setReqPhone] = useState(profile.mobile);
  const [reqTopic, setReqTopic] = useState('Field Site Survey & Solar Azimuth Audit');
  const [reqNotes, setReqNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogSupportRequest(`Field service request submitted by ${reqName} (${profile.district}): ${reqTopic}.`);
    setSubmitted(true);
    setReqNotes('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Toll-Free Kisan Call Centre Card */}
      <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shrink-0">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-medium text-emerald-400 mb-1">
              Ministry of Agriculture & Farmers Welfare · 24×7 Toll-Free Helpline
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">Kisan Call Centre & AeroFlora Field Support</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              24×7 agronomic & PM-KUSUM assistance available in 22 Indian languages.
            </p>
          </div>
        </div>
        <div className="text-left md:text-right shrink-0">
          <div className="text-xs text-slate-400">Toll-Free Number</div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-sky-400 tabular-nums">
            1800-180-1551
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Bilingual Expandable FAQ Accordion */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Frequently Asked Questions</span>
            </h2>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setFaqLang('en')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  faqLang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setFaqLang('hi')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  faqLang === 'hi' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-200">
            {FAQS.map((item, idx) => {
              const open = openIdx === idx;
              return (
                <div key={idx} className="py-3 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? -1 : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left py-1.5"
                  >
                    <span className="text-sm font-semibold text-slate-900">
                      {faqLang === 'en' ? item.qEn : item.qHi}
                    </span>
                    {open ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {open && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-2 pb-1">
                      {faqLang === 'en' ? item.aEn : item.aHi}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Request Field Service / Demo Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4 self-start"
        >
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-200">
            Request Field Service or Tower Demo
          </h2>

          {submitted && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Technician site survey ticket dispatched for {profile.district}, {profile.state}. Our field
                engineer will contact you within 24 hours.
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Name</label>
            <input
              type="text"
              required
              value={reqName}
              onChange={(e) => setReqName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              required
              value={reqPhone}
              onChange={(e) => setReqPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Service / Inquiry Type</label>
            <select
              value={reqTopic}
              onChange={(e) => setReqTopic(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white"
            >
              <option>Field Site Survey & Solar Azimuth Audit</option>
              <option>PM-KUSUM / MIDH Subsidy Paperwork Assistance</option>
              <option>Volcanic Basalt & Calcite Cartridge Replacement</option>
              <option>ESP32-S3 Telemetry Gateway Calibration</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Plot Notes / Issues</label>
            <textarea
              rows={3}
              value={reqNotes}
              onChange={(e) => setReqNotes(e.target.value)}
              placeholder="Describe your orchard acreage, borewell salinity, or tower serial number..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Dispatch Field Technician Request</span>
          </button>
        </form>
      </div>
    </div>
  );
};
