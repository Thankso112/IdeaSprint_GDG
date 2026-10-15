export type FoodCategory = 'cooked meal' | 'bakery' | 'fruits & veg' | 'packaged';

export type FoodType = 'veg' | 'non-veg';

export type ListingStatus = 'available' | 'pending_donor_approval' | 'claimed' | 'picked_up';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  address: string;
}

export interface RatingReview {
  stars: number; // 1 to 5
  comment?: string;
  ratedAt: string;
}

export interface PendingPickupRequest {
  requestId: string;
  requestedServings: number;
  receiverId: string;
  receiverName: string;
  receiverOrg: string;
  receiverPhone: string;
  requestedAt: string;
  expiresAtTimestamp: number; // 2 minutes from request (Date.now() + 120000)
}

export interface NutritionalInfo {
  calories: number; // kcal per serving
  protein: number; // grams
  carbs: number; // grams
  fats: number; // grams
  fiber?: number; // grams
  keyNutrient?: string; // e.g. "Rich in Iron & Calcium"
  dietaryTags?: string[]; // e.g. ["High Protein", "Energy Dense"]
}

export interface FoodListing {
  id: string;
  foodName: string;
  category: FoodCategory;
  vegOrNonVeg: FoodType;
  servings: number;
  remainingServings?: number; // Servings left if partially claimed
  claimedServings?: number; // Servings requested/claimed
  possibleAllergens: string[];
  safeToConsumeWithinHours: number; // original shelf life
  postedAt: string; // ISO string
  expiresAt: string; // ISO string
  storageTip: string;
  shortDescription: string;
  imageUrl: string;
  aiVerified: boolean;
  status: ListingStatus;
  
  // Nutrient values & Macros
  nutrition?: NutritionalInfo;
  
  // Pending request for donor acceptance (2 min timeout)
  pendingRequest?: PendingPickupRequest;
  
  // Donor details & Trust System
  donorName: string;
  donorType: 'restaurant' | 'caterer' | 'hostel mess' | 'event host' | 'supermarket';
  donorPhone: string;
  pickupAddress: string;
  location: LocationCoordinates;
  pickupWindow: string;
  isEmergency?: boolean; // Flag for urgent/immediate pickup (<30 min)
  emergencyPhone?: string; // Direct hotline for urgent collection
  contactName: string;
  donorRating?: number; // e.g. 4.9
  donorReviewCount?: number; // e.g. 34
  pickupSuccessRate?: number; // e.g. 99%
  successfulDonationsCount?: number; // e.g. 32
  isVerifiedDonor?: boolean; // 5+ donations & >= 4.5 rating

  // Pickup Verification
  pickupCode?: string; // 4-digit numeric code generated when claimed
  
  // Claimer details
  claimedBy?: {
    id: string;
    name: string;
    organization: string;
    claimedAt: string;
    phone: string;
  };
  pickedUpAt?: string;

  // Post-pickup Trust & Ratings
  receiverRating?: RatingReview; // Receiver rating for Donor
  donorRatingForReceiver?: RatingReview; // Donor rating for Receiver
  
  // Computed distance for receiver
  distanceKm?: number;
}

export interface ReceiverProfile {
  id: string; // e.g. 'RCV-001', 'RCV-002', 'RCV-101'
  name: string;
  organization: string;
  type: 'ngo' | 'shelter' | 'volunteer' | 'community kitchen';
  capacity: number; // people to feed
  preference: 'any' | 'veg';
  location: LocationCoordinates;
  phone: string;
  email?: string;
  joinedAt?: string;
}

export interface DonorProfile {
  id: string; // e.g. 'DNR-001', 'DNR-002', 'DNR-101'
  name: string; // Contact manager
  organization: string; // Business name
  donorType: 'restaurant' | 'caterer' | 'hostel mess' | 'event host' | 'supermarket';
  phone: string;
  email: string;
  address: string;
  location: LocationCoordinates;
  rating: number;
  reviewCount: number;
  pickupSuccessRate: number;
  successfulDonationsCount: number;
  isVerifiedDonor: boolean;
  joinedAt?: string;
}

export interface AIMatchResult {
  listing_id: string;
  reason: string;
  priority_score: number;
}

export interface FoodHero {
  id: string;
  name: string;
  type: string;
  mealsDonated: number;
  badge: 'Gold' | 'Silver' | 'Bronze';
  avatar: string;
  joinedDaysAgo: number;
  location: string;
}

export interface DailyImpact {
  day: string;
  mealsSaved: number;
  co2Avoided: number;
}
