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

## Milestones & Timeline

### Week 1 (Jan 21-27)
- [x] Finalize game concept
- [ ] Complete documentation
- [ ] Setup project structure
- [ ] Init Git repository
- [ ] Build registration screen
- [ ] Build game map & routes

### Week 2 (Jan 28 - Feb 2)
- [ ] Complete game logic
- [ ] Setup Firebase
- [ ] Implement leaderboard
- [ ] Add duel system
- [ ] Cloud9 theming & polish
- [ ] Testing

### Feb 3 (Deadline Day)
- [ ] Record demo video
- [ ] Final testing
- [ ] Submit to Devpost

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
