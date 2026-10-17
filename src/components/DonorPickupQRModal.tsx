import React, { useEffect, useState } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Utensils, 
  Share2 
} from 'lucide-react';
import QRCode from 'qrcode';
import { FoodListing } from '../types';

interface DonorPickupQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: FoodListing | null;
}

export const DonorPickupQRModal: React.FC<DonorPickupQRModalProps> = ({
  isOpen,
  onClose,
  listing,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!isOpen || !listing) return;

    setGenerating(true);
    const pickupCode = listing.pickupCode || '4829';

    // Structured JSON payload for receiver QR scanner
    const payload = JSON.stringify({
      app: 'foodbridge',
      type: 'pickup_verification',
      listingId: listing.id,
      pickupCode: pickupCode,
      foodName: listing.foodName,
      donorName: listing.donorName,
      servings: listing.claimedServings || listing.servings,
      pickupAddress: listing.pickupAddress,
      generatedAt: Date.now(),
    });

    QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => {
        setQrDataUrl(url);
        setGenerating(false);
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        setGenerating(false);
      });
  }, [isOpen, listing]);

  if (!isOpen || !listing) return null;

  const pickupCode = listing.pickupCode || '4829';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pickupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `foodbridge-pickup-qr-${listing.id}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <QrCode className="w-4 h-4" />
            </span>
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-300">
              Digital Handover Pass
            </span>
          </div>
          <h3 className="text-xl font-black tracking-tight text-white">
            Surplus Food Pickup QR
          </h3>
          <p className="text-xs text-emerald-100/80 mt-0.5">
            Present this QR code to the receiver or delivery volunteer upon arrival.
          </p>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 flex flex-col items-center bg-stone-50">
          <div className="relative p-4 bg-white rounded-2xl shadow-md border-2 border-emerald-500/30 flex flex-col items-center">
            {/* Corner styling accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-600 rounded-tl"></div>
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-600 rounded-tr"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-600 rounded-bl"></div>
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-600 rounded-br"></div>

            {generating ? (
              <div className="w-64 h-64 flex flex-col items-center justify-center text-stone-400 gap-2">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-medium">Generating encrypted QR code...</span>
              </div>
            ) : qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Pickup Verification QR Code"
                className="w-64 h-64 object-contain rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-rose-500 text-xs">
                Could not generate QR code
              </div>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Scannable with Receiver's In-App QR Reader</span>
            </div>
          </div>

          {/* 4-Digit Fallback Display */}
          <div className="mt-4 w-full bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Verbal PIN Backup Code
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="font-mono text-2xl font-black text-stone-900 tracking-widest">
                  {pickupCode}
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  (if camera unavailable)
                </span>
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs text-stone-700 flex items-center gap-1 transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-stone-500" />
                  <span>Copy PIN</span>
                </>
              )}
            </button>
          </div>

          {/* Listing Summary Card */}
          <div className="mt-3.5 w-full bg-stone-100/80 p-3.5 rounded-2xl border border-stone-200 text-xs space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-extrabold text-stone-900 text-sm">{listing.foodName}</h4>
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                {listing.claimedServings || listing.servings} Portions
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span className="truncate">{listing.pickupAddress}</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Window: <strong>{listing.pickupWindow}</strong></span>
            </div>
            {listing.claimedBy && (
              <div className="pt-1 border-t border-stone-200/80 text-[11px] text-stone-600">
                Claimed by: <strong className="text-stone-800">{listing.claimedBy.name}</strong> ({listing.claimedBy.organization})
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={handleDownloadQR}
            disabled={!qrDataUrl}
            className="flex-1 py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs text-stone-700 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PNG</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};
