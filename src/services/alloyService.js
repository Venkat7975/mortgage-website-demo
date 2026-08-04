import {
  KEYS, readJson, writeJson, readSessionJson, writeSessionJson,
} from './localStorage';
import { AEP_EVENT_MAP, EVENT_TYPES, nowIso } from '../utils/events';
import {
  pushToAdobeDataLayer, pushDigitalDataEvent, setPageInfo,
  setUserProfile, clearUserProfile, setLoanApplicationInfo, setEligibilityInfo,
} from './dataLayerService';

// This simulates the call you'd eventually make to the real Adobe Web SDK:
//
//   alloy("sendEvent", {
//     xdm: {
//       eventType: "mortgage.applicationOpened",
//       ...
//     }
//   });
//
// For the demo, `sendEvent` builds the same XDM-shaped payload, logs it to
// the console (so it's visible in devtools exactly like a real Alloy debug
// trace), and writes it to TWO places:
//
//   1. localStorage `meridian_customerEvents` — a permanent, cross-session
//      log. This is what the Admin panel's "Web SDK Event Log" reads from,
//      and it's what the Event Timelines on Profile/Applications read from.
//   2. sessionStorage `meridian_sessionEvents` — a "this visit only" log.
//      The browser wipes sessionStorage automatically the moment the tab
//      or browser closes, so this always reflects only the current
//      session's activity (page views, eligibility checks, in-progress
//      form fields, etc.) for as long as the person stays on the site.
//
// Swap this file out for a real Alloy Web SDK instance later — every call
// site in the app already calls `sendEvent(eventType, detail)`, so nothing
// else needs to change.

export function sendEvent(eventType, detail = {}) {
  const xdmEventType = AEP_EVENT_MAP[eventType] || eventType;
  const timestamp = nowIso();

  const payload = {
    eventType,
    xdmEventType,
    timestamp,
    ...detail,
  };

  // eslint-disable-next-line no-console
  console.log(
    `%c[Alloy] sendEvent`,
    'color:#B98A32;font-weight:600;',
    { xdm: { eventType: xdmEventType, timestamp, ...detail } }
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
  pushToAdobeDataLayer({ event: eventType, ...detail, timestamp });
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
    case EVENT_TYPES.CATEGORY_VIEWED:
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
