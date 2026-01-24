import Phaser from 'phaser';
import {
  VEHICLES,
  ROAD_TYPES,
  GAME_CONFIG
} from '../../data/gameData';

/**
 * RacingScene - Simple pseudo-3D racing
 * Clean rendering approach that actually works
 */
class RacingScene extends Phaser.Scene {
  constructor(callbacks = {}) {
    super({ key: 'RacingScene' });

    this.onProgress = callbacks.onProgress || (() => {});
    this.onObstacleHit = callbacks.onObstacleHit || (() => {});
    this.onBoostUsed = callbacks.onBoostUsed || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});

    this.vehicleId = 'car';
    this.roadType = 'highway';
    this.credits = 200;
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

    // Speed - keep it slow
    this.maxSpeed = 12 * this.segmentLength;
    this.accel = 6 * this.segmentLength;
    this.decel = 10 * this.segmentLength;
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

    // Graphics layers
    this.bgGraphics = this.add.graphics();
    this.roadGraphics = this.add.graphics();
    this.spriteGraphics = this.add.graphics();

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Start with some speed
    this.speed = this.maxSpeed * 0.5;
  }

  buildTrack() {
    this.segments = [];

    // Simple straight road - no curves for simplicity
    const totalSegments = 350;
    for (let i = 0; i < totalSegments; i++) {
      this.segments.push({
        index: i,
        curve: 0,  // All straight, no curves
        color: Math.floor(i / this.rumbleLength) % 2,
      });
    }

    this.trackLength = this.segments.length * this.segmentLength;
  }

  placeCars() {
    this.cars = [];
    const colors = [0x3388FF, 0x33CC33, 0xFFAA00, 0xCC3333, 0x9933CC];

    for (let i = 0; i < 12; i++) {
      // 40% go opposite direction (oncoming traffic - very fast relative to player)
      // 60% go same direction but MUCH slower (we overtake them quickly)
      const goingOpposite = Math.random() < 0.4;

      let carSpeed;
      let laneX;

      if (goingOpposite) {
        // Oncoming traffic - they move toward us, so relative speed is very high
        // Use negative speed (moving backward on track = coming at player)
        carSpeed = -this.maxSpeed * 0.3;  // Coming toward us
        laneX = -0.4 - Math.random() * 0.4;  // Left side of road (oncoming lane) -0.4 to -0.8
      } else {
        // Same direction traffic - move VERY slow so we pass them quickly
        carSpeed = this.maxSpeed * 0.1;  // Only 10% of our speed - we zoom past them
        laneX = 0.2 + Math.random() * 0.5;  // Right side of road 0.2 to 0.7
      }

      this.cars.push({
        z: (50 + Math.random() * (this.segments.length - 100)) * this.segmentLength,
        x: laneX,
        speed: carSpeed,
        color: colors[i % colors.length],
        opposite: goingOpposite,
      });
    }
  }

  update(time, delta) {
    const dt = Math.min(delta / 1000, 0.1);
    this.elapsedTime += dt;

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

    // Boost
    if (this.boosting) {
      targetSpeed *= 1.5;
      this.boostTimer -= dt;
      if (this.boostTimer <= 0) this.boosting = false;
    }

    // Hit slowdown
    if (this.isHit) {
      targetSpeed *= 0.3;
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

    // Wrap track
    while (this.playerZ >= this.trackLength) {
      this.playerZ -= this.trackLength;
    }

    // Steering - playerX ranges from -3.0 to 3.0 (3x range for much more movement)
    const speedPct = this.speed / this.maxSpeed;
    this.playerX += this.steerDirection * 4.0 * dt * speedPct;

    // Clamp to road bounds - allow car to move much further left/right
    this.playerX = Phaser.Math.Clamp(this.playerX, -3.0, 3.0);

    // Update traffic - cars move relative to player
    for (const car of this.cars) {
      // Car's absolute position change
      car.z += car.speed * dt;

      // Wrap around track
      if (car.z >= this.trackLength) car.z -= this.trackLength;
      if (car.z < 0) car.z += this.trackLength;
    }

    // Collisions
    this.checkCollisions();

    // Progress
    const progress = (this.playerZ / this.trackLength) * 100;
    this.onProgress(Math.min(100, Math.floor(progress)));

    if (progress >= 100 && !this.completed) {
      this.completed = true;
      this.onComplete(this.elapsedTime, this.obstaclesHit);
      return;
    }

    // Render
    this.render();
  }

  checkCollisions() {
    for (const car of this.cars) {
      // Calculate distance in front of player (positive = ahead of us)
      let dz = car.z - this.playerZ;

      // Handle track wrap-around
      if (dz < -this.trackLength / 2) dz += this.trackLength;
      if (dz > this.trackLength / 2) dz -= this.trackLength;

      // Collision box: car must be close in Z (within 150 units ahead or 50 behind)
      // and close in X (lateral position)
      const zCollision = dz > -50 && dz < 150;
      const xCollision = Math.abs(car.x - this.playerX) < 0.5;

      if (zCollision && xCollision && !this.isHit) {
        this.isHit = true;
        this.hitTimer = 1.0;  // Shorter recovery time
        this.obstaclesHit++;
        this.speed *= 0.2;  // Bigger slowdown
        this.cameras.main.shake(400, 0.03);
        this.onObstacleHit();

        // Push the traffic car away to prevent repeated collisions
        car.z += 300;
        if (car.z >= this.trackLength) car.z -= this.trackLength;
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

      // Road shifts based on playerX (player steers, road moves)
      // Reduced shift amount to prevent road edges from overlapping player car
      const roadShift = -this.playerX * scale * this.roadWidth * 0.25;
      const w = scale * this.roadWidth;

      lines.push({
        y: y,
        x: this.width / 2 + roadShift,
        w: w,
        scale: scale,
        color: seg.color,
        segIndex: segIndex,
        camDist: camDist,
      });
    }

    // Draw from far to near (reverse order)
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      const prev = i < lines.length - 1 ? lines[i + 1] : null;

      if (!prev) continue;

      this.drawRoadLine(line, prev);
    }

    // Draw the closest road segment extending to the bottom of screen
    if (lines.length > 0) {
      const closest = lines[0];
      // Bottom line shifts same as closest segment - reduced to prevent overlap
      const bottomShift = -this.playerX * this.roadWidth * 0.12;
      const bottomLine = {
        y: this.height,
        x: this.width / 2 + bottomShift,
        w: closest.w * 1.5,
        color: closest.color,
      };
      this.drawRoadLine(closest, bottomLine);
    }

    // Draw traffic cars
    this.drawTraffic(lines);

    // Draw player car
    this.drawPlayerCar();
  }

  drawRoadLine(line, prev) {
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

    // Lane markings (on light segments only)
    if (isLight && line.w > 20) {
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

  drawPlayerCar() {
    // Car is ALWAYS CENTERED - road shifts, not car (classic OutRun style)
    const playerScreenX = this.width / 2;
    const playerScreenY = this.height - 50;  // Near bottom of screen

    // Car dimensions - REAR VIEW (wider than tall, like looking at back of car)
    const carW = 90;
    const carH = 50;

    // Colors
    const vehicleColors = {
      bike: 0x44AA44,
      car: 0xDD3333,
      tractor: 0xFFAA00,
      truck: 0x4444AA,
      sports_car: 0xFFFF00,
    };
    let bodyColor = vehicleColors[this.vehicleId] || 0xDD3333;

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

    // License plate area (center)
    this.spriteGraphics.fillStyle(0xFFFFFF, 1);
    this.spriteGraphics.fillRect(playerScreenX - 15, playerScreenY - carH + 8, 30, 10);
    this.spriteGraphics.fillStyle(0x333333, 1);
    this.spriteGraphics.fillRect(playerScreenX - 13, playerScreenY - carH + 10, 26, 6);

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

  // External controls
  steer(direction) {
    this.steerDirection = direction;
  }

  activateBoost() {
    if (this.boosting) return;
    if (this.credits >= GAME_CONFIG.boostCost) {
      this.boosting = true;
      this.boostTimer = GAME_CONFIG.boostDuration;
      this.cameras.main.flash(100, 255, 255, 0);
      this.onBoostUsed();
    }
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
}

export default RacingScene;
