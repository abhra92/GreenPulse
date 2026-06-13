import React, { useState, useEffect } from 'react';

export default function AssessmentForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Transportation
    carMiles: 50,
    carType: 'gas', // gas, electric, none
    publicTransitMiles: 20,
    flightHours: 5,
    
    // Step 2: Home Energy
    electricBill: 80,
    acHours: 4,
    appliancesRate: 'standard', // eco, standard, heavy
    
    // Step 3: Food & Lifestyle
    dietType: 'mixed', // vegetarian, mixed, nonVeg
    organicRatio: 30, // percentage
    
    // Step 4: Shopping & Consumption
    clothingSpend: 50, // monthly $
    electronicsSpend: 30, // monthly $
    consumerGoodsSpend: 100, // monthly $
    
    // Step 5: Waste Management
    recyclingHabit: 'partial', // full, partial, none
    plasticUsage: 'moderate', // low, moderate, high
    wasteSegregation: true,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 5));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const calculateResults = () => {
    // 1. Transportation
    let carFactor = 0;
    if (formData.carType === 'gas') carFactor = 0.404;
    else if (formData.carType === 'electric') carFactor = 0.110;
    const carEmissions = formData.carMiles * 52 * carFactor;
    const transitEmissions = formData.publicTransitMiles * 52 * 0.140;
    const flightEmissions = formData.flightHours * 90;
    const transportTotal = carEmissions + transitEmissions + flightEmissions;

    // 2. Home Energy
    const electricEmissions = formData.electricBill * 12 * 0.7; // 0.7 kg CO2 per dollar
    const acEmissions = formData.acHours * 365 * 0.5; // 0.5 kg CO2 per hour
    let applianceEmissions = 300;
    if (formData.appliancesRate === 'eco') applianceEmissions = 150;
    else if (formData.appliancesRate === 'heavy') applianceEmissions = 600;
    const energyTotal = electricEmissions + acEmissions + applianceEmissions;

    // 3. Food
    let dietBase = 2500; // mixed
    if (formData.dietType === 'vegetarian') dietBase = 1500;
    else if (formData.dietType === 'nonVeg') dietBase = 3500;
    // Organic discount
    const organicDiscount = (formData.organicRatio / 100) * 300;
    const foodTotal = Math.max(1200, dietBase - organicDiscount);

    // 4. Shopping
    const clothingEmissions = formData.clothingSpend * 12 * 0.4;
    const electronicsEmissions = formData.electronicsSpend * 12 * 0.8;
    const goodsEmissions = formData.consumerGoodsSpend * 12 * 0.3;
    const shoppingTotal = clothingEmissions + electronicsEmissions + goodsEmissions;

    // 5. Waste
    let recyclingFactor = 200;
    if (formData.recyclingHabit === 'full') recyclingFactor = 50;
    else if (formData.recyclingHabit === 'none') recyclingFactor = 350;

    let plasticFactor = 100;
    if (formData.plasticUsage === 'low') plasticFactor = 20;
    else if (formData.plasticUsage === 'high') plasticFactor = 250;

    const wasteSegregationCredit = formData.wasteSegregation ? -50 : 0;
    const wasteTotal = Math.max(30, recyclingFactor + plasticFactor + wasteSegregationCredit);

    // Totals
    const totalCO2 = transportTotal + energyTotal + foodTotal + shoppingTotal + wasteTotal;

    // Score: 100 is best, 0 is worst. Let's make 4000kg the "perfect" baseline (Score 95)
    // and 20000kg a "poor" baseline (Score 20).
    let score = Math.round(100 - (totalCO2 / 220));
    if (score < 10) score = 10;
    if (score > 99) score = 99;

    return {
      score,
      totalCO2: Math.round(totalCO2),
      breakdown: {
        transport: Math.round(transportTotal),
        energy: Math.round(energyTotal),
        food: Math.round(foodTotal),
        shopping: Math.round(shoppingTotal),
        waste: Math.round(wasteTotal),
      },
      formData,
      timestamp: new Date().toISOString(),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const results = calculateResults();
    localStorage.setItem('greeplus_footprint', JSON.stringify(results));
    
    // Seed initial daily challenge progress or active streak if not present
    if (!localStorage.getItem('greeplus_streak')) {
      localStorage.setItem('greeplus_streak', '3');
      localStorage.setItem('greeplus_level', 'Eco Explorer');
      localStorage.setItem('greeplus_xp', '420');
    }

    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="mx-auto max-w-2xl rounded-lg border border-beige-deep bg-cream p-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Section {step} of 5
        </h2>
        <span className="text-xs font-semibold uppercase tracking-wider text-stone">
          {step === 1 && 'Transportation'}
          {step === 2 && 'Home Energy'}
          {step === 3 && 'Food & Lifestyle'}
          {step === 4 && 'Shopping & Consumption'}
          {step === 5 && 'Waste Management'}
        </span>
      </div>

      {/* Custom Progress Bar */}
      <div className="h-2 w-full bg-hairline-soft rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Step 1: Transportation */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-ink">Transportation Habits</h3>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="carType" className="text-sm font-medium text-slate">Personal Vehicle Type</label>
              <select
                id="carType"
                value={formData.carType}
                onChange={(e) => handleInputChange('carType', e.target.value)}
              >
                <option value="gas">Gasoline/Diesel Vehicle</option>
                <option value="electric">Electric Vehicle (EV)</option>
                <option value="none">No Personal Vehicle</option>
              </select>
            </div>

            {formData.carType !== 'none' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-sm">
                  <label htmlFor="carMiles" className="font-medium text-slate">Weekly Distance Driven</label>
                  <span className="font-bold">{formData.carMiles} miles</span>
                </div>
                <input
                  id="carMiles"
                  type="range"
                  min="0"
                  max="500"
                  value={formData.carMiles}
                  onChange={(e) => handleInputChange('carMiles', parseInt(e.target.value) || 0)}
                  className="accent-primary h-2 rounded-lg cursor-pointer bg-hairline-strong"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <label htmlFor="publicTransitMiles" className="font-medium text-slate">Weekly Public Transit Distance</label>
                <span className="font-bold">{formData.publicTransitMiles} miles</span>
              </div>
              <input
                id="publicTransitMiles"
                type="range"
                min="0"
                max="200"
                value={formData.publicTransitMiles}
                onChange={(e) => handleInputChange('publicTransitMiles', parseInt(e.target.value) || 0)}
                className="accent-primary h-2 rounded-lg cursor-pointer bg-hairline-strong"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="flightHours" className="text-sm font-medium text-slate">Annual Air Travel (Flight Hours)</label>
              <input
                id="flightHours"
                type="number"
                min="0"
                max="200"
                value={formData.flightHours}
                onChange={(e) => handleInputChange('flightHours', parseInt(e.target.value) || 0)}
                placeholder="Hours flown last year"
              />
            </div>
          </div>
        )}

        {/* Step 2: Home Energy */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-ink">Home Energy Usage</h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="electricBill" className="text-sm font-medium text-slate">Monthly Electric Bill ($)</label>
              <input
                id="electricBill"
                type="number"
                min="0"
                max="1000"
                value={formData.electricBill}
                onChange={(e) => handleInputChange('electricBill', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <label htmlFor="acHours" className="font-medium text-slate">Average Daily Air Conditioning Usage</label>
                <span className="font-bold">{formData.acHours} hours</span>
              </div>
              <input
                id="acHours"
                type="range"
                min="0"
                max="24"
                value={formData.acHours}
                onChange={(e) => handleInputChange('acHours', parseInt(e.target.value) || 0)}
                className="accent-primary h-2 rounded-lg cursor-pointer bg-hairline-strong"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="appliancesRate" className="text-sm font-medium text-slate">Appliance Energy Rating</label>
              <select
                id="appliancesRate"
                value={formData.appliancesRate}
                onChange={(e) => handleInputChange('appliancesRate', e.target.value)}
              >
                <option value="eco">Energy Star / Eco-efficient appliances</option>
                <option value="standard">Standard consumer appliances</option>
                <option value="heavy">Older/high-energy appliances</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 3: Food & Diet */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-ink">Diet & Food Sourcing</h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="dietType" className="text-sm font-medium text-slate">Primary Dietary Habits</label>
              <select
                id="dietType"
                value={formData.dietType}
                onChange={(e) => handleInputChange('dietType', e.target.value)}
              >
                <option value="vegetarian">Vegetarian / Vegan Diet</option>
                <option value="mixed">Mixed Diet (Balanced meat, dairy & plants)</option>
                <option value="nonVeg">Meat-Heavy Diet</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-sm">
                <label htmlFor="organicRatio" className="font-medium text-slate">Organic or Locally Sourced Food</label>
                <span className="font-bold">{formData.organicRatio}%</span>
              </div>
              <input
                id="organicRatio"
                type="range"
                min="0"
                max="100"
                value={formData.organicRatio}
                onChange={(e) => handleInputChange('organicRatio', parseInt(e.target.value) || 0)}
                className="accent-primary h-2 rounded-lg cursor-pointer bg-hairline-strong"
              />
            </div>
          </div>
        )}

        {/* Step 4: Shopping & Consumption */}
        {step === 4 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-ink">Shopping & Consumption</h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="clothingSpend" className="text-sm font-medium text-slate">Monthly Clothing & Fashion Budget ($)</label>
              <input
                id="clothingSpend"
                type="number"
                min="0"
                max="2000"
                value={formData.clothingSpend}
                onChange={(e) => handleInputChange('clothingSpend', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="electronicsSpend" className="text-sm font-medium text-slate">Monthly Electronics Budget ($)</label>
              <input
                id="electronicsSpend"
                type="number"
                min="0"
                max="2000"
                value={formData.electronicsSpend}
                onChange={(e) => handleInputChange('electronicsSpend', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="consumerGoodsSpend" className="text-sm font-medium text-slate">Monthly General Consumer Goods ($)</label>
              <input
                id="consumerGoodsSpend"
                type="number"
                min="0"
                max="2000"
                value={formData.consumerGoodsSpend}
                onChange={(e) => handleInputChange('consumerGoodsSpend', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        )}

        {/* Step 5: Waste Management */}
        {step === 5 && (
          <div className="flex flex-col gap-5">
            <h3 className="text-lg font-semibold text-ink">Waste & Recycling</h3>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="recyclingHabit" className="text-sm font-medium text-slate">Recycling Consistency</label>
              <select
                id="recyclingHabit"
                value={formData.recyclingHabit}
                onChange={(e) => handleInputChange('recyclingHabit', e.target.value)}
              >
                <option value="full">Consistent recycling of paper, plastic & metal</option>
                <option value="partial">Occasionally recycle some waste</option>
                <option value="none">No recycling habits</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="plasticUsage" className="text-sm font-medium text-slate">Single-Use Plastics Usage</label>
              <select
                id="plasticUsage"
                value={formData.plasticUsage}
                onChange={(e) => handleInputChange('plasticUsage', e.target.value)}
              >
                <option value="low">Low (Prefer reusables, minimize packaging)</option>
                <option value="moderate">Moderate (Use plastic packaging occasionally)</option>
                <option value="high">High (Rely heavily on single-use items)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 mt-2 bg-canvas p-4 border border-beige-deep rounded-md">
              <input
                id="wasteSegregation"
                type="checkbox"
                checked={formData.wasteSegregation}
                onChange={(e) => handleInputChange('wasteSegregation', e.target.checked)}
                className="size-5 accent-primary cursor-pointer border border-hairline-strong rounded"
              />
              <label htmlFor="wasteSegregation" className="text-sm font-medium text-ink cursor-pointer">
                I segregate organic waste from other garbage.
              </label>
            </div>
          </div>
        )}

        {/* Form Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-4 border-t border-hairline-soft pt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="rounded-md border border-hairline-strong bg-canvas text-ink px-5 py-2.5 font-medium hover:bg-surface transition-colors"
            >
              Previous
            </button>
          ) : (
            <div></div> // Spacer
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="rounded-md bg-ink text-on-dark px-6 py-2.5 font-semibold hover:bg-ink-tint transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              className="rounded-md bg-primary text-on-primary px-6 py-2.5 font-semibold hover:bg-primary-deep active:bg-primary-deep transition-colors"
            >
              Calculate Emissions
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
