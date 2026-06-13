import React, { useState, useEffect } from 'react';
import { Trees, Car } from 'lucide-react';

export default function Simulator() {
  const [results, setResults] = useState(null);
  
  // Simulation variables
  const [driveReduction, setDriveReduction] = useState(0); // miles reduced per week
  const [vegetarianMeals, setVegetarianMeals] = useState(0); // meatless meals replaced per week
  const [acReduction, setAcReduction] = useState(0); // AC hours reduced per day
  const [upgradeRecycling, setUpgradeRecycling] = useState(false); // Upgrade to full recycling

  useEffect(() => {
    const data = localStorage.getItem('greeplus_footprint');
    if (data) {
      setResults(JSON.parse(data));
    }
  }, []);

  if (!results) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-beige-deep bg-cream p-12 text-center flex flex-col items-center gap-6">
        <div className="size-16 rounded-md bg-canvas border border-beige-deep flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="size-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
        </div>
        <h2 className="font-display text-3xl font-normal text-ink">Assessment needed for simulator</h2>
        <p className="text-slate max-w-md">
          To run lifestyle change simulations, please complete your carbon assessment first.
        </p>
        <a
          href="/assess"
          className="rounded-md bg-primary text-on-primary px-6 py-3 font-semibold hover:bg-primary-deep transition-colors"
        >
          Start Assessment
        </a>
      </div>
    );
  }

  const { score: initialScore, totalCO2: initialCO2, formData } = results;

  // Max sliders limits based on assessment inputs
  const maxDriveReduction = formData.carType !== 'none' ? formData.carMiles : 0;
  const maxAcReduction = formData.acHours;
  const showRecycleOption = formData.recyclingHabit !== 'full';

  // Calculate simulated savings (kg CO2 per year)
  let carFactor = 0;
  if (formData.carType === 'gas') carFactor = 0.404;
  else if (formData.carType === 'electric') carFactor = 0.110;
  const driveSaved = driveReduction * 52 * carFactor;

  // Replaced meat meals: beef produces roughly 6.5kg CO2, veg produces 1.5kg.
  // Savings is ~5.0kg per meal replaced. Let's use 4.0kg as a conservative estimate.
  const foodSaved = vegetarianMeals * 52 * 4.0;

  const acSaved = acReduction * 365 * 0.5; // 0.5 kg per hour

  let recycleSaved = 0;
  if (upgradeRecycling) {
    if (formData.recyclingHabit === 'none') recycleSaved = 300;
    else if (formData.recyclingHabit === 'partial') recycleSaved = 150;
  }

  const totalSaved = Math.round(driveSaved + foodSaved + acSaved + recycleSaved);
  const monthlySaved = Math.round(totalSaved / 12);

  // Equivalent impact
  const treeEquivalent = Math.round(totalSaved / 22); // average tree absorbs 22kg CO2/year
  const gasMilesEquivalent = Math.round(totalSaved / 0.404); // average car 0.404kg/mile

  // New Score calculation
  const newCO2 = Math.max(800, initialCO2 - totalSaved);
  let newScore = Math.round(100 - (newCO2 / 220));
  if (newScore < 10) newScore = 10;
  if (newScore > 99) newScore = 99;
  const scoreImprovement = newScore - initialScore;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left side: Simulation Controls */}
      <div className="lg:col-span-7 rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col gap-6 md:p-8">
        <h3 className="font-sans text-xl font-semibold text-ink border-b border-hairline-soft pb-3">
          Configure Lifestyle Modifications
        </h3>

        {/* Control 1: Driving Reduction */}
        {maxDriveReduction > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="drive-sim" className="font-medium text-slate">
                Reduce Driving
              </label>
              <span className="font-bold text-ink">-{driveReduction} miles / week</span>
            </div>
            <input
              id="drive-sim"
              type="range"
              min="0"
              max={maxDriveReduction}
              value={driveReduction}
              onChange={(e) => setDriveReduction(parseInt(e.target.value) || 0)}
              className="w-full h-2 bg-hairline-strong rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[11px] text-slate">
              Current weekly driving: {formData.carMiles} miles ({formData.carType === 'gas' ? 'Gasoline' : 'EV'}). Replaces trips with walking, cycling, or public transport.
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate bg-surface p-4 border border-hairline-soft rounded-md">
            Personal driving cannot be reduced (you specified 'No Personal Vehicle' in your assessment).
          </div>
        )}

        {/* Control 2: Meatless Meals Replaced */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="food-sim" className="font-medium text-slate">
              Replace Meat Meals with Plant-Based
            </label>
            <span className="font-bold text-ink">{vegetarianMeals} meals / week</span>
          </div>
          <input
            id="food-sim"
            type="range"
            min="0"
            max="21"
            value={vegetarianMeals}
            onChange={(e) => setVegetarianMeals(parseInt(e.target.value) || 0)}
            className="w-full h-2 bg-hairline-strong rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <p className="text-[11px] text-slate">
            Replaces poultry, pork, or beef meals with vegetarian/vegan options. 21 meals is a fully vegetarian diet.
          </p>
        </div>

        {/* Control 3: Air Conditioning Reduction */}
        {maxAcReduction > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm">
              <label htmlFor="ac-sim" className="font-medium text-slate">
                Reduce AC Operation
              </label>
              <span className="font-bold text-ink">-{acReduction} hours / day</span>
            </div>
            <input
              id="ac-sim"
              type="range"
              min="0"
              max={maxAcReduction}
              value={acReduction}
              onChange={(e) => setAcReduction(parseInt(e.target.value) || 0)}
              className="w-full h-2 bg-hairline-strong rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[11px] text-slate">
              Current AC usage: {formData.acHours} hours/day. Turn off heating/cooling when sleeping or away.
            </p>
          </div>
        ) : (
          <div className="text-xs text-slate bg-surface p-4 border border-hairline-soft rounded-md">
            AC hours cannot be reduced (you specified 0 AC hours daily in your assessment).
          </div>
        )}

        {/* Control 4: Recycling Upgrade */}
        {showRecycleOption && (
          <div className="flex items-center gap-3 bg-cream-light p-4 border border-beige-deep rounded-md mt-2">
            <input
              id="recycle-sim"
              type="checkbox"
              checked={upgradeRecycling}
              onChange={(e) => setUpgradeRecycling(e.target.checked)}
              className="size-5 accent-primary cursor-pointer border border-hairline-strong rounded"
            />
            <label htmlFor="recycle-sim" className="text-sm font-medium text-ink cursor-pointer">
              Upgrade to full, consistent recycling practices.
            </label>
          </div>
        )}
      </div>

      {/* Right side: Real-time projections */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* Score & Savings projections */}
        <div className="rounded-lg border border-beige-deep bg-cream p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-sans text-lg font-semibold text-ink border-b border-beige-deep pb-3">
            Simulated Projections
          </h3>

          <div className="flex justify-between items-center bg-canvas p-4 border border-beige-deep rounded-md">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate">New Carbon Score</span>
              <div className="text-4xl font-display font-semibold text-ink mt-1">
                {newScore} <span className="text-sm font-sans font-normal text-slate">/ 100</span>
              </div>
            </div>
            {scoreImprovement > 0 && (
              <div className="text-right">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-green-700">Improvement</span>
                <div className="text-3xl font-display font-semibold text-green-600 mt-1">
                  +{scoreImprovement} pts
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-beige-deep rounded-md p-4 bg-canvas">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate">Monthly Saving</span>
              <div className="text-2xl font-display font-semibold text-ink mt-1">
                {monthlySaved} <span className="text-xs font-sans font-normal text-slate">kg CO₂</span>
              </div>
            </div>
            <div className="border border-beige-deep rounded-md p-4 bg-canvas">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate">Annual Saving</span>
              <div className="text-2xl font-display font-semibold text-ink mt-1">
                {totalSaved.toLocaleString()} <span className="text-xs font-sans font-normal text-slate">kg CO₂</span>
              </div>
            </div>
          </div>
        </div>

        {/* Equivalent environmental impact details */}
        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col gap-5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone border-b border-hairline-soft pb-2">
            Equivalent Impact (Per Year)
          </h4>

          {/* Tree equivalents */}
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
              <Trees className="size-6 text-green-700" />
            </div>
            <div>
              <div className="text-xl font-display font-semibold text-ink">
                {treeEquivalent} Trees
              </div>
              <p className="text-xs text-slate mt-0.5">
                Absorbs the equivalent emissions of planting {treeEquivalent} new trees annually.
              </p>
            </div>
          </div>

          {/* Mile equivalents */}
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center">
              <Car className="size-6 text-orange-700" />
            </div>
            <div>
              <div className="text-xl font-display font-semibold text-ink">
                {gasMilesEquivalent.toLocaleString()} Miles
              </div>
              <p className="text-xs text-slate mt-0.5">
                Avoids the emissions of driving {gasMilesEquivalent.toLocaleString()} miles in an average gasoline car.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
