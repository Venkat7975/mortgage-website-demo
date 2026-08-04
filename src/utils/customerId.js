/**
 * Generates a permanent, globally-unique Customer ID using a real UUID
 * (RFC 4122 v4), prefixed for readability: CUST-xxxxxxxx-xxxx-...
 *
 * This is only ever called once per unique email, at first registration
 * (see registerUser in services/customerService.js) — every later login
 * from the same email reuses the same stored ID, so it never changes.
 */
export function generateCustomerId() {
  return `CUST-${uuid()}`;
}

export function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback UUID v4 for environments without crypto.randomUUID
  // (e.g. non-secure-context browsers).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
