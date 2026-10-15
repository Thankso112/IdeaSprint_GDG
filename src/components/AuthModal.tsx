import React, { useState } from 'react';
import { 
  X, 
  User, 
  UtensilsCrossed, 
  HeartHandshake, 
  ShieldCheck, 
  Sparkles, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  ArrowRight,
  Fingerprint,
  LogIn,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonorProfile, ReceiverProfile } from '../types';
import { 
  getAllDonors, 
  getAllReceivers, 
  generateUniqueDonorId, 
  generateUniqueReceiverId,
  registerNewDonor,
  registerNewReceiver,
  setActiveDonor,
  setActiveReceiver
} from '../services/userService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: 'donor' | 'receiver';
  onRoleChange: (role: 'donor' | 'receiver') => void;
  onDonorChange: (donor: DonorProfile) => void;
  onReceiverChange: (receiver: ReceiverProfile) => void;
  activeDonor: DonorProfile;
  activeReceiver: ReceiverProfile;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onRoleChange,
  onDonorChange,
  onReceiverChange,
  activeDonor,
  activeReceiver,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<'donor' | 'receiver'>(currentRole);

  // Registration Form States
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [donorType, setDonorType] = useState<DonorProfile['donorType']>('restaurant');
  const [receiverType, setReceiverType] = useState<ReceiverProfile['type']>('shelter');
  const [capacity, setCapacity] = useState<number>(50);
  const [preference, setPreference] = useState<'any' | 'veg'>('any');

  if (!isOpen) return null;

  const allDonors = getAllDonors();
  const allReceivers = getAllReceivers();

  // Preview the next guaranteed non-colliding ID for new registrants
  const nextDonorId = generateUniqueDonorId();
  const nextReceiverId = generateUniqueReceiverId();
  const projectedId = role === 'donor' ? nextDonorId : nextReceiverId;

  const handleSelectExistingDonor = (d: DonorProfile) => {
    setActiveDonor(d);
    onDonorChange(d);
    onRoleChange('donor');
    onClose();
  };

  const handleSelectExistingReceiver = (r: ReceiverProfile) => {
    setActiveReceiver(r);
    onReceiverChange(r);
    onRoleChange('receiver');
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organization.trim() || !address.trim()) return;

    if (role === 'donor') {
      const created = registerNewDonor({
        name,
        organization,
        donorType,
        phone,
        email: email || `${organization.toLowerCase().replace(/\s+/g, '')}@foodbridge.org`,
        address,
      });

      onDonorChange(created);
      onRoleChange('donor');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b'],
        });
      } catch (e) {}
    } else {
      const created = registerNewReceiver({
        name,
        organization,
        type: receiverType,
        capacity,
        preference,
        phone,
        email: email || `${organization.toLowerCase().replace(/\s+/g, '')}@foodbridge.org`,
        address,
      });

      onReceiverChange(created);
      onRoleChange('receiver');

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#f59e0b'],
        });
      } catch (e) {}
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-900 tracking-tight">
              FoodBridge Identity Portal
            </h3>
            <p className="text-xs text-stone-500">
              Unique ID registration & profile switching for Donors & Receivers.
            </p>
          </div>
        </div>

        {/* Mode Switcher: Login vs Register */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-stone-100 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
              tab === 'login'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Switch Profile / Login</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`py-2 px-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition ${
              tab === 'register'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Register New Account</span>
          </button>
        </div>

        {/* Role Toggle: Donor vs Receiver */}
        <div className="flex items-center justify-between p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 mb-5">
          <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Account Role:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setRole('donor')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                role === 'donor'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-stone-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Food Donor</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('receiver')}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 ${
                role === 'receiver'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-white text-stone-700 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Food Receiver (NGO)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LOGIN / SELECT ACTIVE PROFILE */}
        {tab === 'login' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-stone-600">
              <span className="font-bold">
                Available {role === 'donor' ? 'Registered Donors' : 'Registered Receivers'}
              </span>
              <span className="text-[11px] text-stone-400">Click to switch instantly</span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto no-scrollbar pr-1">
              {role === 'donor'
                ? allDonors.map((d) => {
                    const isSelected = activeDonor.id === d.id;
                    return (
                      <div
                        key={d.id}
                        onClick={() => handleSelectExistingDonor(d)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200'
                            : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {d.id.replace('DNR-', '#')}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-stone-900 text-sm truncate">
                                {d.organization}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white">
                                {d.id}
                              </span>
                              {d.isVerifiedDonor && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                              Contact: {d.name} &bull; {d.phone} &bull; {d.address}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 shrink-0">
                            <Check className="w-4 h-4" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium group-hover:text-emerald-700 shrink-0">
                            Switch &rarr;
                          </span>
                        )}
                      </div>
                    );
                  })
                : allReceivers.map((r) => {
                    const isSelected = activeReceiver.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => handleSelectExistingReceiver(r)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200'
                            : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {r.id.replace('RCV-', '#')}
                          </div>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-stone-900 text-sm truncate">
                                {r.organization}
                              </span>
                              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900 text-white">
                                {r.id}
                              </span>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded capitalize">
                                {r.type}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5 truncate">
                              Representative: {r.name} &bull; Capacity: {r.capacity} portions &bull; {r.location.address}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 shrink-0">
                            <Check className="w-4 h-4" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="text-xs text-stone-400 font-medium group-hover:text-emerald-700 shrink-0">
                            Switch &rarr;
                          </span>
                        )}
                      </div>
                    );
                  })}
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span>Demo profiles are seeded with sequential reserved IDs (001–005).</span>
              <button
                type="button"
                onClick={() => setTab('register')}
                className="font-bold text-emerald-700 hover:underline"
              >
                + Register New {role === 'donor' ? 'Donor' : 'Receiver'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW ACCOUNT */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {/* Projected Unique Non-Colliding ID Banner */}
            <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 rounded-2xl border border-emerald-300 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 block">
                  Assigned Guaranteed Non-Colliding ID:
                </span>
                <span className="font-mono font-black text-xl text-emerald-950">
                  {projectedId}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-800 font-semibold block">
                  Non-colliding counter
                </span>
                <span className="text-[11px] font-bold text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  Unique Registered ID
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {role === 'donor' ? 'Business / Kitchen Name' : 'NGO / Shelter Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={role === 'donor' ? 'e.g. Grand Odisha Caterers' : 'e.g. Sahaya Seva Trust'}
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Contact Person / Manager Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manoj Kumar Mishra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 98610 XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="contact@example.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Type Specific Fields */}
            {role === 'donor' ? (
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Donor Establishment Type
                </label>
                <select
                  value={donorType}
                  onChange={(e) => setDonorType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="restaurant">Restaurant / Fine Dining</option>
                  <option value="caterer">Banquets & Wedding Caterer</option>
                  <option value="hostel mess">Hostel / University Mess</option>
                  <option value="event host">Event Host / Convention</option>
                  <option value="supermarket">Bakery / Supermarket</option>
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Receiver Type
                  </label>
                  <select
                    value={receiverType}
                    onChange={(e) => setReceiverType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="shelter">Shelter Home</option>
                    <option value="volunteer">Volunteer Group</option>
                    <option value="community kitchen">Community Kitchen</option>
                    <option value="ngo">Registered NGO</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Batch Capacity (portions)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Food Preference
                  </label>
                  <select
                    value={preference}
                    onChange={(e) => setPreference(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="any">Any Surplus Food</option>
                    <option value="veg">🌱 Veg Only</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Bhubaneswar Street Address & Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Plot 12, Chandrasekharpur or Janpath Road, Bhubaneswar"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-600 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create & Login as {projectedId}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
