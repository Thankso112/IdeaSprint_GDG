/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { FoodListing, ReceiverProfile, PendingPickupRequest } from './types';
import { INITIAL_LISTINGS, INITIAL_RECEIVER, DEMO_PRESET_FOODS } from './data/mockData';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { DonorPostForm } from './components/DonorPostForm';
import { DonorListings } from './components/DonorListings';
import { ReceiverFeed } from './components/ReceiverFeed';
import { AIMatchingSection } from './components/AIMatchingSection';
import { MyPickups } from './components/MyPickups';
import { ImpactDashboard } from './components/ImpactDashboard';
import { AlertModal } from './components/AlertModal';
import { RatingModal } from './components/RatingModal';
import { ClaimQuantityModal } from './components/ClaimQuantityModal';
import { SimilarMealsModal } from './components/SimilarMealsModal';
import { ToastNotification } from './components/ToastNotification';
import { NamasteWelcomeModal } from './components/NamasteWelcomeModal';
import { AuthModal } from './components/AuthModal';
import { NutritionModal } from './components/NutritionModal';
import { WorkspaceHubModal } from './components/WorkspaceHubModal';
import { DonorProfile } from './types';
import { getActiveDonor, setActiveDonor, getActiveReceiver, setActiveReceiver } from './services/userService';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'foodbridge_listings_v1';
const RECEIVER_STORAGE_KEY = 'foodbridge_receiver_v1';

export default function App() {
  // 1. Role State: Donor vs Receiver
  const [currentRole, setCurrentRole] = useState<'donor' | 'receiver'>('receiver');

  // 2. Active Screen Tab
  const [activeTab, setActiveTab] = useState<string>('receiver-feed');

  // 3. Listings State with LocalStorage Persistence
  const [listings, setListings] = useState<FoodListing[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }
    return INITIAL_LISTINGS;
  });

  // 4. Receiver Profile State
  const [receiver, setReceiver] = useState<ReceiverProfile>(() => {
    try {
      const saved = localStorage.getItem(RECEIVER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return getActiveReceiver() || INITIAL_RECEIVER;
  });

  // 5. Active Donor Profile State with Guaranteed Unique ID
  const [activeDonor, setActiveDonorState] = useState<DonorProfile>(() => getActiveDonor());

  // 6. Modals & Notifications
  const [isNamasteOpen, setIsNamasteOpen] = useState<boolean>(() => {
    return !sessionStorage.getItem('foodbridge_namaste_seen');
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);
  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState<boolean>(false);
  const [nutritionListing, setNutritionListing] = useState<FoodListing | null>(null);

  const [alertListing, setAlertListing] = useState<FoodListing | null>(null);
  const [ratingListing, setRatingListing] = useState<FoodListing | null>(null);
  const [ratingRole, setRatingRole] = useState<'donor' | 'receiver'>('receiver');
  const [claimModalListing, setClaimModalListing] = useState<FoodListing | null>(null);
  const [similarMealsData, setSimilarMealsData] = useState<{
    expiredListing: FoodListing;
    requestedServings: number;
    similarListings: FoodListing[];
  } | null>(null);

  const [realtimeNotification, setRealtimeNotification] = useState<{
    listing: FoodListing;
    timestamp: string;
  } | null>(null);

  // Sync listings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
      console.warn('Could not save listings to localStorage', e);
    }
  }, [listings]);

  // Sync receiver to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECEIVER_STORAGE_KEY, JSON.stringify(receiver));
    } catch (e) {
      // ignore
    }
  }, [receiver]);

  // Ref to access latest listings in interval
  const listingsRef = useRef(listings);
  useEffect(() => {
    listingsRef.current = listings;
  }, [listings]);

  // 6. Automated 2-Minute Expiration Monitor for Pending Donor Requests
  useEffect(() => {
    const timer = setInterval(() => {
      const currentListings = listingsRef.current;
      const now = Date.now();

      const expiredItem = currentListings.find(
        (item) =>
          item.status === 'pending_donor_approval' &&
          item.pendingRequest &&
          item.pendingRequest.expiresAtTimestamp <= now
      );

      if (expiredItem && expiredItem.pendingRequest) {
        const reqPortions = expiredItem.pendingRequest.requestedServings;
        const expiredListingSnapshot = { ...expiredItem };

        // 1. Restore the listing to 'available' and remove pendingRequest
        setListings((prev) =>
          prev.map((l) => {
            if (l.id === expiredListingSnapshot.id) {
              return {
                ...l,
                status: 'available',
                pendingRequest: undefined,
              };
            }
            return l;
          })
        );

        // 2. Find similar available listings nearby matching approximately the requested quantity
        const similarAlternatives = currentListings
          .filter((l) => l.status === 'available' && l.id !== expiredListingSnapshot.id)
          .sort((a, b) => {
            const diffA = Math.abs(a.servings - reqPortions);
            const diffB = Math.abs(b.servings - reqPortions);
            return diffA - diffB;
          });

        // 3. Open SimilarMealsModal for receiver with alternative surplus meals
        setSimilarMealsData({
          expiredListing: expiredListingSnapshot,
          requestedServings: reqPortions,
          similarListings: similarAlternatives,
        });

        // 4. Alert via toast
        setRealtimeNotification({
          listing: {
            ...expiredListingSnapshot,
            foodName: `2-Min Window Expired: ${expiredListingSnapshot.foodName}`,
            shortDescription: `${expiredListingSnapshot.donorName} could not accept in time. Re-routing you to similar surplus meals!`,
          },
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Counts
  const availableMeals = listings.filter((l) => l.status === 'available');
  const pendingRequestsList = listings.filter((l) => l.status === 'pending_donor_approval');
  const claimedListings = listings.filter((l) => l.status === 'claimed' || l.status === 'picked_up');
  const pickedUpListings = listings.filter((l) => l.status === 'picked_up');

  // Action: Donor creates new listing
  const handlePostSuccess = (newListing: FoodListing) => {
    setListings((prev) => [newListing, ...prev]);
    setActiveTab('donor-listings');

    // Simulate real-time notification push to receiver
    setTimeout(() => {
      setRealtimeNotification({
        listing: newListing,
        timestamp: new Date().toLocaleTimeString(),
      });
    }, 1200);

    // Confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {}
  };

  // Action: Receiver clicks "Claim Meal" -> Opens Quantity Selector Modal
  const handleOpenClaimQuantity = (listing: FoodListing) => {
    setClaimModalListing(listing);
  };

  // Action: Receiver selects quantity & places order -> Status 'pending_donor_approval' with 2-minute timer
  const handleSubmitQuantityOrder = (listing: FoodListing, requestedServings: number) => {
    const expiresAtTimestamp = Date.now() + 120000; // 2 minutes from now

    const pendingRequest: PendingPickupRequest = {
      requestId: `req_${Date.now()}`,
      requestedServings,
      receiverId: receiver.id,
      receiverName: receiver.name,
      receiverOrg: receiver.organization,
      receiverPhone: receiver.phone,
      requestedAt: new Date().toISOString(),
      expiresAtTimestamp,
    };

    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listing.id) {
          return {
            ...item,
            status: 'pending_donor_approval',
            claimedServings: requestedServings,
            pendingRequest,
          };
        }
        return item;
      })
    );

    // Confirmation Toast
    setRealtimeNotification({
      listing: {
        ...listing,
        foodName: `Order Placed: ${requestedServings} Portions of ${listing.foodName}`,
        shortDescription: `Sent to ${listing.donorName}. Awaiting donor confirmation (2-minute window).`,
      },
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10b981', '#34d399', '#f59e0b'],
      });
    } catch (e) {}

    // Navigate to My Pickups so receiver can watch live countdown & test controls
    setActiveTab('my-pickups');
  };

  // Action: Donor accepts the requested quantity -> Status moves to 'claimed', 4-digit code generated
  const handleAcceptPendingRequest = (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return;

    const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
    const servingsClaimed = target.pendingRequest?.requestedServings || target.servings;
    const remaining = Math.max(0, target.servings - servingsClaimed);

    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          return {
            ...item,
            status: 'claimed',
            pickupCode: generatedCode,
            claimedServings: servingsClaimed,
            remainingServings: remaining,
            claimedBy: {
              id: item.pendingRequest?.receiverId || receiver.id,
              name: item.pendingRequest?.receiverName || receiver.name,
              organization: item.pendingRequest?.receiverOrg || receiver.organization,
              claimedAt: new Date().toISOString(),
              phone: item.pendingRequest?.receiverPhone || receiver.phone,
            },
            pendingRequest: undefined,
          };
        }
        return item;
      })
    );

    // Confetti
    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#34d399', '#f59e0b'],
      });
    } catch (e) {}

    // Push notification to receiver
    setRealtimeNotification({
      listing: {
        ...target,
        foodName: `Order Accepted by ${target.donorName}!`,
        shortDescription: `Your request for ${servingsClaimed} portions has been confirmed. 4-Digit handover code generated.`,
      },
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Action: Donor declines the requested quantity -> Re-route receiver to similar meals
  const handleDeclinePendingRequest = (listingId: string) => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return;

    const reqPortions = target.pendingRequest?.requestedServings || 20;

    // Reset listing to available
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          return {
            ...item,
            status: 'available',
            pendingRequest: undefined,
          };
        }
        return item;
      })
    );

    // Find similar alternatives
    const alternatives = listings
      .filter((l) => l.status === 'available' && l.id !== listingId)
      .sort((a, b) => {
        const diffA = Math.abs(a.servings - reqPortions);
        const diffB = Math.abs(b.servings - reqPortions);
        return diffA - diffB;
      });

    // Open Similar Meals Modal
    setSimilarMealsData({
      expiredListing: target,
      requestedServings: reqPortions,
      similarListings: alternatives,
    });

    setRealtimeNotification({
      listing: {
        ...target,
        foodName: `Request Declined: ${target.foodName}`,
        shortDescription: `${target.donorName} was unable to accept. Auto-routing to similar quantity surplus meals nearby.`,
      },
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  // Action: Fast-Track / Demo Simulation of 2-minute timeout
  const handleTimeoutPendingRequest = (listingId: string) => {
    handleDeclinePendingRequest(listingId);
  };

  // Action: Receiver cancels pending request
  const handleCancelPendingRequest = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          return {
            ...item,
            status: 'available',
            pendingRequest: undefined,
          };
        }
        return item;
      })
    );
  };

  // Action: Receiver clicks alternative meal in SimilarMealsModal
  const handleClaimAlternative = (altListing: FoodListing) => {
    const prevRequestedServings = similarMealsData?.requestedServings;
    setSimilarMealsData(null);
    if (prevRequestedServings) {
      const clamped = Math.min(prevRequestedServings, altListing.servings);
      handleSubmitQuantityOrder(altListing, clamped);
    } else {
      setClaimModalListing(altListing);
    }
  };

  // Action: Donor verifies the 4-digit pickup code
  const handleVerifyPickup = (listingId: string, inputCode: string): boolean => {
    const target = listings.find((l) => l.id === listingId);
    if (!target) return false;

    // Check code against target's assigned pickupCode (or fallback '4829')
    const expectedCode = target.pickupCode || '4829';
    if (inputCode.trim() !== expectedCode.trim()) {
      return false;
    }

    // Code matches: Move listing to Picked Up status
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          const newDonationCount = (item.successfulDonationsCount || 10) + 1;
          const currentRating = item.donorRating || 4.9;
          const isVerified = currentRating >= 4.5 && newDonationCount >= 5;

          return {
            ...item,
            status: 'picked_up',
            pickedUpAt: new Date().toISOString(),
            successfulDonationsCount: newDonationCount,
            isVerifiedDonor: isVerified,
          };
        }
        return item;
      })
    );

    return true;
  };

  // Action: Receiver marks as Picked Up manually (fallback)
  const handleMarkPickedUp = (listingId: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          const newDonationCount = (item.successfulDonationsCount || 10) + 1;
          const currentRating = item.donorRating || 4.9;
          const isVerified = currentRating >= 4.5 && newDonationCount >= 5;

          return {
            ...item,
            status: 'picked_up',
            pickedUpAt: new Date().toISOString(),
            successfulDonationsCount: newDonationCount,
            isVerifiedDonor: isVerified,
          };
        }
        return item;
      })
    );
  };

  // Action: Donor cancels/deletes listing
  const handleDeleteListing = (listingId: string) => {
    setListings((prev) => prev.filter((l) => l.id !== listingId));
  };

  // Action: Submit Rating Review (1-5 stars)
  const handleSubmitRating = (listingId: string, stars: number, comment?: string) => {
    setListings((prev) =>
      prev.map((item) => {
        if (item.id === listingId) {
          if (ratingRole === 'receiver') {
            // Receiver rates donor: recalculate donor rating average & review count
            const currentReviews = item.donorReviewCount || 20;
            const currentRating = item.donorRating || 4.8;
            const newReviews = currentReviews + 1;
            const updatedRating = Math.round(((currentRating * currentReviews + stars) / newReviews) * 10) / 10;
            const donationCount = item.successfulDonationsCount || 8;
            const isVerified = updatedRating >= 4.5 && donationCount >= 5;

            return {
              ...item,
              donorRating: updatedRating,
              donorReviewCount: newReviews,
              isVerifiedDonor: isVerified,
              receiverRating: {
                stars,
                comment,
                ratedAt: new Date().toISOString(),
              },
            };
          } else {
            // Donor rates receiver
            return {
              ...item,
              donorRatingForReceiver: {
                stars,
                comment,
                ratedAt: new Date().toISOString(),
              },
            };
          }
        }
        return item;
      })
    );

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f59e0b', '#fbbf24', '#10b981'],
      });
    } catch (e) {}
  };

  // Quick Demo Auto-fill: Generates instant demo listing with trust scores
  const handleOpenDemoQuickPost = () => {
    const randomPreset = DEMO_PRESET_FOODS[Math.floor(Math.random() * DEMO_PRESET_FOODS.length)];
    const generatedPickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newDemoListing: FoodListing = {
      id: `demo_${Date.now()}`,
      foodName: randomPreset.analysis.food_name,
      category: randomPreset.analysis.category as any,
      vegOrNonVeg: randomPreset.analysis.veg_or_nonveg as any,
      servings: randomPreset.analysis.estimated_servings,
      possibleAllergens: randomPreset.analysis.possible_allergens,
      safeToConsumeWithinHours: randomPreset.analysis.safe_to_consume_within_hours,
      postedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + randomPreset.analysis.safe_to_consume_within_hours * 3600 * 1000).toISOString(),
      storageTip: randomPreset.analysis.storage_tip,
      shortDescription: randomPreset.analysis.short_description || '',
      imageUrl: randomPreset.imageUrl,
      aiVerified: true,
      status: 'available',
      donorName: 'Hotel Swosti Grand',
      donorType: 'restaurant',
      donorPhone: '+91 98610 22441',
      pickupAddress: 'Janpath, Unit-3, Kharvel Nagar, Bhubaneswar',
      location: {
        lat: 20.2685 + (Math.random() - 0.5) * 0.02,
        lng: 85.8432 + (Math.random() - 0.5) * 0.02,
        address: 'Janpath, Unit-3, Kharvel Nagar, Bhubaneswar',
      },
      pickupWindow: '5:00 PM – 5:30 PM',
      contactName: 'Executive Chef Rajesh',
      pickupCode: generatedPickupCode,
      donorRating: 4.9,
      donorReviewCount: 34,
      pickupSuccessRate: 99,
      successfulDonationsCount: 32,
      isVerifiedDonor: true,
    };

    setListings((prev) => [newDemoListing, ...prev]);
    setRealtimeNotification({
      listing: newDemoListing,
      timestamp: new Date().toLocaleTimeString(),
    });

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    if (currentRole === 'donor') {
      setActiveTab('donor-listings');
    } else {
      setActiveTab('receiver-feed');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => {
          setCurrentRole(role);
          if (role === 'donor') {
            setActiveTab('donor-post');
          } else {
            setActiveTab('receiver-feed');
          }
        }}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        claimedCount={listings.filter((l) => l.status === 'claimed' || l.status === 'pending_donor_approval').length}
        donorListingsCount={listings.length}
        onOpenDemoQuickPost={handleOpenDemoQuickPost}
        onOpenNamaste={() => setIsNamasteOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenWorkspace={() => setIsWorkspaceModalOpen(true)}
        activeUserId={currentRole === 'donor' ? activeDonor.id : receiver.id}
        activeUserName={currentRole === 'donor' ? activeDonor.organization : receiver.organization}
        isWorkspaceConnected={isWorkspaceConnected}
      />

      {/* 2. Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section displayed on feed or landing */}
        {(activeTab === 'receiver-feed' || activeTab === 'donor-post') && (
          <HeroSection
            currentRole={currentRole}
            availableMealsCount={availableMeals.length}
            totalPickupsCount={pickedUpListings.length + 1450}
            onActionClick={() => {
              if (currentRole === 'donor') {
                setActiveTab('donor-post');
              } else {
                setActiveTab('receiver-feed');
              }
            }}
          />
        )}

        {/* View Routing */}
        {/* RECEIVER VIEWS */}
        {activeTab === 'receiver-feed' && (
          <ReceiverFeed
            listings={listings}
            receiver={receiver}
            onClaim={handleOpenClaimQuantity}
            onOpenAlertModal={(listing) => setAlertListing(listing)}
            onOpenAIMatch={() => setActiveTab('ai-match')}
            onOpenNutrition={(listing) => setNutritionListing(listing)}
          />
        )}

        {activeTab === 'ai-match' && (
          <AIMatchingSection
            listings={listings}
            receiver={receiver}
            onUpdateReceiver={(updated) => setReceiver(updated)}
            onClaim={handleOpenClaimQuantity}
            onOpenFeed={() => setActiveTab('receiver-feed')}
          />
        )}

        {activeTab === 'my-pickups' && (
          <MyPickups
            claimedListings={claimedListings}
            pendingListings={pendingRequestsList}
            onMarkPickedUp={handleMarkPickedUp}
            onVerifyPickup={handleVerifyPickup}
            onBrowseAvailable={() => setActiveTab('receiver-feed')}
            onOpenRating={(listing) => {
              setRatingListing(listing);
              setRatingRole('receiver');
            }}
            onSimulateDonorAccept={handleAcceptPendingRequest}
            onSimulateTimeout={handleTimeoutPendingRequest}
            onCancelPendingRequest={handleCancelPendingRequest}
          />
        )}

        {/* DONOR VIEWS */}
        {activeTab === 'donor-post' && (
          <DonorPostForm
            onPostSuccess={handlePostSuccess}
            onCancel={() => setActiveTab('donor-listings')}
          />
        )}

        {activeTab === 'donor-listings' && (
          <DonorListings
            listings={listings}
            onAddNew={() => setActiveTab('donor-post')}
            onDeleteListing={handleDeleteListing}
            onVerifyPickup={handleVerifyPickup}
            onOpenRating={(listing) => {
              setRatingListing(listing);
              setRatingRole('donor');
            }}
            onAcceptPendingRequest={handleAcceptPendingRequest}
            onDeclinePendingRequest={handleDeclinePendingRequest}
          />
        )}

        {/* SHARED VIEWS */}
        {activeTab === 'impact-dashboard' && (
          <ImpactDashboard
            listings={listings}
            pickedUpListings={pickedUpListings}
          />
        )}

        {activeTab === 'leaderboard' && (
          <ImpactDashboard
            listings={listings}
            pickedUpListings={pickedUpListings}
          />
        )}
      </main>

      {/* 3. Traditional Namaste Welcome Animation Modal (Odia, Hindi, English) */}
      <NamasteWelcomeModal
        isOpen={isNamasteOpen}
        onClose={() => {
          setIsNamasteOpen(false);
          sessionStorage.setItem('foodbridge_namaste_seen', 'true');
        }}
      />

      {/* 4. User Login & Registration Modal with Guaranteed Non-Colliding IDs */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentRole={currentRole}
        onRoleChange={(r) => {
          setCurrentRole(r);
          if (r === 'donor') setActiveTab('donor-post');
          else setActiveTab('receiver-feed');
        }}
        onDonorChange={(d) => {
          setActiveDonor(d);
          setActiveDonorState(d);
        }}
        onReceiverChange={(r) => {
          setActiveReceiver(r);
          setReceiver(r);
        }}
        activeDonor={activeDonor}
        activeReceiver={receiver}
      />

      {/* 5. Detailed Nutritional Breakdown Modal (Carbs, Fats, Proteins, Calories, portion & batch) */}
      <NutritionModal
        listing={nutritionListing}
        onClose={() => setNutritionListing(null)}
        onClaim={(listing) => {
          setNutritionListing(null);
          handleOpenClaimQuantity(listing);
        }}
      />

      {/* 6. Google Workspace Hub Modal for Gmail & Google Tasks sync */}
      <WorkspaceHubModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
        claimedListings={listings.filter((l) => l.status === 'claimed' || l.status === 'picked_up')}
        onAuthChange={(user: any) => setIsWorkspaceConnected(!!user)}
      />

      {/* 7. Quantity Request Modal (Specify portions needed + 2-min accept protocol) */}
      <ClaimQuantityModal
        listing={claimModalListing}
        receiver={receiver}
        onClose={() => setClaimModalListing(null)}
        onSubmitRequest={handleSubmitQuantityOrder}
      />

      {/* 4. Similar Meals Re-routing Modal (When 2-minute acceptance expires or is declined) */}
      <SimilarMealsModal
        expiredListing={similarMealsData?.expiredListing || null}
        requestedServings={similarMealsData?.requestedServings || 20}
        similarListings={similarMealsData?.similarListings || []}
        onClose={() => setSimilarMealsData(null)}
        onClaimAlternative={handleClaimAlternative}
      />

      {/* 5. Urgent Multilingual Alert Modal */}
      <AlertModal
        listing={alertListing}
        onClose={() => setAlertListing(null)}
      />

      {/* 6. Trust System Rating Modal (1-5 Stars) */}
      <RatingModal
        listing={ratingListing}
        role={ratingRole}
        onClose={() => setRatingListing(null)}
        onSubmitRating={handleSubmitRating}
      />

      {/* 7. Real-time Simulated Toast Notification */}
      <ToastNotification
        notification={realtimeNotification}
        onClose={() => setRealtimeNotification(null)}
        onViewListing={(_listing) => {
          if (currentRole !== 'receiver') {
            setCurrentRole('receiver');
          }
          setActiveTab('receiver-feed');
        }}
      />

      {/* 8. Minimal Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900">FoodBridge</span>
            <span>&bull;</span>
            <span>#Zero_Food_Waste Hyperlocal Surplus Redistribution</span>
            <span>&bull;</span>
            <span className="text-emerald-700 font-semibold">Bhubaneswar Pilot</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                setListings(INITIAL_LISTINGS);
                alert('Reset to 8 default Bhubaneswar surplus listings with seeded ratings.');
              }}
              className="hover:text-stone-800 transition underline underline-offset-2"
            >
              Reset Demo Data
            </button>
            <span>Verified 4-Digit Handover & 2-Min Protocol</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
