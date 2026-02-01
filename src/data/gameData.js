// Rush2C9 Game Data
// All game constants and configuration

// ============================================================================
// STARTING CITIES
// ============================================================================
// 10 cities worldwide, each with unique waypoint cities en route to LA

export const STARTING_CITIES = [
  {
    id: 'tokyo',
    name: 'Tokyo',
    region: '🇯🇵 Japan',
    emoji: '🗼',
    baseDistance: 8800,
    waypoints: ['Honolulu', 'San Francisco']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'seoul',
    name: 'Seoul',
    region: '🇰🇷 South Korea',
    emoji: '🏯',
    baseDistance: 9500,
    waypoints: ['Shanghai', 'Honolulu']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'chennai',
    name: 'Chennai',
    region: '🇮🇳 India',
    emoji: '🛕',
    baseDistance: 14500,
    waypoints: ['Dubai', 'New York']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'dubai',
    name: 'Dubai',
    region: '🇦🇪 UAE',
    emoji: '🏗️',
    baseDistance: 13400,
    waypoints: ['Istanbul', 'Chicago']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'sydney',
    name: 'Sydney',
    region: '🇦🇺 Australia',
    emoji: '🦘',
    baseDistance: 12000,
    waypoints: ['Auckland', 'Honolulu']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'london',
    name: 'London',
    region: '🇬🇧 United Kingdom',
    emoji: '🎡',
    baseDistance: 8800,
    waypoints: ['Dublin', 'Reykjavik']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'paris',
    name: 'Paris',
    region: '🇫🇷 France',
    emoji: '🗼',
    baseDistance: 9100,
    waypoints: ['Madrid', 'Miami']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'berlin',
    name: 'Berlin',
    region: '🇩🇪 Germany',
    emoji: '🏛️',
    baseDistance: 9300,
    waypoints: ['Amsterdam', 'Toronto']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'sao_paulo',
    name: 'São Paulo',
    region: '🇧🇷 Brazil',
    emoji: '🌴',
    baseDistance: 9900,
    waypoints: ['Lima', 'Mexico City']  // 2 waypoints, Seg 3 ends at LA
  },
  {
    id: 'toronto',
    name: 'Toronto',
    region: '🇨🇦 Canada',
    emoji: '🍁',
    baseDistance: 3500,
    waypoints: ['Chicago', 'Denver']  // 2 waypoints, Seg 3 ends at LA
  },
];

// ============================================================================
// DESTINATIONS
// ============================================================================

export const DESTINATIONS = [
  {
    id: 'lcs',
    name: 'LCS Arena',
    location: '🇺🇸 Los Angeles',
    game: 'League of Legends',
    emoji: '🏟️',
    color: '#0066CC' // Cloud9 blue
  },
  {
    id: 'vct',
    name: 'VCT Arena',
    location: '🇺🇸 Los Angeles',
    game: 'VALORANT',
    emoji: '🎯',
    color: '#FF4655' // VALORANT red
  },
];

// ============================================================================
// ROAD TYPES
// ============================================================================
// 4 road types with different characteristics

export const ROAD_TYPES = {
  highway: {
    id: 'highway',
    name: 'Highway',
    emoji: '🛣️',
    description: 'Smooth, fast, wide lanes',
    color: '#4A5568', // Gray
    baseSpeed: 1.0,
    obstacleFrequency: 'low',
    obstacleTypes: ['car', 'truck', 'barrier']
  },
  tar: {
    id: 'tar',
    name: 'Tar Road',
    emoji: '🛤️',
    description: 'Normal paved road',
    color: '#2D3748', // Dark gray
    baseSpeed: 0.85,
    obstacleFrequency: 'medium',
    obstacleTypes: ['car', 'pothole', 'pedestrian']
  },
  mud: {
    id: 'mud',
    name: 'Mud Road',
    emoji: '🟤',
    description: 'Wet, slippery, slow',
    color: '#8B5A2B', // Brown
    baseSpeed: 0.6,
    obstacleFrequency: 'medium',
    obstacleTypes: ['puddle', 'rock', 'fallen_tree']
  },
  bumpy: {
    id: 'bumpy',
    name: 'Bumpy Road',
    emoji: '🪨',
    description: 'Rocky, uneven surface',
    color: '#A0522D', // Sienna
    baseSpeed: 0.5,
    obstacleFrequency: 'high',
    obstacleTypes: ['rock', 'hole', 'debris']
  }
};

// ============================================================================
// VEHICLES
// ============================================================================
// 5 vehicles optimized for different road types

export const VEHICLES = {
  bike: {
    id: 'bike',
    name: 'Bike',
    emoji: '🚲',
    cost: 20,
    description: 'Cheap but vulnerable',
    // Speed multipliers per road type (applied to road's baseSpeed)
    speedOnRoad: {
      highway: 0.7,  // SLOW - Too slow for highways
      tar: 1.2,      // GOOD - Perfect for normal roads
      mud: 0.5,      // BAD - Slips everywhere
      bumpy: 0.8     // SLOW - Handles okay
    },
    handling: 'high',     // Easy to steer
    acceleration: 'fast', // Quick start
    hitPenalty: 0.4       // Loses 40% speed on hit
  },
  car: {
    id: 'car',
    name: 'Car',
    emoji: '🚗',
    cost: 40,
    description: 'Balanced all-rounder',
    speedOnRoad: {
      highway: 1.0,  // GOOD - Made for highways
      tar: 1.0,      // GOOD - Works well
      mud: 0.6,      // SLOW - Struggles a bit
      bumpy: 0.7     // SLOW - Not ideal
    },
    handling: 'medium',
    acceleration: 'medium',
    hitPenalty: 0.3       // Loses 30% speed on hit
  },
  tractor: {
    id: 'tractor',
    name: 'Tractor',
    emoji: '🚜',
    cost: 50,
    description: 'Mud master, slow on roads',
    speedOnRoad: {
      highway: 0.5,  // BAD - Way too slow
      tar: 0.6,      // SLOW - Not great
      mud: 1.3,      // GOOD - Built for this!
      bumpy: 1.0     // GOOD - Handles well
    },
    handling: 'low',
    acceleration: 'slow',
    hitPenalty: 0.15      // Only loses 15% - tough vehicle
  },
  truck: {
    id: 'truck',
    name: 'Truck',
    emoji: '🛻',
    cost: 60,
    description: 'Tough on rough terrain',
    speedOnRoad: {
      highway: 0.8,  // SLOW - Heavy vehicle
      tar: 0.9,      // GOOD - Works fine
      mud: 1.0,      // GOOD - Handles well
      bumpy: 1.2     // GOOD - Built for this!
    },
    handling: 'low',
    acceleration: 'slow',
    hitPenalty: 0.1       // Only loses 10% - very tough
  },
  sports_car: {
    id: 'sports_car',
    name: 'Sports Car',
    emoji: '🏎️',
    cost: 100,
    description: 'Speed demon on smooth roads',
    speedOnRoad: {
      highway: 1.5,  // BEST - Born for speed
      tar: 1.2,      // GOOD - Still fast
      mud: 0.3,      // BAD - Terrible grip
      bumpy: 0.4     // BAD - Too low clearance
    },
    handling: 'medium',
    acceleration: 'very_fast',
    hitPenalty: 0.5       // Loses 50% - fragile at high speed
  }
};

// Helper to get vehicle as array (for UI rendering)
export const VEHICLES_ARRAY = Object.values(VEHICLES);

// Speed rating labels for UI
export const getSpeedRating = (speedMultiplier) => {
  if (speedMultiplier >= 1.2) return { label: 'BEST', color: '#10B981', stars: 3 };
  if (speedMultiplier >= 1.0) return { label: 'GOOD', color: '#3B82F6', stars: 2 };
  if (speedMultiplier >= 0.7) return { label: 'SLOW', color: '#F59E0B', stars: 1 };
  return { label: 'BAD', color: '#EF4444', stars: 0 };
};

// ============================================================================
// ROUTE OPTIONS
// ============================================================================
// 3 route difficulties per segment

export const ROUTE_DIFFICULTIES = {
  safe: {
    id: 'safe',
    name: 'Safe Route',
    emoji: '🟢',
    description: 'Easy roads, fewer obstacles',
    pointsMultiplier: 1.0,
    roadDistribution: { highway: 0.5, tar: 0.4, mud: 0.1, bumpy: 0.0 }
  },
  moderate: {
    id: 'moderate',
    name: 'Moderate Route',
    emoji: '🟡',
    description: 'Mixed terrain, balanced challenge',
    pointsMultiplier: 1.2,
    roadDistribution: { highway: 0.3, tar: 0.3, mud: 0.2, bumpy: 0.2 }
  },
  risky: {
    id: 'risky',
    name: 'Risky Route',
    emoji: '🔴',
    description: 'Tough roads, more points!',
    pointsMultiplier: 1.5,
    roadDistribution: { highway: 0.1, tar: 0.2, mud: 0.3, bumpy: 0.4 }
  }
};

// ============================================================================
// AVATAR CATEGORIES
// ============================================================================

export const AVATAR_CATEGORIES = {
  cars: { name: 'Cars', icons: ['🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚒', '🛻', '🚐', '🏁'] },
  bikes: { name: 'Bikes', icons: ['🏍️', '🛵', '🚲', '🛴', '🏇', '🚴', '🚵', '🛺', '🚜', '🏊'] },
  tech: { name: 'Tech', icons: ['📱', '💻', '🖥️', '⌨️', '🎧', '📷', '🎬', '🔌', '💡', '🤖'] },
  gaming: { name: 'Gaming', icons: ['🎮', '👾', '🕹️', '🏆', '🎯', '🎲', '♟️', '🃏', '🎰', '👽'] },
  sports: { name: 'Sports', icons: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🏋️', '🏅'] },
};

// ============================================================================
// SEGMENT & SPEED CONFIGURATION (Added Jan 24)
// ============================================================================
// Highly configurable - adjust based on testing

export const SEGMENT_CONFIG = {
  // Distance per segment (in km) - Segment 1, 2, 3
  distances: [5, 7, 9],

  // Starting speed for each segment (km/h display) - Segment 1, 2, 3
  startSpeed: [200, 225, 250],

  // Speed increases by this amount every 1 km traveled
  speedIncreasePerKm: 5,

  // Maximum speed cap (km/h)
  maxSpeed: 300,

  // Vehicle for each segment
  vehicles: ['car', 'truck', 'sports_car'],

  // Obstacle types for each segment (progressively harder)
  obstacles: [
    ['hole', 'barricade'],           // Segment 1: Basic obstacles
    ['oil_barrel', 'construction_barrier'],  // Segment 2: Medium difficulty (biohazard barrel)
    ['tire_stack', 'cone_cluster'],  // Segment 3: Hard (to be implemented)
  ],

  // Traffic speed multiplier for each segment (higher = faster traffic)
  trafficSpeed: [0.3, 0.5, 0.7],
};

export const BOOST_CONFIG = {
  // Boost multiplier (1.5 = 50% speed increase)
  // This affects BOTH actual speed and display speed
  multiplier: 1.5,

  // Boost lasts this many seconds (temporary)
  duration: 3,

  // Cooldown before boost can be used again (seconds)
  cooldown: 10,
};

export const COLLISION_CONFIG = {
  // Speed reduction on collision (percentage, 0.7 = 30% slowdown)
  speedReduction: 0.7,

  // How long the slowdown lasts (seconds)
  slowdownDuration: 1.5,
};

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export const GAME_CONFIG = {
  // Credits
  startingCredits: 200,
  boostCost: 0,            // Boost is now FREE (system-driven cooldown)
  skipSegmentCost: 100,    // Cost to skip segment 2 and go directly to segment 3

  // Scoring (based on distance/time)
  basePoints: 500,
  maxTimeBonus: 300,
  creditsToPointsRatio: 1, // 1 credit saved = 1 point
  hitPenalty: 50,          // Points deducted per obstacle hit

  // Game structure
  segments: 3,
  routesPerSegment: 3,

  // Racing mechanics
  segmentDuration: 45,      // Target seconds per segment (not strict timer)
  obstacleHitSlowdown: 0.3, // Speed reduction on obstacle hit (30%)
  speedRecoveryRate: 0.05,  // Speed recovery per second after hit
  boostSpeedMultiplier: 1.5,// 50% speed boost
  boostDuration: 2,         // Seconds per boost

  // Duels
  minBet: 10,
  maxBetPercent: 0.5,       // Can bet up to 50% of score

  // Timeouts
  gameTimeout: 300,         // 5 minutes max per game
};

// ============================================================================
// PHASER GAME CONFIG
// ============================================================================

export const PHASER_CONFIG = {
  // Canvas dimensions (will scale to fit screen)
  width: 400,
  height: 600,

  // Road rendering (pseudo-3D)
  roadWidth: 200,
  segmentLength: 200,      // Length of each road segment
  rumbleLength: 3,         // Number of segments per rumble strip
  drawDistance: 100,       // How many segments to draw ahead

  // Player car
  playerY: 0.75,           // Player position (0-1, 1 = bottom of screen)
  maxSpeed: 300,           // Max speed in units/second
  accel: 150,              // Acceleration rate
  braking: 200,            // Deceleration rate

  // Steering
  centrifugal: 0.3,        // Centrifugal force on curves
  offRoadSlowdown: 0.65,   // Speed when off road

  // Sprites
  spriteScale: 0.3,        // Scale factor for sprites

  // Colors
  colors: {
    sky: '#72D7EE',
    grass: ['#10AA10', '#009A00'],
    rumble: ['#555555', '#BBBBBB'],
    road: ['#6B6B6B', '#696969'],
    lane: '#CCCCCC'
  }
};

// ============================================================================
// OBSTACLES
// ============================================================================

export const OBSTACLES = {
  car: {
    id: 'car',
    name: 'Slow Car',
    emoji: '🚙',
    width: 0.8,            // Relative to player width
    slowdownOnHit: 0.4,    // 40% speed reduction
    canDestroy: false
  },
  truck: {
    id: 'truck',
    name: 'Truck',
    emoji: '🚛',
    width: 1.2,
    slowdownOnHit: 0.5,
    canDestroy: false
  },
  barrier: {
    id: 'barrier',
    name: 'Road Barrier',
    emoji: '🚧',
    width: 0.5,
    slowdownOnHit: 0.6,
    canDestroy: true
  },
  pothole: {
    id: 'pothole',
    name: 'Pothole',
    emoji: '🕳️',
    width: 0.4,
    slowdownOnHit: 0.2,
    canDestroy: false
  },
  rock: {
    id: 'rock',
    name: 'Rock',
    emoji: '🪨',
    width: 0.3,
    slowdownOnHit: 0.3,
    canDestroy: true
  },
  puddle: {
    id: 'puddle',
    name: 'Puddle',
    emoji: '💧',
    width: 0.6,
    slowdownOnHit: 0.15,
    canDestroy: false
  },
  fallen_tree: {
    id: 'fallen_tree',
    name: 'Fallen Tree',
    emoji: '🌳',
    width: 1.5,
    slowdownOnHit: 0.7,
    canDestroy: false
  },
  debris: {
    id: 'debris',
    name: 'Road Debris',
    emoji: '🗑️',
    width: 0.4,
    slowdownOnHit: 0.25,
    canDestroy: true
  },
  hole: {
    id: 'hole',
    name: 'Deep Hole',
    emoji: '⚫',
    width: 0.5,
    slowdownOnHit: 0.35,
    canDestroy: false
  },
  pedestrian: {
    id: 'pedestrian',
    name: 'Pedestrian',
    emoji: '🚶',
    width: 0.3,
    slowdownOnHit: 0.5,    // Big penalty for hitting people!
    canDestroy: false
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random starting city
 */
export const getRandomStartingCity = () => {
  const index = Math.floor(Math.random() * STARTING_CITIES.length);
  return STARTING_CITIES[index];
};

/**
 * Generate route segments for a journey
 * @param {string} startCityId - Starting city ID
 * @param {string} difficulty - Route difficulty (safe/moderate/risky)
 * @returns {Array} Array of 3 segment objects
 */
export const generateRouteSegments = (startCityId, difficulty = 'moderate') => {
  const city = STARTING_CITIES.find(c => c.id === startCityId);
  if (!city) return [];

  const diff = ROUTE_DIFFICULTIES[difficulty];
  // 2 waypoints + Los Angeles as final destination = 3 segments
  // Route: City → WP1 → WP2 → Los Angeles
  const waypoints = [...city.waypoints, 'Los Angeles'];

  return waypoints.map((waypoint, index) => {
    // All segments use highway for consistent experience
    const roadType = 'highway';
    const distance = Math.floor(city.baseDistance / 3 * (0.8 + Math.random() * 0.4));

    return {
      index: index + 1,
      from: index === 0 ? city.name : waypoints[index - 1],
      to: waypoint,
      roadType: roadType,
      distance: distance,
      pointsMultiplier: diff.pointsMultiplier
    };
  });
};

/**
 * Select road type based on probability distribution
 */
const selectRoadType = (distribution) => {
  const rand = Math.random();
  let cumulative = 0;

  for (const [roadId, probability] of Object.entries(distribution)) {
    cumulative += probability;
    if (rand <= cumulative) {
      return roadId;
    }
  }
  return 'tar'; // Default fallback
};

/**
 * Calculate time for a segment based on vehicle and road
 * @param {string} vehicleId - Vehicle ID
 * @param {string} roadType - Road type ID
 * @param {number} distance - Segment distance
 * @param {number} skillMultiplier - Player skill (1.0 = average, lower = faster)
 * @returns {number} Time in seconds
 */
export const calculateSegmentTime = (vehicleId, roadType, distance, skillMultiplier = 1.0) => {
  const vehicle = VEHICLES[vehicleId];
  const road = ROAD_TYPES[roadType];

  if (!vehicle || !road) return 60; // Default 60 seconds

  const speedMultiplier = vehicle.speedOnRoad[roadType] * road.baseSpeed;
  const baseTime = distance / 100; // Base time calculation

  return Math.floor(baseTime / speedMultiplier * skillMultiplier);
};

/**
 * Calculate final score
 */
export const calculateFinalScore = (baseTime, actualTime, creditsRemaining, routeMultiplier) => {
  const timeBonus = Math.max(0, GAME_CONFIG.maxTimeBonus - (actualTime - baseTime));
  const creditBonus = creditsRemaining * GAME_CONFIG.creditsToPointsRatio;

  const rawScore = GAME_CONFIG.basePoints + timeBonus + creditBonus;
  return Math.floor(rawScore * routeMultiplier);
};
