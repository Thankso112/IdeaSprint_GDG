import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  Share2, 
  Check, 
  Layers,
  HeartHandshake,
  Navigation,
  SlidersHorizontal,
  RotateCcw,
  Compass,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  PhoneCall,
  AlertOctagon,
  Zap,
  Flame,
  Activity
} from 'lucide-react';
import { FoodListing, ReceiverProfile, FoodCategory } from '../types';
import { calculateHoursRemaining, calculateDistance } from '../services/geminiService';
import { FoodMap } from './FoodMap';
import { GoogleFoodMap } from './GoogleFoodMap';

interface ReceiverFeedProps {
  listings: FoodListing[];
  receiver: ReceiverProfile;
  onClaim: (listing: FoodListing) => void;
  onOpenAlertModal: (listing: FoodListing) => void;
  onOpenAIMatch: () => void;
  onOpenNutrition: (listing: FoodListing) => void;
}

export const ReceiverFeed: React.FC<ReceiverFeedProps> = ({
  listings,
  receiver,
  onClaim,
  onOpenAlertModal,
  onOpenAIMatch,
  onOpenNutrition,
}) => {
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');
  
  // Filter States
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(15); // Distance radius in km (default 15km covers Bhubaneswar pilot)
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<boolean>(false);
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState<boolean>(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Ticking state for live countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate distance for each available listing
  const allAvailableListings = listings
    .filter((l) => l.status === 'available')
    .map((l) => {
      const distance = calculateDistance(
        receiver.location.lat,
        receiver.location.lng,
        l.location.lat,
        l.location.lng
      );
      return { ...l, distanceKm: distance };
    })
    .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));

  // Compute category counts before applying category filter (for badge counts)
  const categoryCounts = allAvailableListings.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter listings based on: category, distance radius, dietary type, urgency
  const filteredListings = allAvailableListings.filter((l) => {
    // 1. Food Category Filter
    if (activeCategoryFilter !== 'all' && l.category !== activeCategoryFilter) return false;
    
    // 2. Distance Radius Filter (if less than 25km, filter by radius)
    if (radiusKm < 25 && (l.distanceKm || 0) > radiusKm) return false;

    // 3. Dietary Filter
    if (dietaryFilter !== 'all' && l.vegOrNonVeg !== dietaryFilter) return false;

    // 4. Urgency Filter (<2h critical)
    if (urgencyFilter) {
      const hoursLeft = calculateHoursRemaining(l.expiresAt);
      if (hoursLeft >= 2) return false;
    }

    return true;
  });

  // Calculate active filter count
  const activeFiltersCount = 
    (activeCategoryFilter !== 'all' ? 1 : 0) +
    (radiusKm < 25 ? 1 : 0) +
    (dietaryFilter !== 'all' ? 1 : 0) +
    (urgencyFilter ? 1 : 0);

  const resetAllFilters = () => {
    setActiveCategoryFilter('all');
    setRadiusKm(25);
    setDietaryFilter('all');
    setUrgencyFilter(false);
  };

  const handleClaimClick = (listing: FoodListing) => {
    setClaimingId(listing.id);
    setTimeout(() => {
      onClaim(listing);
      setClaimingId(null);
    }, 450);
  };

  // Helper for human-readable live countdown
  const formatCountdown = (expiresAt: string) => {
    const totalSeconds = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    if (totalSeconds <= 0) return 'Expired';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) {
      return `${h}h ${m}m ${s}s`;
    }
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header & AI Match Prompt Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/50 rounded-3xl p-5 sm:p-6 border border-emerald-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Nearby Surplus Meals
              </h2>
              <span className="bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {allAvailableListings.length} total active
              </span>
            </div>
            <p className="text-stone-600 text-xs sm:text-sm mt-0.5">
              Redistributing in Bhubaneswar · Hub: <strong className="text-stone-800">{receiver.organization}</strong> ({receiver.location.address})
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAIMatch}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Ask Gemini: Best Match for You</span>
        </button>
      </div>

      {/* FILTER PANEL FOR MAP & FEED */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden transition-all">
        {/* Panel Header with Toggle */}
        <div 
          onClick={() => setIsFilterPanelExpanded(!isFilterPanelExpanded)}
          className="px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-stone-50/70 transition border-b border-stone-100 select-none"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-stone-900 text-sm">
                Filter Surplus Food & Map Catchment
              </span>
              <span className="text-xs text-stone-500 ml-2 hidden sm:inline">
                Category & distance radius
              </span>
            </div>

            {activeFiltersCount > 0 && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeFiltersCount} active
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  resetAllFilters();
                }}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}

            <button
              type="button"
              className="text-stone-400 hover:text-stone-600 p-1"
            >
              {isFilterPanelExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Panel Expanded Controls */}
        {isFilterPanelExpanded && (
          <div className="p-5 sm:p-6 space-y-5 bg-stone-50/40">
            {/* 1. Food Category Filter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Food Category:</span>
                </label>
                <span className="text-[11px] text-stone-400">
                  {activeCategoryFilter === 'all' ? 'All categories shown' : `Filtered: ${activeCategoryFilter}`}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { key: 'all', label: 'All Foods', icon: '🍽️', count: allAvailableListings.length },
                  { key: 'cooked meal', label: 'Cooked Meals', icon: '🍲', count: categoryCounts['cooked meal'] || 0 },
                  { key: 'bakery', label: 'Bakery & Bread', icon: '🥐', count: categoryCounts['bakery'] || 0 },
                  { key: 'fruits & veg', label: 'Produce (Farm)', icon: '🥦', count: categoryCounts['fruits & veg'] || 0 },
                  { key: 'packaged', label: 'Packaged Goods', icon: '🥛', count: categoryCounts['packaged'] || 0 },
                ].map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat.key)}
                    className={`py-2 px-3 rounded-2xl text-xs font-bold flex items-center justify-between gap-1.5 transition border ${
                      activeCategoryFilter === cat.key
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-emerald-50/50 hover:border-emerald-300'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <span>{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeCategoryFilter === cat.key
                        ? 'bg-emerald-800 text-emerald-100'
                        : 'bg-stone-100 text-stone-600'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Distance Radius Slider & Quick Presets */}
            <div className="pt-4 border-t border-stone-200/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Distance Catchment Radius:</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-mono">
                    {radiusKm >= 25 ? 'All Bhubaneswar (25+ km)' : `Within ${radiusKm} km`}
                  </span>
                  <span className="text-[11px] text-stone-500">
                    ({allAvailableListings.filter(l => radiusKm >= 25 || (l.distanceKm || 0) <= radiusKm).length} meals within range)
                  </span>
                </div>
              </div>

              {/* Slider Input */}
              <div className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="1"
                    max="25"
                    step="1"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-2 bg-stone-200 rounded-lg"
                  />
                </div>
                
                {/* Distance Quick Presets */}
                <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-stone-600">Quick Radii:</span>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(3)}
                      className={`px-2 py-0.5 rounded-lg border text-xs font-semibold transition ${
                        radiusKm === 3 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      3 km (Walk / 10m)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(7)}
                      className={`px-2 py-0.5 rounded-lg border text-xs font-semibold transition ${
                        radiusKm === 7 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      7 km (City Hub)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(15)}
                      className={`px-2 py-0.5 rounded-lg border text-xs font-semibold transition ${
                        radiusKm === 15 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      15 km (Greater BBS)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRadiusKm(25)}
                      className={`px-2 py-0.5 rounded-lg border text-xs font-semibold transition ${
                        radiusKm >= 25 
                          ? 'bg-emerald-600 text-white border-emerald-600' 
                          : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      All / Unlimited
                    </button>
                  </div>

                  <span className="hidden md:inline text-stone-400">
                    Live green dashed radius shown on map
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Dietary & Urgency Toggle Row */}
            <div className="pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-stone-600 mr-1">Dietary & Urgency:</span>
                
                {/* Veg Only */}
                <button
                  type="button"
                  onClick={() => setDietaryFilter(dietaryFilter === 'veg' ? 'all' : 'veg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    dietaryFilter === 'veg'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Pure Veg (🌱)</span>
                </button>

                {/* Non-Veg */}
                <button
                  type="button"
                  onClick={() => setDietaryFilter(dietaryFilter === 'non-veg' ? 'all' : 'non-veg')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    dietaryFilter === 'non-veg'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>Non-Veg (🍗)</span>
                </button>

                {/* Critical Urgency (<2h) */}
                <button
                  type="button"
                  onClick={() => setUrgencyFilter(!urgencyFilter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    urgencyFilter
                      ? 'bg-rose-600 text-white border-rose-600 shadow-xs animate-pulse'
                      : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Critical Expiry (&lt;2h)</span>
                </button>
              </div>

              {/* Status summary pill */}
              <div className="text-xs text-stone-600 font-medium">
                Showing <strong className="text-emerald-700 font-bold">{filteredListings.length}</strong> of {allAvailableListings.length} available donations
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Split Screen Layout: Map & Feed Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Interactive Map (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2 lg:sticky lg:top-24">
          {/* Map Engine Provider Switcher */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-white rounded-2xl border border-stone-200 text-xs">
            <span className="font-bold text-stone-700 flex items-center gap-1.5">
              <span>Interactive Map:</span>
            </span>
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMapEngine('google')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                  mapEngine === 'google'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🗺️ Google Maps</span>
              </button>
              <button
                type="button"
                onClick={() => setMapEngine('leaflet')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition flex items-center gap-1 ${
                  mapEngine === 'leaflet'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>OpenStreetMap</span>
              </button>
            </div>
          </div>

          <div className="h-[380px] lg:h-[calc(100vh-280px)] rounded-3xl overflow-hidden">
            {mapEngine === 'google' ? (
              <GoogleFoodMap
                listings={filteredListings}
                userLocation={receiver.location}
                selectedListingId={selectedListingId}
                onSelectListing={(listing) => setSelectedListingId(listing.id)}
                onClaimListing={handleClaimClick}
                onOpenNutrition={onOpenNutrition}
              />
            ) : (
              <FoodMap
                listings={filteredListings}
                userLocation={receiver.location}
                selectedListingId={selectedListingId}
                radiusKm={radiusKm}
                onSelectListing={(listing) => setSelectedListingId(listing.id)}
                onClaimListing={handleClaimClick}
              />
            )}
          </div>
        </div>

        {/* Right Column: Listing Cards sorted by distance (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200 shadow-xs">
              <Layers className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-800">No surplus food matching your filter criteria</h3>
              <p className="text-xs text-stone-500 mt-1 mb-4 max-w-sm mx-auto">
                No active listings match category "{activeCategoryFilter}" within {radiusKm} km radius.
                Try widening your distance radius or selecting "All Foods".
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredListings.map((listing) => {
              const hoursLeft = calculateHoursRemaining(listing.expiresAt);
              const isSelected = selectedListingId === listing.id;

              // Color-code urgency: green (>4h), orange (2-4h), red (<2h)
              let urgencyBadgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-300';
              let countdownTextClass = 'text-emerald-700';
              let borderClass = 'border-stone-200';

              if (hoursLeft < 2) {
                urgencyBadgeClass = 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse';
                countdownTextClass = 'text-rose-600 font-extrabold';
                borderClass = 'border-rose-300 ring-1 ring-rose-200';
              } else if (hoursLeft < 4) {
                urgencyBadgeClass = 'bg-amber-50 text-amber-800 border-amber-300';
                countdownTextClass = 'text-amber-700 font-bold';
                borderClass = 'border-amber-200';
              }

              return (
                <div
                  key={listing.id}
                  onClick={() => setSelectedListingId(listing.id)}
                  className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all cursor-pointer ${borderClass} ${
                    isSelected ? 'ring-2 ring-emerald-500 shadow-md' : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Food Photo with live tags */}
                    <div className="relative w-full sm:w-44 h-40 sm:h-auto rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                      <img
                        src={listing.imageUrl}
                        alt={listing.foodName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {listing.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                        </span>
                        {listing.aiVerified && (
                          <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow">
                            <ShieldCheck className="w-3 h-3" />
                            AI Verified
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-2 bg-stone-950/80 backdrop-blur-xs text-stone-100 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Navigation className="w-2.5 h-2.5 text-emerald-400" />
                        <span>{listing.distanceKm} km away</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        {/* Expiry Countdown & Servings header */}
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                          <span className="inline-flex items-center gap-1 font-bold text-xs bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                            🍽️ {listing.servings} Servings
                          </span>

                          {/* Live Countdown Timer with Urgency Color */}
                          <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs border font-mono ${urgencyBadgeClass}`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Safe for: </span>
                            <span className={countdownTextClass}>{formatCountdown(listing.expiresAt)}</span>
                          </div>
                        </div>

                        {/* Food Name & Emergency / Slot Badges */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg leading-tight">
                            {listing.foodName}
                          </h3>
                        </div>

                        {/* Emergency Pickup Banner if flagged */}
                        {listing.isEmergency && (
                          <div className="mb-2 p-2 rounded-xl bg-rose-50 border border-rose-300 flex items-center justify-between gap-2 text-xs animate-pulse">
                            <span className="font-extrabold text-rose-800 flex items-center gap-1">
                              <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                              <span>🚨 Immediate Rescue (&lt;30m)</span>
                            </span>
                            <a
                              href={`tel:${listing.emergencyPhone || listing.donorPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="font-bold text-rose-900 hover:text-rose-950 bg-white px-2 py-0.5 rounded-lg border border-rose-300 shadow-2xs flex items-center gap-1 text-[11px]"
                            >
                              <PhoneCall className="w-3 h-3 text-rose-600" />
                              <span>Urgent Call: {listing.emergencyPhone || listing.donorPhone}</span>
                            </a>
                          </div>
                        )}

                        {/* Category, Pickup Window & Donor Info */}
                        <div className="flex items-center justify-between flex-wrap gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap text-xs text-stone-500 font-medium">
                            <span className="capitalize font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              {listing.category}
                            </span>
                            <span className="inline-flex items-center gap-1 font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-stone-400" />
                              <span>{listing.pickupWindow}</span>
                            </span>
                            <span>Offered by <strong className="text-stone-800">{listing.donorName}</strong></span>
                          </div>

                          {/* Verified Donor Badge (5+ donations & >= 4.5 rating) */}
                          {(listing.isVerifiedDonor || ((listing.donorRating || 0) >= 4.5 && (listing.successfulDonationsCount || 0) >= 5)) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-800 text-[10px] font-bold border border-emerald-300 shadow-2xs">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified Donor</span>
                            </span>
                          )}
                        </div>

                        {/* Donor Trust Metrics Bar: Rating & Success Rate */}
                        <div className="flex items-center gap-2 text-[11px] text-stone-600 mb-2">
                          <div className="flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{listing.donorRating ? listing.donorRating.toFixed(1) : '4.9'}</span>
                            <span className="text-stone-400 font-normal">({listing.donorReviewCount || 24})</span>
                          </div>

                          <div className="flex items-center gap-1 font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-lg">
                            <Award className="w-3 h-3 text-emerald-600" />
                            <span>{listing.pickupSuccessRate || 98}% Pickup Success</span>
                          </div>
                        </div>

                        <p className="text-xs text-stone-600 line-clamp-2 mb-2.5">
                          {listing.shortDescription}
                        </p>

                        {/* Storage tip & Allergens badges */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-stone-500 mb-2.5">
                          <span className="bg-stone-100 px-2 py-0.5 rounded-md truncate max-w-[280px]">
                            💡 {listing.storageTip}
                          </span>
                          {listing.possibleAllergens.length > 0 && listing.possibleAllergens[0] !== 'none' && (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                              Allergens: {listing.possibleAllergens.join(', ')}
                            </span>
                          )}
                        </div>

                        {/* Nutritional Breakdown Bar (Carbs, Fats, Proteins, Calories) */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenNutrition(listing);
                          }}
                          title="Click to view detailed macronutrient and micronutrient values"
                          className="mb-3 p-2.5 rounded-2xl bg-gradient-to-r from-emerald-50/60 via-amber-50/40 to-blue-50/60 border border-stone-200/80 hover:border-emerald-400 hover:shadow-xs transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-mono">
                            <span className="font-extrabold text-stone-900 bg-white px-2 py-0.5 rounded-md border border-stone-200 shadow-2xs flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                              <span>{listing.nutrition?.calories || 420} kcal</span>
                            </span>
                            <span className="font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                              🍗 {listing.nutrition?.protein || 22}g Protein
                            </span>
                            <span className="font-bold text-amber-950 bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                              🌾 {listing.nutrition?.carbs || 54}g Carbs
                            </span>
                            <span className="font-bold text-rose-950 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200">
                              🥑 {listing.nutrition?.fats || 14}g Fats
                            </span>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 shrink-0 self-end sm:self-center">
                            <Activity className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Nutrient Values &rarr;</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: One-Tap Claim & Alert Share */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-stone-500">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate max-w-[180px] sm:max-w-[240px]">{listing.pickupAddress}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenAlertModal(listing);
                            }}
                            title="Generate WhatsApp/SMS alert in Odia, Hindi, or English"
                            className="p-2 rounded-xl border border-stone-200 hover:border-emerald-400 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            disabled={claimingId === listing.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClaimClick(listing);
                            }}
                            className={`px-4 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white transition-all shadow-sm flex items-center gap-1.5 ${
                              claimingId === listing.id
                                ? 'bg-emerald-800 scale-95'
                                : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                          >
                            {claimingId === listing.id ? (
                              <>
                                <Check className="w-4 h-4 animate-bounce" />
                                <span>Claiming...</span>
                              </>
                            ) : (
                              <>
                                <HeartHandshake className="w-4 h-4" />
                                <span>Claim Meal</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
