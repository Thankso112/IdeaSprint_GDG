import React, { useState, useEffect } from 'react';
import { Sparkles, HeartHandshake, ArrowRight, X } from 'lucide-react';

interface NamasteWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NamasteWelcomeModal: React.FC<NamasteWelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Cycle between Odia, Hindi, and English greetings
  const [activeLangIndex, setActiveLangIndex] = useState(0);

  const greetings = [
    {
      lang: 'Odia',
      script: 'ନମସ୍କାର',
      phonetic: 'Namaskara',
      subtext: 'ଅନ୍ନମ୍ ବ୍ରହ୍ମ — ଖାଦ୍ୟ ନଷ୍ଟ ନକରି କ୍ଷୁଧାର୍ତ୍ତଙ୍କୁ ବାଣ୍ଟିବା ଆମର ସଂକଳ୍ପ ।',
      translation: 'Food is Divine — Let no surplus meal go to waste in Odisha.',
    },
    {
      lang: 'Hindi',
      script: 'नमस्ते',
      phonetic: 'Namaste',
      subtext: 'अन्न ही जीवन है — अतिरिक्त भोजन से किसी ज़रूरतमंद का पेट भरें।',
      translation: 'Respect Food — Surplus meals redirected to hungry plates in minutes.',
    },
    {
      lang: 'English',
      script: 'Welcome to FoodBridge',
      phonetic: 'Zero Food Waste',
      subtext: 'Hyperlocal Surplus Food Tracking & Redistribution Pilot in Bhubaneswar.',
      translation: 'From banquet & kitchen surplus to someone’s plate in under 30 minutes.',
    },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setActiveLangIndex((prev) => (prev + 1) % greetings.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const currentGreeting = greetings[activeLangIndex];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-fade-in">
      {/* Traditional Temple Card Container */}
      <div className="relative max-w-lg w-full bg-gradient-to-b from-amber-50 via-stone-50 to-orange-50 rounded-3xl p-7 sm:p-9 shadow-2xl border-4 border-amber-300/80 text-center overflow-hidden">
        {/* Odia Jhoti / Rangoli Decorative Background Circles */}
        <div className="absolute -top-16 -left-16 w-44 h-44 rounded-full bg-amber-200/30 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-44 h-44 rounded-full bg-orange-300/30 blur-2xl pointer-events-none" />

        {/* Traditional Ornamental Top Border Motif */}
        <div className="flex items-center justify-center gap-1.5 mb-5 text-amber-700/80 select-none">
          <span className="text-xs tracking-widest uppercase font-serif">❖ ❖ ❖</span>
          <span className="text-xs font-bold font-mono tracking-widest text-amber-900 bg-amber-100/80 px-3 py-0.5 rounded-full border border-amber-300">
            BHUBANESWAR #Zero_Food_Waste PILOT
          </span>
          <span className="text-xs tracking-widest uppercase font-serif">❖ ❖ ❖</span>
        </div>

        {/* Traditional Diya & Namaste Anjali Mudra Icon */}
        <div className="relative mx-auto mb-4 w-24 h-24 flex items-center justify-center">
          {/* Pulsating Diya Light Halo */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 opacity-30 animate-ping" />
          <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-amber-200 via-orange-300 to-amber-100 blur-sm" />
          
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-xl border-2 border-amber-200">
            {/* Namaste Emoji / Folded Hands with Gold Shimmer */}
            <span className="text-4xl animate-bounce" role="img" aria-label="Namaste">
              🙏
            </span>
          </div>
        </div>

        {/* Greetings Display */}
        <div className="min-h-[140px] flex flex-col justify-center transition-all duration-500">
          <span className="text-xs font-black uppercase tracking-widest text-amber-800 mb-1">
            {currentGreeting.lang} Greeting
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-amber-950 tracking-tight mb-1 font-serif drop-shadow-xs">
            {currentGreeting.script}
          </h2>

          <p className="text-xs font-bold text-amber-700 font-mono tracking-wide mb-2">
            ({currentGreeting.phonetic})
          </p>

          <p className="text-xs sm:text-sm font-semibold text-stone-700 max-w-sm mx-auto leading-relaxed italic">
            "{currentGreeting.subtext}"
          </p>

          <p className="text-[11px] text-stone-500 max-w-xs mx-auto mt-1">
            {currentGreeting.translation}
          </p>
        </div>

        {/* Traditional Temple Footer Motif */}
        <div className="my-5 flex items-center justify-center gap-2">
          {greetings.map((g, idx) => (
            <button
              key={g.lang}
              onClick={() => setActiveLangIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                activeLangIndex === idx
                  ? 'w-8 bg-amber-600 shadow-xs'
                  : 'w-2.5 bg-amber-300 hover:bg-amber-400'
              }`}
              title={`Switch to ${g.lang}`}
            />
          ))}
        </div>

        {/* Sacred Shloka & Enter CTA */}
        <div className="p-3 bg-white/70 rounded-2xl border border-amber-200/80 mb-5 text-xs text-amber-950 font-medium">
          <div className="font-serif font-black text-amber-900 text-sm">
            ଅନ୍ନଂ ବହୁ କୁର୍ବୀତ ତଦ୍ ବ୍ରତମ୍
          </div>
          <div className="text-[11px] text-stone-500 mt-0.5">
            "Food shall be grown in plenty and shared in abundance without waste."
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-orange-700/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>Enter FoodBridge &bull; ପ୍ରବେଶ କରନ୍ତୁ</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Dismiss subtle close */}
        <button
          onClick={onClose}
          className="mt-3 text-xs text-stone-400 hover:text-stone-600 transition"
        >
          Skip animation & continue
        </button>
      </div>
    </div>
  );
};
