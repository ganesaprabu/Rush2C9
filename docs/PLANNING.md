# Rush2C9 - Project Planning Document

## Project Overview

**Name:** Rush2C9
**Tagline:** Race to the Arena. Support Your Team.
**Hackathon:** Cloud9 x JetBrains "Sky's the Limit" Hackathon
**Category:** Category 4 - Event Game
**Deadline:** February 3, 2026 (11:00 AM PT)

---

## The Concept

Rush2C9 is a browser-based mini-game designed for Cloud9 fan booths at LCS and VCT events. Fans race from random starting cities around the world to reach either the LCS Arena or VCT Arena, choosing optimal routes and vehicles to achieve the fastest time.

### Core Experience
1. Fan scans QR code at booth → Opens game in phone browser
2. Registers with name + secret avatar (no password needed)
3. Chooses destination: LCS Arena or VCT Arena
4. System assigns random starting city
5. Fan selects routes and vehicles across 3 segments
6. Faster arrival = Higher score
7. Scores feed into live leaderboard on booth's big screen
8. Fans can challenge each other to duels with score betting

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

### 2. Global Race Gameplay
- 10 starting cities worldwide
- 2 destinations (LCS Arena, VCT Arena)
- 3 route segments per journey
- 3 route options per segment
- 5 vehicle types with different costs/speeds

### 3. Dual Currency System
- **Credits:** Spent on vehicles (replenishes each game)
- **Score:** Accumulated based on performance (permanent)

### 4. Faction War
- Fans choose LCS or VCT destination
- Big screen shows which faction is winning
- Creates community rivalry

### 5. Duel System
- Challenge another fan
- Both get same starting city
- Bet scores against each other
- Winner takes the bet amount

### 6. Live Leaderboard
- Displayed on booth's big screen
- Real-time updates via WebSocket
- Shows top travelers and faction scores

### 7. Booth Setup (QR Code Flow)
- **Booth displays:** Large screen with leaderboard + QR code
- **Fan scans QR:** Opens game URL in phone browser (no app install)
- **Fan plays:** On their own phone, anywhere at the event
- **Scores sync:** Real-time to booth's big screen
- **Multiple fans:** Can play simultaneously (no queue!)

### 8. Big Screen Display
The booth's big screen shows:
- Live leaderboard (top travelers)
- Faction war progress (LCS vs VCT)
- Live duels in progress
- QR code for new players to join

### 9. Avatar Privacy (IMPORTANT)
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

## Game Flow

```
[QR Scan] → [Registration] → [Choose Destination] → [See Starting City]
                                                            ↓
[Finish! See Score] ← [Segment 3] ← [Segment 2] ← [Segment 1]
                                                            ↓
                                               [Route + Vehicle Selection]
```

### Detailed Flow
1. **Scan QR** → Opens game URL in browser
2. **Registration** → Name + Avatar (or login if returning)
3. **Home Screen** → Play, Duel, Leaderboard options
4. **Choose Destination** → LCS Arena or VCT Arena
5. **Starting City Revealed** → Random from 10 cities
6. **Segment 1** → See 3 routes, pick one, pick vehicle
7. **Travel Animation** → Watch progress, time ticking
8. **Segment 2** → Repeat route + vehicle selection
9. **Segment 3** → Final leg of journey
10. **Arrival!** → See final time, score calculation, rank

---

## Development Roadmap

> **Current Status:** See [PROGRESS.md](./PROGRESS.md) for daily updates

### Milestone Overview

| Version | Name | What It Delivers | Status |
|---------|------|------------------|--------|
| v0.0 | Documentation | Project plan, game mechanics, Git strategy | ✅ Complete |
| v1.0 | Setup | React + Vite + Tailwind + folder structure | ✅ Complete |
| v2.0 | Registration | Create account, login, logout, protected routes | ✅ Complete |
| v3.0 | Gameplay | Map view + Phaser racing game + scoring | ⏳ In Progress |
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

### v3.0 — Gameplay (Phaser Racing Game) ⏳

> **Full details:** See [GAME_MECHANICS.md](./GAME_MECHANICS.md)

#### Phase 3.1: Game Data Architecture
- [ ] Update gameData.js with new vehicles (Bike, Car, Tractor, Truck, Sports Car)
- [ ] Add road types (Highway, Tar Road, Mud Road, Bumpy Road)
- [ ] Create route generation logic (city → waypoints → LA)
- [ ] Define vehicle-road speed relationships

#### Phase 3.2: Destination Selection Screen
- [ ] LCS vs VCT picker (large touch-friendly cards)
- [ ] Faction selection affects faction war totals

#### Phase 3.3: City Reveal Screen
- [ ] Random city assignment from 10 cities
- [ ] Display city name, region, distance to LA
- [ ] "Start Journey" button

#### Phase 3.4: Map View (Route Selection)
- [ ] Cartoon world map component (React + SVG/Canvas)
- [ ] Show 3 route options with different waypoints
- [ ] Display road types and distances per route
- [ ] Route cards with points multiplier (1.0x, 1.2x, 1.5x)

#### Phase 3.5: Segment Breakdown Screen
- [ ] Show 3 segments after route selection
- [ ] Display waypoint cities and road types
- [ ] "Select Vehicle" button for each segment

#### Phase 3.6: Vehicle Selection (Per Segment)
- [ ] 5 vehicles with costs and road hints
- [ ] GOOD/SLOW/BAD indicators based on road type
- [ ] Confirm button (not auto-select)
- [ ] Credits tracking

#### Phase 3.7: Phaser Racing Game
- [ ] Initialize Phaser canvas in React
- [ ] Pseudo-3D road rendering (OutRun style)
- [ ] Vehicle sprite on road
- [ ] Left/Right steering with on-screen buttons
- [ ] Obstacle spawning and collision detection
- [ ] Speed reduction on obstacle hit
- [ ] Gradual speed recovery
- [ ] Boost button (costs credits)
- [ ] Progress bar and timer
- [ ] Segment completion detection

#### Phase 3.8: Segment Loop & Map Progress
- [ ] Return to map after segment completion
- [ ] Show completed segments on map
- [ ] Progress indicator (1/3, 2/3, 3/3)
- [ ] Loop through all 3 segments

#### Phase 3.9: Results Screen
- [ ] Score calculation (base + distance bonus + time bonus + credits saved)
- [ ] Journey summary with all segments
- [ ] Save score to player profile
- [ ] Update faction totals
- [ ] Play Again / Home buttons

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

## References

- [Cloud9 x JetBrains Hackathon](https://cloud9.devpost.com/)
- [Hackathon Rules](https://cloud9.devpost.com/rules)
- [Cloud9 Official Website](https://cloud9.gg/)
- [Phaser.js Documentation](https://phaser.io/)
- [Firebase Documentation](https://firebase.google.com/docs)
