# Meridian Home Finance — Mortgage/Loan Demo Site

A fully client-side demo banking site built to generate realistic customer,
profile, and loan-application data for testing **Adobe Experience Platform
(AEP)**, **Real-Time CDP**, and **Adobe Journey Optimizer (AJO)** — with a
focus on triggered journeys like abandoned-application reminders and
approval/rejection notifications.

Everything runs in the browser against `localStorage`; there is no backend.

## Stack

- React 19 + Vite
- React Router v7
- MUI (Material UI) v9, with a custom "Meridian" theme (see `src/theme.js`)
- Plain Context API for auth/session state (`src/context/AuthContext.jsx`)

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`).

## What's implemented

- **Registration / Login** (`src/pages/Register.jsx`, `Login.jsx`) — a
  permanent, globally-unique Customer ID (a real UUID, e.g.
  `CUST-8f14e45f-ceea-4c1a-9b3d-...`) is generated once per email and
  reused on every subsequent login. Registering with an email that's
  already in use no longer silently logs you in as that account — it
  shows an error and points you to the login page instead.
- **Category pages** for Home, Land, Vehicle, and Commercial loans, all
  rendered from one shared template (`src/pages/CategoryPage.jsx`) driven by
  `src/data/loanCategories.js`.
- **Eligibility checker** (`src/components/EligibilityForm.jsx`) — simple,
  readable rules in `src/utils/eligibility.js`. Every check (inputs +
  result) is logged as an `eligibilityCheck` event to both local and
  session storage.
- **Loan application flow** (`src/components/LoanApplicationForm.jsx`) — an
  application record (and the `applicationOpened` event) is created the
  instant the dialog opens, *before* any fields are filled in, so you can
  test abandoned-application journeys. Submitting fires
  `applicationSubmitted`. Closing the dialog *without* submitting now
  actually saves whatever was typed as a draft (this used to be silently
  discarded) and fires a separate `applicationFormAbandoned` event
  containing exactly the fields the person filled in — including if they
  close the browser tab mid-form (via a `beforeunload` listener).
- **Page view tracking** (`src/components/PageViewTracker.jsx`) — fires a
  `pageView` event with the page name and path on every route change.
  Previously this only fired once on initial load; client-side navigation
  between pages wasn't tracked at all.
- **My Applications** (`src/pages/Applications.jsx`) — view, continue a
  draft (now actually resumes with previously-typed data), cancel, upload
  a mock document, and see the event trail for that specific application.
- **Abandonment detection** — any Draft application older than 30 minutes
  is automatically flipped to `Abandoned` (see
  `detectAbandonedApplications()` in `src/services/applicationService.js`)
  and fires `applicationAbandoned`. This is separate from
  `applicationFormAbandoned` above — this one is a time-based/server-style
  trigger with no field data; that one is immediate and carries whatever
  was typed. Change `ABANDON_THRESHOLD_MINUTES` to test faster.
- **Profile** (`src/pages/Profile.jsx`) — editable details, an
  email/SMS/marketing consent panel (`consentUpdated` event), and a
  per-customer activity timeline.
- **Admin panel** (`src/pages/Admin.jsx`, at `/admin`) — a dark,
  developer-styled dashboard for inspecting every customer, application,
  and event in storage, split into a **"This Browser Session"** panel
  (sessionStorage — clears the moment the tab closes) and an **"all time"**
  panel (localStorage — persists across visits), plus live views of
  `window.digitalData` and `window.adobeDataLayer` (see below). Also has
  buttons to simulate an Approve/Reject decision on submitted applications
  (`applicationStatusChanged` event) and a "Reset Demo Data" button that
  clears both storage layers.
- **Adobe Client Data Layer** (`src/services/dataLayerService.js`) — every
  event fired through `sendEvent()` also populates two real,
  inspectable data layer objects on `window`:
  - `window.digitalData` — the classic Adobe/W3C-style object model
    (`page`, `user`, `loanApplication`, `eligibility`, `event[]`), kept
    current so a Launch rule bound to "state" (not just events) has
    something to read.
  - `window.adobeDataLayer` — the newer ACDL array pattern
    (`.push({...})`), the same shape GTM's `dataLayer` uses. Each push
    also dispatches a real `adobeDataLayer:push` DOM event, mirroring the
    real Adobe Client Data Layer library's behavior, so a listener can
    react without polling.

  Both update live and are visible in the Admin panel, or straight from
  devtools (`window.digitalData`, `window.adobeDataLayer`).
- **One unified application form for every loan type**
  (`src/components/LoanApplicationForm.jsx`) — rather than four separate
  forms, there's a single form with a **Loan Category dropdown** at the
  top. It's reachable from any category page (pre-selects that category,
  but you can still change it) *and* from an "Apply for a Loan" button in
  the navbar/mobile menu that's available from anywhere on the site with
  no category preselected.

## Local vs. session storage

Every event fired through `sendEvent()` is now written to **both**:

- **localStorage** (`meridian_customerEvents`) — permanent, survives
  closing the browser. This is the "all time" log.
- **sessionStorage** (`meridian_sessionEvents`) — cleared automatically by
  the browser the moment the tab/window closes. This is the "current
  visit only" log, which is what you asked for: everything a person does
  stays available until they actually leave/close the page, then it's
  gone.

Both are readable from `src/services/alloyService.js`
(`getEventLog()` / `getSessionEventLog()`), and both show up as separate
panels in the Admin page.

## Local storage layout

All keys are namespaced with `meridian_`:

| Key | Contents |
|---|---|
| `meridian_registeredUsers` | Array of full user records (including password — demo only) |
| `meridian_currentUser` | `{ customerId, email }` for the active session |
| `meridian_customerProfile_<id>` | Public-safe profile snapshot per customer |
| `meridian_customerEvents` | Flat array of every event fired site-wide |
| `meridian_loanApplications` | Array of all loan applications, all customers |
| `meridian_consent_<id>` | Per-customer communication preferences |

## Wiring up the real Adobe Web SDK (Alloy.js)

Every event in the app already funnels through one function:

```js
// src/services/alloyService.js
sendEvent(eventType, detail)
```

Right now `sendEvent` logs an XDM-shaped payload to the console and appends
it to `meridian_customerEvents` (which is what powers the Admin panel and
Event Timeline). To go live:

1. Add the Alloy.js tag/npm package and initialize it per Adobe's setup
   guide for your datastream.
2. Replace the body of `sendEvent` with a real call:

   ```js
   export function sendEvent(eventType, detail = {}) {
     const xdmEventType = AEP_EVENT_MAP[eventType] || eventType;
     window.alloy('sendEvent', {
       xdm: { eventType: xdmEventType, timestamp: nowIso(), ...detail },
     });
   }
   ```

3. Every call site (registration, login, category views, eligibility
   checks, application lifecycle, profile/consent updates) stays exactly
   the same — nothing else in the app needs to change.

The recommended website-event → AEP XDM `eventType` mapping lives in
`src/utils/events.js` (`AEP_EVENT_MAP`), matching the table from the
original spec.

## Not included (by design, for a client-only demo)

- A real backend / mock REST API (JSON Server) — everything is
  `localStorage`, which keeps the demo a single `npm run dev` away from
  running and is enough to generate realistic profile + event data.
- Real authentication/password hashing — passwords are stored in plain
  text in `localStorage` for demo purposes only. Do not reuse this auth
  code for anything real.

## Project structure

```
src/
├── pages/            Login, Register, ForgotPassword, Home, CategoryPage
│                      (+ HomeLoan/LandLoan/VehicleLoan/CommercialLoan
│                      thin wrappers), Applications, Profile, Admin
├── components/        Navbar, LoanCard, EligibilityForm,
│                      LoanApplicationForm, EventTimeline, StatusChip,
│                      ProtectedRoute
├── context/            AuthContext.jsx
├── services/           localStorage.js, customerService.js,
│                      applicationService.js, alloyService.js
├── utils/              customerId.js, applicationId.js, events.js,
│                      eligibility.js
├── data/                loanCategories.js
└── theme.js
```
