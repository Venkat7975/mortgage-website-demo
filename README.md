# Ventura Home Finance — Mortgage/Loan Demo Site

A fully client-side demo banking site built to generate realistic customer,
profile, and loan-application data for testing **Adobe Experience Platform
(AEP)**, **Real-Time CDP**, and **Adobe Journey Optimizer (AJO)**.

Everything runs in the browser against `localStorage`/`sessionStorage`;
there is no backend and nothing is ever sent over the network.

## Stack

- React 19 + Vite
- React Router v7
- MUI (Material UI) v9, with a custom "Ventura" theme (see `src/theme.js`)
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
  reused on every subsequent login. Both forms validate email format,
  10-digit mobile numbers, and password strength inline before
  submitting, and registering with an already-used email is rejected
  with a clear error rather than silently logging into that account.
- **Category pages** for Home, Land, Vehicle, and Commercial loans, all
  rendered from one shared template (`src/pages/CategoryPage.jsx`) driven by
  `src/data/loanCategories.js`.
- **Eligibility checker** (`src/components/EligibilityForm.jsx`) — validated
  inputs, readable rules in `src/utils/eligibility.js`. Every check (inputs
  + result) is captured as an `eligibilityCheck` event.
- **One unified loan application form for every category**
  (`src/components/LoanApplicationForm.jsx`) — a single form with a
  **Loan Category dropdown** at the top, reachable from any category page
  (pre-selects that category, but you can change it) or from the global
  "Apply for a Loan" button in the navbar. An application record is
  created the instant the dialog opens — before any fields are filled in
  — and validates full name, email, phone, loan amount, income, and
  address before allowing submission.
- **My Applications** (`src/pages/Applications.jsx`) — view, continue a
  draft (resumes with previously-typed data), cancel, upload a mock
  document, and see the event trail for that specific application.
- **Profile** (`src/pages/Profile.jsx`) — editable details, an
  email/SMS/marketing consent panel (`consentUpdated` event), and a
  per-customer activity timeline.
- **Admin panel** (`src/pages/Admin.jsx`, at `/admin`) — **restricted to
  the single account `admin@mortgage.com`** (see
  `src/components/AdminRoute.jsx`); the nav link is hidden for everyone
  else and the route itself blocks access. Register with that exact
  email to view it. Shows every customer, application, and event in
  storage — split into "This Browser Session" (sessionStorage, clears on
  tab close) and "all time" (localStorage) — plus live `window.digitalData`
  and `window.adobeDataLayer` views, the current ECID/identityMap, and
  buttons to simulate an Approve/Reject decision or reset all demo data.

## Every action is captured — locally, not sent anywhere

All user actions funnel through one function,
`captureEvent(eventType, detail)` in `src/services/eventCaptureService.js`.
"Capturing" an event means writing it to three places, all local to the
browser — nothing here makes a network call:

1. **localStorage** `ventura_customerEvents` — a permanent, cross-session
   log (the Admin panel's "all time" view).
2. **sessionStorage** `ventura_sessionEvents` — cleared automatically the
   moment the tab/browser closes (the Admin panel's "This Browser
   Session" view).
3. **`window.digitalData`** and **`window.adobeDataLayer`** — see below.

This includes *failed* actions, not just successes: a wrong password
(`loginFailed`), a duplicate-email registration attempt
(`registrationFailed`), and any form submitted with invalid data
(`formValidationError`, with the list of invalid fields) are all captured
the same way as successful actions.

## Adobe Client Data Layer

Every captured event also updates two real, inspectable data layer
objects on `window`, both visible live in the Admin panel or straight from
devtools:

- **`window.digitalData`** — the classic Adobe/W3C-style object model
  (`page`, `user`, `loanApplication`, `eligibility`, `identityMap`,
  `event[]`), kept current so a Launch rule bound to *state* (not just
  events) has something to read.
- **`window.adobeDataLayer`** — the newer ACDL array pattern
  (`.push({...})`), the same shape GTM's `dataLayer` uses. Each push also
  dispatches a real `adobeDataLayer:push` DOM event, mirroring the actual
  Adobe Client Data Layer library, so a listener can react without
  polling.

### ECID & identityMap

`src/utils/ecid.js` generates a persistent, Adobe-style ECID (a long
numeric ID, stored once per browser in localStorage — the same "sticks
around across sessions" behavior as the real Adobe Identity Service) and
builds an XDM-shaped `identityMap` attached to **every single captured
event**, exactly like a real Adobe Web SDK event:

```json
{
  "ECID": [{ "id": "...", "primary": true, "authenticatedState": "ambiguous" }],
  "Email": [{ "id": "person@example.com", "primary": true, "authenticatedState": "authenticated" }],
  "CRMID": [{ "id": "CUST-...", "primary": false, "authenticatedState": "authenticated" }]
}
```

Before login, only `ECID` is present (`authenticatedState: "ambiguous"`).
After login/registration, `Email` and `CRMID` are added and marked
`authenticated`, and the `ECID` entry's `primary` flag flips to `false` —
matching how a real implementation stitches an anonymous browser identity
to a known customer after authentication.

## Wiring up the real Adobe Web SDK (Alloy.js)

Everything funnels through `captureEvent()`. To go live:

1. Add the Alloy.js tag/npm package and initialize it per Adobe's setup
   guide for your datastream.
2. Replace the body of `captureEvent` with a real call:

   ```js
   export function captureEvent(eventType, detail = {}) {
     const xdmEventType = AEP_EVENT_MAP[eventType] || eventType;
     window.alloy('sendEvent', {
       xdm: { eventType: xdmEventType, timestamp: nowIso(), identityMap: getIdentityMap(), ...detail },
     });
   }
   ```

3. Every call site (registration, login, category views, eligibility
   checks, application lifecycle, profile/consent updates) stays exactly
   the same — nothing else in the app needs to change.

The website-event → AEP XDM `eventType` mapping lives in
`src/utils/events.js` (`AEP_EVENT_MAP`).

## Project structure

```
src/
├── pages/              Login, Register, ForgotPassword, Home, CategoryPage
│                        (+ HomeLoan/LandLoan/VehicleLoan/CommercialLoan
│                        thin wrappers), Applications, Profile, Admin
├── components/          Navbar, LoanCard, EligibilityForm,
│                        LoanApplicationForm, EventTimeline, StatusChip,
│                        ProtectedRoute, AdminRoute, PageViewTracker
├── context/              AuthContext.jsx
├── services/             localStorage.js, customerService.js,
│                        applicationService.js, eventCaptureService.js,
│                        dataLayerService.js
├── utils/                customerId.js, applicationId.js, events.js,
│                        eligibility.js, validation.js, ecid.js
├── data/                  loanCategories.js
└── theme.js
```
