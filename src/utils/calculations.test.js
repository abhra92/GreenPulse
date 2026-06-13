import { describe, it, expect } from 'vitest';
import { calculateResults, calculateSimulatorSavings } from './calculations.js';

describe('Carbon Footprint Calculator', () => {
  it('calculates emissions correctly for a standard mixed lifestyle', () => {
    const formData = {
      carMiles: 50,
      carType: 'gas',
      publicTransitMiles: 20,
      flightHours: 5,
      electricBill: 3000,
      acHours: 4,
      appliancesRate: 'standard',
      dietType: 'mixed',
      organicRatio: 30,
      clothingSpend: 2000,
      electronicsSpend: 1500,
      consumerGoodsSpend: 5000,
      recyclingHabit: 'partial',
      plasticUsage: 'moderate',
      wasteSegregation: true,
    };

    const results = calculateResults(formData);

    // Transport: (50 * 52 * 0.404) + (20 * 52 * 0.14) + (5 * 90) = 1050.4 + 145.6 + 450 = 1646
    expect(results.breakdown.transport).toBe(1646);

    // Energy: (3000 * 12 * 0.0009) + (4 * 365 * 0.5) + 300 = 32.4 + 730 + 300 = 1062.4 => rounded to 1062
    expect(results.breakdown.energy).toBe(1062);

    // Food: Math.max(1200, 2500 - (30/100 * 300)) = Math.max(1200, 2500 - 90) = 2410
    expect(results.breakdown.food).toBe(2410);

    // Shopping: (2000 * 12 * 0.4) + (1500 * 12 * 0.8) + (5000 * 12 * 0.3) = 9600 + 14400 + 18000 = 42000
    expect(results.breakdown.shopping).toBe(42000);

    // Waste: Math.max(30, 200 + 100 - 50) = 250
    expect(results.breakdown.waste).toBe(250);

    // Total: 1646 + 1062.4 + 2410 + 42000 + 250 = 47368.4 => rounded to 47368
    expect(results.totalCO2).toBe(47368);

    // Score: Math.round(100 - (47368.4 / 220)) = Math.round(-115.31) = -115 => bounded to 10
    expect(results.score).toBe(10);
  });

  it('calculates emissions correctly for a highly sustainable green lifestyle', () => {
    const formData = {
      carMiles: 10,
      carType: 'electric',
      publicTransitMiles: 10,
      flightHours: 0,
      electricBill: 500, // Very low electric bill
      acHours: 0,
      appliancesRate: 'eco',
      dietType: 'vegetarian',
      organicRatio: 80,
      clothingSpend: 200,
      electronicsSpend: 0,
      consumerGoodsSpend: 1000,
      recyclingHabit: 'full',
      plasticUsage: 'low',
      wasteSegregation: true,
    };

    const results = calculateResults(formData);

    // Transport: (10 * 52 * 0.110) + (10 * 52 * 0.140) + 0 = 57.2 + 72.8 = 130
    expect(results.breakdown.transport).toBe(130);

    // Energy: (500 * 12 * 0.0009) + 0 + 150 = 5.4 + 150 = 155.4 => rounded to 155
    expect(results.breakdown.energy).toBe(155);

    // Food: Math.max(1200, 1500 - (80/100 * 300)) = Math.max(1200, 1500 - 240) = 1260
    expect(results.breakdown.food).toBe(1260);

    // Shopping: (200 * 12 * 0.4) + 0 + (1000 * 12 * 0.3) = 960 + 3600 = 4560
    expect(results.breakdown.shopping).toBe(4560);

    // Waste: Math.max(30, 50 + 20 - 50) = 30 (due to waste segregation credit and low plastic)
    expect(results.breakdown.waste).toBe(30);

    // Total: 130 + 155.4 + 1260 + 4560 + 30 = 6135.4 => rounded to 6135
    expect(results.totalCO2).toBe(6135);

    // Score: Math.round(100 - (6135.4 / 220)) = Math.round(100 - 27.88) = Math.round(72.11) = 72
    expect(results.score).toBe(72);
  });

  it('bounds the score correctly for extremely high emissions', () => {
    const highEmissionsData = {
      carMiles: 500,
      carType: 'gas',
      publicTransitMiles: 200,
      flightHours: 50,
      electricBill: 10000,
      acHours: 24,
      appliancesRate: 'heavy',
      dietType: 'nonVeg',
      organicRatio: 0,
      clothingSpend: 10000,
      electronicsSpend: 10000,
      consumerGoodsSpend: 20000,
      recyclingHabit: 'none',
      plasticUsage: 'high',
      wasteSegregation: false,
    };

    const results = calculateResults(highEmissionsData);
    expect(results.score).toBe(10); // Minimum score is 10
  });

  it('bounds the score correctly for extremely low emissions', () => {
    const lowEmissionsData = {
      carMiles: 0,
      carType: 'none',
      publicTransitMiles: 0,
      flightHours: 0,
      electricBill: 0,
      acHours: 0,
      appliancesRate: 'eco',
      dietType: 'vegetarian',
      organicRatio: 100,
      clothingSpend: 0,
      electronicsSpend: 0,
      consumerGoodsSpend: 0,
      recyclingHabit: 'full',
      plasticUsage: 'low',
      wasteSegregation: true,
    };

    const results = calculateResults(lowEmissionsData);
    // Total: 0 + 150 + 1200 + 0 + 30 = 1380 kg CO2
    // Score: Math.round(100 - (1380 / 220)) = Math.round(100 - 6.27) = 94 => bounded between 10 and 99
    expect(results.score).toBeLessThanOrEqual(99);
    expect(results.score).toBeGreaterThan(90);
  });
});

describe('Lifestyle Simulator Calculations', () => {
  it('calculates savings correctly for a gas car owner making green shifts', () => {
    const formData = {
      carType: 'gas',
      recyclingHabit: 'none',
    };

    const simulation = {
      driveReduction: 50, // km reduced per week
      vegetarianMeals: 5, // meals replaced per week
      acReduction: 2, // AC hours reduced per day
      upgradeRecycling: true, // upgrade to full recycling
    };

    const savings = calculateSimulatorSavings(formData, simulation);

    // Drive saved: 50 * 52 * 0.251 = 652.6 => rounded to 653
    expect(savings.driveSaved).toBe(653);

    // Food saved: 5 * 52 * 4 = 1040
    expect(savings.foodSaved).toBe(1040);

    // AC saved: 2 * 365 * 0.5 = 365
    expect(savings.acSaved).toBe(365);

    // Recycle saved (none -> full): 300
    expect(savings.recycleSaved).toBe(300);

    // Total Saved: 652.6 + 1040 + 365 + 300 = 2357.6 => rounded to 2358
    expect(savings.totalSaved).toBe(2358);

    // Monthly Saved: 2358 / 12 = 196.5 => rounded to 197
    expect(savings.monthlySaved).toBe(197);

    // Tree equivalent: 2358 / 22 = 107.18 => rounded to 107
    expect(savings.treeEquivalent).toBe(107);

    // Gas km equivalent: 2358 / 0.251 = 9394.4 => rounded to 9394
    expect(savings.gasKmEquivalent).toBe(9394);
  });

  it('calculates savings correctly for an EV owner with partial recycling', () => {
    const formData = {
      carType: 'electric',
      recyclingHabit: 'partial',
    };

    const simulation = {
      driveReduction: 20,
      vegetarianMeals: 0,
      acReduction: 0,
      upgradeRecycling: true, // partial -> full recycling
    };

    const savings = calculateSimulatorSavings(formData, simulation);

    // Drive saved: 20 * 52 * 0.068 = 70.72 => rounded to 71
    expect(savings.driveSaved).toBe(71);

    // Recycle saved (partial -> full): 150
    expect(savings.recycleSaved).toBe(150);

    // Total: 70.72 + 150 = 220.72 => rounded to 221
    expect(savings.totalSaved).toBe(221);
  });
});
