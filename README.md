# Saaf Spot — Spot it. Fix it. Patrol it.

A gamified civic-cleanup platform where citizens report dirty public spots or clean them up themselves, earn verified points, and climb city/national leaderboards. Built for the Jaipur pilot as part of CodeQuest 2026.

## How it works

1. **Spot it** — drop a pin on a dirty location
2. **Show proof** — upload a before photo (and an after photo + video if cleaning it yourself)
3. **Get checked** — image hashing + AI verification assigns a trust score
4. **Earn points** — Verified gets full points, Partial Match gets half, Rejected gets none
5. **Redeem & rise** — climb the leaderboard, unlock badges, redeem points (coming soon)

## Project structure

```
.
├── backend/     Express + MongoDB API, auth, verification pipeline
├── frontend/    HTML/CSS/JS client (dashboard, submissions, report form)
└── README.md
```

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for setup instructions specific to each.

## Quick start (both together)

```bash
# clone
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME

# backend
cd backend
npm install
# create .env (see backend/README.md)
npm start

# frontend — in a separate terminal
cd frontend
# open index.html directly, or serve with a local static server
```

## Tech stack

- **Frontend**: HTML, CSS, vanilla JavaScript, Leaflet.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB + Mongoose
- **Auth**: JWT (HTTP-only cookies)
- **Media**: Cloudinary + Multer
- **Verification**: Gemini API, SHA-256 image hashing

## Team

*[team name here]*

## Status

Core report → verify → reward flow is functional. Leaderboard, wallet, and badge unlock logic are in progress.
