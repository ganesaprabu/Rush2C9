import { useNavigate } from 'react-router-dom';
import { DESTINATIONS } from '../../data/gameData';

function HomeScreen() {
  const navigate = useNavigate();

  // TODO: Get from context/localStorage
  const playerName = 'Traveler';
  const playerScore = 0;

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
          {/* Play Button */}
          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-800">
            <h3 className="text-xl font-bold mb-4">Choose Your Destination</h3>
            <div className="grid grid-cols-2 gap-4">
              {DESTINATIONS.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => navigate(`/game?destination=${dest.id}`)}
                  className="bg-gray-800 hover:bg-gray-700 rounded-lg p-4 text-center transition-all hover:scale-105"
                >
                  <div className="text-3xl mb-2">
                    {dest.id === 'lcs' ? '🎮' : '🎯'}
                  </div>
                  <div className="font-semibold">{dest.name}</div>
                  <div className="text-xs text-gray-400">{dest.game}</div>
                </button>
              ))}
            </div>
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
      </div>
    </div>
  );
}

export default HomeScreen;
