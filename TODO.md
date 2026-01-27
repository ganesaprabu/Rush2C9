# Rush2C9 - Development TODO

## Completed
- [x] Segment 1 - Car (175 km/h, 5 km)
- [x] Scoring system (Base + TimeBonus + Credits - HitsPenalty)
- [x] Boost tracking (used/available) - display only, not in score
- [x] Pit Stop screen with stats and current score

## In Progress
- [ ] Segment 2 - Truck (200 km/h, 7 km)
- [ ] Segment 3 - Race Car (225 km/h, 9 km)

## Pending (After Segment 3)
- [ ] Sound Effects
  - Engine sound (changes with speed)
  - Collision sound
  - Boost sound
  - Victory sound

---

## Segment 2 Work Items
- [ ] `drawTruck()` - player vehicle visual
- [ ] `drawOilBarrel()` - new obstacle
- [ ] `drawDebris()` - new obstacle
- [ ] Modify `drawHole()` - larger for segment 2
- [ ] Faster traffic speed config
- [ ] Pit Stop UI - "Continue" vs "Skip to Segment 3 (-100 credits)"

## Segment 3 Work Items
- [ ] `drawRaceCar()` - player vehicle visual
- [ ] `drawTireStack()` - new obstacle
- [ ] `drawConeCluster()` - new obstacle
- [ ] Even larger holes
- [ ] Fastest traffic speed config

---

## Config Summary

| Segment | Vehicle | Speed | Distance | Obstacles |
|---------|---------|-------|----------|-----------|
| 1 | Car | 175 km/h | 5 km | Pothole, Barricade, Traffic |
| 2 | Truck | 200 km/h | 7 km | Larger pothole, Oil barrel, Debris, Faster traffic |
| 3 | Race Car | 225 km/h | 9 km | Tire stack, Cone cluster, Racing traffic |

## Skip Cost
- Skip Segment 2 → Segment 3: **100 credits**
