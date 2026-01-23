# Rush2C9 - Game Mechanics Document

## Overview

Rush2C9 is a **skill-based racing game** where fans travel from a random starting city to their chosen Cloud9 arena (LCS or VCT). The game combines **strategic route/vehicle selection** with **Phaser.js racing gameplay**.

---

## Game Vision (Finalized)

### Two Distinct Experiences

| Mode | Technology | Purpose |
|------|------------|---------|
| **Map Mode** | React + SVG/Canvas | Route selection, progress tracking |
| **Racing Mode** | Phaser.js | Actual gameplay — drive, avoid obstacles, race! |

### The Core Loop

```
1. Choose Destination (LCS or VCT)
         ↓
2. Random Starting City Revealed (e.g., Chennai)
         ↓
3. MAP VIEW: See 3 route options on cartoon world map
         ↓
4. Select route → See 3 segments breakdown
   Example: Chennai → Dubai → Germany → LA
         ↓
5. RACING GAME (Phaser.js) — Segment 1
   - Player controls vehicle
   - Avoid obstacles on the road
   - Complete segment → Back to MAP
         ↓
6. MAP shows Segment 1 complete ✓
         ↓
7. RACING GAME — Segment 2
         ↓
8. MAP shows Segment 2 complete ✓
         ↓
9. RACING GAME — Segment 3
         ↓
10. RESULTS: Score breakdown, journey summary
```

---

## Road Types (Replaces Terrain)

> **Decision:** We use road types instead of water/land terrain. This is simpler and more intuitive for a racing game.

| Road Type | Visual | Description | Best Vehicle |
|-----------|--------|-------------|--------------|
| **Highway** | 🛣️ | Smooth, fast, wide lanes | Sports Car 🏎️ |
| **Tar Road** | 🛤️ | Normal paved road | Car 🚗 |
| **Mud Road** | 🟤 | Wet, slippery, slow | Tractor 🚜 |
| **Bumpy Road** | 🪨 | Rocky, uneven surface | Truck 🛻 |

### Road-Vehicle Relationship

| Road Type | 🚲 Bike | 🚗 Car | 🚜 Tractor | 🛻 Truck | 🏎️ Sports Car |
|-----------|---------|--------|------------|----------|---------------|
| Highway | ⚠️ Slow | ✅ Good | ⚠️ Slow | ⚠️ Slow | ✅ BEST |
| Tar Road | ✅ Good | ✅ BEST | ⚠️ Slow | ✅ Good | ✅ Good |
| Mud Road | ❌ Bad | ⚠️ Slow | ✅ BEST | ✅ Good | ❌ Bad |
| Bumpy Road | ⚠️ Slow | ❌ Bad | ✅ Good | ✅ BEST | ❌ Bad |

**Key insight:** Wrong vehicle on wrong road = SLOW. Right vehicle = FAST!

---

## Vehicles (Updated)

| Vehicle | Emoji | Cost | Best For | Speed Multiplier |
|---------|-------|------|----------|------------------|
| Bike | 🚲 | 20 💳 | Tar Road (budget option) | 1.0x base |
| Car | 🚗 | 40 💳 | Tar Road, Highway | 1.5x on tar/highway |
| Tractor | 🚜 | 50 💳 | Mud Road | 2.0x on mud |
| Truck | 🛻 | 60 💳 | Bumpy Road | 2.0x on bumpy |
| Sports Car | 🏎️ | 100 💳 | Highway (fastest) | 2.5x on highway |

### Vehicle Selection Strategy

| Situation | Best Choice | Why |
|-----------|-------------|-----|
| Highway segment | Sports Car 🏎️ | Fastest, worth the cost |
| Tar road segment | Car 🚗 | Good speed, reasonable cost |
| Mud road segment | Tractor 🚜 | Only vehicle that handles mud well |
| Bumpy road segment | Truck 🛻 | Designed for rough terrain |
| Low on credits | Bike 🚲 | Cheap, works OK on tar road |

---

## Racing Mechanics (Phaser.js)

### Controls

> **Decision:** On-screen arrow buttons (Option C) — clear, visible, no accidental swipes.

```
┌─────────────────────────────────────────┐
│                                         │
│           [RACING GAME VIEW]            │
│                                         │
│         Road with obstacles             │
│         Vehicle in center               │
│                                         │
│   ┌───────┐               ┌───────┐    │
│   │   ◀   │               │   ▶   │    │
│   │ LEFT  │               │ RIGHT │    │
│   └───────┘               └───────┘    │
│                                         │
│            ┌─────────────┐              │
│            │  🚀 BOOST   │              │
│            │   (cost 💳) │              │
│            └─────────────┘              │
└─────────────────────────────────────────┘
```

### Gameplay Elements

| Element | Description |
|---------|-------------|
| **Steering** | Left/Right buttons to move vehicle |
| **Obstacles** | Rocks, potholes, barriers, other vehicles on road |
| **Collision** | Hit obstacle → speed slows down (doesn't stop), gradually recovers |
| **Booster** | Tap button → temporary speed increase, costs credits |
| **Finish Line** | Complete segment distance to finish |

### Obstacle Behavior

| Event | Effect |
|-------|--------|
| Hit obstacle | Speed reduces by 30-50% |
| Recovery | Speed gradually returns to normal over 2-3 seconds |
| Multiple hits | Each hit slows you down again |
| Clean run | Maintain top speed, faster completion |

### Booster System

| Property | Value |
|----------|-------|
| Cost | TBD (decide after testing) |
| Duration | 2-3 seconds |
| Speed increase | +50% temporary boost |
| Cooldown | 3 seconds between boosts |
| Strategy | Use for final stretch or to recover from obstacle hit |

---

## Route System

### Route Selection on Map

When player sees the map, they see 3 route options:

| Route | Distance | Road Types | Points Multiplier |
|-------|----------|------------|-------------------|
| **Short Route** | Less km | Harder roads (mud, bumpy) | 1.0x |
| **Medium Route** | Medium km | Mixed roads | 1.2x |
| **Long Route** | More km | Easier roads (tar, highway) | 1.5x |

> **Scoring Logic:** Longer route = more points, but takes more time. Risk/reward!

### Segment Breakdown

After selecting a route, it breaks into 3 segments with waypoints:

**Example (Chennai → LCS Arena via Long Route):**
```
Segment 1: Chennai → Dubai (Highway)
Segment 2: Dubai → Berlin (Tar Road)
Segment 3: Berlin → Los Angeles (Highway)
```

### Dynamic Waypoints

- Starting city is **random** (1 of 10 cities)
- Waypoints are **generated dynamically** based on starting city
- Creates unique journey each game
- Same route type will have different waypoints based on origin

---

## Game Flow (Detailed)

### Phase 1: Destination Selection

```
┌─────────────────────────────────────────┐
│                                         │
│            ☁️ RUSH2C9                   │
│                                         │
│       Choose Your Destination           │
│                                         │
│   ┌───────────┐     ┌───────────┐      │
│   │   🎮 LCS  │     │   🎯 VCT  │      │
│   │   ARENA   │     │   ARENA   │      │
│   │           │     │           │      │
│   │  League   │     │ VALORANT  │      │
│   └───────────┘     └───────────┘      │
│                                         │
│      Which team do you support?         │
└─────────────────────────────────────────┘
```

### Phase 2: City Reveal

```
┌─────────────────────────────────────────┐
│                                         │
│         YOUR STARTING CITY              │
│                                         │
│   ┌─────────────────────────────┐      │
│   │                             │      │
│   │   🌏 CARTOON WORLD MAP      │      │
│   │                             │      │
│   │       ★ CHENNAI (pulsing)   │      │
│   │                    🏁 LA    │      │
│   │                             │      │
│   └─────────────────────────────┘      │
│                                         │
│          📍 CHENNAI, INDIA              │
│          Distance: 14,500 km            │
│                                         │
│          [ START JOURNEY ]              │
└─────────────────────────────────────────┘
```

### Phase 3: Route Selection (Map View)

```
┌─────────────────────────────────────────┐
│  Credits: 💳 200                        │
│─────────────────────────────────────────│
│                                         │
│   ┌─────────────────────────────┐      │
│   │                             │      │
│   │   🌏 MAP with 3 routes      │      │
│   │                             │      │
│   │   ★ Chennai                 │      │
│   │    ╲___Route A (short)      │      │
│   │     ╲__Route B (medium)     │      │
│   │      ╲_Route C (long)       │      │
│   │                    🏁 LA    │      │
│   └─────────────────────────────┘      │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 🅰️ SHORT    8,000 km   1.0x pts │    │
│  │    Mud → Bumpy → Tar           │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 🅱️ MEDIUM  10,500 km   1.2x pts │    │
│  │    Tar → Mud → Highway         │    │
│  └────────────────────────────────┘    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ 🅲️ LONG    14,500 km   1.5x pts │    │
│  │    Highway → Tar → Highway     │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### Phase 4: Segment Breakdown

After route selection, show the 3 segments:

```
┌─────────────────────────────────────────┐
│  Route: LONG (14,500 km)   💳 200       │
│─────────────────────────────────────────│
│                                         │
│   Your journey in 3 segments:           │
│                                         │
│   ┌─────────────────────────────┐      │
│   │ Segment 1: Chennai → Dubai  │      │
│   │ 🛣️ Highway | 4,800 km       │      │
│   └─────────────────────────────┘      │
│                                         │
│   ┌─────────────────────────────┐      │
│   │ Segment 2: Dubai → Berlin   │      │
│   │ 🛤️ Tar Road | 5,200 km      │      │
│   └─────────────────────────────┘      │
│                                         │
│   ┌─────────────────────────────┐      │
│   │ Segment 3: Berlin → LA      │      │
│   │ 🛣️ Highway | 4,500 km       │      │
│   └─────────────────────────────┘      │
│                                         │
│   [ SELECT VEHICLE FOR SEGMENT 1 ]      │
└─────────────────────────────────────────┘
```

### Phase 5: Vehicle Selection (Per Segment)

```
┌─────────────────────────────────────────┐
│  Segment 1 of 3              💳 200     │
│  Chennai → Dubai | 🛣️ Highway           │
│─────────────────────────────────────────│
│                                         │
│  Choose your vehicle:                   │
│                                         │
│  ┌────────┐ ┌────────┐ ┌────────┐      │
│  │   🚲   │ │   🚗   │ │   🚜   │      │
│  │  Bike  │ │  Car   │ │Tractor │      │
│  │ 20 💳  │ │ 40 💳  │ │ 50 💳  │      │
│  │ ⚠️SLOW │ │ ✅GOOD │ │ ⚠️SLOW │      │
│  └────────┘ └────────┘ └────────┘      │
│                                         │
│  ┌────────┐ ┌────────┐                 │
│  │   🛻   │ │   🏎️   │                 │
│  │ Truck  │ │ Sports │                 │
│  │ 60 💳  │ │ 100💳  │                 │
│  │ ⚠️SLOW │ │ ✅BEST │  ← Hints!       │
│  └────────┘ └────────┘                 │
│                                         │
│        [ ← BACK ]    [ CONFIRM ]        │
└─────────────────────────────────────────┘
```

### Phase 6: Racing Game (Phaser.js)

```
┌─────────────────────────────────────────┐
│  Segment 1/3  Chennai→Dubai  💳 100     │
│  ████████░░░░░░░░ 45%     ⏱️ 12.3s     │
│─────────────────────────────────────────│
│                                         │
│           |     |     |                 │
│           |  🪨 |     |                 │
│           |     |     |                 │
│     ------+-----+-----+------           │
│           |     |     |                 │
│           |     | 🏎️  |  ← Player      │
│           |     |     |                 │
│     ------+-----+-----+------           │
│           |     |     |                 │
│                                         │
│   ┌─────┐             ┌─────┐          │
│   │  ◀  │             │  ▶  │          │
│   │LEFT │             │RIGHT│          │
│   └─────┘             └─────┘          │
│                                         │
│          ┌──────────────┐               │
│          │  🚀 BOOST    │               │
│          └──────────────┘               │
└─────────────────────────────────────────┘
```

**Racing Elements:**
- Pseudo-3D road perspective (like Phaser Driving example)
- Obstacles spawn and scroll toward player
- Player steers left/right to avoid
- Progress bar shows segment completion
- Timer shows elapsed time
- Boost button for temporary speed increase

### Phase 7: Segment Complete → Back to Map

```
┌─────────────────────────────────────────┐
│                                         │
│         ✅ SEGMENT 1 COMPLETE!          │
│                                         │
│         Chennai → Dubai                 │
│         Time: 24.5 seconds              │
│         Obstacles hit: 3                │
│                                         │
│   ┌─────────────────────────────┐      │
│   │                             │      │
│   │   🌏 MAP                    │      │
│   │                             │      │
│   │   ★ Chennai ──✓── Dubai     │      │
│   │                    ↓        │      │
│   │                  Berlin     │      │
│   │                    ↓        │      │
│   │                   LA 🏁     │      │
│   └─────────────────────────────┘      │
│                                         │
│   Progress: [●●○] 1 of 3 complete       │
│                                         │
│   [ SELECT VEHICLE FOR SEGMENT 2 ]      │
└─────────────────────────────────────────┘
```

### Phase 8: Results Screen

```
┌─────────────────────────────────────────┐
│                                         │
│         🏁 JOURNEY COMPLETE! 🏁         │
│                                         │
│         Chennai → LCS Arena             │
│                                         │
│         ┌───────────────────┐          │
│         │                   │          │
│         │   YOUR SCORE      │          │
│         │                   │          │
│         │    ⭐ 785 ⭐      │          │
│         │                   │          │
│         └───────────────────┘          │
│                                         │
│  Score Breakdown:                       │
│  ├── Base Points:      500              │
│  ├── Distance Bonus:   +150 (1.5x)      │
│  ├── Time Bonus:       +85              │
│  └── Credits Saved:    +50              │
│                                         │
│  Journey Summary:                       │
│  ├── Seg 1: 🏎️ Highway  → 24.5s        │
│  ├── Seg 2: 🚗 Tar Road → 32.1s        │
│  └── Seg 3: 🏎️ Highway  → 21.8s        │
│                                         │
│  Total Time: 78.4 seconds               │
│  Obstacles Hit: 7                       │
│                                         │
│    [ 🏠 HOME ]    [ 🔄 PLAY AGAIN ]     │
└─────────────────────────────────────────┘
```

---

## Scoring System (Updated)

### Score Calculation

```
FINAL SCORE = Base Points
            + Distance Bonus (route multiplier)
            + Time Bonus
            + Credits Saved
            - Obstacle Penalty (optional)

Where:
- Base Points: 500 (for completing journey)
- Distance Bonus: Base × Route Multiplier (1.0x, 1.2x, or 1.5x)
- Time Bonus: MAX(0, 300 - Total Travel Time in seconds)
- Credits Saved: Unspent credits from 200 budget
- Obstacle Penalty: TBD (optional, may remove for simplicity)
```

### Example Calculations

**Scenario: Long route, fast completion, budget vehicles**
- Route: Long (1.5x multiplier)
- Total time: 78 seconds
- Credits spent: 150 (used cheaper vehicles)
- Score = 500 + (500 × 0.5) + (300 - 78) + (200 - 150)
- Score = 500 + 250 + 222 + 50 = **1,022 pts**

**Scenario: Short route, slow completion, expensive vehicles**
- Route: Short (1.0x multiplier)
- Total time: 120 seconds
- Credits spent: 180 (used expensive vehicles on wrong roads)
- Score = 500 + (500 × 0) + (300 - 120) + (200 - 180)
- Score = 500 + 0 + 180 + 20 = **700 pts**

---

## Currency System

### Two Currencies

| Currency | Symbol | Purpose | Behavior |
|----------|--------|---------|----------|
| **Credits** | 💳 | Buy vehicles, use boosters | Refreshes each game (200 per game) |
| **Score** | 🏆 | Leaderboard ranking | Accumulates permanently |

### Credit Usage

| Action | Cost |
|--------|------|
| Bike | 20 💳 |
| Car | 40 💳 |
| Tractor | 50 💳 |
| Truck | 60 💳 |
| Sports Car | 100 💳 |
| Booster (per use) | TBD 💳 |

---

## Starting Cities (10)

| # | City | Region | Distance to LA |
|---|------|--------|----------------|
| 1 | Tokyo | Asia | 8,800 km |
| 2 | Seoul | Asia | 9,500 km |
| 3 | Chennai | Asia | 14,500 km |
| 4 | Dubai | Middle East | 13,400 km |
| 5 | Sydney | Oceania | 12,000 km |
| 6 | London | Europe | 8,800 km |
| 7 | Paris | Europe | 9,100 km |
| 8 | Berlin | Europe | 9,300 km |
| 9 | São Paulo | South America | 9,900 km |
| 10 | Toronto | North America | 3,500 km |

---

## Destinations (2)

| Arena | Location | Represents |
|-------|----------|------------|
| **LCS Arena** | Los Angeles, USA | League of Legends Championship Series |
| **VCT Arena** | Los Angeles, USA | VALORANT Champions Tour |

Both are in LA. Choice determines faction allegiance.

---

## Touch-Friendly UI Guidelines

### Minimum Touch Targets

| Platform | Minimum Size |
|----------|--------------|
| Apple (iOS) | 44 × 44 pt |
| Google (Android) | 48 × 48 dp |
| **Our Standard** | **56 × 56 px** |

### Button Placement

```
┌─────────────────────────────┐
│      HARD TO REACH          │  ← Avoid primary actions
│                             │
│    COMFORTABLE ZONE         │  ← Info, back buttons OK
│                             │
│  ███ EASY ZONE ███          │  ← PRIMARY BUTTONS HERE
│  ███ (BOTTOM) ███           │  ← Controls, selections
└─────────────────────────────┘
```

### Racing Controls Layout

```
┌─────────────────────────────────────────┐
│                                         │
│         [GAME VIEW - TOP 60%]           │
│                                         │
│─────────────────────────────────────────│
│                                         │
│   ┌─────┐               ┌─────┐        │
│   │  ◀  │               │  ▶  │        │  ← 80px buttons
│   │LEFT │               │RIGHT│        │
│   └─────┘               └─────┘        │
│                                         │
│          ┌──────────────┐               │
│          │  🚀 BOOST    │               │  ← Centered
│          └──────────────┘               │
│                                         │
└─────────────────────────────────────────┘
```

---

## Booth Environment Context

### Where This Game Will Be Played

| Factor | Reality |
|--------|---------|
| **Location** | Cloud9 booth at LCS/VCT events |
| **Crowd** | Young (16-30), energetic, esports fans |
| **Noise level** | LOUD — music, cheering, announcements |
| **Attention span** | SHORT — lots happening, people moving |
| **Device** | Fan's personal phone (iOS/Android) |
| **Play duration** | 2-3 minutes per game |

### Design Implications

| Constraint | Our Solution |
|------------|--------------|
| Loud environment | No audio required, 100% visual |
| Short attention | Quick 2-3 minute games |
| Phone screens | Touch-friendly UI, big buttons |
| Standing/walking | On-screen arrow controls |
| Competition | Leaderboard creates energy |

---

## Game Duration Target

| Phase | Target Time |
|-------|-------------|
| Destination + City reveal | ~30 seconds |
| Route selection | ~30 seconds |
| Vehicle selection (×3) | ~30 seconds total |
| Racing segments (×3) | ~90 seconds total |
| Results | ~15 seconds |
| **TOTAL** | **~2.5-3 minutes** |

Perfect for booth environment!

---

## Faction System

### LCS vs VCT

Every completed journey adds to faction totals:

```
┌─────────────────────────────────────────┐
│          🏆 FACTION WAR 🏆              │
│                                         │
│   🎮 LCS          vs          🎯 VCT   │
│   1,247 fans                  1,183 fans│
│   ████████████░░              ██████████│
│   52%                         48%       │
└─────────────────────────────────────────┘
```

---

## Duel System (Future - v6.0)

### How Duels Work

1. Fan A challenges Fan B
2. Fan B accepts
3. Both bet scores
4. Same starting city assigned
5. Both race simultaneously
6. Winner takes bet

---

## Leaderboard (v4.0)

- Top players displayed
- Faction totals
- Personal rank
- Avatars NEVER shown publicly (secret like passwords)

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Fan runs out of credits | Cannot happen — cheapest path = 60 credits |
| Same name + avatar | System rejects, pick different avatar |
| Fan disconnects | Game state saved, can resume |
| Too long (>5 min) | Auto-complete with minimum score |
| Hit too many obstacles | Keep going, just slower time |

---

## Technical Implementation Notes

### Technology Stack

| Component | Technology |
|-----------|------------|
| Map View | React + SVG/Canvas |
| Racing Game | Phaser.js 3.x |
| State Management | React useState/useReducer |
| Data Persistence | localStorage (→ Firebase later) |
| Styling | Tailwind CSS |

### Phaser Racing Reference

- Style: Pseudo-3D like OutRun / Phaser Driving example
- Reference: https://moonsault.itch.io/phaser-driving
- Road rendering: Perspective projection
- Obstacles: Sprites on road that scroll toward player

---

## Decisions Log

| Decision | Choice | Reason |
|----------|--------|--------|
| Road types vs terrain | Road types | More intuitive for racing game |
| Vehicles | 5 road vehicles | Matches road types, no water/air needed |
| Controls | On-screen buttons | No accidental swipes, clear visibility |
| Game engine | Phaser.js | Real game feel, not just form filling |
| Map style | Cartoon 2D | Fun, readable on phone, matches booth vibe |
| Booster cost | TBD | Decide after testing game balance |

---

## Summary

Rush2C9 is designed to be:
- 🎮 **A Real Game** — Phaser.js racing, not just clicking buttons
- ⚡ **Fast** — 2-3 minute games
- 🧠 **Strategic** — Route + vehicle choices matter
- 🏆 **Competitive** — Leaderboard + faction war
- 📱 **Touch-Friendly** — Big buttons, clear controls
- 🎉 **Fun at Booths** — Loud environment friendly
