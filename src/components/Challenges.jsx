import React, { useState, useEffect } from 'react';
import { Bike, GlassWater, ShoppingBag, Plug, Sprout, Flame } from 'lucide-react';

const CHALLENGES_LIST = [
  { id: 'cycle', title: 'Walk or cycle to college / work', xp: 50, icon: Bike, desc: 'Avoid vehicular emissions by walking, running, or cycling for your daily commute.' },
  { id: 'bottle', title: 'Use a reusable water bottle', xp: 20, icon: GlassWater, desc: 'Avoid buying single-use bottled beverages today.' },
  { id: 'plastics', title: 'Zero single-use plastics', xp: 40, icon: ShoppingBag, desc: 'Say no to plastic bags, straws, and food containers. Use canvas bags.' },
  { id: 'electricity', title: 'Power down standby devices', xp: 30, icon: Plug, desc: 'Unplug power strips, phone chargers, and desktop screens before heading out.' },
  { id: 'tree', title: 'Care for campus greens / plant', xp: 100, icon: Sprout, desc: 'Plant a seed, water trees, or participate in clean-up actions around your campus.' },
];

export default function Challenges() {
  const [completed, setCompleted] = useState([]);
  const [xp, setXp] = useState(420);
  const [level, setLevel] = useState('Eco Explorer');
  const [streak, setStreak] = useState(3);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    // Load gamification state
    const storedXp = localStorage.getItem('greeplus_xp');
    if (storedXp) setXp(parseInt(storedXp) || 0);

    const storedLevel = localStorage.getItem('greeplus_level');
    if (storedLevel) setLevel(storedLevel);

    const storedStreak = localStorage.getItem('greeplus_streak');
    if (storedStreak) setStreak(parseInt(storedStreak) || 0);

    const storedCompleted = localStorage.getItem('greeplus_completed_today');
    if (storedCompleted) setCompleted(JSON.parse(storedCompleted));
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleChallenge = (id, points) => {
    let newCompleted;
    let xpChange = 0;

    if (completed.includes(id)) {
      newCompleted = completed.filter((cId) => cId !== id);
      xpChange = -points;
      triggerToast(`Removed challenge! -${points} XP`);
    } else {
      newCompleted = [...completed, id];
      xpChange = points;
      triggerToast(`Challenge Completed! +${points} XP`);
    }

    setCompleted(newCompleted);
    localStorage.setItem('greeplus_completed_today', JSON.stringify(newCompleted));

    // Calculate new XP
    const newXp = Math.max(0, xp + xpChange);
    setXp(newXp);
    localStorage.setItem('greeplus_xp', newXp.toString());

    // Evaluate levels
    let newLevel = 'Eco Beginner';
    if (newXp >= 2000) newLevel = 'Eco Champion';
    else if (newXp >= 1000) newLevel = 'Eco Warrior';
    else if (newXp >= 300) newLevel = 'Eco Explorer';

    if (newLevel !== level) {
      setLevel(newLevel);
      localStorage.setItem('greeplus_level', newLevel);
      triggerToast(`Level Up! You are now an ${newLevel}!`);
    }

    // Update streak if completing first challenge of the day
    if (newCompleted.length === 1 && completed.length === 0) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('greeplus_streak', newStreak.toString());
    } else if (newCompleted.length === 0 && completed.length === 1) {
      const newStreak = Math.max(0, streak - 1);
      setStreak(newStreak);
      localStorage.setItem('greeplus_streak', newStreak.toString());
    }
  };

  const xpPercentage = (xp % 1000) / 10;
  const currentThreshold = Math.floor(xp / 1000) * 1000;
  const nextThreshold = currentThreshold + 1000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Left Column: Challenges List */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 rounded-md bg-ink text-on-dark px-4 py-3 shadow-lg border border-white/10 text-sm font-semibold transition-all animate-bounce">
            {toastMsg}
          </div>
        )}

        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-sans text-xl font-semibold text-ink border-b border-hairline-soft pb-3">
            Active Eco Challenges
          </h3>
          
          <div className="flex flex-col gap-4">
            {CHALLENGES_LIST.map((ch) => {
              const isDone = completed.includes(ch.id);
              const IconComponent = ch.icon;
              return (
                <div 
                  key={ch.id}
                  className={`border rounded-lg p-5 flex items-start gap-4 transition-all ${
                    isDone 
                      ? 'border-beige-deep bg-cream-light' 
                      : 'border-hairline-soft bg-canvas'
                  }`}
                >
                  {/* Interactive Check Circle */}
                  <button
                    onClick={() => toggleChallenge(ch.id, ch.xp)}
                    className={`size-7 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isDone 
                        ? 'bg-primary border-primary text-on-primary' 
                        : 'border-hairline-strong bg-canvas hover:border-primary text-transparent'
                    }`}
                    aria-label={`Mark "${ch.title}" as complete`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor" className="size-4"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                  </button>

                  <div className="flex-grow">
                    <div className="flex justify-between items-start">
                      <h4 className={`text-base font-semibold flex items-center gap-2 ${isDone ? 'line-through text-slate' : 'text-ink'}`}>
                        <IconComponent className={`size-5 ${isDone ? 'text-stone' : 'text-primary'}`} />
                        {ch.title}
                      </h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isDone ? 'bg-stone/20 text-slate' : 'bg-primary/15 text-primary'
                      }`}>
                        +{ch.xp} XP
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'text-stone' : 'text-slate'}`}>
                      {ch.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Column: Status Card */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Gamification Details */}
        <div className="rounded-lg border border-beige-deep bg-cream p-6 shadow-sm">
          <h3 className="font-sans text-lg font-semibold text-ink border-b border-beige-deep pb-3 mb-4">
            Gamification Status
          </h3>

          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate">Current Rank</span>
              <div className="text-2xl font-sans font-bold text-ink">{level}</div>
            </div>
            <div className="flex items-center gap-1.5 bg-canvas border border-beige-deep px-3 py-1 rounded-full text-xs font-bold text-primary">
              <Flame className="size-4" /> {streak} Day Streak
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate">Progress to next rank</span>
              <span className="text-ink font-bold">{xp} / {nextThreshold} XP</span>
            </div>
            <div className="h-3 w-full bg-canvas border border-beige-deep rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${xpPercentage}%` }}
              ></div>
            </div>
          </div>

          <p className="text-[11px] text-slate mt-4 leading-relaxed">
            Unlocking ranks gives you badges on your dashboard and raises your standing on the College rankings leaderboard.
          </p>
        </div>

        {/* Quote / Information Panel */}
        <div className="rounded-lg border border-hairline-soft bg-canvas p-6 shadow-sm flex flex-col gap-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone border-b border-hairline-soft pb-2">
            Why Challenges Matter
          </h4>
          <p className="text-xs text-slate leading-relaxed">
            Eco challenges reward minor, daily lifestyle choices. When thousands of people perform these tiny actions together, the aggregated reduction produces massive global benefits.
          </p>
          <div className="rounded bg-surface p-3 border border-hairline-soft">
            <span className="text-xs font-bold text-ink block">Did you know?</span>
            <span className="text-[11px] text-slate mt-1 block">
              Replacing 1 single-use plastic bottle daily saves roughly 17.5 kg of CO₂ and keeps 365 bottles out of ocean waste streams annually.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
