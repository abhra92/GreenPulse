import React, { useState } from 'react';

// Emission factors in kg CO2 per mile (approximations)
const EMISSION_FACTORS = {
  gasCar: 0.404,     // Average gasoline passenger car
  electricCar: 0.110, // Electric car (grid-average)
  bus: 0.140,        // Average transit bus per passenger
  train: 0.058,      // Average passenger train per passenger
  bicycle: 0,        // Walk/Bicycle
};

const TRANSPORT_NAMES = {
  gasCar: 'Gasoline Car',
  electricCar: 'Electric Vehicle (EV)',
  bus: 'Public Transit Bus',
  train: 'Transit Train',
  bicycle: 'Bicycle / Walking',
};

export default function QuickCheck() {
  const [distance, setDistance] = useState(50); // Weekly distance in miles
  const [transport, setTransport] = useState('gasCar');

  const calculateEmissions = (mode, dist) => {
    return (dist * EMISSION_FACTORS[mode]).toFixed(1);
  };

  const currentEmissions = calculateEmissions(transport, distance);
  const gasCarEquivalent = calculateEmissions('gasCar', distance);
  const savings = (parseFloat(gasCarEquivalent) - parseFloat(currentEmissions)).toFixed(1);

  return (
    <div className="rounded-lg border border-beige-deep bg-canvas p-6 shadow-sm md:p-8 flex flex-col gap-6">
      <h3 className="font-sans text-xl font-semibold text-ink border-b border-hairline-soft pb-3">
        Weekly Commute Estimator
      </h3>
      
      <div className="flex flex-col gap-4">
        {/* Transport Type Selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quick-transport" class="text-sm font-medium text-slate">
            Primary Mode of Transport
          </label>
          <select
            id="quick-transport"
            value={transport}
            onChange={(e) => setTransport(e.target.value)}
            className="w-full"
          >
            <option value="gasCar">Gasoline Car (Standard)</option>
            <option value="electricCar">Electric Vehicle (EV)</option>
            <option value="bus">Public Transit Bus</option>
            <option value="train">Transit Train</option>
            <option value="bicycle">Bicycle / Walking</option>
          </select>
        </div>

        {/* Weekly Distance Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="quick-distance" className="font-medium text-slate">
              Weekly Commute Distance
            </label>
            <span className="font-bold text-ink">{distance} miles</span>
          </div>
          <input
            id="quick-distance"
            type="range"
            min="0"
            max="300"
            value={distance}
            onChange={(e) => setDistance(parseInt(e.target.value) || 0)}
            className="w-full h-2 bg-hairline-strong rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>
      </div>

      {/* Results Display */}
      <div className="bg-cream-light border border-beige-deep rounded-md p-4 flex flex-col md:flex-row justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate">
            Weekly Carbon Footprint
          </span>
          <div className="text-4xl font-display font-semibold text-ink mt-1 flex items-baseline gap-1">
            {currentEmissions} <span class="text-base font-sans font-normal text-slate">kg CO₂</span>
          </div>
        </div>

        {parseFloat(savings) > 0 && (
          <div className="md:text-right">
            <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
              Savings vs Gas Car
            </span>
            <div className="text-4xl font-display font-semibold text-green-600 mt-1 flex items-baseline gap-1 md:justify-end">
              -{savings} <span class="text-base font-sans font-normal text-green-700">kg CO₂</span>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Graph */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone">
          Comparison Across Modes
        </h4>
        <div className="flex flex-col gap-2.5">
          {Object.keys(EMISSION_FACTORS).map((mode) => {
            const val = parseFloat(calculateEmissions(mode, distance));
            const isSelected = mode === transport;
            // Calculate percentage relative to gasCar
            const maxVal = parseFloat(gasCarEquivalent) || 1;
            const widthPct = Math.min(100, Math.max(4, (val / maxVal) * 100));

            return (
              <div key={mode} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className={isSelected ? 'text-primary font-bold' : 'text-slate'}>
                    {TRANSPORT_NAMES[mode]} {isSelected && '(Selected)'}
                  </span>
                  <span className="text-ink">{val} kg CO₂</span>
                </div>
                <div className="h-3 w-full bg-hairline-soft rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isSelected 
                        ? 'bg-primary' 
                        : mode === 'bicycle' 
                          ? 'bg-green-500' 
                          : 'bg-stone'
                    }`}
                    style={{ width: `${widthPct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
