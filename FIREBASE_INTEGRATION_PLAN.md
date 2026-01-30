# Firebase Integration Plan

## Overview
Add Firebase Firestore for persistent leaderboard with cumulative scores and a dedicated dashboard view.

---

## Git Strategy
- **Branch:** `feature/firebase-integration`
- **Flow:** Develop → Test locally → Merge to `main` → Vercel auto-deploys

---

## Phase 1: Firebase Project Setup
1. Create Firebase project in console
2. Enable Firestore database
3. Set security rules (read: public, write: public for now)
4. Get Firebase config credentials
5. Add config to environment variables

---

## Phase 2: UUID Persistence
**Current:** UUID generated on every "Start Race" click
**New:** UUID persists per browser

```
Logic:
1. On app load, check localStorage for 'rush2c9_playerId'
2. If exists → reuse it
3. If not → generate new UUID, store it

Result:
- Same browser = same player identity
- Incognito/cache cleared = new identity (expected)
```

**File to modify:** `src/components/screens/NameEntryScreen.jsx`

---

## Phase 3: Firestore Data Structure

**Collection:** `players`

**Document ID:** UUID (playerId)

**Document Fields:**
```javascript
{
  playerId: "uuid-string",
  playerName: "GANESAPRABU",
  totalScore: 850,           // Cumulative score
  playCount: 3,              // Number of times played
  lastDestination: "lcs",    // Most recent destination
  lastPlayedAt: Timestamp,   // Last play time
  createdAt: Timestamp       // First play time
}
```

---

## Phase 4: Score Saving Logic

**When:** After game ends (Results screen)
**How:** Fire-and-forget (non-blocking)

```
Logic:
1. Get playerId from localStorage
2. Check if document exists in Firestore
3. If exists:
   - totalScore += newScore
   - playCount += 1
   - Update lastDestination, lastPlayedAt
4. If not exists:
   - Create new document with initial values
5. All wrapped in try-catch (silent failure)
```

**File to modify:** `src/components/screens/GameScreen.jsx`

---

## Phase 5: Leaderboard Fetch

**Endpoint:** Firestore query
**Query:** Order by `totalScore` DESC, limit 50
**Timeout:** 5 seconds max, then show fallback

```
Logic:
1. Fetch top 50 by totalScore
2. If success → display leaderboard
3. If fail/timeout → show "Unable to load leaderboard"
4. Never block UI
```

**File to modify:** `src/components/screens/LeaderboardScreen.jsx`

---

## Phase 6: Dashboard Route

**URL:** `/dashboard`
**Purpose:** Big screen display for booth organizers

**Features:**
- Full-screen optimized layout
- Large fonts (visible from distance)
- Auto-refresh every 20 seconds
- Top 50 leaderboard
- Faction War progress bar (LCS vs VCT)
- No user input controls - display only
- Clean, minimal design

**New file:** `src/components/screens/DashboardScreen.jsx`
**Modify:** `src/App.jsx` (add route)

---

## Phase 7: Faction War Stats

**Calculate from Firestore:**
```
LCS players = count where lastDestination == "lcs"
VCT players = count where lastDestination == "vct"
LCS % = (LCS players / total) * 100
VCT % = (VCT players / total) * 100
```

**Display on:**
- Dashboard (prominently)
- Leaderboard screen
- Name Entry screen (already has placeholder)

---

## Error Handling Rules

| Scenario | Behavior |
|----------|----------|
| Firebase save fails | Game continues, no error shown |
| Firebase read fails | Show "Unable to load" message |
| Network offline | Game works 100%, leaderboard empty |
| Slow connection | Timeout after 5s, show fallback |
| Invalid data | Log to console, don't crash |

**Principle:** Firebase is complementary. Game never breaks.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/firebase/config.js` | CREATE - Firebase initialization |
| `src/firebase/playerService.js` | CREATE - Firestore operations |
| `src/components/screens/NameEntryScreen.jsx` | MODIFY - UUID persistence |
| `src/components/screens/GameScreen.jsx` | MODIFY - Save score on finish |
| `src/components/screens/LeaderboardScreen.jsx` | MODIFY - Fetch from Firestore |
| `src/components/screens/DashboardScreen.jsx` | CREATE - Big screen dashboard |
| `src/App.jsx` | MODIFY - Add /dashboard route |
| `.env` | CREATE - Firebase config (local) |
| `.env.example` | CREATE - Template for env vars |

---

## Environment Variables

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

**Note:** Add these to Vercel dashboard for production.

---

## Implementation Order

1. **Setup** - Firebase project + config + env vars
2. **UUID** - Persist player ID in localStorage
3. **Save** - Score saving logic (fire-and-forget)
4. **Fetch** - Leaderboard data fetching
5. **Dashboard** - Create dashboard route
6. **Faction War** - Calculate and display stats
7. **Test** - Full local testing
8. **Deploy** - Merge to main, add env vars to Vercel

---

## Success Criteria

- [ ] Same player accumulates score across plays
- [ ] Leaderboard shows top 50 globally
- [ ] Dashboard auto-refreshes on big screen
- [ ] Faction War shows real LCS vs VCT split
- [ ] Game works perfectly even if Firebase is down
- [ ] No errors shown to user on Firebase failures
