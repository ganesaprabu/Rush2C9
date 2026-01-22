import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { STARTING_CITIES, VEHICLES, GAME_CONFIG } from '../../data/gameData';

function GameScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get('destination') || 'lcs';

  const [gameState, setGameState] = useState('loading'); // loading, playing, finished
  const [startingCity, setStartingCity] = useState(null);
  const [currentSegment, setCurrentSegment] = useState(1);
  const [credits, setCredits] = useState(GAME_CONFIG.startingCredits);
  const [totalTime, setTotalTime] = useState(0);

  // Select random starting city on mount
  useEffect(() => {
    const randomCity = STARTING_CITIES[Math.floor(Math.random() * STARTING_CITIES.length)];
    setStartingCity(randomCity);
    setTimeout(() => setGameState('playing'), 1500);
  }, []);

  const selectVehicle = (vehicle) => {
    if (credits >= vehicle.cost) {
      setCredits(credits - vehicle.cost);
      setTotalTime(totalTime + 10); // Placeholder time calculation

      if (currentSegment >= GAME_CONFIG.segments) {
        setGameState('finished');
      } else {
        setCurrentSegment(currentSegment + 1);
      }
    }
  };

  // Loading state
  if (gameState === 'loading' || !startingCity) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white">
        <div className="text-6xl mb-4">🌍</div>
        <h2 className="text-xl">Finding your starting location...</h2>
      </div>
    );
  }

  // Game finished
  if (gameState === 'finished') {
    const leftoverCredits = credits;
    const timeBonus = Math.max(0, GAME_CONFIG.maxTimeBonus - totalTime);
    const finalScore = GAME_CONFIG.basePoints + timeBonus + leftoverCredits;

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold mb-2">You Made It!</h1>
          <p className="text-gray-400 mb-8">
            {startingCity.name} → {destination === 'lcs' ? 'LCS Arena' : 'VCT Arena'}
          </p>

          <div className="bg-gray-800 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Base Points</span>
              <span>{GAME_CONFIG.basePoints}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Time Bonus</span>
              <span className="text-green-400">+{timeBonus}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Credits Saved</span>
              <span className="text-yellow-400">+{leftoverCredits}</span>
            </div>
            <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
              <span>Final Score</span>
              <span className="text-blue-400">{finalScore}</span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/home')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-semibold"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing state
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-400">Segment {currentSegment}/{GAME_CONFIG.segments}</p>
            <h2 className="text-lg font-bold">{startingCity.name}</h2>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Credits</p>
            <p className="text-xl font-bold text-yellow-400">💳 {credits}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-gray-800 rounded-full mb-8">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
            style={{ width: `${((currentSegment - 1) / GAME_CONFIG.segments) * 100}%` }}
          />
        </div>

        {/* Vehicle Selection */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Choose Your Vehicle</h3>
          <div className="space-y-3">
            {VEHICLES.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => selectVehicle(vehicle)}
                disabled={credits < vehicle.cost}
                className={`w-full p-4 rounded-xl flex items-center justify-between transition-all ${
                  credits >= vehicle.cost
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-900 opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{vehicle.emoji}</span>
                  <div className="text-left">
                    <div className="font-semibold">{vehicle.name}</div>
                    <div className="text-sm text-gray-400">
                      Land: {vehicle.landSpeed}x | Water: {vehicle.waterSpeed}x
                    </div>
                  </div>
                </div>
                <div className="text-yellow-400 font-semibold">
                  {vehicle.cost} 💳
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
