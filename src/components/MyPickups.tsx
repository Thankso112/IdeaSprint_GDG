import React, { useState } from 'react';
import { 
  PackageCheck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  ShieldCheck, 
  Star, 
  KeyRound, 
  Copy,
  Check, 
  Sparkles,
  Award,
  PhoneCall,
  AlertOctagon,
  Camera,
  QrCode,
  ScanLine
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FoodListing } from '../types';
import { calculateHoursRemaining } from '../services/geminiService';
import { PickupQRScannerModal } from './PickupQRScannerModal';

interface MyPickupsProps {
  claimedListings: FoodListing[];
  pendingListings?: FoodListing[];
  onMarkPickedUp: (listingId: string) => void;
  onVerifyPickup?: (listingId: string, inputCode: string) => boolean;
  onBrowseAvailable: () => void;
  onOpenRating: (listing: FoodListing) => void;
  onSimulateDonorAccept?: (listingId: string) => void;
  onSimulateTimeout?: (listingId: string) => void;
  onCancelPendingRequest?: (listingId: string) => void;
}

export const MyPickups: React.FC<MyPickupsProps> = ({
  claimedListings,
  pendingListings = [],
  onMarkPickedUp,
  onVerifyPickup,
  onBrowseAvailable,
  onOpenRating,
  onSimulateDonorAccept,
  onSimulateTimeout,
  onCancelPendingRequest,
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTargetListing, setScannerTargetListing] = useState<FoodListing | null>(null);

  const handleValidateFromQR = (listingId: string, pickupCode: string): boolean => {
    const target = claimedListings.find((l) => l.id === listingId);
    if (!target) return false;

    let success = false;
    if (onVerifyPickup) {
      success = onVerifyPickup(listingId, pickupCode);
    } else {
      onMarkPickedUp(listingId);
      success = true;
    }

    if (success) {
      setTimeout(() => {
        onOpenRating(target);
      }, 1500);
    }

    return success;
  };

  // Live timer for 2-minute countdown
  const [, setTick] = useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (expiresAtTimestamp?: number) => {
    if (!expiresAtTimestamp) return '02:00';
    const remainingSeconds = Math.max(0, Math.floor((expiresAtTimestamp - Date.now()) / 1000));
    const m = Math.floor(remainingSeconds / 60);
    const s = remainingSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyCode = (id: string, code?: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCompletePickup = (listing: FoodListing) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#f59e0b', '#059669'],
      });
    } catch (e) {}

    onMarkPickedUp(listing.id);
  };

  const activePickups = claimedListings.filter((l) => l.status === 'claimed');
  const completedPickups = claimedListings.filter((l) => l.status === 'picked_up');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-5">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            My Rescue Pickups
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Surplus food meals requested or claimed by your organization awaiting physical dispatch or completed.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {activePickups.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setScannerTargetListing(null);
                setIsScannerOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Donor QR</span>
            </button>
          )}

          <button
            onClick={onBrowseAvailable}
            className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs sm:text-sm font-bold text-stone-700 transition"
          >
            + Request More Food
          </button>
        </div>
      </div>

      {/* PENDING APPROVAL REQUESTS (2-MINUTE ACCEPT PROTOCOL) */}
      {pendingListings.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h3 className="font-extrabold text-stone-900 text-base">
                Awaiting Donor Confirmation ({pendingListings.length})
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full">
              2-Minute Acceptance Rule Active
            </span>
          </div>

          <div className="space-y-4">
            {pendingListings.map((listing) => {
              const req = listing.pendingRequest;
              const countdown = formatCountdown(req?.expiresAtTimestamp);

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl border-2 border-amber-400 p-5 shadow-md relative overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={listing.imageUrl}
                        alt={listing.foodName}
                        className="w-16 h-16 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-stone-900 text-base">{listing.foodName}</h4>
                          <span className="bg-amber-100 text-amber-900 text-xs font-black font-mono px-2.5 py-0.5 rounded-md border border-amber-300 animate-pulse">
                            ⏳ {countdown} remaining
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 mt-0.5">
                          Requested <strong className="text-emerald-700 font-bold">{req?.requestedServings || listing.servings} portions</strong> from{' '}
                          <strong className="text-stone-800">{listing.donorName}</strong> ({listing.pickupAddress})
                        </p>
                        <p className="text-[11px] text-stone-500 font-mono mt-0.5">
                          Pickup Slot: <strong>{listing.pickupWindow}</strong> &bull; Contact: {listing.contactName}
                        </p>
                      </div>
                    </div>

                    <div className="w-full sm:w-auto p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950 max-w-xs">
                      <p className="font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>2-Min Acceptance Window</span>
                      </p>
                      <p className="text-amber-800 text-[10px] mt-0.5">
                        Donor has 2 minutes to confirm kitchen packing. If expired, we'll auto-route you to nearby meals!
                      </p>
                    </div>
                  </div>

                  {/* Fast-Track Actions for Testing & Pitching */}
                  <div className="pt-3 flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-stone-500">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hackathon Test Controls:</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {onCancelPendingRequest && (
                        <button
                          type="button"
                          onClick={() => onCancelPendingRequest(listing.id)}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 font-bold text-xs transition"
                        >
                          Cancel Request
                        </button>
                      )}

                      {onSimulateTimeout && (
                        <button
                          type="button"
                          onClick={() => onSimulateTimeout(listing.id)}
                          className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs transition flex items-center gap-1"
                        >
                          <span>⚡ Test: 2-Min Timeout & Re-route</span>
                        </button>
                      )}

                      {onSimulateDonorAccept && (
                        <button
                          type="button"
                          onClick={() => onSimulateDonorAccept(listing.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>⚡ Test: Donor Accepts</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Pickups section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
          <h3 className="font-extrabold text-stone-900 text-base">
            In Transit / Awaiting Collection ({activePickups.length})
          </h3>
        </div>

        {activePickups.length === 0 && pendingListings.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 shadow-xs mb-8">
            <PackageCheck className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <h4 className="font-bold text-stone-800 text-sm">No active collections right now</h4>
            <p className="text-xs text-stone-500 mt-1 mb-4">
              Explore the live map and request food portions from nearby surplus listings.
            </p>
            <button
              onClick={onBrowseAvailable}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
            >
              Browse Hyperlocal Feed
            </button>
          </div>
        ) : activePickups.length === 0 ? (
          <div className="bg-stone-50 rounded-2xl p-4 text-center border border-stone-200 text-xs text-stone-500 mb-6">
            Orders above are waiting for donor acceptance before 4-digit handover codes are generated.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {activePickups.map((listing) => {
              const hoursLeft = calculateHoursRemaining(listing.expiresAt);
              const pickupCode = listing.pickupCode || '4829';

              return (
                <div
                  key={listing.id}
                  className="bg-white rounded-3xl border-2 border-amber-300/80 shadow-md p-5 flex flex-col justify-between relative overflow-hidden"
                >
                  <div>
                    {/* Urgency Pill & Servings */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                        ⚡ Claimed · Pick up ASAP
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-600">
                        {hoursLeft.toFixed(1)}h remaining
                      </span>
                    </div>

                    <div className="flex gap-3 mb-3">
                      <img
                        src={listing.imageUrl}
                        alt={listing.foodName}
                        className="w-20 h-20 rounded-2xl object-cover shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-base leading-snug">
                          {listing.foodName}
                        </h4>
                        <p className="text-xs font-bold text-emerald-700 mt-0.5">
                          {listing.servings} Servings · {listing.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                        </p>
                        
                        {/* Donor Trust Metrics */}
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-600 mt-1 flex-wrap">
                          <span className="flex items-center gap-0.5 text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            {listing.donorRating || 4.9}
                          </span>
                          <span className="text-stone-400">·</span>
                          <span>{listing.pickupSuccessRate || 98}% success</span>
                          {listing.isVerifiedDonor && (
                            <span className="text-emerald-700 font-bold flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 text-[10px]">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 4-DIGIT PICKUP VERIFICATION CODE BOX */}
                    <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-300 text-xs mb-3.5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          <span>4-Digit Pickup Verification Code</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(listing.id, pickupCode)}
                          className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs transition"
                        >
                          {copiedCodeId === listing.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-amber-600" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Display Code Digits */}
                      <div className="flex items-center justify-center gap-2 my-2">
                        {pickupCode.split('').map((digit, idx) => (
                          <div
                            key={idx}
                            className="w-10 h-11 rounded-xl bg-white border border-amber-300 shadow-sm flex items-center justify-center font-mono font-black text-xl text-stone-900 tracking-wider"
                          >
                            {digit}
                          </div>
                        ))}
                      </div>

                      <p className="text-[11px] text-amber-900/80 text-center font-medium mt-1">
                        Show or tell this code to <strong>{listing.contactName}</strong> at {listing.donorName} to verify collection.
                      </p>
                    </div>

                    {/* INSTANT SCANNER ACTION */}
                    <div className="mb-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setScannerTargetListing(listing);
                          setIsScannerOpen(true);
                        }}
                        className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-700/25 flex items-center justify-center gap-2 transition group"
                      >
                        <Camera className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition" />
                        <span>Scan Donor QR to Auto-Verify Pickup</span>
                        <span className="bg-white/20 text-[10px] font-black px-1.5 py-0.5 rounded">
                          Instant
                        </span>
                      </button>
                    </div>

                    {/* Emergency Hotline call banner if urgent */}
                    {listing.isEmergency && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between text-xs mb-3 animate-pulse">
                        <span className="font-extrabold text-rose-900 flex items-center gap-1 text-[11px]">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                          <span>🚨 Urgent Pickup (&lt;30m)</span>
                        </span>
                        <a
                          href={`tel:${listing.emergencyPhone || listing.donorPhone}`}
                          className="font-bold text-rose-900 hover:text-rose-950 bg-white px-2 py-0.5 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1 text-[11px]"
                        >
                          <PhoneCall className="w-3 h-3 text-rose-600" />
                          <span>Direct Hotline: {listing.emergencyPhone || listing.donorPhone}</span>
                        </a>
                      </div>
                    )}

                    {/* Donor Details Card */}
                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5 mb-4">
                      <div className="flex items-start gap-1.5 text-stone-700">
                        <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-stone-900">{listing.donorName}</strong>
                          <span className="text-stone-600">{listing.pickupAddress}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600 font-mono text-[11px] pt-0.5">
                        <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                        <span>Pickup Slot: <strong className="text-stone-800">{listing.pickupWindow}</strong></span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                        <span className="text-stone-600">Contact: {listing.contactName}</span>
                        <a
                          href={`tel:${listing.donorPhone}`}
                          className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{listing.donorPhone}</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Navigation & Scan QR & Manual Mark Picked Up */}
                  <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${listing.location.lat},${listing.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs text-stone-700 flex items-center justify-center gap-1 transition text-center"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Directions</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setScannerTargetListing(listing);
                        setIsScannerOpen(true);
                      }}
                      className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white flex items-center justify-center gap-1 transition shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Scan QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCompletePickup(listing)}
                      className="py-2 px-2.5 rounded-xl border border-stone-200 hover:bg-stone-100 font-medium text-xs text-stone-600 transition"
                      title="Manual fallback without scanning"
                    >
                      Manual
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Pickups */}
      {completedPickups.length > 0 && (
        <div className="pt-6 border-t border-stone-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-stone-900 text-base flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Rescues ({completedPickups.length})</span>
            </h3>
            <span className="text-xs text-stone-500">Rate your donor partners below</span>
          </div>

          <div className="space-y-3">
            {completedPickups.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl p-4 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-bold text-stone-900 text-sm">{listing.foodName}</h5>
                    <p className="text-stone-500">
                      {listing.servings} meals rescued from {listing.donorName} · Code: <span className="font-mono font-bold text-stone-800">{listing.pickupCode || '4829'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-xs">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    +{(listing.servings * 0.4).toFixed(1)} kg saved
                  </span>

                  {listing.receiverRating ? (
                    <button
                      onClick={() => onOpenRating(listing)}
                      className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-300 text-xs hover:bg-amber-100 transition"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Rated {listing.receiverRating.stars}★</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onOpenRating(listing)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition shadow-xs"
                    >
                      <Star className="w-3 h-3 text-amber-400" />
                      <span>Rate Donor (1-5★)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Receiver QR Scanner Reader Modal */}
      <PickupQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setScannerTargetListing(null);
        }}
        targetListing={scannerTargetListing}
        claimedListings={activePickups}
        onValidatePickup={handleValidateFromQR}
      />
    </div>
  );
};
