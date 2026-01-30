import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DESTINATIONS,
  VEHICLES,
  VEHICLES_ARRAY,
  ROAD_TYPES,
  GAME_CONFIG,
  SEGMENT_CONFIG,
  getRandomStartingCity,
  generateRouteSegments,
  getSpeedRating
} from '../../data/gameData';
// Player service will be replaced with Firebase
// import { updatePlayerScore, getPlayer } from '../../services/playerService';
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
  const [raceStarted, setRaceStarted] = useState(false); // True after countdown finishes
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

  // Continue to next racing segment (Segment 2 - Truck)
  const handleContinueRacing = useCallback(() => {
    setCurrentSegment((prev) => prev + 1);
    setProgress(0);
    setElapsedTime(0);
    setRaceStarted(false); // Reset for new segment countdown
    setGameState('racing');
  }, []);

  // Skip to Segment 3 (Race Car) - costs credits
  const handleSkipToSegment3 = useCallback(() => {
    if (credits >= GAME_CONFIG.skipSegmentCost) {
      setCredits((prev) => prev - GAME_CONFIG.skipSegmentCost);
      setCurrentSegment(2); // Jump directly to segment 3 (index 2)
      setProgress(0);
      setElapsedTime(0);
      setRaceStarted(false); // Reset for new segment countdown
      setGameState('racing');
    }
  }, [credits]);

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
      // Save segment result at the correct index (handles skip scenario)
      setSegmentResults((prev) => {
        const newResults = [...prev];
        newResults[currentSegment] = { time, obstaclesHit, boostsUsed, boostsAvailable };
        return newResults;
      });
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
    [currentSegment]
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

  // Racing timer - now synced from Phaser via handleStats callback
  // Removed redundant React timer - Phaser's elapsedTime is the single source of truth

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

  // Stats update from Phaser (speed, distance, time)
  const handleStats = useCallback((stats) => {
    setSpeed(stats.speed);
    setDistance(stats.distance);
    setTotalDistance(stats.totalDistance);
    // Use Phaser's elapsed time as single source of truth
    if (stats.time !== undefined) {
      setElapsedTime(stats.time);
    }
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

  // Race started (countdown finished in Phaser)
  const handleRaceStart = useCallback(() => {
    setRaceStarted(true);
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

  // Save score and return to name entry
  const handleFinish = useCallback(() => {
    // TODO: Save score to Firebase when integrated
    // const score = calculateScore();
    window.scrollTo(0, 0);
    document.body.style.overflow = '';
    navigate('/name-entry');
  }, [navigate]);

  // Play again - go back to name entry
  const handlePlayAgain = useCallback(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = '';
    navigate('/name-entry');
  }, [navigate]);

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

  // City Reveal with countdown + Racing Energy
  if (gameState === 'city_reveal') {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-4 pt-4 pb-6 relative overflow-hidden">
        {/* Speed Lines Background - 70% opacity */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-70">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-speed-line"
              style={{
                top: `${5 + i * 8}%`,
                left: '-100%',
                width: '60%',
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
              }}
            />
          ))}
        </div>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto relative z-10 py-2">
          <p className="text-gray-400 mb-3 text-lg">Your journey begins in...</p>

          {/* Start City and Destination with Arrow - Different colors */}
          <div className="flex items-center justify-center gap-3 mb-5">
            {/* Start City Card - GREEN theme */}
            <div className="bg-green-900/40 rounded-xl p-4 border border-green-500/50 w-36 h-36 flex flex-col items-center justify-center animate-card-pulse-green">
              <div className="text-4xl mb-2">{startingCity.emoji}</div>
              <h1 className="text-lg font-bold leading-tight">{startingCity.name}</h1>
              <p className="text-green-300 text-xs">{startingCity.region}</p>
            </div>

            {/* Arrow */}
            <div className="text-5xl font-bold text-cyan-400 animate-pulse-arrow">→</div>

            {/* Destination Card - CYAN/BLUE theme */}
            <div className="bg-cyan-900/40 rounded-xl p-3 border border-cyan-500/50 w-36 h-36 flex flex-col items-center justify-center animate-card-pulse-cyan">
              <span className="text-3xl block mb-1">{destinationInfo?.emoji}</span>
              <p className="font-bold text-base leading-tight">{destinationInfo?.name}</p>
              <p className="text-xs text-cyan-300">{destinationInfo?.game}</p>
              <p className="text-xs text-cyan-200 mt-1">{destinationInfo?.location}</p>
            </div>
          </div>

          {/* Distance - Prominent */}
          <p className="text-2xl font-bold text-cyan-400 mb-4">
            {startingCity.baseDistance.toLocaleString()} km to Los Angeles
          </p>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-gray-400 mb-1">GET READY!</p>
            <div className="text-5xl font-bold text-yellow-400 animate-pulse">
              {countdown > 0 ? countdown : '🏁'}
            </div>
          </div>
        </div>

        {/* F1 Racing Car at Bottom - Shaky Animation */}
        <div className="relative flex flex-col items-center z-10 mb-48">
          <svg
            width="160"
            height="55"
            viewBox="0 0 180 60"
            className="animate-car-shake"
          >
            {/* F1 Car */}
            <g>
              {/* Rear wing */}
              <rect x="8" y="12" width="4" height="22" fill="#DC2626" />
              <rect x="4" y="10" width="12" height="4" fill="#DC2626" />

              {/* Main body */}
              <path
                d="M20 34 L25 28 L45 24 L70 22 L100 20 L130 20 L150 24 L160 30 L165 34 L165 40 L20 40 Z"
                fill="#DC2626"
              />

              {/* Cockpit */}
              <path
                d="M75 22 L95 20 L100 20 L100 28 L80 30 L75 28 Z"
                fill="#1F2937"
              />

              {/* Driver helmet */}
              <ellipse cx="88" cy="22" rx="6" ry="5" fill="#3B82F6" />

              {/* Front nose */}
              <path
                d="M150 26 L170 30 L175 34 L175 38 L165 38 L160 34 L150 30 Z"
                fill="#DC2626"
              />

              {/* Side pods */}
              <path
                d="M50 28 L70 26 L70 38 L50 38 Z"
                fill="#B91C1C"
              />
              <path
                d="M110 26 L130 28 L130 38 L110 38 Z"
                fill="#B91C1C"
              />

              {/* Front wing */}
              <rect x="160" y="38" width="18" height="3" fill="#DC2626" />
              <rect x="165" y="34" width="12" height="4" fill="#1F2937" />

              {/* Rear diffuser */}
              <rect x="15" y="38" width="15" height="3" fill="#1F2937" />

              {/* Wheels */}
              {/* Rear left wheel */}
              <ellipse cx="35" cy="40" rx="12" ry="10" fill="#1F2937" />
              <ellipse cx="35" cy="40" rx="8" ry="7" fill="#374151" />
              <ellipse cx="35" cy="40" rx="3" ry="2.5" fill="#EF4444" />

              {/* Front left wheel */}
              <ellipse cx="145" cy="40" rx="10" ry="9" fill="#1F2937" />
              <ellipse cx="145" cy="40" rx="6" ry="6" fill="#374151" />
              <ellipse cx="145" cy="40" rx="2" ry="2" fill="#EF4444" />

              {/* Accents */}
              <path d="M60 30 L90 28 L90 32 L60 34 Z" fill="#FBBF24" />
              <circle cx="170" cy="36" r="2" fill="#FBBF24" />
            </g>
          </svg>
          {/* Road line */}
          <div className="w-44 h-[3px] bg-gradient-to-r from-transparent via-gray-500 to-transparent mt-1" />
        </div>

        {/* Animation Styles */}
        <style>{`
          @keyframes speed-line {
            0% {
              transform: translateX(0);
              opacity: 0;
            }
            5% {
              opacity: 1;
            }
            95% {
              opacity: 1;
            }
            100% {
              transform: translateX(500%);
              opacity: 0;
            }
          }
          .animate-speed-line {
            animation: speed-line linear infinite;
          }
          @keyframes car-shake {
            0%, 100% {
              transform: translateY(0) translateX(0);
            }
            10% {
              transform: translateY(-2px) translateX(2px);
            }
            20% {
              transform: translateY(0) translateX(-2px);
            }
            30% {
              transform: translateY(-3px) translateX(0);
            }
            40% {
              transform: translateY(0) translateX(2px);
            }
            50% {
              transform: translateY(-2px) translateX(-2px);
            }
            60% {
              transform: translateY(0) translateX(0);
            }
            70% {
              transform: translateY(-2px) translateX(2px);
            }
            80% {
              transform: translateY(-3px) translateX(-2px);
            }
            90% {
              transform: translateY(0) translateX(0);
            }
          }
          .animate-car-shake {
            animation: car-shake 0.25s ease-in-out infinite;
          }
          @keyframes pulse-arrow {
            0%, 100% {
              opacity: 1;
              transform: translateX(0);
            }
            50% {
              opacity: 0.6;
              transform: translateX(5px);
            }
          }
          .animate-pulse-arrow {
            animation: pulse-arrow 1s ease-in-out infinite;
          }
          @keyframes card-pulse-green {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 20px 4px rgba(34, 197, 94, 0.4);
              transform: scale(1.02);
            }
          }
          .animate-card-pulse-green {
            animation: card-pulse-green 2s ease-in-out infinite;
          }
          @keyframes card-pulse-cyan {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(34, 211, 238, 0);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 20px 4px rgba(34, 211, 238, 0.4);
              transform: scale(1.02);
            }
          }
          .animate-card-pulse-cyan {
            animation: card-pulse-cyan 2s ease-in-out infinite;
          }
        `}</style>
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
            playerName={localStorage.getItem('rush2c9_playerName') || 'RACER'}
            onProgress={handleProgress}
            onStats={handleStats}
            onObstacleHit={handleObstacleHit}
            onBoostUsed={handleBoostUsed}
            onBoostReady={handleBoostReady}
            onSegmentComplete={handleSegmentComplete}
            onRaceStart={handleRaceStart}
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
            {/* Segment Stats - Single Line */}
            <p className="mt-3 text-xl">
              <span className="text-cyan-400">{segmentResults[currentSegment]?.time?.toFixed(1)}s</span>
              <span className="text-gray-500"> | </span>
              <span className="text-red-400">{segmentResults[currentSegment]?.obstaclesHit || 0} Hits</span>
              <span className="text-gray-500"> | </span>
              <span className="text-yellow-400">{segmentResults[currentSegment]?.boostsUsed || 0}/{segmentResults[currentSegment]?.boostsAvailable || 0} Boost</span>
              <span className="text-gray-500"> | </span>
              <span className="text-green-400">{credits} Credits</span>
            </p>
            {/* Current Score */}
            <div className="mt-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg px-4 py-2 inline-block border border-yellow-700/50">
              <span className="text-gray-400 text-sm">Current Score: </span>
              <span className="text-yellow-400 font-bold text-lg">⭐ {calculateScore()}</span>
            </div>
          </div>

          {/* Choose Your Path - Dynamic based on completed segment */}
          <div className="mb-6">
            <p className="text-center font-semibold mb-4 text-lg">Choose Your Path</p>

            {/* After Segment 1: Show Segment 2 and Skip to Segment 3 */}
            {currentSegment === 0 && (
              <>
                {/* Option 1: Continue to Segment 2 (Truck) - FREE */}
                <button
                  onClick={handleContinueRacing}
                  className="w-full mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-blue-800/50 hover:from-blue-800/50 hover:to-blue-700/50 rounded-xl border border-blue-600/50 transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-subtle"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🚛</span>
                      <div className="text-left">
                        <p className="font-bold">Segment 2 - Truck</p>
                        <p className="text-sm text-gray-400">200 km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-lg">FREE</span>
                      <span className="text-green-400 text-xl">→</span>
                    </div>
                  </div>
                </button>

                {/* Option 2: Skip to Segment 3 (Race Car) - 100 credits */}
                <button
                  onClick={handleSkipToSegment3}
                  disabled={credits < GAME_CONFIG.skipSegmentCost}
                  className={`w-full p-4 rounded-xl border transition-all ${
                    credits >= GAME_CONFIG.skipSegmentCost
                      ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 hover:from-purple-800/50 hover:to-pink-800/50 border-purple-600/50 hover:scale-[1.02] active:scale-[0.98] animate-pulse-subtle'
                      : 'bg-gray-900/50 border-gray-700/50 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏎️</span>
                      <div className="text-left">
                        <p className="font-bold">Skip to Segment 3 - Race Car</p>
                        <p className="text-sm text-gray-400">225 km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-lg ${credits >= GAME_CONFIG.skipSegmentCost ? 'text-yellow-400' : 'text-gray-500'}`}>
                        -{GAME_CONFIG.skipSegmentCost} 💳
                      </span>
                      <span className={`text-xl ${credits >= GAME_CONFIG.skipSegmentCost ? 'text-yellow-400' : 'text-gray-500'}`}>→</span>
                    </div>
                  </div>
                  {credits < GAME_CONFIG.skipSegmentCost && (
                    <p className="text-xs text-red-400 mt-2 text-center">Not enough credits</p>
                  )}
                </button>
              </>
            )}

            {/* After Segment 2: Show Segment 3 and End Game */}
            {currentSegment === 1 && (
              <>
                {/* Option 1: Continue to Segment 3 (Race Car) - FREE */}
                <button
                  onClick={handleContinueRacing}
                  className="w-full mb-6 p-4 bg-gradient-to-r from-blue-900/50 to-blue-800/50 hover:from-blue-800/50 hover:to-blue-700/50 rounded-xl border border-blue-600/50 transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse-subtle"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏎️</span>
                      <div className="text-left">
                        <p className="font-bold">Segment 3 - Race Car</p>
                        <p className="text-sm text-gray-400">225 km/h</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-bold text-lg">FREE</span>
                      <span className="text-green-400 text-xl">→</span>
                    </div>
                  </div>
                </button>

                {/* Option 2: End Game & View Results */}
                <button
                  onClick={() => setGameState('results')}
                  className="w-full p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 hover:from-gray-700/50 hover:to-gray-600/50 rounded-xl border border-gray-600/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">🏁</span>
                      <div className="text-left">
                        <p className="font-bold">End Game</p>
                        <p className="text-sm text-gray-400">View final results</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 text-xl">→</span>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>

          {/* Animation styles */}
          <style>{`
            @keyframes pulse-glow {
              0%, 100% {
                opacity: 1;
                box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
                transform: scale(1);
              }
              50% {
                opacity: 0.9;
                box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
                transform: scale(1.02);
              }
            }
            .animate-pulse-subtle {
              animation: pulse-glow 1.5s ease-in-out infinite;
            }
          `}</style>
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
        <div className="max-w-lg mx-auto">
          {/* Journey Complete */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏁</div>
            <h1 className="text-2xl font-bold">JOURNEY COMPLETE!</h1>
            <p className="text-gray-400">
              {startingCity.name} → {destinationInfo?.name}
            </p>
          </div>

          {/* Score - Vibrant gold/amber gradient */}
          <div className="bg-gradient-to-r from-amber-600/40 to-yellow-500/40 rounded-xl p-5 mb-4 text-center border-2 border-yellow-500/60 shadow-lg shadow-yellow-900/20">
            <p className="text-sm text-yellow-200/80 mb-1 font-medium">YOUR SCORE</p>
            <p className="text-5xl font-bold text-yellow-400 drop-shadow-lg">
              <span className="trophy-shake inline-block">🏆</span> {score}
            </p>
          </div>

          {/* Action buttons - Side by side with shimmer effect (like destination cards) */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={handlePlayAgain}
              className="relative overflow-hidden py-4 bg-gradient-to-br from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 border-2 border-green-400 shadow-lg"
            >
              <span className="relative z-10">🔄 Play Again</span>
              <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="relative overflow-hidden py-4 bg-gradient-to-br from-blue-600 to-cyan-700 hover:from-blue-500 hover:to-cyan-600 rounded-xl font-bold text-base transition-all hover:scale-105 active:scale-95 border-2 border-blue-400 shadow-lg"
            >
              <span className="relative z-10">🏆 Leaderboard</span>
              <div className="absolute inset-0 shimmer-effect pointer-events-none"></div>
            </button>
          </div>

          {/* Shimmer and trophy shake animations */}
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
              animation: shimmer 2s ease-in-out infinite;
            }
            @keyframes trophy-shake {
              0%, 100% {
                transform: rotate(0deg);
              }
              15% {
                transform: rotate(-12deg);
              }
              30% {
                transform: rotate(10deg);
              }
              45% {
                transform: rotate(-8deg);
              }
              60% {
                transform: rotate(6deg);
              }
              75% {
                transform: rotate(-4deg);
              }
              90% {
                transform: rotate(2deg);
              }
            }
            .trophy-shake {
              animation: trophy-shake 1.5s ease-in-out infinite;
            }
          `}</style>

          {/* Stats - Single line with pipe separators - Mobile friendly */}
          <div className="bg-gray-800/50 rounded-xl p-3 mb-4">
            <div className="flex justify-center items-center">
              <div className="text-center px-2">
                <span className="font-bold text-base text-cyan-400">{totalTime.toFixed(1)}s</span>
                <span className="text-gray-400 text-xs ml-1">Time</span>
              </div>
              <span className="text-gray-600 text-base mx-1">|</span>
              <div className="text-center px-2">
                <span className="font-bold text-base text-red-400">{totalObstaclesHit}</span>
                <span className="text-gray-400 text-xs ml-1">Hits</span>
              </div>
              <span className="text-gray-600 text-base mx-1">|</span>
              <div className="text-center px-2">
                <span className="font-bold text-base">{startingCity.baseDistance.toLocaleString()}</span>
                <span className="text-gray-400 text-xs ml-1">km</span>
              </div>
              <span className="text-gray-600 text-base mx-1">|</span>
              <div className="text-center px-2">
                <span className="font-bold text-base text-yellow-400">{totalBoostsUsed}/{totalBoostsAvailable}</span>
                <span className="text-yellow-400 text-xs ml-1">⚡</span>
              </div>
            </div>
          </div>

          {/* Journey Map */}
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <p className="font-semibold mb-3 text-center">🗺️ Your Journey</p>
            <div className="space-y-2">
              {/* Starting city */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-green-600 flex items-center justify-center text-base">
                  {startingCity.emoji}
                </div>
                <div>
                  <p className="font-semibold text-sm">{startingCity.name}</p>
                  <p className="text-xs text-gray-400">Start</p>
                </div>
              </div>

              {/* Waypoints - Last one (Los Angeles) shows as destination */}
              {segments.map((segment, index) => {
                const isLastSegment = index === segments.length - 1;
                const isSkipped = !segmentResults[index];

                return (
                  <div key={index}>
                    <div className="ml-4 border-l-2 border-dashed border-gray-600 h-4" />
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${
                        isSkipped
                          ? 'bg-purple-900/50 border border-purple-500/50'
                          : isLastSegment
                            ? 'bg-blue-600'
                            : 'bg-gray-700'
                      }`}>
                        {isSkipped ? '⏭️' : isLastSegment ? destinationInfo?.emoji : ROAD_TYPES[segment.roadType]?.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">
                          {isLastSegment ? destinationInfo?.name : segment.to}
                        </p>
                        <p className={`text-xs ${isSkipped ? 'text-purple-400' : 'text-gray-400'}`}>
                          {isSkipped
                            ? 'Skipped'
                            : isLastSegment
                              ? `Destination 🏁 • ${segmentResults[index].time.toFixed(1)}s`
                              : `${segmentResults[index].time.toFixed(1)}s`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score Breakdown - At the bottom for detail lovers */}
          <div className="bg-gray-800/50 rounded-xl p-4">
            <p className="font-semibold mb-3 text-center">📊 Score Breakdown</p>
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
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0a] to-[#1a1a2e] text-white p-6">
      <p>Unknown game state: {gameState}</p>
      <button
        onClick={() => navigate('/name-entry')}
        className="mt-4 px-6 py-2 bg-blue-600 rounded-lg"
      >
        Play Again
      </button>
    </div>
  );
}

export default GameScreen;
