// Rush2C9 Notification System
// Sky clouds (branding messages) and Billboards (tips/announcements) - for later

// Import gantry sign config from JSON (organizer-editable)
import gantryConfig from './gantryConfig.json';

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
// CLOUD MESSAGES - Simple branding text displayed inside clouds
// ============================================================================
// Short, impactful messages that fit inside a cloud shape

// Bucket 0: Theme name - highest priority (shown every 3rd cloud)
export const CLOUD_MESSAGES_THEME = [
  "Sky's the Limit",
  "#SkysTheLimit",
];

// Bucket 1: Event & Branding (70% of remaining)
export const CLOUD_MESSAGES_BRANDING = [
  "JetBrains",
  "Cloud9",
  "☁️ C9",
  "Rush2C9",
  "LCS 2026",
  "VCT Arena",
  "Go Cloud9!",
  "Code Smart",
  "Race On!",
];

// Bucket 2: JetBrains IDEs (30% of remaining)
export const CLOUD_MESSAGES_IDES = [
  "IntelliJ IDEA",
  "PyCharm",
  "WebStorm",
  "PhpStorm",
  "GoLand",
  "CLion",
  "Rider",
  "DataGrip",
  "Fleet",
  "RustRover",
  "Aqua",
];

// Track recently shown messages to avoid repeats
let recentMessages = [];
let cloudCounter = 0;
const MAX_RECENT = 5; // Don't repeat last 5 messages

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
// Future: Organizer portal will update this JSON via API
//
// Destination signs (blue) - show 2 locations with arrows
// Message signs (green) - event/sponsor messages (MAX 25 chars for readability)

export const GANTRY_DESTINATIONS = gantryConfig.destinations;
export const GANTRY_EVENT_MESSAGES = gantryConfig.messages;

// Get gantry sign content for a specific position
// Returns { type: 'destination' | 'event', content: {...} }
export const getGantrySignContent = (signIndex, totalDistance, remainingKm) => {
  // Alternate between destination signs and event messages
  // First sign = destination, second = event, third = destination, etc.
  if (signIndex % 2 === 0) {
    // Destination sign - shows 2 locations with arrows
    const destIndex = Math.floor(signIndex / 2) % GANTRY_DESTINATIONS.length;
    const dest = GANTRY_DESTINATIONS[destIndex];
    return {
      type: 'destination',
      primary: dest.primary,
      secondary: dest.secondary,
      secondaryDir: dest.secondaryDir,
    };
  } else {
    // Event message (green sign)
    const eventIndex = Math.floor(signIndex / 2) % GANTRY_EVENT_MESSAGES.length;
    const event = GANTRY_EVENT_MESSAGES[eventIndex];
    return {
      type: 'event',
      text: event.text,
      messageType: event.type,
    };
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a random cloud message with no repeats
 * - Every 3rd cloud shows "Sky's the Limit" theme
 * - Other clouds: 70% branding, 30% IDEs
 */
export const getRandomCloudMessage = () => {
  cloudCounter++;

  let sourceArray;

  // Every 3rd cloud shows the theme name
  if (cloudCounter % 3 === 1) {
    sourceArray = CLOUD_MESSAGES_THEME;
  } else {
    // 70% branding, 30% IDEs for other clouds
    sourceArray = Math.random() < 0.7
      ? CLOUD_MESSAGES_BRANDING
      : CLOUD_MESSAGES_IDES;
  }

  // Filter out recently shown messages
  const available = sourceArray.filter(msg => !recentMessages.includes(msg));

  // If all messages were recently shown, reset and use full array
  const finalArray = available.length > 0 ? available : sourceArray;

  // Pick random message
  const index = Math.floor(Math.random() * finalArray.length);
  const message = finalArray[index];

  // Track this message to avoid repeats
  recentMessages.push(message);
  if (recentMessages.length > MAX_RECENT) {
    recentMessages.shift(); // Remove oldest
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
