// Populates the two data-layer patterns most commonly used in Adobe
// implementations, so Adobe Launch rules (or anything else that reads off
// the page) have something real to bind to — independent of the
// eventCaptureService's captureEvent() calls.
//
//   1. window.digitalData        — the classic Adobe/W3C-style object
//      model (digitalData.page, digitalData.user, digitalData.event, ...).
//      Still the standard for a lot of existing Launch implementations.
//
//   2. window.adobeDataLayer     — the newer Adobe Client Data Layer
//      (ACDL), an array you .push() plain objects onto, the same pattern
//      as GTM's dataLayer. Each push also fires an
//      "adobeDataLayer:push" DOM event, matching real ACDL behavior, so a
//      Launch "Data Layer: Change" style rule would also see the object
//      itself, and a listener can react to `event.detail`.
//
// Both are kept in sync from one place — dataLayerService — so the rest
// of the app doesn't need to know these exist; wiring lives in
// eventCaptureService.captureEvent(), AuthContext, and PageViewTracker.
//
// Everything here is written to window only — there is no network call
// anywhere in this file. "Sending" an event in this demo means writing it
// into digitalData / adobeDataLayer / localStorage; nothing leaves the
// browser.

import { buildIdentityMap } from '../utils/ecid';

function ensureDigitalData() {
  if (!window.digitalData) {
    window.digitalData = {
      identityMap: buildIdentityMap(null),
      page: {
        pageInfo: {
          pageName: '',
          pageURL: typeof window !== 'undefined' ? window.location.href : '',
          server: typeof window !== 'undefined' ? window.location.hostname : '',
          siteSection: 'Meridian Home Finance',
        },
        category: {
          primaryCategory: '',
        },
      },
      user: [
        {
          profile: [
            {
              profileInfo: {
                customerID: '',
                email: '',
                firstName: '',
                lastName: '',
                loginStatus: 'not logged in',
              },
            },
          ],
        },
      ],
      loanApplication: {
        applicationId: '',
        category: '',
        status: '',
        loanAmount: null,
      },
      eligibility: {
        category: '',
        result: '',
      },
      event: [],
    };
  }
  return window.digitalData;
}

function ensureAdobeDataLayer() {
  if (!window.adobeDataLayer) {
    window.adobeDataLayer = [];
  }
  return window.adobeDataLayer;
}

/** Call once at app startup. */
export function initDataLayer() {
  ensureDigitalData();
  ensureAdobeDataLayer();
}

/** Deep-ish merge a patch into window.digitalData (one level of nesting). */
export function updateDigitalData(patch) {
  const dd = ensureDigitalData();
  Object.entries(patch).forEach(([key, value]) => {
    if (
      value && typeof value === 'object' && !Array.isArray(value) &&
      dd[key] && typeof dd[key] === 'object' && !Array.isArray(dd[key])
    ) {
      dd[key] = { ...dd[key], ...value };
    } else {
      dd[key] = value;
    }
  });
  return dd;
}

export function pushDigitalDataEvent(eventName, detail = {}) {
  const dd = ensureDigitalData();
  dd.event.push({
    eventName,
    eventInfo: detail,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Pushes a record onto window.adobeDataLayer (ACDL) and dispatches a DOM
 * event mirroring the real ACDL "adobeDataLayer:push" behavior, so a
 * listener/rule can react without polling the array.
 */
export function pushToAdobeDataLayer(record) {
  const layer = ensureAdobeDataLayer();
  layer.push(record);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    const evt = new CustomEvent('adobeDataLayer:push', { detail: record, bubbles: true });
    // Dispatched on document (not just window): Adobe Tags' Core "Custom
    // Event" component listens via delegation attached to document, and
    // window sits above document in the DOM hierarchy — an event fired
    // only on window never reaches a document-level listener. Also fired
    // on window itself for any other code that might listen there directly.
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function') {
      document.dispatchEvent(evt);
    }
    window.dispatchEvent(new CustomEvent('adobeDataLayer:push', { detail: record }));
  }
  return record;
}

export function setPageInfo({ pageName, path, category }) {
  updateDigitalData({
    page: {
      pageInfo: {
        pageName,
        pageURL: typeof window !== 'undefined' ? window.location.origin + path : path,
      },
      category: { primaryCategory: category || '' },
    },
  });
}

export function setUserProfile(user) {
  if (!user) return;
  const dd = ensureDigitalData();
  dd.identityMap = buildIdentityMap(user);
  dd.user = [
    {
      profile: [
        {
          profileInfo: {
            customerID: user.customerId,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            loginStatus: 'logged in',
          },
        },
      ],
    },
  ];
}

export function clearUserProfile() {
  const dd = ensureDigitalData();
  dd.identityMap = buildIdentityMap(null);
  dd.user = [
    {
      profile: [
        {
          profileInfo: {
            customerID: '', email: '', firstName: '', lastName: '', loginStatus: 'not logged in',
          },
        },
      ],
    },
  ];
}

export function getIdentityMap() {
  return ensureDigitalData().identityMap;
}

export function setLoanApplicationInfo({ applicationId, category, status, loanAmount }) {
  updateDigitalData({
    loanApplication: { applicationId, category, status, loanAmount: loanAmount ?? null },
  });
}

export function setEligibilityInfo({ category, result }) {
  updateDigitalData({ eligibility: { category, result } });
}

export function getDigitalData() {
  return ensureDigitalData();
}

export function getAdobeDataLayer() {
  return ensureAdobeDataLayer();
}
