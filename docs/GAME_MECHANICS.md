# Rush2C9 - Game Mechanics Document

## Overview

Rush2C9 is a strategic racing game where fans travel from a random starting city to their chosen Cloud9 arena (LCS or VCT). Players must balance speed vs cost by choosing optimal routes and vehicles.

---

## Core Game Concept (The Original Vision)

### The Idea

The game is **map-based** where:
1. Fans start from a random city somewhere in the world
2. They must travel to one of 2 Cloud9 arenas (LCS or VCT)
3. The journey is divided into 3 segments
4. For each segment, fan chooses a **route** (affects distance & terrain)
5. For each segment, fan chooses a **vehicle** (costs credits, affects speed)
6. **Wrong vehicle on wrong terrain = SLOW** (bike on ocean = very slow!)
7. **Right vehicle on right terrain = FAST** (ship on water = fast!)
8. Goal: Reach the arena as fast as possible while managing credits

### The Strategy

| Choice | Trade-off |
|--------|-----------|
| Plane (100 credits) | Very fast everywhere, but expensive |
| Ship (60 credits) | Fast on water, slow on land |
| Car (40 credits) | Fast on land, useless on water |
| Bike (20 credits) | Cheap but slow everywhere |

**The skill:** Choosing the right vehicle for each terrain type while managing your 200 credit budget!

---

## Visual Design

### Map Style: 2D Playful/Cartoon

- **NOT** realistic geography — simplified, stylized world map
- **Bright, colorful** — matches energetic booth environment
- **Playful icons** — cartoon vehicles, fun city markers
- **Cloud9 blue theme** — brand colors throughout
- **Touch-friendly** — big buttons, clear visuals

### Why Cartoon Style?

| Real Map | Cartoon Map ✅ |
|----------|---------------|
| Complex, cluttered | Clean, readable |
| Serious tone | Fun, playful tone |
| Hard to see on phone | Easy to see on phone |
| Doesn't match booth vibe | Matches LCS/VCT energy |

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
| **Play duration** | 1-2 minutes max per game |

### Design Implications

| Constraint | Our Solution |
|------------|--------------|
| Loud environment | No audio required, 100% visual |
| Short attention | Quick 1-minute games |
| Phone screens | Touch-friendly UI, big buttons |
| Standing/walking | Simple one-hand controls |
| Competition | Leaderboard creates energy |
| Social | Duels, faction war, challenges |

---

## Touch-Friendly UI Guidelines

### Minimum Touch Targets

| Platform | Minimum Size |
|----------|--------------|
| Apple (iOS) | 44 × 44 pt |
| Google (Android) | 48 × 48 dp |
| **Our Standard** | **56 × 56 px** (bigger is better for booth!) |

### Button Placement

```
┌─────────────────────────────┐
│      HARD TO REACH          │  ← Avoid primary actions here
│                             │
│    COMFORTABLE ZONE         │  ← Secondary actions OK
│                             │
│  ███ EASY ZONE ███          │  ← PRIMARY BUTTONS HERE
│  ███ (BOTTOM) ███           │  ← Vehicle selection, Route picks
└─────────────────────────────┘
```

### Touch UI Rules

1. **Minimum 56px** for all tappable elements
2. **12-16px spacing** between buttons
3. **Primary actions at bottom** of screen (thumb zone)
4. **Clear tap feedback** — color change, scale animation
5. **No hover states** — touch has no hover
6. **High contrast** — readable in bright booth lighting

---

## Core Gameplay Flow (Visual)

### Phase 1: Destination Selection

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              ☁️ RUSH2C9                                     │
│                                                             │
│         Choose Your Destination                             │
│                                                             │
│    ┌─────────────────┐    ┌─────────────────┐              │
│    │                 │    │                 │              │
│    │   🎮 LCS        │    │   🎯 VCT        │              │
│    │   ARENA         │    │   ARENA         │              │
│    │                 │    │                 │              │
│    │  League of      │    │  VALORANT       │              │
│    │  Legends        │    │  Champions      │              │
│    │                 │    │                 │              │
│    └─────────────────┘    └─────────────────┘              │
│                                                             │
│         Which team do you support?                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens:**
- Fan taps LCS or VCT
- Choice affects faction war totals
- Both destinations are in Los Angeles

---

### Phase 2: City Reveal (Random Assignment)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              YOUR STARTING CITY                             │
│                                                             │
│         ┌─────────────────────────────────┐                │
│         │                                 │                │
│         │    🌏 WORLD MAP (cartoon)       │                │
│         │                                 │                │
│         │         ★ CHENNAI               │                │
│         │           (pulsing)             │                │
│         │                                 │                │
│         │                    🏁 LA        │                │
│         │                                 │                │
│         └─────────────────────────────────┘                │
│                                                             │
│              📍 CHENNAI, INDIA                              │
│              Distance: 14,500 km                            │
│                                                             │
│              [ START JOURNEY ]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens:**
- System randomly picks 1 of 10 cities
- Animated reveal (zoom to city on map)
- Shows distance to destination
- Fan taps "Start Journey" to begin

---

### Phase 3: Route Selection (Per Segment)

```
┌─────────────────────────────────────────────────────────────┐
│  Segment 1 of 3                    Credits: 💳 200          │
│─────────────────────────────────────────────────────────────│
│                                                             │
│         ┌─────────────────────────────────┐                │
│         │                                 │                │
│         │    🌏 MAP showing 3 routes      │                │
│         │                                 │                │
│         │    ★ Chennai                    │                │
│         │     ╲___Route A (direct)        │                │
│         │      ╲__Route B (scenic)        │                │
│         │       ╲_Route C (safe)          │                │
│         │                                 │                │
│         └─────────────────────────────────┘                │
│                                                             │
│  Choose your route:                                         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🅰️ DIRECT         4,800 km    🌊 80% Water 🏔️ 20%  │   │
│  │    Fastest path, mostly ocean                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🅱️ SCENIC         5,200 km    🌊 50% Water 🏔️ 50%  │   │
│  │    Mixed terrain, moderate distance                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🅲️ SAFE           6,100 km    🌊 20% Water 🏔️ 80%  │   │
│  │    Longer path, mostly land                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens:**
- Map shows 3 route options as paths
- Each route has different distance and terrain mix
- Fan taps to select a route
- Terrain % is crucial for vehicle choice next!

---

### Phase 4: Vehicle Selection (Per Segment)

```
┌─────────────────────────────────────────────────────────────┐
│  Segment 1 of 3                    Credits: 💳 200          │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  Route: DIRECT (4,800 km)                                   │
│  Terrain: 🌊 80% Water  🏔️ 20% Land                        │
│                                                             │
│  Choose your vehicle:                                       │
│                                                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │    🚲    │ │    🚗    │ │    🚂    │                    │
│  │   Bike   │ │   Car    │ │  Train   │                    │
│  │  20 💳   │ │  40 💳   │ │  50 💳   │                    │
│  │          │ │          │ │          │                    │
│  │ ⚠️ SLOW  │ │ ⚠️ SLOW  │ │ ❌ BAD   │                    │
│  └──────────┘ └──────────┘ └──────────┘                    │
│                                                             │
│  ┌──────────┐ ┌──────────┐                                 │
│  │    🚢    │ │    ✈️    │                                 │
│  │   Ship   │ │  Plane   │                                 │
│  │  60 💳   │ │  100 💳  │                                 │
│  │          │ │          │                                 │
│  │ ✅ GOOD  │ │ ✅ GOOD  │   ← Terrain hints!              │
│  └──────────┘ └──────────┘                                 │
│                                                             │
│         [ ← BACK ]              [ CONFIRM ]                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens:**
- Shows selected route's terrain breakdown
- 5 vehicles displayed with costs
- **"GOOD FIT" / "SLOW" / "BAD" indicators** based on terrain!
- Fan must balance cost vs speed
- Credits deducted upon selection

**Terrain Hint Logic:**
| Terrain | Good Vehicles | Bad Vehicles |
|---------|---------------|--------------|
| 80%+ Water | Ship ✅, Plane ✅ | Bike ⚠️, Car ⚠️, Train ❌ |
| 80%+ Land | Car ✅, Train ✅, Bike ⚠️ | Ship ⚠️ |
| Mixed | Plane ✅ (works everywhere) | Depends on mix |

---

### Phase 5: Traveling Animation

```
┌─────────────────────────────────────────────────────────────┐
│  Segment 1 of 3                    Credits: 💳 140          │
│─────────────────────────────────────────────────────────────│
│                                                             │
│         ┌─────────────────────────────────┐                │
│         │                                 │                │
│         │    🌏 MAP                       │                │
│         │                                 │                │
│         │    ★ Chennai                    │                │
│         │     ═══🚢════►                  │                │
│         │         (ship moving)           │                │
│         │                     ○ Waypoint  │                │
│         │                                 │                │
│         └─────────────────────────────────┘                │
│                                                             │
│              ⏱️ Traveling...                                │
│              Distance: 4,800 km                             │
│              Time: 24.0 seconds                             │
│                                                             │
│              ████████████░░░░░░ 65%                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens:**
- Brief animation showing vehicle moving on map
- Progress bar fills up
- Time is calculated based on terrain + vehicle speed
- After animation, moves to next segment (or results)

---

### Phase 6: Segment Loop (Repeat 3 Times)

```
Segment 1: Chennai → Waypoint 1
    └── Route Selection → Vehicle Selection → Travel

Segment 2: Waypoint 1 → Waypoint 2
    └── Route Selection → Vehicle Selection → Travel

Segment 3: Waypoint 2 → LCS/VCT Arena
    └── Route Selection → Vehicle Selection → Travel → RESULTS!
```

**Progress indicator:**
```
[●━━━━━━━━] Segment 1 of 3
[━━━●━━━━━] Segment 2 of 3
[━━━━━━●━━] Segment 3 of 3
[━━━━━━━━●] FINISHED!
```

---

### Phase 7: Results Screen

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              🏁 JOURNEY COMPLETE! 🏁                        │
│                                                             │
│              Chennai → LCS Arena                            │
│                                                             │
│         ┌─────────────────────────────────┐                │
│         │                                 │                │
│         │         YOUR SCORE              │                │
│         │                                 │                │
│         │          ⭐ 785 ⭐              │                │
│         │                                 │                │
│         └─────────────────────────────────┘                │
│                                                             │
│  Score Breakdown:                                           │
│  ├── Base Points:        500                                │
│  ├── Time Bonus:         +205  (finished in 95 sec)        │
│  └── Credits Saved:      +80   (spent 120 of 200)          │
│                                                             │
│  Journey Summary:                                           │
│  ├── Segment 1: Ship (60💳) → 24 sec                       │
│  ├── Segment 2: Car (40💳) → 35 sec                        │
│  └── Segment 3: Bike (20💳) → 36 sec                       │
│                                                             │
│  Total Time: 95 seconds                                     │
│  Total Spent: 120 credits                                   │
│                                                             │
│         [ 🏠 HOME ]         [ 🔄 PLAY AGAIN ]               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**What happens:**
- Shows final score with breakdown
- Journey log shows each segment's choice
- Score saved to player profile
- Faction count updated (LCS or VCT)
- Options to play again or go home

---

## 1. Starting Cities (10)

Players are randomly assigned one of these cities:

| # | City | Region | Approx Distance to LA |
|---|------|--------|----------------------|
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

## 2. Destinations (2)

| Arena | Location | Represents |
|-------|----------|------------|
| **LCS Arena** | Los Angeles, USA | League of Legends Championship Series |
| **VCT Arena** | Los Angeles, USA | VALORANT Champions Tour |

Both are in Los Angeles, but fans choose which team/game to support. This creates a faction war on the leaderboard.

---

## 3. Journey Structure

Each journey consists of **3 segments**. Each segment offers:
- 3 route options (different distances)
- 5 vehicle options (different costs & speeds)

```
START (Random City)
    │
    ├── Segment 1: 3 route choices
    │       └── Pick vehicle
    │
    ├── Segment 2: 3 route choices
    │       └── Pick vehicle
    │
    └── Segment 3: 3 route choices
            └── Pick vehicle
    │
    ▼
FINISH (LCS or VCT Arena)
```

---

## 4. Route Options

Each segment offers 3 routes with different characteristics:

| Route Type | Distance | Terrain Mix |
|------------|----------|-------------|
| **Direct** | Shortest | May cross ocean |
| **Scenic** | Medium | Mixed land/water |
| **Safe** | Longest | Mostly land |

**Example (Tokyo → Segment 1):**
| Route | Distance | Terrain |
|-------|----------|---------|
| A: Pacific Direct | 4,000 km | 100% Water |
| B: Via Alaska | 5,500 km | 60% Water, 40% Land |
| C: Via Hawaii | 4,800 km | 80% Water, 20% Land |

---

## 5. Vehicles

### Vehicle Stats

| Vehicle | Cost (Credits) | Land Speed | Water Speed | Air Speed |
|---------|----------------|------------|-------------|-----------|
| 🚲 Bike | 20 | Slow (1x) | ❌ Very Slow (0.2x) | ❌ Cannot |
| 🚗 Car | 40 | Fast (2x) | ❌ Very Slow (0.2x) | ❌ Cannot |
| 🚂 Train | 50 | Fast (2x) | ❌ Cannot (0x) | ❌ Cannot |
| 🚢 Ship | 60 | Slow (0.5x) | Fast (2x) | ❌ Cannot |
| ✈️ Plane | 100 | ❌ Cannot (0x) | Fast (1.5x) | Very Fast (3x) |

### Speed Multipliers Explained

Base travel time = Distance / 100 (in seconds)

**Example:** 4,000 km route
- Bike on land: 4000/100 × (1/1) = 40 sec
- Car on land: 4000/100 × (1/2) = 20 sec
- Plane in air: 4000/100 × (1/3) = 13.3 sec

### Vehicle Selection Strategy

| Terrain | Best Vehicle | Why |
|---------|--------------|-----|
| 100% Land | Car (40 credits) | Fast & cheap |
| 100% Water | Ship (60 credits) | Only water-efficient option |
| Mixed | Plane (100 credits) | Works everywhere but costly |
| Budget play | Bike (20 credits) | Slow but saves credits |

---

## 6. Currency System

### Two Currencies

| Currency | Symbol | Purpose | Behavior |
|----------|--------|---------|----------|
| **Credits** | 💳 | Buy vehicles | Refreshes each game (200 per game) |
| **Score** | 🏆 | Leaderboard ranking | Accumulates permanently |

### Why Two Currencies?

- **Credits:** Prevents "stuck" scenarios. Every game starts fresh with 200 credits.
- **Score:** Long-term progression. Fans climb leaderboard over multiple games.

---

## 7. Scoring System

### Score Calculation

```
FINAL SCORE = Base Points + Time Bonus + Leftover Credits Bonus

Where:
- Base Points: 500 (for completing journey)
- Time Bonus: MAX(0, 300 - Travel Time in seconds)
- Leftover Credits: Unspent credits from 200 budget
```

### Example Calculations

**Fast & Expensive Strategy:**
- Spends 180 credits (planes)
- Finishes in 45 seconds
- Score = 500 + (300-45) + (200-180) = 500 + 255 + 20 = **775 pts**

**Slow & Cheap Strategy:**
- Spends 60 credits (bikes)
- Finishes in 180 seconds
- Score = 500 + (300-180) + (200-60) = 500 + 120 + 140 = **760 pts**

**Balanced Strategy:**
- Spends 120 credits (mix)
- Finishes in 90 seconds
- Score = 500 + (300-90) + (200-120) = 500 + 210 + 80 = **790 pts**

### Key Insight

Balance is often better than extremes! Pure speed wastes credits, pure cheapness wastes time.

---

## 8. Duel System

### How Duels Work

1. **Challenge:** Fan A challenges Fan B (from leaderboard or nearby)
2. **Accept:** Fan B accepts the challenge
3. **Bet:** Both agree on bet amount (e.g., 50 points)
4. **Setup:** System assigns SAME starting city to both
5. **Race:** Both play simultaneously
6. **Result:**
   - Winner: +50 points (gains bet)
   - Loser: -50 points (loses bet)

### Duel Rules

| Rule | Detail |
|------|--------|
| Minimum bet | 10 points |
| Maximum bet | 50% of lower player's score |
| Same conditions | Both get identical starting city & routes |
| Timeout | 5 minutes to complete, or forfeit |

---

## 9. Faction System

### LCS vs VCT

Every completed journey adds to faction totals:

```
┌─────────────────────────────────────────────┐
│          🏆 FACTION WAR 🏆                  │
│                                             │
│   🎮 LCS          vs          🎯 VCT       │
│   1,247 fans                  1,183 fans   │
│   ████████████░░              ██████████░░ │
│   52%                         48%          │
│                                             │
└─────────────────────────────────────────────┘
```

### Faction Points

- Each completed journey = +1 to chosen faction
- Big screen shows live faction war
- Creates community energy at booth

---

## 10. Leaderboard

### Public Display (Booth Big Screen)

```
┌─────────────────────────────────────────────┐
│          🏆 TOP TRAVELERS 🏆                │
│                                             │
│   1. Mike Johnson         — 4,230 pts       │
│   2. Sarah Lee            — 3,800 pts       │
│   3. Alex Chen            — 3,650 pts       │
│   4. Mike Johnson         — 3,100 pts       │
│   5. Chris Kumar          — 2,900 pts       │
│                                             │
│   Your Rank: #47 (1,250 pts)                │
│                                             │
└─────────────────────────────────────────────┘
```

**Note:** Avatars are NEVER shown publicly (they're secret like passwords).

### Personal View (Fan's Phone)

```
┌─────────────────────────────────────────────┐
│                                             │
│   🏎️ Mike Johnson                          │
│                                             │
│   Score: 4,230 pts                          │
│   Rank: #1 🏆                               │
│   Games Played: 15                          │
│   Faction: LCS                              │
│                                             │
└─────────────────────────────────────────────┘
```

Avatar (🏎️) shown only on personal device.

---

## 11. Game Balance

### Design Goals

| Goal | How Achieved |
|------|--------------|
| Quick games | ~1 minute per journey |
| Strategic depth | Route + vehicle combinations |
| Replayability | Random starting cities |
| Social competition | Leaderboard + duels |
| Accessibility | Simple rules, visual feedback |

### Balancing Levers

If testing reveals issues:

| Problem | Solution |
|---------|----------|
| Games too long | Reduce distances, increase speeds |
| Games too short | Add more segments or longer routes |
| One vehicle dominates | Adjust costs or speeds |
| Scores too similar | Increase time bonus multiplier |
| Scores too different | Decrease time bonus multiplier |

---

## 12. Edge Cases

| Scenario | Handling |
|----------|----------|
| Fan runs out of credits mid-game | Cannot happen — 200 credits is enough for cheapest path (60 credits min) |
| Two fans have same name + avatar | System rejects, asks to pick different avatar |
| Fan disconnects mid-game | Game state saved, can resume |
| Fan takes too long (>5 min) | Auto-complete with minimum score |
| Duplicate leaderboard names | Allowed — avatar differentiates internally |

---

## 13. Future Enhancements (Post-Hackathon)

If the game wins and gets deployed:

1. **More cities** — 20+ starting locations
2. **Power-ups** — Speed boosts, credit bonuses
3. **Daily challenges** — Special routes with bonus points
4. **Achievements** — "Speed Demon", "Budget Traveler", etc.
5. **Seasonal events** — Themed routes during LCS/VCT finals
6. **Team mode** — Groups race together

---

## Summary

Rush2C9 is designed to be:
- ⚡ **Fast** — 1 minute games
- 🧠 **Strategic** — Balance speed vs cost
- 🏆 **Competitive** — Leaderboard + duels
- 🎉 **Social** — Faction war, challenges
- 📱 **Accessible** — Browser-based, no install
