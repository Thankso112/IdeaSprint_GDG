import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Info, 
  Utensils, 
  Loader2,
  Phone,
  User,
  ShieldCheck,
  RotateCcw,
  Sun,
  Sunrise,
  Moon,
  AlertOctagon,
  PhoneCall,
  Zap,
  CalendarClock
} from 'lucide-react';
import { FoodListing, FoodCategory, FoodType } from '../types';
import { analyzeFoodPhoto, FoodAnalysisResponse } from '../services/geminiService';
import { DEMO_PRESET_FOODS } from '../data/mockData';

// 30-minute pickup slots with 30-minute intervals across Morning, Afternoon, Evening
const TIME_SLOTS = {
  morning: {
    label: 'Morning (7–9, 10–12)',
    icon: Sunrise,
    slots: [
      '7:00 AM – 7:30 AM',
      '8:00 AM – 8:30 AM',
      '10:00 AM – 10:30 AM',
      '11:00 AM – 11:30 AM',
    ],
  },
  afternoon: {
    label: 'Afternoon (2–4 PM)',
    icon: Sun,
    slots: [
      '2:00 PM – 2:30 PM',
      '3:00 PM – 3:30 PM',
    ],
  },
  evening: {
    label: 'Evening (5–11 PM)',
    icon: Moon,
    slots: [
      '5:00 PM – 5:30 PM',
      '6:00 PM – 6:30 PM',
      '7:00 PM – 7:30 PM',
      '8:00 PM – 8:30 PM',
      '9:00 PM – 9:30 PM',
      '10:00 PM – 10:30 PM',
    ],
  },
};

interface DonorPostFormProps {
  onPostSuccess: (listing: FoodListing) => void;
  onCancel: () => void;
}

export const DonorPostForm: React.FC<DonorPostFormProps> = ({
  onPostSuccess,
  onCancel,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image & AI state
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form Fields
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('cooked meal');
  const [vegOrNonVeg, setVegOrNonVeg] = useState<FoodType>('veg');
  const [servings, setServings] = useState<number>(30);
  const [allergens, setAllergens] = useState<string>('dairy, gluten');
  const [safeHours, setSafeHours] = useState<number>(4);
  const [storageTip, setStorageTip] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [aiVerified, setAiVerified] = useState(false);

  // Donor Pickup Details & Time Slots
  const [donorName, setDonorName] = useState('Mayfair Lagoon Banquets');
  const [donorType, setDonorType] = useState<FoodListing['donorType']>('caterer');
  const [pickupAddress, setPickupAddress] = useState('8-B Jayadev Vihar, Mayfair Road, Bhubaneswar');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number }>({
    lat: 20.3048,
    lng: 85.8252,
  });
  const [pickupWindow, setPickupWindow] = useState('5:00 PM – 5:30 PM');
  const [activeSlotPeriod, setActiveSlotPeriod] = useState<'morning' | 'afternoon' | 'evening'>('evening');
  const [isEmergency, setIsEmergency] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('+91 94370 99999');
  const [isCustomWindow, setIsCustomWindow] = useState(false);
  const [contactName, setContactName] = useState('Chef Rajesh Pattnaik');
  const [donorPhone, setDonorPhone] = useState('+91 94370 12345');
  const [isLocating, setIsLocating] = useState(false);

  // Handle Photo Upload
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      await triggerGeminiAnalysis(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Trigger Gemini Analysis
  const triggerGeminiAnalysis = async (base64Image: string, mimeType: string) => {
    setIsAnalyzing(true);
    setAiError(null);

    try {
      const result: FoodAnalysisResponse = await analyzeFoodPhoto(base64Image, mimeType);
      
      // Auto-fill form fields
      setFoodName(result.food_name);
      setCategory(result.category);
      setVegOrNonVeg(result.veg_or_nonveg);
      setServings(result.estimated_servings);
      setAllergens(result.possible_allergens.join(', '));
      setSafeHours(result.safe_to_consume_within_hours);
      setStorageTip(result.storage_tip);
      setShortDescription(result.short_description);
      setAiVerified(true);
      setAnalysisDone(true);
    } catch (err: any) {
      console.error(err);
      setAiError('AI analysis encountered an issue, but you can enter details manually below.');
      setAiVerified(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Use preset demo food
  const handleSelectPreset = (preset: (typeof DEMO_PRESET_FOODS)[0]) => {
    setSelectedImage(preset.imageUrl);
    setIsAnalyzing(true);
    setTimeout(() => {
      setFoodName(preset.analysis.food_name);
      setCategory(preset.analysis.category as FoodCategory);
      setVegOrNonVeg(preset.analysis.veg_or_nonveg as FoodType);
      setServings(preset.analysis.estimated_servings);
      setAllergens(preset.analysis.possible_allergens.join(', '));
      setSafeHours(preset.analysis.safe_to_consume_within_hours);
      setStorageTip(preset.analysis.storage_tip);
      setShortDescription(preset.analysis.short_description || '');
      setAiVerified(true);
      setAnalysisDone(true);
      setIsAnalyzing(false);
    }, 600);
  };

  // Geolocation "Use My Location"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setPickupAddress('Master Canteen, Station Square, Bhubaneswar (Default location)');
      setPickupCoords({ lat: 20.2668, lng: 85.8436 });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPickupCoords({ lat: latitude, lng: longitude });
        setPickupAddress(`GPS Picked: ${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E, Bhubaneswar`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        // Fallback to central Bhubaneswar
        setPickupAddress('KIIT Square, Patia, Bhubaneswar (Auto-assigned)');
        setPickupCoords({ lat: 20.3533, lng: 85.8189 });
        setIsLocating(false);
      },
      { timeout: 7000 }
    );
  };

  // Submit Listing
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!foodName.trim()) {
      alert('Please specify the food name or upload a photo.');
      return;
    }

    const now = Date.now();
    const expiresAt = new Date(now + safeHours * 3600 * 1000).toISOString();

    const newListing: FoodListing = {
      id: `food_${Date.now()}`,
      foodName,
      category,
      vegOrNonVeg,
      servings: Number(servings) || 20,
      possibleAllergens: allergens
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      safeToConsumeWithinHours: Number(safeHours) || 4,
      postedAt: new Date().toISOString(),
      expiresAt,
      storageTip: storageTip || 'Keep covered in clean insulated food containers.',
      shortDescription: shortDescription || 'Freshly prepared surplus food ready for redistribution.',
      imageUrl: selectedImage || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
      aiVerified: aiVerified,
      status: 'available',
      donorName,
      donorType,
      donorPhone,
      pickupAddress,
      location: {
        lat: pickupCoords.lat,
        lng: pickupCoords.lng,
        address: pickupAddress,
      },
      pickupWindow: isEmergency ? 'Immediate Pickup (< 30 Mins)' : (pickupWindow || '5:00 PM – 5:30 PM'),
      isEmergency,
      emergencyPhone: isEmergency ? emergencyPhone : undefined,
      contactName,
      donorRating: 4.9,
      donorReviewCount: 16,
      pickupSuccessRate: 98,
      successfulDonationsCount: 14,
      isVerifiedDonor: true,
    };

    onPostSuccess(newListing);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200 p-6 sm:p-8">
      {/* Header */}
      <div className="border-b border-stone-100 pb-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Donor Portal
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-2">
              Post Surplus Food
            </h2>
            <p className="text-stone-500 text-sm mt-1">
              Snap a photo. Our Gemini Vision AI will inspect safety, estimate servings, and alert local NGOs.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-stone-400 hover:text-stone-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* 1. Photo Capture & AI Inspection Section */}
      <div className="mb-8 bg-stone-50 rounded-2xl p-4 sm:p-6 border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-bold text-stone-800 flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-emerald-600" />
            <span>Step 1: Upload or Capture Food Photo</span>
          </label>
          {aiVerified && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              AI Verified
            </span>
          )}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleImageFileChange}
          className="hidden"
        />

        {/* Upload Box / Image Preview */}
        {!selectedImage ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-8 text-center cursor-pointer bg-white transition hover:bg-emerald-50/20 group"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <p className="font-bold text-stone-800 text-base mb-1">
              Click to take photo or upload image
            </p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Supports JPEG, PNG, WEBP. Gemini automatically extracts dish name, veg/non-veg, allergens, and shelf life.
            </p>
          </div>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 group">
            <img
              src={selectedImage}
              alt="Food Preview"
              className="w-full h-56 sm:h-64 object-cover opacity-90"
            />
            {isAnalyzing && (
              <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white px-4">
                <div className="relative mb-3">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-amber-300 absolute inset-0 m-auto animate-pulse" />
                </div>
                <p className="font-bold text-base text-stone-100">
                  Gemini Flash is analyzing food...
                </p>
                <p className="text-xs text-stone-300 mt-1 text-center max-w-xs">
                  Inspecting portion size, allergens, category & safe consumption hours...
                </p>
              </div>
            )}
            {!isAnalyzing && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-stone-900/80 hover:bg-stone-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-xs flex items-center gap-1.5 shadow"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Demo Presets Bar */}
        <div className="mt-4 pt-4 border-t border-stone-200">
          <p className="text-xs font-semibold text-stone-600 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Or click a demo food preset for instant testing:</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEMO_PRESET_FOODS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
              >
                <img
                  src={preset.imageUrl}
                  alt={preset.title}
                  className="w-8 h-8 rounded-lg object-cover"
                />
                <span className="text-[11px] font-medium text-stone-700 truncate leading-tight group-hover:text-emerald-800">
                  {preset.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Success or Error feedback */}
        {analysisDone && !aiError && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Gemini Vision AI Analysis Completed!</p>
              <p className="text-emerald-700 mt-0.5">
                Fields have been auto-populated below. Feel free to adjust any values before posting.
              </p>
            </div>
          </div>
        )}

        {aiError && (
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>{aiError}</p>
          </div>
        )}
      </div>

      {/* 2. Form Details (Auto-filled by AI & editable) */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-600" />
            <span>Step 2: Food & Safety Verification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Food Name */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Food Name / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Shahi Paneer & Jeera Rice Buffet"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FoodCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="cooked meal">Cooked Meal (Buffet/Curry/Rice)</option>
                <option value="bakery">Bakery (Bread/Rolls/Pastries)</option>
                <option value="fruits & veg">Fruits & Vegetables (Produce)</option>
                <option value="packaged">Packaged (Dairy/Juice/Dry Goods)</option>
              </select>
            </div>

            {/* Veg / Non-Veg */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Dietary Type
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVegOrNonVeg('veg')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    vegOrNonVeg === 'veg'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Pure Veg (🌱)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVegOrNonVeg('non-veg')}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    vegOrNonVeg === 'non-veg'
                      ? 'bg-rose-50 border-rose-500 text-rose-800'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>Non-Veg (🍗)</span>
                </button>
              </div>
            </div>

            {/* Estimated Servings */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Estimated Servings (Adult Meals) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={servings}
                onChange={(e) => setServings(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>

            {/* Safe to consume within hours */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Safe Shelf Life (Hours remaining) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="48"
                  required
                  value={safeHours}
                  onChange={(e) => setSafeHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-medium">
                  hours
                </span>
              </div>
            </div>

            {/* Allergens */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Possible Allergens (comma separated)
              </label>
              <input
                type="text"
                value={allergens}
                onChange={(e) => setAllergens(e.target.value)}
                placeholder="e.g. dairy, gluten, nuts, none"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Storage Tip */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Storage & Handling Safety Tip
              </label>
              <input
                type="text"
                value={storageTip}
                onChange={(e) => setStorageTip(e.target.value)}
                placeholder="e.g. Keep warm in chafing trays above 60°C or chill immediately"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Short Description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Short Visual Assessment & Description
              </label>
              <textarea
                rows={2}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Condition, packaging, and food freshness notes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* 3. Pickup & Location Details */}
        <div className="border-t border-stone-100 pt-6">
          <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Step 3: Pickup Location & Contact Info</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Donor Entity Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Donor Name / Establishment
              </label>
              <input
                type="text"
                required
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="e.g. Hotel Swosti Grand / KIIT Mess"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
              />
            </div>

            {/* Donor Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Establishment Type
              </label>
              <select
                value={donorType}
                onChange={(e) => setDonorType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              >
                <option value="restaurant">Restaurant / Cafe</option>
                <option value="caterer">Banquet / Wedding Caterer</option>
                <option value="hostel mess">Hostel / Campus Mess</option>
                <option value="event host">Temple / Community Event Host</option>
                <option value="supermarket">Grocery / Supermarket</option>
              </select>
            </div>

            {/* Pickup Address with Geolocation */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  Pickup Address (Bhubaneswar Pilot) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  disabled={isLocating}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200 transition"
                >
                  {isLocating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  <span>Use My Location</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Street address, landmark, area in Bhubaneswar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>

            {/* Structured Pickup Window & Emergency Contact Section */}
            <div className="sm:col-span-2 space-y-3.5 bg-stone-50/70 p-4 sm:p-5 rounded-2xl border border-stone-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-emerald-600" />
                    <span>Pickup Window & Time Slots <span className="text-rose-500">*</span></span>
                  </label>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Select a 30-minute handover window or activate immediate emergency rescue.
                  </p>
                </div>

                {/* Emergency Urgent Rescue Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsEmergency(!isEmergency);
                    if (!isEmergency) {
                      setPickupWindow('Immediate Pickup (< 30 Mins)');
                    } else {
                      setPickupWindow('5:00 PM – 5:30 PM');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs ${
                    isEmergency
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400 animate-pulse'
                      : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>{isEmergency ? '🚨 Emergency Mode Active' : '🚨 Urgent / Emergency Pickup (<30m)'}</span>
                </button>
              </div>

              {/* If Emergency Mode is Active */}
              {isEmergency ? (
                <div className="p-3.5 bg-rose-50 border-2 border-rose-200 rounded-xl space-y-2.5 animate-fade-in">
                  <div className="flex items-start gap-2 text-rose-950 text-xs">
                    <Zap className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-rose-900">
                        Immediate Collection Dispatch Mode
                      </p>
                      <p className="text-[11px] text-rose-700 mt-0.5">
                        This surplus food will be flagged with a pulsing <strong>CRITICAL RESCUE</strong> badge on the NGO map, prioritized by Gemini dispatch matching, and broadcast instantly.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-900 mb-1 flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                      <span>Direct Emergency Contact / Gate Phone <span className="text-rose-600">*</span></span>
                    </label>
                    <input
                      type="tel"
                      required={isEmergency}
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      placeholder="+91 94370 99999 (Kitchen Dispatch Desk)"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-bold text-rose-950"
                    />
                  </div>
                </div>
              ) : (
                /* Scheduled 30-Minute Slots with 30-Minute Gap */
                <div className="space-y-3">
                  {/* Period Tabs: Morning, Afternoon, Evening */}
                  <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl">
                    {(Object.keys(TIME_SLOTS) as Array<keyof typeof TIME_SLOTS>).map((periodKey) => {
                      const period = TIME_SLOTS[periodKey];
                      const Icon = period.icon;
                      const isActive = activeSlotPeriod === periodKey;

                      return (
                        <button
                          key={periodKey}
                          type="button"
                          onClick={() => {
                            setActiveSlotPeriod(periodKey);
                            setIsCustomWindow(false);
                          }}
                          className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                            isActive
                              ? 'bg-white text-stone-900 shadow-sm'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-stone-400'}`} />
                          <span className="truncate">{period.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 30-Minute Slot Buttons Grid */}
                  {!isCustomWindow ? (
                    <div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {TIME_SLOTS[activeSlotPeriod].slots.map((slot) => {
                          const isSelected = pickupWindow === slot;

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setPickupWindow(slot)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                                  : 'bg-white text-stone-700 border-stone-200 hover:bg-emerald-50/60 hover:border-emerald-300'
                              }`}
                            >
                              <span className="truncate font-mono">{slot}</span>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 ml-1 text-white" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Window readout & Custom Toggle */}
                      <div className="mt-2.5 flex items-center justify-between text-xs text-stone-500 pt-1">
                        <span className="flex items-center gap-1 text-stone-700">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Selected Handover: <strong className="text-emerald-800 font-bold">{pickupWindow}</strong></span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCustomWindow(true)}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
                        >
                          Enter custom time window
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Custom Window Fallback */
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-stone-700">
                          Custom Pickup Window:
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCustomWindow(false);
                            setPickupWindow(TIME_SLOTS[activeSlotPeriod].slots[0]);
                          }}
                          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline"
                        >
                          Back to 30-min presets
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={pickupWindow}
                          onChange={(e) => setPickupWindow(e.target.value)}
                          placeholder="e.g. 4:00 PM – 4:30 PM (or Available now until 5:00 PM)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs font-semibold"
                        />
                        <Clock className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Person */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Coordinator / Chef Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Chef Rajesh Pattnaik"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <User className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
              </div>
            </div>

            {/* Donor Phone */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Coordinator Phone Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  placeholder="+91 94370 12345"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute right-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-sm transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-7 py-3 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Publish Surplus Food Listing</span>
          </button>
        </div>
      </form>
    </div>
  );
};
