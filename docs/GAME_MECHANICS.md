# Rush2C9 - Game Mechanics Document

## Overview

Rush2C9 is a strategic racing game where fans travel from a random starting city to their chosen Cloud9 arena (LCS or VCT). Players must balance speed vs cost by choosing optimal routes and vehicles.

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
