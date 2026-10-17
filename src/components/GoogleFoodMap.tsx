import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Award, 
  PhoneCall, 
  AlertOctagon,
  Utensils,
  Building2,
  Navigation,
  Activity,
  Flame
} from 'lucide-react';
import { FoodListing, LocationCoordinates } from '../types';
import { calculateHoursRemaining } from '../services/geminiService';
import { FoodMap } from './FoodMap';

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface GoogleFoodMapProps {
  listings: FoodListing[];
  userLocation: LocationCoordinates;
  selectedListingId: string | null;
  onSelectListing: (listing: FoodListing) => void;
  onClaimListing?: (listing: FoodListing) => void;
  onOpenNutrition?: (listing: FoodListing) => void;
}

// Inner helper component to pan the camera when selectedListingId changes
const MapCameraSync: React.FC<{
  selectedListing: FoodListing | null;
  userLocation: LocationCoordinates;
}> = ({ selectedListing, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (selectedListing) {
      map.panTo({
        lat: selectedListing.location.lat,
        lng: selectedListing.location.lng,
      });
      map.setZoom(14);
    }
  }, [map, selectedListing]);

  return null;
};

export const GoogleFoodMap: React.FC<GoogleFoodMapProps> = ({
  listings,
  userLocation,
  selectedListingId,
  onSelectListing,
  onClaimListing,
  onOpenNutrition,
}) => {
  const [activeListing, setActiveListing] = useState<FoodListing | null>(null);

  // Sync active listing if selected externally
  useEffect(() => {
    if (selectedListingId) {
      const found = listings.find((l) => l.id === selectedListingId);
      if (found) setActiveListing(found);
    }
  }, [selectedListingId, listings]);

  const availableListings = listings.filter((l) => l.status === 'available');

  // Fallback to OpenStreetMap/Leaflet if no Google Maps API key is provided
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-sm border border-stone-200">
        <FoodMap
          listings={listings}
          userLocation={userLocation}
          selectedListingId={selectedListingId}
          onSelectListing={onSelectListing}
          onClaimListing={onClaimListing}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden shadow-sm border border-stone-200">
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          style={{ width: '100%', height: '100%', minHeight: '420px' }}
          defaultCenter={{ lat: userLocation.lat || 20.2961, lng: userLocation.lng || 85.8245 }}
          defaultZoom={13}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          className="rounded-3xl"
        >
          <MapCameraSync
            selectedListing={activeListing}
            userLocation={userLocation}
          />

          {/* Receiver NGO Hub Marker */}
          <AdvancedMarker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            title={userLocation.address}
          >
            <div className="relative cursor-pointer group">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg border-2 border-white ring-2 ring-indigo-400">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                Your Hub
              </span>
            </div>
          </AdvancedMarker>

          {/* Surplus Food Listing Markers */}
          {availableListings.map((listing) => {
            const hoursLeft = calculateHoursRemaining(listing.expiresAt);
            const isSelected = listing.id === activeListing?.id;

            // Urgency color coding: Red <2h, Orange 2-4h, Green >4h
            let pinBg = '#059669'; // Emerald
            let pinBorder = '#10b981';
            let glyphText = '🌱';

            if (hoursLeft < 2) {
              pinBg = '#e11d48'; // Rose
              pinBorder = '#f43f5e';
              glyphText = '🚨';
            } else if (hoursLeft < 4) {
              pinBg = '#d97706'; // Amber
              pinBorder = '#f59e0b';
              glyphText = '⏰';
            }

            if (listing.vegOrNonVeg === 'non-veg' && hoursLeft >= 4) {
              glyphText = '🍗';
            }

            return (
              <AdvancedMarker
                key={listing.id}
                position={{ lat: listing.location.lat, lng: listing.location.lng }}
                onClick={() => {
                  setActiveListing(listing);
                  onSelectListing(listing);
                }}
                zIndex={isSelected ? 100 : hoursLeft < 2 ? 80 : 10}
              >
                <div className={`transition-transform duration-200 ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                  <Pin
                    background={pinBg}
                    borderColor={pinBorder}
                    glyphColor="#ffffff"
                  >
                    <span className="text-xs font-bold leading-none">{glyphText}</span>
                  </Pin>
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-stone-900/90 text-white text-[10px] font-mono font-bold px-1.5 py-0.2 rounded shadow-md pointer-events-none">
                    {listing.remainingServings !== undefined ? listing.remainingServings : listing.servings} meals
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Active InfoWindow for selected surplus meal */}
          {activeListing && (
            <InfoWindow
              position={{
                lat: activeListing.location.lat,
                lng: activeListing.location.lng,
              }}
              onCloseClick={() => setActiveListing(null)}
              pixelOffset={[0, -38]}
            >
              <div className="max-w-[270px] p-1 text-stone-900 font-sans">
                <div className="relative rounded-xl overflow-hidden mb-2 h-28 w-full bg-stone-100">
                  <img
                    src={activeListing.imageUrl}
                    alt={activeListing.foodName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/75 backdrop-blur-xs text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    {activeListing.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-emerald-600 text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                    {activeListing.remainingServings !== undefined ? activeListing.remainingServings : activeListing.servings} portions
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-1">
                  <h4 className="font-extrabold text-stone-900 text-sm leading-tight">
                    {activeListing.foodName}
                  </h4>
                  {activeListing.isVerifiedDonor && (
                    <span className="text-emerald-700 font-bold text-[10px] flex items-center bg-emerald-50 px-1 rounded border border-emerald-200">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-stone-600 mb-1.5">
                  <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    ★ {activeListing.donorRating || 4.9}
                  </span>
                  <span className="truncate">{activeListing.donorName}</span>
                </div>

                <p className="text-[11px] text-stone-600 line-clamp-2 mb-2">
                  {activeListing.shortDescription}
                </p>

                <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono mb-2 pt-1 border-t border-stone-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>{activeListing.pickupWindow}</span>
                  </span>
                  <span className="text-emerald-700 font-bold">
                    Safe for {calculateHoursRemaining(activeListing.expiresAt).toFixed(1)}h
                  </span>
                </div>

                {activeListing.isEmergency && (
                  <div className="p-1.5 rounded-lg bg-rose-50 border border-rose-300 text-[10px] font-bold text-rose-800 flex items-center justify-between mb-2">
                    <span>🚨 Urgent Rescue (&lt;30m)</span>
                    <a
                      href={`tel:${activeListing.emergencyPhone || activeListing.donorPhone}`}
                      className="text-rose-900 underline font-extrabold"
                    >
                      Call Direct
                    </a>
                  </div>
                )}

                {/* Nutritional breakdown bar */}
                <div 
                  onClick={() => onOpenNutrition?.(activeListing)}
                  title="Click to view detailed nutrient values: carbs, fats, proteins, calories"
                  className="mb-2 p-1.5 rounded-xl bg-gradient-to-r from-emerald-50 via-amber-50 to-blue-50 border border-stone-200 hover:border-emerald-500 cursor-pointer transition flex items-center justify-between text-[10px]"
                >
                  <div className="flex items-center gap-1 font-mono font-bold text-stone-700">
                    <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                    <span>{activeListing.nutrition?.calories || 420} kcal</span>
                    <span className="text-blue-700">| P: {activeListing.nutrition?.protein || 22}g</span>
                    <span className="text-amber-800">| C: {activeListing.nutrition?.carbs || 54}g</span>
                    <span className="text-rose-700">| F: {activeListing.nutrition?.fats || 14}g</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-800 hover:underline flex items-center gap-0.5">
                    <Activity className="w-2.5 h-2.5" />
                    <span>Values &rarr;</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeListing.location.lat},${activeListing.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
                    title="Open Google Maps Directions"
                  >
                    <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                  </a>

                  {onClaimListing && (
                    <button
                      onClick={() => onClaimListing(activeListing)}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center justify-center gap-1"
                    >
                      <Utensils className="w-3 h-3" />
                      <span>Request Portions</span>
                    </button>
                  )}
                </div>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>

      {/* Google Maps Legend Overlay */}
      <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-sm rounded-2xl p-2.5 shadow-md border border-stone-200 text-xs flex flex-col gap-1.5 pointer-events-auto">
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-1">
          <span className="font-extrabold text-stone-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Google Maps
          </span>
          <span className="text-[10px] text-stone-400">Live Pins</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span>&lt;2h Critical</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>2-4h Moderate</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700 text-[11px]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>&gt;4h Fresh</span>
        </div>
      </div>
    </div>
  );
};
