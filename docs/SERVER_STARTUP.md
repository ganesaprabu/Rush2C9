# Rush2C9 - Server Startup Guide

## Quick Start

```bash
cd ~/Development/AI/Hackathon/JetBrains_Feb_2026_Game/Rush2C9
npm run dev
```

Then open: **http://localhost:5173**

---

## First Time Setup

If you just cloned the repo or encounter dependency issues:

```bash
# Install all dependencies
npm install
```

---

## Common Issues & Fixes

### Issue: Platform-specific module error

**Error:** `Cannot find module @rollup/rollup-darwin-arm64`

**Cause:** Dependencies were installed on a different platform (Linux VM vs macOS)

**Fix:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### Issue: Port already in use

**Error:** `Port 5173 is already in use`

**Fix:** Either kill the existing process or use a different port:
```bash
# Use different port
npm run dev -- --port 3000

# Or kill existing process
lsof -i :5173
kill -9 <PID>
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

---

## Development URLs

| Route | Description |
|-------|-------------|
| `/` | Splash screen (auto-redirects after 2s) |
| `/register` | Registration (name + avatar) |
| `/login` | Login screen |
| `/home` | Main menu |
| `/game` | Gameplay screen |
| `/game?destination=lcs` | Play for LCS Arena |
| `/game?destination=vct` | Play for VCT Arena |
| `/leaderboard` | Leaderboard |

---

## Tech Stack Reference

| Package | Version | Purpose |
|---------|---------|---------|
| React | 19.2.0 | UI Framework |
| Vite | 7.3.1 | Build tool & dev server |
| Tailwind CSS | 4.1.18 | Styling |
| Phaser | 3.x | Game engine (future) |
| React Router | 6.x | Navigation |

---

## Environment

- **Node.js:** v18+ recommended (you have v23.11.0)
- **Platform:** macOS (Apple Silicon / darwin-arm64)
- **Package Manager:** npm

---

## Troubleshooting Checklist

1. ✅ Are you in the correct directory? (`Rush2C9/`)
2. ✅ Is `node_modules/` present? If not, run `npm install`
3. ✅ Any lock files? Delete `.git/index.lock` if git commands fail
4. ✅ Port free? Check if 5173 is available
5. ✅ Node version? Run `node -v` (should be 18+)

---

## Contact

**Developer:** GANESAPRABU NAVAMANIRAJAN
**Email:** ganesa.tech.ai@gmail.com
