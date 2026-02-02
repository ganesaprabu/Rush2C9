import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLeaderboard, getFactionStats } from '../../firebase/playerService';

const ITEMS_PER_PAGE = 10;

function LeaderboardScreen() {
  const navigate = useNavigate();

  // State for leaderboard data
  const [allLeaders, setAllLeaders] = useState([]);
  const [factionStats, setFactionStats] = useState({ lcs: 50, vct: 50, totalRaces: 0, totalPlayers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Search and pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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

        setAllLeaders(leaderboardData);
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

  // Filter leaders based on search query
  const filteredLeaders = searchQuery
    ? allLeaders.filter(p => p.playerName.toUpperCase().includes(searchQuery.toUpperCase()))
    : allLeaders;

  // Get top 3 for podium (only when no search)
  const top3 = searchQuery ? [] : allLeaders.slice(0, 3);

  // Get rest for paginated list
  const restLeaders = searchQuery ? filteredLeaders : allLeaders.slice(3);
  const totalPages = Math.ceil(restLeaders.length / ITEMS_PER_PAGE);
  const paginatedRest = restLeaders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handle search input
  const handleSearch = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-4">
          <h1 className="text-2xl font-bold">🏆 Leaderboard</h1>
        </div>

        {/* Faction War Progress Bar */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
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
            <div className="text-gray-500 text-xs">Total Races: {factionStats.totalRaces}</div>
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
          <div className="text-center py-12 bg-gray-800/50 rounded-xl mb-4">
            <div className="text-4xl mb-4">😔</div>
            <p className="text-gray-400">Unable to load leaderboard</p>
            <p className="text-gray-500 text-sm mt-2">Play a game to see your score!</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && allLeaders.length === 0 && (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl mb-4">
            <div className="text-4xl mb-4">🏁</div>
            <p className="text-gray-400">No scores yet!</p>
            <p className="text-gray-500 text-sm mt-2">Be the first to race!</p>
          </div>
        )}

        {/* Top 3 Podium - only show when not searching */}
        {!loading && !error && top3.length >= 3 && !searchQuery && (
          <div className="flex justify-center items-end gap-3 mb-4">
            {/* 2nd place */}
            <div className="text-center">
              <div className="text-4xl mb-2">🥈</div>
              <div className="bg-gray-700 rounded-t-lg px-6 py-6 min-w-[110px]">
                <div className="font-semibold text-sm truncate max-w-[100px]">{top3[1]?.playerName}</div>
                <div className="text-yellow-400 text-lg">{top3[1]?.totalScore}</div>
                <div className="text-cyan-400 text-xs">({top3[1]?.playCount || 1} plays)</div>
                <div className="text-sm mt-1">{top3[1]?.lastDestination === 'lcs' ? '🎮' : '🎯'}</div>
              </div>
            </div>
            {/* 1st place */}
            <div className="text-center">
              <div className="text-5xl mb-2">🥇</div>
              <div className="bg-yellow-600/30 border border-yellow-500 rounded-t-lg px-8 py-8 min-w-[130px]">
                <div className="font-bold text-lg truncate max-w-[120px]">{top3[0]?.playerName}</div>
                <div className="text-yellow-400 text-2xl">{top3[0]?.totalScore}</div>
                <div className="text-cyan-400 text-xs">({top3[0]?.playCount || 1} plays)</div>
                <div className="text-sm mt-1">{top3[0]?.lastDestination === 'lcs' ? '🎮' : '🎯'}</div>
              </div>
            </div>
            {/* 3rd place */}
            <div className="text-center">
              <div className="text-4xl mb-2">🥉</div>
              <div className="bg-gray-700 rounded-t-lg px-6 py-4 min-w-[110px]">
                <div className="font-semibold text-sm truncate max-w-[100px]">{top3[2]?.playerName}</div>
                <div className="text-yellow-400 text-lg">{top3[2]?.totalScore}</div>
                <div className="text-cyan-400 text-xs">({top3[2]?.playCount || 1} plays)</div>
                <div className="text-sm mt-1">{top3[2]?.lastDestination === 'lcs' ? '🎮' : '🎯'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Top 3 for less than 3 players - only show when not searching */}
        {!loading && !error && top3.length > 0 && top3.length < 3 && !searchQuery && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-400 mb-3">Top Racers</p>
            <div className="space-y-2">
              {top3.map((player, index) => (
                <div
                  key={player.playerId || index}
                  className="flex items-center justify-between bg-yellow-600/20 border border-yellow-500/50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span className="font-semibold text-sm truncate max-w-[120px]">{player.playerName}</span>
                    <span className="text-sm">
                      {player.lastDestination === 'lcs' ? '🎮' : '🎯'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400 font-semibold">{player.totalScore}</span>
                    <span className="text-cyan-400 text-xs">({player.playCount || 1} plays)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Racers List with Search */}
        {!loading && !error && allLeaders.length > 0 && (
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            {/* Header with inline search */}
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-400">All Racers</p>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search name..."
                  className="bg-gray-700 text-white text-sm pl-3 pr-8 py-1.5 rounded-lg w-44 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Search results info */}
            {searchQuery && (
              <p className="text-xs text-gray-500 mb-2">
                {filteredLeaders.length} result{filteredLeaders.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}

            {/* No results */}
            {searchQuery && filteredLeaders.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No players found with "{searchQuery}"</p>
              </div>
            )}

            {/* Player list */}
            {paginatedRest.length > 0 && (
              <div className="space-y-2">
                {paginatedRest.map((player) => (
                  <div
                    key={player.playerId || player.rank}
                    className={`flex items-center justify-between rounded-lg p-3 ${
                      player.rank <= 3
                        ? 'bg-yellow-600/20 border border-yellow-500/50'
                        : 'bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-sm ${player.rank <= 3 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : `#${player.rank}`}
                      </span>
                      <span className="font-semibold text-sm truncate max-w-[100px]">{player.playerName}</span>
                      <span className="text-sm">
                        {player.lastDestination === 'lcs' ? '🎮' : '🎯'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-semibold">{player.totalScore}</span>
                      <span className="text-cyan-400 text-xs">({player.playCount || 1} plays)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === 1
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  ←
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-lg ${
                    currentPage === totalPages
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                  }`}
                >
                  →
                </button>
              </div>
            )}
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
