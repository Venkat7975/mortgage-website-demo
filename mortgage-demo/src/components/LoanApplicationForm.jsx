import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Button, Stack, Grid, Typography, Chip,
} from '@mui/material';
import {
  openApplication, submitApplication, saveDraftFields,
  saveApplicationProgress, getApplicationProgress, clearApplicationProgress,
} from '../services/applicationService';
import { sendEvent } from '../services/alloyService';
import { EVENT_TYPES } from '../utils/events';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_LIST } from '../data/loanCategories';

const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business Owner', 'Retired'];

const BLANK_FORM = {
  category: 'Home',
  fullName: '', email: '', mobile: '', propertyValue: '', loanAmount: '',
  annualIncome: '', employmentType: 'Salaried', address: '',
};

function numericFields(form) {
  return {
    ...form,
    loanAmount: Number(form.loanAmount) || 0,
    annualIncome: Number(form.annualIncome) || 0,
    propertyValue: Number(form.propertyValue) || 0,
  };
}

// Only report fields the person actually typed something into — an empty
// "propertyValue: 0" for every abandoned form isn't useful signal.
function filledFields(form) {
  return Object.fromEntries(
    Object.entries(form).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
}

export default function LoanApplicationForm({ open, onClose, category, existingApplication = null }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [submitted, setSubmitted] = useState(false);

  // Kept in sync with the latest state so the beforeunload handler (set up
  // once) can always read current values without becoming stale.
  const stateRef = useRef({ application: null, form: BLANK_FORM, submitted: false });
  useEffect(() => {
    stateRef.current = { application, form, submitted };
  }, [application, form, submitted]);

  // Fires the moment the dialog opens — this is the "Apply Loan" click
  // moment from the spec, independent of whether the form ever gets
  // finished, so abandoned-application journeys have something to key off.
  // When resuming a draft from My Applications, reuse the existing
  // application record instead of opening a new one.
  useEffect(() => {
    if (!open || !user || application) return;

    if (existingApplication) {
      setApplication(existingApplication);
      setForm((f) => ({
        ...f,
        category: existingApplication.category || category || 'Home',
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

    const record = openApplication({ customerId: user.customerId, category: category || 'Home' });
    setApplication(record);
    const progress = getApplicationProgress(record.applicationId);
    setForm((f) => ({
      ...f,
      category: category || 'Home',
      fullName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      mobile: user.mobile,
      ...(progress || {}),
    }));
  }, [open, user, category, application, existingApplication]);

  // Catches the person closing the browser tab/window mid-form (not just
  // clicking our own Close button). localStorage/sessionStorage writes are
  // synchronous, so this reliably captures whatever was typed so far.
  useEffect(() => {
    if (!open) return undefined;

    const handleBeforeUnload = () => {
      const { application: app, form: currentForm, submitted: isSubmitted } = stateRef.current;
      if (!app || isSubmitted) return;
      const partial = filledFields(currentForm);
      if (Object.keys(partial).length === 0) return;
      saveDraftFields(app.applicationId, numericFields(currentForm));
      saveApplicationProgress(app.applicationId, currentForm);
      sendEvent(EVENT_TYPES.APPLICATION_FORM_ABANDONED, {
        customerId: app.customerId,
        applicationId: app.applicationId,
        category: currentForm.category || app.category,
        reason: 'tab_closed',
        filledFields: partial,
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [open]);

  const update = (field) => (e) => {
    const nextValue = e.target.value;
    const nextForm = { ...form, [field]: nextValue };
    setForm(nextForm);
    if (application) {
      saveApplicationProgress(application.applicationId, nextForm);
      saveDraftFields(application.applicationId, numericFields(nextForm));
      sendEvent(EVENT_TYPES.APPLICATION_FORM_UPDATED, {
        customerId: application.customerId,
        applicationId: application.applicationId,
        category: nextForm.category || application.category,
        updatedField: field,
        filledFields: filledFields(nextForm),
      });
      if (field === 'category') {
        setApplication((app) => ({ ...app, category: nextValue }));
        saveDraftFields(application.applicationId, { category: nextValue });
      }
    }
  };

  const handleSubmit = () => {
    if (!application) return;
    submitApplication(application.applicationId, numericFields(form));
    clearApplicationProgress(application.applicationId);
    setSubmitted(true);
  };

  const handleClose = () => {
    // If they're closing without having submitted, persist whatever was
    // typed (so "Continue" from My Applications actually resumes with
    // their data) and fire one consolidated event with exactly the fields
    // they filled in.
    if (application && !submitted) {
      const partial = filledFields(form);
      if (Object.keys(partial).length > 0) {
        saveDraftFields(application.applicationId, numericFields(form));
        saveApplicationProgress(application.applicationId, form);
        sendEvent(EVENT_TYPES.APPLICATION_FORM_ABANDONED, {
          customerId: application.customerId,
          applicationId: application.applicationId,
          category: form.category || application.category,
          reason: 'dialog_closed',
          filledFields: partial,
        });
      }
    }

    setApplication(null);
    setSubmitted(false);
    setForm(BLANK_FORM);
    onClose();
  };

  const handleGoToApplications = () => {
    setApplication(null);
    setSubmitted(false);
    setForm(BLANK_FORM);
    onClose();
    navigate('/applications');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Fraunces", serif' }}>
        {submitted ? 'Application Submitted' : `${category} Loan Application`}
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Loan Category"
                select
                value={form.category}
                onChange={update('category')}
                fullWidth
              >
                {CATEGORY_LIST.map((item) => (
                  <MenuItem key={item.key} value={item.key}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Full Name" value={form.fullName} onChange={update('fullName')} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Email" value={form.email} onChange={update('email')} fullWidth />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Mobile" value={form.mobile} onChange={update('mobile')} fullWidth />
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
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Annual Income (₹)" type="number" value={form.annualIncome}
                onChange={update('annualIncome')} fullWidth
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
