import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DESTINATIONS,
  VEHICLES,
  VEHICLES_ARRAY,
  ROAD_TYPES,
  GAME_CONFIG,
  getRandomStartingCity,
  generateRouteSegments,
  getSpeedRating
} from '../../data/gameData';
import { updatePlayerScore, getPlayer } from '../../services/playerService';
import PhaserGame from '../game/PhaserGame';
import GameHUD from '../game/GameHUD';
import ControlButtons from '../game/ControlButtons';

/**
 * GameScreen - v3.0 Gameplay with Simplified Flow
 *
 * Flow: loading → city_reveal (3s auto) → racing → pit_stop → racing → pit_stop → racing → results
 *
 * States:
 * - 'loading': Brief loading screen
 * - 'city_reveal': Shows starting city with 3s countdown
 * - 'racing': Phaser racing game (placeholder for now)
 * - 'pit_stop': Vehicle switch option between segments
 * - 'results': Final score + Journey Map
 */
function GameScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const destination = searchParams.get('destination') || 'lcs';
  const hideHUD = searchParams.get('hud') === '0'; // Add ?hud=0 to URL to hide HUD for testing

  // Initialize game data once
  const initialCity = useMemo(() => getRandomStartingCity(), []);
  const initialSegments = useMemo(
    () => generateRouteSegments(initialCity.id, 'moderate'),
    [initialCity.id]
  );

  // Game state machine
  const [gameState, setGameState] = useState('loading');

  // Game session data
  const [startingCity] = useState(initialCity);
  const [segments] = useState(initialSegments);
  const [credits, setCredits] = useState(GAME_CONFIG.startingCredits);
  const [currentSegment, setCurrentSegment] = useState(0);
  const [currentVehicle, setCurrentVehicle] = useState('car'); // Default vehicle
  const [segmentResults, setSegmentResults] = useState([]); // {time, obstaclesHit, boostsUsed, boostsAvailable}
  const [totalTime, setTotalTime] = useState(0);
  const [totalBoostsUsed, setTotalBoostsUsed] = useState(0);
  const [totalBoostsAvailable, setTotalBoostsAvailable] = useState(0);

  // UI state
  const [countdown, setCountdown] = useState(3);
  const [showContinueButton, setShowContinueButton] = useState(false); // Show after celebration delay

  // Racing state
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isBoosting, setIsBoosting] = useState(false);
  const [boostReady, setBoostReady] = useState(false); // System-driven boost availability
  const [speed, setSpeed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [totalDistance, setTotalDistance] = useState(5);
  const [showCelebration, setShowCelebration] = useState(false); // Confetti overlay on finish
  const gameContainerRef = useRef(null);

  // Get destination info
  const destinationInfo = DESTINATIONS.find((d) => d.id === destination);

  // ===== EVENT HANDLERS (defined before effects that use them) =====

  // Continue to next racing segment
  const handleContinueRacing = useCallback(() => {
    setCurrentSegment((prev) => prev + 1);
    setProgress(0);
    setElapsedTime(0);
    setGameState('racing');
  }, []);

  // Continue from victory celebration to pit stop or results
  const handleContinueFromVictory = useCallback(() => {
    setShowCelebration(false);
    setShowContinueButton(false);
    if (currentSegment >= 2) {
      // All 3 segments done - go to results
      setGameState('results');
    } else {
      // More segments - go to pit stop
      setGameState('pit_stop');
    }
  }, [currentSegment]);

  // Called when a racing segment completes
  const handleSegmentComplete = useCallback(
    (time, obstaclesHit = 0, boostsUsed = 0, boostsAvailable = 0) => {
      // Save segment result
      setSegmentResults((prev) => [...prev, { time, obstaclesHit, boostsUsed, boostsAvailable }]);
      setTotalTime((prev) => prev + time);
      setTotalBoostsUsed((prev) => prev + boostsUsed);
      setTotalBoostsAvailable((prev) => prev + boostsAvailable);

      // Show celebration overlay on the racing screen!
      setShowCelebration(true);
      setShowContinueButton(false);

      // Show "Continue" button after 3 seconds of celebration
      setTimeout(() => {
        setShowContinueButton(true);
      }, 3000);
    },
    []
  );

  // ===== STATE TRANSITIONS =====

  // Loading → City Reveal
  useEffect(() => {
    if (gameState === 'loading') {
      const timer = setTimeout(() => setGameState('city_reveal'), 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // City Reveal countdown → Racing
  useEffect(() => {
    if (gameState === 'city_reveal') {
      const timer = setTimeout(() => {
        if (countdown > 1) {
          setCountdown((prev) => prev - 1);
        } else {
          setGameState('racing');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, countdown]);

  // Pit Stop - NO auto-countdown anymore
  // User must click to proceed to next segment

  // Racing timer - track elapsed time (stops when race completes at 100% progress)
  useEffect(() => {
    if (gameState === 'racing' && progress < 100) {
      const interval = setInterval(() => {
        setElapsedTime((prev) => prev + 0.1);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameState, progress]);

  // Switch vehicle at pit stop
  const handleSwitchVehicle = useCallback(
    (vehicleId) => {
      const vehicle = VEHICLES[vehicleId];
      if (vehicle && credits >= vehicle.cost) {
        setCredits((prev) => prev - vehicle.cost);
        setCurrentVehicle(vehicleId);
      }
    },
    [credits]
  );

  // ===== RACING CALLBACKS =====

  // Progress update from Phaser
  const handleProgress = useCallback((progressValue) => {
    setProgress(progressValue);
  }, []);

  // Stats update from Phaser (speed, distance)
  const handleStats = useCallback((stats) => {
    setSpeed(stats.speed);
    setDistance(stats.distance);
    setTotalDistance(stats.totalDistance);
  }, []);

  // Obstacle hit callback
  const handleObstacleHit = useCallback(() => {
    // Visual feedback could be added here
  }, []);

  // Boost used - no longer deducts credits (system-driven)
  const handleBoostUsed = useCallback(() => {
    setIsBoosting(true);
    setBoostReady(false);
  }, []);

  // Boost ready state changed (from Phaser)
  const handleBoostReady = useCallback((ready) => {
    setBoostReady(ready);
    if (!ready) {
      setIsBoosting(false);
    }
  }, []);

  // Steer control - pass to Phaser
  const handleSteer = useCallback((direction) => {
    if (gameContainerRef.current?.handleSteer) {
      gameContainerRef.current.handleSteer(direction);
    }
  }, []);

  // Boost control - pass to Phaser (now cooldown-based, not credit-based)
  const handleBoostPress = useCallback(() => {
    if (gameContainerRef.current?.handleBoost && boostReady) {
      gameContainerRef.current.handleBoost();
    }
  }, [boostReady]);

  // Calculate final score (rounded to whole number)
  // Score = base + time bonus + credits - hits penalty
  // Note: Boost usage is NOT included in scoring (per user request)
  const calculateScore = useCallback(() => {
    const basePoints = GAME_CONFIG.basePoints;
    const timeBonus = Math.max(0, GAME_CONFIG.maxTimeBonus - totalTime);
    const creditBonus = credits;
    const totalHits = segmentResults.reduce((sum, r) => sum + (r.obstaclesHit || 0), 0);
    const hitsPenalty = totalHits * GAME_CONFIG.hitPenalty;

    return Math.round(Math.max(0, basePoints + timeBonus + creditBonus - hitsPenalty));
  }, [credits, totalTime, segmentResults]);

  // Save score and return home
  const handleFinish = useCallback(() => {
    const score = calculateScore();
    updatePlayerScore(score, destination);
    navigate('/home');
  }, [calculateScore, destination, navigate]);

  // Play again
  const handlePlayAgain = useCallback(() => {
    // Reset and start new game
    window.location.reload();
  }, []);

  // ===== RENDER STATES =====

  // Loading state
  if (gameState === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white">
        <div className="text-6xl mb-4 animate-pulse">🌍</div>
        <h2 className="text-xl">Finding your starting location...</h2>
      </div>
    );
  }

  // City Reveal with countdown
  if (gameState === 'city_reveal') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
        <div className="text-center max-w-md">
          <p className="text-gray-400 mb-2">Your journey begins in...</p>
          <div className="text-7xl mb-4 animate-bounce">{startingCity.emoji}</div>
          <h1 className="text-4xl font-bold mb-2">{startingCity.name}</h1>
          <p className="text-gray-400 mb-1">{startingCity.region}</p>
          <p className="text-lg text-cyan-400 mb-8">
            {startingCity.baseDistance.toLocaleString()} km to Los Angeles
          </p>

          <div className="bg-gray-800/50 rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-400 mb-2">Destination</p>
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{destinationInfo?.emoji}</span>
              <div>
                <p className="font-bold">{destinationInfo?.name}</p>
                <p className="text-sm text-gray-400">{destinationInfo?.game}</p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-gray-400 mb-2">GET READY!</p>
            <div className="text-6xl font-bold text-yellow-400 animate-pulse">
              {countdown > 0 ? countdown : '🏁'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Racing state with Phaser game
  if (gameState === 'racing') {
    const segment = segments[currentSegment];

    return (
      <div className="h-[100dvh] bg-[#0a0a0a] text-white overflow-hidden relative">
        {/* Game area - full screen */}
        <div className="absolute inset-0 max-w-md mx-auto w-full">
          {/* Phaser Game Canvas */}
          <PhaserGame
            ref={gameContainerRef}
            vehicleId={currentVehicle}
            roadType={segment?.roadType || 'highway'}
            credits={credits}
            segmentIndex={currentSegment}
            playerName={getPlayer()?.firstName || 'RACER'}
            onProgress={handleProgress}
            onStats={handleStats}
            onObstacleHit={handleObstacleHit}
            onBoostUsed={handleBoostUsed}
            onBoostReady={handleBoostReady}
            onSegmentComplete={handleSegmentComplete}
          />
        </div>

        {/* HUD Overlay - on top of game (can be hidden with ?hud=0 for testing) */}
        {!hideHUD && (
          <div className="absolute top-0 left-0 right-0 max-w-md mx-auto pointer-events-none z-10">
            <GameHUD
              credits={credits}
              progress={progress}
              time={elapsedTime}
              speed={speed}
              distance={distance}
              totalDistance={totalDistance}
              segmentNumber={currentSegment + 1}
              totalSegments={segments.length}
              isBoosting={isBoosting}
            />
          </div>
        )}

        {/* Control Buttons - positioned at bottom, hidden when continue button shows */}
        {!showContinueButton && (
          <div className="absolute bottom-0 left-0 right-0 max-w-md mx-auto z-20">
            <ControlButtons
              onSteer={handleSteer}
              onBoost={handleBoostPress}
              boostReady={boostReady}
              isBoosting={isBoosting}
            />
          </div>
        )}

        {/* Celebration Overlay - confetti + continue button */}
        {showCelebration && (
          <>
            {/* Confetti particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20px`,
                    animationDelay: `${Math.random() * 0.5}s`,
                    animationDuration: `${2 + Math.random() * 1.5}s`,
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][i % 8],
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Continue Button - appears after 3 seconds, positioned at very bottom */}
            {showContinueButton && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center z-40">
                <button
                  onClick={handleContinueFromVictory}
                  className="px-8 py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg text-white shadow-lg transform transition-all hover:scale-105 animate-bounce-slow"
                >
                  {currentSegment >= 2 ? '🏆 View Results' : '➡️ Continue to Pit Stop'}
                </button>
              </div>
            )}

            {/* Confetti animation styles */}
            <style>{`
              @keyframes confetti {
                0% {
                  transform: translateY(0) rotate(0deg);
                  opacity: 1;
                }
                100% {
                  transform: translateY(100vh) rotate(720deg);
                  opacity: 0;
                }
              }
              .animate-confetti {
                animation: confetti linear forwards;
              }
              @keyframes bounce-slow {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
              }
              .animate-bounce-slow {
                animation: bounce-slow 1.5s ease-in-out infinite;
              }
            `}</style>
          </>
        )}
      </div>
    );
  }

  // Pit Stop state
  if (gameState === 'pit_stop') {
    const completedSegment = segments[currentSegment];
    const nextSegment = segments[currentSegment + 1];
    const nextRoadType = ROAD_TYPES[nextSegment?.roadType];
    const currentVehicleData = VEHICLES[currentVehicle];
    const currentSpeedRating = getSpeedRating(
      currentVehicleData?.speedOnRoad[nextSegment?.roadType] || 1
    );

    // Find best vehicle for next road
    const bestVehicle = VEHICLES_ARRAY.reduce((best, v) => {
      const vSpeed = v.speedOnRoad[nextSegment?.roadType] || 0;
      const bestSpeed = best.speedOnRoad[nextSegment?.roadType] || 0;
      return vSpeed > bestSpeed ? v : best;
    }, VEHICLES_ARRAY[0]);

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
        <div className="max-w-md mx-auto">
          {/* Segment Complete */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">✅</div>
            <h2 className="text-xl font-bold mb-1">Segment {currentSegment + 1} Complete!</h2>
            <p className="text-gray-400">
              {completedSegment?.from} → {completedSegment?.to}
            </p>
            {/* Segment Stats */}
            <div className="flex justify-center gap-4 mt-3 text-sm">
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="text-cyan-400">{segmentResults[currentSegment]?.time?.toFixed(1)}s</span>
                <span className="text-gray-400 ml-1">Time</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="text-red-400">{segmentResults[currentSegment]?.obstaclesHit || 0}</span>
                <span className="text-gray-400 ml-1">Hits</span>
              </div>
              <div className="bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="text-yellow-400">
                  {segmentResults[currentSegment]?.boostsUsed || 0}/{segmentResults[currentSegment]?.boostsAvailable || 0}
                </span>
                <span className="text-gray-400 ml-1">Boost</span>
              </div>
            </div>
            {/* Current Score */}
            <div className="mt-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg px-4 py-2 inline-block border border-yellow-700/50">
              <span className="text-gray-400 text-sm">Current Score: </span>
              <span className="text-yellow-400 font-bold text-lg">⭐ {calculateScore()}</span>
            </div>
          </div>

          {/* Next segment info */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-400 mb-2">NEXT SEGMENT</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{nextRoadType?.emoji}</span>
              <div>
                <p className="font-semibold">
                  {nextSegment?.from} → {nextSegment?.to}
                </p>
                <p className="text-sm text-gray-400">{nextRoadType?.name}</p>
              </div>
            </div>

            {/* Current vehicle status */}
            <div className="flex items-center justify-between bg-gray-900/50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentVehicleData?.emoji}</span>
                <span className="text-sm">{currentVehicleData?.name}</span>
              </div>
              <div
                className="text-sm font-bold px-2 py-1 rounded"
                style={{
                  backgroundColor: currentSpeedRating.color + '30',
                  color: currentSpeedRating.color,
                }}
              >
                {currentSpeedRating.label}
              </div>
            </div>

            {/* Recommendation */}
            {bestVehicle.id !== currentVehicle && credits >= bestVehicle.cost && (
              <p className="text-sm text-yellow-400 mt-3">
                💡 {bestVehicle.emoji} {bestVehicle.name} is better for {nextRoadType?.name}!
              </p>
            )}
          </div>

          {/* Vehicle switch options */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold">Switch Vehicle?</p>
              <p className="text-yellow-400">💳 {credits}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {VEHICLES_ARRAY.filter((v) => v.id !== currentVehicle).map((vehicle) => {
                const speedRating = getSpeedRating(vehicle.speedOnRoad[nextSegment?.roadType]);
                const canAfford = credits >= vehicle.cost;

                return (
                  <button
                    key={vehicle.id}
                    disabled={!canAfford}
                    onClick={() => handleSwitchVehicle(vehicle.id)}
                    className={`p-3 rounded-xl text-left transition-all ${
                      canAfford
                        ? 'bg-gray-800 hover:bg-gray-700'
                        : 'bg-gray-900 opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{vehicle.emoji}</span>
                      <span className="text-sm font-semibold">{vehicle.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: speedRating.color + '30',
                          color: speedRating.color,
                        }}
                      >
                        {speedRating.label}
                      </span>
                      <span className="text-xs text-yellow-400">{vehicle.cost} 💳</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue button - user must click to proceed */}
          <button
            onClick={handleContinueRacing}
            className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-bold text-lg transition-all animate-pulse"
          >
            🏁 Continue to Segment {currentSegment + 2}
          </button>
          <p className="text-center text-gray-400 text-sm mt-2">
            Using {currentVehicleData?.emoji} {currentVehicleData?.name}
          </p>
        </div>
      </div>
    );
  }

  // Results state
  if (gameState === 'results') {
    const score = calculateScore();
    const timeBonus = Math.round(Math.max(0, GAME_CONFIG.maxTimeBonus - totalTime));
    const totalObstaclesHit = segmentResults.reduce((sum, r) => sum + (r.obstaclesHit || 0), 0);
    const hitsPenalty = totalObstaclesHit * GAME_CONFIG.hitPenalty;

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
        <div className="max-w-md mx-auto">
          {/* Journey Complete */}
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">🏁</div>
            <h1 className="text-2xl font-bold">JOURNEY COMPLETE!</h1>
            <p className="text-gray-400">
              {startingCity.name} → {destinationInfo?.name}
            </p>
          </div>

          {/* Score */}
          <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl p-6 mb-6 text-center border border-yellow-700">
            <p className="text-sm text-gray-400 mb-2">YOUR SCORE</p>
            <p className="text-5xl font-bold text-yellow-400">⭐ {score}</p>
          </div>

          {/* Score breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <p className="font-semibold mb-3">Score Breakdown</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Base Points</span>
                <span>+{GAME_CONFIG.basePoints}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Time Bonus</span>
                <span className={timeBonus > 0 ? 'text-green-400' : 'text-gray-500'}>
                  +{timeBonus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Credits Saved</span>
                <span className="text-yellow-400">+{credits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Hits Penalty ({totalObstaclesHit} × {GAME_CONFIG.hitPenalty})</span>
                <span className={hitsPenalty > 0 ? 'text-red-400' : 'text-gray-500'}>
                  -{hitsPenalty}
                </span>
              </div>
              <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-yellow-400">{score}</span>
              </div>
            </div>
          </div>

          {/* Journey Map */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
            <p className="font-semibold mb-4 text-center">🗺️ Your Journey</p>
            <div className="space-y-3">
              {/* Starting city */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-lg">
                  {startingCity.emoji}
                </div>
                <div>
                  <p className="font-semibold">{startingCity.name}</p>
                  <p className="text-xs text-gray-400">Start</p>
                </div>
              </div>

              {/* Waypoints */}
              {segments.map((segment, index) => (
                <div key={index}>
                  <div className="ml-5 border-l-2 border-dashed border-gray-600 h-6" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg">
                      {ROAD_TYPES[segment.roadType]?.emoji}
                    </div>
                    <div>
                      <p className="font-semibold">{segment.to}</p>
                      <p className="text-xs text-gray-400">
                        {segmentResults[index]?.time?.toFixed(1)}s
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Destination */}
              <div className="ml-5 border-l-2 border-dashed border-gray-600 h-6" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg">
                  {destinationInfo?.emoji}
                </div>
                <div>
                  <p className="font-semibold">{destinationInfo?.name}</p>
                  <p className="text-xs text-gray-400">Destination 🏁</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-lg font-bold">{totalTime.toFixed(1)}s</p>
              <p className="text-xs text-gray-400">Total Time</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-lg font-bold">{totalObstaclesHit}</p>
              <p className="text-xs text-gray-400">Obstacles Hit</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-6 text-center">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-lg font-bold">{startingCity.baseDistance.toLocaleString()}</p>
              <p className="text-xs text-gray-400">km Traveled</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <p className="text-lg font-bold text-cyan-400">{totalBoostsUsed} / {totalBoostsAvailable}</p>
              <p className="text-xs text-gray-400">Boosts Used</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePlayAgain}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-lg transition-all"
            >
              🔄 Play Again
            </button>
            <button
              onClick={handleFinish}
              className="w-full py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold transition-all"
            >
              🏠 Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <p>Unknown game state: {gameState}</p>
      <button
        onClick={() => navigate('/home')}
        className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
      >
        Return Home
      </button>
    </div>
  );
}

export default GameScreen;
