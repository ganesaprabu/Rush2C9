// Rush2C9 Game Data
// All game constants and configuration

export const STARTING_CITIES = [
  { id: 1, name: 'Tokyo', region: 'Asia', distance: 8800 },
  { id: 2, name: 'Seoul', region: 'Asia', distance: 9500 },
  { id: 3, name: 'Chennai', region: 'Asia', distance: 14500 },
  { id: 4, name: 'Dubai', region: 'Middle East', distance: 13400 },
  { id: 5, name: 'Sydney', region: 'Oceania', distance: 12000 },
  { id: 6, name: 'London', region: 'Europe', distance: 8800 },
  { id: 7, name: 'Paris', region: 'Europe', distance: 9100 },
  { id: 8, name: 'Berlin', region: 'Europe', distance: 9300 },
  { id: 9, name: 'São Paulo', region: 'South America', distance: 9900 },
  { id: 10, name: 'Toronto', region: 'North America', distance: 3500 },
];

export const DESTINATIONS = [
  { id: 'lcs', name: 'LCS Arena', location: 'Los Angeles, USA', game: 'League of Legends' },
  { id: 'vct', name: 'VCT Arena', location: 'Los Angeles, USA', game: 'VALORANT' },
];

export const VEHICLES = [
  { id: 'bike', name: 'Bike', emoji: '🚲', cost: 20, landSpeed: 1, waterSpeed: 0.2, airSpeed: 0 },
  { id: 'car', name: 'Car', emoji: '🚗', cost: 40, landSpeed: 2, waterSpeed: 0.2, airSpeed: 0 },
  { id: 'train', name: 'Train', emoji: '🚂', cost: 50, landSpeed: 2, waterSpeed: 0, airSpeed: 0 },
  { id: 'ship', name: 'Ship', emoji: '🚢', cost: 60, landSpeed: 0.5, waterSpeed: 2, airSpeed: 0 },
  { id: 'plane', name: 'Plane', emoji: '✈️', cost: 100, landSpeed: 0, waterSpeed: 1.5, airSpeed: 3 },
];

export const AVATAR_CATEGORIES = {
  cars: { name: 'Cars', icons: ['🚗', '🚕', '🚙', '🏎️', '🚓', '🚑', '🚒', '🛻', '🚐', '🏁'] },
  bikes: { name: 'Bikes', icons: ['🏍️', '🛵', '🚲', '🛴', '🏇', '🚴', '🚵', '🛺', '🚜', '🏊'] },
  tech: { name: 'Tech', icons: ['📱', '💻', '🖥️', '⌨️', '🎧', '📷', '🎬', '🔌', '💡', '🤖'] },
  gaming: { name: 'Gaming', icons: ['🎮', '👾', '🕹️', '🏆', '🎯', '🎲', '♟️', '🃏', '🎰', '👽'] },
  sports: { name: 'Sports', icons: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏓', '🥊', '🏋️', '🏅'] },
};

export const GAME_CONFIG = {
  startingCredits: 200,
  basePoints: 500,
  maxTimeBonus: 300,
  segments: 3,
  routesPerSegment: 3,
  minBet: 10,
  maxBetPercent: 0.5,
  gameTimeout: 300, // 5 minutes in seconds
};

export const ROUTE_TYPES = [
  { type: 'direct', name: 'Direct', description: 'Shortest path, may cross water' },
  { type: 'scenic', name: 'Scenic', description: 'Medium distance, mixed terrain' },
  { type: 'safe', name: 'Safe', description: 'Longest path, mostly land' },
];
