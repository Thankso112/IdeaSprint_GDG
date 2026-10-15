import React from 'react';
import { 
  X, 
  Utensils, 
  Flame, 
  Dna, 
  Wheat, 
  Droplets, 
  ShieldCheck, 
  Sparkles, 
  HeartHandshake, 
  Activity,
  Heart,
  Scale
} from 'lucide-react';
import { FoodListing } from '../types';

interface NutritionModalProps {
  listing: FoodListing | null;
  onClose: () => void;
  onClaim?: (listing: FoodListing) => void;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  listing,
  onClose,
  onClaim,
}) => {
  if (!listing) return null;

  // Fallback defaults if not set on older demo entries
  const nutrition = listing.nutrition || {
    calories: 420,
    protein: listing.vegOrNonVeg === 'veg' ? 14 : 26,
    carbs: 54,
    fats: 14,
    fiber: 5,
    keyNutrient: 'Rich in Iron, B-Vitamins & Complex Carbs',
    dietaryTags: ['Wholesome Recovery', 'Balanced Macros'],
  };

  const totalGrams = nutrition.protein + nutrition.carbs + nutrition.fats;
  const proteinPct = Math.round((nutrition.protein / (totalGrams || 1)) * 100);
  const carbsPct = Math.round((nutrition.carbs / (totalGrams || 1)) * 100);
  const fatsPct = Math.max(0, 100 - proteinPct - carbsPct);

  const totalServings = listing.remainingServings !== undefined ? listing.remainingServings : listing.servings;
  const batchTotalCalories = nutrition.calories * totalServings;
  const batchTotalProteinKg = ((nutrition.protein * totalServings) / 1000).toFixed(2);

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                Nutritional Breakdown
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Per Portion
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Verified macronutrient profile for shelter diet planning.
            </p>
          </div>
        </div>

        {/* Food Preview */}
        <div className="my-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3.5">
          <img
            src={listing.imageUrl}
            alt={listing.foodName}
            className="w-16 h-16 rounded-xl object-cover shrink-0"
          />
          <div className="flex-1 truncate">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/80 text-white">
                {listing.vegOrNonVeg === 'veg' ? '🌱 Veg' : '🍗 Non-Veg'}
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                {totalServings} Servings Available
              </span>
            </div>
            <h4 className="font-extrabold text-stone-900 text-sm truncate">{listing.foodName}</h4>
            <p className="text-xs text-stone-500 truncate mt-0.5">Offered by {listing.donorName}</p>
          </div>
        </div>

        {/* Key Calorie Hero */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-300 text-center mb-4">
          <div className="flex items-center justify-center gap-1.5 text-amber-700 font-bold text-xs uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span>Energy Value</span>
          </div>
          <div className="font-mono font-black text-4xl text-stone-900 tracking-tight">
            {nutrition.calories} <span className="text-lg font-bold text-stone-500">kcal</span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Standard adult portion &bull; ~22% of daily recommended caloric intake
          </p>
        </div>

        {/* 3 Core Macronutrient Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Protein */}
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 text-center">
            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 mx-auto flex items-center justify-center mb-1">
              <Dna className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-blue-900 uppercase block tracking-wider">Protein</span>
            <span className="font-mono font-black text-2xl text-blue-950 block">{nutrition.protein}g</span>
            <span className="text-[10px] text-blue-700 font-semibold">{proteinPct}% of macros</span>
          </div>

          {/* Carbs */}
          <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-center">
            <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-1">
              <Wheat className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">Carbs</span>
            <span className="font-mono font-black text-2xl text-amber-950 block">{nutrition.carbs}g</span>
            <span className="text-[10px] text-amber-700 font-semibold">{carbsPct}% of macros</span>
          </div>

          {/* Fats */}
          <div className="p-3 rounded-2xl bg-rose-50/80 border border-rose-200 text-center">
            <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 mx-auto flex items-center justify-center mb-1">
              <Droplets className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold text-rose-900 uppercase block tracking-wider">Fats</span>
            <span className="font-mono font-black text-2xl text-rose-950 block">{nutrition.fats}g</span>
            <span className="text-[10px] text-rose-700 font-semibold">{fatsPct}% of macros</span>
          </div>
        </div>

        {/* Macro Distribution Stacked Bar */}
        <div className="mb-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 font-bold">
            <span>Macro Balance Ratio</span>
            <span className="font-mono text-[11px] text-stone-500">P: {proteinPct}% | C: {carbsPct}% | F: {fatsPct}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-stone-200">
            <div style={{ width: `${proteinPct}%` }} className="bg-blue-500" title={`Protein: ${proteinPct}%`} />
            <div style={{ width: `${carbsPct}%` }} className="bg-amber-500" title={`Carbs: ${carbsPct}%`} />
            <div style={{ width: `${fatsPct}%` }} className="bg-rose-500" title={`Fats: ${fatsPct}%`} />
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 mt-1.5">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Protein</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Carbohydrates</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span>Dietary Fats</span>
          </div>
        </div>

        {/* Micronutrients & Fiber Details */}
        <div className="space-y-2 mb-4 text-xs">
          {nutrition.fiber !== undefined && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950">
              <span className="font-semibold flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-700" />
                <span>Dietary Fiber</span>
              </span>
              <span className="font-mono font-bold text-emerald-900">{nutrition.fiber}g / portion</span>
            </div>
          )}

          {nutrition.keyNutrient && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-800">
              <span className="font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Key Micronutrients</span>
              </span>
              <span className="font-semibold text-stone-700 text-[11px] truncate max-w-[230px]">
                {nutrition.keyNutrient}
              </span>
            </div>
          )}

          {nutrition.dietaryTags && nutrition.dietaryTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {nutrition.dietaryTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200"
                >
                  ✓ {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Batch Scale Impact Box */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-xs mb-5">
          <p className="font-extrabold text-emerald-950 flex items-center gap-1 mb-1">
            <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total Community Nourishment Value ({totalServings} portions)</span>
          </p>
          <div className="grid grid-cols-2 gap-2 mt-1.5 text-emerald-900 text-[11px]">
            <div>
              <span className="block text-emerald-700 text-[10px]">Total Energy:</span>
              <strong className="font-mono text-sm">{batchTotalCalories.toLocaleString()} kcal</strong>
            </div>
            <div>
              <span className="block text-emerald-700 text-[10px]">Total Pure Protein:</span>
              <strong className="font-mono text-sm">~{batchTotalProteinKg} kg</strong>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 font-bold text-xs text-stone-600 transition"
          >
            Close
          </button>

          {onClaim && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onClaim(listing);
              }}
              className="flex-2 py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Utensils className="w-4 h-4" />
              <span>Claim Meal Portions</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
