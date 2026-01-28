import Phaser from 'phaser';
import {
  VEHICLES,
  ROAD_TYPES,
  SEGMENT_CONFIG,
  BOOST_CONFIG,
  COLLISION_CONFIG
} from '../../data/gameData';
import {
  NOTIFICATION_CONFIG,
  getRandomCloudMessage,
  getRandomTip,
  getRandomAnnouncement,
  getGantrySignContent
} from '../../data/notificationData';

/**
 * RacingScene - Simple pseudo-3D racing
 * Clean rendering approach that actually works
 */
class RacingScene extends Phaser.Scene {
  constructor(config = {}) {
    super({ key: 'RacingScene' });

    this.onProgress = config.onProgress || (() => {});
    this.onObstacleHit = config.onObstacleHit || (() => {});
    this.onBoostUsed = config.onBoostUsed || (() => {});
    this.onComplete = config.onComplete || (() => {});
    this.onStats = config.onStats || (() => {}); // For speed & distance updates
    this.onBoostReady = config.onBoostReady || (() => {}); // For boost availability

    this.vehicleId = config.vehicleId || 'car';
    this.roadType = config.roadType || 'highway';
    this.credits = config.credits || 200;
    this.segmentIndex = config.segmentIndex || 0; // 0-based segment index (0, 1, 2)
  }

  create() {
    const { width, height } = this.scale;

    // Simple settings
    this.width = width;
    this.height = height;
    this.roadWidth = 1800;  // Much wider road
    this.segmentLength = 200;
    this.rumbleLength = 3;
    this.drawDistance = 100;
    this.cameraHeight = 1000;
    this.fieldOfView = 100;

    // ========== SPEED SYSTEM (LINKED TO DISPLAY SPEED) ==========
    // Base speed unit - scales with display speed
    // At 100 km/h display = 1.0x multiplier, at 200 km/h = 2.0x multiplier
    this.baseSpeedUnit = this.segmentLength;

    // Reference speed (100 km/h = baseline)
    this.referenceDisplaySpeed = 100;

    // Speed feel multiplier - higher = faster visual movement
    // Increased from 12 to 18 for better speed perception at higher speeds
    this.speedFeelMultiplier = 18;

    // These will be recalculated based on currentDisplaySpeed
    this.maxSpeed = this.speedFeelMultiplier * this.baseSpeedUnit;  // Will be updated dynamically
    this.accel = 8 * this.baseSpeedUnit;   // Faster acceleration
    this.decel = 12 * this.baseSpeedUnit;  // Faster deceleration
    this.centrifugal = 0.3;

    // Player
    this.playerX = 0; // -1 to 1
    this.playerZ = 0;
    this.speed = 0;

    // Track - simple array of segments
    this.segments = [];
    this.trackLength = 0;
    this.buildTrack();

    // Traffic
    this.cars = [];
    this.placeCars();

    // State
    this.elapsedTime = 0;
    this.obstaclesHit = 0;
    this.completed = false;
    this.steerDirection = 0;
    this.isHit = false;
    this.hitTimer = 0;
    this.boosting = false;
    this.boostTimer = 0;

    // Boost usage tracking (for stats display, not scoring)
    this.boostsUsed = 0;        // How many times boost was activated
    this.boostsAvailable = 0;   // How many boost opportunities appeared

    // Victory sequence state
    this.victoryMode = false;
    this.victoryTimer = 0;
    this.victoryStopped = false;
    this.playerName = 'RACER'; // Will be set from outside

    // Graphics layers
    this.bgGraphics = this.add.graphics();
    this.roadGraphics = this.add.graphics();
    this.spriteGraphics = this.add.graphics();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Tap-to-boost: Listen for taps in the middle area of screen (above controls, below HUD)
    this.input.on('pointerdown', (pointer) => {
      // Only activate boost if tap is in the middle zone (not on steering buttons)
      // Middle zone: y between 20% and 75% of screen height
      const tapY = pointer.y / this.height;
      if (tapY > 0.15 && tapY < 0.75) {
        this.activateBoost();
      }
    });

    // ========== CONFIGURABLE SPEED SYSTEM ==========
    // Get segment-specific configuration
    const segIdx = Math.min(this.segmentIndex, SEGMENT_CONFIG.distances.length - 1);

    // Segment distance in km (from config)
    this.segmentDistanceKm = SEGMENT_CONFIG.distances[segIdx];

    // Base display speed for this segment (km/h)
    this.baseDisplaySpeed = SEGMENT_CONFIG.startSpeed[segIdx];

    // Current display speed (increases per km traveled)
    this.currentDisplaySpeed = this.baseDisplaySpeed;

    // Speed increase per km
    this.speedIncreasePerKm = SEGMENT_CONFIG.speedIncreasePerKm;

    // Max speed cap
    this.maxDisplaySpeed = SEGMENT_CONFIG.maxSpeed;

    // ========== LINK DISPLAY SPEED TO ACTUAL SPEED ==========
    // Update maxSpeed based on initial display speed
    this.updateActualSpeedFromDisplay();

    // Start with some internal speed (based on the new maxSpeed)
    this.speed = this.maxSpeed * 0.5;

    // ========== BOOST COOLDOWN SYSTEM ==========
    this.boostCooldown = 0; // Time until boost is available again
    this.boostAvailable = false; // Is boost ready to use?
    this.boostCooldownDuration = BOOST_CONFIG.cooldown;
    this.boostEffectDuration = BOOST_CONFIG.duration;
    this.boostMultiplier = BOOST_CONFIG.multiplier; // 1.5 = 50% speed boost

    // Start with boost available after initial delay (3 seconds)
    this.boostCooldown = 3;

    // ========== COLLISION CONFIG ==========
    this.collisionSpeedReduction = COLLISION_CONFIG.speedReduction;
    this.collisionSlowdownDuration = COLLISION_CONFIG.slowdownDuration;

    // Throttle stats updates (don't update every frame)
    this.lastStatsUpdate = 0;
    this.statsUpdateInterval = 500; // Update every 500ms (reduced to improve mobile touch responsiveness)

    // Track last km for speed increase
    this.lastKmMilestone = 0;

    // ========== NOTIFICATION SYSTEM ==========
    this.initNotifications();

    // ========== COUNTDOWN START SEQUENCE ==========
    this.initCountdown();
  }

  /**
   * Updates the actual game speed based on the current display speed.
   * This links the cosmetic km/h display to real car movement.
   *
   * Formula: speedMultiplier = currentDisplaySpeed / referenceDisplaySpeed
   * At 100 km/h → 1.0x speed
   * At 175 km/h → 1.75x speed
   * At 200 km/h → 2.0x speed
   */
  updateActualSpeedFromDisplay() {
    const speedMultiplier = this.currentDisplaySpeed / this.referenceDisplaySpeed;

    // Update max speed based on display speed
    // Uses speedFeelMultiplier for better visual speed perception
    this.maxSpeed = this.speedFeelMultiplier * this.baseSpeedUnit * speedMultiplier;

    // Also scale acceleration and deceleration for responsive feel
    this.accel = 8 * this.baseSpeedUnit * speedMultiplier;
    this.decel = 12 * this.baseSpeedUnit * speedMultiplier;
  }

  initCountdown() {
    this.countdownActive = true;
    this.countdownTime = 0;
    this.countdownPhase = 0; // 0=3, 1=2, 2=1, 3=GO!, 4=done
    this.countdownPhaseDuration = 0.8; // seconds per phase

    // Car starts stationary during countdown
    this.speed = 0;

    // Create countdown graphics layer (on top of everything)
    this.countdownGraphics = this.add.graphics();
    this.countdownGraphics.setDepth(200);

    // Create countdown text
    this.countdownText = this.add.text(this.width / 2, this.height * 0.35, '3', {
      fontSize: '120px',
      fontFamily: 'Arial Black, Impact, sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 8,
    });
    this.countdownText.setOrigin(0.5);
    this.countdownText.setDepth(201);
  }

  updateCountdown(dt) {
    this.countdownTime += dt;

    // Check for phase transitions
    const newPhase = Math.floor(this.countdownTime / this.countdownPhaseDuration);

    if (newPhase !== this.countdownPhase && newPhase <= 4) {
      this.countdownPhase = newPhase;

      // Update text for each phase
      if (this.countdownPhase === 0) {
        this.countdownText.setText('3');
        this.countdownText.setColor('#ff4444'); // Red
      } else if (this.countdownPhase === 1) {
        this.countdownText.setText('2');
        this.countdownText.setColor('#ffaa00'); // Orange
      } else if (this.countdownPhase === 2) {
        this.countdownText.setText('1');
        this.countdownText.setColor('#ffff00'); // Yellow
      } else if (this.countdownPhase === 3) {
        this.countdownText.setText('GO!');
        this.countdownText.setColor('#44ff44'); // Green
        this.countdownText.setFontSize(100);
      } else if (this.countdownPhase === 4) {
        // Countdown complete - start racing!
        this.countdownActive = false;
        this.countdownText.setVisible(false);
        this.countdownGraphics.setVisible(false);

        // Start with initial speed
        this.speed = this.maxSpeed * 0.5;
      }
    }
  }

  drawCountdown() {
    if (!this.countdownActive) return;

    this.countdownGraphics.clear();

    const cx = this.width / 2;
    const cy = this.height * 0.35;

    // Draw traffic light board (like reference image)
    const boardWidth = 280;
    const boardHeight = 100;
    const boardX = cx - boardWidth / 2;
    const boardY = cy - boardHeight / 2 - 20;

    // Support poles
    this.countdownGraphics.fillStyle(0x4a3728, 1);
    this.countdownGraphics.fillRect(cx - 60, 0, 12, boardY);
    this.countdownGraphics.fillRect(cx + 48, 0, 12, boardY);

    // Main board
    this.countdownGraphics.fillStyle(0x3d2817, 1);
    this.countdownGraphics.fillRoundedRect(boardX, boardY, boardWidth, boardHeight, 8);

    // Board border
    this.countdownGraphics.lineStyle(4, 0x2a1a0f, 1);
    this.countdownGraphics.strokeRoundedRect(boardX, boardY, boardWidth, boardHeight, 8);

    // Corner bolts
    const boltSize = 8;
    this.countdownGraphics.fillStyle(0x5a4a3a, 1);
    this.countdownGraphics.fillCircle(boardX + 15, boardY + 15, boltSize);
    this.countdownGraphics.fillCircle(boardX + boardWidth - 15, boardY + 15, boltSize);
    this.countdownGraphics.fillCircle(boardX + 15, boardY + boardHeight - 15, boltSize);
    this.countdownGraphics.fillCircle(boardX + boardWidth - 15, boardY + boardHeight - 15, boltSize);

    // Three light positions
    const lightRadius = 30;
    const lightY = boardY + boardHeight / 2;
    const lightSpacing = 75;

    // Light 3 (left) - Red when phase 0
    this.drawCountdownLight(cx - lightSpacing, lightY, lightRadius, this.countdownPhase === 0 ? 0xff4444 : 0x331111);

    // Light 2 (middle) - Orange when phase 1
    this.drawCountdownLight(cx, lightY, lightRadius, this.countdownPhase === 1 ? 0xffaa00 : 0x332200);

    // Light 1 (right) - Green when phase 2 or 3
    this.drawCountdownLight(cx + lightSpacing, lightY, lightRadius, (this.countdownPhase >= 2) ? 0x44ff44 : 0x113311);

    // Animate the current countdown number (pulse effect)
    const phaseProgress = (this.countdownTime % this.countdownPhaseDuration) / this.countdownPhaseDuration;
    const scale = 1 + Math.sin(phaseProgress * Math.PI) * 0.15;
    this.countdownText.setScale(scale);
    this.countdownText.setPosition(cx, cy + 80);
  }

  drawCountdownLight(x, y, radius, color) {
    // Outer ring (darker)
    this.countdownGraphics.fillStyle(0x1a1a1a, 1);
    this.countdownGraphics.fillCircle(x, y, radius + 4);

    // Inner glow
    this.countdownGraphics.fillStyle(color, 1);
    this.countdownGraphics.fillCircle(x, y, radius);

    // Highlight (top-left)
    if (color !== 0x331111 && color !== 0x332200 && color !== 0x113311) {
      // Only add glow for active lights
      this.countdownGraphics.fillStyle(0xffffff, 0.3);
      this.countdownGraphics.fillCircle(x - radius * 0.3, y - radius * 0.3, radius * 0.4);
    }
  }

  initNotifications() {
    // Cloud notification state (sky area - branding messages with zoom effect)
    this.cloudMessage = null;           // Current cloud message text
    this.cloudActive = false;           // Is cloud currently animating?
    this.cloudProgress = 0;             // Animation progress 0-1
    this.cloudDirection = 1;            // 1 = left-to-right, -1 = right-to-left
    this.cloudAnimDuration = NOTIFICATION_CONFIG.clouds.animationDuration;
    this.cloudInterval = NOTIFICATION_CONFIG.clouds.interval;
    this.cloudEnabled = NOTIFICATION_CONFIG.clouds.enabled;
    this.cloudTimer = 6000;             // First cloud after countdown + 3 seconds

    // Billboard notification state (grass area) - DISABLED FOR NOW
    this.billboardEnabled = NOTIFICATION_CONFIG.billboards.enabled;

    // Overhead banner state - DISABLED FOR NOW
    this.bannerEnabled = NOTIFICATION_CONFIG.banners.enabled;
  }

  buildTrack() {
    this.segments = [];

    // Build enough segments to match the configured distance
    // We use a fixed number for visual rendering, but trackLength is scaled by distance
    const totalSegments = 500; // Enough for visual variety
    for (let i = 0; i < totalSegments; i++) {
      this.segments.push({
        index: i,
        curve: 0,  // All straight, no curves
        color: Math.floor(i / this.rumbleLength) % 2,
      });
    }

    // TrackLength is set in create() after we know the segment distance
    this.trackLength = this.segments.length * this.segmentLength;
  }

  placeCars() {
    this.cars = [];
    const colors = [0x3388FF, 0x33CC33, 0xFFAA00, 0xCC3333, 0x9933CC, 0xFF6699, 0x00CCCC, 0xFF9933];

    // Calculate finish zone - last 15% of track has reduced traffic
    const finishZoneStart = this.trackLength * 0.85;

    // ========== RANDOMIZED TRAFFIC PLACEMENT ==========
    // Alternate sides for fair zig-zag, but randomize positions within lanes
    const totalCars = 10 + Math.floor(Math.random() * 4); // 10-13 cars (random count)
    let currentSide = Math.random() > 0.5 ? 1 : -1; // Random starting side

    for (let i = 0; i < totalCars; i++) {
      // Strictly alternate sides for guaranteed zig-zag
      currentSide = -currentSide;

      // Random chance for oncoming (20-30%)
      const goingOpposite = Math.random() < 0.25;

      let carSpeed;
      let laneX;

      // Traffic speed multiplier based on segment (higher segments = faster traffic)
      const trafficMultiplier = SEGMENT_CONFIG.trafficSpeed[this.segmentIndex] || 0.3;

      if (goingOpposite) {
        // Oncoming traffic - randomized speed and position within lane
        // Base: 20-35% speed, scaled by segment multiplier
        carSpeed = -this.maxSpeed * (0.20 + Math.random() * 0.15) * (1 + trafficMultiplier);
        laneX = currentSide * (0.45 + Math.random() * 0.2); // 0.45-0.65 range
      } else {
        // Same direction traffic - randomized speed and position
        // Base: 5-13% speed, scaled by segment multiplier
        carSpeed = this.maxSpeed * (0.05 + Math.random() * 0.08) * (1 + trafficMultiplier);
        laneX = currentSide * (0.4 + Math.random() * 0.25); // 0.4-0.65 range
      }

      // Spread cars across track with RANDOM offset (±25% of spacing)
      const startZ = 60 * this.segmentLength;
      const endZ = finishZoneStart - 50 * this.segmentLength;
      const zRange = endZ - startZ;
      const zSpacing = zRange / totalCars;

      // Add randomness to Z position (base + random offset)
      const randomOffset = (Math.random() - 0.5) * zSpacing * 0.5; // ±25% of spacing
      const carZ = startZ + i * zSpacing + zSpacing * 0.3 + randomOffset;

      this.cars.push({
        z: carZ,
        x: laneX,
        speed: carSpeed,
        color: colors[Math.floor(Math.random() * colors.length)], // Random color
        opposite: goingOpposite,
      });
    }

    // Place static obstacles (holes and barricades)
    this.placeObstacles();

    // Place overhead gantry signs
    this.placeGantrySigns();
  }

  placeObstacles() {
    this.obstacles = [];

    // Calculate finish zone - no obstacles in last 5% (very close to finish)
    const finishZoneStart = this.trackLength * 0.95;

    // ========== RANDOMIZED OBSTACLE PLACEMENT ==========
    // Random count that increases with segment difficulty
    const baseObstacles = 10 + this.segmentIndex * 2; // 10, 12, 14 base
    const totalObstacles = baseObstacles + Math.floor(Math.random() * 3); // +0-2 random

    // Random starting side
    let currentSide = Math.random() > 0.5 ? 1 : -1;

    // Spread obstacles from 10% to 95% of track
    const startZ = this.trackLength * 0.10;
    const endZ = finishZoneStart;
    const zRange = endZ - startZ;
    const spacing = zRange / totalObstacles;

    // Obstacle types pool - based on segment index from config
    const obstacleTypes = SEGMENT_CONFIG.obstacles[this.segmentIndex] || ['hole', 'barricade'];

    for (let i = 0; i < totalObstacles; i++) {
      // Strictly alternate sides for fair zig-zag gameplay
      currentSide = -currentSide;

      // Add randomness to Z position (±20% of spacing)
      const randomZOffset = (Math.random() - 0.5) * spacing * 0.4;
      const z = startZ + i * spacing + spacing * 0.5 + randomZOffset;

      // Randomize X position within the lane (0.4-0.6 range)
      const lanePosition = currentSide * (0.4 + Math.random() * 0.2);

      // Random obstacle type
      const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];

      // Slightly randomized width (0.45-0.6) - original working values
      const width = 0.45 + Math.random() * 0.15;

      this.obstacles.push({
        type: type,
        z: z,
        x: lanePosition,
        side: currentSide,
        width: width,
      });
    }

    // Sort by z position for proper rendering
    this.obstacles.sort((a, b) => a.z - b.z);
  }

  placeGantrySigns() {
    this.gantrySigns = [];

    if (!NOTIFICATION_CONFIG.gantry.enabled) return;

    const numSigns = NOTIFICATION_CONFIG.gantry.signsPerSegment; // 3 signs per segment

    // Spread signs evenly from 15% to 85% of track
    const startZ = this.trackLength * 0.15;
    const endZ = this.trackLength * 0.85;
    const zRange = endZ - startZ;
    const spacing = zRange / (numSigns - 1);

    for (let i = 0; i < numSigns; i++) {
      const z = startZ + i * spacing;

      // Calculate remaining distance at this sign position
      const progressAtSign = z / this.trackLength;
      const remainingKm = this.segmentDistanceKm * (1 - progressAtSign);

      // Get sign content (alternates between destination and event)
      const content = getGantrySignContent(i, this.segmentDistanceKm, remainingKm);

      this.gantrySigns.push({
        z: z,
        content: content,
        index: i,
      });
    }
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.1);

    // ========== COUNTDOWN SEQUENCE ==========
    if (this.countdownActive) {
      this.updateCountdown(dt);
      this.render(); // Still render the scene during countdown
      this.drawCountdown();
      return; // Don't update game logic during countdown
    }

    // Check if race should be completed (before updating elapsed time)
    const progress = (this.playerZ / this.trackLength) * 100;
    if (progress >= 100 && !this.completed) {
      this.completed = true;
      this.victoryMode = true;
      this.victoryTimer = 0;
      this.onProgress(100); // Ensure progress is reported as 100% to stop timer
      // Pass stats: time, hits, boostsUsed, boostsAvailable
      this.onComplete(this.elapsedTime, this.obstaclesHit, this.boostsUsed, this.boostsAvailable);
      // Continue to render and move for victory sequence
    }

    // Victory mode - slow down and stop after 1.5 seconds
    if (this.victoryMode) {
      this.victoryTimer += dt;

      // Gradually slow down over 1.5 seconds
      if (this.victoryTimer < 1.5) {
        // Continue moving but gradually slow down
        const slowdownFactor = 1 - (this.victoryTimer / 1.5);
        this.playerZ += this.speed * slowdownFactor * dt * 0.3;
      } else if (!this.victoryStopped) {
        // Fully stopped - center the car
        this.victoryStopped = true;
        this.playerX = 0; // Center the car
      }

      // Keep rendering during victory (with obstacles/traffic hidden)
      this.renderVictory();
      this.drawVictoryScene();
      return; // Skip normal game logic
    }

    // Only update elapsed time if race is not completed
    if (!this.completed) {
      this.elapsedTime += dt;
    }

    // ========== BOOST COOLDOWN SYSTEM ==========
    if (!this.boostAvailable && !this.boosting) {
      this.boostCooldown -= dt;
      if (this.boostCooldown <= 0) {
        this.boostAvailable = true;
        this.boostsAvailable++;  // Track how many boost opportunities appeared
        this.onBoostReady(true); // Notify UI that boost is ready
      }
    }

    // Input - keyboard overrides external steer only when pressed
    if (this.cursors.left.isDown) this.steerDirection = -1;
    else if (this.cursors.right.isDown) this.steerDirection = 1;
    // Note: external steer() calls set steerDirection directly, so if no key is pressed,
    // the external value persists (which is what we want for tilt controls)

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.activateBoost();
    }

    // Calculate speed
    let targetSpeed = this.maxSpeed;

    // Vehicle/road modifiers
    const vehicle = VEHICLES[this.vehicleId];
    const roadData = ROAD_TYPES[this.roadType];
    if (vehicle && roadData) {
      targetSpeed *= (vehicle.speedOnRoad[this.roadType] || 1.0);
      targetSpeed *= (roadData.baseSpeed || 1.0);
    }

    // Boost - temporary speed increase (uses config multiplier)
    if (this.boosting) {
      targetSpeed *= this.boostMultiplier;
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) {
        this.boosting = false;
        // Start cooldown after boost ends
        this.boostCooldown = this.boostCooldownDuration;
        this.boostAvailable = false;
        this.onBoostReady(false);
      }
    }

    // Hit slowdown - uses config values
    if (this.isHit) {
      targetSpeed *= this.collisionSpeedReduction;
      this.hitTimer -= dt;
      if (this.hitTimer <= 0) this.isHit = false;
    }

    // Off-road slowdown
    if (Math.abs(this.playerX) > 1) {
      targetSpeed *= 0.5;
    }

    // Accelerate/decelerate
    if (this.speed < targetSpeed) {
      this.speed = Math.min(targetSpeed, this.speed + this.accel * dt);
    } else {
      this.speed = Math.max(targetSpeed * 0.5, this.speed - this.decel * dt);
    }

    // Move forward
    this.playerZ += this.speed * dt;

    // DON'T wrap track - segment ends when we reach trackLength
    // (removed wrap logic to allow segment completion)

    // Steering - playerX ranges from -3.0 to 3.0 (3x range for much more movement)
    // Minimum speed factor ensures steering works even at low speeds (mobile fix)
    const speedPct = Math.max(0.5, this.speed / this.maxSpeed);
    this.playerX += this.steerDirection * 10.0 * dt * speedPct; // Increased from 8.0 to 10.0

    // Clamp to road bounds - allow car to move much further left/right
    this.playerX = Phaser.Math.Clamp(this.playerX, -3.0, 3.0);

    // Update traffic - cars move but DON'T wrap (finite track)
    for (const car of this.cars) {
      // Car's absolute position change
      car.z += car.speed * dt;

      // NO wrap-around - cars that go off track just stay off
      // This prevents phantom collisions from wrapped cars
    }

    // Collisions
    this.checkCollisions();

    // Stats updates - throttled to avoid fuzzy display
    // Note: 'progress' is already calculated at top of update()
    const now = Date.now();
    if (now - this.lastStatsUpdate >= this.statsUpdateInterval) {
      this.lastStatsUpdate = now;

      this.onProgress(Math.min(100, Math.floor(progress)));

      // Calculate distance traveled - cap at segment distance (don't show 5.2 when max is 5)
      const distanceKm = Math.min(
        this.segmentDistanceKm,
        (this.playerZ / this.trackLength) * this.segmentDistanceKm
      );

      // ========== SPEED PROGRESSION ==========
      // Speed increases every 1 km traveled
      const currentKm = Math.floor(distanceKm);
      if (currentKm > this.lastKmMilestone) {
        // Increase speed for each new km
        const kmGained = currentKm - this.lastKmMilestone;
        this.currentDisplaySpeed = Math.min(
          this.maxDisplaySpeed,
          this.currentDisplaySpeed + (kmGained * this.speedIncreasePerKm)
        );
        this.lastKmMilestone = currentKm;

        // ========== UPDATE ACTUAL SPEED TO MATCH DISPLAY ==========
        // This makes the car actually go faster as display speed increases!
        this.updateActualSpeedFromDisplay();
      }

      // Calculate display speed (base * boost multiplier if active)
      let displaySpeed = this.currentDisplaySpeed;
      if (this.boosting) {
        displaySpeed = Math.floor(displaySpeed * this.boostMultiplier);
      }
      // Reduce display speed if hit
      if (this.isHit) {
        displaySpeed = Math.floor(displaySpeed * this.collisionSpeedReduction);
      }

      this.onStats({
        speed: displaySpeed,
        distance: distanceKm,
        totalDistance: this.segmentDistanceKm
      });
    }

    // Note: Completion check moved to top of update() to stop timer immediately

    // Update notifications
    this.updateNotifications(dt);

    // Render
    this.render();
  }

  checkCollisions() {
    // Skip collision checks during victory mode
    if (this.victoryMode || this.completed) return;

    // ========== COORDINATE SYSTEM FIX ==========
    // playerX ranges from -3.0 to 3.0 (screen movement)
    // car.x and obstacle.x range from -1.0 to 1.0 (lane position)
    // We need to normalize playerX to the same scale for collision detection
    // playerX / 3.0 gives us a value from -1.0 to 1.0
    const normalizedPlayerX = this.playerX / 3.0;

    // Get current progress percentage for boundary checks
    const progressPercent = (this.playerZ / this.trackLength) * 100;

    for (const car of this.cars) {
      // Calculate distance in front of player (positive = ahead of us)
      // NO wrap-around - track is finite with a finish line
      const dz = car.z - this.playerZ;

      // Skip cars that are far behind or far ahead (outside reasonable range)
      if (dz < -500 || dz > this.trackLength * 0.5) continue;

      // Z collision: car must be within 200 units ahead or 80 behind
      // X collision: compare normalized positions with tolerance for car width
      const zCollision = dz > -80 && dz < 200;
      const xCollision = Math.abs(car.x - normalizedPlayerX) < 0.35; // ~35% of lane width

      if (zCollision && xCollision && !this.isHit) {
        this.isHit = true;
        this.hitTimer = this.collisionSlowdownDuration;  // From config
        this.obstaclesHit++;
        this.speed *= this.collisionSpeedReduction;  // From config
        this.cameras.main.shake(400, 0.03);
        this.onObstacleHit();

        // Push the traffic car away to prevent repeated collisions
        car.z += 300;
      }
    }

    // Check obstacle collisions (holes and barricades)
    if (this.obstacles) {
      for (const obstacle of this.obstacles) {
        // NO wrap-around - track is finite with a finish line
        const dz = obstacle.z - this.playerZ;

        // Skip obstacles that are far behind or far ahead
        if (dz < -500 || dz > this.trackLength * 0.5) continue;

        // Z collision detection
        const zCollision = dz > -50 && dz < 150;

        // X collision: obstacle.x is lane position (-0.5 or 0.5)
        // obstacle.width is how much of the road it blocks (0.6 = 60% of half-road)
        // Use normalized playerX for comparison
        const xCollision = Math.abs(obstacle.x - normalizedPlayerX) < obstacle.width;

        if (zCollision && xCollision && !this.isHit) {
          this.isHit = true;
          this.hitTimer = this.collisionSlowdownDuration;
          this.obstaclesHit++;
          this.speed *= this.collisionSpeedReduction;
          this.cameras.main.shake(400, 0.03);
          this.onObstacleHit();

          // Move obstacle behind player to prevent repeated hits
          obstacle.z = this.playerZ - 500;
        }
      }
    }
  }

  render() {
    this.bgGraphics.clear();
    this.roadGraphics.clear();
    this.spriteGraphics.clear();

    const baseSegmentIndex = Math.floor(this.playerZ / this.segmentLength);
    const basePercent = (this.playerZ % this.segmentLength) / this.segmentLength;

    // Horizon line - lower to show more road
    const horizon = this.height * 0.35;

    // Draw sky
    this.bgGraphics.fillGradientStyle(0x72D7EE, 0x72D7EE, 0x87CEEB, 0x87CEEB, 1);
    this.bgGraphics.fillRect(0, 0, this.width, horizon);

    // Draw base grass below horizon
    this.bgGraphics.fillStyle(0x10AA10, 1);
    this.bgGraphics.fillRect(0, horizon, this.width, this.height - horizon);

    // Calculate road projection - road SHIFTS based on player steering
    const maxy = this.height;

    // Store projected segments for drawing
    const lines = [];

    // Finish LINE (thin stripe) starts at 98% and ends at 100%
    // This creates a classic racing finish line, not a checkered road
    const finishLineStart = this.trackLength * 0.98;
    const finishLineEnd = this.trackLength * 1.0;

    for (let n = 0; n < this.drawDistance; n++) {
      const segIndex = (baseSegmentIndex + n) % this.segments.length;
      const seg = this.segments[segIndex];

      // Calculate perspective
      const camDist = (n - basePercent) * this.segmentLength;
      if (camDist <= 0) continue;

      const scale = this.fieldOfView / camDist;
      const y = horizon + (scale * this.cameraHeight);

      if (y >= maxy) continue;
      if (y < horizon - 10) continue;

      // Road shifts slightly for parallax effect (car moves, road stays mostly stable)
      // Very small shift to give slight perspective feel without dragging road edges
      const roadShift = -this.playerX * scale * this.roadWidth * 0.02;
      const w = scale * this.roadWidth;

      // Check if this segment is ON the finish line (thin stripe, not whole zone)
      const segmentZ = this.playerZ + camDist;
      const isFinishLine = segmentZ >= finishLineStart && segmentZ <= finishLineEnd;

      lines.push({
        y: y,
        x: this.width / 2 + roadShift,
        w: w,
        scale: scale,
        color: seg.color,
        segIndex: segIndex,
        camDist: camDist,
        isFinishLine: isFinishLine,
      });
    }

    // Draw from far to near (reverse order)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const prev = i < lines.length - 1 ? lines[i + 1] : null;

      if (!prev) continue;

      this.drawRoadLine(line, prev, line.isFinishLine);
    }

    // Draw the closest road segment extending to the bottom of screen
    if (lines.length > 0) {
      const closest = lines[0];
      // Bottom line shifts very slightly for parallax (car moves instead)
      const bottomShift = -this.playerX * this.roadWidth * 0.01;
      const bottomLine = {
        y: this.height,
        x: this.width / 2 + bottomShift,
        w: closest.w * 1.5,
        color: closest.color,
      };
      this.drawRoadLine(closest, bottomLine, closest.isFinishLine);
    }

    // Draw obstacles (holes, barricades) - behind traffic
    this.drawObstacles(lines);

    // Reset all notification/sign text visibility BEFORE drawing them
    this.hideNotificationTexts();

    // Draw overhead gantry signs (highway signs spanning the road)
    this.drawGantrySigns(lines);

    // Draw traffic cars
    this.drawTraffic(lines);

    // Draw notifications (billboards on grass, banners overhead)
    this.drawBillboardNotification(lines);
    this.drawBannerNotification(lines);

    // Draw player car
    this.drawPlayerCar();

    // Draw cloud notification (on top of everything in sky)
    this.drawCloudNotification();
  }

  // Victory render - same as render() but without traffic, obstacles, barricades
  renderVictory() {
    this.bgGraphics.clear();
    this.roadGraphics.clear();
    this.spriteGraphics.clear();

    const horizon = this.height * 0.4;
    const baseSegmentIndex = Math.floor(this.playerZ / this.segmentLength) % this.segments.length;
    const basePercent = (this.playerZ % this.segmentLength) / this.segmentLength;

    // Draw sky
    this.bgGraphics.fillGradientStyle(0x72D7EE, 0x72D7EE, 0x87CEEB, 0x87CEEB, 1);
    this.bgGraphics.fillRect(0, 0, this.width, horizon);

    // Draw base grass below horizon
    this.bgGraphics.fillStyle(0x10AA10, 1);
    this.bgGraphics.fillRect(0, horizon, this.width, this.height - horizon);

    const maxy = this.height;
    const lines = [];
    const finishLineStart = this.trackLength * 0.98;
    const finishLineEnd = this.trackLength * 1.0;

    for (let n = 0; n < this.drawDistance; n++) {
      const segIndex = (baseSegmentIndex + n) % this.segments.length;
      const seg = this.segments[segIndex];
      const camDist = (n - basePercent) * this.segmentLength;
      if (camDist <= 0) continue;

      const scale = this.fieldOfView / camDist;
      const y = horizon + (scale * this.cameraHeight);

      if (y >= maxy) continue;
      if (y < horizon - 10) continue;

      const roadShift = -this.playerX * scale * this.roadWidth * 0.02;
      const w = scale * this.roadWidth;
      const segmentZ = this.playerZ + camDist;
      const isFinishLine = segmentZ >= finishLineStart && segmentZ <= finishLineEnd;

      lines.push({
        y: y, x: this.width / 2 + roadShift, w: w, scale: scale,
        color: seg.color, segIndex: segIndex, camDist: camDist, isFinishLine: isFinishLine,
      });
    }

    // Draw road from far to near
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const prev = i < lines.length - 1 ? lines[i + 1] : null;
      if (!prev) continue;
      this.drawRoadLine(line, prev, line.isFinishLine);
    }

    // Draw closest segment
    if (lines.length > 0) {
      const closest = lines[0];
      const bottomShift = -this.playerX * this.roadWidth * 0.01;
      const bottomLine = {
        y: this.height, x: this.width / 2 + bottomShift,
        w: closest.w * 1.5, color: closest.color,
      };
      this.drawRoadLine(closest, bottomLine, closest.isFinishLine);
    }

    // NO obstacles, NO traffic in victory mode

    // Reset text visibility
    this.hideNotificationTexts();

    // Draw overhead gantry signs (keep these visible)
    this.drawGantrySigns(lines);

    // Draw player car
    this.drawPlayerCar();
  }

  drawRoadLine(line, prev, isFinishLine = false) {
    const roadData = ROAD_TYPES[this.roadType];
    const roadColorHex = roadData?.color || '#696969';
    const roadColor = Phaser.Display.Color.HexStringToColor(roadColorHex).color;

    const isLight = line.color === 0;
    const grassColor = isLight ? 0x10AA10 : 0x009A00;
    const rumbleColor = isLight ? 0xFFFFFF : 0xDD0000;

    // Grass strip
    this.roadGraphics.fillStyle(grassColor, 1);
    this.roadGraphics.fillRect(0, line.y, this.width, prev.y - line.y);

    // Road trapezoid
    this.roadGraphics.fillStyle(roadColor, 1);
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(line.x - line.w, line.y);
    this.roadGraphics.lineTo(line.x + line.w, line.y);
    this.roadGraphics.lineTo(prev.x + prev.w, prev.y);
    this.roadGraphics.lineTo(prev.x - prev.w, prev.y);
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();

    // Rumble strips
    const rumbleW1 = line.w * 0.08;
    const rumbleW2 = prev.w * 0.08;

    this.roadGraphics.fillStyle(rumbleColor, 1);

    // Left rumble
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(line.x - line.w - rumbleW1, line.y);
    this.roadGraphics.lineTo(line.x - line.w, line.y);
    this.roadGraphics.lineTo(prev.x - prev.w, prev.y);
    this.roadGraphics.lineTo(prev.x - prev.w - rumbleW2, prev.y);
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();

    // Right rumble
    this.roadGraphics.beginPath();
    this.roadGraphics.moveTo(line.x + line.w, line.y);
    this.roadGraphics.lineTo(line.x + line.w + rumbleW1, line.y);
    this.roadGraphics.lineTo(prev.x + prev.w + rumbleW2, prev.y);
    this.roadGraphics.lineTo(prev.x + prev.w, prev.y);
    this.roadGraphics.closePath();
    this.roadGraphics.fillPath();

    // Lane markings (on light segments only) - unless on finish line
    if (isLight && line.w > 20 && !isFinishLine) {
      this.roadGraphics.fillStyle(0xFFFFFF, 1);
      const dashW1 = Math.max(2, line.w * 0.015);
      const dashW2 = Math.max(2, prev.w * 0.015);

      this.roadGraphics.beginPath();
      this.roadGraphics.moveTo(line.x - dashW1, line.y);
      this.roadGraphics.lineTo(line.x + dashW1, line.y);
      this.roadGraphics.lineTo(prev.x + dashW2, prev.y);
      this.roadGraphics.lineTo(prev.x - dashW2, prev.y);
      this.roadGraphics.closePath();
      this.roadGraphics.fillPath();
    }

    // Checkered finish line pattern (thin stripe at 98-100% of track)
    if (isFinishLine && line.w > 15) {
      const numSquares = 8; // Number of squares across the road
      const squareW1 = (line.w * 2) / numSquares;
      const squareW2 = (prev.w * 2) / numSquares;

      for (let i = 0; i < numSquares; i++) {
        // Alternate black and white
        const isWhite = (i + (isLight ? 0 : 1)) % 2 === 0;
        this.roadGraphics.fillStyle(isWhite ? 0xFFFFFF : 0x000000, 1);

        const x1Left = line.x - line.w + i * squareW1;
        const x1Right = x1Left + squareW1;
        const x2Left = prev.x - prev.w + i * squareW2;
        const x2Right = x2Left + squareW2;

        this.roadGraphics.beginPath();
        this.roadGraphics.moveTo(x1Left, line.y);
        this.roadGraphics.lineTo(x1Right, line.y);
        this.roadGraphics.lineTo(x2Right, prev.y);
        this.roadGraphics.lineTo(x2Left, prev.y);
        this.roadGraphics.closePath();
        this.roadGraphics.fillPath();
      }
    }
  }

  drawTraffic(lines) {
    // Get cars in view and sort by distance
    const visibleCars = [];

    for (const car of this.cars) {
      let dz = car.z - this.playerZ;
      if (dz < 0) dz += this.trackLength;

      if (dz > 0 && dz < this.drawDistance * this.segmentLength) {
        visibleCars.push({ ...car, dz });
      }
    }

    // Sort far to near
    visibleCars.sort((a, b) => b.dz - a.dz);

    for (const car of visibleCars) {
      // Find the road line closest to this car's distance
      const carSegDist = car.dz / this.segmentLength;

      // Find matching line
      let line = null;
      for (const l of lines) {
        const lDist = l.camDist / this.segmentLength;
        if (Math.abs(lDist - carSegDist) < 1) {
          line = l;
          break;
        }
      }

      if (!line) continue;

      // Position car on road - car.x is lane position, line.w is road half-width
      const carScreenX = line.x + car.x * line.w * 0.8;
      const carScreenY = line.y;

      // Scale car size - REAR VIEW (wider than tall)
      const carW = Math.max(12, line.scale * 600);  // Wider for rear view
      const carH = Math.max(8, line.scale * 350);   // Shorter height

      if (carW < 6) continue;

      // Draw car shadow
      this.spriteGraphics.fillStyle(0x000000, 0.3);
      this.spriteGraphics.fillEllipse(carScreenX, carScreenY + 2, carW * 1.1, carH * 0.3);

      // Main body (rear view - wide rectangle)
      this.spriteGraphics.fillStyle(car.color, 1);
      this.spriteGraphics.fillRoundedRect(
        carScreenX - carW / 2,
        carScreenY - carH,
        carW, carH,
        Math.max(2, carW * 0.08)
      );

      // Roof/cabin (darker, on top)
      if (carW > 10) {
        const roofColor = Phaser.Display.Color.ValueToColor(car.color);
        roofColor.darken(15);
        this.spriteGraphics.fillStyle(roofColor.color, 1);
        const roofH = Math.max(4, carH * 0.5);
        this.spriteGraphics.fillRoundedRect(
          carScreenX - carW * 0.35,
          carScreenY - carH - roofH,
          carW * 0.7,
          roofH,
          Math.max(1, carW * 0.05)
        );

        // Rear window
        this.spriteGraphics.fillStyle(0x88CCFF, 1);
        this.spriteGraphics.fillRect(
          carScreenX - carW * 0.28,
          carScreenY - carH - roofH + 2,
          carW * 0.56,
          roofH * 0.6
        );
      }

      // Rear lights (left and right)
      if (carW > 8) {
        this.spriteGraphics.fillStyle(0xFF3333, 1);
        const lightW = Math.max(2, carW * 0.12);
        const lightH = Math.max(2, carH * 0.15);
        this.spriteGraphics.fillRect(carScreenX - carW / 2 + 2, carScreenY - carH + 2, lightW, lightH);
        this.spriteGraphics.fillRect(carScreenX + carW / 2 - lightW - 2, carScreenY - carH + 2, lightW, lightH);
      }

      // Rear wheels (visible from behind)
      if (carW > 8) {
        this.spriteGraphics.fillStyle(0x111111, 1);
        const wheelW = Math.max(2, carW * 0.1);
        const wheelH = Math.max(3, carH * 0.35);
        // Left wheel
        this.spriteGraphics.fillRect(carScreenX - carW / 2 - 1, carScreenY - wheelH - 2, wheelW, wheelH);
        // Right wheel
        this.spriteGraphics.fillRect(carScreenX + carW / 2 - wheelW + 1, carScreenY - wheelH - 2, wheelW, wheelH);
      }
    }
  }

  drawObstacles(lines) {
    if (!this.obstacles) return;

    for (const obstacle of this.obstacles) {
      let dz = obstacle.z - this.playerZ;
      if (dz < 0) dz += this.trackLength;

      // Only draw if in view
      if (dz <= 0 || dz > this.drawDistance * this.segmentLength) continue;

      // Find matching road line for perspective
      const obstacleSegDist = dz / this.segmentLength;
      let line = null;
      for (const l of lines) {
        const lDist = l.camDist / this.segmentLength;
        if (Math.abs(lDist - obstacleSegDist) < 1) {
          line = l;
          break;
        }
      }

      if (!line) continue;

      // Position on road
      const screenX = line.x + obstacle.x * line.w * 0.8;
      const screenY = line.y;
      const scale = line.scale;

      if (obstacle.type === 'hole') {
        this.drawHole(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'barricade') {
        this.drawBarricade(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'hole_large') {
        this.drawHoleLarge(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'oil_barrel') {
        this.drawOilBarrel(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'debris') {
        this.drawDebris(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'tire_stack') {
        this.drawTireStack(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'cone_cluster') {
        this.drawConeCluster(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'broken_crate') {
        this.drawBrokenCrate(screenX, screenY, scale, obstacle.side);
      } else if (obstacle.type === 'construction_barrier') {
        this.drawConstructionBarrier(screenX, screenY, scale, obstacle.side);
      }
    }
  }

  drawGantrySigns(lines) {
    if (!this.gantrySigns || !NOTIFICATION_CONFIG.gantry.enabled) return;

    for (const sign of this.gantrySigns) {
      let dz = sign.z - this.playerZ;
      if (dz < 0) dz += this.trackLength;

      // Only draw if in view (and not too close - gantry is overhead)
      if (dz <= 0 || dz > this.drawDistance * this.segmentLength) continue;

      // Find matching road line for perspective
      const signSegDist = dz / this.segmentLength;
      let line = null;
      for (const l of lines) {
        const lDist = l.camDist / this.segmentLength;
        if (Math.abs(lDist - signSegDist) < 1) {
          line = l;
          break;
        }
      }

      if (!line) continue;

      const screenX = line.x; // Center of road
      const screenY = line.y;
      const scale = line.scale;
      const roadW = line.w;

      // Draw the gantry sign based on content type
      if (sign.content.type === 'destination') {
        this.drawDestinationGantry(screenX, screenY, scale, roadW, sign.content);
      } else {
        this.drawEventGantry(screenX, screenY, scale, roadW, sign.content);
      }
    }
  }

  drawDestinationGantry(x, y, scale, roadW, content) {
    // Blue highway-style destination sign
    // y = road position, we build UPWARD from there

    // Size calculations - ALL based on scale for consistency
    const poleH = Math.max(50, scale * 4000);   // Height of poles (from road up)
    const poleW = Math.max(4, scale * 100);     // Width of poles
    const boardW = Math.max(100, scale * 3500); // Board width - SCALE BASED, not roadW!
    const boardH = Math.max(50, scale * 2000);  // Board height - 2X for better visibility

    if (boardW < 50) return; // Too small to render

    // Calculate positions
    const boardBottomY = y - poleH;             // Bottom of board (top of poles)
    const boardTopY = boardBottomY - boardH;    // Top of board

    // Poles at edges of BOARD (not road) - consistent with board width
    const leftPoleX = x - boardW / 2 - poleW;
    const rightPoleX = x + boardW / 2;

    // Draw support poles (gray metal) - from road UP to board
    this.spriteGraphics.fillStyle(0x888888, 1);
    this.spriteGraphics.fillRect(leftPoleX, boardBottomY, poleW, poleH);
    this.spriteGraphics.fillRect(rightPoleX, boardBottomY, poleW, poleH);

    // Horizontal beam at top of poles (under the board)
    this.spriteGraphics.fillStyle(0x666666, 1);
    const beamH = Math.max(4, poleW * 0.8);
    this.spriteGraphics.fillRect(leftPoleX, boardBottomY - beamH, boardW + poleW * 2, beamH);

    // Main sign board (blue background)
    this.spriteGraphics.fillStyle(0x0055AA, 1);
    this.spriteGraphics.fillRoundedRect(
      x - boardW / 2,
      boardTopY,
      boardW,
      boardH,
      Math.max(3, boardW * 0.02)
    );

    // White border
    const borderW = Math.max(2, boardW * 0.015);
    this.spriteGraphics.lineStyle(borderW, 0xFFFFFF, 1);
    this.spriteGraphics.strokeRoundedRect(
      x - boardW / 2 + borderW,
      boardTopY + borderW,
      boardW - borderW * 2,
      boardH - borderW * 2,
      Math.max(2, boardW * 0.02)
    );

    // Draw dual destination text (primary straight, secondary left/right)
    // Upper row: Primary destination with ↑
    const upperY = boardTopY + boardH * 0.35;
    this.drawGantryText(
      x,
      upperY,
      `${content.primary}  ↑`,
      boardW,
      boardH * 0.45,
      'destination'
    );

    // Lower row: Secondary destination with ← or →
    const lowerY = boardTopY + boardH * 0.72;
    const arrow = content.secondaryDir === 'left' ? '←' : '→';
    this.drawGantryText(
      x,
      lowerY,
      `${content.secondary}  ${arrow}`,
      boardW,
      boardH * 0.45,
      'destination-secondary'
    );
  }

  drawEventGantry(x, y, scale, roadW, content) {
    // Now using blue highway style (same as destination) for better text readability
    // Green background for event/sponsor messages to differentiate from destination signs

    // Size calculations - ALL based on scale for consistency
    const poleH = Math.max(50, scale * 4000);
    const poleW = Math.max(4, scale * 100);
    const boardW = Math.max(100, scale * 3500);
    const boardH = Math.max(50, scale * 1800);  // 2X height for better visibility

    if (boardW < 50) return;

    const boardBottomY = y - poleH;
    const boardTopY = boardBottomY - boardH;

    // Poles at edges of BOARD
    const leftPoleX = x - boardW / 2 - poleW;
    const rightPoleX = x + boardW / 2;

    // Draw support poles (gray metal)
    this.spriteGraphics.fillStyle(0x888888, 1);
    this.spriteGraphics.fillRect(leftPoleX, boardBottomY, poleW, poleH);
    this.spriteGraphics.fillRect(rightPoleX, boardBottomY, poleW, poleH);

    // Horizontal beam at top of poles (under the board)
    this.spriteGraphics.fillStyle(0x666666, 1);
    const beamH = Math.max(4, poleW * 0.8);
    this.spriteGraphics.fillRect(leftPoleX, boardBottomY - beamH, boardW + poleW * 2, beamH);

    // Main sign board (green background for events - like highway info signs)
    const bgColor = content.messageType === 'sponsor' ? 0x006644 : 0x007744;
    this.spriteGraphics.fillStyle(bgColor, 1);
    this.spriteGraphics.fillRoundedRect(
      x - boardW / 2,
      boardTopY,
      boardW,
      boardH,
      Math.max(3, boardW * 0.02)
    );

    // White border (same as destination signs)
    const borderW = Math.max(2, boardW * 0.015);
    this.spriteGraphics.lineStyle(borderW, 0xFFFFFF, 1);
    this.spriteGraphics.strokeRoundedRect(
      x - boardW / 2 + borderW,
      boardTopY + borderW,
      boardW - borderW * 2,
      boardH - borderW * 2,
      Math.max(2, boardW * 0.02)
    );

    // Draw text centered on sign
    const textY = boardTopY + boardH / 2;
    this.drawGantryText(
      x,
      textY,
      content.text,
      boardW,
      boardH,
      'event'
    );
  }

  drawGantryText(x, y, text, boardW, boardH, type) {
    // Create or reuse text objects for gantry signs
    if (!this.gantryTexts) {
      this.gantryTexts = [];
    }

    // Only show text if board is large enough to read
    if (boardW < 80 || boardH < 20) return;

    let textObj = this.gantryTexts.find(t => !t.visible);
    if (!textObj) {
      textObj = this.add.text(0, 0, '', {
        fontSize: '16px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#FFFFFF',
        align: 'center',
      });
      textObj.setOrigin(0.5);
      textObj.setDepth(95);
      this.gantryTexts.push(textObj);
    }

    // Style based on type - all use white text now for readability
    if (type === 'destination') {
      // Primary destination - larger, bold white
      textObj.setColor('#FFFFFF');
      textObj.setStroke('#002244', 2);
    } else if (type === 'destination-secondary') {
      // Secondary destination - slightly yellow tint
      textObj.setColor('#FFFF99');
      textObj.setStroke('#002244', 2);
    } else {
      // Event/sponsor messages - white on green background
      textObj.setColor('#FFFFFF');
      textObj.setStroke('#004422', 2);
    }

    // Calculate font size based on board height (larger for 2X boards)
    const fontSize = Math.max(14, Math.min(40, boardH * 0.5));
    textObj.setFontSize(fontSize);
    textObj.setPosition(x, y);
    textObj.setText(text);
    textObj.setVisible(true);

    // Scale text to fit within board width (90% of board)
    const maxTextWidth = boardW * 0.85;
    const naturalWidth = textObj.width;
    if (naturalWidth > maxTextWidth) {
      textObj.setScale(maxTextWidth / naturalWidth);
    } else {
      textObj.setScale(1);
    }
  }

  drawHole(x, y, scale, side) {
    // Pothole - sized to stay within one lane (not crossing center)
    const holeW = Math.max(20, scale * 800);   // Reduced from 1200 to stay in lane
    const holeH = Math.max(10, scale * 300);   // Reduced height proportionally

    if (holeW < 10) return;

    // Danger zone outer ring (red/orange warning)
    this.roadGraphics.fillStyle(0xFF4400, 0.4);
    this.roadGraphics.fillEllipse(x, y, holeW * 1.5, holeH * 1.5);

    // Cracked road around hole (lighter gray)
    this.roadGraphics.fillStyle(0x555555, 0.8);
    this.roadGraphics.fillEllipse(x, y, holeW * 1.3, holeH * 1.3);

    // Outer dark ring (shadow/edge)
    this.roadGraphics.fillStyle(0x333333, 1);
    this.roadGraphics.fillEllipse(x, y, holeW * 1.1, holeH * 1.1);

    // Main hole (very dark)
    this.roadGraphics.fillStyle(0x111111, 1);
    this.roadGraphics.fillEllipse(x, y, holeW, holeH);

    // Inner depth effect (pitch black center)
    this.roadGraphics.fillStyle(0x000000, 1);
    this.roadGraphics.fillEllipse(x, y + holeH * 0.1, holeW * 0.6, holeH * 0.5);

    // Warning marks around hole (yellow/orange stripes)
    if (holeW > 15) {
      // Hazard stripes around the hole
      this.roadGraphics.fillStyle(0xFFAA00, 1);
      const stripeW = Math.max(4, holeW * 0.08);
      // Left warning stripe
      this.roadGraphics.fillRect(x - holeW * 0.75, y - holeH * 0.3, stripeW, holeH * 0.6);
      // Right warning stripe
      this.roadGraphics.fillRect(x + holeW * 0.67, y - holeH * 0.3, stripeW, holeH * 0.6);
      // Top warning stripe
      this.roadGraphics.fillRect(x - holeW * 0.3, y - holeH * 0.7, holeW * 0.6, stripeW);
    }

    // "DANGER" text above hole when large enough
    if (holeW > 35) {
      if (!this.holeWarningTexts) {
        this.holeWarningTexts = [];
      }

      let textObj = this.holeWarningTexts.find(t => !t.visible);
      if (!textObj) {
        textObj = this.add.text(0, 0, '⚠ HOLE', {
          fontSize: '10px',
          fontFamily: 'Arial Black, sans-serif',
          color: '#FFFFFF',
          backgroundColor: '#CC0000',
          padding: { x: 3, y: 2 },
        });
        textObj.setOrigin(0.5);
        textObj.setDepth(100);
        this.holeWarningTexts.push(textObj);
      }

      const fontSize = Math.max(8, Math.min(16, holeW * 0.15));
      textObj.setFontSize(fontSize);
      textObj.setPosition(x, y - holeH * 0.8);
      textObj.setVisible(true);
      textObj.setScale(Math.min(1, scale * 20));
    }
  }

  drawBarricade(x, y, scale, side) {
    // Large construction barricade blocking one lane - LARGER
    const barW = Math.max(25, scale * 1100);   // Even wider
    const barH = Math.max(18, scale * 550);    // Taller

    if (barW < 12) return;

    // Support frame (dark) - wider for visibility
    this.spriteGraphics.fillStyle(0x333333, 1);
    this.spriteGraphics.fillRect(x - barW / 2 - 4, y - barH - 6, barW + 8, barH + 10);

    // Main barricade body with diagonal stripes (orange/white)
    const stripeCount = 8;
    const stripeW = barW / stripeCount;

    for (let i = 0; i < stripeCount; i++) {
      // Alternate orange and white stripes
      this.spriteGraphics.fillStyle(i % 2 === 0 ? 0xFF6600 : 0xFFFFFF, 1);
      this.spriteGraphics.fillRect(
        x - barW / 2 + i * stripeW,
        y - barH,
        stripeW,
        barH
      );
    }

    // Top reflective strip (bright yellow)
    this.spriteGraphics.fillStyle(0xFFEE00, 1);
    this.spriteGraphics.fillRect(x - barW / 2, y - barH - 4, barW, 6);

    // Bottom reflective strip
    this.spriteGraphics.fillStyle(0xFFEE00, 1);
    this.spriteGraphics.fillRect(x - barW / 2, y - 4, barW, 4);

    // "DIVERSION" text on barricade - show at smaller sizes now
    if (barW > 25) {
      if (!this.diversionTexts) {
        this.diversionTexts = [];
      }

      // Create or reuse text object
      let textObj = this.diversionTexts.find(t => !t.visible);
      if (!textObj) {
        textObj = this.add.text(0, 0, '⚠ DIVERSION ⚠', {
          fontSize: '12px',
          fontFamily: 'Arial Black, sans-serif',
          color: '#000000',
          backgroundColor: '#FFEE00',
          padding: { x: 4, y: 2 },
        });
        textObj.setOrigin(0.5);
        textObj.setDepth(100);
        this.diversionTexts.push(textObj);
      }

      const fontSize = Math.max(8, Math.min(18, barW * 0.14));
      textObj.setFontSize(fontSize);
      textObj.setPosition(x, y - barH / 2);
      textObj.setVisible(true);
      textObj.setScale(Math.min(1.2, scale * 18));
    }

    // Support legs (thicker)
    this.spriteGraphics.fillStyle(0x555555, 1);
    const legW = Math.max(5, barW * 0.12);
    const legH = Math.max(8, barH * 0.35);
    this.spriteGraphics.fillRect(x - barW / 3, y - legH, legW, legH);
    this.spriteGraphics.fillRect(x + barW / 3 - legW, y - legH, legW, legH);

    // Subtle warning: reflective dots on yellow strips (like road reflectors)
    // Only show when barricade is close enough to see detail
    if (barW > 30) {
      const dotSize = Math.max(2, barW * 0.025);
      const dotSpacing = barW / 5;

      // Subtle shimmer effect - dots alternate brightness based on time
      const shimmer = Math.sin(this.time.now * 0.005) > 0;
      const dotColor = shimmer ? 0xFFFFFF : 0xFFEE88;

      this.spriteGraphics.fillStyle(dotColor, 0.9);

      // Dots on top yellow strip
      for (let i = 1; i < 5; i++) {
        this.spriteGraphics.fillCircle(
          x - barW / 2 + i * dotSpacing,
          y - barH - 1,
          dotSize
        );
      }

      // Dots on bottom yellow strip
      for (let i = 1; i < 5; i++) {
        this.spriteGraphics.fillCircle(
          x - barW / 2 + i * dotSpacing,
          y - 2,
          dotSize
        );
      }
    }
  }

  // ========== SEGMENT 2 OBSTACLES ==========

  drawHoleLarge(x, y, scale, side) {
    // Larger pothole for Segment 2 - 1.5x bigger than regular hole
    const holeW = Math.max(35, scale * 1800);  // 1.5x wider
    const holeH = Math.max(18, scale * 675);   // 1.5x taller

    if (holeW < 12) return;

    // Danger zone outer ring (red/orange warning) - more intense
    this.roadGraphics.fillStyle(0xFF2200, 0.5);
    this.roadGraphics.fillEllipse(x, y, holeW * 1.6, holeH * 1.6);

    // Cracked road around hole
    this.roadGraphics.fillStyle(0x444444, 0.9);
    this.roadGraphics.fillEllipse(x, y, holeW * 1.4, holeH * 1.4);

    // Outer dark ring
    this.roadGraphics.fillStyle(0x222222, 1);
    this.roadGraphics.fillEllipse(x, y, holeW * 1.15, holeH * 1.15);

    // Main hole
    this.roadGraphics.fillStyle(0x111111, 1);
    this.roadGraphics.fillEllipse(x, y, holeW, holeH);

    // Inner depth effect
    this.roadGraphics.fillStyle(0x000000, 1);
    this.roadGraphics.fillEllipse(x, y + holeH * 0.1, holeW * 0.7, holeH * 0.6);

    // Warning marks - more prominent
    if (holeW > 20) {
      this.roadGraphics.fillStyle(0xFF0000, 1);
      const stripeW = Math.max(6, holeW * 0.1);
      this.roadGraphics.fillRect(x - holeW * 0.8, y - holeH * 0.4, stripeW, holeH * 0.8);
      this.roadGraphics.fillRect(x + holeW * 0.7, y - holeH * 0.4, stripeW, holeH * 0.8);
    }
  }

  drawOilBarrel(x, y, scale, side) {
    // Biohazard barrel - orange with white stripe
    const barrelW = Math.max(20, scale * 800);
    const barrelH = Math.max(25, scale * 1000);

    if (barrelW < 10) return;

    // Shadow
    this.spriteGraphics.fillStyle(0x000000, 0.4);
    this.spriteGraphics.fillEllipse(x + 3, y + 2, barrelW * 1.1, barrelH * 0.3);

    // Barrel body (orange)
    this.spriteGraphics.fillStyle(0xE65C00, 1);
    this.spriteGraphics.fillRect(x - barrelW / 2, y - barrelH, barrelW, barrelH);

    // Darker edge for 3D effect (left side)
    this.spriteGraphics.fillStyle(0xCC4400, 1);
    this.spriteGraphics.fillRect(x - barrelW / 2, y - barrelH, barrelW * 0.15, barrelH);

    // Lighter edge for 3D effect (right side highlight)
    this.spriteGraphics.fillStyle(0xFF7722, 1);
    this.spriteGraphics.fillRect(x + barrelW * 0.35, y - barrelH, barrelW * 0.15, barrelH);

    // Barrel top cap (darker brown/rust)
    this.spriteGraphics.fillStyle(0x4a3520, 1);
    this.spriteGraphics.fillEllipse(x, y - barrelH, barrelW / 2, barrelH * 0.12);

    // Barrel bottom edge
    this.spriteGraphics.fillStyle(0x3a2510, 1);
    this.spriteGraphics.fillEllipse(x, y, barrelW / 2, barrelH * 0.1);

    // White stripe band in the middle
    this.spriteGraphics.fillStyle(0xEEEEEE, 1);
    const bandY = y - barrelH * 0.55;
    const bandH = barrelH * 0.25;
    this.spriteGraphics.fillRect(x - barrelW / 2, bandY, barrelW, bandH);

    // Slight gray edge on white band for depth
    this.spriteGraphics.fillStyle(0xCCCCCC, 1);
    this.spriteGraphics.fillRect(x - barrelW / 2, bandY, barrelW * 0.1, bandH);

    // Biohazard symbol on white band (simplified)
    if (barrelW > 18) {
      const symbolX = x;
      const symbolY = bandY + bandH / 2;
      const symbolSize = Math.min(barrelW * 0.3, bandH * 0.4);

      // Black biohazard symbol - simplified as three circles with center
      this.spriteGraphics.fillStyle(0x000000, 1);

      // Center circle
      this.spriteGraphics.fillCircle(symbolX, symbolY, symbolSize * 0.25);

      // Three outer circles (trefoil pattern)
      const angleOffset = -Math.PI / 2; // Start from top
      for (let i = 0; i < 3; i++) {
        const angle = angleOffset + (i * Math.PI * 2 / 3);
        const cx = symbolX + Math.cos(angle) * symbolSize * 0.5;
        const cy = symbolY + Math.sin(angle) * symbolSize * 0.5;
        this.spriteGraphics.fillCircle(cx, cy, symbolSize * 0.3);
      }

      // White gaps to create biohazard look
      this.spriteGraphics.fillStyle(0xEEEEEE, 1);
      this.spriteGraphics.fillCircle(symbolX, symbolY, symbolSize * 0.12);

      // Three small white gaps between lobes
      for (let i = 0; i < 3; i++) {
        const angle = angleOffset + Math.PI / 3 + (i * Math.PI * 2 / 3);
        const gx = symbolX + Math.cos(angle) * symbolSize * 0.35;
        const gy = symbolY + Math.sin(angle) * symbolSize * 0.35;
        this.spriteGraphics.fillCircle(gx, gy, symbolSize * 0.12);
      }
    }

    // Top metal rim
    this.spriteGraphics.fillStyle(0x555555, 1);
    this.spriteGraphics.fillRect(x - barrelW / 2, y - barrelH - barrelH * 0.02, barrelW, barrelH * 0.04);

    // Bottom metal rim
    this.spriteGraphics.fillStyle(0x444444, 1);
    this.spriteGraphics.fillRect(x - barrelW / 2, y - barrelH * 0.04, barrelW, barrelH * 0.04);
  }

  drawDebris(x, y, scale, side) {
    // Scattered rocks/debris on road
    const debrisW = Math.max(30, scale * 1200);
    const debrisH = Math.max(15, scale * 500);

    if (debrisW < 12) return;

    // Draw several rocks of varying sizes
    const rockColors = [0x666666, 0x555555, 0x777777, 0x888888];

    // Large center rock
    this.spriteGraphics.fillStyle(rockColors[0], 1);
    this.spriteGraphics.fillEllipse(x, y - debrisH * 0.3, debrisW * 0.4, debrisH * 0.5);

    // Shadow
    this.spriteGraphics.fillStyle(0x333333, 0.5);
    this.spriteGraphics.fillEllipse(x, y + debrisH * 0.1, debrisW * 0.5, debrisH * 0.2);

    // Smaller rocks around
    this.spriteGraphics.fillStyle(rockColors[1], 1);
    this.spriteGraphics.fillEllipse(x - debrisW * 0.35, y - debrisH * 0.2, debrisW * 0.25, debrisH * 0.35);

    this.spriteGraphics.fillStyle(rockColors[2], 1);
    this.spriteGraphics.fillEllipse(x + debrisW * 0.3, y - debrisH * 0.15, debrisW * 0.2, debrisH * 0.3);

    this.spriteGraphics.fillStyle(rockColors[3], 1);
    this.spriteGraphics.fillEllipse(x - debrisW * 0.15, y - debrisH * 0.1, debrisW * 0.15, debrisH * 0.25);

    // Small pebbles
    this.spriteGraphics.fillStyle(0x999999, 1);
    this.spriteGraphics.fillCircle(x + debrisW * 0.4, y, debrisW * 0.08);
    this.spriteGraphics.fillCircle(x - debrisW * 0.45, y - debrisH * 0.05, debrisW * 0.06);
    this.spriteGraphics.fillCircle(x + debrisW * 0.1, y + debrisH * 0.05, debrisW * 0.05);

    // Dust/dirt effect
    this.spriteGraphics.fillStyle(0xAA8866, 0.3);
    this.spriteGraphics.fillEllipse(x, y, debrisW * 0.7, debrisH * 0.4);
  }

  // ========== SEGMENT 2 NEW OBSTACLES ==========

  drawBrokenCrate(x, y, scale, side) {
    // Broken wooden crate with debris
    const crateW = Math.max(25, scale * 900);
    const crateH = Math.max(20, scale * 700);

    if (crateW < 12) return;

    // Shadow
    this.spriteGraphics.fillStyle(0x000000, 0.4);
    this.spriteGraphics.fillEllipse(x + 3, y + 2, crateW * 0.8, crateH * 0.3);

    // Main crate body (broken, tilted)
    this.spriteGraphics.fillStyle(0x8B4513, 1); // Saddle brown
    this.spriteGraphics.beginPath();
    this.spriteGraphics.moveTo(x - crateW * 0.4, y);
    this.spriteGraphics.lineTo(x - crateW * 0.35, y - crateH * 0.8);
    this.spriteGraphics.lineTo(x + crateW * 0.3, y - crateH * 0.7);
    this.spriteGraphics.lineTo(x + crateW * 0.4, y);
    this.spriteGraphics.closePath();
    this.spriteGraphics.fill();

    // Crate planks (horizontal lines)
    this.spriteGraphics.lineStyle(Math.max(1, scale * 30), 0x654321, 1);
    this.spriteGraphics.strokeLineShape(new Phaser.Geom.Line(
      x - crateW * 0.35, y - crateH * 0.2,
      x + crateW * 0.35, y - crateH * 0.15
    ));
    this.spriteGraphics.strokeLineShape(new Phaser.Geom.Line(
      x - crateW * 0.36, y - crateH * 0.5,
      x + crateW * 0.32, y - crateH * 0.45
    ));

    // Broken plank sticking out
    this.spriteGraphics.fillStyle(0xA0522D, 1);
    this.spriteGraphics.beginPath();
    this.spriteGraphics.moveTo(x + crateW * 0.2, y - crateH * 0.6);
    this.spriteGraphics.lineTo(x + crateW * 0.55, y - crateH * 1.0);
    this.spriteGraphics.lineTo(x + crateW * 0.5, y - crateH * 0.55);
    this.spriteGraphics.closePath();
    this.spriteGraphics.fill();

    // Scattered wood pieces
    this.spriteGraphics.fillStyle(0x8B4513, 0.8);
    this.spriteGraphics.fillRect(x - crateW * 0.5, y - crateH * 0.1, crateW * 0.15, crateH * 0.08);
    this.spriteGraphics.fillRect(x + crateW * 0.35, y - crateH * 0.05, crateW * 0.12, crateH * 0.06);

    // Nail highlights
    this.spriteGraphics.fillStyle(0x888888, 1);
    this.spriteGraphics.fillCircle(x - crateW * 0.2, y - crateH * 0.3, crateW * 0.02);
    this.spriteGraphics.fillCircle(x + crateW * 0.15, y - crateH * 0.25, crateW * 0.02);
  }

  drawConstructionBarrier(x, y, scale, side) {
    // Orange/white striped construction barrier
    const barrierW = Math.max(30, scale * 1100);
    const barrierH = Math.max(20, scale * 700);

    if (barrierW < 15) return;

    // Shadow
    this.spriteGraphics.fillStyle(0x000000, 0.4);
    this.spriteGraphics.fillEllipse(x + 3, y + 2, barrierW * 0.9, barrierH * 0.25);

    // Legs/stands
    this.spriteGraphics.fillStyle(0x333333, 1);
    this.spriteGraphics.fillRect(x - barrierW * 0.4, y - barrierH * 0.3, barrierW * 0.08, barrierH * 0.3);
    this.spriteGraphics.fillRect(x + barrierW * 0.32, y - barrierH * 0.3, barrierW * 0.08, barrierH * 0.3);

    // Main barrier board - orange base
    this.spriteGraphics.fillStyle(0xFF6600, 1);
    this.spriteGraphics.fillRect(x - barrierW * 0.45, y - barrierH * 0.7, barrierW * 0.9, barrierH * 0.4);

    // White diagonal stripes (4 stripes to fit within barrier)
    this.spriteGraphics.fillStyle(0xFFFFFF, 1);
    const stripeWidth = barrierW * 0.12;
    for (let i = 0; i < 4; i++) {
      const sx = x - barrierW * 0.4 + i * stripeWidth * 2;
      this.spriteGraphics.beginPath();
      this.spriteGraphics.moveTo(sx, y - barrierH * 0.7);
      this.spriteGraphics.lineTo(sx + stripeWidth, y - barrierH * 0.7);
      this.spriteGraphics.lineTo(sx + stripeWidth * 1.5, y - barrierH * 0.3);
      this.spriteGraphics.lineTo(sx + stripeWidth * 0.5, y - barrierH * 0.3);
      this.spriteGraphics.closePath();
      this.spriteGraphics.fill();
    }

    // Border outline
    this.spriteGraphics.lineStyle(Math.max(1, scale * 20), 0xCC5500, 1);
    this.spriteGraphics.strokeRect(x - barrierW * 0.45, y - barrierH * 0.7, barrierW * 0.9, barrierH * 0.4);

    // Reflective dots on top
    this.spriteGraphics.fillStyle(0xFFFF00, 0.8);
    this.spriteGraphics.fillCircle(x - barrierW * 0.3, y - barrierH * 0.8, barrierW * 0.03);
    this.spriteGraphics.fillCircle(x, y - barrierH * 0.8, barrierW * 0.03);
    this.spriteGraphics.fillCircle(x + barrierW * 0.3, y - barrierH * 0.8, barrierW * 0.03);
  }

  // ========== SEGMENT 3 OBSTACLES (Placeholders) ==========

  drawTireStack(x, y, scale, side) {
    // Single large tire standing upright on the road (like race track barrier)
    const tireSize = Math.max(40, scale * 1600);  // Enlarged tire

    if (tireSize < 15) return;

    // Shadow on ground
    this.spriteGraphics.fillStyle(0x000000, 0.4);
    this.spriteGraphics.fillEllipse(x + 3, y + 2, tireSize * 0.5, tireSize * 0.15);

    // Tire outer ring (black rubber)
    this.spriteGraphics.fillStyle(0x1a1a1a, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.5, tireSize * 0.5);

    // Tire tread area (slightly lighter for depth)
    this.spriteGraphics.fillStyle(0x2a2a2a, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.45, tireSize * 0.45);

    // Tire sidewall (dark gray)
    this.spriteGraphics.fillStyle(0x3a3a3a, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.38, tireSize * 0.38);

    // Alloy wheel rim (silver/metallic)
    this.spriteGraphics.fillStyle(0xAAAAAA, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.32, tireSize * 0.32);

    // Wheel spokes effect (darker silver)
    this.spriteGraphics.fillStyle(0x888888, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.28, tireSize * 0.28);

    // Inner rim detail (lighter)
    this.spriteGraphics.fillStyle(0xCCCCCC, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.2, tireSize * 0.2);

    // Center hub (dark)
    this.spriteGraphics.fillStyle(0x444444, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.1, tireSize * 0.1);

    // Hub cap center (metallic shine)
    this.spriteGraphics.fillStyle(0x999999, 1);
    this.spriteGraphics.fillEllipse(x, y - tireSize * 0.5, tireSize * 0.05, tireSize * 0.05);

    // Lug nuts (5 dots around center)
    if (tireSize > 25) {
      this.spriteGraphics.fillStyle(0x666666, 1);
      const lugRadius = tireSize * 0.15;
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;  // 5 lugs, starting from top
        const lx = x + Math.cos(angle) * lugRadius;
        const ly = (y - tireSize * 0.5) + Math.sin(angle) * lugRadius;
        this.spriteGraphics.fillCircle(lx, ly, tireSize * 0.02);
      }
    }
  }

  drawConeCluster(x, y, scale, side) {
    // Cluster of traffic cones - straight line arrangement
    const coneW = Math.max(15, scale * 500);
    const coneH = Math.max(18, scale * 550);  // Reduced height

    if (coneW < 8) return;

    // Draw 3 cones in a straight line
    const positions = [
      { dx: -coneW * 0.9, dy: 0 },  // Left
      { dx: 0, dy: 0 },              // Center
      { dx: coneW * 0.9, dy: 0 }     // Right
    ];

    for (const pos of positions) {
      const cx = x + pos.dx;
      const cy = y + pos.dy;

      // Cone shadow
      this.spriteGraphics.fillStyle(0x000000, 0.3);
      this.spriteGraphics.fillEllipse(cx + 1, cy + 1, coneW * 0.4, coneH * 0.1);

      // Cone base (black)
      this.spriteGraphics.fillStyle(0x222222, 1);
      this.spriteGraphics.fillRect(cx - coneW * 0.4, cy - coneH * 0.1, coneW * 0.8, coneH * 0.1);

      // Cone body (orange)
      this.spriteGraphics.fillStyle(0xFF6600, 1);
      this.spriteGraphics.fillTriangle(
        cx, cy - coneH,
        cx - coneW * 0.35, cy - coneH * 0.1,
        cx + coneW * 0.35, cy - coneH * 0.1
      );

      // White reflective stripes
      this.spriteGraphics.fillStyle(0xFFFFFF, 1);
      const stripeH = coneH * 0.12;
      // Upper stripe
      this.spriteGraphics.fillTriangle(
        cx, cy - coneH * 0.75,
        cx - coneW * 0.18, cy - coneH * 0.6,
        cx + coneW * 0.18, cy - coneH * 0.6
      );
      // Lower stripe
      this.spriteGraphics.fillTriangle(
        cx - coneW * 0.1, cy - coneH * 0.45,
        cx - coneW * 0.28, cy - coneH * 0.3,
        cx + coneW * 0.28, cy - coneH * 0.3
      );
    }
  }

  drawPlayerCar() {
    // Car moves left/right based on playerX, road stays stable
    // playerX ranges from -3.0 to 3.0, map to screen position
    const steerOffset = this.playerX * (this.width * 0.12); // Car moves up to ~36% of screen width
    const playerScreenX = this.width / 2 + steerOffset;
    const playerScreenY = this.height - 140;  // Higher up to avoid control buttons

    // Get vehicle type based on segment
    const segmentVehicle = SEGMENT_CONFIG.vehicles[this.segmentIndex] || 'car';

    // Draw the appropriate vehicle
    if (segmentVehicle === 'truck') {
      this.drawPlayerTruck(playerScreenX, playerScreenY);
    } else if (segmentVehicle === 'sports_car') {
      this.drawPlayerSportsCar(playerScreenX, playerScreenY);
    } else {
      this.drawPlayerCarDefault(playerScreenX, playerScreenY);
    }

    // Draw boost indicator above vehicle when boost is ready
    this.drawBoostIndicator(playerScreenX, playerScreenY - 100);
  }

  drawPlayerCarDefault(playerScreenX, playerScreenY) {
    // Original car drawing code - REAR VIEW
    const carW = 90;
    const carH = 50;

    let bodyColor = 0xDD3333;  // Red car

    if (this.isHit && Math.floor(this.elapsedTime * 8) % 2 === 0) {
      bodyColor = 0xFFFFFF;
    } else if (this.boosting) {
      bodyColor = 0xFFFF00;
    }

    // Shadow under car
    this.spriteGraphics.fillStyle(0x000000, 0.3);
    this.spriteGraphics.fillEllipse(playerScreenX, playerScreenY + 5, carW * 1.1, 15);

    // Main body (rear view - wide rectangle)
    this.spriteGraphics.fillStyle(bodyColor, 1);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - carW / 2,
      playerScreenY - carH,
      carW, carH, 6
    );

    // Roof/cabin (darker, smaller rectangle on top)
    const roofColor = Phaser.Display.Color.ValueToColor(bodyColor);
    roofColor.darken(15);
    this.spriteGraphics.fillStyle(roofColor.color, 1);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - carW * 0.35,
      playerScreenY - carH - 20,
      carW * 0.7,
      25,
      4
    );

    // Rear window (on the cabin)
    this.spriteGraphics.fillStyle(0x88CCFF, 1);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - carW * 0.28,
      playerScreenY - carH - 16,
      carW * 0.56,
      14,
      3
    );

    // Rear lights (left and right)
    this.spriteGraphics.fillStyle(0xFF3333, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - carW / 2 + 5, playerScreenY - carH + 5, 12, 8, 2);
    this.spriteGraphics.fillRoundedRect(playerScreenX + carW / 2 - 17, playerScreenY - carH + 5, 12, 8, 2);

    // License plate area (center) - larger for clear "Rush2C9" text
    this.spriteGraphics.fillStyle(0xFFFFFF, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - 38, playerScreenY - carH + 8, 76, 20, 3);
    this.spriteGraphics.fillStyle(0x1a5276, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - 35, playerScreenY - carH + 10, 70, 16, 2);

    // "Rush2C9" text on license plate
    if (!this.licensePlateText) {
      this.licensePlateText = this.add.text(0, 0, 'Rush2C9', {
        fontSize: '14px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1,
      });
      this.licensePlateText.setOrigin(0.5);
      this.licensePlateText.setDepth(100);
    }
    this.licensePlateText.setPosition(playerScreenX, playerScreenY - carH + 18);

    // Rear wheels (visible from behind - bottom corners)
    this.spriteGraphics.fillStyle(0x111111, 1);
    // Left wheel
    this.spriteGraphics.fillRoundedRect(playerScreenX - carW / 2 - 3, playerScreenY - 18, 12, 20, 3);
    // Right wheel
    this.spriteGraphics.fillRoundedRect(playerScreenX + carW / 2 - 9, playerScreenY - 18, 12, 20, 3);

    // Wheel inner (gray)
    this.spriteGraphics.fillStyle(0x444444, 1);
    this.spriteGraphics.fillRect(playerScreenX - carW / 2, playerScreenY - 15, 6, 14);
    this.spriteGraphics.fillRect(playerScreenX + carW / 2 - 6, playerScreenY - 15, 6, 14);

    // Exhaust pipes (small rectangles at bottom)
    this.spriteGraphics.fillStyle(0x666666, 1);
    this.spriteGraphics.fillRect(playerScreenX - 20, playerScreenY - 5, 8, 6);
    this.spriteGraphics.fillRect(playerScreenX + 12, playerScreenY - 5, 8, 6);

    // Boost flames (from exhaust)
    if (this.boosting) {
      this.spriteGraphics.fillStyle(0xFF6600, 0.9);
      this.spriteGraphics.fillTriangle(
        playerScreenX - 20, playerScreenY,
        playerScreenX - 12, playerScreenY,
        playerScreenX - 16, playerScreenY + 20 + Math.random() * 10
      );
      this.spriteGraphics.fillTriangle(
        playerScreenX + 12, playerScreenY,
        playerScreenX + 20, playerScreenY,
        playerScreenX + 16, playerScreenY + 20 + Math.random() * 10
      );
    }
  }

  // ========== SEGMENT 2 VEHICLE: TRUCK ==========
  drawPlayerTruck(playerScreenX, playerScreenY) {
    // Truck - REAR VIEW - bigger and bulkier than car
    const truckW = 110;
    const truckH = 70;

    let bodyColor = 0x2E86AB;  // Blue truck

    if (this.isHit && Math.floor(this.elapsedTime * 8) % 2 === 0) {
      bodyColor = 0xFFFFFF;
    } else if (this.boosting) {
      bodyColor = 0xFFFF00;
    }

    // Shadow under truck
    this.spriteGraphics.fillStyle(0x000000, 0.3);
    this.spriteGraphics.fillEllipse(playerScreenX, playerScreenY + 5, truckW * 1.1, 18);

    // Main cargo body (large rectangle)
    this.spriteGraphics.fillStyle(bodyColor, 1);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - truckW / 2,
      playerScreenY - truckH,
      truckW, truckH, 4
    );

    // Cargo area top edge (darker)
    const darkColor = Phaser.Display.Color.ValueToColor(bodyColor);
    darkColor.darken(20);
    this.spriteGraphics.fillStyle(darkColor.color, 1);
    this.spriteGraphics.fillRect(
      playerScreenX - truckW / 2,
      playerScreenY - truckH,
      truckW, 8
    );

    // Rear door frame (vertical lines)
    this.spriteGraphics.fillStyle(0x333333, 1);
    this.spriteGraphics.fillRect(playerScreenX - truckW / 2 + 5, playerScreenY - truckH + 10, 3, truckH - 15);
    this.spriteGraphics.fillRect(playerScreenX + truckW / 2 - 8, playerScreenY - truckH + 10, 3, truckH - 15);
    this.spriteGraphics.fillRect(playerScreenX - 1.5, playerScreenY - truckH + 10, 3, truckH - 15);

    // Rear door handle
    this.spriteGraphics.fillStyle(0x666666, 1);
    this.spriteGraphics.fillRect(playerScreenX - 15, playerScreenY - truckH / 2, 8, 12);
    this.spriteGraphics.fillRect(playerScreenX + 7, playerScreenY - truckH / 2, 8, 12);

    // Rear lights (large rectangular)
    this.spriteGraphics.fillStyle(0xFF3333, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - truckW / 2 + 8, playerScreenY - truckH + 12, 15, 20, 2);
    this.spriteGraphics.fillRoundedRect(playerScreenX + truckW / 2 - 23, playerScreenY - truckH + 12, 15, 20, 2);

    // Orange indicator lights
    this.spriteGraphics.fillStyle(0xFF9900, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - truckW / 2 + 8, playerScreenY - truckH + 35, 15, 10, 2);
    this.spriteGraphics.fillRoundedRect(playerScreenX + truckW / 2 - 23, playerScreenY - truckH + 35, 15, 10, 2);

    // License plate
    this.spriteGraphics.fillStyle(0xFFFFFF, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - 40, playerScreenY - 25, 80, 22, 3);
    this.spriteGraphics.fillStyle(0x1a5276, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - 37, playerScreenY - 23, 74, 18, 2);

    // "Rush2C9" text on license plate
    if (!this.licensePlateText) {
      this.licensePlateText = this.add.text(0, 0, 'Rush2C9', {
        fontSize: '14px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1,
      });
      this.licensePlateText.setOrigin(0.5);
      this.licensePlateText.setDepth(100);
    }
    this.licensePlateText.setPosition(playerScreenX, playerScreenY - 14);

    // Rear wheels (larger, dual wheels)
    this.spriteGraphics.fillStyle(0x111111, 1);
    // Left wheels (dual)
    this.spriteGraphics.fillRoundedRect(playerScreenX - truckW / 2 - 5, playerScreenY - 22, 14, 24, 3);
    this.spriteGraphics.fillRoundedRect(playerScreenX - truckW / 2 + 10, playerScreenY - 22, 14, 24, 3);
    // Right wheels (dual)
    this.spriteGraphics.fillRoundedRect(playerScreenX + truckW / 2 - 9, playerScreenY - 22, 14, 24, 3);
    this.spriteGraphics.fillRoundedRect(playerScreenX + truckW / 2 - 24, playerScreenY - 22, 14, 24, 3);

    // Wheel hubs
    this.spriteGraphics.fillStyle(0x666666, 1);
    this.spriteGraphics.fillCircle(playerScreenX - truckW / 2 + 2, playerScreenY - 10, 5);
    this.spriteGraphics.fillCircle(playerScreenX + truckW / 2 - 2, playerScreenY - 10, 5);

    // Mud flaps
    this.spriteGraphics.fillStyle(0x222222, 1);
    this.spriteGraphics.fillRect(playerScreenX - truckW / 2 - 8, playerScreenY - 5, 30, 6);
    this.spriteGraphics.fillRect(playerScreenX + truckW / 2 - 22, playerScreenY - 5, 30, 6);

    // Boost flames
    if (this.boosting) {
      this.spriteGraphics.fillStyle(0xFF6600, 0.9);
      this.spriteGraphics.fillTriangle(
        playerScreenX - 25, playerScreenY,
        playerScreenX - 15, playerScreenY,
        playerScreenX - 20, playerScreenY + 25 + Math.random() * 12
      );
      this.spriteGraphics.fillTriangle(
        playerScreenX + 15, playerScreenY,
        playerScreenX + 25, playerScreenY,
        playerScreenX + 20, playerScreenY + 25 + Math.random() * 12
      );
    }
  }

  // ========== SEGMENT 3 VEHICLE: SPORTS CAR ==========
  drawPlayerSportsCar(playerScreenX, playerScreenY) {
    // Sports car - REAR VIEW - sleek and low
    const carW = 95;
    const carH = 40;

    let bodyColor = 0xFFD700;  // Gold/yellow sports car

    if (this.isHit && Math.floor(this.elapsedTime * 8) % 2 === 0) {
      bodyColor = 0xFFFFFF;
    } else if (this.boosting) {
      bodyColor = 0xFF6600;
    }

    // Shadow under car
    this.spriteGraphics.fillStyle(0x000000, 0.3);
    this.spriteGraphics.fillEllipse(playerScreenX, playerScreenY + 3, carW * 1.15, 12);

    // Main body (sleek, low profile)
    this.spriteGraphics.fillStyle(bodyColor, 1);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - carW / 2,
      playerScreenY - carH,
      carW, carH, 8
    );

    // Rear spoiler
    this.spriteGraphics.fillStyle(0x111111, 1);
    this.spriteGraphics.fillRect(playerScreenX - carW * 0.45, playerScreenY - carH - 12, carW * 0.9, 4);
    // Spoiler supports
    this.spriteGraphics.fillRect(playerScreenX - carW * 0.35, playerScreenY - carH - 8, 4, 8);
    this.spriteGraphics.fillRect(playerScreenX + carW * 0.31, playerScreenY - carH - 8, 4, 8);

    // Roof/cabin (very low, sporty)
    const roofColor = Phaser.Display.Color.ValueToColor(bodyColor);
    roofColor.darken(10);
    this.spriteGraphics.fillStyle(roofColor.color, 1);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - carW * 0.3,
      playerScreenY - carH - 8,
      carW * 0.6,
      12,
      4
    );

    // Rear window (wraparound style)
    this.spriteGraphics.fillStyle(0x88CCFF, 0.9);
    this.spriteGraphics.fillRoundedRect(
      playerScreenX - carW * 0.25,
      playerScreenY - carH - 4,
      carW * 0.5,
      8,
      3
    );

    // Rear lights (LED strip style)
    this.spriteGraphics.fillStyle(0xFF0000, 1);
    this.spriteGraphics.fillRect(playerScreenX - carW / 2 + 5, playerScreenY - carH + 5, carW - 10, 4);

    // Center brake light
    this.spriteGraphics.fillStyle(0xFF3333, 1);
    this.spriteGraphics.fillRect(playerScreenX - 15, playerScreenY - carH - 10, 30, 3);

    // Exhaust pipes (quad exhaust for sports car)
    this.spriteGraphics.fillStyle(0x444444, 1);
    this.spriteGraphics.fillCircle(playerScreenX - 25, playerScreenY - 3, 6);
    this.spriteGraphics.fillCircle(playerScreenX - 12, playerScreenY - 3, 6);
    this.spriteGraphics.fillCircle(playerScreenX + 12, playerScreenY - 3, 6);
    this.spriteGraphics.fillCircle(playerScreenX + 25, playerScreenY - 3, 6);

    // Exhaust inner (darker)
    this.spriteGraphics.fillStyle(0x222222, 1);
    this.spriteGraphics.fillCircle(playerScreenX - 25, playerScreenY - 3, 4);
    this.spriteGraphics.fillCircle(playerScreenX - 12, playerScreenY - 3, 4);
    this.spriteGraphics.fillCircle(playerScreenX + 12, playerScreenY - 3, 4);
    this.spriteGraphics.fillCircle(playerScreenX + 25, playerScreenY - 3, 4);

    // License plate (smaller, sportier)
    this.spriteGraphics.fillStyle(0xFFFFFF, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - 32, playerScreenY - carH + 12, 64, 16, 2);
    this.spriteGraphics.fillStyle(0x1a5276, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - 29, playerScreenY - carH + 14, 58, 12, 2);

    // "Rush2C9" text
    if (!this.licensePlateText) {
      this.licensePlateText = this.add.text(0, 0, 'Rush2C9', {
        fontSize: '12px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 1,
      });
      this.licensePlateText.setOrigin(0.5);
      this.licensePlateText.setDepth(100);
    }
    this.licensePlateText.setPosition(playerScreenX, playerScreenY - carH + 20);

    // Wide rear wheels (performance tires)
    this.spriteGraphics.fillStyle(0x111111, 1);
    this.spriteGraphics.fillRoundedRect(playerScreenX - carW / 2 - 5, playerScreenY - 16, 16, 18, 4);
    this.spriteGraphics.fillRoundedRect(playerScreenX + carW / 2 - 11, playerScreenY - 16, 16, 18, 4);

    // Wheel rims (alloy style)
    this.spriteGraphics.fillStyle(0x888888, 1);
    this.spriteGraphics.fillCircle(playerScreenX - carW / 2 + 3, playerScreenY - 7, 6);
    this.spriteGraphics.fillCircle(playerScreenX + carW / 2 - 3, playerScreenY - 7, 6);

    // Boost flames (bigger for sports car)
    if (this.boosting) {
      this.spriteGraphics.fillStyle(0xFF6600, 0.9);
      // Four flames from quad exhaust
      this.spriteGraphics.fillTriangle(
        playerScreenX - 28, playerScreenY,
        playerScreenX - 22, playerScreenY,
        playerScreenX - 25, playerScreenY + 18 + Math.random() * 8
      );
      this.spriteGraphics.fillTriangle(
        playerScreenX - 15, playerScreenY,
        playerScreenX - 9, playerScreenY,
        playerScreenX - 12, playerScreenY + 18 + Math.random() * 8
      );
      this.spriteGraphics.fillTriangle(
        playerScreenX + 9, playerScreenY,
        playerScreenX + 15, playerScreenY,
        playerScreenX + 12, playerScreenY + 18 + Math.random() * 8
      );
      this.spriteGraphics.fillTriangle(
        playerScreenX + 22, playerScreenY,
        playerScreenX + 28, playerScreenY,
        playerScreenX + 25, playerScreenY + 18 + Math.random() * 8
      );
    }
  }

  drawBoostIndicator(x, y) {
    if (!this.boostAvailable || this.boosting || this.countdownActive) return;

    // Pulsing animation
    const pulse = 1 + Math.sin(this.elapsedTime * 6) * 0.15;
    const baseSize = 28 * pulse;

    // Outer glow (orange)
    this.spriteGraphics.fillStyle(0xFF6600, 0.4);
    this.spriteGraphics.fillCircle(x, y, baseSize + 8);

    // Main circle (orange gradient effect)
    this.spriteGraphics.fillStyle(0xFF8800, 1);
    this.spriteGraphics.fillCircle(x, y, baseSize);

    // Inner highlight
    this.spriteGraphics.fillStyle(0xFFAA00, 1);
    this.spriteGraphics.fillCircle(x, y - baseSize * 0.2, baseSize * 0.6);

    // Rocket icon (simplified)
    this.spriteGraphics.fillStyle(0xFFFFFF, 1);
    // Rocket body
    this.spriteGraphics.fillTriangle(
      x, y - baseSize * 0.5,
      x - baseSize * 0.25, y + baseSize * 0.3,
      x + baseSize * 0.25, y + baseSize * 0.3
    );
    // Rocket fins
    this.spriteGraphics.fillTriangle(
      x - baseSize * 0.25, y + baseSize * 0.1,
      x - baseSize * 0.45, y + baseSize * 0.4,
      x - baseSize * 0.15, y + baseSize * 0.3
    );
    this.spriteGraphics.fillTriangle(
      x + baseSize * 0.25, y + baseSize * 0.1,
      x + baseSize * 0.45, y + baseSize * 0.4,
      x + baseSize * 0.15, y + baseSize * 0.3
    );

    // "TAP" text indicator using Phaser text (create once, update position)
    if (!this.boostTapText) {
      this.boostTapText = this.add.text(0, 0, 'TAP!', {
        fontSize: '16px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      });
      this.boostTapText.setOrigin(0.5);
      this.boostTapText.setDepth(150);
    }

    this.boostTapText.setPosition(x, y + baseSize + 18);
    this.boostTapText.setVisible(true);
    this.boostTapText.setScale(pulse);
  }

  drawVictoryScene() {
    // Draw car at center position during victory
    const carX = this.width / 2;
    const carY = this.height - 140;

    // Draw victory racer standing next to the car (left side)
    this.drawVictoryRacer(carX - 70, carY);

    // Draw trophy above the scene
    this.drawVictoryTrophy(carX, carY - 180);

    // Draw victory text
    this.drawVictoryText(carX, carY - 240);
  }

  drawVictoryRacer(x, y) {
    // Racer is BACK VIEW - showing jersey with name
    // Improved proportions and racing suit style

    const g = this.spriteGraphics;

    // Scale factor for the racer (make it bigger and more detailed)
    const s = 1.3;

    // Shadow under racer
    g.fillStyle(0x000000, 0.4);
    g.fillEllipse(x, y + 8, 45 * s, 12);

    // === LEGS (Racing suit - dark blue with white stripe) ===
    // Left leg
    g.fillStyle(0x1a3a5c, 1);
    g.fillRoundedRect(x - 15 * s, y - 45 * s, 13 * s, 50 * s, 4);
    // Right leg
    g.fillRoundedRect(x + 2 * s, y - 45 * s, 13 * s, 50 * s, 4);

    // White racing stripes on legs
    g.fillStyle(0xFFFFFF, 0.8);
    g.fillRect(x - 15 * s + 2, y - 40 * s, 2 * s, 40 * s);
    g.fillRect(x + 13 * s, y - 40 * s, 2 * s, 40 * s);

    // === RACING BOOTS ===
    g.fillStyle(0x222222, 1);
    g.fillRoundedRect(x - 16 * s, y + 2, 14 * s, 10, 3);
    g.fillRoundedRect(x + 2 * s, y + 2, 14 * s, 10, 3);
    // Boot soles
    g.fillStyle(0x111111, 1);
    g.fillRect(x - 16 * s, y + 8, 14 * s, 4);
    g.fillRect(x + 2 * s, y + 8, 14 * s, 4);

    // === TORSO/RACING SUIT (Cloud9 Blue with details) ===
    // Main body
    g.fillStyle(0x0A4D8C, 1);
    g.fillRoundedRect(x - 22 * s, y - 85 * s, 44 * s, 50 * s, 6);

    // Shoulders (wider at top)
    g.fillStyle(0x0A4D8C, 1);
    g.fillRoundedRect(x - 26 * s, y - 82 * s, 52 * s, 15 * s, 4);

    // White collar area
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(x - 10 * s, y - 88 * s, 20 * s, 8 * s, 3);

    // Racing suit seams/details
    g.fillStyle(0x083d6e, 1);
    g.fillRect(x - 1 * s, y - 80 * s, 2 * s, 45 * s); // Center seam

    // White side stripes (racing style)
    g.fillStyle(0xFFFFFF, 0.9);
    g.fillRect(x - 22 * s, y - 75 * s, 3 * s, 38 * s);
    g.fillRect(x + 19 * s, y - 75 * s, 3 * s, 38 * s);

    // === NAME PLATE ON BACK ===
    // Name background (darker blue)
    g.fillStyle(0x062d4f, 1);
    g.fillRoundedRect(x - 18 * s, y - 70 * s, 36 * s, 18 * s, 3);
    // Name border
    g.lineStyle(2, 0xFFFFFF, 0.8);
    g.strokeRoundedRect(x - 18 * s, y - 70 * s, 36 * s, 18 * s, 3);

    // Player name text
    if (!this.victoryNameText) {
      this.victoryNameText = this.add.text(0, 0, this.playerName, {
        fontSize: '14px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 1,
      });
      this.victoryNameText.setOrigin(0.5);
      this.victoryNameText.setDepth(101);
    }
    this.victoryNameText.setText(this.playerName);
    this.victoryNameText.setPosition(x, y - 61 * s);
    this.victoryNameText.setVisible(true);

    // === NUMBER ON LOWER BACK ===
    if (!this.victoryNumberText) {
      this.victoryNumberText = this.add.text(0, 0, '9', {
        fontSize: '18px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#FFFFFF',
        stroke: '#062d4f',
        strokeThickness: 2,
      });
      this.victoryNumberText.setOrigin(0.5);
      this.victoryNumberText.setDepth(101);
    }
    this.victoryNumberText.setPosition(x, y - 42 * s);
    this.victoryNumberText.setVisible(true);

    // === ARMS (Raised in V victory pose) ===
    // Skin color
    const skinColor = 0xE8B89D;

    // Left arm (angled outward and up)
    g.fillStyle(0x0A4D8C, 1); // Sleeve
    g.save();
    // Upper arm
    g.fillRoundedRect(x - 38 * s, y - 110 * s, 12 * s, 35 * s, 5);
    // Forearm (skin)
    g.fillStyle(skinColor, 1);
    g.fillRoundedRect(x - 40 * s, y - 130 * s, 10 * s, 25 * s, 4);
    // Gloved hand (fist)
    g.fillStyle(0x222222, 1);
    g.fillCircle(x - 35 * s, y - 135 * s, 8 * s);

    // Right arm (angled outward and up)
    g.fillStyle(0x0A4D8C, 1); // Sleeve
    g.fillRoundedRect(x + 26 * s, y - 110 * s, 12 * s, 35 * s, 5);
    // Forearm (skin)
    g.fillStyle(skinColor, 1);
    g.fillRoundedRect(x + 30 * s, y - 130 * s, 10 * s, 25 * s, 4);
    // Gloved hand (fist)
    g.fillStyle(0x222222, 1);
    g.fillCircle(x + 35 * s, y - 135 * s, 8 * s);

    // === HEAD (Racing helmet - back view) ===
    // Helmet main (dark with visor reflection)
    g.fillStyle(0x1E3A5F, 1);
    g.fillEllipse(x, y - 100 * s, 18 * s, 20 * s);

    // Helmet top
    g.fillStyle(0x0A4D8C, 1);
    g.fillEllipse(x, y - 108 * s, 16 * s, 12 * s);

    // Helmet padding/neck area
    g.fillStyle(0x333333, 1);
    g.fillRoundedRect(x - 12 * s, y - 88 * s, 24 * s, 6 * s, 2);
  }

  drawVictoryTrophy(x, y) {
    const g = this.spriteGraphics;
    const scale = 1.3; // Make trophy bigger

    // Trophy glow effect (pulsing)
    const pulse = 1 + Math.sin(this.victoryTimer * 4) * 0.15;
    g.fillStyle(0xFFD700, 0.2);
    g.fillCircle(x, y, 55 * pulse * scale);
    g.fillStyle(0xFFD700, 0.1);
    g.fillCircle(x, y, 70 * pulse * scale);

    // ========== TROPHY CUP ==========

    // Cup body (trapezoid shape - wider at top)
    g.fillStyle(0xFFD700, 1);
    g.beginPath();
    g.moveTo(x - 28 * scale, y - 25 * scale);  // Top left
    g.lineTo(x + 28 * scale, y - 25 * scale);  // Top right
    g.lineTo(x + 18 * scale, y + 15 * scale);  // Bottom right
    g.lineTo(x - 18 * scale, y + 15 * scale);  // Bottom left
    g.closePath();
    g.fillPath();

    // Cup rim (shiny top edge)
    g.fillStyle(0xFFE866, 1);
    g.fillRoundedRect(x - 32 * scale, y - 32 * scale, 64 * scale, 10 * scale, 4);

    // Inner cup shadow (gives depth)
    g.fillStyle(0xCC9900, 0.5);
    g.fillEllipse(x, y - 18 * scale, 22 * scale, 8 * scale);

    // ========== HANDLES ==========
    // Left handle (curved)
    g.fillStyle(0xFFD700, 1);
    g.beginPath();
    g.moveTo(x - 28 * scale, y - 18 * scale);
    g.lineTo(x - 40 * scale, y - 15 * scale);
    g.lineTo(x - 42 * scale, y + 5 * scale);
    g.lineTo(x - 35 * scale, y + 10 * scale);
    g.lineTo(x - 28 * scale, y + 5 * scale);
    g.closePath();
    g.fillPath();

    // Right handle (curved)
    g.beginPath();
    g.moveTo(x + 28 * scale, y - 18 * scale);
    g.lineTo(x + 40 * scale, y - 15 * scale);
    g.lineTo(x + 42 * scale, y + 5 * scale);
    g.lineTo(x + 35 * scale, y + 10 * scale);
    g.lineTo(x + 28 * scale, y + 5 * scale);
    g.closePath();
    g.fillPath();

    // ========== STEM & BASE ==========
    // Stem
    g.fillStyle(0xDAA520, 1);
    g.fillRoundedRect(x - 8 * scale, y + 15 * scale, 16 * scale, 18 * scale, 3);

    // Base platform (two tiers)
    g.fillStyle(0x8B6914, 1);
    g.fillRoundedRect(x - 18 * scale, y + 32 * scale, 36 * scale, 8 * scale, 3);
    g.fillStyle(0x704214, 1);
    g.fillRoundedRect(x - 24 * scale, y + 39 * scale, 48 * scale, 10 * scale, 4);

    // ========== DECORATIONS ==========
    // "#1" text on trophy
    g.fillStyle(0xFFFFFF, 1);
    g.fillRoundedRect(x - 10 * scale, y - 12 * scale, 20 * scale, 18 * scale, 3);
    g.fillStyle(0xFFD700, 1);
    g.fillRoundedRect(x - 7 * scale, y - 9 * scale, 14 * scale, 12 * scale, 2);

    // Star on top
    g.fillStyle(0xFFFFFF, 1);
    this.drawStar(x, y - 38 * scale, 10 * scale, 5 * scale, 5);

    // Shine effect (top left)
    g.fillStyle(0xFFFFFF, 0.6);
    g.fillEllipse(x - 15 * scale, y - 15 * scale, 6 * scale, 10 * scale);
  }

  drawStar(cx, cy, outerR, innerR, points) {
    const g = this.spriteGraphics;
    const step = Math.PI / points;

    g.beginPath();
    for (let i = 0; i < 2 * points; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = i * step - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) {
        g.moveTo(x, y);
      } else {
        g.lineTo(x, y);
      }
    }
    g.closePath();
    g.fillPath();
  }

  drawVictoryText(x, y) {
    // "FINISH!" text
    if (!this.victoryFinishText) {
      this.victoryFinishText = this.add.text(0, 0, '🏁 FINISH! 🏁', {
        fontSize: '32px',
        fontFamily: 'Arial Black, sans-serif',
        color: '#FFFFFF',
        stroke: '#000000',
        strokeThickness: 4,
      });
      this.victoryFinishText.setOrigin(0.5);
      this.victoryFinishText.setDepth(150);
    }

    // Pulsing animation
    const scale = 1 + Math.sin(this.victoryTimer * 5) * 0.1;
    this.victoryFinishText.setPosition(x, y);
    this.victoryFinishText.setScale(scale);
    this.victoryFinishText.setVisible(true);
  }

  // External controls
  steer(direction) {
    this.steerDirection = direction;
  }

  activateBoost() {
    // Only allow boost if available (cooldown system)
    if (this.boosting || !this.boostAvailable) return;

    this.boosting = true;
    this.boostAvailable = false;
    this.boostsUsed++;  // Track how many times boost was activated
    this.boostTimer = this.boostEffectDuration;
    this.cameras.main.flash(100, 255, 255, 0);
    this.onBoostUsed();
    this.onBoostReady(false); // Notify UI boost is no longer available
  }

  setVehicle(vehicleId) {
    this.vehicleId = vehicleId;
  }

  setRoadType(roadType) {
    this.roadType = roadType;
  }

  setCredits(credits) {
    this.credits = credits;
  }

  setSegmentIndex(index) {
    this.segmentIndex = index;
  }

  setPlayerName(name) {
    // Store first 5 characters of first name for jersey display
    const firstName = (name || 'RACER').split(' ')[0];
    this.playerName = firstName.substring(0, 5).toUpperCase();
  }

  // ========== NOTIFICATION SYSTEM METHODS ==========

  updateNotifications(dt) {
    const deltaMs = dt * 1000;

    // Update cloud notification (zoom effect from center)
    if (this.cloudEnabled) {
      if (!this.cloudActive) {
        // Wait for timer to spawn new cloud
        this.cloudTimer -= deltaMs;
        if (this.cloudTimer <= 0) {
          // Start new cloud animation
          this.cloudMessage = getRandomCloudMessage();
          this.cloudActive = true;
          this.cloudProgress = 0;
          // Randomly choose direction: 1 = exits right, -1 = exits left
          this.cloudDirection = Math.random() < 0.5 ? 1 : -1;
        }
      } else {
        // Animate cloud (zoom from dot to full size, moving diagonally)
        this.cloudProgress += deltaMs / this.cloudAnimDuration;
        if (this.cloudProgress >= 1) {
          // Animation complete, reset
          this.cloudActive = false;
          this.cloudTimer = this.cloudInterval;
          this.cloudMessage = null;
        }
      }
    }

    // Billboard and banner disabled for now
  }

  drawCloudNotification() {
    if (!this.cloudActive || !this.cloudMessage || !this.cloudEnabled) return;

    // Hide text when not needed
    if (this.cloudText) this.cloudText.setVisible(false);

    const horizon = this.height * 0.35;
    const progress = this.cloudProgress; // 0 to 1

    // ========== ANIMATION PHASES ==========
    // Phase 1: 0.00 - 0.15 = Fade in + start zoom (15%)
    // Phase 2: 0.15 - 0.80 = Moving/scaling to full size (65%)
    // Phase 3: 0.80 - 1.00 = PAUSE at full size (~1.4 seconds), then disappear instantly

    // Calculate movement progress (capped during pause phase)
    let moveProgress;
    if (progress <= 0.80) {
      // Normal movement during phases 1-2
      moveProgress = progress / 0.80; // 0 to 1 over first 80% of animation
    } else {
      // Pause phase - stay at full position until disappearing
      moveProgress = 1.0;
    }

    // Easing function for smooth zoom (ease-out)
    const easeOut = 1 - Math.pow(1 - Math.min(moveProgress, 1), 3);

    // Scale: starts tiny (0.1), grows to full (1.0), stays at 1.0 during pause
    const scale = Math.min(1.0, 0.1 + easeOut * 0.9);

    // Position: starts at center-top, moves diagonally toward edge
    const startX = this.width / 2;
    const startY = horizon * 0.25;

    // End position based on direction (pause position)
    const pauseX = this.cloudDirection > 0 ? this.width * 0.65 : this.width * 0.35;
    const endY = horizon * 0.5;

    // Calculate current X (moves to pause position, stays there)
    const cx = startX + (pauseX - startX) * easeOut;
    const cy = startY + (endY - startY) * easeOut + Math.sin(this.elapsedTime * 3) * 5 * scale;

    // Cloud base sizes (will be multiplied by scale)
    const baseRadius = 35;

    // Cloud opacity (fade in at start only, then full until instant disappear)
    let opacity = 1;
    if (progress < 0.15) {
      opacity = progress / 0.15; // Fade in only
    }
    // No fade out - cloud disappears instantly at progress = 1.0

    // Draw cloud shape (multiple overlapping circles for fluffy look)
    this.bgGraphics.fillStyle(0xFFFFFF, opacity * 0.95);

    // Main cloud body - scaled (pure white, no shadow)
    const r = baseRadius * scale;
    this.bgGraphics.fillCircle(cx, cy, r);
    this.bgGraphics.fillCircle(cx - r * 0.7, cy + r * 0.2, r * 0.7);
    this.bgGraphics.fillCircle(cx + r * 0.7, cy + r * 0.2, r * 0.7);
    this.bgGraphics.fillCircle(cx - r * 0.4, cy - r * 0.4, r * 0.6);
    this.bgGraphics.fillCircle(cx + r * 0.4, cy - r * 0.4, r * 0.6);

    // Draw text INSIDE the cloud - scales together with cloud from the start
    if (!this.cloudText) {
      this.cloudText = this.add.text(0, 0, '', {
        fontSize: '14px',
        fontFamily: 'Arial Black, Arial, sans-serif',
        color: '#1a5276',
        align: 'center',
        fontStyle: 'bold',
      });
      this.cloudText.setOrigin(0.5);
      this.cloudText.setDepth(100);
    }

    // Scale font size with cloud (text grows from dot along with cloud)
    const baseFontSize = 18;
    const fontSize = Math.max(1, Math.floor(baseFontSize * scale));
    this.cloudText.setFontSize(fontSize);
    this.cloudText.setPosition(cx, cy);
    this.cloudText.setText(this.cloudMessage);
    this.cloudText.setAlpha(opacity);
    this.cloudText.setScale(scale); // Additional scaling for smooth dot-to-full effect
    this.cloudText.setVisible(true);
  }

  drawBillboardNotification(lines) {
    // Disabled for now
    if (!this.billboardEnabled) return;
  }

  drawBannerNotification(lines) {
    // Disabled for now
    if (!this.bannerEnabled) return;
  }

  hideNotificationTexts() {
    // Hide text objects when not in use
    if (this.cloudText) this.cloudText.setVisible(false);
    if (this.boostTapText) this.boostTapText.setVisible(false);

    // Hide all diversion texts (will be shown again in drawBarricade if needed)
    if (this.diversionTexts) {
      for (const text of this.diversionTexts) {
        text.setVisible(false);
      }
    }

    // Hide all hole warning texts (will be shown again in drawHole if needed)
    if (this.holeWarningTexts) {
      for (const text of this.holeWarningTexts) {
        text.setVisible(false);
      }
    }

    // Hide all gantry sign texts (will be shown again in drawGantrySign if needed)
    if (this.gantryTexts) {
      for (const text of this.gantryTexts) {
        text.setVisible(false);
      }
    }
  }
}

export default RacingScene;
