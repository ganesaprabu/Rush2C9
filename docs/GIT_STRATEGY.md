# Rush2C9 - Git Strategy

## Overview

This document outlines our Git workflow for the Rush2C9 hackathon project. We use a **simple, linear approach** optimized for solo development with clear milestone tracking.

---

## Branch Strategy

### Single Branch: `main`

```
main: ────●────●────●────●────●────●────●────●────
          │         │              │         │
         Tag       Tag            Tag       Tag
       v0.0      v1.0           v3.0      v5.0
```

**Why single branch?**
- Solo project — no merge conflicts
- Simple and fast
- Clear linear history
- Easy to track progress

---

## Commit Convention

### Format

```
type: short description

Optional longer description if needed.
```

### Types

| Type | Use For | Example |
|------|---------|---------|
| `feat` | New feature | `feat: Add registration screen` |
| `fix` | Bug fix | `fix: Fix avatar selection on iOS` |
| `docs` | Documentation | `docs: Update PROGRESS.md` |
| `style` | Styling/CSS | `style: Add Cloud9 blue theme` |
| `refactor` | Code restructure | `refactor: Simplify scoring logic` |
| `test` | Testing | `test: Add unit tests for scoring` |
| `chore` | Maintenance | `chore: Update dependencies` |

### Good Commit Messages

```bash
# ✅ Good
git commit -m "feat: Add vehicle selection screen"
git commit -m "fix: Fix score calculation for plane travel"
git commit -m "style: Add responsive layout for mobile"
git commit -m "docs: Update progress log for Day 2"

# ❌ Bad
git commit -m "updates"
git commit -m "fixed stuff"
git commit -m "WIP"
```

---

## Tag Strategy

### Milestone Tags

| Tag | Milestone | Description |
|-----|-----------|-------------|
| `v0.0-docs` | Documentation | Initial project setup, all docs |
| `v1.0-setup` | Project Setup | React + Vite configured |
| `v2.0-registration` | Registration | Name + avatar flow complete |
| `v3.0-gameplay` | Core Game | Map, routes, vehicles, scoring |
| `v4.0-multiplayer` | Multiplayer | Leaderboard, duels working |
| `v5.0-release` | Final | Submission-ready version |

### Creating Tags

```bash
# Create annotated tag
git tag -a v1.0-setup -m "Project setup complete

- React + Vite configured
- Tailwind CSS added
- Folder structure created"

# Push tag to GitHub
git push origin v1.0-setup

# List all tags
git tag -l

# View tag details
git show v1.0-setup
```

### Tag Naming Convention

```
v[major].[minor]-[description]

Examples:
- v0.0-docs        → Initial documentation
- v1.0-setup       → First setup complete
- v2.0-registration → Registration feature
- v2.1-avatar-fix  → Minor fix to registration
```

---

## Daily Workflow

### Start of Day

```bash
# Check status
git status

# Pull any changes (if working from multiple machines)
git pull origin main
```

### During Development

```bash
# After completing a small task
git add .
git commit -m "feat: Add component X"

# Push regularly (backup + shows progress)
git push origin main
```

### End of Day

```bash
# Update PROGRESS.md with day's work
# Commit the progress update
git add docs/PROGRESS.md
git commit -m "docs: Update progress log for Day X"
git push origin main
```

### After Major Milestone

```bash
# Create milestone tag
git tag -a v2.0-registration -m "Registration flow complete"
git push origin v2.0-registration
```

---

## Commit Frequency

| Situation | When to Commit |
|-----------|---------------|
| New screen/component | After it's working |
| Bug fix | Immediately after fixing |
| Feature complete | When feature works end-to-end |
| End of coding session | Before taking a break |
| Before risky changes | Safety checkpoint |

**Rule of thumb:** If you'd be upset losing the work, commit it!

---

## Viewing History

```bash
# View commit history
git log --oneline

# View history with graph
git log --oneline --graph

# View commits between tags
git log v1.0-setup..v2.0-registration --oneline

# View all tags
git tag -l
```

---

## Emergency Recovery

### Undo Last Commit (Keep Changes)

```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)

```bash
git reset --hard HEAD~1
```

### Go Back to a Tag

```bash
git checkout v1.0-setup
```

### Return to Latest

```bash
git checkout main
```

---

## GitHub Repository

| Setting | Value |
|---------|-------|
| **URL** | https://github.com/ganesaprabu/Rush2C9 |
| **Visibility** | Private (until submission) |
| **Default Branch** | main |

### Submission Day (Feb 3, 2026)

1. Go to repo Settings
2. Scroll to "Danger Zone"
3. Click "Change visibility"
4. Make it **Public**

---

## Summary

| Aspect | Our Approach |
|--------|--------------|
| Branches | Main only |
| Commits | Small, frequent, descriptive |
| Tags | Major milestones (v0, v1, v2...) |
| Push frequency | After each task |
| Documentation | Update PROGRESS.md daily |
