import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import Phaser from 'phaser';
import { PHASER_CONFIG } from '../../data/gameData';
import RacingScene from './RacingScene';

/**
 * PhaserGame - React wrapper for Phaser canvas
 *
 * Props:
 * - vehicleId: Current vehicle (e.g., 'car', 'bike')
 * - roadType: Current road type (e.g., 'highway', 'mud')
 * - credits: Current credits available
 * - segmentIndex: Current segment (0, 1, 2)
 * - onProgress: Callback when progress updates (0-100)
 * - onStats: Callback for speed/distance updates
 * - onObstacleHit: Callback when hitting obstacle
 * - onBoostUsed: Callback when boost is used
 * - onBoostReady: Callback when boost becomes available/unavailable
 * - onSegmentComplete: Callback when segment is done (time, obstaclesHit, boostsUsed, boostsAvailable)
 */
const PhaserGame = forwardRef(function PhaserGame({
  vehicleId = 'car',
  roadType = 'highway',
  credits = 200,
  segmentIndex = 0,
  playerName = 'RACER',
  onProgress,
  onStats,
  onObstacleHit,
  onBoostUsed,
  onBoostReady,
  onSegmentComplete
}, ref) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const callbacksRef = useRef({ onProgress, onStats, onObstacleHit, onBoostUsed, onBoostReady, onSegmentComplete });

  // Keep callbacks up to date
  useEffect(() => {
    callbacksRef.current = { onProgress, onStats, onObstacleHit, onBoostUsed, onBoostReady, onSegmentComplete };
  }, [onProgress, onStats, onObstacleHit, onBoostUsed, onBoostReady, onSegmentComplete]);

  // Initialize Phaser game
  useEffect(() => {
    if (!containerRef.current) return;

    // Create the scene instance with callbacks (use refs for stable references)
    const racingScene = new RacingScene({
      onProgress: (progress) => callbacksRef.current.onProgress?.(progress),
      onStats: (stats) => callbacksRef.current.onStats?.(stats),
      onObstacleHit: () => callbacksRef.current.onObstacleHit?.(),
      onBoostUsed: () => callbacksRef.current.onBoostUsed?.(),
      onBoostReady: (ready) => callbacksRef.current.onBoostReady?.(ready),
      onComplete: (time, obstaclesHit, boostsUsed, boostsAvailable) => callbacksRef.current.onSegmentComplete?.(time, obstaclesHit, boostsUsed, boostsAvailable)
    });

    // Phaser game configuration
    const config = {
      type: Phaser.AUTO,
      width: PHASER_CONFIG.width,
      height: PHASER_CONFIG.height,
      parent: containerRef.current,
      backgroundColor: PHASER_CONFIG.colors.sky,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: '100%',
        height: '100%'
      },
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
      scene: racingScene
    };

    // Create game instance
    gameRef.current = new Phaser.Game(config);

    // Wait for scene to be ready, then set initial values
    const checkSceneReady = setInterval(() => {
      if (gameRef.current && gameRef.current.scene.scenes[0]) {
        const scene = gameRef.current.scene.scenes[0];
        if (scene.setPlayerName) {
          scene.setPlayerName(playerName);
          clearInterval(checkSceneReady);
        }
      }
    }, 100);

    // Cleanup on unmount
    return () => {
      clearInterval(checkSceneReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update vehicle when it changes
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.setVehicle) {
        scene.setVehicle(vehicleId);
      }
    }
  }, [vehicleId]);

  // Update road type when it changes
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.setRoadType) {
        scene.setRoadType(roadType);
      }
    }
  }, [roadType]);

  // Update credits when they change
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.setCredits) {
        scene.setCredits(credits);
      }
    }
  }, [credits]);

  // Update segment index when it changes
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.setSegmentIndex) {
        scene.setSegmentIndex(segmentIndex);
      }
    }
  }, [segmentIndex]);

  // Update player name for victory screen
  useEffect(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.setPlayerName) {
        scene.setPlayerName(playerName);
      }
    }
  }, [playerName]);

  // Handle steering input (called from external controls)
  const handleSteer = useCallback((direction) => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.steer) {
        scene.steer(direction); // -1 = left, 0 = center, 1 = right
      }
    }
  }, []);

  // Handle boost input
  const handleBoost = useCallback(() => {
    if (gameRef.current && gameRef.current.scene.scenes[0]) {
      const scene = gameRef.current.scene.scenes[0];
      if (scene.activateBoost) {
        scene.activateBoost();
      }
    }
  }, []);

  // Expose control methods via imperative handle
  useImperativeHandle(ref, () => ({
    handleSteer,
    handleBoost
  }), [handleSteer, handleBoost]);

  return (
    <div
      ref={containerRef}
      className="phaser-game-container w-full h-full overflow-hidden"
      style={{ touchAction: 'none' }} // Prevent browser touch handling
    />
  );
});

export default PhaserGame;
