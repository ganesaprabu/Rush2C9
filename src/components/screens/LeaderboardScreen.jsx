import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboard, getFactionStats } from '../../firebase/playerService';

function LeaderboardScreen() {
  const navigate = useNavigate();

  // State for leaderboard data
  const [leaders, setLeaders] = useState([]);
  const [factionStats, setFactionStats] = useState({ lcs: 50, vct: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Set page title
  useEffect(() => {
    document.title = 'Rush2C9 - Leaderboard';
  }, []);

  // Fetch leaderboard data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(false);

      try {
        // Fetch both in parallel
        const [leaderboardData, statsData] = await Promise.all([
          fetchLeaderboard(),
          getFactionStats()
        ]);

        setLeaders(leaderboardData);
        setFactionStats(statsData);
      } catch (err) {
        console.error('Error loading leaderboard:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get top 3 for podium
  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

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
            <div className="text-gray-500 text-xs">Total Races: {factionStats.total}</div>
            <div className="text-center">
              <div className="text-xl">🎯</div>
              <div className="text-xs font-semibold text-red-400">VCT</div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4 animate-bounce">🏎️</div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl mb-6">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-gray-400">Unable to load leaderboard</p>
            <p className="text-gray-500 text-sm mt-2">Play a game to see your score!</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && leaders.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl mb-6">
            <div className="text-4xl mb-4">🏁</div>
            <p className="text-gray-400">No scores yet!</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to race!</p>
          </div>
        )}

        {/* Top 3 Podium */}
        {!loading && !error && top3.length >= 3 && (
          <div className="flex justify-center items-end gap-2 mb-6">
            {/* 2nd place */}
            <div className="text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="bg-gray-700 rounded-t-lg px-4 py-6">
                <div className="font-semibold text-sm truncate max-w-[80px]">{top3[1]?.playerName}</div>
                <div className="text-yellow-400">{top3[1]?.totalScore}</div>
                <div className="text-xs mt-1">{top3[1]?.lastDestination === 'lcs' ? '🎮' : '🎯'}</div>
              </div>
            </div>
            {/* 1st place */}
            <div className="text-center">
              <div className="text-5xl mb-2">🥇</div>
              <div className="bg-yellow-600/30 border border-yellow-500 rounded-t-lg px-6 py-8">
                <div className="font-bold truncate max-w-[100px]">{top3[0]?.playerName}</div>
                <div className="text-yellow-400 text-xl">{top3[0]?.totalScore}</div>
                <div className="text-sm mt-1">{top3[0]?.lastDestination === 'lcs' ? '🎮' : '🎯'}</div>
              </div>
            </div>
            {/* 3rd place */}
            <div className="text-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="bg-gray-700 rounded-t-lg px-4 py-4">
                <div className="font-semibold text-sm truncate max-w-[80px]">{top3[2]?.playerName}</div>
                <div className="text-yellow-400">{top3[2]?.totalScore}</div>
                <div className="text-xs mt-1">{top3[2]?.lastDestination === 'lcs' ? '🎮' : '🎯'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Full List */}
        {!loading && !error && rest.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-3">Top Racers</p>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {rest.map((player) => (
                <div
                  key={player.playerId || player.rank}
                  className="flex items-center justify-between bg-gray-800 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 w-6 text-sm">#{player.rank}</span>
                    <span className="font-semibold text-sm truncate max-w-[120px]">{player.playerName}</span>
                    <span className="text-sm">
                      {player.lastDestination === 'lcs' ? '🎮' : '🎯'}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-semibold">{player.totalScore}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
