// Deterministic Pricing Calculator based on Darjeeling Himalayan Village Factors per docs/09-ai-architecture.md

export type SeasonType = 'peak' | 'standard' | 'monsoon';

export interface PricingFactors {
  locationTier: 'premium' | 'standard' | 'remote';
  roomsCount: number;
  includesOrganicFood: boolean;
  includesTeaTour: boolean;
  hasPrivateBalcony: boolean;
  hasHotWaterGeyser: boolean;
  season: SeasonType;
}

export interface PricingCalculationResult {
  basePrice: number;
  minRecommended: number;
  maxRecommended: number;
  factorsBreakdown: Array<{ label: string; amount: number }>;
  disclaimer: string;
}

export function calculateHomestayPrice(factors: PricingFactors): PricingCalculationResult {
  let base = 1200;
  const breakdown: Array<{ label: string; amount: number }> = [
    { label: 'Base Room Standard Rate', amount: 1200 },
  ];

  if (factors.locationTier === 'premium') {
    base += 300;
    breakdown.push({ label: 'Prime Tea-Garden Location View', amount: 300 });
  } else if (factors.locationTier === 'remote') {
    base -= 150;
    breakdown.push({ label: 'Remote / Offbeat Trail Adjustment', amount: -150 });
  }

  if (factors.includesOrganicFood) {
    base += 500;
    breakdown.push({ label: 'Fresh Kitchen Garden Breakfast & Dinner', amount: 500 });
  }
  if (factors.includesTeaTour) {
    base += 200;
    breakdown.push({ label: 'Guided Tea Plucking & Factory Experience', amount: 200 });
  }
  if (factors.hasPrivateBalcony) {
    base += 250;
    breakdown.push({ label: 'Private Kanchenjunga / Valley Balcony', amount: 250 });
  }
  if (factors.hasHotWaterGeyser) {
    base += 150;
    breakdown.push({ label: 'Dedicated 24/7 Hot Water Facility', amount: 150 });
  }

  let seasonalAdjustment = 0;
  if (factors.season === 'peak') {
    seasonalAdjustment = Math.round(base * 0.25);
    breakdown.push({ label: 'Autumn / Spring Peak Season Demand (+25%)', amount: seasonalAdjustment });
  } else if (factors.season === 'monsoon') {
    seasonalAdjustment = -Math.round(base * 0.20);
    breakdown.push({ label: 'Monsoon Off-Season Discount (-20%)', amount: seasonalAdjustment });
  }

  const finalEstimatedPrice = Math.max(800, base + seasonalAdjustment);
  const minRecommended = Math.round((finalEstimatedPrice * 0.9) / 50) * 50;
  const maxRecommended = Math.round((finalEstimatedPrice * 1.15) / 50) * 50;

  return {
    basePrice: finalEstimatedPrice,
    minRecommended,
    maxRecommended,
    factorsBreakdown: breakdown,
    disclaimer: 'Calculated using local Darjeeling homestay standard benchmarks. Actual rates are determined by you.',
  };
}
