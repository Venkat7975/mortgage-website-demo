import { KEYS, readJson, writeJson, removeKey } from './localStorage';
import { generateCustomerId } from '../utils/customerId';
import { captureEvent } from './eventCaptureService';
import { EVENT_TYPES } from '../utils/events';

function getRegisteredUsers() {
  return readJson(KEYS.REGISTERED_USERS, []);
}

function saveRegisteredUsers(users) {
  writeJson(KEYS.REGISTERED_USERS, users);
}

export function findUserByEmail(email) {
  const users = getRegisteredUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function toProfile(user) {
  return {
    customerId: user.customerId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile,
  };
}

/**
 * Registers a new user, or — if the email already exists — returns the
 * existing user so the permanent Customer ID is preserved, matching the
 * spec: "If the user logs in again using the same email, retrieve the
 * same Customer ID."
 */
export function registerUser({ firstName, lastName, email, mobile, password }) {
  const existing = findUserByEmail(email);
  if (existing) {
    return { user: existing, isNew: false };
  }

  const customerId = generateCustomerId();
  const user = {
    customerId,
    firstName,
    lastName,
    email,
    mobile,
    password, // demo only — never store plaintext passwords in a real app
    createdAt: new Date().toISOString(),
  };

  const users = getRegisteredUsers();
  users.push(user);
  saveRegisteredUsers(users);
  writeJson(KEYS.CUSTOMER_PROFILE_PREFIX + customerId, toProfile(user));

  captureEvent(EVENT_TYPES.REGISTRATION, { customerId, email, user: toProfile(user) });

  return { user, isNew: true };
}

export function loginUser({ email, password }) {
  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    captureEvent(EVENT_TYPES.LOGIN_FAILED, { email, reason: !user ? 'no_account' : 'wrong_password' });
    return { success: false, error: 'Invalid email or password.' };
  }
  writeJson(KEYS.CURRENT_USER, { customerId: user.customerId, email: user.email });
  captureEvent(EVENT_TYPES.LOGIN, { customerId: user.customerId, email: user.email, user: toProfile(user) });
  return { success: true, user };
}

export function logoutUser() {
  const current = getCurrentUser();
  if (current) {
    captureEvent(EVENT_TYPES.LOGOUT, { customerId: current.customerId });
  }
  removeKey(KEYS.CURRENT_USER);
}

export function getCurrentUser() {
  return readJson(KEYS.CURRENT_USER, null);
}

export function getFullCurrentUser() {
  const current = getCurrentUser();
  if (!current) return null;
  return findUserByEmail(current.email);
}

export function getProfile(customerId) {
  return readJson(KEYS.CUSTOMER_PROFILE_PREFIX + customerId, null);
}

export function updateProfile(customerId, updates) {
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.customerId === customerId);
  if (idx === -1) return null;

  users[idx] = { ...users[idx], ...updates };
  saveRegisteredUsers(users);

  const profile = toProfile(users[idx]);
  writeJson(KEYS.CUSTOMER_PROFILE_PREFIX + customerId, profile);

  captureEvent(EVENT_TYPES.PROFILE_UPDATED, { customerId, updatedFields: Object.keys(updates), user: profile });

  return profile;
}

export function resetPassword(email, newPassword) {
  const users = getRegisteredUsers();
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) return false;
  users[idx].password = newPassword;
  saveRegisteredUsers(users);
  return true;
}

export function getConsent(customerId) {
  return readJson(KEYS.CONSENT_PREFIX + customerId, {
    email: true,
    sms: true,
    marketing: false,
  });
}

export function updateConsent(customerId, consent) {
  writeJson(KEYS.CONSENT_PREFIX + customerId, consent);
  captureEvent(EVENT_TYPES.CONSENT_UPDATED, { customerId, consent });
  return consent;
}
