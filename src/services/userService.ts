import { DonorProfile, ReceiverProfile } from '../types';

// Reserved sequential demo donors
export const DEMO_DONORS: DonorProfile[] = [
  {
    id: 'DNR-001',
    name: 'Chef Rajesh Pattnaik',
    organization: 'Hotel Swosti Grand',
    donorType: 'restaurant',
    phone: '+91 98610 22441',
    email: 'kitchen@swostigrand.com',
    address: 'Janpath, Unit-3, Kharvel Nagar, Bhubaneswar',
    location: {
      lat: 20.2685,
      lng: 85.8432,
      address: 'Janpath, Unit-3, Kharvel Nagar, Bhubaneswar',
    },
    rating: 4.9,
    reviewCount: 34,
    pickupSuccessRate: 99,
    successfulDonationsCount: 32,
    isVerifiedDonor: true,
    joinedAt: '2025-01-15T10:00:00.000Z',
  },
  {
    id: 'DNR-002',
    name: 'Deepak Dash',
    organization: 'Mayfair Lagoon Banquets',
    donorType: 'caterer',
    phone: '+91 99370 55122',
    email: 'banquets@mayfairlagoon.com',
    address: '8-B Jayadev Vihar, Mayfair Road, Bhubaneswar',
    location: {
      lat: 20.3048,
      lng: 85.8252,
      address: '8-B Jayadev Vihar, Mayfair Road, Bhubaneswar',
    },
    rating: 5.0,
    reviewCount: 58,
    pickupSuccessRate: 100,
    successfulDonationsCount: 55,
    isVerifiedDonor: true,
    joinedAt: '2024-11-20T08:30:00.000Z',
  },
  {
    id: 'DNR-003',
    name: 'Sushant Kumar Jena',
    organization: 'KIIT Campus 4 Mega Mess',
    donorType: 'hostel mess',
    phone: '+91 94372 11993',
    email: 'mess.c4@kiit.ac.in',
    address: 'Campus 4, KIIT Deemed to be University, Patia, Bhubaneswar',
    location: {
      lat: 20.3541,
      lng: 85.8184,
      address: 'Campus 4, KIIT Deemed to be University, Patia, Bhubaneswar',
    },
    rating: 4.8,
    reviewCount: 42,
    pickupSuccessRate: 97,
    successfulDonationsCount: 40,
    isVerifiedDonor: true,
    joinedAt: '2025-02-01T12:00:00.000Z',
  },
  {
    id: 'DNR-004',
    name: 'Alok Panda',
    organization: 'Ekamra Organic Fresh Mart',
    donorType: 'supermarket',
    phone: '+91 94390 44882',
    email: 'dispatch@ekamraorganic.in',
    address: 'Plot 104, Bapuji Nagar, Near Rajmahal Square, Bhubaneswar',
    location: {
      lat: 20.2612,
      lng: 85.8329,
      address: 'Plot 104, Bapuji Nagar, Near Rajmahal Square, Bhubaneswar',
    },
    rating: 4.7,
    reviewCount: 22,
    pickupSuccessRate: 98,
    successfulDonationsCount: 19,
    isVerifiedDonor: true,
    joinedAt: '2025-03-05T09:15:00.000Z',
  },
  {
    id: 'DNR-005',
    name: 'Rakesh Mohapatra',
    organization: 'Trident Galaxy Event Grounds',
    donorType: 'event host',
    phone: '+91 98530 88219',
    email: 'events@tridentgalaxy.com',
    address: 'Chandaka Industrial Estate, Kalarahanga, Bhubaneswar',
    location: {
      lat: 20.3621,
      lng: 85.7955,
      address: 'Chandaka Industrial Estate, Kalarahanga, Bhubaneswar',
    },
    rating: 4.9,
    reviewCount: 29,
    pickupSuccessRate: 96,
    successfulDonationsCount: 26,
    isVerifiedDonor: true,
    joinedAt: '2025-02-18T14:45:00.000Z',
  },
];

// Reserved sequential demo receivers
export const DEMO_RECEIVERS: ReceiverProfile[] = [
  {
    id: 'RCV-001',
    name: 'Sunita Mohanty',
    organization: 'Anjali Child & Shelter Kitchen',
    type: 'shelter',
    capacity: 45,
    preference: 'any',
    location: {
      lat: 20.2910,
      lng: 85.8420,
      address: 'Near Ram Mandir, Janpath Road, Saheed Nagar, Bhubaneswar',
    },
    phone: '+91 94371 88204',
    email: 'sunita.mohanty@anjalishelter.org',
    joinedAt: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'RCV-002',
    name: 'Bikash Rout',
    organization: 'Mission Ashra Rescue Home',
    type: 'shelter',
    capacity: 65,
    preference: 'veg',
    location: {
      lat: 20.2520,
      lng: 85.8210,
      address: 'Old Town, Lingaraj Station Road, Bhubaneswar',
    },
    phone: '+91 97780 43219',
    email: 'care@missionashra.org',
    joinedAt: '2025-01-18T11:20:00.000Z',
  },
  {
    id: 'RCV-003',
    name: 'Debasish Sahoo',
    organization: 'Bhubaneswar Night Food Relief Volunteers',
    type: 'volunteer',
    capacity: 80,
    preference: 'any',
    location: {
      lat: 20.3150,
      lng: 85.8200,
      address: 'Near Jayadev Vihar Flyover & IRC Village, Bhubaneswar',
    },
    phone: '+91 98612 99401',
    email: 'nightrelief.bbsr@gmail.com',
    joinedAt: '2025-02-05T19:00:00.000Z',
  },
  {
    id: 'RCV-004',
    name: 'Priyanka Nayak',
    organization: 'Ekamra Annapurna Community Kitchen',
    type: 'community kitchen',
    capacity: 120,
    preference: 'veg',
    location: {
      lat: 20.2800,
      lng: 85.8350,
      address: 'Master Canteen Chowk, Station Square, Bhubaneswar',
    },
    phone: '+91 94380 66720',
    email: 'annapurna.kitchen@ekamra.org',
    joinedAt: '2025-02-14T07:30:00.000Z',
  },
];

const DONOR_STORAGE_KEY = 'foodbridge_all_donors_v1';
const RECEIVER_STORAGE_KEY = 'foodbridge_all_receivers_v1';
const ACTIVE_DONOR_KEY = 'foodbridge_active_donor_v1';
const ACTIVE_RECEIVER_KEY = 'foodbridge_active_receiver_v1';

// Helpers to read stored profiles
export function getAllDonors(): DonorProfile[] {
  try {
    const raw = localStorage.getItem(DONOR_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEMO_DONORS;
}

export function getAllReceivers(): ReceiverProfile[] {
  try {
    const raw = localStorage.getItem(RECEIVER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return DEMO_RECEIVERS;
}

/**
 * Generates guaranteed unique non-colliding Donor ID.
 * Demo donors take DNR-001 through DNR-005.
 * New registrants take DNR-101, DNR-102, etc.
 */
export function generateUniqueDonorId(): string {
  const donors = getAllDonors();
  const existingIds = new Set(donors.map((d) => d.id));

  // Find highest registered number above 100
  let nextNum = 101;
  while (existingIds.has(`DNR-${nextNum.toString().padStart(3, '0')}`)) {
    nextNum++;
  }
  return `DNR-${nextNum.toString().padStart(3, '0')}`;
}

/**
 * Generates guaranteed unique non-colliding Receiver ID.
 * Demo receivers take RCV-001 through RCV-004.
 * New registrants take RCV-101, RCV-102, etc.
 */
export function generateUniqueReceiverId(): string {
  const receivers = getAllReceivers();
  const existingIds = new Set(receivers.map((r) => r.id));

  let nextNum = 101;
  while (existingIds.has(`RCV-${nextNum.toString().padStart(3, '0')}`)) {
    nextNum++;
  }
  return `RCV-${nextNum.toString().padStart(3, '0')}`;
}

/**
 * Registers a new Donor with a guaranteed non-colliding ID.
 */
export function registerNewDonor(data: {
  name: string;
  organization: string;
  donorType: DonorProfile['donorType'];
  phone: string;
  email: string;
  address: string;
  lat?: number;
  lng?: number;
}): DonorProfile {
  const newId = generateUniqueDonorId();
  const donors = getAllDonors();

  const newDonor: DonorProfile = {
    id: newId,
    name: data.name,
    organization: data.organization,
    donorType: data.donorType,
    phone: data.phone,
    email: data.email,
    address: data.address,
    location: {
      lat: data.lat || 20.2961 + (Math.random() - 0.5) * 0.05,
      lng: data.lng || 85.8245 + (Math.random() - 0.5) * 0.05,
      address: data.address,
    },
    rating: 5.0,
    reviewCount: 0,
    pickupSuccessRate: 100,
    successfulDonationsCount: 0,
    isVerifiedDonor: false,
    joinedAt: new Date().toISOString(),
  };

  const updated = [newDonor, ...donors];
  localStorage.setItem(DONOR_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(ACTIVE_DONOR_KEY, JSON.stringify(newDonor));
  return newDonor;
}

/**
 * Registers a new Receiver with a guaranteed non-colliding ID.
 */
export function registerNewReceiver(data: {
  name: string;
  organization: string;
  type: ReceiverProfile['type'];
  capacity: number;
  preference: ReceiverProfile['preference'];
  phone: string;
  email?: string;
  address: string;
  lat?: number;
  lng?: number;
}): ReceiverProfile {
  const newId = generateUniqueReceiverId();
  const receivers = getAllReceivers();

  const newReceiver: ReceiverProfile = {
    id: newId,
    name: data.name,
    organization: data.organization,
    type: data.type,
    capacity: data.capacity,
    preference: data.preference,
    phone: data.phone,
    email: data.email,
    location: {
      lat: data.lat || 20.2961 + (Math.random() - 0.5) * 0.05,
      lng: data.lng || 85.8245 + (Math.random() - 0.5) * 0.05,
      address: data.address,
    },
    joinedAt: new Date().toISOString(),
  };

  const updated = [newReceiver, ...receivers];
  localStorage.setItem(RECEIVER_STORAGE_KEY, JSON.stringify(updated));
  localStorage.setItem(ACTIVE_RECEIVER_KEY, JSON.stringify(newReceiver));
  return newReceiver;
}

export function getActiveDonor(): DonorProfile {
  try {
    const raw = localStorage.getItem(ACTIVE_DONOR_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEMO_DONORS[1]; // Mayfair Lagoon Banquets (DNR-002)
}

export function setActiveDonor(donor: DonorProfile) {
  localStorage.setItem(ACTIVE_DONOR_KEY, JSON.stringify(donor));
}

export function getActiveReceiver(): ReceiverProfile {
  try {
    const raw = localStorage.getItem(ACTIVE_RECEIVER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEMO_RECEIVERS[0]; // Anjali Child & Shelter Kitchen (RCV-001)
}

export function setActiveReceiver(receiver: ReceiverProfile) {
  localStorage.setItem(ACTIVE_RECEIVER_KEY, JSON.stringify(receiver));
}
