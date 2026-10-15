import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  Phone, 
  AlertCircle, 
  ShieldCheck,
  Plus,
  KeyRound,
  Check,
  Star,
  Award,
  Sparkles,
  BellRing,
  XCircle,
  Utensils
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodListing } from '../types';
import { calculateHoursRemaining } from '../services/geminiService';

interface DonorListingsProps {
  listings: FoodListing[];
  onAddNew: () => void;
  onDeleteListing?: (id: string) => void;
  onVerifyPickup: (listingId: string, inputCode: string) => boolean;
  onOpenRating: (listing: FoodListing) => void;
  onAcceptPendingRequest: (listingId: string) => void;
  onDeclinePendingRequest: (listingId: string) => void;
}

export const DonorListings: React.FC<DonorListingsProps> = ({
  listings,
  onAddNew,
  onDeleteListing,
  onVerifyPickup,
  onOpenRating,
  onAcceptPendingRequest,
  onDeclinePendingRequest,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending_donor_approval' | 'available' | 'claimed' | 'picked_up'>('all');
  
  // Verification input state mapped by listing id
  const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({});
  const [verificationErrors, setVerificationErrors] = useState<Record<string, string>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Live timer for 2-minute countdown
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatAcceptCountdown = (expiresAtTimestamp?: number) => {
    if (!expiresAtTimestamp) return '02:00';
    const remainingSeconds = Math.max(0, Math.floor((expiresAtTimestamp - Date.now()) / 1000));
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pendingRequests = listings.filter((l) => l.status === 'pending_donor_approval');

  const filteredListings = listings.filter((l) => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  const handleCodeChange = (listingId: string, val: string) => {
    // only keep numbers, max 4 digits
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    setVerificationCodes((prev) => ({ ...prev, [listingId]: cleaned }));
    if (verificationErrors[listingId]) {
      setVerificationErrors((prev) => ({ ...prev, [listingId]: '' }));
    }
  };

  const handleVerifySubmit = (listing: FoodListing) => {
    const code = verificationCodes[listing.id] || '';
    if (code.length < 4) {
      setVerificationErrors((prev) => ({
        ...prev,
        [listing.id]: 'Please enter the complete 4-digit code provided by the driver.',
      }));
      return;
    }

    setVerifyingId(listing.id);
    const success = onVerifyPickup(listing.id, code);

    if (success) {
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b', '#059669'],
        });
      } catch (e) {}
      setVerificationErrors((prev) => ({ ...prev, [listing.id]: '' }));
    } else {
      setVerificationErrors((prev) => ({
        ...prev,
        [listing.id]: `Incorrect code "${code}". Please check the 4-digit code on the receiver's "My Pickups" screen.`,
      }));
    }
    setVerifyingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Donor Trust Status Header Card */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-emerald-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Verified Donor Status
            </span>
            <span className="text-xs text-stone-300">· Trust & Reliability Score</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Mayfair Lagoon Banquets & Kitchen
          </h3>

          <div className="flex items-center gap-4 text-xs mt-2 text-emerald-100 flex-wrap">
            <div className="flex items-center gap-1 font-bold text-amber-300">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>4.9 / 5.0 Average Rating (58 reviews)</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1 font-semibold">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>100% Pickup Success Rate</span>
            </div>
            <span>·</span>
            <span>55+ Successful Meal Rescues</span>
          </div>
        </div>

        <button
          onClick={onAddNew}
          className="self-start md:self-center inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-xs sm:text-sm shadow-md transition hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Post Surplus Food</span>
        </button>
      </div>

      {/* PENDING REQUESTS URGENT BANNER (2-Min Accept Window) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-500/10 border-2 border-amber-400/80 rounded-3xl p-5 space-y-3 shadow-md animate-fade-in">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-amber-950 font-black text-sm">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping"></span>
              <BellRing className="w-4 h-4 text-amber-700" />
              <span>{pendingRequests.length} New Pickup Request(s) Awaiting Your Acceptance</span>
            </div>
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              2-Minute Acceptance Rule Active
            </span>
          </div>

          <div className="space-y-2.5">
            {pendingRequests.map((reqListing) => {
              const req = reqListing.pendingRequest;
              if (!req) return null;
              const countdown = formatAcceptCountdown(req.expiresAtTimestamp);

              return (
                <div
                  key={reqListing.id}
                  className="bg-white rounded-2xl p-4 border border-amber-300 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={reqListing.imageUrl}
                      alt={reqListing.foodName}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-stone-900 text-sm">{reqListing.foodName}</h4>
                        <span className="font-mono text-xs font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md border border-rose-200 animate-pulse">
                          ⏳ {countdown} left
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        <strong className="text-stone-800">{req.receiverOrg}</strong> ({req.receiverName}) requested{' '}
                        <strong className="text-emerald-700 font-bold">{req.requestedServings} portions</strong> (of {reqListing.servings} available).
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Slot: {reqListing.pickupWindow} &bull; Driver Phone: {req.receiverPhone}
                      </p>
                    </div>
                  </div>

                  {/* Accept / Decline actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => onDeclinePendingRequest(reqListing.id)}
                      className="px-3.5 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition"
                    >
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => onAcceptPendingRequest(reqListing.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Accept ({req.requestedServings} Servings)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 overflow-x-auto no-scrollbar">
        {[
          { key: 'all', label: 'All Listings', count: listings.length },
          { key: 'pending_donor_approval', label: 'Pending Requests', count: pendingRequests.length },
          { key: 'available', label: 'Active / Available', count: listings.filter(l => l.status === 'available').length },
          { key: 'claimed', label: 'Claimed (Ready for Handover)', count: listings.filter(l => l.status === 'claimed').length },
          { key: 'picked_up', label: 'Successfully Picked Up', count: listings.filter(l => l.status === 'picked_up').length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
              filter === tab.key
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              filter === tab.key ? 'bg-stone-700 text-stone-200' : 'bg-stone-200 text-stone-700'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings List */}
      {filteredListings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
          <div className="w-16 h-16 mx-auto bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 mb-1">No listings in this view</h3>
          <p className="text-sm text-stone-500 mb-5 max-w-sm mx-auto">
            You haven't posted any food matching this status yet. Help prevent food waste today!
          </p>
          <button
            onClick={onAddNew}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
          >
            Post Surplus Meal Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredListings.map((listing) => {
            const hoursLeft = calculateHoursRemaining(listing.expiresAt);
            const currentCodeInput = verificationCodes[listing.id] || '';
            const currentError = verificationErrors[listing.id];
            const isPending = listing.status === 'pending_donor_approval';
            const pendingCountdown = isPending ? formatAcceptCountdown(listing.pendingRequest?.expiresAtTimestamp) : null;

            return (
              <div
                key={listing.id}
                className={`bg-white rounded-3xl border shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition group ${
                  isPending ? 'border-2 border-amber-400 ring-2 ring-amber-200' : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={listing.imageUrl}
                      alt={listing.foodName}
                      className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                      <span className="bg-black/75 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                        {listing.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                      </span>
                      {listing.aiVerified && (
                        <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          AI Verified
                        </span>
                      )}
                      {listing.isEmergency && (
                        <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md animate-pulse">
                          🚨 Emergency Mode
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      {listing.status === 'available' && (
                        <span className="bg-emerald-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                          Available
                        </span>
                      )}
                      {listing.status === 'pending_donor_approval' && (
                        <span className="bg-amber-500 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md animate-pulse flex items-center gap-1">
                          ⏳ Request: {pendingCountdown}
                        </span>
                      )}
                      {listing.status === 'claimed' && (
                        <span className="bg-amber-600 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md">
                          Claimed ({listing.claimedServings || listing.servings} portions)
                        </span>
                      )}
                      {listing.status === 'picked_up' && (
                        <span className="bg-stone-800 text-white text-xs font-extrabold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Picked Up
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-stone-900 text-lg leading-snug mb-1">
                      {listing.foodName}
                    </h3>
                    <p className="text-xs text-stone-600 mb-3 line-clamp-2">
                      {listing.shortDescription}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                        <span className="text-stone-400 font-medium block text-[10px] uppercase">Servings</span>
                        <span className="font-bold text-stone-800 text-sm">
                          {listing.remainingServings !== undefined ? `${listing.remainingServings} left of ${listing.servings}` : `${listing.servings} portions`}
                        </span>
                      </div>
                      <div className="bg-stone-50 p-2 rounded-xl border border-stone-100">
                        <span className="text-stone-400 font-medium block text-[10px] uppercase">Shelf Life</span>
                        <span className={`font-bold text-sm ${hoursLeft < 2 ? 'text-rose-600' : 'text-stone-800'}`}>
                          {hoursLeft > 0 ? `${hoursLeft.toFixed(1)}h remaining` : 'Expired'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-stone-600 mb-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="truncate">{listing.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span>Slot: <strong>{listing.pickupWindow}</strong></span>
                      </div>
                    </div>

                    {/* PENDING APPROVAL STATE CARD */}
                    {listing.status === 'pending_donor_approval' && listing.pendingRequest && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Request Awaiting Confirmation:</span>
                          </span>
                          <span className="font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                            {pendingCountdown}
                          </span>
                        </div>
                        <p className="text-amber-900 text-xs">
                          <strong>{listing.pendingRequest.receiverOrg}</strong> requested{' '}
                          <strong className="text-emerald-800">{listing.pendingRequest.requestedServings} portions</strong>.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onDeclinePendingRequest(listing.id)}
                            className="flex-1 py-2 rounded-xl border border-amber-300 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            onClick={() => onAcceptPendingRequest(listing.id)}
                            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Request</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CLAIMED STATE: 4-DIGIT VERIFICATION INPUT */}
                    {listing.status === 'claimed' && (
                      <div className="mt-3 p-4 rounded-2xl bg-amber-50/80 border-2 border-amber-300 text-xs space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-amber-950 flex items-center gap-1 text-sm">
                              <KeyRound className="w-4 h-4 text-amber-600" />
                              <span>Verify Driver Pickup Code</span>
                            </p>
                            <p className="text-amber-800/80 text-[11px] mt-0.5">
                              Claimed by {listing.claimedBy?.name} ({listing.claimedBy?.organization || 'Volunteer Shelter'}).
                            </p>
                          </div>
                        </div>

                        {/* Code Verification Input Group */}
                        <div>
                          <label className="block text-[11px] font-bold text-stone-700 mb-1">
                            Enter 4-Digit Pickup Code from Receiver's App:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              maxLength={4}
                              placeholder="e.g. 4829"
                              value={currentCodeInput}
                              onChange={(e) => handleCodeChange(listing.id, e.target.value)}
                              className="w-32 px-3 py-2 text-center tracking-widest font-mono font-black text-lg bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleVerifySubmit(listing)}
                              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirm Handover</span>
                            </button>
                          </div>

                          {/* Error message */}
                          {currentError && (
                            <p className="text-[11px] font-bold text-rose-600 mt-1.5 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{currentError}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* PICKED UP STATE: RATING & SUCCESS INFO */}
                    {listing.status === 'picked_up' && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-2">
                        <div>
                          <p className="font-bold text-emerald-900 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Surplus Food Rescued!</span>
                          </p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">
                            Handover verified via 4-digit code.
                          </p>
                        </div>

                        {listing.donorRatingForReceiver ? (
                          <button
                            type="button"
                            onClick={() => onOpenRating(listing)}
                            className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1"
                          >
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>Rated {listing.donorRatingForReceiver.stars}★</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onOpenRating(listing)}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                          >
                            <Star className="w-3 h-3 text-amber-400" />
                            <span>Rate Receiver (1-5★)</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between text-xs">
                  <span className="text-stone-400">
                    Posted {new Date(listing.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {onDeleteListing && listing.status === 'available' && (
                    <button
                      onClick={() => onDeleteListing(listing.id)}
                      className="text-stone-400 hover:text-rose-600 font-medium transition"
                    >
                      Cancel Listing
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
