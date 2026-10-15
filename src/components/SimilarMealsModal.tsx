import React from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  MapPin, 
  Utensils, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  RotateCw
} from 'lucide-react';
import { FoodListing } from '../types';
import { calculateHoursRemaining } from '../services/geminiService';

interface SimilarMealsModalProps {
  expiredListing: FoodListing | null;
  requestedServings: number;
  similarListings: FoodListing[];
  onClose: () => void;
  onClaimAlternative: (listing: FoodListing) => void;
}

export const SimilarMealsModal: React.FC<SimilarMealsModalProps> = ({
  expiredListing,
  requestedServings,
  similarListings,
  onClose,
  onClaimAlternative,
}) => {
  if (!expiredListing) return null;

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Alert */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              2-Minute Acceptance Window Expired
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              <strong>{expiredListing.donorName}</strong> was unable to confirm your request for {requestedServings} servings in time.
            </p>
          </div>
        </div>

        {/* AI Recommendations Banner */}
        <div className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 mb-4 flex items-center gap-2.5">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-extrabold text-emerald-900">
              Immediate Re-Routing: Similar Quantity Surplus Meals Found!
            </p>
            <p className="text-emerald-800 text-[11px] mt-0.5">
              We found {similarListings.length} alternative surplus meals nearby that match your ~{requestedServings} serving requirement.
            </p>
          </div>
        </div>

        {/* Similar Listings Cards */}
        <div className="space-y-3 mb-5">
          {similarListings.length === 0 ? (
            <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
              No other active surplus meals available right now. Please check back shortly!
            </div>
          ) : (
            similarListings.map((alt) => {
              const hoursLeft = calculateHoursRemaining(alt.expiresAt);
              const availableQty = alt.remainingServings !== undefined ? alt.remainingServings : alt.servings;

              return (
                <div
                  key={alt.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-emerald-400 hover:shadow-md transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={alt.imageUrl}
                      alt={alt.foodName}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/75 text-white">
                          {alt.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">
                          {availableQty} Servings
                        </span>
                        {alt.isEmergency && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 animate-pulse">
                            🚨 Urgent
                          </span>
                        )}
                      </div>

                      <h5 className="font-extrabold text-stone-900 text-sm mt-1 leading-snug">
                        {alt.foodName}
                      </h5>

                      <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5">
                        <span className="truncate max-w-[140px]">{alt.donorName}</span>
                        <span>&bull;</span>
                        <span>{alt.distanceKm || 1.2} km away</span>
                        <span>&bull;</span>
                        <span className="font-mono text-emerald-700 font-bold">{hoursLeft.toFixed(1)}h safe</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClaimAlternative(alt);
                      onClose();
                    }}
                    className="self-end sm:self-center px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 shrink-0"
                  >
                    <span>Request This Meal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
          <span>Hyperlocal re-dispatch protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl font-bold text-stone-700 hover:bg-stone-100 transition"
          >
            Dismiss & Browse Map
          </button>
        </div>
      </div>
    </div>
  );
};
