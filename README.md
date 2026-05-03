# Travelog

An offline-first travel dashboard to manage trips, expenses, notes,
and itineraries — all without needing an internet connection.

Built as a portfolio project to demonstrate real-world frontend
architecture, PWA implementation, and IndexedDB-based offline storage.

---

## Features

- Create and manage multiple trips
- Track expenses and budget with visual progress
- Add notes and itinerary activities
- Works fully offline after first load
- Installable as a PWA on desktop and mobile

---

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Dexie.js** (IndexedDB) — all data stored locally
- **PWA** — Service Worker + Web App Manifest

---

## Architecture Highlights

- Offline-first — all data lives in IndexedDB on the user's device
- Custom event system for reactive state across components
  without any external state management library
- Dual sidebar layout — trip switcher + navigation
- Manual Service Worker implementation (no next-pwa dependency)

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

To test PWA install:

```bash
npm run build
npm run start
```

Then open in Chrome and look for the install prompt.

---

## Project Structure

```
app/          → routing and layouts
components/   → UI components
db/           → IndexedDB configuration (Dexie)
lib/          → business logic
types/        → shared TypeScript types
public/       → static assets, manifest, service worker
```
