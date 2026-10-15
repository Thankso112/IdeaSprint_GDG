import React from 'react';
import { BellRing, X, ArrowRight, Sparkles } from 'lucide-react';
import { FoodListing } from '../types';

interface ToastNotificationProps {
  notification: {
    listing: FoodListing;
    timestamp: string;
  } | null;
  onClose: () => void;
  onViewListing: (listing: FoodListing) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  notification,
  onClose,
  onViewListing,
}) => {
  if (!notification) return null;
  const { listing } = notification;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-bounce-subtle pointer-events-auto">
      <div className="bg-stone-900 text-white rounded-2xl p-4 shadow-2xl border border-stone-700/80 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
          <BellRing className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 truncate">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              New Surplus Food Posted!
            </span>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-0.5 rounded transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h5 className="font-extrabold text-sm text-stone-100 truncate">
            {listing.foodName}
          </h5>
          <p className="text-xs text-stone-300 truncate">
            {listing.servings} servings · {listing.donorName}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => {
                onViewListing(listing);
                onClose();
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1"
            >
              <span>View & Claim</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-stone-400 hover:text-stone-200 text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
