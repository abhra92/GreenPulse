import React, { useState, useEffect } from 'react';

// National averages in kg CO2/year for benchmark comparison
const BENCHMARKS = {
  transport: 4800,
  energy: 4200,
  food: 2500,
  shopping: 3000,
  waste: 500,
};

export default function Dashboard() {
  const [results, setResults] = useState(null);
  const [streak, setStreak] = useState(3);
  const [level, setLevel] = useState('Eco Explorer');
  const [xp, setXp] = useState(420);

  useEffect(() => {
    const data = localStorage.getItem('greeplus_footprint');
    if (data) {
      setResults(JSON.parse(data));
    }
    const storedStreak = localStorage.getItem('greeplus_streak');
    if (storedStreak) setStreak(parseInt(storedStreak) || 0);
    
    const storedLevel = localStorage.getItem('greeplus_level');
    if (storedLevel) setLevel(storedLevel);
    
    const storedXp = localStorage.getItem('greeplus_xp');
    if (storedXp) setXp(parseInt(storedXp) || 0);
  }, []);

  // If no assessment has been taken yet
  if (!results) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border border-beige-deep bg-cream p-12 text-center flex flex-col items-center gap-6">
        <div class="size-16 rounded-md bg-canvas border border-beige-deep flex items-center justify-center text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-8"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="font-display text-3xl font-normal text-ink">No footprint assessment found</h2>
        <p className="text-slate max-w-md">
          To see your carbon score, monthly analytics, and personalized AI tips, please take our short 5-minute carbon footprint assessment first.
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

  const { score, totalCO2, breakdown } = results;

  // Level thresholds (each level takes 1000 XP)
  const xpPercentage = (xp % 1000) / 10; // e.g. 420 => 42%

  // Category label mapping
  const categoryLabels = {
    transport: 'Transportation',
    energy: 'Home Energy',
    food: 'Food & Lifestyle',
    shopping: 'Shopping & Spend',
    waste: 'Waste & Recycling',
  };

  // Badges lists
  const badges = [
    { id: 'streak-7', name: '7-Day Streak', icon: '🔥', desc: 'Maintained eco habits for 7 consecutive days', unlocked: streak >= 7 },
    { id: 'tree-planter', name: 'Tree Planter', icon: '🌳', desc: 'Reduced footprint by equivalent of 1 tree', unlocked: true },
    { id: 'plastic-free', name: 'Plastic-Free Week', icon: '🥤', desc: 'Selected low plastic usage in waste parameters', unlocked: results.formData.plasticUsage === 'low' },
    { id: 'eco-champion', name: 'Eco Warrior', icon: '🛡️', desc: 'Achieved a carbon score above 80', unlocked: score >= 80 },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Top Overview Row: Score, Total & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Score Circular Gauge Card */}
        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 flex flex-col items-center justify-center text-center shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate mb-4">Carbon Score</h3>
          
          <div className="relative size-40 flex items-center justify-center">
            {/* SVG circular gauge */}
            <svg className="size-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#ededed"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#fa520f"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray="439.8"
                strokeDashoffset={439.8 - (439.8 * score) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-display font-bold text-ink">{score}</span>
              <span className="text-xs font-semibold text-slate uppercase">Points</span>
            </div>
          </div>
          
          <p className="text-xs text-slate mt-4 max-w-[200px]">
            {score >= 80 && 'Excellent! You are well below average emissions.'}
            {score >= 60 && score < 80 && 'Good. Small changes can boost your score further.'}
            {score < 60 && 'Room for improvement. Check simulator and coach for ideas.'}
          </p>
        </div>

        {/* Emissions Summary Card */}
        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate mb-2">Annual Carbon Footprint</h3>
            <div className="text-5xl font-display font-semibold text-ink flex items-baseline gap-2">
              {(totalCO2 / 1000).toFixed(1)} <span className="text-xl font-sans font-normal text-slate">Tons CO₂e</span>
            </div>
            <p className="text-sm text-slate mt-2">
              Your estimated annual emissions are <span className="font-semibold text-ink">{totalCO2.toLocaleString()} kg</span> of carbon dioxide equivalent.
            </p>
          </div>
          
          <div className="border-t border-hairline-soft pt-4 mt-6">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate">vs National Average (16.0 Tons)</span>
              <span className={`font-semibold ${totalCO2 < 16000 ? 'text-green-600' : 'text-red-500'}`}>
                {totalCO2 < 16000 
                  ? `${Math.round(((16000 - totalCO2) / 16000) * 100)}% lower`
                  : `${Math.round(((totalCO2 - 16000) / 16000) * 100)}% higher`}
              </span>
            </div>
            <div className="h-2 w-full bg-hairline-soft rounded-full overflow-hidden mt-2">
              <div 
                className={`h-full rounded-full ${totalCO2 < 16000 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (totalCO2 / 20000) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Gamification Level & Streak Card */}
        <div className="rounded-lg border border-beige-deep bg-cream p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-stone mb-1">Eco Level</h3>
                <h4 className="text-2xl font-sans font-bold text-ink">{level}</h4>
              </div>
              <div className="flex items-center gap-1.5 bg-canvas px-3 py-1 rounded-full border border-beige-deep">
                <span className="text-lg">🔥</span>
                <span className="text-sm font-bold text-primary">{streak} Day Streak</span>
              </div>
            </div>

            {/* XP Progress */}
            <div className="flex flex-col gap-1.5 mt-6">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate">Experience Points</span>
                <span className="text-ink font-bold">{xp} / {Math.ceil(xp / 1000) * 1000} XP</span>
              </div>
              <div className="h-2.5 w-full bg-canvas rounded-full border border-beige-deep overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${xpPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 mt-6 border-t border-beige-deep pt-4">
            <span class="text-xs text-slate font-medium">Next Milestone:</span>
            <span class="text-xs text-ink font-semibold">Eco Warrior at 1000 XP</span>
          </div>
        </div>

      </div>

      {/* Categories & Benchmarks Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Breakdown Chart (SVG Bar Chart) */}
        <div className="lg:col-span-2 rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col">
          <div className="flex justify-between items-center border-b border-hairline-soft pb-4 mb-6">
            <h3 className="font-sans text-lg font-semibold text-ink">Category Footprint Comparison</h3>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate">kg CO₂e per Year</span>
          </div>

          <div className="flex flex-col gap-6">
            {Object.keys(breakdown).map((category) => {
              const userVal = breakdown[category];
              const avgVal = BENCHMARKS[category];
              const maxVal = Math.max(...Object.values(breakdown), ...Object.values(BENCHMARKS));
              
              const userPct = (userVal / maxVal) * 100;
              const avgPct = (avgVal / maxVal) * 100;

              return (
                <div key={category} className="flex flex-col gap-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-ink">{categoryLabels[category]}</span>
                    <div className="flex gap-4">
                      <span className="text-primary">You: {userVal.toLocaleString()} kg</span>
                      <span className="text-slate">Avg: {avgVal.toLocaleString()} kg</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    {/* User Bar */}
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-primary rounded-full transition-all duration-500" style={{ width: `${userPct}%` }}></div>
                      <span className="text-[10px] text-primary font-bold">You</span>
                    </div>
                    {/* Benchmark Bar */}
                    <div className="flex items-center gap-2">
                      <div className="h-3 bg-stone rounded-full transition-all duration-500 opacity-60" style={{ width: `${avgPct}%` }}></div>
                      <span className="text-[10px] text-slate">Average</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center gap-6 mt-6 border-t border-hairline-soft pt-4 text-xs font-medium text-slate">
            <div className="flex items-center gap-1.5">
              <span className="size-3 bg-primary rounded-sm"></span>
              Your Footprint
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-3 bg-stone opacity-60 rounded-sm"></span>
              National average
            </div>
          </div>
        </div>

        {/* Achievement Badges Card */}
        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-lg font-semibold text-ink border-b border-hairline-soft pb-4 mb-4">
              Sustainability Badges
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              {badges.map((badge) => (
                <div 
                  key={badge.id}
                  className={`border rounded-lg p-3 text-center flex flex-col items-center justify-center gap-2 transition-all ${
                    badge.unlocked 
                      ? 'border-beige-deep bg-cream-light opacity-100' 
                      : 'border-hairline bg-surface opacity-45'
                  }`}
                  title={badge.desc}
                >
                  <span className="text-3xl">{badge.icon}</span>
                  <span className="text-xs font-semibold text-ink line-clamp-1">{badge.name}</span>
                  <span className="text-[10px] text-slate line-clamp-2 leading-tight">{badge.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-hairline-soft text-center">
            <a 
              href="/challenges" 
              className="text-xs font-semibold text-primary hover:underline flex items-center justify-center gap-1"
            >
              Complete eco challenges to earn more
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="size-3"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>

      </div>

      {/* Quick Action CTA */}
      <div className="rounded-lg bg-cream border border-beige-deep p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div>
          <h4 className="font-sans text-lg font-semibold text-ink">Ready to reduce your emissions?</h4>
          <p className="text-sm text-slate mt-1">
            Access your personalized Gemini recommendations or test lifestyle change models on our simulator.
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="/coach"
            className="rounded-md bg-ink text-on-dark px-5 py-2.5 text-sm font-semibold hover:bg-ink-tint transition-colors"
          >
            AI Coach
          </a>
          <a
            href="/simulator"
            className="rounded-md bg-primary text-on-primary px-5 py-2.5 text-sm font-semibold hover:bg-primary-deep transition-colors"
          >
            Impact Simulator
          </a>
        </div>
      </div>
    </div>
  );
}
