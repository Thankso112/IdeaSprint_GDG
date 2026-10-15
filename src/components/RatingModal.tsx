import React, { useState } from 'react';
import { Star, X, Check, Heart, ShieldCheck } from 'lucide-react';
import { FoodListing } from '../types';

interface RatingModalProps {
  listing: FoodListing | null;
  role: 'donor' | 'receiver';
  onClose: () => void;
  onSubmitRating: (listingId: string, stars: number, comment?: string) => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  listing,
  role,
  onClose,
  onSubmitRating,
}) => {
  if (!listing) return null;

  const [stars, setStars] = useState<number>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [comment, setComment] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const existingRating = role === 'receiver' ? listing.receiverRating : listing.donorRatingForReceiver;

  const quickTags = role === 'receiver' 
    ? ['Food was warm & fresh', 'Neatly packed in containers', 'Fast & courteous handover', 'Portions matched description']
    : ['Prompt pickup arrival', 'Brought thermal containers', 'Courteous volunteer', 'Smooth digital verification'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = selectedTag ? (comment ? `${selectedTag} — ${comment}` : selectedTag) : comment;
    onSubmitRating(listing.id, stars, finalComment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900 leading-tight">
              {role === 'receiver' ? 'Rate Donor Experience' : 'Rate NGO Collection'}
            </h3>
            <p className="text-xs text-stone-500">
              Zero Food Waste Trust & Quality Score
            </p>
          </div>
        </div>

        {/* Listing Mini card */}
        <div className="my-4 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
          <img
            src={listing.imageUrl}
            alt={listing.foodName}
            className="w-12 h-12 rounded-xl object-cover shrink-0"
          />
          <div className="truncate text-xs">
            <p className="font-bold text-stone-900 truncate">{listing.foodName}</p>
            <p className="text-stone-500 truncate">
              {role === 'receiver' ? listing.donorName : listing.claimedBy?.organization || 'Volunteer Shelter'}
            </p>
          </div>
        </div>

        {existingRating ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-6 h-6 ${s <= existingRating.stars ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                />
              ))}
            </div>
            <p className="font-bold text-sm text-emerald-900">
              You already rated this pickup {existingRating.stars} Stars!
            </p>
            {existingRating.comment && (
              <p className="text-xs text-emerald-800 mt-1 italic">
                "{existingRating.comment}"
              </p>
            )}
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star selector */}
            <div className="text-center py-2">
              <label className="block text-xs font-bold text-stone-600 mb-2">
                How was the surplus food condition and handover?
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = (hoveredStar !== null ? hoveredStar : stars) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onMouseEnter={() => setHoveredStar(starValue)}
                      onMouseLeave={() => setHoveredStar(null)}
                      onClick={() => setStars(starValue)}
                      className="p-1 hover:scale-115 transition-transform"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold text-amber-600 mt-1 block">
                {stars === 5 ? '5 Stars - Outstanding & Fresh!' : stars === 4 ? '4 Stars - Very Good' : stars === 3 ? '3 Stars - Average' : 'Needs Improvement'}
              </span>
            </div>

            {/* Quick tags */}
            <div>
              <p className="text-[11px] font-bold text-stone-500 mb-1.5 uppercase tracking-wider">
                Quick Highlights:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-xl border transition ${
                      selectedTag === tag
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Additional Feedback Note (Optional)
              </label>
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share praise or suggestions to help our community..."
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-stone-600 font-bold text-xs hover:bg-stone-100"
              >
                Skip for now
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition"
              >
                Submit Rating
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
