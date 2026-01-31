// Player service for Firestore operations
// All operations are non-blocking and fail silently to never break the game

import { db } from './config';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'players';
const LEADERBOARD_LIMIT = 50;
const FETCH_TIMEOUT = 5000; // 5 seconds

/**
 * Generate a new UUID
 */
const generateUUID = () => {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Get or create player ID based on name
 * Same name on same browser = same UUID (cumulative score)
 * Different name = different UUID (new player)
 *
 * Stores a mapping of name → UUID in localStorage
 */
export const getPlayerId = (playerName) => {
  const MAPPING_KEY = 'rush2c9_nameToUUID';
  const CURRENT_KEY = 'rush2c9_playerId';

  // Get existing name→UUID mapping
  let mapping = {};
  try {
    const stored = localStorage.getItem(MAPPING_KEY);
    if (stored) {
      mapping = JSON.parse(stored);
    }
  } catch (e) {
    mapping = {};
  }

  // If no name provided, return current UUID or generate one
  if (!playerName) {
    let currentId = localStorage.getItem(CURRENT_KEY);
    if (!currentId) {
      currentId = generateUUID();
      localStorage.setItem(CURRENT_KEY, currentId);
    }
    return currentId;
  }

  // Normalize name (uppercase, trimmed)
  const normalizedName = playerName.toUpperCase().trim();

  // Check if this name already has a UUID
  if (mapping[normalizedName]) {
    const playerId = mapping[normalizedName];
    localStorage.setItem(CURRENT_KEY, playerId);
    return playerId;
  }

  // New name - generate new UUID
  const newPlayerId = generateUUID();
  mapping[normalizedName] = newPlayerId;

  // Save mapping and current ID
  localStorage.setItem(MAPPING_KEY, JSON.stringify(mapping));
  localStorage.setItem(CURRENT_KEY, newPlayerId);

  return newPlayerId;
};

/**
 * Save or update player score (fire-and-forget)
 * Cumulative scoring - adds to existing score
 */
export const saveScore = async (playerName, score, destination) => {
  if (!db) {
    console.warn('Firebase not available - score not saved');
    return;
  }

  const playerId = getPlayerId();

  try {
    const playerRef = doc(db, COLLECTION_NAME, playerId);
    const playerDoc = await getDoc(playerRef);

    if (playerDoc.exists()) {
      // Update existing player - cumulative score
      const existingData = playerDoc.data();
      await updateDoc(playerRef, {
        totalScore: (existingData.totalScore || 0) + score,
        playCount: (existingData.playCount || 0) + 1,
        lastDestination: destination,
        lastPlayedAt: serverTimestamp(),
        // Update name in case they changed it
        playerName: playerName
      });
      console.log('Score updated for existing player');
    } else {
      // Create new player
      await setDoc(playerRef, {
        playerId,
        playerName,
        totalScore: score,
        playCount: 1,
        lastDestination: destination,
        createdAt: serverTimestamp(),
        lastPlayedAt: serverTimestamp()
      });
      console.log('New player created');
    }
  } catch (error) {
    // Silent failure - don't break the game
    console.error('Error saving score:', error);
  }
};

/**
 * Fetch leaderboard with timeout
 * Returns empty array on failure
 */
export const fetchLeaderboard = async () => {
  if (!db) {
    console.warn('Firebase not available - returning empty leaderboard');
    return [];
  }

  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), FETCH_TIMEOUT);
    });

    // Create the fetch promise
    const fetchPromise = async () => {
      const playersRef = collection(db, COLLECTION_NAME);
      const q = query(
        playersRef,
        orderBy('totalScore', 'desc'),
        limit(LEADERBOARD_LIMIT)
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        ...doc.data()
      }));
    };

    // Race between fetch and timeout
    const leaderboard = await Promise.race([fetchPromise(), timeoutPromise]);
    return leaderboard;

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
};

/**
 * Get faction war stats (LCS vs VCT)
 * Returns percentages based on lastDestination
 */
export const getFactionStats = async () => {
  if (!db) {
    return { lcs: 50, vct: 50, total: 0 };
  }

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), FETCH_TIMEOUT);
    });

    const fetchPromise = async () => {
      const playersRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(playersRef);

      let lcsCount = 0;
      let vctCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.lastDestination === 'lcs') {
          lcsCount++;
        } else if (data.lastDestination === 'vct') {
          vctCount++;
        }
      });

      const total = lcsCount + vctCount;

      if (total === 0) {
        return { lcs: 50, vct: 50, total: 0 };
      }

      return {
        lcs: Math.round((lcsCount / total) * 100),
        vct: Math.round((vctCount / total) * 100),
        total
      };
    };

    return await Promise.race([fetchPromise(), timeoutPromise]);

  } catch (error) {
    console.error('Error fetching faction stats:', error);
    return { lcs: 50, vct: 50, total: 0 };
  }
};

/**
 * Get current player's data
 */
export const getCurrentPlayer = async () => {
  if (!db) {
    return null;
  }

  const playerId = getPlayerId();

  try {
    const playerRef = doc(db, COLLECTION_NAME, playerId);
    const playerDoc = await getDoc(playerRef);

    if (playerDoc.exists()) {
      return playerDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error fetching current player:', error);
    return null;
  }
};
