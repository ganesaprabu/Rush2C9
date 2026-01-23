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
| v3.0 | Gameplay | ✅ Complete | — |
| v4.0 | Leaderboard | ⏳ Pending | — |
| v5.0 | Firebase | ⏳ Pending | — |
| v6.0 | Duels | ⏳ Pending | — |
| v7.0 | Big Screen | ⏳ Pending | — |
| v8.0 | Polish | ⏳ Pending | — |
| v9.0 | Release | ⏳ Pending | — |

**Current Focus:** v3.0 complete → Test & tag → Start v4.0

---

## Deadline Reminder

| Item | Detail |
|------|--------|
| **Submission Deadline** | February 3, 2026 @ 11:00 AM PT |
| **Your Time (IST)** | February 4, 2026 @ 12:30 AM |
| **Days Remaining** | ~12 days |

### Before Submission Checklist
- [ ] Make GitHub repo **PUBLIC**
- [ ] Upload demo video to YouTube
- [ ] Complete Devpost submission form
- [ ] Test game on mobile browser
- [ ] Verify all links work

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

## v3.0-gameplay — Task Breakdown

| Phase | Task | Status | Description |
|-------|------|--------|-------------|
| 3.1 | Game state setup | ✅ Complete | Create game flow states (city reveal → route → vehicle → results) |
| 3.2 | Random city assignment | ✅ Complete | Show starting city with animation |
| 3.3 | Route selection UI | ✅ Complete | Display 3 routes with distance & terrain % |
| 3.4 | Vehicle selection UI | ✅ Complete | Display 5 vehicles with cost, show remaining credits |
| 3.5 | Travel time calculation | ✅ Complete | Calculate time based on terrain + vehicle speed |
| 3.6 | Segment loop | ✅ Complete | Repeat route → vehicle for 3 segments |
| 3.7 | Results screen | ✅ Complete | Show score breakdown (base + time bonus + credits saved) |
| 3.8 | Save score & faction | ✅ Complete | Update player data in localStorage |

---

### January 22, 2026 (Day 2 - Session 2)

**Completed:**
- [x] Implemented complete game state machine with 5 phases:
  - `city_reveal` — Random city assignment with animation
  - `route_select` — Display 3 route options per segment
  - `vehicle_select` — Display 5 vehicles with terrain suitability hints
  - `traveling` — Brief travel animation between segments
  - `results` — Score breakdown with journey summary
- [x] Route generation based on city distance and segment number
- [x] Terrain distribution: Direct (60-90% water), Scenic (30-60%), Safe (10-30%)
- [x] Vehicle selection with "Good fit" indicator based on terrain
- [x] Travel time calculation: `distance / (100 × speed)`
- [x] 3-segment journey loop with progress bar
- [x] Journey log tracking all segment choices
- [x] Score calculation: Base (500) + Time Bonus (300 - travel time) + Credits Saved
- [x] Save score to player profile after game completion
- [x] Faction tracking (LCS vs VCT) set on first game
- [x] Added `updatePlayerScore()` to playerService.js
- [x] Back button to change route before vehicle selection

**Key Implementation Details:**
- Game phases managed via React state machine
- Routes generated dynamically per segment with randomized terrain
- Time formula: `landDist/(100×landSpeed) + waterDist/(100×waterSpeed)`
- Score persists to localStorage via playerService

**Next Session:**
- Test complete gameplay flow on device
- Tag as v3.0-gameplay after testing
- Begin v4.0-multiplayer (leaderboard, duels)

---

## Key Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| Jan 21 | Browser-based (not native app) | No install friction, QR → instant play |
| Jan 21 | Firebase for backend | Real-time leaderboard, free tier, fast setup |
| Jan 21 | Avatar as secret (not password) | Fun, memorable, fast registration |
| Jan 21 | 5 avatar categories × 10 each | 50 unique avatars per name |
| Jan 21 | Credits + Score (dual currency) | Prevents stuck players, adds strategy |
| Jan 21 | Chennai as starting city | Developer's hometown 🎉 |

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
│   │   └── gameData.js     ← Cities, vehicles, avatars
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

### Key Design Decisions
1. **Browser-based** — No app install, scan QR → play instantly
2. **Avatar as PIN** — Fun, memorable, replaces password (NEVER shown publicly)
3. **Dual currency** — Credits (per game) + Score (permanent leaderboard)
4. **Faction war** — LCS vs VCT creates community rivalry
5. **Touch-friendly** — Designed for phones at loud event booths

---

## Contact

**Developer:** GANESAPRABU NAVAMANIRAJAN
**Email:** ganesa.tech.ai@gmail.com
