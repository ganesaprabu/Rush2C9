# Rush2C9 - Progress Log

## Quick Reference for New Sessions

> **Starting a new session?** Copy and paste this to Claude:
>
> ```
> I'm continuing work on Rush2C9 — a Cloud9 hackathon game project.
>
> Please read these docs to understand the project:
> 1. /docs/PLANNING.md — Project overview, features, tech decisions
> 2. /docs/PROGRESS.md — What's done, what's next
> 3. /docs/GAME_MECHANICS.md — Game rules, scoring, vehicles
> 4. /docs/GIT_STRATEGY.md — How we manage commits and tags
>
> The workspace folder is: /Users/ganesaprabunavamanirajan/Development/AI/Hackathon/JetBrains_Feb_2026_Game/Rush2C9
>
> Let's continue from where we left off. Check PROGRESS.md for current status.
> ```

---

## Project Status

> **Full Roadmap:** See [PLANNING.md → Development Roadmap](./PLANNING.md#development-roadmap) for detailed breakdown

| Version | Milestone | Status | Tag |
|---------|-----------|--------|-----|
| v0.0 | Documentation | ✅ Complete | v0.0-docs |
| v1.0 | Setup | ✅ Complete | v1.0-setup |
| v2.0 | Registration | ✅ Complete | v2.0-registration |
| v3.0 | Gameplay (Simplified Flow) | ⏳ In Progress | — |
| v4.0 | Leaderboard | ⏳ Pending | — |
| v5.0 | Firebase | ⏳ Pending | — |
| v6.0 | Duels | ⏳ Pending | — |
| v7.0 | Big Screen | ⏳ Pending | — |
| v8.0 | Polish | ⏳ Pending | — |
| v9.0 | Release | ⏳ Pending | — |

**Current Focus:** v3.0 — Building Phaser.js racing game with simplified flow

---

## Deadline Reminder

| Item | Detail |
|------|--------|
| **Submission Deadline** | February 3, 2026 @ 11:00 AM PT |
| **Your Time (IST)** | February 4, 2026 @ 12:30 AM |
| **Days Remaining** | ~11 days |

### Before Submission Checklist
- [ ] Make GitHub repo **PUBLIC**
- [ ] Upload demo video to YouTube
- [ ] Complete Devpost submission form
- [ ] Test game on mobile browser
- [ ] Verify all links work

---

## v3.0 — Gameplay (Simplified Flow)

> **Full Details:** See [GAME_MECHANICS.md](./GAME_MECHANICS.md) for complete game design

### Current Status: ⏳ In Progress

| Phase | Task | Status |
|-------|------|--------|
| 3.1 | Game Data Architecture | ✅ Complete |
| 3.2 | City Reveal Screen (Auto-Advance) | ✅ Complete |
| 3.3 | Phaser Racing Game (CORE) | ⚠️ In Progress (Mobile touch issue) |
| 3.4 | Pit Stop Screen | ⏳ Pending |
| 3.5 | Segment Loop | ⏳ Pending |
| 3.6 | Results Screen + Journey Map | ⏳ Pending |

### Phase Details:

**3.1 Game Data Architecture ✅**
- [x] Update gameData.js with new vehicles (Bike, Car, Tractor, Truck, Sports Car)
- [x] Add road types (Highway, Tar Road, Mud Road, Bumpy Road)
- [x] Create route generation logic (city → waypoints → LA)
- [x] Define vehicle-road speed relationships
- [x] Add Phaser configuration constants
- [x] Add obstacle definitions
- [x] Add helper functions (getRandomStartingCity, generateRouteSegments, etc.)

**3.2 City Reveal Screen (Auto-Advance) ✅**
- [x] Random city from 10 cities
- [x] Display city name, emoji, region, distance
- [x] Show destination (LCS/VCT)
- [x] Auto-advance after 3 seconds
- [x] "GET READY" countdown

**3.3 Phaser Racing Game** ⭐ CORE — ⚠️ In Progress
- [x] Phaser canvas in React
- [x] Pseudo-3D road (OutRun style)
- [x] Default vehicle: Car
- [x] Left/Right on-screen buttons
- [x] Boost button (costs 10 credits)
- [x] Obstacle spawning based on road type
- [x] Collision & speed reduction
- [x] Progress bar & timer
- [x] Road type indicator in HUD
- [x] Steering range increased (±3.0), speed 8.0
- [x] Car visual movement (not just road shift)
- [ ] **⚠️ PENDING: Mobile touch responsiveness** — taps not registering, only long press works

**3.4 Pit Stop Screen**
- [ ] "Segment Complete" celebration
- [ ] Show NEXT segment's road type
- [ ] Vehicle recommendation
- [ ] Vehicle switch option (with costs)
- [ ] Auto-continue timer (5 seconds)

**3.5 Segment Loop**
- [ ] Track current segment (1, 2, 3)
- [ ] Racing → Pit Stop → Racing loop
- [ ] Detect journey completion

**3.6 Results Screen + Journey Map** ⭐ NEW
- [ ] Score calculation & display
- [ ] **Journey Map Component:**
  - Starting city → Waypoints → Destination
  - Animated route line
  - Cartoon/stylized map
- [ ] Save to profile
- [ ] Play Again / Home buttons

---

## Daily Progress Log

### January 21, 2026 (Day 1)

**Completed:**
- [x] Researched hackathon requirements
- [x] Finalized game concept: Rush2C9
- [x] Created project folder structure
- [x] Wrote PLANNING.md
- [x] Wrote GAME_MECHANICS.md
- [x] Wrote README.md
- [x] Added MIT LICENSE
- [x] Created .gitignore
- [x] Initialized Git repository
- [x] Pushed to GitHub (private repo)
- [x] Created PROGRESS.md
- [x] Created GIT_STRATEGY.md

**Decisions Made:**
- Game name: Rush2C9
- Platform: Browser-based (React + Phaser.js)
- Backend: Firebase
- Auth: Name + Avatar (no password) — Avatar is SECRET, never shown publicly
- Git strategy: Main branch + Tags for milestones
- Starting cities: 10 (including Chennai 🇮🇳)
- Destinations: LCS Arena & VCT Arena (both in LA)
- Dual currency: Credits (per game) + Score (permanent)
- Booth setup: QR code → Phone browser → Play anywhere

**Next Session:**
- Setup React + Vite project
- Create basic folder structure for components
- Tag as v1.0-setup

---

### January 21, 2026 (Day 1 - Session 2)

**Completed:**
- [x] Initialized React + Vite project
- [x] Installed and configured Tailwind CSS v4
- [x] Installed Phaser.js game engine
- [x] Installed React Router for navigation
- [x] Created folder structure:
  - `src/components/screens/` - Screen components
  - `src/components/game/` - Game components (Phaser)
  - `src/components/ui/` - Reusable UI components
  - `src/hooks/` - Custom React hooks
  - `src/services/` - Firebase & API services
  - `src/utils/` - Utility functions
  - `src/data/` - Game data & constants
  - `src/assets/` - Images & sounds
- [x] Created game data file with all constants (cities, vehicles, avatars)
- [x] Created placeholder screens:
  - SplashScreen (with auto-redirect)
  - RegistrationScreen (name + avatar picker)
  - HomeScreen (play, duel, leaderboard)
  - GameScreen (vehicle selection flow)
  - LeaderboardScreen (mock data)
- [x] Set up React Router with all routes
- [x] Configured Cloud9 brand colors
- [x] Added Inter font from Google Fonts
- [x] Updated index.html with proper meta tags
- [x] Build tested successfully ✅

**Tech Stack Confirmed:**
- React 19.2.0
- Vite 7.3.1
- Tailwind CSS 4.1.18
- Phaser 3.x
- React Router 6.x

**Next Session:**
- Complete and polish Registration screen
- Add localStorage for player data persistence
- Style improvements with Cloud9 branding
- Tag as v2.0-registration

---

### January 22, 2026 (Day 2)

**Completed:**
- [x] Created playerService.js with localStorage helpers
- [x] Support for multiple players on same device
- [x] Registration with name (A-Z only, uppercase) + avatar
- [x] Login with name + avatar validation
- [x] Switch account (logout without deleting data)
- [x] Delete account functionality
- [x] Protected routes (redirect to register if not logged in)
- [x] Auto-redirect from splash based on login state
- [x] Display full name on home screen
- [x] Button text: "Create Account" (register) / "Sign In" (login)
- [x] Input validation: A-Z only, auto-uppercase

**Key Decisions:**
- Multiple players stored in `rush2c9_players` (persists)
- Current session in `rush2c9_current` (cleared on logout)
- Player ID format: `firstname_lastname` (lowercase)
- Avatar stored as `avatarCategory` + `avatarIndex` (not emoji)

**Tagged:** v2.0-registration ✅

---

### January 23, 2026 (Day 3) — MAJOR DESIGN REVISION

**Session 1: Design Discussion**
- [x] Reviewed v3.0 status — identified "form filling" problem
- [x] Discussed Phaser.js racing approach
- [x] Reviewed Phaser Driving example (https://moonsault.itch.io/phaser-driving)
- [x] Changed terrain types → road types (more intuitive)
- [x] Updated vehicles (removed water/air, added road vehicles)
- [x] Finalized on-screen controls (arrow buttons + boost)

**Session 2: Flow Simplification** ⭐ KEY DECISIONS
- [x] **MAJOR CHANGE:** Reduced screens before racing from 5+ to 1 tap!
- [x] **MAJOR CHANGE:** Vehicle selection moved to Pit Stops (mid-game)
- [x] **MAJOR CHANGE:** Map view moved to END (victory screen, not setup)
- [x] **MAJOR CHANGE:** Route difficulty auto-assigned (no player selection)

**What Changed:**
| Before | After |
|--------|-------|
| Home → Destination → City → Route Select → Vehicle Select → Racing | Home → Tap Destination → City (3s) → Racing |
| 5+ screens to start | 1 tap to start |
| Pre-select vehicle | Default Car, switch at Pit Stops |
| Map before racing | Journey Map at END (victory!) |
| Player picks route difficulty | Auto-assigned (moderate) |

**Rationale:**
- Booth environment = short attention spans
- Every extra screen = friction = players walk away
- Vehicle selection is strategic, but upfront it's confusing
- Map at end is a REWARD, not a setup chore

**Session 3: Documentation & Code**
- [x] Updated GAME_MECHANICS.md with simplified flow
- [x] Added Pit Stop system design
- [x] Added Journey Map (end screen) design
- [x] Updated game duration target: ~2 minutes
- [x] Updated gameData.js with:
  - New vehicles (Bike, Car, Tractor, Truck, Sports Car)
  - Road types (Highway, Tar, Mud, Bumpy)
  - Vehicle-road speed matrix
  - Route difficulties
  - Phaser config constants
  - Obstacle definitions
  - Helper functions
- [x] Updated GameScreen.jsx placeholder with new data
- [x] Updated PLANNING.md with revised phases
- [x] Updated PROGRESS.md (this file)

**Next Session:**
- Start Phase 3.2: City Reveal Screen (Auto-Advance)
- Implement 3-second countdown to racing

---

### January 24, 2026 (Day 4) — Mobile & Steering Improvements

**Completed:**
- [x] Attempted tilt-to-steer controls for mobile (reverted - didn't work on Android)
- [x] Fixed mobile viewport black space issue (100dvh + viewport-fit=cover)
- [x] Increased steering range from ±1.0 to ±3.0 (car can move much further left/right)
- [x] Increased steering speed to 8.0 (from original 1.8)
- [x] Fixed road overlap issue when steering wide (car moves visually instead of road shifting)
- [x] Moved player car position higher (140px from bottom instead of 50px) to avoid overlapping control buttons
- [x] Unified control buttons UI for both mobile and desktop (consistent experience)
- [x] Implemented native event listeners for touch handling (attempt to improve mobile responsiveness)
- [x] Removed unused deviceDetect.js utility file

**Code Changes (Uncommitted):**
- `ControlButtons.jsx` - Native event listeners, unified UI for mobile/desktop
- `RacingScene.js` - Steering speed 8.0, player car Y position -140px
- `GameScreen.jsx` - Restructured layout with absolute positioning for HUD and controls

**Known Issues (Pending):**
- ⚠️ **Mobile Touch Responsiveness** - Tap on steering buttons requires long press on mobile; quick taps don't register reliably. Multiple approaches tried (React events, native events, pointer events). Needs further investigation.

**Technical Notes:**
- Steering range: -3.0 to 3.0 (playerX)
- Steering speed multiplier: 8.0
- Road shift reduced to 0.02/0.01 (was 0.25/0.12) to prevent road edges overlapping car
- Car visual offset: `steerOffset = playerX * (width * 0.12)`
- Player car Y: `height - 140` (above control buttons)

---

## Key Decisions Log

| Date | Decision | Before | After | Reason |
|------|----------|--------|-------|--------|
| Jan 21 | Platform | Native app | Browser-based | No install friction |
| Jan 21 | Auth | Password | Avatar as secret | Fun, memorable, fast |
| Jan 21 | Backend | Custom server | Firebase | Real-time, free tier |
| Jan 23 | Terrain | Water/Land | Road types | More intuitive |
| Jan 23 | Game engine | SVG animations | Phaser.js | Real game feel |
| Jan 23 | Controls | Tilt/swipe | On-screen buttons | No accidents |
| **Jan 23** | **Screens before racing** | **5+ screens** | **1 tap** | **Reduce friction** |
| **Jan 23** | **Vehicle selection** | **Before racing** | **Pit Stop mid-game** | **Strategic, not confusing** |
| **Jan 23** | **Map view** | **Before racing** | **After (results)** | **Victory reward** |
| **Jan 23** | **Route selection** | **Player picks** | **Auto (moderate)** | **Faster start** |

---

## Technical Notes

### Repository
- **URL:** https://github.com/ganesaprabu/Rush2C9
- **Visibility:** Private (make PUBLIC on submission day)
- **License:** MIT

### Tech Stack
- **Frontend:** React + Vite + Phaser.js
- **Styling:** Tailwind CSS
- **Backend:** Firebase (Firestore)
- **Hosting:** Firebase Hosting (planned)

### File Structure
```
Rush2C9/
├── docs/
│   ├── PLANNING.md
│   ├── GAME_MECHANICS.md
│   ├── PROGRESS.md         ← You are here
│   └── GIT_STRATEGY.md
├── src/
│   ├── components/
│   │   ├── screens/        ← Screen components
│   │   ├── game/           ← Phaser game components
│   │   └── ui/             ← Reusable UI components
│   ├── hooks/              ← Custom React hooks
│   ├── services/           ← Firebase & API
│   ├── utils/              ← Helper functions
│   ├── data/               ← Game constants
│   │   └── gameData.js     ← Cities, vehicles, roads, obstacles
│   ├── assets/             ← Images & sounds
│   ├── App.jsx             ← Main app with routing
│   ├── main.jsx            ← Entry point
│   └── index.css           ← Tailwind CSS entry
├── public/                 ← Static assets
├── index.html              ← HTML template
├── package.json            ← Dependencies
├── vite.config.js          ← Vite configuration
├── README.md
├── LICENSE
└── .gitignore
```

---

## Important Context (For New Sessions)

### What is Cloud9?
- Cloud9 is a professional **esports organization** (like IPL teams for cricket)
- They own teams that compete in video game tournaments
- Main games: League of Legends (LCS league) and VALORANT (VCT league)
- Headquarters: Santa Monica, California
- Website: https://cloud9.gg

### What is this Hackathon?
- **Name:** "Sky's the Limit" — Cloud9 x JetBrains Hackathon
- **Category 4:** Event Game — Mini-game for fan booths at LCS/VCT events
- **Prize:** Winner's game gets integrated into real Cloud9 booth!
- **Deadline:** February 3, 2026 @ 11:00 AM PT

### Our Game Concept
Rush2C9 — Fans race from random cities worldwide to reach Cloud9's arenas (LCS or VCT). They choose routes and vehicles, balancing speed vs cost. Creates competition via leaderboard and head-to-head duels with score betting.

### Key Design Principles (Updated Jan 23)
1. **1 tap to start** — Minimal screens before racing
2. **Default vehicle** — Start with Car, switch at Pit Stops
3. **Journey Map at END** — Victory celebration, not setup
4. **Auto route difficulty** — System handles, player races
5. **~2 minute games** — Perfect for booth environment

---

## Contact

**Developer:** GANESAPRABU NAVAMANIRAJAN
**Email:** ganesa.tech.ai@gmail.com
