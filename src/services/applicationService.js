import { KEYS, readJson, writeJson } from './localStorage';
import { generateApplicationId } from '../utils/applicationId';
import { sendEvent } from './alloyService';
import { EVENT_TYPES } from '../utils/events';

export const APPLICATION_STATUS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  ABANDONED: 'Abandoned',
};

// Minutes of inactivity on a Draft application before it's treated as
// abandoned for demo/journey-testing purposes.
const ABANDON_THRESHOLD_MINUTES = 30;

function getAll() {
  return readJson(KEYS.LOAN_APPLICATIONS, []);
}

function saveAll(apps) {
  writeJson(KEYS.LOAN_APPLICATIONS, apps);
}

/**
 * Fired the moment a user clicks "Apply Loan" — creates the application
 * record immediately in Draft status, before any form fields are filled
 * in. This is what lets AJO abandoned-application journeys be tested.
 */
export function openApplication({ customerId, category }) {
  const applicationId = generateApplicationId();
  const apps = getAll();
  const record = {
    applicationId,
    customerId,
    category,
    status: APPLICATION_STATUS.DRAFT,
    openedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: [],
    history: [{ status: APPLICATION_STATUS.DRAFT, timestamp: new Date().toISOString() }],
  };
  apps.push(record);
  saveAll(apps);

  sendEvent(EVENT_TYPES.APPLICATION_OPENED, { customerId, applicationId, category });

  return record;
}

export function getApplication(applicationId) {
  return getAll().find((a) => a.applicationId === applicationId) || null;
}

export function getApplicationsForCustomer(customerId) {
  return getAll().filter((a) => a.customerId === customerId);
}

export function saveDraftFields(applicationId, fields) {
  const apps = getAll();
  const idx = apps.findIndex((a) => a.applicationId === applicationId);
  if (idx === -1) return null;
  apps[idx] = { ...apps[idx], ...fields, updatedAt: new Date().toISOString() };
  saveAll(apps);
  return apps[idx];
}

export function submitApplication(applicationId, fields) {
  const apps = getAll();
  const idx = apps.findIndex((a) => a.applicationId === applicationId);
  if (idx === -1) return null;

  const updated = {
    ...apps[idx],
    ...fields,
    status: APPLICATION_STATUS.SUBMITTED,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      ...apps[idx].history,
      { status: APPLICATION_STATUS.SUBMITTED, timestamp: new Date().toISOString() },
    ],
  };
  apps[idx] = updated;
  saveAll(apps);

  sendEvent(EVENT_TYPES.APPLICATION_SUBMITTED, {
    customerId: updated.customerId,
    applicationId,
    category: updated.category,
    loanAmount: updated.loanAmount,
  });

  return updated;
}

export function updateApplicationStatus(applicationId, status) {
  const apps = getAll();
  const idx = apps.findIndex((a) => a.applicationId === applicationId);
  if (idx === -1) return null;

  apps[idx] = {
    ...apps[idx],
    status,
    updatedAt: new Date().toISOString(),
    history: [...apps[idx].history, { status, timestamp: new Date().toISOString() }],
  };
  saveAll(apps);

  sendEvent(EVENT_TYPES.APPLICATION_STATUS_CHANGED, {
    customerId: apps[idx].customerId,
    applicationId,
    status,
  });

  return apps[idx];
}

export function cancelApplication(applicationId) {
  return updateApplicationStatus(applicationId, APPLICATION_STATUS.CANCELLED);
}

export function addDocument(applicationId, doc) {
  const apps = getAll();
  const idx = apps.findIndex((a) => a.applicationId === applicationId);
  if (idx === -1) return null;

  apps[idx] = {
    ...apps[idx],
    documents: [...apps[idx].documents, doc],
    updatedAt: new Date().toISOString(),
  };
  saveAll(apps);

  sendEvent(EVENT_TYPES.DOCUMENT_UPLOADED, {
    customerId: apps[idx].customerId,
    applicationId,
    documentName: doc.name,
  });

  return apps[idx];
}

/**
 * Scans Draft applications and marks any that have gone stale as
 * Abandoned, firing the applicationAbandoned event for each. Call this
 * on app load / My Applications page load to simulate the kind of
 * time-based journey trigger AJO would run server-side.
 */
export function detectAbandonedApplications() {
  const apps = getAll();
  const now = Date.now();
  let changed = false;

  const next = apps.map((a) => {
    if (a.status !== APPLICATION_STATUS.DRAFT) return a;
    const ageMinutes = (now - new Date(a.openedAt).getTime()) / 60000;
    if (ageMinutes < ABANDON_THRESHOLD_MINUTES) return a;

    changed = true;
    sendEvent(EVENT_TYPES.APPLICATION_ABANDONED, {
      customerId: a.customerId,
      applicationId: a.applicationId,
      category: a.category,
    });

    return {
      ...a,
      status: APPLICATION_STATUS.ABANDONED,
      updatedAt: new Date().toISOString(),
      history: [...a.history, { status: APPLICATION_STATUS.ABANDONED, timestamp: new Date().toISOString() }],
    };
  });

  if (changed) saveAll(next);
  return next;
}

export function simulateDecision(applicationId, decision) {
  return updateApplicationStatus(
    applicationId,
    decision === 'approve' ? APPLICATION_STATUS.APPROVED : APPLICATION_STATUS.REJECTED
  );
}
