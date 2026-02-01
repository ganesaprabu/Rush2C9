import { useState, useEffect } from 'react';
import { fetchLeaderboard, getFactionStats } from '../../firebase/playerService';

/**
 * DashboardScreen - Big screen display for booth organizers
 *
 * Features:
 * - Full-screen optimized layout (no scrolling)
 * - Top 10 leaderboard on left
 * - QR code for easy game access on right
 * - Faction War progress bar
 * - Auto-refresh every 20 seconds
 */

// QR Code URL (using free QR Server API) - larger size for booth display
const QR_CODE_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://rush2c9.vercel.app';
const GAME_URL = 'rush2c9.vercel.app';

function DashboardScreen() {
  const [leaders, setLeaders] = useState([]);
  const [factionStats, setFactionStats] = useState({ lcs: 50, vct: 50, totalRaces: 0, totalPlayers: 0 });
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

  // Initial fetch and auto-refresh every 2 seconds (for video recording)
  useEffect(() => {
    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 2000); // 2 seconds (temporary for video)

    return () => clearInterval(interval);
  }, []);

  // Only show top 10 for dashboard
  const topTen = leaders.slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-4">
      {/* Header - Compact */}
      <div className="text-center mb-3">
        <h1 className="text-4xl font-bold">
          <span className="text-blue-400 inline-block animate-shake text-5xl">🏎️</span>
          {' '}RUSH 2 C9{' '}
          <span className="text-red-400 inline-block animate-shake-flip text-5xl">🏎️</span>
        </h1>
        <p className="text-lg text-gray-400">Race to support Cloud9!</p>
      </div>

      {/* Faction War - Compact Display */}
      <div className="max-w-4xl mx-auto mb-3">
        <div className="bg-gray-800/50 rounded-xl p-3">
          <h2 className="text-xl font-bold text-center mb-2">⚔️ Faction War ⚔️</h2>

          {/* Progress Bar */}
          <div className="relative h-10 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-1000"
              style={{ width: `${factionStats.lcs}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-600 to-red-500 transition-all duration-1000"
              style={{ width: `${factionStats.vct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-bold text-xl drop-shadow-lg">
                {factionStats.lcs}% vs {factionStats.vct}%
              </span>
            </div>
          </div>

          {/* Faction Labels - Inline */}
          <div className="flex justify-between items-center px-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🎮</span>
              <div>
                <div className="text-lg font-bold text-blue-400">LCS</div>
                <div className="text-xs text-gray-400">League of Legends</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-base text-gray-400">{factionStats.totalRaces} Total Races</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-lg font-bold text-red-400">VCT</div>
                <div className="text-xs text-gray-400">VALORANT</div>
              </div>
              <span className="text-3xl">🎯</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Top 10 + QR Code */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-6">

        {/* Left: Top 10 Leaderboard */}
        <div className="bg-gray-800/30 rounded-xl p-3">
          <h2 className="text-xl font-bold text-center mb-2">🏆 Top 10 Racers</h2>

          {loading && (
            <div className="text-center py-4">
              <div className="text-3xl mb-2 animate-bounce">🏎️</div>
              <p className="text-gray-400 text-sm">Loading...</p>
            </div>
          )}

          {!loading && topTen.length === 0 && (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🏁</div>
              <p className="text-gray-400 text-sm">No scores yet - be the first!</p>
            </div>
          )}

          {!loading && topTen.length > 0 && (
            <div className="space-y-1">
              {topTen.map((player) => (
                <div
                  key={player.playerId || player.rank}
                  className={`flex items-center justify-between rounded-lg py-2 px-3 ${
                    player.rank <= 3
                      ? 'bg-yellow-600/20 border border-yellow-500/50'
                      : 'bg-gray-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 text-lg font-bold ${
                      player.rank === 1 ? 'text-yellow-400' :
                      player.rank === 2 ? 'text-gray-300' :
                      player.rank === 3 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                    </span>
                    <span className="font-semibold text-base truncate max-w-[140px]">
                      {player.playerName}
                    </span>
                    <span className="text-lg">
                      {player.lastDestination === 'lcs' ? '🎮' : '🎯'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-bold text-base">{player.totalScore}</span>
                    <span className="text-cyan-400 text-sm">({player.playCount || 1})</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: QR Code */}
        <div className="bg-gray-800/30 rounded-xl p-4 flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-center mb-4">📱 Scan to Play!</h2>

          <div className="bg-white p-4 rounded-2xl mb-4">
            <img
              src={QR_CODE_URL}
              alt="Scan to play Rush2C9"
              className="w-72 h-72"
            />
          </div>

          <p className="text-lg text-cyan-400 font-semibold mb-1">
            {GAME_URL}
          </p>

          <p className="text-gray-400 text-sm text-center">
            Scan the QR code or visit the URL to start racing!
          </p>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Auto-refreshes every 2 seconds • Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardScreen;
