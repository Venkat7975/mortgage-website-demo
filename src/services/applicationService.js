import { KEYS, readJson, writeJson } from './localStorage';
import { generateApplicationId } from '../utils/applicationId';
import { captureEvent } from './eventCaptureService';
import { EVENT_TYPES } from '../utils/events';

export const APPLICATION_STATUS = {
  DRAFT: 'Abandoned',
  SUBMITTED: 'Submitted',
  IN_REVIEW: 'In Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
};

function getAll() {
  return readJson(KEYS.LOAN_APPLICATIONS, []);
}

function saveAll(apps) {
  writeJson(KEYS.LOAN_APPLICATIONS, apps);
}

/**
 * Fired the moment a user clicks "Apply Loan" — creates the application
 * record immediately in Abandoned status (i.e. started but not yet
 * submitted), before any form fields are filled in, so there's a real
 * record even if they never finish. Status flips to Submitted once they
 * actually submit.
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

  captureEvent(EVENT_TYPES.APPLICATION_OPENED, { customerId, applicationId, category });

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

  captureEvent(EVENT_TYPES.APPLICATION_SUBMITTED, {
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

  captureEvent(EVENT_TYPES.APPLICATION_STATUS_CHANGED, {
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

  captureEvent(EVENT_TYPES.DOCUMENT_UPLOADED, {
    customerId: apps[idx].customerId,
    applicationId,
    documentName: doc.name,
  });

  return apps[idx];
}

export function simulateDecision(applicationId, decision) {
  return updateApplicationStatus(
    applicationId,
    decision === 'approve' ? APPLICATION_STATUS.APPROVED : APPLICATION_STATUS.REJECTED
  );
}
