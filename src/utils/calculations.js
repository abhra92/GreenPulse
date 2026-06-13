/**
 * Calculates the carbon footprint based on assessment form data.
 * @param {Object} formData Input data from the assessment form
 * @returns {Object} Calculated results, score, and category breakdown
 */
export const calculateResults = (formData) => {
  // 1. Transportation
  let carFactor = 0;
  if (formData.carType === 'gas') carFactor = 0.404;
  else if (formData.carType === 'electric') carFactor = 0.110;
  const carEmissions = (formData.carMiles || 0) * 52 * carFactor;
  const transitEmissions = (formData.publicTransitMiles || 0) * 52 * 0.140;
  const flightEmissions = (formData.flightHours || 0) * 90;
  const transportTotal = carEmissions + transitEmissions + flightEmissions;

  // 2. Home Energy
  const electricEmissions = (formData.electricBill || 0) * 12 * 0.0009; // 0.9 kg CO2 per ₹ (Indian grid)
  const acEmissions = (formData.acHours || 0) * 365 * 0.5; // 0.5 kg CO2 per hour
  let applianceEmissions = 300;
  if (formData.appliancesRate === 'eco') applianceEmissions = 150;
  else if (formData.appliancesRate === 'heavy') applianceEmissions = 600;
  const energyTotal = electricEmissions + acEmissions + applianceEmissions;

  // 3. Food
  let dietBase = 2500; // mixed
  if (formData.dietType === 'vegetarian') dietBase = 1500;
  else if (formData.dietType === 'nonVeg') dietBase = 3500;
  // Organic discount
  const organicDiscount = ((formData.organicRatio || 0) / 100) * 300;
  const foodTotal = Math.max(1200, dietBase - organicDiscount);

  // 4. Shopping
  const clothingEmissions = (formData.clothingSpend || 0) * 12 * 0.4;
  const electronicsEmissions = (formData.electronicsSpend || 0) * 12 * 0.8;
  const goodsEmissions = (formData.consumerGoodsSpend || 0) * 12 * 0.3;
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

/**
 * Calculates carbon savings based on lifestyle simulation sliders.
 * @param {Object} formData The original footprint formData
 * @param {Object} simulation The simulation inputs (driveReduction, vegetarianMeals, acReduction, upgradeRecycling)
 * @returns {Object} Calculated savings and equivalent environmental metrics
 */
export const calculateSimulatorSavings = (formData, simulation) => {
  const driveReduction = simulation.driveReduction || 0;
  const vegetarianMeals = simulation.vegetarianMeals || 0;
  const acReduction = simulation.acReduction || 0;
  const upgradeRecycling = !!simulation.upgradeRecycling;

  // Calculate simulated savings (kg CO2 per year)
  let carFactor = 0;
  if (formData.carType === 'gas') carFactor = 0.251;
  else if (formData.carType === 'electric') carFactor = 0.068;
  const driveSaved = driveReduction * 52 * carFactor;

  // Replaced meat meals: savings is ~4.0kg per meal replaced
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
  const gasKmEquivalent = Math.round(totalSaved / 0.251); // average car 0.251kg/km

  return {
    driveSaved: Math.round(driveSaved),
    foodSaved: Math.round(foodSaved),
    acSaved: Math.round(acSaved),
    recycleSaved: Math.round(recycleSaved),
    totalSaved,
    monthlySaved,
    treeEquivalent,
    gasKmEquivalent,
  };
};
