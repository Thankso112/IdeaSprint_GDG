import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FoodListing, LocationCoordinates } from '../types';
import { calculateHoursRemaining } from '../services/geminiService';

interface FoodMapProps {
  listings: FoodListing[];
  userLocation: LocationCoordinates;
  selectedListingId: string | null;
  radiusKm?: number | null;
  onSelectListing: (listing: FoodListing) => void;
  onClaimListing?: (listing: FoodListing) => void;
}

export const FoodMap: React.FC<FoodMapProps> = ({
  listings,
  userLocation,
  selectedListingId,
  radiusKm,
  onSelectListing,
  onClaimListing,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const radiusCircleRef = useRef<L.Circle | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true,
      });

      // CartoDB Voyager clean tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, []);

  // Update radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusKm && radiusKm < 25) {
      radiusCircleRef.current = L.circle([userLocation.lat, userLocation.lng], {
        radius: radiusKm * 1000,
        color: '#10b981',
        weight: 1.5,
        opacity: 0.8,
        dashArray: '5, 5',
        fillColor: '#10b981',
        fillOpacity: 0.08,
      }).addTo(map);

      radiusCircleRef.current.bindTooltip(`${radiusKm} km search radius`, {
        permanent: false,
        direction: 'top',
        className: 'bg-emerald-900 text-white text-xs px-2 py-0.5 rounded font-bold shadow',
      });
    }
  }, [radiusKm, userLocation]);

  // Update listings markers & receiver location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    // 1. Add Receiver Location Marker (Blue pulse)
    const receiverHtml = `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
        <div class="relative w-6 h-6 bg-blue-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
          📍
        </div>
        <div class="absolute -bottom-5 bg-stone-900/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow whitespace-nowrap">
          You (NGO)
        </div>
      </div>
    `;

    const receiverIcon = L.divIcon({
      html: receiverHtml,
      className: 'custom-receiver-pin',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const receiverMarker = L.marker([userLocation.lat, userLocation.lng], {
      icon: receiverIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    receiverMarker.bindPopup(`
      <div class="p-1 text-xs">
        <p class="font-bold text-stone-900">${userLocation.address}</p>
        <p class="text-stone-500 mt-0.5">Your Hub / Pickup Base</p>
      </div>
    `);

    // 2. Add listings markers
    const availableListings = listings.filter((l) => l.status === 'available');

    availableListings.forEach((listing) => {
      const hoursLeft = calculateHoursRemaining(listing.expiresAt);
      
      // Urgency colors: Red < 2h, Orange 2-4h, Green > 4h
      let colorClass = 'bg-emerald-500 border-emerald-300 text-white';
      let ringClass = 'ring-emerald-400';
      let urgencyText = `${Math.floor(hoursLeft)}h left`;
      
      if (hoursLeft < 2) {
        colorClass = 'bg-rose-600 border-rose-300 text-white animate-pulse';
        ringClass = 'ring-rose-400 ring-2';
        urgencyText = `<2h CRITICAL`;
      } else if (hoursLeft < 4) {
        colorClass = 'bg-amber-500 border-amber-300 text-white';
        ringClass = 'ring-amber-400';
        urgencyText = `~${Math.floor(hoursLeft)}h left`;
      }

      const iconType = listing.vegOrNonVeg === 'veg' ? '🟢' : '🔴';
      const isSelected = listing.id === selectedListingId;

      const markerHtml = `
        <div class="relative cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : ''}">
          <div class="relative px-2 py-1 rounded-full shadow-md border flex items-center gap-1 font-bold text-xs whitespace-nowrap ${colorClass} ${ringClass}">
            <span>${iconType}</span>
            <span>${listing.servings} meals</span>
          </div>
          <div class="absolute left-1/2 -bottom-1 transform -translate-x-1/2 w-2 h-2 rotate-45 ${hoursLeft < 2 ? 'bg-rose-600' : hoursLeft < 4 ? 'bg-amber-500' : 'bg-emerald-500'}"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-food-marker',
        iconSize: [80, 32],
        iconAnchor: [40, 32],
      });

      const marker = L.marker([listing.location.lat, listing.location.lng], {
        icon: customIcon,
      }).addTo(map);

      // Popup
      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 max-w-[240px] text-stone-800';
      popupContent.innerHTML = `
        <div class="relative rounded overflow-hidden mb-1.5 h-24 w-full">
          <img src="${listing.imageUrl}" alt="${listing.foodName}" class="w-full h-full object-cover" />
          <div class="absolute top-1 left-1 bg-black/70 text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
            ${listing.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
          </div>
          <div class="absolute top-1 right-1 ${hoursLeft < 2 ? 'bg-rose-600' : hoursLeft < 4 ? 'bg-amber-600' : 'bg-emerald-600'} text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
            ${urgencyText}
          </div>
        </div>
        <h4 class="font-bold text-xs leading-tight mb-0.5">${listing.foodName}</h4>
        <div class="flex items-center gap-1.5 text-[10px] text-stone-600 mb-1">
          <span class="font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">★ ${listing.donorRating ? listing.donorRating.toFixed(1) : '4.9'}</span>
          <span>${listing.donorName}</span>
          ${(listing.isVerifiedDonor || (listing.donorRating && listing.donorRating >= 4.5)) ? '<span class="text-emerald-700 font-bold bg-emerald-50 px-1 rounded border border-emerald-200">✓ Verified</span>' : ''}
        <p class="text-[11px] text-stone-600 mb-1"><strong>${listing.servings} servings</strong> · ${listing.pickupSuccessRate || 98}% success</p>
        <p class="text-[10px] text-stone-500 mb-1 truncate">⏰ <strong>${listing.pickupWindow}</strong></p>
        ${listing.isEmergency ? `<div class="mb-1.5 p-1 rounded bg-rose-50 border border-rose-300 text-[10px] font-bold text-rose-800 flex items-center justify-between"><span>🚨 Emergency Rescue (&lt;30m)</span><a href="tel:${listing.emergencyPhone || listing.donorPhone}" class="text-rose-900 underline font-extrabold">Call Desk</a></div>` : ''}
        <p class="text-[10px] text-stone-500 mb-2 truncate">📍 ${listing.pickupAddress}</p>
        <div class="flex items-center gap-1.5">
          <button id="claim-btn-${listing.id}" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-2 rounded text-xs text-center transition">
            Claim Food
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectListing(listing);
      });

      marker.on('popupopen', () => {
        const claimBtn = document.getElementById(`claim-btn-${listing.id}`);
        if (claimBtn && onClaimListing) {
          claimBtn.onclick = (e) => {
            e.stopPropagation();
            onClaimListing(listing);
          };
        }
      });

      markersRef.current[listing.id] = marker;
    });

    // Auto-fit bounds if listings exist
    if (availableListings.length > 0) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lng],
        ...availableListings.map((l) => [l.location.lat, l.location.lng] as [number, number]),
      ]);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [listings, userLocation, selectedListingId]);

  // Pan to selected listing when changed
  useEffect(() => {
    if (!selectedListingId || !mapInstanceRef.current) return;
    const marker = markersRef.current[selectedListingId];
    if (marker) {
      const latlng = marker.getLatLng();
      mapInstanceRef.current.flyTo(latlng, 14, { duration: 0.8 });
      marker.openPopup();
    }
  }, [selectedListingId]);

  return (
    <div className="relative w-full h-full min-h-[320px] rounded-2xl overflow-hidden shadow-sm border border-stone-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[360px] lg:min-h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-sm rounded-xl p-2.5 shadow-md border border-stone-200 text-xs flex flex-col gap-1.5 pointer-events-auto">
        <div className="font-semibold text-stone-800 text-[11px] uppercase tracking-wider mb-0.5">Urgency Legend</div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
          <span>&lt; 2h (Critical Expiry)</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>2 - 4h (Safe)</span>
        </div>
        <div className="flex items-center gap-2 text-stone-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>&gt; 4h (Optimal)</span>
        </div>
        {radiusKm && radiusKm < 25 && (
          <div className="pt-1 mt-1 border-t border-stone-200 flex items-center gap-1.5 text-emerald-700 font-semibold text-[10px]">
            <span className="w-2 h-2 rounded-full border border-emerald-500 bg-emerald-100"></span>
            <span>{radiusKm} km search radius active</span>
          </div>
        )}
      </div>
    </div>
  );
};
