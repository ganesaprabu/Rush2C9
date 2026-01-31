import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DESTINATIONS } from '../../data/gameData';
import { getPlayerId, getFactionStats } from '../../firebase/playerService';

/**
 * NameEntryScreen - Simplified entry point for the game
 *
 * Features:
 * - Name input (single field)
 * - Destination selection (LCS / VCT)
 * - Start Race button
 * - Faction War progress bar (real data from Firebase)
 * - Uses persistent UUID for player tracking
 */
function NameEntryScreen() {
  const navigate = useNavigate();

  // Form state
  const [playerName, setPlayerName] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Faction War stats from Firebase
  const [factionStats, setFactionStats] = useState({ lcs: 50, vct: 50 });

  // Set page title
  useEffect(() => {
    document.title = 'Rush2C9 - Race to the Arena';
  }, []);

  // Pre-fill name if returning player, and fetch faction stats
  useEffect(() => {
    const savedName = localStorage.getItem('rush2c9_playerName');
    if (savedName) {
      setPlayerName(savedName);
    }

    // Fetch real faction stats (non-blocking)
    getFactionStats().then(stats => {
      setFactionStats(stats);
    });
  }, []);

  // Handle name input - uppercase, alphanumeric only (A-Z, 0-9), max 9 chars
  const handleNameChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
    setPlayerName(value);
  };

  // Check if form is valid
  const isFormValid = playerName.trim().length >= 2 && selectedDestination !== null;

  // Handle Start Race
  const handleStartRace = () => {
    if (!isFormValid) return;

    const trimmedName = playerName.trim();

    // Get or create player ID based on name
    // Same name = same UUID, different name = new UUID
    const playerId = getPlayerId(trimmedName);

    // Save to localStorage
    localStorage.setItem('rush2c9_playerId', playerId);
    localStorage.setItem('rush2c9_playerName', trimmedName);
    localStorage.setItem('rush2c9_destination', selectedDestination);

    // Navigate to game
    navigate(`/game?destination=${selectedDestination}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6 flex flex-col">
      <div className="max-w-lg mx-auto w-full flex-1 flex flex-col justify-center">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-blue-400">🏎️</span> RUSH 2 C9 <span className="text-red-400">🏎️</span>
          </h1>
          <p className="text-gray-400">Race to support Cloud9!</p>
        </div>

        {/* Name Input */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-2">What's your name? (max 9 chars)</label>
          <input
            type="text"
            value={playerName}
            onChange={handleNameChange}
            placeholder="YOURNAME"
            maxLength={9}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-lg uppercase tracking-wide"
          />
        </div>

        {/* Destination Selection */}
        <div className="mb-6">
          <label className="block text-gray-400 text-sm mb-3">Pick your destination:</label>
          <div className="grid grid-cols-2 gap-3">
            {DESTINATIONS.map((dest) => (
              <button
                key={dest.id}
                onClick={() => setSelectedDestination(dest.id)}
                className={`relative overflow-hidden rounded-xl p-4 text-center transition-all hover:scale-105 active:scale-95 shadow-lg ${
                  dest.id === 'lcs'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'
                    : 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700'
                } ${
                  selectedDestination === dest.id
                    ? dest.id === 'lcs'
                      ? 'border-4 border-blue-300 ring-2 ring-blue-400/50'
                      : 'border-4 border-red-300 ring-2 ring-red-400/50'
                    : 'border-2 border-transparent'
                }`}
              >
                {/* Selected checkmark */}
                {selectedDestination === dest.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-bold">✓</span>
                  </div>
                )}

                <div className="text-4xl mb-2 drop-shadow-lg">
                  {dest.id === 'lcs' ? '🎮' : '🎯'}
                </div>
                <div className="font-bold text-white">{dest.name}</div>
                <div className="text-xs text-white/70">{dest.game}</div>
                <div className="text-xs text-white/60 mt-1">{dest.location}</div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Start Race Button */}
        <button
          onClick={handleStartRace}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-xl font-bold text-xl transition-all flex items-center justify-center gap-2 ${
            isFormValid
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-900/50'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          🏁 START RACE
        </button>

        {/* Faction War Preview */}
        <div className="mt-8 bg-gray-800/50 rounded-xl p-4">
          <h4 className="text-sm text-gray-400 mb-3 text-center">Faction War</h4>

          {/* Progress Bar */}
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

          {/* Labels */}
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-xl">🎮</div>
              <div className="text-xs font-semibold text-blue-400">LCS</div>
            </div>
            <div className="text-gray-600 text-sm">VS</div>
            <div className="text-center">
              <div className="text-xl">🎯</div>
              <div className="text-xs font-semibold text-red-400">VCT</div>
            </div>
          </div>
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
              rgba(255, 255, 255, 0.3) 50%,
              transparent 100%
            );
            animation: shimmer 4s ease-in-out infinite;
          }
        `}</style>
      </div>
    </div>
  );
}

export default NameEntryScreen;
