// Thin wrapper around localStorage so every other service reads/writes
// through one place. All keys are namespaced so this demo doesn't clash
// with anything else running on the same origin.

const PREFIX = 'meridian_';

export const KEYS = {
  REGISTERED_USERS: `${PREFIX}registeredUsers`,
  CURRENT_USER: `${PREFIX}currentUser`,
  CUSTOMER_PROFILE_PREFIX: `${PREFIX}customerProfile_`, // + customerId
  CUSTOMER_EVENTS: `${PREFIX}customerEvents`,
  SESSION_EVENTS: `${PREFIX}sessionEvents`,
  LOAN_APPLICATIONS: `${PREFIX}loanApplications`,
  CONSENT_PREFIX: `${PREFIX}consent_`, // + customerId
};

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function removeKey(key) {
  localStorage.removeItem(key);
}

// --- sessionStorage variants -------------------------------------------
// Same shape as above, but backed by sessionStorage: the browser clears
// this automatically the moment the tab/browser closes, which is what
// makes it useful as a "this visit only" activity trail alongside the
// permanent localStorage log.

export function readSessionJson(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeSessionJson(key, value) {
  sessionStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function removeSessionKey(key) {
  sessionStorage.removeItem(key);
}
