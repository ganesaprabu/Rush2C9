import { useCallback, useRef, useState, useEffect, memo } from 'react';

/**
 * ControlButtons - Touch/Mouse controls for racing game
 * Memoized to prevent re-renders that affect touch responsiveness
 *
 * Uses native event listeners for immediate touch response
 * Boost is now system-driven (cooldown-based, not credit-based)
 */
const ControlButtons = memo(function ControlButtons({
  onSteer,
  onBoost,
  boostReady = false,  // System-driven: is boost available?
  isBoosting = false
}) {
  const steerIntervalRef = useRef(null);
  const [activeButton, setActiveButton] = useState(null);

  // Refs for buttons to attach native event listeners
  const leftBtnRef = useRef(null);
  const rightBtnRef = useRef(null);
  const boostBtnRef = useRef(null);

  // Store callbacks in refs to avoid stale closures
  const onSteerRef = useRef(onSteer);
  const onBoostRef = useRef(onBoost);
  const boostReadyRef = useRef(boostReady);
  const isBoostingRef = useRef(isBoosting);

  useEffect(() => {
    onSteerRef.current = onSteer;
    onBoostRef.current = onBoost;
    boostReadyRef.current = boostReady;
    isBoostingRef.current = isBoosting;
  }, [onSteer, onBoost, boostReady, isBoosting]);

  // Start steering function - optimized for mobile responsiveness
  const startSteer = useCallback((direction, button) => {
    // Always clear any existing interval first
    if (steerIntervalRef.current) {
      clearInterval(steerIntervalRef.current);
      steerIntervalRef.current = null;
    }

    setActiveButton(button);

    // Send initial steer command immediately
    onSteerRef.current?.(direction);

    // Continuous steering while held - faster rate for smoother response
    steerIntervalRef.current = setInterval(() => {
      onSteerRef.current?.(direction);
    }, 16); // ~60fps for smoother steering
  }, []);

  // Stop steering function
  const stopSteer = useCallback(() => {
    setActiveButton(null);
    if (steerIntervalRef.current) {
      clearInterval(steerIntervalRef.current);
      steerIntervalRef.current = null;
    }
    onSteerRef.current?.(0);
  }, []);

  // Handle boost - only if ready and not already boosting
  const handleBoost = useCallback(() => {
    if (boostReadyRef.current && !isBoostingRef.current) {
      onBoostRef.current?.();
    }
  }, []);

  // Attach native event listeners for immediate response
  useEffect(() => {
    const leftBtn = leftBtnRef.current;
    const rightBtn = rightBtnRef.current;
    const boostBtn = boostBtnRef.current;

    if (!leftBtn || !rightBtn || !boostBtn) return;

    // Left button handlers
    const leftStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startSteer(-1, 'left');
    };
    const leftEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopSteer();
    };

    // Right button handlers
    const rightStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startSteer(1, 'right');
    };
    const rightEnd = (e) => {
      e.preventDefault();
      e.stopPropagation();
      stopSteer();
    };

    // Boost handler
    const boostTap = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleBoost();
    };

    // Use touchstart/touchend for mobile (faster than pointer events)
    // Also add mouse events for desktop
    const options = { passive: false, capture: true };

    // Left button
    leftBtn.addEventListener('touchstart', leftStart, options);
    leftBtn.addEventListener('touchend', leftEnd, options);
    leftBtn.addEventListener('touchcancel', leftEnd, options);
    leftBtn.addEventListener('mousedown', leftStart, options);
    leftBtn.addEventListener('mouseup', leftEnd, options);
    leftBtn.addEventListener('mouseleave', leftEnd, options);

    // Right button
    rightBtn.addEventListener('touchstart', rightStart, options);
    rightBtn.addEventListener('touchend', rightEnd, options);
    rightBtn.addEventListener('touchcancel', rightEnd, options);
    rightBtn.addEventListener('mousedown', rightStart, options);
    rightBtn.addEventListener('mouseup', rightEnd, options);
    rightBtn.addEventListener('mouseleave', rightEnd, options);

    // Boost button
    boostBtn.addEventListener('touchstart', boostTap, options);
    boostBtn.addEventListener('mousedown', boostTap, options);

    return () => {
      leftBtn.removeEventListener('touchstart', leftStart, options);
      leftBtn.removeEventListener('touchend', leftEnd, options);
      leftBtn.removeEventListener('touchcancel', leftEnd, options);
      leftBtn.removeEventListener('mousedown', leftStart, options);
      leftBtn.removeEventListener('mouseup', leftEnd, options);
      leftBtn.removeEventListener('mouseleave', leftEnd, options);

      rightBtn.removeEventListener('touchstart', rightStart, options);
      rightBtn.removeEventListener('touchend', rightEnd, options);
      rightBtn.removeEventListener('touchcancel', rightEnd, options);
      rightBtn.removeEventListener('mousedown', rightStart, options);
      rightBtn.removeEventListener('mouseup', rightEnd, options);
      rightBtn.removeEventListener('mouseleave', rightEnd, options);

      boostBtn.removeEventListener('touchstart', boostTap, options);
      boostBtn.removeEventListener('mousedown', boostTap, options);
    };
  }, [startSteer, stopSteer, handleBoost]);

  // Prevent any text selection or context menu
  const containerStyle = {
    WebkitTouchCallout: 'none',
    WebkitUserSelect: 'none',
    userSelect: 'none',
    touchAction: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-2"
      style={{
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        ...containerStyle
      }}
    >
      <div className="flex justify-between items-center gap-4">
        {/* Left button - LARGER touch target */}
        <div
          ref={leftBtnRef}
          className={`flex-1 h-24 rounded-xl flex items-center justify-center text-5xl text-white shadow-lg cursor-pointer ${
            activeButton === 'left' ? 'bg-cyan-600' : 'bg-gray-800/90'
          }`}
          style={containerStyle}
        >
          ◀
        </div>

        {/* Boost button - hidden, ref kept for code compatibility */}
        <div ref={boostBtnRef} style={{ display: 'none' }} />

        {/* Right button - LARGER touch target */}
        <div
          ref={rightBtnRef}
          className={`flex-1 h-24 rounded-xl flex items-center justify-center text-5xl text-white shadow-lg cursor-pointer ${
            activeButton === 'right' ? 'bg-cyan-600' : 'bg-gray-800/90'
          }`}
          style={containerStyle}
        >
          ▶
        </div>
      </div>
    </div>
  );
});

export default ControlButtons;
