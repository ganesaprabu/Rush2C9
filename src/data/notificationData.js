// Rush2C9 Notification System
// Sky clouds (branding messages) and Billboards (tips/announcements) - for later

// Import configs from JSON (organizer-editable)
import gantryConfig from './gantryConfig.json';
import cloudConfig from './cloudConfig.json';

// ============================================================================
// NOTIFICATION CONFIGURATION
// ============================================================================

export const NOTIFICATION_CONFIG = {
  // Cloud notifications (sky area - branding only)
  clouds: {
    enabled: true,
    animationDuration: 7000,  // Total animation time (ms) - dot to exit
    interval: 10000,          // Time between clouds (ms)
  },

  // Billboard notifications (grass area - roadside signs) - DISABLED FOR NOW
  billboards: {
    enabled: false,           // Will implement later
    displayDuration: 4000,
    interval: 10000,
  },

  // Overhead banner (high-priority messages) - DISABLED FOR NOW
  banners: {
    enabled: false,           // Will implement later
    displayDuration: 3000,
    interval: 20000,
  },

  // Overhead Gantry Sign Boards (highway-style overhead signs)
  gantry: {
    enabled: true,
    signsPerSegment: 3,       // 3 signs per 5km segment (~1.7km apart)
  },
};

// ============================================================================
// CLOUD MESSAGES - Loaded from cloudConfig.json
// ============================================================================
// To edit messages: modify src/data/cloudConfig.json
// Simple format: { "messages": ["Message 1", "Message 2", ...] }

export const CLOUD_MESSAGES = cloudConfig.messages;

// SIMPLE GLOBAL QUEUE for clouds - shuffle once, iterate through
// Guarantees ALL 22 messages appear before any repeat
let cloudQueue = [];
let cloudQueuePosition = 0;

// Initialize cloud queue with shuffled messages
const initCloudQueue = () => {
  const indices = Array.from({ length: CLOUD_MESSAGES.length }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  cloudQueue = indices;
  cloudQueuePosition = 0;
};

// Initialize on module load
initCloudQueue();

// ============================================================================
// JETBRAINS TIPS - For billboards (later)
// ============================================================================

export const JETBRAINS_TIPS = [
  { id: 1, text: "Double Shift opens Search Everywhere", icon: "🔍" },
  { id: 2, text: "Ctrl+Shift+A to Find Any Action", icon: "💡" },
  { id: 3, text: "Ctrl+E shows Recent Files", icon: "📁" },
  { id: 4, text: "Alt+Enter shows quick fixes", icon: "🔧" },
  { id: 5, text: "Shift+F6 to Rename anything", icon: "✏️" },
  { id: 6, text: "Try Junie AI for code suggestions!", icon: "🤖" },
  { id: 7, text: "Ctrl+Space for code completion", icon: "🎯" },
  { id: 8, text: "F8 to Step Over in debugger", icon: "🐛" },
];

// ============================================================================
// ORGANIZER ANNOUNCEMENTS - For billboards/banners (later)
// ============================================================================

export const ORGANIZER_ANNOUNCEMENTS = [
  { id: 1, text: "Welcome to Sky's the Limit Hackathon!", icon: "🎉", priority: "high" },
  { id: 2, text: "LCS Finals watch party at Cloud9 booth!", icon: "🏟️", priority: "high" },
  { id: 3, text: "Visit Cloud9 booth for exclusive swag!", icon: "☁️", priority: "normal" },
  { id: 4, text: "Top 3 projects win amazing prizes!", icon: "🏆", priority: "normal" },
];

// ============================================================================
// GANTRY SIGN MESSAGES - Loaded from gantryConfig.json
// ============================================================================
// To edit messages: modify src/data/gantryConfig.json
// Simple format: { "signs": [{ "top": "...", "bottom": "..." }, ...] }

export const GANTRY_SIGNS = gantryConfig.signs;

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// SIMPLE GLOBAL QUEUE - shuffle once, iterate through
// Guarantees ALL 30 signs appear before any repeat
let signQueue = [];
let queuePosition = 0;

// Initialize queue with shuffled signs
const initQueue = () => {
  const indices = Array.from({ length: GANTRY_SIGNS.length }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  signQueue = indices;
  queuePosition = 0;
};

// Initialize on module load
initQueue();

// No-op - kept for compatibility
export const reshuffleGantrySigns = () => {};

// Get next sign from queue - GUARANTEED unique until all 30 used
export const getGantrySignContent = () => {
  // Get next sign from shuffled queue
  const signIndex = signQueue[queuePosition];
  const sign = GANTRY_SIGNS[signIndex];

  // Move to next position
  queuePosition++;

  // Reshuffle when we've used all signs
  if (queuePosition >= signQueue.length) {
    initQueue();
  }

  return {
    type: 'destination',
    primary: sign.top,
    secondary: sign.bottom,
    secondaryDir: Math.random() < 0.5 ? 'left' : 'right',
  };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get next cloud message from queue - PURE GLOBAL RANDOM
 * Guarantees ALL 22 messages appear before any repeat
 */
export const getRandomCloudMessage = () => {
  // Get next message from shuffled queue
  const messageIndex = cloudQueue[cloudQueuePosition];
  const message = CLOUD_MESSAGES[messageIndex];

  // Move to next position
  cloudQueuePosition++;

  // Reshuffle when we've used all messages
  if (cloudQueuePosition >= cloudQueue.length) {
    initCloudQueue();
  }

  return message;
};

/**
 * Get a random JetBrains tip (for billboards - later)
 */
export const getRandomTip = () => {
  const index = Math.floor(Math.random() * JETBRAINS_TIPS.length);
  return JETBRAINS_TIPS[index];
};

/**
 * Get a random organizer announcement (for billboards - later)
 */
export const getRandomAnnouncement = (highPriorityOnly = false) => {
  const filtered = highPriorityOnly
    ? ORGANIZER_ANNOUNCEMENTS.filter(a => a.priority === 'high')
    : ORGANIZER_ANNOUNCEMENTS;
  const index = Math.floor(Math.random() * filtered.length);
  return filtered[index];
};
