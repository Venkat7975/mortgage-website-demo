// Canonical event types fired across the site, and their mapping to the
// Adobe Experience Platform / AJO event vocabulary described in the
// project spec. These are the values used both for the internal
// `customerEvents` local storage log and for the simulated Web SDK
// payloads in services/eventCaptureService.js.

export const EVENT_TYPES = {
  PAGE_VIEW: 'pageView',
  LOGIN: 'login',
  LOGIN_FAILED: 'loginFailed',
  LOGOUT: 'logout',
  REGISTRATION: 'registration',
  REGISTRATION_FAILED: 'registrationFailed',
  FORM_VALIDATION_ERROR: 'formValidationError',
  ELIGIBILITY_CHECK: 'eligibilityCheck',
  APPLICATION_OPENED: 'applicationOpened',
  APPLICATION_FORM_VIEWED: 'applicationFormViewed',
  APPLICATION_SUBMITTED: 'applicationSubmitted',
  APPLICATION_DRAFT_SAVED: 'applicationDraftSaved',
  PROFILE_UPDATED: 'profileUpdated',
  CONSENT_UPDATED: 'consentUpdated',
  DOCUMENT_UPLOADED: 'documentUploaded',
  APPLICATION_STATUS_CHANGED: 'applicationStatusChanged',
};

export const AEP_EVENT_MAP = {
  [EVENT_TYPES.REGISTRATION]: 'user.registration',
  [EVENT_TYPES.REGISTRATION_FAILED]: 'user.registrationFailed',
  [EVENT_TYPES.LOGIN]: 'user.login',
  [EVENT_TYPES.LOGIN_FAILED]: 'user.loginFailed',
  [EVENT_TYPES.LOGOUT]: 'user.logout',
  [EVENT_TYPES.FORM_VALIDATION_ERROR]: 'form.validationError',
  [EVENT_TYPES.PAGE_VIEW]: 'web.webpagedetails.pageViews',
  [EVENT_TYPES.ELIGIBILITY_CHECK]: 'mortgage.eligibilityCheck',
  [EVENT_TYPES.APPLICATION_OPENED]: 'mortgage.applicationStarted',
  [EVENT_TYPES.APPLICATION_FORM_VIEWED]: 'mortgage.applicationFormViewed',
  [EVENT_TYPES.APPLICATION_SUBMITTED]: 'mortgage.applicationSubmitted',
  [EVENT_TYPES.APPLICATION_DRAFT_SAVED]: 'mortgage.applicationDraftSaved',
  [EVENT_TYPES.PROFILE_UPDATED]: 'user.profileUpdated',
  [EVENT_TYPES.CONSENT_UPDATED]: 'user.consentUpdated',
  [EVENT_TYPES.DOCUMENT_UPLOADED]: 'mortgage.documentUploaded',
  [EVENT_TYPES.APPLICATION_STATUS_CHANGED]: 'mortgage.applicationStatusChanged',
};

// Human-readable page names for pageView events, keyed by route path.
// Falls back to the raw path if a route isn't listed here.
export const PAGE_NAMES = {
  '/': 'Home',
  '/login': 'Login',
  '/register': 'Register',
  '/forgot-password': 'Forgot Password',
  '/loans/home': 'Home Loan',
  '/loans/land': 'Land Loan',
  '/loans/vehicle': 'Vehicle Loan',
  '/loans/commercial': 'Commercial Loan',
  '/applications': 'My Applications',
  '/profile': 'Profile',
  '/admin': 'Admin Panel',
};

export function nowIso() {
  return new Date().toISOString();
}
