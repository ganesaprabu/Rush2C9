/**
 * GameHUD - Heads-up display overlay for racing game
 *
 * Displays: Credits, Progress bar, Timer, Road type, Segment info
 */
function GameHUD({
  credits = 200,
  progress = 0,
  time = 0,
  roadType = {},
  segmentInfo = {},
  isBoosting = false
}) {
  return (
    <div className="absolute inset-x-0 top-0 p-3 pointer-events-none">
      {/* Top row: Credits and Timer */}
      <div className="flex justify-between items-start mb-2">
        {/* Credits */}
        <div className="bg-black/60 rounded-lg px-3 py-1.5 backdrop-blur-sm">
          <p className="text-xs text-gray-400">Credits</p>
          <p className="text-lg font-bold text-yellow-400">💳 {credits}</p>
        </div>

        {/* Timer */}
        <div className="bg-black/60 rounded-lg px-3 py-1.5 backdrop-blur-sm text-right">
          <p className="text-xs text-gray-400">Time</p>
          <p className="text-lg font-bold text-white">{time.toFixed(1)}s</p>
        </div>
      </div>

      {/* Segment info */}
      <div className="bg-black/60 rounded-lg px-3 py-2 backdrop-blur-sm mb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{roadType?.emoji || '🛣️'}</span>
            <div>
              <p className="text-xs text-gray-400">Segment {segmentInfo?.current || 1}/3</p>
              <p className="text-sm font-semibold text-white">
                {segmentInfo?.from || 'Start'} → {segmentInfo?.to || 'Waypoint'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">{roadType?.name || 'Road'}</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="bg-black/60 rounded-lg p-2 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-gray-400">Progress</span>
          <span className="text-xs font-bold text-white ml-auto">{Math.floor(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
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
}

export default GameHUD;
