import { useState, useEffect } from 'react';
import { fetchLeaderboard, getFactionStats } from '../../firebase/playerService';

/**
 * DashboardScreen - Big screen display for booth organizers
 *
 * Features:
 * - Full-screen optimized layout
 * - Large fonts (visible from distance)
 * - Auto-refresh every 20 seconds
 * - Top 50 leaderboard
 * - Faction War progress bar
 * - No user input controls - display only
 */
function DashboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [factionStats, setFactionStats] = useState({ lcs: 50, vct: 50, total: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Fetch data function
  const fetchData = async () => {
    try {
      const [leaderboardData, statsData] = await Promise.all([
        fetchLeaderboard(),
        getFactionStats()
      ]);
      setLeaders(leaderboardData);
      setFactionStats(statsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Set page title
  useEffect(() => {
    document.title = 'Rush2C9 - Live Dashboard';
  }, []);

  // Initial fetch and auto-refresh every 20 seconds
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 20000); // 20 seconds

    return () => clearInterval(interval);
  }, []);

  // Split leaderboard into two columns
  const leftColumn = leaders.slice(0, 25);
  const rightColumn = leaders.slice(25, 50);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-2">
          <span className="text-blue-400">🏎️</span> RUSH 2 C9 <span className="text-red-400">🏎️</span>
        </h1>
        <p className="text-2xl text-gray-400">Race to support Cloud9!</p>
      </div>

      {/* Faction War - Large Display */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <h2 className="text-3xl font-bold text-center mb-4">⚔️ Faction War ⚔️</h2>

          {/* Large Progress Bar */}
          <div className="relative h-16 bg-gray-700 rounded-full overflow-hidden mb-4">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-1000"
              style={{ width: `${factionStats.lcs}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-500 transition-all duration-1000"
              style={{ width: `${factionStats.vct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-3xl drop-shadow-lg">
                {factionStats.lcs}% vs {factionStats.vct}%
              </span>
            </div>
          </div>

          {/* Faction Labels */}
          <div className="flex justify-between items-center px-4">
            <div className="text-center">
              <div className="text-5xl mb-2">🎮</div>
              <div className="text-2xl font-bold text-blue-400">LCS</div>
              <div className="text-lg text-gray-400">League of Legends</div>
            </div>
            <div className="text-center">
              <div className="text-4xl text-gray-500">VS</div>
              <div className="text-lg text-gray-500 mt-2">
                {factionStats.total} Total Races
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-2">🎯</div>
              <div className="text-2xl font-bold text-red-400">VCT</div>
              <div className="text-lg text-gray-400">VALORANT</div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Title */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold">🏆 Top Racers 🏆</h2>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 animate-bounce">🏎️</div>
          <p className="text-2xl text-gray-400">Loading leaderboard...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && leaders.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏁</div>
          <p className="text-2xl text-gray-400">No scores yet - be the first to race!</p>
        </div>
      )}

      {/* Two Column Leaderboard */}
      {!loading && leaders.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8">
          {/* Left Column (1-25) */}
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="space-y-2">
              {leftColumn.map((player) => (
                <div
                  key={player.playerId || player.rank}
                  className={`flex items-center justify-between rounded-lg p-3 ${
                    player.rank <= 3
                      ? 'bg-yellow-600/20 border border-yellow-500/50'
                      : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-10 text-xl font-bold ${
                      player.rank === 1 ? 'text-yellow-400' :
                      player.rank === 2 ? 'text-gray-300' :
                      player.rank === 3 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </span>
                    <span className="font-semibold text-lg truncate max-w-[200px]">
                      {player.playerName}
                    </span>
                    <span className="text-xl">
                      {player.lastDestination === 'lcs' ? '🎮' : '🎯'}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold text-xl">{player.totalScore}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (26-50) */}
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="space-y-2">
              {rightColumn.map((player) => (
                <div
                  key={player.playerId || player.rank}
                  className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-10 text-xl font-bold text-gray-500">
                      #{player.rank}
                    </span>
                    <span className="font-semibold text-lg truncate max-w-[200px]">
                      {player.playerName}
                    </span>
                    <span className="text-xl">
                      {player.lastDestination === 'lcs' ? '🎮' : '🎯'}
                    </span>
                  </div>
                  <span className="text-yellow-400 font-bold text-xl">{player.totalScore}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer - Last Updated */}
      <div className="text-center mt-8 text-gray-500">
        <p>Auto-refreshes every 20 seconds</p>
        <p className="text-sm">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      </div>

      {/* URL hint for players */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800/80 px-6 py-3 rounded-full">
        <p className="text-xl font-semibold text-cyan-400">
          🎮 Play at: rush2c9.vercel.app
        </p>
      </div>
    </div>
  );
}

export default DashboardScreen;
