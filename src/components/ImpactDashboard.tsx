import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  Utensils, 
  Scale, 
  Leaf, 
  Building2, 
  Trophy, 
  Award, 
  Sparkles, 
  TrendingUp,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { FoodListing, FoodHero } from '../types';
import { INITIAL_LEADERBOARD, DAILY_IMPACT_HISTORY } from '../data/mockData';

interface ImpactDashboardProps {
  listings: FoodListing[];
  pickedUpListings: FoodListing[];
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  listings,
  pickedUpListings,
}) => {
  // Pre-populated base impact + dynamic picked up servings
  const dynamicServings = pickedUpListings.reduce((sum, item) => sum + item.servings, 0);
  const totalMealsSaved = 1450 + dynamicServings;
  const foodRescuedKg = totalMealsSaved * 0.4;
  const co2AvoidedKg = foodRescuedKg * 2.5;
  const activeDonorsCount = 18;

  // Food Category Distribution data
  const categoryCounts: Record<string, number> = {
    'Cooked Meals': 52,
    'Bakery & Breads': 20,
    'Fruits & Vegetables': 16,
    'Packaged Dairy & Juices': 12,
  };

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  const PIE_COLORS = ['#10b981', '#f59e0b', '#06b6d4', '#8b5cf6'];

  // Bar chart daily trend
  const barData = DAILY_IMPACT_HISTORY.map((entry, idx) => {
    if (idx === DAILY_IMPACT_HISTORY.length - 1) {
      return {
        ...entry,
        mealsSaved: entry.mealsSaved + dynamicServings,
      };
    }
    return entry;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-5">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Real-Time Metrics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight mt-1.5">
            Zero Food Waste Impact Dashboard
          </h2>
          <p className="text-stone-500 text-sm mt-0.5">
            Aggregated surplus meal redistribution metrics across Bhubaneswar municipality pilot.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-2xl text-xs font-bold text-emerald-900">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live Verified Metrics</span>
        </div>
      </div>

      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Meals Saved */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500">Meals Saved</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {totalMealsSaved.toLocaleString()}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+38% vs last week</span>
            </p>
          </div>
        </div>

        {/* Card 2: Food Rescued in KG */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500">Food Rescued</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {Math.round(foodRescuedKg).toLocaleString()} <span className="text-base font-semibold text-stone-500">kg</span>
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              Servings × 0.4 kg standard
            </p>
          </div>
        </div>

        {/* Card 3: CO2 Avoided in KG */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500">CO2e Avoided</span>
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {Math.round(co2AvoidedKg).toLocaleString()} <span className="text-base font-semibold text-stone-500">kg</span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">
              kg Rescued × 2.5 kg CO2e
            </p>
          </div>
        </div>

        {/* Card 4: Active Donors */}
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-stone-500">Active Donors</span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-stone-900">
              {activeDonorsCount}
            </div>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              Hotels, caterers & hostels
            </p>
          </div>
        </div>
      </div>

      {/* Visual Charts: Bar Chart (Recharts) & Category Pie Chart (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Daily Meals Saved Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-stone-900 text-base">
                Meals Saved Per Day (This Week)
              </h3>
              <p className="text-xs text-stone-500">
                Daily surplus meal redistribution trajectory
              </p>
            </div>
            <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
              7-Day Trend
            </span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 11, fill: '#78716c' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#78716c' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip
                  cursor={{ fill: '#f5f5f4' }}
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                    padding: '8px 12px',
                  }}
                  formatter={(value: any) => [`${value} meals`, 'Meals Saved']}
                />
                <Bar 
                  dataKey="mealsSaved" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Food Category Breakdown Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-base">
              Surplus by Food Category
            </h3>
            <p className="text-xs text-stone-500 mb-2">
              Cooked buffets vs bakery vs packaged goods
            </p>
          </div>

          <div className="h-56 sm:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Share']}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Primary rescue channel: <strong>Buffet & Caterer surplus</strong></span>
          </div>
        </div>
      </div>

      {/* Top Food Heroes Leaderboard */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="text-xl font-black text-stone-900">
                Top Food Heroes Leaderboard
              </h3>
              <p className="text-xs text-stone-500">
                Recognizing Bhubaneswar's most proactive hunger relief donors and partners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              Gold &bull; Silver &bull; Bronze Badges
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INITIAL_LEADERBOARD.map((hero, idx) => {
            let badgeBg = 'bg-stone-100 text-stone-700 border-stone-300';
            if (hero.badge === 'Gold') {
              badgeBg = 'bg-gradient-to-r from-amber-200 to-yellow-300 text-amber-950 border-amber-400 font-black shadow-xs';
            } else if (hero.badge === 'Silver') {
              badgeBg = 'bg-stone-200 text-stone-800 border-stone-400 font-bold';
            } else if (hero.badge === 'Bronze') {
              badgeBg = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
            }

            return (
              <div
                key={hero.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-white hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-stone-200 text-stone-800 text-xs font-black flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </span>
                  <div className="text-2xl shrink-0">{hero.avatar}</div>
                  <div className="truncate">
                    <h4 className="font-extrabold text-stone-900 text-sm truncate">
                      {hero.name}
                    </h4>
                    <p className="text-xs text-stone-500 truncate">{hero.type}</p>
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{hero.location}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full border mb-1 ${badgeBg}`}>
                    {hero.badge} Hero
                  </span>
                  <div className="font-black text-stone-900 text-sm">
                    {hero.mealsDonated} <span className="text-[10px] font-normal text-stone-500">meals</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
