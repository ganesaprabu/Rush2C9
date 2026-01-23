# Rush2C9 - Project Planning Document

## Project Overview

**Name:** Rush2C9
**Tagline:** Race to the Arena. Support Your Team.
**Hackathon:** Cloud9 x JetBrains "Sky's the Limit" Hackathon
**Category:** Category 4 - Event Game
**Deadline:** February 3, 2026 (11:00 AM PT)

---

## The Concept

Rush2C9 is a browser-based mini-game designed for Cloud9 fan booths at LCS and VCT events. Fans race from random starting cities around the world to reach either the LCS Arena or VCT Arena using skill-based Phaser.js racing gameplay.

### Core Experience (Simplified Flow)
1. Fan scans QR code at booth → Opens game in phone browser
2. Registers with name + secret avatar (no password needed)
3. Taps destination: LCS Arena or VCT Arena → **Game starts immediately!**
4. System assigns random starting city (3-sec reveal)
5. **RACING** — Phaser.js pseudo-3D racing through 3 segments
6. Pit Stops between segments — optional vehicle switch
7. **Results + Journey Map** — Score breakdown + visual journey!
8. Scores feed into live leaderboard on booth's big screen

**Key Change (Jan 23):** Reduced from 5+ screens to 1 tap before racing!

---

## Target Audience

- **Primary:** Fans attending LCS/VCT events at Cloud9 booths
- **Demographics:** 16-30 years old, gamers, esports enthusiasts
- **Context:** Loud, energetic environment, short attention spans
- **Device:** Personal smartphones (iOS & Android)

---

## Key Features

### 1. Quick Registration (5-10 seconds)
- First Name + Last Name
- Select avatar from categories (secret, like a PIN)
- No password, no email, no phone number

### 2. Instant Racing Gameplay
- 1 tap (destination) → Racing starts in 5 seconds
- 10 starting cities worldwide
- 3 racing segments per journey
- Phaser.js pseudo-3D racing (OutRun style)
- Steer, avoid obstacles, use boost

### 3. Pit Stop System (Mid-Game Strategy)
- Between segments, see next road type
- Optional vehicle switch (costs credits)
- Auto-continues in 5 seconds (no friction)
- Strategic depth without upfront confusion

### 4. Journey Map (Victory Screen)
- Shown at END of game (not beginning)
- Visual celebration of completed journey
- Start city → Waypoints → Destination
- Shareable, memorable moment

### 5. Dual Currency System
- **Credits:** Spent on vehicles/boosts (replenishes each game)
- **Score:** Accumulated based on performance (permanent)

### 6. Faction War
- Fans choose LCS or VCT destination
- Big screen shows which faction is winning
- Creates community rivalry

### 7. Duel System (Future)
- Challenge another fan
- Both get same starting city
- Bet scores against each other
- Winner takes the bet amount

### 8. Live Leaderboard
- Displayed on booth's big screen
- Real-time updates via WebSocket
- Shows top travelers and faction scores

### 9. Booth Setup (QR Code Flow)
- **Booth displays:** Large screen with leaderboard + QR code
- **Fan scans QR:** Opens game URL in phone browser (no app install)
- **Fan plays:** On their own phone, anywhere at the event
- **Scores sync:** Real-time to booth's big screen
- **Multiple fans:** Can play simultaneously (no queue!)

### 10. Avatar Privacy (IMPORTANT)
- Avatar is like a SECRET PIN — used for login
- Avatar is NEVER shown on public leaderboard
- Leaderboard only shows: Name + Score
- Fan sees their own avatar only on their phone
- This prevents others from logging in as someone else

---

## Technical Decisions

### Platform: Browser-Based (PWA)
**Why:**
- No app installation friction
- Works on any smartphone
- QR code → Playing in 5 seconds
- Multiple fans can play simultaneously
- Can play from anywhere (not just booth)

### Frontend: React + Phaser.js
**Why:**
- React: Fast UI development, component-based
- Phaser.js: Industry-standard 2D game engine for browsers
- Smooth animations, sprite handling, game loops
- Works well on mobile browsers

### Backend: Firebase
**Why:**
- Real-time database (Firestore) for live leaderboard
- Simple authentication
- Free tier sufficient for hackathon
- Fast setup, good documentation
- Handles WebSocket-like real-time updates

### Styling: Tailwind CSS
**Why:**
- Rapid UI development
- Mobile-first approach
- Consistent design system

---

## Authentication Strategy

### The Challenge
- Booth game = fans hate long registration
- But need unique identity for leaderboard
- Password = friction, forgettable

### The Solution: Avatar as Secret Code
- Fan enters First Name + Last Name
- Fan selects avatar from category (Cars, Bikes, Tech, Gaming, Sports)
- Each category has 10 avatars
- Unique key = Name + Avatar
- Avatar is NEVER shown on public leaderboard
- Fan remembers: "I'm Mike Johnson, the Racing Car"

### Avatar Categories
| Category | Icons (10 each) |
|----------|-----------------|
| Cars | 🚗 🚕 🚙 🏎️ 🚓 🚑 🚒 🛻 🚐 🏁 |
| Bikes | 🏍️ 🛵 🚲 🛴 🏇 🚴 🚵 🛺 🚜 🏊 |
| Tech | 📱 💻 🖥️ ⌨️ 🎧 📷 🎬 🔌 💡 🤖 |
| Gaming | 🎮 👾 🕹️ 🏆 🎯 🎲 ♟️ 🃏 🎰 👽 |
| Sports | ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏓 🥊 🏋️ 🏅 |

**Total combinations:** 5 categories × 10 avatars = 50 unique avatars per name

---

## Game Flow (Simplified - v2)

```
[QR Scan] → [Registration] → [Home Screen]
                                   ↓
                         [Tap LCS or VCT] ← 1 TAP TO START!
                                   ↓
                         [City Reveal - 3 sec]
                                   ↓
                         [PHASER RACING - Segment 1]
                                   ↓
                         [Pit Stop - optional vehicle switch]
                                   ↓
                         [PHASER RACING - Segment 2]
                                   ↓
                         [Pit Stop - optional vehicle switch]
                                   ↓
                         [PHASER RACING - Segment 3]
                                   ↓
                         [RESULTS + JOURNEY MAP]
```

### Time to First Action
| Old Flow | New Flow |
|----------|----------|
| 5+ screens before racing | 1 tap before racing |
| ~60 seconds to start | ~5 seconds to start |
| Player configures everything | System handles defaults |

---

## Development Roadmap

> **Current Status:** See [PROGRESS.md](./PROGRESS.md) for daily updates

### Milestone Overview

| Version | Name | What It Delivers | Status |
|---------|------|------------------|--------|
| v0.0 | Documentation | Project plan, game mechanics, Git strategy | ✅ Complete |
| v1.0 | Setup | React + Vite + Tailwind + folder structure | ✅ Complete |
| v2.0 | Registration | Create account, login, logout, protected routes | ✅ Complete |
| v3.0 | Gameplay | Phaser racing game + Pit Stops + Journey Map | ⏳ In Progress |
| v4.0 | Leaderboard | View rankings, faction totals, personal stats | ⏳ Pending |
| v5.0 | Firebase | Cloud sync, real-time leaderboard, data persistence | ⏳ Pending |
| v6.0 | Duels | Challenge players, bet scores, same starting city | ⏳ Pending |
| v7.0 | Big Screen | Booth display mode for live events | ⏳ Pending |
| v8.0 | Polish | Cloud9 branding, animations, sound effects | ⏳ Pending |
| v9.0 | Release | Final testing, demo video, Devpost submission | ⏳ Pending |

---

### v0.0 — Documentation ✅
- [x] PLANNING.md — Project overview, features, decisions
- [x] GAME_MECHANICS.md — Scoring, vehicles, routes
- [x] PROGRESS.md — Daily log, status tracking
- [x] GIT_STRATEGY.md — Commit and tag conventions
- [x] README.md — Project introduction

### v1.0 — Setup ✅
- [x] Initialize React + Vite project
- [x] Configure Tailwind CSS v4
- [x] Install Phaser.js and React Router
- [x] Create folder structure (screens, services, data, etc.)
- [x] Create placeholder screens
- [x] Add game data constants (cities, vehicles, avatars)

### v2.0 — Registration ✅
- [x] Registration screen (name + avatar selection)
- [x] Login screen (name + avatar validation)
- [x] localStorage persistence (multi-player support)
- [x] Protected routes (redirect if not logged in)
- [x] Switch account / delete account

### v3.0 — Gameplay (Simplified Flow) ⏳

> **Full details:** See [GAME_MECHANICS.md](./GAME_MECHANICS.md)

#### Phase 3.1: Game Data Architecture ✅
- [x] Update gameData.js with new vehicles (Bike, Car, Tractor, Truck, Sports Car)
- [x] Add road types (Highway, Tar Road, Mud Road, Bumpy Road)
- [x] Create route generation logic (city → waypoints → LA)
- [x] Define vehicle-road speed relationships
- [x] Add Phaser configuration constants
- [x] Add obstacle definitions

#### Phase 3.2: City Reveal Screen (Auto-Advance)
- [ ] Random city assignment from 10 cities
- [ ] Display city name, emoji, region, distance to LA
- [ ] Show selected destination (LCS/VCT)
- [ ] Auto-advance after 3 seconds (with countdown)
- [ ] "GET READY" animation

#### Phase 3.3: Phaser Racing Game (CORE)
- [ ] Initialize Phaser canvas in React component
- [ ] Pseudo-3D road rendering (OutRun style)
- [ ] Default vehicle: Car (no pre-selection needed)
- [ ] Left/Right steering with on-screen buttons
- [ ] Boost button (costs 10 credits)
- [ ] Obstacle spawning based on road type
- [ ] Collision detection and speed reduction
- [ ] Gradual speed recovery after collision
- [ ] Progress bar showing segment completion
- [ ] Timer showing elapsed time
- [ ] Road type indicator in HUD
- [ ] Credits display in HUD
- [ ] Segment completion detection

#### Phase 3.4: Pit Stop Screen (Between Segments)
- [ ] "Segment Complete" celebration
- [ ] Show time taken for segment
- [ ] Show NEXT segment's road type
- [ ] Current vehicle speed rating for next road
- [ ] Recommended vehicle suggestion
- [ ] Vehicle switch option (with costs)
- [ ] "Keep Current" option (free)
- [ ] Auto-continue timer (5 seconds)
- [ ] Skip immediately if player taps continue

#### Phase 3.5: Segment Loop
- [ ] Track current segment (1, 2, 3)
- [ ] Loop: Racing → Pit Stop → Racing → Pit Stop → Racing
- [ ] Update route progress after each segment
- [ ] Track total time across segments
- [ ] Track total credits spent
- [ ] Detect journey completion

#### Phase 3.6: Results Screen + Journey Map
- [ ] "Journey Complete" celebration
- [ ] Score calculation:
  - Base Points: 500
  - Time Bonus: MAX(0, 300 - totalTime)
  - Credits Saved: 200 - creditsSpent
- [ ] Score breakdown display
- [ ] **Journey Map Component:**
  - Starting city (with emoji)
  - Waypoints passed through
  - Destination (LCS/VCT Arena)
  - Animated route line drawing
  - Stylized/cartoon map style
- [ ] Journey stats: Total distance, time, obstacles hit
- [ ] Save score to player profile
- [ ] Update faction totals
- [ ] "Play Again" button
- [ ] "Home" button

### v4.0 — Leaderboard
- [ ] Leaderboard screen with top players
- [ ] Faction totals (LCS vs VCT)
- [ ] Personal stats (games played, best score)
- [ ] Sort by score, filter by faction

### v5.0 — Firebase
- [ ] Setup Firebase project
- [ ] Migrate player data to Firestore
- [ ] Real-time leaderboard updates
- [ ] Cloud sync across devices

### v6.0 — Duels
- [ ] Challenge another player by name
- [ ] Both players get same starting city
- [ ] Bet scores against each other
- [ ] Winner takes bet amount
- [ ] Duel history

### v7.0 — Big Screen
- [ ] Booth display mode (no registration needed)
- [ ] Live leaderboard view
- [ ] Faction war progress bar
- [ ] QR code display for joining
- [ ] Active duels ticker

### v8.0 — Polish
- [ ] Cloud9 brand colors and logo
- [ ] Smooth animations and transitions
- [ ] Sound effects (optional)
- [ ] Loading states and error handling
- [ ] Mobile responsiveness fine-tuning

### v9.0 — Release
- [ ] End-to-end testing on multiple devices
- [ ] Record 3-minute demo video
- [ ] Make GitHub repo public
- [ ] Complete Devpost submission form
- [ ] Final code cleanup

---

### Timeline

| Week | Dates | Focus |
|------|-------|-------|
| Week 1 | Jan 21-27 | v0.0 → v3.0 (Docs, Setup, Registration, Gameplay) |
| Week 2 | Jan 28 - Feb 2 | v4.0 → v8.0 (Leaderboard, Firebase, Duels, Polish) |
| Deadline | Feb 3, 11:00 AM PT | v9.0 (Submit!) |

---

## Submission Requirements Checklist

- [ ] Public GitHub repository
- [ ] OSI-approved open source license (MIT)
- [ ] Demo video (~3 minutes) on YouTube/Vimeo
- [ ] Devpost submission form completed
- [ ] Project runs on intended platform (mobile browser)

---

## Team

**Developer:** GANESAPRABU NAVAMANIRAJAN
**Email:** ganesa.tech.ai@gmail.com

---

## Key Design Decisions (Jan 23)

| Decision | Before | After | Why |
|----------|--------|-------|-----|
| Screens before racing | 5+ screens | 1 tap | Reduce friction at booth |
| Route selection | Player picks | Auto (moderate) | Faster start |
| Vehicle selection | Before racing | Pit Stop mid-game | Strategic, not confusing |
| Map view | Before racing | After (results) | Victory celebration |
| Game duration | ~3 min | ~2 min | Better for booth |

---

## References

- [Cloud9 x JetBrains Hackathon](https://cloud9.devpost.com/)
- [Hackathon Rules](https://cloud9.devpost.com/rules)
- [Cloud9 Official Website](https://cloud9.gg/)
- [Phaser.js Documentation](https://phaser.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Phaser Driving Example](https://moonsault.itch.io/phaser-driving)
