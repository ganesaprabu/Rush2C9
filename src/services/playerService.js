// Player Service - localStorage helpers for Rush2C9
import { AVATAR_CATEGORIES } from '../data/gameData';

const PLAYERS_KEY = 'rush2c9_players';      // All registered players
const CURRENT_KEY = 'rush2c9_current';      // Currently logged in player ID

/**
 * Get all registered players
 * @returns {Object} Map of playerId -> player data
 */
export const getAllPlayers = () => {
  try {
    const data = localStorage.getItem(PLAYERS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error reading players data:', error);
    return {};
  }
};

/**
 * Save all players to localStorage
 */
const savePlayers = (players) => {
  try {
    localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    return true;
  } catch (error) {
    console.error('Error saving players data:', error);
    return false;
  }
};

/**
 * Generate player ID from name
 */
const generatePlayerId = (firstName, lastName) => {
  return `${firstName.trim().toLowerCase()}_${lastName.trim().toLowerCase()}`;
};

/**
 * Get current logged in player
 * @returns {Object|null} Player data or null
 */
export const getPlayer = () => {
  try {
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (!currentId) return null;

    const players = getAllPlayers();
    return players[currentId] || null;
  } catch (error) {
    console.error('Error reading current player:', error);
    return null;
  }
};

/**
 * Set current player (login)
 */
const setCurrentPlayer = (playerId) => {
  try {
    localStorage.setItem(CURRENT_KEY, playerId);
    return true;
  } catch (error) {
    console.error('Error setting current player:', error);
    return false;
  }
};

/**
 * Clear current player (logout - keeps account)
 */
export const logoutPlayer = () => {
  try {
    localStorage.removeItem(CURRENT_KEY);
    return true;
  } catch (error) {
    console.error('Error logging out:', error);
    return false;
  }
};

/**
 * Create a new player
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} avatarCategory - Category key (e.g., 'cars')
 * @param {number} avatarIndex - Index within category
 * @returns {Object|null} Created player or null if name already exists
 */
export const createPlayer = (firstName, lastName, avatarCategory, avatarIndex) => {
  const playerId = generatePlayerId(firstName, lastName);
  const players = getAllPlayers();

  // Check if player already exists
  if (players[playerId]) {
    return null; // Player already exists
  }

  const player = {
    id: playerId,
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    avatarCategory,
    avatarIndex,
    score: 0,
    faction: null,
    gamesPlayed: 0,
    createdAt: new Date().toISOString(),
  };

  players[playerId] = player;
  savePlayers(players);
  setCurrentPlayer(playerId);

  return player;
};

/**
 * Get avatar emoji from player data
 * @param {Object} player - Player object with avatarCategory and avatarIndex
 * @returns {string} Emoji string
 */
export const getAvatarEmoji = (player) => {
  if (!player || !player.avatarCategory) return '👤';

  const category = AVATAR_CATEGORIES[player.avatarCategory];
  if (!category) return '👤';

  return category.icons[player.avatarIndex] || '👤';
};

/**
 * Validate player login (name + avatar match)
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} avatarCategory
 * @param {number} avatarIndex
 * @returns {boolean} True if credentials match and player logged in
 */
export const validatePlayer = (firstName, lastName, avatarCategory, avatarIndex) => {
  const playerId = generatePlayerId(firstName, lastName);
  const players = getAllPlayers();
  const player = players[playerId];

  if (!player) return false;

  const isValid = (
    player.avatarCategory === avatarCategory &&
    player.avatarIndex === avatarIndex
  );

  if (isValid) {
    setCurrentPlayer(playerId);
  }

  return isValid;
};

/**
 * Check if player with this name exists
 */
export const playerExists = (firstName, lastName) => {
  const playerId = generatePlayerId(firstName, lastName);
  const players = getAllPlayers();
  return !!players[playerId];
};

/**
 * Check if a player is currently logged in
 * @returns {boolean}
 */
export const hasPlayer = () => {
  return getPlayer() !== null;
};

/**
 * Update player score
 * @param {number} points - Points to add
 */
export const addScore = (points) => {
  const player = getPlayer();
  if (!player) return false;

  const players = getAllPlayers();
  players[player.id].score += points;
  players[player.id].gamesPlayed += 1;
  savePlayers(players);

  return true;
};

/**
 * Set player faction (first game only)
 * @param {string} faction - 'lcs' or 'vct'
 */
export const setFaction = (faction) => {
  const player = getPlayer();
  if (!player) return false;

  const players = getAllPlayers();
  if (!players[player.id].faction) {
    players[player.id].faction = faction;
    savePlayers(players);
  }

  return true;
};

/**
 * Delete current player account completely
 */
export const deletePlayer = () => {
  try {
    const player = getPlayer();
    if (!player) return false;

    const players = getAllPlayers();
    delete players[player.id];
    savePlayers(players);
    localStorage.removeItem(CURRENT_KEY);

    return true;
  } catch (error) {
    console.error('Error deleting player:', error);
    return false;
  }
};

/**
 * Clear player data (logout only - keeps account)
 * @deprecated Use logoutPlayer() instead
 */
export const clearPlayer = () => {
  return logoutPlayer();
};

/**
 * Get player display name
 * @param {Object} player
 * @returns {string} "FirstName LastName"
 */
export const getDisplayName = (player) => {
  if (!player) return 'Traveler';
  return `${player.firstName} ${player.lastName}`;
};
