import {
  KEYS, readJson, writeJson, readSessionJson, writeSessionJson,
} from './localStorage';
import { AEP_EVENT_MAP, EVENT_TYPES, nowIso } from '../utils/events';
import {
  pushToAdobeDataLayer, pushDigitalDataEvent, setPageInfo,
  setUserProfile, clearUserProfile, setLoanApplicationInfo, setEligibilityInfo,
  getIdentityMap,
} from './dataLayerService';

// captureEvent() is the single place every action in the site funnels
// through. Nothing in this file makes a network call — "capturing" an
// event means writing it into three places, all local to this browser:
//
//   1. localStorage `meridian_customerEvents` — a permanent, cross-session
//      log. Read by the Admin panel's "Web SDK Event Log" and by the
//      Event Timelines on Profile/Applications.
//   2. sessionStorage `meridian_sessionEvents` — a "this visit only" log
//      that the browser wipes automatically the moment the tab/browser
//      closes.
//   3. window.digitalData / window.adobeDataLayer — the two Adobe data
//      layer patterns (see dataLayerService.js), including a full
//      identityMap (ECID + email/customer ID once logged in) on every
//      single event, matching how a real Adobe Web SDK XDM event is
//      shaped.
//
// Wiring a real Adobe Web SDK in later just means replacing the body of
// captureEvent() with the actual `alloy("sendEvent", { xdm: {...} })`
// call — every call site in the app already calls
// `captureEvent(eventType, detail)`, so nothing else changes.

export function captureEvent(eventType, detail = {}) {
  const xdmEventType = AEP_EVENT_MAP[eventType] || eventType;
  const timestamp = nowIso();
  const identityMap = getIdentityMap();

  const payload = {
    eventType,
    xdmEventType,
    timestamp,
    identityMap,
    ...detail,
  };

  // eslint-disable-next-line no-console
  console.log(
    `%c[DataLayer] event captured (stored locally only — not sent anywhere)`,
    'color:#B98A32;font-weight:600;',
    payload,
  );

  const events = readJson(KEYS.CUSTOMER_EVENTS, []);
  events.push(payload);
  writeJson(KEYS.CUSTOMER_EVENTS, events);

  const sessionEvents = readSessionJson(KEYS.SESSION_EVENTS, []);
  sessionEvents.push(payload);
  writeSessionJson(KEYS.SESSION_EVENTS, sessionEvents);

  // --- Adobe data layer wiring --------------------------------------
  // Every event that goes through here also lands in window.adobeDataLayer
  // (ACDL push pattern) and window.digitalData.event (classic pattern),
  // plus updates the relevant digitalData section so a Launch rule bound
  // to page/user/loanApplication/eligibility state sees current values,
  // not just the event stream.
  pushToAdobeDataLayer(payload);
  pushDigitalDataEvent(eventType, detail);

  switch (eventType) {
    case EVENT_TYPES.PAGE_VIEW:
      setPageInfo({ pageName: detail.pageName, path: detail.path, category: detail.category });
      break;
    case EVENT_TYPES.LOGIN:
    case EVENT_TYPES.REGISTRATION:
    case EVENT_TYPES.PROFILE_UPDATED:
      if (detail.user) setUserProfile(detail.user);
      break;
    case EVENT_TYPES.LOGOUT:
      clearUserProfile();
      break;
    case EVENT_TYPES.APPLICATION_OPENED:
    case EVENT_TYPES.APPLICATION_SUBMITTED:
    case EVENT_TYPES.APPLICATION_STATUS_CHANGED:
      setLoanApplicationInfo({
        applicationId: detail.applicationId || '',
        category: detail.category || '',
        status: detail.status || eventType,
        loanAmount: detail.loanAmount,
      });
      break;
    case EVENT_TYPES.ELIGIBILITY_CHECK:
      setEligibilityInfo({ category: detail.category, result: detail.result });
      break;
    default:
      break;
  }

  return payload;
}

export function getEventLog() {
  return readJson(KEYS.CUSTOMER_EVENTS, []);
}

export function getEventsForCustomer(customerId) {
  return getEventLog().filter((e) => e.customerId === customerId);
}

export function clearEventLog() {
  writeJson(KEYS.CUSTOMER_EVENTS, []);
}

// --- session-only log ----------------------------------------------------

export function getSessionEventLog() {
  return readSessionJson(KEYS.SESSION_EVENTS, []);
}

export function clearSessionEventLog() {
  writeSessionJson(KEYS.SESSION_EVENTS, []);
}
