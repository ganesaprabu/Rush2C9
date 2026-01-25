import { memo } from 'react';

/**
 * GameHUD - Compact single-row heads-up display
 * Memoized to prevent unnecessary re-renders that affect touch responsiveness
 *
 * Displays: Segment | Credits | Time | Speed | Distance | Progress
 */
const GameHUD = memo(function GameHUD({
  credits = 200,
  progress = 0,
  time = 0,
  speed = 0,
  distance = 0,
  // totalDistance - not displayed but kept for potential future use
  segmentNumber = 1,
  totalSegments = 3,
  isBoosting = false
}) {
  // Format time as seconds
  const timeDisplay = Math.floor(time);

  // Format distance
  const distanceDisplay = distance.toFixed(1);

  // Stabilize speed (round to nearest 5)
  const speedDisplay = Math.round(speed / 5) * 5;

  return (
    <div className="p-2 pointer-events-none">
      {/* Row 1: Stats */}
      <div className="bg-black/70 backdrop-blur-sm rounded-t-lg px-3 py-2 flex items-center justify-between gap-2 text-sm">
        {/* Segment */}
        <div className="flex items-center gap-1">
          <span className="text-gray-400">Seg</span>
          <span className="font-bold text-white">{segmentNumber}/{totalSegments}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-600" />

        {/* Credits */}
        <div className="flex items-center gap-1">
          <span className="text-yellow-400">💳</span>
          <span className="font-bold text-yellow-400">{credits}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-600" />

        {/* Time */}
        <div className="flex items-center gap-1">
          <span>⏱️</span>
          <span className="font-bold text-white">{timeDisplay}s</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-600" />

        {/* Speed */}
        <div className="flex items-center gap-1">
          <span>🚗</span>
          <span className={`font-bold ${isBoosting ? 'text-yellow-400' : 'text-cyan-400'}`}>{speedDisplay}</span>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-600" />

        {/* Distance */}
        <div className="flex items-center gap-1">
          <span>📍</span>
          <span className="font-bold text-white">{distanceDisplay}km</span>
        </div>
      </div>

      {/* Row 2: Progress bar (full width) */}
      <div className="bg-black/70 backdrop-blur-sm rounded-b-lg px-3 py-2">
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isBoosting ? 'bg-yellow-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Boost indicator */}
      {isBoosting && (
        <div className="mt-2 text-center">
          <span className="bg-yellow-500/80 text-black font-bold px-4 py-1 rounded-full text-sm animate-pulse">
            🚀 BOOST!
          </span>
        </div>
      )}
    </div>
  );
});

export default GameHUD;
