import React from 'react';
import { 
  HeartHandshake, 
  UtensilsCrossed, 
  MapPin, 
  PlusCircle, 
  BarChart3, 
  Trophy, 
  PackageCheck, 
  Sparkles,
  Layers
} from 'lucide-react';

interface HeaderProps {
  currentRole: 'donor' | 'receiver';
  onRoleChange: (role: 'donor' | 'receiver') => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  claimedCount: number;
  donorListingsCount: number;
  onOpenDemoQuickPost: () => void;
  onOpenNamaste?: () => void;
  onOpenAuth?: () => void;
  onOpenWorkspace?: () => void;
  activeUserId?: string;
  activeUserName?: string;
  isWorkspaceConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  claimedCount,
  donorListingsCount,
  onOpenDemoQuickPost,
  onOpenNamaste,
  onOpenAuth,
  onOpenWorkspace,
  activeUserId,
  activeUserName,
  isWorkspaceConnected,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo & Track Pill */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onTabChange(currentRole === 'donor' ? 'donor-post' : 'receiver-feed')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 font-sans">
                    Food<span className="text-emerald-600">Bridge</span>
                  </span>
                  <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    #Zero_Food_Waste
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-stone-500 font-medium hidden sm:block">
                  Hyperlocal Redistribution · Bhubaneswar Pilot
                </p>
              </div>
            </button>
          </div>

          {/* Role Switcher (Donor vs Receiver) */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 shadow-inner">
            <button
              onClick={() => {
                onRoleChange('donor');
                onTabChange('donor-post');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                currentRole === 'donor'
                  ? 'bg-white text-emerald-700 shadow-sm border border-stone-200/80 font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Donor</span>
              <span className="text-[10px] hidden md:inline text-stone-400 font-normal">(Restaurant/Mess)</span>
            </button>
            <button
              onClick={() => {
                onRoleChange('receiver');
                onTabChange('receiver-feed');
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all ${
                currentRole === 'receiver'
                  ? 'bg-white text-emerald-700 shadow-sm border border-stone-200/80 font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Receiver</span>
              <span className="text-[10px] hidden md:inline text-stone-400 font-normal">(NGO/Shelter)</span>
            </button>
          </div>

          {/* Quick Actions & Modal Triggers */}
          <div className="flex items-center gap-2">
            {/* Traditional Namaste Welcome Button */}
            {onOpenNamaste && (
              <button
                onClick={onOpenNamaste}
                title="Traditional Odia & Hindi Namaste Greeting with Spiritual Heritage"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 text-amber-900 border border-amber-300 hover:shadow-xs transition active:scale-95"
              >
                <span className="text-sm">🙏</span>
                <span className="hidden sm:inline">Namaste</span>
              </button>
            )}

            {/* User Account / ID Switcher */}
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                title={`Active User ID: ${activeUserId || 'Login/Register'}. Click to switch demo account or register new profile.`}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 transition"
              >
                <span className="font-mono font-bold text-[11px] bg-stone-900 text-white px-1.5 py-0.5 rounded">
                  {activeUserId || (currentRole === 'donor' ? 'DNR-001' : 'RCV-001')}
                </span>
                <span className="hidden md:inline truncate max-w-[90px] text-stone-600">
                  {activeUserName || 'Account'}
                </span>
              </button>
            )}

            {/* Google Workspace Integration Button */}
            {onOpenWorkspace && (
              <button
                onClick={onOpenWorkspace}
                title="Google Workspace Hub: Sync pickups to Gmail & Google Tasks"
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 transition"
              >
                <span className="relative flex h-2 w-2">
                  {isWorkspaceConnected && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${isWorkspaceConnected ? 'bg-blue-600' : 'bg-stone-300'}`}></span>
                </span>
                <span>Workspace</span>
              </button>
            )}

            {/* Demo Mode Quick Post */}
            <button
              onClick={onOpenDemoQuickPost}
              title="Test with pre-configured food images and verified AI data"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin-slow" />
              <span className="hidden sm:inline">Demo Mode</span>
              <span className="sm:hidden">Demo</span>
            </button>

            {/* Dashboard Link */}
            <button
              onClick={() => onTabChange('impact-dashboard')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition ${
                activeTab === 'impact-dashboard'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-700 hover:bg-stone-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Impact</span>
            </button>
          </div>
        </div>

        {/* Sub-Navigation for Current Role */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 border-t border-stone-100 text-xs sm:text-sm no-scrollbar">
          {currentRole === 'receiver' ? (
            <>
              <button
                onClick={() => onTabChange('receiver-feed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'receiver-feed'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>Hyperlocal Map & Feed</span>
              </button>

              <button
                onClick={() => onTabChange('ai-match')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'ai-match'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Best Match for You</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-bold uppercase">
                  Gemini
                </span>
              </button>

              <button
                onClick={() => onTabChange('my-pickups')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'my-pickups'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>My Pickups</span>
                {claimedCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {claimedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('leaderboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'leaderboard'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Top Food Heroes</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onTabChange('donor-post')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'donor-post'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Post Surplus Food (AI Verify)</span>
              </button>

              <button
                onClick={() => onTabChange('donor-listings')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'donor-listings'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>My Donated Listings</span>
                {donorListingsCount > 0 && (
                  <span className="bg-stone-800 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {donorListingsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('leaderboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  activeTab === 'leaderboard'
                    ? 'bg-emerald-100 text-emerald-900 font-bold'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Donor Leaderboard</span>
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
