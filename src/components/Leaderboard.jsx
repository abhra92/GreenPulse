import React, { useState } from 'react';

const FRIENDS_DATA = [
  { rank: 1, name: 'Sarah Jenkins', score: 94, level: 'Eco Champion', xp: 2450, isUser: false },
  { rank: 2, name: 'Alex Rivera', score: 88, level: 'Eco Champion', xp: 2100, isUser: false },
  { rank: 3, name: 'You (Abhra)', score: 78, level: 'Eco Explorer', xp: 420, isUser: true }, // will dynamically read if we have localstorage
  { rank: 4, name: 'David Kim', score: 72, level: 'Eco Explorer', xp: 680, isUser: false },
  { rank: 5, name: 'Emma Watson', score: 65, level: 'Eco Explorer', xp: 510, isUser: false },
];

const DEPARTMENTS_DATA = [
  { rank: 1, name: 'Environmental Science', avgScore: 92, participants: 48, totalReduction: '2,400 kg' },
  { rank: 2, name: 'Computer Science', avgScore: 84, participants: 124, totalReduction: '5,120 kg' },
  { rank: 3, name: 'Mechanical Engineering', avgScore: 79, participants: 92, totalReduction: '3,100 kg' },
  { rank: 4, name: 'Business Administration', avgScore: 71, participants: 110, totalReduction: '2,900 kg' },
  { rank: 5, name: 'Humanities & Arts', avgScore: 68, participants: 85, totalReduction: '1,950 kg' },
];

const COMMUNITY_CHALLENGES = [
  { id: 'comm-1', title: 'Campus Plastic-Free Drive', target: '10,000 bottles avoided', current: 7820, pct: 78, daysLeft: 4, desc: 'Avoid single-use plastic water bottles on campus. Log bottle reuse daily.' },
  { id: 'comm-2', title: 'Carbon Footprint Reduction Week', target: '50,000 kg CO₂ saved', current: 34500, pct: 69, daysLeft: 12, desc: 'Cumulative carbon reduction goal for all enrolled students this month.' },
];

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState('friends');

  // Load actual user score and XP if available
  const userResults = typeof window !== 'undefined' ? localStorage.getItem('greeplus_footprint') : null;
  const userXp = typeof window !== 'undefined' ? localStorage.getItem('greeplus_xp') : null;
  const userLevel = typeof window !== 'undefined' ? localStorage.getItem('greeplus_level') : null;

  let displayFriends = [...FRIENDS_DATA];
  if (userResults) {
    const parsed = JSON.parse(userResults);
    const xpVal = userXp ? parseInt(userXp) : 420;
    const levelVal = userLevel || 'Eco Explorer';
    
    // Update "You" entry with actual details
    displayFriends = displayFriends.map((f) => {
      if (f.isUser) {
        return {
          ...f,
          score: parsed.score,
          level: levelVal,
          xp: xpVal,
        };
      }
      return f;
    });

    // Re-sort friends by score descending
    displayFriends.sort((a, b) => b.score - a.score);
    // Re-assign ranks
    displayFriends = displayFriends.map((f, index) => ({
      ...f,
      rank: index + 1,
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      
      {/* Segmented Tab Navigation */}
      <div className="flex border-b border-hairline-soft">
        <button
          onClick={() => setActiveTab('friends')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'friends'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          Friends Rankings
        </button>
        <button
          onClick={() => setActiveTab('departments')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'departments'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          College Departments
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-all ${
            activeTab === 'community'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-slate hover:text-ink'
          }`}
        >
          Community Goals
        </button>
      </div>

      {/* Tab Contents */}
      <div className="rounded-lg border border-hairline-soft bg-canvas shadow-sm overflow-hidden">
        
        {/* Tab 1: Friends Leaderboard */}
        {activeTab === 'friends' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-hairline-soft text-xs font-semibold uppercase tracking-wider text-stone">
                  <th className="py-4 px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-6">Participant</th>
                  <th className="py-4 px-6">Eco Level</th>
                  <th className="py-4 px-6 text-center">Carbon Score</th>
                  <th className="py-4 px-6 text-right">Total XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-sm text-ink">
                {displayFriends.map((friend) => (
                  <tr 
                    key={friend.rank}
                    className={`transition-colors hover:bg-surface-cream-soft/30 ${
                      friend.isUser ? 'bg-cream-light font-medium' : ''
                    }`}
                  >
                    <td className="py-4 px-6 text-center">
                      {friend.rank === 1 && '🥇'}
                      {friend.rank === 2 && '🥈'}
                      {friend.rank === 3 && '🥉'}
                      {friend.rank > 3 && friend.rank}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span>{friend.name}</span>
                        {friend.isUser && (
                          <span className="text-[10px] font-bold bg-primary text-on-primary px-1.5 py-0.5 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate">{friend.level}</td>
                    <td className="py-4 px-6 text-center font-bold text-primary">
                      {friend.score} / 100
                    </td>
                    <td className="py-4 px-6 text-right text-stone">
                      {friend.xp.toLocaleString()} XP
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Departments Leaderboard */}
        {activeTab === 'departments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface border-b border-hairline-soft text-xs font-semibold uppercase tracking-wider text-stone">
                  <th className="py-4 px-6 w-20 text-center">Rank</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6 text-center">Avg. Carbon Score</th>
                  <th className="py-4 px-6 text-center">Enrolled Students</th>
                  <th className="py-4 px-6 text-right">Monthly CO₂ Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-sm text-ink">
                {DEPARTMENTS_DATA.map((dept) => (
                  <tr key={dept.rank} className="transition-colors hover:bg-surface-cream-soft/30">
                    <td className="py-4 px-6 text-center font-semibold text-slate">
                      #{dept.rank}
                    </td>
                    <td className="py-4 px-6 font-medium text-ink">{dept.name}</td>
                    <td className="py-4 px-6 text-center font-bold text-primary">{dept.avgScore} / 100</td>
                    <td className="py-4 px-6 text-center text-slate">{dept.participants}</td>
                    <td className="py-4 px-6 text-right text-green-600 font-semibold">{dept.totalReduction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Community Goals */}
        {activeTab === 'community' && (
          <div className="p-6 flex flex-col gap-6">
            {COMMUNITY_CHALLENGES.map((comm) => (
              <div key={comm.id} className="border border-hairline-soft rounded-lg p-5 bg-canvas flex flex-col gap-3">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <h4 className="text-base font-semibold text-ink">{comm.title}</h4>
                    <p className="text-xs text-slate mt-0.5 leading-relaxed">{comm.desc}</p>
                  </div>
                  <div className="shrink-0 bg-primary/10 border border-primary/25 rounded px-3 py-1 text-center">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary block">
                      Days Remaining
                    </span>
                    <span className="text-sm font-bold text-primary">{comm.daysLeft} Days</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate">Progress: {comm.current.toLocaleString()} / {comm.target}</span>
                    <span className="text-primary">{comm.pct}%</span>
                  </div>
                  <div className="h-3.5 w-full bg-hairline-soft rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-sunshine-500 transition-all duration-500"
                      style={{ width: `${comm.pct}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
      
    </div>
  );
}
