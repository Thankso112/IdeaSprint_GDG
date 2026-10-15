import React, { useState, useEffect } from 'react';
import { 
  X, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Globe2, 
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { FoodListing } from '../types';
import { generateUrgentAlert } from '../services/geminiService';

interface AlertModalProps {
  listing: FoodListing | null;
  onClose: () => void;
}

export const AlertModal: React.FC<AlertModalProps> = ({ listing, onClose }) => {
  if (!listing) return null;

  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Odia'>('English');
  const [alertText, setAlertText] = useState<string>('');
  const [urgencyLevel, setUrgencyLevel] = useState<string>('high');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchAlert = async (lang: 'English' | 'Hindi' | 'Odia') => {
    setIsLoading(true);
    setCopied(false);
    try {
      const res = await generateUrgentAlert(listing, lang);
      setAlertText(res.alertText);
      setUrgencyLevel(res.urgencyLevel);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlert(language);
  }, [language, listing.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(alertText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(alertText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm animate-fade-in">
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
          <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </span>
          <h3 className="text-xl font-black text-stone-900">
            Generate Urgent Alert
          </h3>
        </div>
        <p className="text-xs text-stone-500 mb-4">
          Draft a localized WhatsApp or SMS broadcast to notify volunteer squads & shelters instantly.
        </p>

        {/* Selected Food summary */}
        <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 mb-4 flex items-center gap-3">
          <img
            src={listing.imageUrl}
            alt={listing.foodName}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="truncate">
            <p className="font-bold text-stone-900 text-sm truncate">{listing.foodName}</p>
            <p className="text-xs text-stone-500">
              {listing.servings} servings · {listing.pickupAddress}
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Select Broadcast Language:</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'English', label: 'English' },
              { key: 'Hindi', label: 'हिंदी (Hindi)' },
              { key: 'Odia', label: 'ଓଡ଼ିଆ (Odia)' },
            ].map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setLanguage(lang.key as any)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                  language === lang.key
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generated Alert Text Box */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
            <span>Broadcast Message</span>
            <span className="text-[10px] text-amber-700 font-bold uppercase bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Urgency: {urgencyLevel}
            </span>
          </label>

          {isLoading ? (
            <div className="h-32 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-stone-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600 mb-2" />
              <span>Translating and optimizing alert with Gemini...</span>
            </div>
          ) : (
            <textarea
              rows={4}
              value={alertText}
              onChange={(e) => setAlertText(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-stone-800 font-sans leading-relaxed"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs sm:text-sm text-stone-700 flex items-center justify-center gap-2 transition"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Message</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition shadow-md shadow-emerald-700/20"
          >
            <Send className="w-4 h-4" />
            <span>Send to WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
