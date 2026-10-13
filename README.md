# Laundry Tracking System

React web application based on the supplied 20-page Figma PDF. Includes welcome/login, staff navigation and dashboard, order queue and creation, customer search, all four laundry status detail views, notes and payment recording, pickup notification demo, staff reviews, sales reports with CSV export, customer tracking, customer orders and review submission. The exported hamburger/cloud graphics are design assets rather than separate application pages. Reports were inferred from the navigation because no report frame was provided.

## Run

Requires Node.js 22 or later.

```sh
npm ci --cache /tmp/laundry-npm-cache
npm run dev -- --port 5173
```

Production build: `npm run build`. Serve it with `npm run preview -- --port 4173`.

## Validation

```sh
npm test
```

Browser tests use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to another installed Chromium executable when needed. Tests cover adding orders, recording payment, changing status, notes, persistence, customer search, CSV downloads, tracking errors, pickup alerts, reviews and responsive screen widths.

## Demo scope

Data is stored only in this browser's localStorage, under `laundry-orders` and `laundry-reviews`. Seed orders and reviews are taken from the PDF. Clearing these keys restores the seed data on reload. Demo staff login accepts any nonempty client name and password. Tracking supports known IDs, including #123, #88 and #72; Explore demo orders shows the four sample portal orders. Order IDs are not authentication and must not expose real customer data in production.

Notifications save a local flag and display a confirmation; no SMS or email is sent. Dashboard trends are illustrative and labeled as such. Order totals, payment balances, status counts and reports are calculated from stored orders. Total Spent in the customer portal follows the design's sum of order prices, including unpaid orders.

Production deployment needs a backend/database, real staff and customer authentication, access controls, SMS/email delivery, and server-side validation. No credentials are required for this local demo.
