import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Button, Stack, Grid, Typography, Chip, Alert,
} from '@mui/material';
import { openApplication, submitApplication, saveDraftFields } from '../services/applicationService';
import { captureEvent } from '../services/eventCaptureService';
import { EVENT_TYPES } from '../utils/events';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_LIST } from '../data/loanCategories';
import { isValidEmail, isValidMobile } from '../utils/validation';

const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business Owner', 'Retired'];

function blankForm(defaultCategory) {
  return {
    category: defaultCategory || 'Home',
    fullName: '', email: '', mobile: '', propertyValue: '', loanAmount: '',
    annualIncome: '', employmentType: 'Salaried', address: '',
  };
}

function numericFields(form) {
  return {
    ...form,
    loanAmount: Number(form.loanAmount) || 0,
    annualIncome: Number(form.annualIncome) || 0,
    propertyValue: Number(form.propertyValue) || 0,
  };
}

// Only report fields the person actually typed something into.
function filledFields(form) {
  return Object.fromEntries(
    Object.entries(form).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

function validateApplicationForm(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';
  if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
  if (!isValidMobile(form.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';
  if (!form.loanAmount || Number(form.loanAmount) <= 0) errors.loanAmount = 'Enter a loan amount greater than 0.';
  if (!form.annualIncome || Number(form.annualIncome) <= 0) errors.annualIncome = 'Enter an annual income greater than 0.';
  if (!form.address.trim()) errors.address = 'Address is required.';
  return errors;
}

export default function LoanApplicationForm({ open, onClose, category, existingApplication = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(() => blankForm(category));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Kept in sync with the latest state so the beforeunload handler (set up
  // once) can always read current values without becoming stale.
  const stateRef = useRef({ application: null, form: blankForm(category), submitted: false });
  useEffect(() => {
    stateRef.current = { application, form, submitted };
  }, [application, form, submitted]);

  // Whether we've already fired the neutral "form viewed" event for this
  // time the dialog is open, so it only fires once per open.
  const viewedFiredRef = useRef(false);

  // Opening the dialog does NOT create an application record or commit a
  // category — it only shows the form. When resuming a draft from My
  // Applications, the record already exists, so that path is unchanged.
  // For a brand-new application, nothing is stored until the person
  // actually interacts with the form (see ensureApplication below); if
  // they open and close without touching anything, all that's captured
  // is one neutral "form viewed" event with no category/application ID.
  useEffect(() => {
    if (!open || !user || application) return;

    if (existingApplication) {
      setApplication(existingApplication);
      setForm((f) => ({
        ...f,
        category: existingApplication.category || category,
        fullName: existingApplication.fullName || `${user.firstName} ${user.lastName}`,
        email: existingApplication.email || user.email,
        mobile: existingApplication.mobile || user.mobile,
        propertyValue: existingApplication.propertyValue || '',
        loanAmount: existingApplication.loanAmount || '',
        annualIncome: existingApplication.annualIncome || '',
        employmentType: existingApplication.employmentType || 'Salaried',
        address: existingApplication.address || '',
      }));
      return;
    }

    setForm((f) => ({
      ...f,
      category: category || 'Home',
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      mobile: user.mobile,
    }));

    if (!viewedFiredRef.current) {
      viewedFiredRef.current = true;
      captureEvent(EVENT_TYPES.APPLICATION_FORM_VIEWED, { customerId: user.customerId });
    }
  }, [open, user, category, application, existingApplication]);

  // Catches the person closing the browser tab/window mid-form (not just
  // clicking our own Close button). Only relevant once an application
  // record actually exists (i.e. they interacted with the form) —
  // localStorage/sessionStorage writes are synchronous, so this reliably
  // captures whatever was typed so far as a draft.
  useEffect(() => {
    if (!open) return undefined;

    const handleBeforeUnload = () => {
      const { application: app, form: currentForm, submitted: isSubmitted } = stateRef.current;
      if (!app || isSubmitted) return;
      const partial = filledFields(currentForm);
      if (Object.keys(partial).length === 0) return;
      saveDraftFields(app.applicationId, numericFields(currentForm));
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [open]);

  /**
   * Creates the actual application record — and with it, commits whatever
   * category is currently chosen — the first time the person does
   * anything in the form. Safe to call repeatedly; only creates a record
   * once. `categoryOverride` is used when the category dropdown itself is
   * the very first interaction, so the record is created with the value
   * they just picked rather than a stale one from state.
   */
  const ensureApplication = (categoryOverride) => {
    if (application) return application;
    if (existingApplication) return existingApplication;
    const chosenCategory = categoryOverride || form.category || category || 'Home';
    const record = openApplication({ customerId: user.customerId, category: chosenCategory });
    setApplication(record);
    return record;
  };

  const update = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
    ensureApplication(field === 'category' ? value : undefined);
  };

  const handleSubmit = () => {
    const app = ensureApplication();

    const validationErrors = validateApplicationForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      captureEvent(EVENT_TYPES.FORM_VALIDATION_ERROR, {
        customerId: app.customerId,
        applicationId: app.applicationId,
        category: form.category,
        form: 'loanApplication',
        invalidFields: Object.keys(validationErrors),
      });
      return;
    }

    submitApplication(app.applicationId, numericFields(form));
    setSubmitted(true);
  };

  const handleClose = () => {
    // If an application record exists (meaning they interacted with the
    // form) and they're closing without submitting, persist whatever was
    // typed as a draft — so "Continue" from My Applications resumes with
    // their data — and capture it as one consolidated draft event.
    if (application && !submitted) {
      const partial = filledFields(form);
      if (Object.keys(partial).length > 0) {
        saveDraftFields(application.applicationId, numericFields(form));
        captureEvent(EVENT_TYPES.APPLICATION_DRAFT_SAVED, {
          customerId: application.customerId,
          applicationId: application.applicationId,
          category: application.category,
          filledFields: partial,
        });
      }
    }

    setApplication(null);
    setSubmitted(false);
    setErrors({});
    setForm(blankForm(category));
    viewedFiredRef.current = false;
    onClose();
  };

  const handleGoToApplications = () => {
    setApplication(null);
    setSubmitted(false);
    setErrors({});
    setForm(blankForm(category));
    viewedFiredRef.current = false;
    onClose();
    navigate('/applications');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Fraunces", serif' }}>
        {submitted ? 'Application Submitted' : 'Loan Application'}
        {application && !submitted && (
          <Chip
            className="mono"
            label={application.applicationId}
            size="small"
            sx={{ ml: 1.5, fontWeight: 600, bgcolor: '#F5F6F4' }}
          />
        )}
      </DialogTitle>
      <DialogContent>
        {submitted ? (
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Typography>
              Application <span className="mono" style={{ fontWeight: 700 }}>{application?.applicationId}</span> has
              been submitted for review.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can track its status any time from My Applications.
            </Typography>
          </Stack>
        ) : (
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            {Object.keys(errors).length > 0 && (
              <Grid size={12}>
                <Alert severity="error">Please fix the highlighted fields before submitting.</Alert>
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                label="Loan Category" select value={form.category}
                onChange={update('category')} fullWidth
                helperText="Change this if you'd rather apply for a different loan type."
              >
                {CATEGORY_LIST.map((c) => <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name" value={form.fullName} onChange={update('fullName')} fullWidth
                error={Boolean(errors.fullName)} helperText={errors.fullName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email" value={form.email} onChange={update('email')} fullWidth
                error={Boolean(errors.email)} helperText={errors.email}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Mobile" value={form.mobile} onChange={update('mobile')} fullWidth
                error={Boolean(errors.mobile)} helperText={errors.mobile || '10-digit mobile number'}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Customer ID" value={user?.customerId || ''} fullWidth disabled
                slotProps={{ input: { className: 'mono' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Property / Vehicle Value (₹)" type="number" value={form.propertyValue}
                onChange={update('propertyValue')} fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Requested Loan Amount (₹)" type="number" value={form.loanAmount}
                onChange={update('loanAmount')} fullWidth
                error={Boolean(errors.loanAmount)} helperText={errors.loanAmount}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Annual Income (₹)" type="number" value={form.annualIncome}
                onChange={update('annualIncome')} fullWidth
                error={Boolean(errors.annualIncome)} helperText={errors.annualIncome}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Employment Type" select value={form.employmentType}
                onChange={update('employmentType')} fullWidth
              >
                {EMPLOYMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                label="Address" value={form.address} onChange={update('address')}
                fullWidth multiline minRows={2}
                error={Boolean(errors.address)} helperText={errors.address}
              />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        {submitted ? (
          <>
            <Button onClick={handleClose} color="inherit">Close</Button>
            <Button onClick={handleGoToApplications} variant="contained" color="primary">
              View My Applications
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit">Save Draft &amp; Close</Button>
            <Button onClick={handleSubmit} variant="contained" color="secondary">
              Submit Application
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
