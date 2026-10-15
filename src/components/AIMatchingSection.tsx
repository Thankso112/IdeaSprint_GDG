import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Sliders, 
  Loader2, 
  ArrowRight, 
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { FoodListing, ReceiverProfile, AIMatchResult } from '../types';
import { smartMatchListings, calculateHoursRemaining } from '../services/geminiService';

interface AIMatchingSectionProps {
  listings: FoodListing[];
  receiver: ReceiverProfile;
  onUpdateReceiver: (profile: ReceiverProfile) => void;
  onClaim: (listing: FoodListing) => void;
  onOpenFeed: () => void;
}

export const AIMatchingSection: React.FC<AIMatchingSectionProps> = ({
  listings,
  receiver,
  onUpdateReceiver,
  onClaim,
  onOpenFeed,
}) => {
  const [capacity, setCapacity] = useState<number>(receiver.capacity || 45);
  const [preference, setPreference] = useState<'any' | 'veg'>(receiver.preference || 'any');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [matches, setMatches] = useState<AIMatchResult[]>([]);
  const [hasRun, setHasRun] = useState<boolean>(false);

  const availableListings = listings.filter((l) => l.status === 'available');

  const runMatching = async () => {
    setIsLoading(true);
    const updatedReceiver: ReceiverProfile = {
      ...receiver,
      capacity,
      preference,
    };
    onUpdateReceiver(updatedReceiver);

    try {
      const results = await smartMatchListings(updatedReceiver, listings);
      setMatches(results);
      setHasRun(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (availableListings.length > 0 && !hasRun) {
      runMatching();
    }
  }, [availableListings.length]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-3xl p-6 sm:p-8 border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Gemini Flash Matcher
          </span>
          <span className="text-xs text-stone-500 font-medium">Bhubaneswar Hyperlocal</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          AI Smart Dispatch: Best Matches for You
        </h2>
        <p className="text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
          Gemini analyzes real-time food expiry curves, your NGO's daily hunger relief capacity,
          dietary preferences, and road distance to prioritize the top 3 meals to rescue right now.
        </p>

        {/* Receiver Profile Controls */}
        <div className="mt-6 pt-5 border-t border-stone-200/60 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          {/* Capacity Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-stone-700 mb-1">
              <span>Shelter / Batch Capacity</span>
              <span className="text-emerald-700 font-black">{capacity} people</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Preference Toggle */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Food Preference
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPreference('any')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition border ${
                  preference === 'any'
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                Any Food
              </button>
              <button
                type="button"
                onClick={() => setPreference('veg')}
                className={`flex-1 py-1.5 px-2.5 rounded-xl text-xs font-bold transition border ${
                  preference === 'veg'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                🌱 Veg Only
              </button>
            </div>
          </div>

          {/* Trigger Button */}
          <div className="flex items-end">
            <button
              onClick={runMatching}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-4 h-4" />
                  <span>Re-Rank Best Matches</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* AI Matches List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-stone-900">
            Top 3 Recommended Rescues
          </h3>
          <span className="text-xs text-stone-500 font-medium">
            Based on {receiver.organization} intake requirements
          </span>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-600 animate-spin mx-auto mb-3"></div>
            <p className="font-bold text-stone-800 text-base">Gemini is evaluating hunger relief parameters...</p>
            <p className="text-xs text-stone-500 mt-1">Cross-referencing batch portions, expiry risk, and location.</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-stone-200">
            <p className="text-stone-600 font-medium text-sm">No active surplus listings match these criteria right now.</p>
            <button
              onClick={onOpenFeed}
              className="mt-3 px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold"
            >
              View All Available Listings
            </button>
          </div>
        ) : (
          matches.map((match, idx) => {
            const listing = listings.find((l) => l.id === match.listing_id);
            if (!listing || listing.status !== 'available') return null;

            const hoursLeft = calculateHoursRemaining(listing.expiresAt);

            return (
              <div
                key={match.listing_id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Priority ribbon */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-extrabold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      Priority Score: {match.priority_score}%
                    </span>
                  </div>

                  <span className="text-xs font-mono font-bold text-stone-500">
                    Safe for: <strong className={hoursLeft < 2 ? 'text-rose-600' : 'text-emerald-700'}>{hoursLeft.toFixed(1)}h</strong>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <img
                    src={listing.imageUrl}
                    alt={listing.foodName}
                    className="w-full sm:w-36 h-28 rounded-2xl object-cover shrink-0"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-extrabold text-stone-900 text-lg">
                        {listing.foodName}
                      </h4>
                      <span className="bg-stone-100 text-stone-700 text-xs font-bold px-2 py-0.5 rounded-md">
                        {listing.servings} Servings
                      </span>
                    </div>

                    {/* Gemini's Reason */}
                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium mb-3">
                      <span className="font-bold text-emerald-900">💡 Gemini Dispatch Insight: </span>
                      {match.reason}
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{listing.donorName} · {listing.pickupAddress}</span>
                      </div>

                      <button
                        onClick={() => onClaim(listing)}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Claim This Match</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
