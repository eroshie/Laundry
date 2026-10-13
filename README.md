# Laundry Tracking System — HTML, CSS and JavaScript

A framework-free application based on the supplied Figma PDF. No React, CDN libraries, or runtime dependencies are required.

## Open the application

Download the repository ZIP, extract it, and open `index.html` in a modern browser. Keep `index.html`, `style.css`, `data.js`, `app.js`, and the `assets` directory together. Alternatively, serve the directory with any static web server.

For development with automatic reload (optional, Node.js 22 or later):

```sh
npm ci --cache /tmp/laundry-npm-cache
npm run dev -- --port 5173
```

## Files

- `index.html`: page shell and stylesheet/script references.
- `style.css`: complete responsive designs.
- `data.js`: sample orders, reviews, status names and currency formatting.
- `app.js`: DOM rendering, navigation, forms, search, order management, payments, notes, tracking, reviews, reports and browser storage. User-entered text is escaped before HTML rendering.
- `assets/laundry-illustration.png`: welcome illustration extracted from the supplied design PDF.

## Features

Welcome and demo login; staff navigation, dashboard and orders; adding laundry to the queue; customer search and status filters; Pending, Wash, Dry and Ready detail screens; status updates; cash payment recording; notes; pickup notification demo; staff reviews; calculated sales reports with CSV export; customer tracking; expandable customer orders; ratings and review submission.

Reports were inferred from the navigation because the PDF did not include a report screen. Hamburger/cloud graphics in the export are assets rather than independent pages.

## Build and tests (optional developer tools)

`npm run build` copies the standalone site to `dist`; no compilation is needed. `npm run preview -- --port 4173` serves that directory.

`npm test` runs four browser tests: staff workflow and persistence, customer tracking and reviews, mobile/desktop widths, and serving the standalone output with a basic static server. Direct file opening could not be verified here because the managed browser blocks file URLs. Tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installed Chromium executable.

## Demo scope

Orders and reviews live only in the browser's localStorage (`laundry-orders` and `laundry-reviews`). Clearing these keys restores seed data on reload. File-based storage behavior may vary by browser; use a static HTTP server for consistent persistence. If storage is unavailable, changes remain for the current session.

Demo staff login accepts any nonempty client name/password. Known tracking IDs include #123, #88 and #72; Explore demo orders shows four sample orders. Order IDs do not authenticate customers.

Pickup notifications save a local flag and show a confirmation; no SMS or email is sent. Dashboard trend bars are illustrative and labeled. Order totals, payment balances, status counts and reports are calculated from stored orders. Total Spent in the customer portal follows the design's sum of order prices, including unpaid orders.

Production use requires a backend/database, real authentication, customer access controls, server-side validation, and SMS/email integration. No credentials are needed for this demo.
