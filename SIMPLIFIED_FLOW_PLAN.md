# Rush2C9 - Simplified Flow Plan

## Overview

**Goal:** Simplify the user flow for a booth game experience.

**Date:** January 30, 2026
**Deadline:** February 3, 2026 @ 11:00 AM PT (Feb 4, 12:30 AM IST)
**Time Remaining:** ~5 days

---

## Current Flow (Before)

```
Splash → Registration (name + avatar) → Login → Home → Select Destination → City Reveal → Racing → Results
```

**Problems:**
- Too many screens before playing
- Registration/Login unnecessary for booth game
- Fans want to play FAST

---

## New Flow (After)

```
Splash (2s) → Name Entry + Destination → City Reveal → Racing → Pit Stop → Racing → Results → Leaderboard
                      ▲                                                                            │
                      └────────────────────── [Play Again] ◄───────────────────────────────────────┘
```

**Benefits:**
- One screen to start playing
- No login/registration complexity
- Faster time to first race

---

## Screen Layouts

### 1. Name Entry Screen (NEW)

```
┌─────────────────────────────────────┐
│                                     │
│        🏎️ RUSH 2 C9 🏎️             │
│                                     │
│    Race to support Cloud9!          │
│                                     │
│    What's your name?                │
│    ┌───────────────────────┐        │
│    │                       │        │
│    └───────────────────────┘        │
│                                     │
│    Pick your destination:           │
│    ┌──────────┐  ┌──────────┐       │
│    │ 🎮 LCS   │  │ 🎯 VCT   │       │
│    │  Arena   │  │  Arena   │       │
│    │ League   │  │ VALORANT │       │
│    └──────────┘  └──────────┘       │
│                                     │
│         [ 🏁 START RACE ]           │
│                                     │
│    ─────────────────────────        │
│    Faction War                      │
│    LCS 52% ████████░░ VCT 48%       │
│                                     │
└─────────────────────────────────────┘
```

**Functionality:**
- Single text input for name
- Two destination cards (LCS / VCT) - tap to select
- Start Race button (disabled until name entered + destination selected)
- Faction War progress bar (optional, shows current standings)
- Generate UUID silently when Start is pressed
- Store name + UUID in localStorage for "Play Again" pre-fill

---

### 2. Results Screen (Updated)

```
┌─────────────────────────────────────┐
│                                     │
│           🏁 JOURNEY COMPLETE!      │
│                                     │
│    Chennai → LCS Arena              │
│                                     │
│    ┌─────────────────────────┐      │
│    │     YOUR SCORE          │      │
│    │       ⭐ 604            │      │
│    └─────────────────────────┘      │
│                                     │
│    Score Breakdown:                 │
│    Base Points      +500            │
│    Time Bonus       +254            │
│    Credits Saved    +100            │
│    Hits Penalty     -250            │
│    ─────────────────────            │
│    Total             604            │
│                                     │
│    🗺️ Your Journey                  │
│    🟢 Chennai (Start)               │
│     │                               │
│    ⚪ Dubai (24.5s)                 │
│     │                               │
│    🟣 New York (Skipped)            │
│     │                               │
│    🔵 LCS Arena (22.4s) 🏁          │
│                                     │
│    ┌─────────────────────────┐      │
│    │     🔄 Play Again       │      │
│    └─────────────────────────┘      │
│                                     │
│    ┌─────────────────────────┐      │
│    │     🏆 Leaderboard      │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Functionality:**
- Shows final score with breakdown
- Journey map visualization
- "Play Again" button → goes to Name Entry (name pre-filled)
- "Leaderboard" button → goes to Leaderboard screen

---

### 3. Leaderboard Screen (Updated)

```
┌─────────────────────────────────────┐
│         🏆 LEADERBOARD              │
│                                     │
│   ┌─────────────────────────────┐   │
│   │  LCS 52%  ████████░░ VCT 48%│   │
│   └─────────────────────────────┘   │
│                                     │
│   Today's Top Racers:               │
│   ┌─────────────────────────────┐   │
│   │ 🥇 John Smith    850   LCS  │   │
│   │ 🥈 Sarah Lee     720   VCT  │   │
│   │ 🥉 Mike Chen     604   LCS  │   │
│   │  4 Emma Wilson   580   VCT  │   │
│   │  5 Alex Kumar    520   LCS  │   │
│   │  ...                        │   │
│   └─────────────────────────────┘   │
│                                     │
│   Total Races Today: 47             │
│                                     │
│    ┌─────────────────────────┐      │
│    │     🏁 Play Again       │      │
│    └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

**Functionality:**
- Faction War progress bar at top
- Top 10 scores with player name, score, and faction
- Total races counter (social proof)
- "Play Again" button → goes to Name Entry

---

### 4. Booth Big Screen (Future Enhancement)

```
┌───────────────────────────────────────────────────────────────┐
│                   🏆 RUSH 2 C9 - LIVE 🏆                      │
│                                                               │
│   ┌─────────────────────────┐    ┌─────────────────────────┐  │
│   │      FACTION WAR        │    │     TOP RACERS          │  │
│   │                         │    │                         │  │
│   │   🎮 LCS    🎯 VCT     │    │  🥇 John      850  LCS  │  │
│   │                         │    │  🥈 Sarah     720  VCT  │  │
│   │     52%  vs  48%        │    │  🥉 Mike      604  LCS  │  │
│   │   ████████░░░░░░░░      │    │   4 Emma      580  VCT  │  │
│   │                         │    │   5 Alex      520  LCS  │  │
│   │   1,247      1,153      │    │                         │  │
│   │   total pts  total pts  │    │                         │  │
│   └─────────────────────────┘    └─────────────────────────┘  │
│                                                               │
│              Total Races Today: 47    🎮 Play at the booth!   │
└───────────────────────────────────────────────────────────────┘
```

**Note:** This is for event booth display. Individual phones just play + see their score.

---

## Git Strategy

**Branch:** `feature/simplified-flow`

```
main (current working game - DO NOT BREAK)
  │
  └── feature/simplified-flow
        │
        ├── Phase 1-3 (develop + test locally)
        │
        └── Merge to main (when tested) ✅
              │
              └── Deploy to Vercel
```

---

## Implementation Phases

### Phase 1: Name Entry Screen (~2-3 hours)

**Tasks:**
- [ ] Create branch: `git checkout -b feature/simplified-flow`
- [ ] Create `src/components/screens/NameEntryScreen.jsx`
  - [ ] Name input field with validation
  - [ ] LCS / VCT destination cards with selection state
  - [ ] Start Race button (disabled until valid)
  - [ ] Faction War progress bar (can use mock data initially)
  - [ ] Generate UUID on start, store in localStorage
- [ ] Update `src/App.jsx` routes
  - [ ] Add `/name-entry` route
  - [ ] Remove `/register`, `/login`, `/home` routes
- [ ] Update `src/components/screens/SplashScreen.jsx`
  - [ ] Redirect to `/name-entry` instead of checking login

**Files to Create:**
- `src/components/screens/NameEntryScreen.jsx` (NEW)

**Files to Modify:**
- `src/App.jsx`
- `src/components/screens/SplashScreen.jsx`

---

### Phase 2: Play Again Flow (~1 hour)

**Tasks:**
- [ ] Update Results screen
  - [ ] "Play Again" navigates to `/name-entry`
  - [ ] Pass player name as state or store in localStorage
- [ ] Update Leaderboard screen
  - [ ] "Play Again" navigates to `/name-entry`
- [ ] Name Entry screen
  - [ ] Pre-fill name if returning player (from localStorage)
  - [ ] Allow changing destination

**Files to Modify:**
- `src/components/screens/GameScreen.jsx` (Results section)
- `src/components/screens/LeaderboardScreen.jsx`
- `src/components/screens/NameEntryScreen.jsx`

---

### Phase 3: Local Testing (~1 hour)

**Test Cases:**
- [ ] Fresh user: Name Entry → Select LCS → Start → City Reveal → Race → Results
- [ ] Fresh user: Name Entry → Select VCT → Start → City Reveal → Race → Results
- [ ] Play Again from Results: Should go to Name Entry with name pre-filled
- [ ] Play Again from Leaderboard: Should go to Name Entry with name pre-filled
- [ ] Switch destination: Play LCS first, then Play Again and select VCT
- [ ] Empty name: Start button should be disabled
- [ ] No destination selected: Start button should be disabled
- [ ] Mobile responsiveness: Test on phone viewport

**Bug Fixes:**
- [ ] Fix any issues found during testing

---

### Phase 4: Deploy to Vercel (~30 min)

**Prerequisites:**
- [ ] Merge `feature/simplified-flow` to `main`
- [ ] Push `main` to GitHub

**Tasks:**
- [ ] Go to vercel.com
- [ ] Connect GitHub repository
- [ ] Select `main` branch
- [ ] Configure build settings:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] Deploy
- [ ] Note down live URL

---

### Phase 5: Test Deployed Version (~30 min)

**Test Cases:**
- [ ] Test on mobile phone (real device)
- [ ] Test on desktop browser
- [ ] Test full game flow
- [ ] Check for any deployment-specific issues
- [ ] Share URL with a friend for feedback

---

### Phase 6: Firebase Integration (~3-4 hours)

**Tasks:**
- [ ] Create Firebase project at console.firebase.google.com
- [ ] Enable Firestore Database
- [ ] Create `src/services/firebaseService.js`
- [ ] Install Firebase SDK: `npm install firebase`
- [ ] Configure Firebase in the app
- [ ] Implement `saveScore()` function
- [ ] Implement `getLeaderboard()` function
- [ ] Implement `getFactionStats()` function
- [ ] Update GameScreen to save score on game end
- [ ] Update LeaderboardScreen to fetch real data

**Firebase Data Structure:**
```javascript
// Collection: scores
{
  odorless: "uuid-here",           // Document ID
  playerName: "John Smith",
  score: 604,
  faction: "lcs",                // "lcs" or "vct"
  startingCity: "Chennai",
  totalTime: 45.3,
  timestamp: 1706900000000
}
```

**Files to Create:**
- `src/services/firebaseService.js` (NEW)
- `src/config/firebase.js` (NEW)

**Files to Modify:**
- `src/components/screens/GameScreen.jsx`
- `src/components/screens/LeaderboardScreen.jsx`
- `src/components/screens/NameEntryScreen.jsx` (for faction stats)

---

### Phase 7: Final Testing (~1 hour)

**Test Cases:**
- [ ] Score saves to Firebase after game
- [ ] Leaderboard shows real data from Firebase
- [ ] Faction War % calculates correctly
- [ ] Multiple players can submit scores
- [ ] Scores persist after page refresh
- [ ] Deploy final version to Vercel
- [ ] Test deployed version with Firebase

---

## Files Summary

### To Create
| File | Purpose |
|------|---------|
| `src/components/screens/NameEntryScreen.jsx` | New entry screen |
| `src/services/firebaseService.js` | Firebase API calls |
| `src/config/firebase.js` | Firebase configuration |

### To Modify
| File | Changes |
|------|---------|
| `src/App.jsx` | Update routes |
| `src/components/screens/SplashScreen.jsx` | Redirect to name-entry |
| `src/components/screens/GameScreen.jsx` | Play Again flow, save score |
| `src/components/screens/LeaderboardScreen.jsx` | Real data, Play Again |

### To Remove (After Testing)
| File | Reason |
|------|--------|
| `src/components/screens/RegistrationScreen.jsx` | No longer needed |
| `src/components/screens/LoginScreen.jsx` | No longer needed |
| `src/components/screens/HomeScreen.jsx` | Replaced by NameEntry |

---

## Timeline Estimate

| Phase | Time | Day |
|-------|------|-----|
| Phase 1: Name Entry | 2-3 hours | Day 1 |
| Phase 2: Play Again | 1 hour | Day 1 |
| Phase 3: Local Testing | 1 hour | Day 1 |
| Phase 4: Deploy Vercel | 30 min | Day 1-2 |
| Phase 5: Test Deployed | 30 min | Day 2 |
| Phase 6: Firebase | 3-4 hours | Day 2-3 |
| Phase 7: Final Testing | 1 hour | Day 3 |
| **Total** | **~10 hours** | **~3 days** |

**Buffer for Demo Video & Submission:** 2 days

---

## Success Criteria

- [ ] Fan can enter name and start racing in < 10 seconds
- [ ] Full game flow works (3 segments)
- [ ] Score displays on Results screen
- [ ] Play Again returns to Name Entry with pre-filled name
- [ ] Leaderboard shows top 10 scores
- [ ] Faction War % displays correctly
- [ ] Works on mobile devices
- [ ] Deployed and accessible via public URL

---

## Notes

- Keep localStorage for player name (pre-fill on Play Again)
- UUID generated fresh each session (not persistent identity)
- Leaderboard only accessible AFTER playing (not before)
- Focus on polish over new features
- Demo video is critical - allocate time for it

---

*Document created: January 30, 2026*
*Last updated: January 30, 2026*
