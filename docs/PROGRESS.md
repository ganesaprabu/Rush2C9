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

| Milestone | Status | Tag |
|-----------|--------|-----|
| Documentation & Setup | ✅ Complete | v0.0-docs |
| React + Vite Setup | ⏳ Pending | v1.0-setup |
| Registration Screen | ⏳ Pending | v2.0-registration |
| Core Gameplay | ⏳ Pending | v3.0-gameplay |
| Multiplayer Features | ⏳ Pending | v4.0-multiplayer |
| Final Release | ⏳ Pending | v5.0-release |

---

## Deadline Reminder

| Item | Detail |
|------|--------|
| **Submission Deadline** | February 3, 2026 @ 11:00 AM PT |
| **Your Time (IST)** | February 4, 2026 @ 12:30 AM |
| **Days Remaining** | ~13 days |

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

### January 22, 2026 (Day 2)

**Completed:**
- [ ] (To be filled)

**Next:**
- [ ] (To be filled)

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
├── src/                    ← App code (coming soon)
├── public/                 ← Static assets
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
