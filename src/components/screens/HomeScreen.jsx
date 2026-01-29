import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS } from '../../data/gameData';
import { getPlayer, logoutPlayer, deletePlayer } from '../../services/playerService';

function HomeScreen() {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get player data from localStorage
  const player = getPlayer();
  const playerName = player ? `${player.firstName} ${player.lastName}` : 'Traveler';
  const playerScore = player ? player.score : 0;

  const handleSwitchAccount = () => {
    logoutPlayer();  // Just logout, keeps account data
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    deletePlayer();  // Permanently delete account
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Player Info */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-gray-400 text-sm">Welcome back,</p>
            <h2 className="text-xl font-bold">{playerName}</h2>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Score</p>
            <p className="text-2xl font-bold text-yellow-400">🏆 {playerScore}</p>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          {/* Play - Destination Selection */}
          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-5 border border-blue-700">
            <h3 className="text-lg font-semibold mb-4 text-center text-blue-200">🏁 Start Your Journey</h3>
            <div className="grid grid-cols-2 gap-3">
              {DESTINATIONS.map((dest, index) => (
                <button
                  key={dest.id}
                  onClick={() => navigate(`/game?destination=${dest.id}`)}
                  className={`relative overflow-hidden rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 shadow-lg ${
                    dest.id === 'lcs'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 border-2 border-blue-400'
                      : 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 border-2 border-red-400'
                  }`}
                >
                  <div className="text-4xl mb-2 drop-shadow-lg">
                    {dest.id === 'lcs' ? '🎮' : '🎯'}
                  </div>
                  <div className="font-bold text-white">{dest.name}</div>
                  <div className="text-xs text-white/70">{dest.game}</div>
                  <div className="text-xs text-white/60 mt-1">{dest.location}</div>
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 shimmer-effect"></div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>

            {/* Shimmer Animation Styles */}
            <style>{`
              @keyframes shimmer {
                0% {
                  transform: translateX(-100%);
                }
                50%, 100% {
                  transform: translateX(100%);
                }
              }
              .shimmer-effect {
                background: linear-gradient(
                  90deg,
                  transparent 0%,
                  rgba(255, 255, 255, 0.4) 50%,
                  transparent 100%
                );
                animation: shimmer 4s ease-in-out infinite;
              }
            `}</style>
            <p className="text-center text-xs text-gray-400 mt-3">Tap a destination to race!</p>
          </div>

          {/* Duel Button */}
          <button
            onClick={() => navigate('/duel')}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-semibold text-lg hover:from-orange-500 hover:to-red-500 transition-all flex items-center justify-center gap-2"
          >
            ⚔️ Challenge a Player
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => navigate('/leaderboard')}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2"
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Faction War Preview */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-3 text-center">Faction War</h4>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-2xl">🎮</div>
              <div className="text-sm font-semibold">LCS</div>
              <div className="text-lg text-blue-400">52%</div>
            </div>
            <div className="text-2xl text-gray-600">VS</div>
            <div className="text-center">
              <div className="text-2xl">🎯</div>
              <div className="text-sm font-semibold">VCT</div>
              <div className="text-lg text-red-400">48%</div>
            </div>
          </div>
        </div>

        {/* Switch Account / Delete Account */}
        <div className="mt-8 text-center space-y-2">
          {!showDeleteConfirm ? (
            <>
              <button
                onClick={handleSwitchAccount}
                className="text-gray-500 text-sm hover:text-gray-400 block mx-auto"
              >
                Switch account
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500/50 text-xs hover:text-red-400"
              >
                Delete account
              </button>
            </>
          ) : (
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Delete your account? This cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
