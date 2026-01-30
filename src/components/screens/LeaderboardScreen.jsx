import { useNavigate } from 'react-router-dom';

function LeaderboardScreen() {
  const navigate = useNavigate();

  // Mock leaderboard data (will be replaced with Firebase)
  const leaders = [
    { rank: 1, name: 'Mike Johnson', score: 4230, faction: 'lcs' },
    { rank: 2, name: 'Sarah Lee', score: 3800, faction: 'vct' },
    { rank: 3, name: 'Alex Chen', score: 3650, faction: 'lcs' },
    { rank: 4, name: 'Jordan Smith', score: 3100, faction: 'vct' },
    { rank: 5, name: 'Chris Kumar', score: 2900, faction: 'lcs' },
    { rank: 6, name: 'Taylor Brown', score: 2750, faction: 'vct' },
    { rank: 7, name: 'Casey Williams', score: 2500, faction: 'lcs' },
    { rank: 8, name: 'Morgan Davis', score: 2300, faction: 'vct' },
  ];

  // Mock faction stats (will be replaced with Firebase)
  const factionStats = { lcs: 52, vct: 48 };
  const totalRaces = 47;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        </div>

        {/* Faction War Progress Bar */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <h4 className="text-sm text-gray-400 mb-3 text-center">Faction War</h4>
          <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden mb-3">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500"
              style={{ width: `${factionStats.lcs}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-500 transition-all duration-500"
              style={{ width: `${factionStats.vct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-sm drop-shadow-lg">
                {factionStats.lcs}% vs {factionStats.vct}%
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-xl">🎮</div>
              <div className="text-xs font-semibold text-blue-400">LCS</div>
            </div>
            <div className="text-gray-500 text-xs">Total Races: {totalRaces}</div>
            <div className="text-center">
              <div className="text-xl">🎯</div>
              <div className="text-xs font-semibold text-red-400">VCT</div>
            </div>
          </div>
        </div>

        {/* Top 3 Podium */}
        <div className="flex justify-center items-end gap-2 mb-6">
          {/* 2nd place */}
          <div className="text-center">
            <div className="text-4xl mb-2">🥈</div>
            <div className="bg-gray-700 rounded-t-lg px-4 py-6">
              <div className="font-semibold text-sm">{leaders[1]?.name}</div>
              <div className="text-yellow-400">{leaders[1]?.score}</div>
              <div className="text-xs mt-1">{leaders[1]?.faction === 'lcs' ? '🎮' : '🎯'}</div>
            </div>
          </div>
          {/* 1st place */}
          <div className="text-center">
            <div className="text-5xl mb-2">🥇</div>
            <div className="bg-yellow-600/30 border border-yellow-500 rounded-t-lg px-6 py-8">
              <div className="font-bold">{leaders[0]?.name}</div>
              <div className="text-yellow-400 text-xl">{leaders[0]?.score}</div>
              <div className="text-sm mt-1">{leaders[0]?.faction === 'lcs' ? '🎮' : '🎯'}</div>
            </div>
          </div>
          {/* 3rd place */}
          <div className="text-center">
            <div className="text-4xl mb-2">🥉</div>
            <div className="bg-gray-700 rounded-t-lg px-4 py-4">
              <div className="font-semibold text-sm">{leaders[2]?.name}</div>
              <div className="text-yellow-400">{leaders[2]?.score}</div>
              <div className="text-xs mt-1">{leaders[2]?.faction === 'lcs' ? '🎮' : '🎯'}</div>
            </div>
          </div>
        </div>

        {/* Full List */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-400 mb-3">Today's Top Racers</p>
          <div className="space-y-2">
            {leaders.slice(3).map((player) => (
              <div
                key={player.rank}
                className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-6 text-sm">#{player.rank}</span>
                  <span className="font-semibold text-sm">{player.name}</span>
                  <span className="text-sm">
                    {player.faction === 'lcs' ? '🎮' : '🎯'}
                  </span>
                </div>
                <span className="text-yellow-400 font-semibold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Play Again Button */}
        <button
          onClick={() => navigate('/name-entry')}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl font-bold text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-900/50 flex items-center justify-center gap-2"
        >
          🏁 Play Again
        </button>
      </div>
    </div>
  );
}

export default LeaderboardScreen;
