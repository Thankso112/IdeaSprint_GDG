import React, { useState } from 'react';
import { 
  X, 
  Utensils, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Minus, 
  Plus, 
  Sparkles,
  SendHorizontal,
  Building2
} from 'lucide-react';
import { FoodListing, ReceiverProfile } from '../types';

interface ClaimQuantityModalProps {
  listing: FoodListing | null;
  receiver: ReceiverProfile;
  onClose: () => void;
  onSubmitRequest: (listing: FoodListing, requestedServings: number) => void;
}

export const ClaimQuantityModal: React.FC<ClaimQuantityModalProps> = ({
  listing,
  receiver,
  onClose,
  onSubmitRequest,
}) => {
  if (!listing) return null;

  const maxServings = listing.remainingServings !== undefined ? listing.remainingServings : listing.servings;
  
  // Default to min between receiver capacity and available servings
  const defaultQuantity = Math.min(receiver.capacity || 30, maxServings);
  const [quantity, setQuantity] = useState<number>(Math.max(1, defaultQuantity));

  const handleIncrement = () => {
    if (quantity < maxServings) setQuantity(quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleQuickSelect = (amount: number) => {
    const clamped = Math.min(Math.max(1, amount), maxServings);
    setQuantity(clamped);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRequest(listing, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-stone-950/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              Request Food Servings
            </h3>
            <p className="text-xs text-stone-500">
              Specify how many portions your shelter/NGO needs from this batch.
            </p>
          </div>
        </div>

        {/* Listing preview */}
        <div className="my-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3.5">
          <img
            src={listing.imageUrl}
            alt={listing.foodName}
            className="w-14 h-14 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 truncate">
            <h4 className="font-extrabold text-stone-900 text-sm truncate">{listing.foodName}</h4>
            <div className="flex items-center gap-2 text-xs text-stone-500 mt-0.5">
              <span>{listing.donorName}</span>
              <span>&bull;</span>
              <span className="font-bold text-emerald-700">{maxServings} total available</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-500 mt-1 font-mono">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>Slot: {listing.pickupWindow}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity Selector Section */}
          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2">
              Select Servings Needed (Adult Meals)
            </label>

            {/* Stepper Input */}
            <div className="flex items-center justify-center gap-3 my-1">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-10 h-10 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 flex items-center justify-center text-emerald-900 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="w-28 text-center">
                <input
                  type="number"
                  min="1"
                  max={maxServings}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (!isNaN(val)) handleQuickSelect(val);
                  }}
                  className="w-full text-center font-mono font-black text-3xl text-emerald-950 bg-transparent focus:outline-none"
                />
                <span className="text-[11px] font-semibold text-emerald-700 block">
                  of {maxServings} servings
                </span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= maxServings}
                className="w-10 h-10 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-50 flex items-center justify-center text-emerald-900 font-bold transition disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-emerald-200/60 flex-wrap">
              <button
                type="button"
                onClick={() => handleQuickSelect(maxServings)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  quantity === maxServings
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Full Batch ({maxServings})
              </button>
              {maxServings >= 10 && (
                <button
                  type="button"
                  onClick={() => handleQuickSelect(Math.floor(maxServings / 2))}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    quantity === Math.floor(maxServings / 2)
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  Half Batch ({Math.floor(maxServings / 2)})
                </button>
              )}
              {receiver.capacity && receiver.capacity < maxServings && (
                <button
                  type="button"
                  onClick={() => handleQuickSelect(receiver.capacity)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    quantity === receiver.capacity
                      ? 'bg-emerald-700 text-white shadow-2xs'
                      : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  My Shelter Capacity ({receiver.capacity})
                </button>
              )}
            </div>

            {/* Projected Impact pill */}
            <div className="mt-2.5 text-xs text-emerald-800 font-medium flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rescues ~<strong>{(quantity * 0.4).toFixed(1)} kg</strong> of surplus food</span>
            </div>
          </div>

          {/* 2-minute confirmation note */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">2-Minute Donor Acceptance Protocol</p>
              <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                Once placed, {listing.donorName} has <strong>2 minutes</strong> to confirm packaging for {quantity} portions. If not confirmed, we'll automatically route you to similar available meals nearby!
              </p>
            </div>
          </div>

          {/* Receiver Destination Info */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs flex items-center justify-between text-stone-600">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-400" />
              <div>
                <span className="font-bold text-stone-800">{receiver.organization}</span>
                <span className="block text-[11px] text-stone-500 truncate max-w-[220px]">
                  {receiver.location.address}
                </span>
              </div>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">Verified NGO</span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs sm:text-sm text-stone-600 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white transition-all shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Send Request ({quantity} Servings)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
