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

  // Track if we're currently steering
  const isSteeringRef = useRef(false);

  // Start steering when button pressed
  const startSteer = useCallback((direction) => {
    if (isSteeringRef.current) return; // Prevent double-firing
    isSteeringRef.current = true;

    // Immediately send steer command
    onSteer?.(direction);

    // Continue sending while held
    if (steerIntervalRef.current) {
      clearInterval(steerIntervalRef.current);
    }
    steerIntervalRef.current = setInterval(() => {
      onSteer?.(direction);
    }, 50); // Send steering commands at 20fps
  }, [onSteer]);

  // Stop steering when button released
  const stopSteer = useCallback(() => {
    isSteeringRef.current = false;
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
    <div className="p-2" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))', touchAction: 'none' }}>
      <div className="flex justify-between items-center gap-2" style={{ touchAction: 'none' }}>
        {/* Left button */}
        <button
          onTouchStart={() => startSteer(-1)}
          onTouchEnd={stopSteer}
          onTouchCancel={stopSteer}
          onMouseDown={() => startSteer(-1)}
          onMouseUp={stopSteer}
          onMouseLeave={stopSteer}
          className="w-16 h-16 bg-gray-800/90 active:bg-cyan-600 rounded-xl flex items-center justify-center text-3xl text-white shadow-lg select-none"
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'none', userSelect: 'none' }}
        >
          ◀
        </button>

        {/* Boost button - smaller height */}
        <button
          onTouchStart={handleBoost}
          onMouseDown={handleBoost}
          disabled={boostDisabled}
          className={`flex-1 mx-2 px-4 py-2 rounded-xl font-bold text-sm shadow-lg select-none ${
            isBoosting
              ? 'bg-yellow-500 text-black animate-pulse'
              : boostDisabled
                ? 'bg-gray-700/50 text-gray-500'
                : 'bg-orange-600/90 active:bg-orange-400 text-white'
          }`}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'none', userSelect: 'none' }}
        >
          {isBoosting ? '🚀 BOOST!' : `🚀 BOOST (${GAME_CONFIG.boostCost}💳)`}
        </button>

        {/* Right button */}
        <button
          onTouchStart={() => startSteer(1)}
          onTouchEnd={stopSteer}
          onTouchCancel={stopSteer}
          onMouseDown={() => startSteer(1)}
          onMouseUp={stopSteer}
          onMouseLeave={stopSteer}
          className="w-16 h-16 bg-gray-800/90 active:bg-cyan-600 rounded-xl flex items-center justify-center text-3xl text-white shadow-lg select-none"
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'none', userSelect: 'none' }}
        >
          ▶
        </button>
      </div>
    </div>
  );
}

export default ControlButtons;
