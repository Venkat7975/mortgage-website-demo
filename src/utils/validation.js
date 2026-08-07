const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[0-9]{10}$/;

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || '').trim());
}

export function isValidMobile(mobile) {
  return MOBILE_RE.test(String(mobile || '').replace(/[\s-]/g, ''));
}

/**
 * Returns { valid, message }. Requires 8+ characters with at least one
 * letter and one number — enough to demonstrate "real" validation without
 * being obnoxious for a demo site.
 */
export function checkPasswordStrength(password) {
  const pwd = String(password || '');
  if (pwd.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
  if (!/[a-zA-Z]/.test(pwd)) return { valid: false, message: 'Password must include at least one letter.' };
  if (!/[0-9]/.test(pwd)) return { valid: false, message: 'Password must include at least one number.' };
  return { valid: true, message: '' };
}

/**
 * Generic required-field checker. Pass { fieldName: value }, get back
 * { fieldName: 'This field is required.' } for anything blank.
 */
export function validateRequired(fields) {
  const errors = {};
  Object.entries(fields).forEach(([key, value]) => {
    if (value === '' || value === null || value === undefined) {
      errors[key] = 'This field is required.';
    }
  });
  return errors;
}
