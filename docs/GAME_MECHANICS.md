# Rush2C9 - Game Mechanics Document

## Overview

Rush2C9 is a **skill-based racing game** where fans travel from a random starting city to their chosen Cloud9 arena (LCS or VCT). The game combines **Phaser.js racing gameplay** with strategic mid-race decisions.

---

## Game Vision (Finalized - v2)

### Design Philosophy: Minimal Friction, Maximum Fun

> **Key Insight:** At a booth, every extra screen is friction. Players want to PLAY, not configure.

| Old Approach ❌ | New Approach ✅ |
|----------------|-----------------|
| 5+ screens before racing | 1 tap → Racing starts! |
| Pre-select route difficulty | Auto-assigned (moderate) |
| Pre-select vehicle | Default Car, switch during game |
| Map shown before racing | Map shown AFTER as victory screen |

### The Core Loop (Simplified)

```
1. Home Screen → Tap "LCS" or "VCT"
         ↓
2. City Reveal (3 sec auto-advance)
   "Your journey begins in... LONDON!"
         ↓
3. RACING GAME (Phaser.js) — 3 segments
   - Default vehicle: Car 🚗
   - Pit Stop between segments (optional vehicle switch)
   - Steer, avoid obstacles, use boost!
         ↓
4. RESULTS SCREEN + JOURNEY MAP
   - Score breakdown
   - Map showing full journey traveled
   - "Look what you accomplished!"
```

**Total taps before racing: 1** (destination choice)
**Total time to racing: ~5 seconds**

---

## Two Distinct Experiences

| Mode | Technology | Purpose |
|------|------------|---------|
| **Racing Mode** | Phaser.js | Core gameplay — drive, avoid obstacles, race! |
| **Journey Map** | React + SVG/Canvas | Victory screen — shows completed journey |

---

## Road Types

> **Decision:** We use road types instead of water/land terrain. Simpler and more intuitive for a racing game.

| Road Type | Visual | Description | Best Vehicle |
|-----------|--------|-------------|--------------|
| **Highway** | 🛣️ | Smooth, fast, wide lanes | Sports Car 🏎️ |
| **Tar Road** | 🛤️ | Normal paved road | Car 🚗 |
| **Mud Road** | 🟤 | Wet, slippery, slow | Tractor 🚜 |
| **Bumpy Road** | 🪨 | Rocky, uneven surface | Truck 🛻 |

### Road-Vehicle Speed Matrix

| Road Type | 🚲 Bike | 🚗 Car | 🚜 Tractor | 🛻 Truck | 🏎️ Sports Car |
|-----------|---------|--------|------------|----------|---------------|
| Highway | ⚠️ Slow | ✅ Good | ❌ Bad | ⚠️ Slow | ✅ BEST |
| Tar Road | ✅ Good | ✅ Good | ⚠️ Slow | ✅ Good | ✅ Good |
| Mud Road | ❌ Bad | ⚠️ Slow | ✅ BEST | ✅ Good | ❌ Bad |
| Bumpy Road | ⚠️ Slow | ⚠️ Slow | ✅ Good | ✅ BEST | ❌ Bad |

**Key insight:** Wrong vehicle on wrong road = SLOW. Right vehicle = FAST!

---

## Vehicles

| Vehicle | Emoji | Cost | Best For | Notes |
|---------|-------|------|----------|-------|
| Bike | 🚲 | 20 💳 | Tar Road | Cheap, vulnerable |
| Car | 🚗 | 40 💳 | Tar/Highway | **DEFAULT** — balanced |
| Tractor | 🚜 | 50 💳 | Mud Road | Slow but tough |
| Truck | 🛻 | 60 💳 | Bumpy Road | Handles rough terrain |
| Sports Car | 🏎️ | 100 💳 | Highway | Fastest, expensive |

### Vehicle Selection Strategy (NEW: Pit Stop System)

Instead of pre-selecting vehicles, players:
1. **Start with Car** (default, balanced)
2. **See upcoming road type** before each segment
3. **Decide at Pit Stop**: Keep current vehicle or spend credits to switch

This makes vehicle choice a **strategic mid-game decision** based on actual road conditions!

---

## Racing Mechanics (Phaser.js)

### Controls

> **Decision:** On-screen arrow buttons — clear, visible, no accidental swipes.

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
│            │   (10 💳)   │              │
│            └─────────────┘              │
└─────────────────────────────────────────┘
```

### Gameplay Elements

| Element | Description |
|---------|-------------|
| **Steering** | Left/Right buttons to move vehicle |
| **Obstacles** | Rocks, potholes, barriers, other vehicles |
| **Collision** | Hit obstacle → speed slows down, gradually recovers |
| **Booster** | Tap button → temporary speed increase, costs 10 credits |
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
| Cost | 10 💳 per use |
| Duration | 2 seconds |
| Speed increase | +50% temporary boost |
| Cooldown | 3 seconds between boosts |
| Strategy | Use for final stretch or to recover from obstacle hit |

---

## Game Flow (Simplified)

### Screen 1: Home (Already Built)

```
┌─────────────────────────────────────────┐
│  Welcome back,                   Score  │
│  GAN NAV                         🏆 0   │
│─────────────────────────────────────────│
│                                         │
│       Choose Your Destination           │
│                                         │
│   ┌───────────┐     ┌───────────┐      │
│   │   🎮 LCS  │     │   🎯 VCT  │      │
│   │   ARENA   │     │   ARENA   │      │
│   │  League   │     │ VALORANT  │      │
│   └───────────┘     └───────────┘      │
│                                         │
│        ← TAP TO START GAME              │
│                                         │
│       [⚔️ Challenge] [🏆 Leaderboard]   │
│                                         │
│           Faction War: LCS vs VCT       │
└─────────────────────────────────────────┘
```

### Screen 2: City Reveal (Auto-advances after 3 seconds)

```
┌─────────────────────────────────────────┐
│                                         │
│         Your journey begins in...       │
│                                         │
│                  🎡                     │
│                                         │
│              LONDON                     │
│              Europe                     │
│         8,800 km to Los Angeles         │
│                                         │
│         ┌───────────────────┐          │
│         │    Destination    │          │
│         │  🏟️ LCS Arena     │          │
│         │  League of Legends│          │
│         └───────────────────┘          │
│                                         │
│         [ GET READY... 3 ]             │
│         (auto-starts racing)            │
└─────────────────────────────────────────┘
```

### Screen 3: Racing Game (Phaser.js) — CORE GAMEPLAY

```
┌─────────────────────────────────────────┐
│  Seg 1/3  London→Dublin   💳 200        │
│  ████████░░░░░░░░ 45%     🛣️ Highway   │
│─────────────────────────────────────────│
│                                         │
│           |     |     |                 │
│           |  🪨 |     |                 │
│           |     |     |                 │
│     ------+-----+-----+------           │
│           |     |     |                 │
│           |     | 🚗  |  ← Player       │
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

### Screen 3b: Pit Stop (Between Segments — Optional)

```
┌─────────────────────────────────────────┐
│                                         │
│         ✅ SEGMENT 1 COMPLETE!          │
│         London → Dublin: 24.5s          │
│                                         │
│─────────────────────────────────────────│
│  NEXT: Dublin → Reykjavik               │
│  Road Type: 🟤 MUD ROAD                 │
│─────────────────────────────────────────│
│                                         │
│  Current Vehicle: 🚗 Car (⚠️ SLOW)      │
│                                         │
│  💡 Tip: Tractor handles mud better!    │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  🚜 Switch to Tractor?         │    │
│  │  Cost: 50 💳  |  You have: 200 │    │
│  │                                │    │
│  │  [ SWITCH ]    [ KEEP CAR ]    │    │
│  └────────────────────────────────┘    │
│                                         │
│     Auto-continues in 5 seconds...      │
└─────────────────────────────────────────┘
```

### Screen 4: Results + Journey Map (NEW!)

```
┌─────────────────────────────────────────┐
│                                         │
│         🏁 JOURNEY COMPLETE! 🏁         │
│                                         │
│         ┌───────────────────┐          │
│         │                   │          │
│         │   YOUR SCORE      │          │
│         │    ⭐ 785 ⭐      │          │
│         │                   │          │
│         └───────────────────┘          │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     🌍 YOUR JOURNEY MAP         │   │
│  │                                 │   │
│  │  🎡 London                      │   │
│  │     ↓ ─────────────────        │   │
│  │  🍀 Dublin                      │   │
│  │     ↓ ─────────────────        │   │
│  │  🧊 Reykjavik                   │   │
│  │     ↓ ─────────────────        │   │
│  │  🏔️ Denver                      │   │
│  │     ↓ ─────────────────        │   │
│  │  🏟️ LCS Arena, Los Angeles     │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Journey: 8,800 km in 78.4 seconds     │
│  Obstacles hit: 7                       │
│                                         │
│    [ 🏠 HOME ]    [ 🔄 PLAY AGAIN ]     │
└─────────────────────────────────────────┘
```

---

## Route System (Simplified)

### Auto-Generated Routes

Instead of player selecting route difficulty:
- Route difficulty is **auto-assigned** (moderate by default)
- Creates 3 segments with mixed road types
- Each starting city has **predefined waypoints**

### Example Routes by Starting City

| Starting City | Waypoints | Final |
|---------------|-----------|-------|
| Tokyo | Honolulu → San Francisco → Las Vegas | LA |
| London | Dublin → Reykjavik → Denver | LA |
| Chennai | Dubai → London → New York | LA |
| Sydney | Auckland → Fiji → Honolulu | LA |

### Segment Road Types

Road types are randomly assigned based on moderate difficulty:
- ~30% Highway
- ~30% Tar Road
- ~20% Mud Road
- ~20% Bumpy Road

This creates variety without requiring player input.

---

## Scoring System

### Score Calculation

```
FINAL SCORE = Base Points
            + Time Bonus
            + Credits Saved

Where:
- Base Points: 500 (for completing journey)
- Time Bonus: MAX(0, 300 - Total Travel Time in seconds)
- Credits Saved: Unspent credits from 200 budget
```

### Example Calculation

**Scenario: Fast completion, used default car throughout**
- Total time: 78 seconds
- Credits spent: 0 (kept default car, no boosts)
- Score = 500 + (300 - 78) + 200
- Score = 500 + 222 + 200 = **922 pts**

**Scenario: Slow completion, switched vehicles + used boosts**
- Total time: 120 seconds
- Credits spent: 150 (vehicle switches + boosts)
- Score = 500 + (300 - 120) + 50
- Score = 500 + 180 + 50 = **730 pts**

---

## Currency System

### Two Currencies

| Currency | Symbol | Purpose | Behavior |
|----------|--------|---------|----------|
| **Credits** | 💳 | Vehicle switches, boosters | Refreshes each game (200 per game) |
| **Score** | 🏆 | Leaderboard ranking | Accumulates permanently |

### Credit Usage

| Action | Cost |
|--------|------|
| Keep current vehicle | 0 💳 |
| Switch to Bike | 20 💳 |
| Switch to Car | 40 💳 |
| Switch to Tractor | 50 💳 |
| Switch to Truck | 60 💳 |
| Switch to Sports Car | 100 💳 |
| Use Booster | 10 💳 |

---

## Starting Cities (10)

| # | City | Emoji | Region | Waypoints |
|---|------|-------|--------|-----------|
| 1 | Tokyo | 🗼 | Asia | Honolulu, San Francisco, Las Vegas |
| 2 | Seoul | 🏯 | Asia | Shanghai, Honolulu, Phoenix |
| 3 | Chennai | 🕌 | Asia | Dubai, London, New York |
| 4 | Dubai | 🏗️ | Middle East | Istanbul, Paris, Chicago |
| 5 | Sydney | 🦘 | Oceania | Auckland, Fiji, Honolulu |
| 6 | London | 🎡 | Europe | Dublin, Reykjavik, Denver |
| 7 | Paris | 🗼 | Europe | Madrid, Lisbon, Miami |
| 8 | Berlin | 🏛️ | Europe | Amsterdam, Toronto, Detroit |
| 9 | São Paulo | 🌴 | South America | Lima, Panama City, Mexico City |
| 10 | Toronto | 🍁 | North America | Chicago, Denver, Las Vegas |

---

## Destinations (2)

| Arena | Location | Represents |
|-------|----------|------------|
| **LCS Arena** | Los Angeles, USA | League of Legends Championship Series |
| **VCT Arena** | Los Angeles, USA | VALORANT Champions Tour |

Both are in LA. Choice determines faction allegiance.

---

## Journey Map (End Screen Feature)

### Purpose

The Journey Map is shown at the **END** of the game, not the beginning. This serves multiple purposes:

| Benefit | Description |
|---------|-------------|
| **Reward** | Visual celebration of accomplishment |
| **Closure** | Shows the complete journey traveled |
| **Shareable** | Cool visual players might screenshot |
| **Memorable** | Creates lasting impression |

### Map Elements

| Element | Visual |
|---------|--------|
| Starting city | 📍 Pin with city emoji |
| Waypoints | 🔵 Dots along the route |
| Destination | 🏁 Flag at LCS/VCT Arena |
| Route line | Dotted/dashed path connecting cities |
| Animation | Route draws from start to finish |

### Map Style

- **Cartoon/stylized** world map (not realistic)
- **Colorful** cities and landmarks
- **Simple** — readable on phone screens
- **Cloud9 branded** colors where appropriate

---

## Pit Stop System (NEW)

### How It Works

Between each segment, players see a **Pit Stop screen**:

1. **Segment complete** message with time
2. **Next segment info**: route + road type
3. **Vehicle recommendation** based on road
4. **Choice**: Switch vehicle or keep current
5. **Auto-continues** after 5 seconds if no action

### Strategic Depth

This creates interesting decisions:
- Spent credits on early switches? May not afford later
- See mud road coming? Maybe switch to Tractor
- Highway ahead? Sports Car worth the cost?
- Confident in driving skill? Keep Car and save credits

### Default Behavior

If player does nothing:
- **Auto-continues** with current vehicle after 5 seconds
- No credits spent
- Good for players who want simple experience

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
| Short attention | Quick start, minimal screens |
| Phone screens | Touch-friendly UI, big buttons |
| Standing/walking | On-screen arrow controls |
| Competition | Leaderboard creates energy |

---

## Game Duration Target

| Phase | Target Time |
|-------|-------------|
| Destination tap | 2 seconds |
| City reveal | 3 seconds (auto) |
| Racing (3 segments) | ~90 seconds |
| Pit stops (2 between segments) | ~10 seconds total |
| Results + Map | ~15 seconds |
| **TOTAL** | **~2 minutes** |

Even faster than before! Perfect for booth environment.

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

## Technical Implementation Notes

### Technology Stack

| Component | Technology |
|-----------|------------|
| Home/UI | React + Tailwind CSS |
| Racing Game | Phaser.js 3.x |
| Journey Map | React + SVG/Canvas |
| State Management | React useState/useReducer |
| Data Persistence | localStorage (→ Firebase later) |

### Phaser Racing Reference

- Style: Pseudo-3D like OutRun / Phaser Driving example
- Reference: https://moonsault.itch.io/phaser-driving
- Road rendering: Perspective projection
- Obstacles: Sprites on road that scroll toward player

---

## Decisions Log

| Date | Decision | Choice | Reason |
|------|----------|--------|--------|
| Jan 23 | Road types vs terrain | Road types | More intuitive for racing game |
| Jan 23 | Vehicles | 5 road vehicles | Matches road types, no water/air |
| Jan 23 | Controls | On-screen buttons | No accidental swipes |
| Jan 23 | Game engine | Phaser.js | Real game feel |
| Jan 23 | **Simplified flow** | 1 tap → racing | Reduce friction at booth |
| Jan 23 | **Vehicle selection** | Pit Stop mid-game | Strategic, not upfront guess |
| Jan 23 | **Map timing** | Show at END | Victory screen, not setup |
| Jan 23 | **Route selection** | Auto (moderate) | Faster start |

---

## Summary

Rush2C9 is designed to be:
- 🚀 **Instant** — 1 tap to start, racing in 5 seconds
- 🎮 **A Real Game** — Phaser.js racing, skill-based
- 🧠 **Strategic** — Pit Stop vehicle decisions matter
- 🏆 **Competitive** — Leaderboard + faction war
- 📱 **Touch-Friendly** — Big buttons, clear controls
- 🎉 **Fun at Booths** — Loud environment friendly
- 🗺️ **Rewarding** — Journey Map celebrates completion
