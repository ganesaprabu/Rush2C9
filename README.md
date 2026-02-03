# Rush2C9 🏁

**Race to the Arena. Support Your Team.**

A browser-based mini-game for Cloud9 fan booths at LCS and VCT events.

[![Category](https://img.shields.io/badge/Category-Event%20Game-blue)]()
[![Hackathon](https://img.shields.io/badge/Hackathon-Cloud9%20x%20JetBrains-orange)]()
[![License](https://img.shields.io/badge/License-MIT-green)]()

---

## 🎮 What is Rush2C9?

Rush2C9 is an interactive racing game where esports fans compete to travel from random cities around the world to Cloud9's arenas. Players must strategically choose routes and vehicles, balancing speed against cost to achieve the best score.

**Perfect for event booths:**
- Scan QR code → Play instantly on your phone
- No app installation required
- Quick 1-minute games
- Live leaderboard on booth's big screen
- Challenge other fans to duels!

---

## 🎯 How It Works

1. **Scan** the QR code at the Cloud9 booth
2. **Register** with your name and secret avatar
3. **Choose** your destination: LCS Arena or VCT Arena
4. **Race** from a random starting city (Tokyo, London, Chennai, São Paulo...)
5. **Select** routes and vehicles across 3 segments
6. **Arrive** and see your score on the leaderboard!

---

## 🗺️ Game Features

### Global Racing
- 10 starting cities worldwide
- 2 destinations (LCS Arena & VCT Arena)
- Multiple route options per segment
- 5 vehicle types (Bike, Car, Train, Ship, Plane)

### Strategic Gameplay
- **Credits** — Spend on vehicles (cheap = slow, expensive = fast)
- **Score** — Earn based on speed + leftover credits
- Balance your strategy for maximum points!

### Social Competition
- **Leaderboard** — Climb the ranks
- **Faction War** — LCS vs VCT, which team has more fans?
- **Duels** — Challenge other players, bet your scores!

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Phaser.js |
| Styling | Tailwind CSS |
| Backend | Firebase (Firestore) |
| Hosting | Firebase Hosting |

---

## 📁 Project Structure

```
Rush2C9/
├── docs/                    # Documentation
│   ├── PLANNING.md          # Project planning & decisions
│   └── GAME_MECHANICS.md    # Detailed game rules
├── src/                     # Application source code
├── public/                  # Static assets
├── README.md                # This file
└── LICENSE                  # MIT License
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ganesaprabu/Rush2C9.git

# Navigate to project
cd Rush2C9

# Install dependencies
npm install
```

### Development Server

```bash
# Start the development server
npm run dev
```

This will start the Vite development server. Open your browser and navigate to:
- **Local:** http://localhost:5173
- **Network:** http://YOUR_IP:5173 (for testing on mobile devices)

The server supports hot module replacement (HMR) - changes to your code will be reflected immediately without a full page reload.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production (output in `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview the production build
npm run preview
```

The production build will be output to the `dist/` folder, ready for deployment.

---

## 📱 Demo

[🎥 Watch Demo Video](YOUR_VIDEO_LINK_HERE)

[🎮 Try Live Demo](https://rush2c9.vercel.app)

---

## 📋 Hackathon Submission

**Hackathon:** Cloud9 x JetBrains "Sky's the Limit"
**Category:** Category 4 - Event Game
**Deadline:** February 3, 2026

### Submission Checklist
- [ ] Public GitHub repository
- [ ] MIT License
- [ ] Demo video (~3 minutes)
- [ ] Devpost submission form

---

## 🎨 Design Philosophy

Rush2C9 is designed specifically for the **event booth environment**:

- **Fast** — 1 minute games, no waiting
- **Loud-proof** — Visual-first, no audio required
- **Social** — Leaderboard creates energy
- **Inclusive** — Anyone can play, no gaming skill required
- **On-brand** — Cloud9 colors and theming

---

## 🤝 Contributing

This project was created for the Cloud9 x JetBrains Hackathon. Contributions welcome after the hackathon period!

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**GANESAPRABU NAVAMANIRAJAN**
- Email: ganesa.tech@gmail.com

---

## 🙏 Acknowledgments

- [Cloud9 Esports](https://cloud9.gg/) — For the amazing hackathon opportunity
- [JetBrains](https://www.jetbrains.com/) — For developer tools and support
- [Devpost](https://devpost.com/) — For hosting the hackathon platform

---

**Made with ❤️ for Cloud9 fans**
