import { useCallback, useRef } from 'react';
import { GAME_CONFIG } from '../../data/gameData';

/**
 * ControlButtons - Touch controls for racing game
 *
 * Left/Right steering buttons + Boost button
 * Uses touch events for mobile-friendly controls
 */
function ControlButtons({
  onSteer,
  onBoost,
  credits = 200,
  canBoost = true,
  isBoosting = false
}) {
  const steerIntervalRef = useRef(null);

  // Start steering when button pressed
  const startSteer = useCallback((direction) => {
    // Immediately send steer command
    onSteer?.(direction);

    // Continue sending while held
    if (steerIntervalRef.current) {
      clearInterval(steerIntervalRef.current);
    }
    steerIntervalRef.current = setInterval(() => {
      onSteer?.(direction);
    }, 16); // ~60fps
  }, [onSteer]);

  // Stop steering when button released
  const stopSteer = useCallback(() => {
    if (steerIntervalRef.current) {
      clearInterval(steerIntervalRef.current);
      steerIntervalRef.current = null;
    }
    onSteer?.(0); // Center
  }, [onSteer]);

  // Handle boost
  const handleBoost = useCallback(() => {
    if (canBoost && !isBoosting && credits >= GAME_CONFIG.boostCost) {
      onBoost?.();
    }
  }, [canBoost, isBoosting, credits, onBoost]);

  const boostDisabled = !canBoost || isBoosting || credits < GAME_CONFIG.boostCost;

  return (
    <div className="absolute inset-x-0 bottom-0 p-2 pb-3">
      <div className="flex justify-between items-end gap-2">
        {/* Left button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            startSteer(-1);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopSteer();
          }}
          onMouseDown={() => startSteer(-1)}
          onMouseUp={stopSteer}
          onMouseLeave={stopSteer}
          className="w-16 h-16 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 rounded-xl flex items-center justify-center text-3xl text-white shadow-lg backdrop-blur-sm select-none touch-none transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ◀
        </button>

        {/* Boost button - smaller height */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            handleBoost();
          }}
          onClick={handleBoost}
          disabled={boostDisabled}
          className={`flex-1 mx-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg backdrop-blur-sm select-none touch-none transition-all ${
            isBoosting
              ? 'bg-yellow-500 text-black animate-pulse'
              : boostDisabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-orange-600/90 hover:bg-orange-500 active:bg-orange-400 text-white'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {isBoosting ? '🚀 BOOST!' : `🚀 BOOST (${GAME_CONFIG.boostCost}💳)`}
        </button>

        {/* Right button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            startSteer(1);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            stopSteer();
          }}
          onMouseDown={() => startSteer(1)}
          onMouseUp={stopSteer}
          onMouseLeave={stopSteer}
          className="w-16 h-16 bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600 rounded-xl flex items-center justify-center text-3xl text-white shadow-lg backdrop-blur-sm select-none touch-none transition-colors"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default ControlButtons;
