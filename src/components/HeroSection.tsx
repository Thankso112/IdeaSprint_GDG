import React from 'react';
import { Sparkles, Clock, ShieldCheck, MapPin, ArrowRight, Utensils } from 'lucide-react';

interface HeroSectionProps {
  currentRole: 'donor' | 'receiver';
  onActionClick: () => void;
  availableMealsCount: number;
  totalPickupsCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentRole,
  onActionClick,
  availableMealsCount,
  totalPickupsCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl mb-8">
      {/* Background ambient glow & pattern */}
      <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-amber-400/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-12 max-w-4xl">
        {/* Track Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold mb-4 backdrop-blur-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Hackathon Track #Zero_Food_Waste</span>
          <span className="text-emerald-300">·</span>
          <span>Hyperlocal Pilot</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight sm:leading-tight mb-4">
          Surplus food to someone's plate, <br className="hidden sm:inline" />
          <span className="text-emerald-300 underline decoration-amber-400 decoration-wavy decoration-2">
            in under 30 minutes.
          </span>
        </h1>

        <p className="text-stone-200 text-sm sm:text-base md:text-lg max-w-2xl font-normal mb-6 leading-relaxed">
          Instantly connect banquet caterers, restaurants, and university messes with verified local shelters
          and volunteers. Powered by Gemini Vision AI for instant freshness, allergens, and portion verification.
        </p>

        {/* Action button & Highlights */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={onActionClick}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm sm:text-base bg-emerald-400 hover:bg-emerald-300 text-emerald-950 transition-all shadow-lg shadow-emerald-900/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            {currentRole === 'donor' ? (
              <>
                <Utensils className="w-5 h-5" />
                <span>Snap & Post Surplus Food</span>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                <span>Explore Nearby Surplus Food ({availableMealsCount} Available)</span>
              </>
            )}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-emerald-700/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/60 flex items-center justify-center text-emerald-300 border border-emerald-600/50">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-stone-100">Gemini Vision AI</p>
              <p className="text-[11px] text-emerald-200/80">Auto-identifies food & portions</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/60 flex items-center justify-center text-emerald-300 border border-emerald-600/50">
              <Clock className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-stone-100">Live Expiry Timers</p>
              <p className="text-[11px] text-emerald-200/80">Hyperlocal &lt; 2h urgency routing</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-700/60 flex items-center justify-center text-emerald-300 border border-emerald-600/50">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm text-stone-100">Zero Food Waste</p>
              <p className="text-[11px] text-emerald-200/80">{totalPickupsCount}+ rescue pickups recorded</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
