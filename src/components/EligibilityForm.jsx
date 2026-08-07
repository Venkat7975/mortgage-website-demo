import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Button, Stack, Alert, Typography, Box,
} from '@mui/material';
import { evaluateEligibility } from '../utils/eligibility';
import { captureEvent } from '../services/eventCaptureService';
import { EVENT_TYPES } from '../utils/events';
import { useAuth } from '../context/AuthContext';

const EMPLOYMENT_TYPES = ['Salaried', 'Self-Employed', 'Business Owner', 'Retired'];

export default function EligibilityForm({ open, onClose, category }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    annualIncome: '',
    employmentType: 'Salaried',
    existingLoans: '0',
    creditScore: '',
    loanAmount: '',
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handleCheck = () => {
    const validationErrors = {};
    if (!form.annualIncome || Number(form.annualIncome) <= 0) {
      validationErrors.annualIncome = 'Enter an annual income greater than 0.';
    }
    if (!form.creditScore || Number(form.creditScore) < 300 || Number(form.creditScore) > 900) {
      validationErrors.creditScore = 'Enter a credit score between 300 and 900.';
    }
    if (!form.loanAmount || Number(form.loanAmount) <= 0) {
      validationErrors.loanAmount = 'Enter a loan amount greater than 0.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      captureEvent(EVENT_TYPES.FORM_VALIDATION_ERROR, {
        customerId: user?.customerId || 'anonymous',
        category,
        form: 'eligibility',
        invalidFields: Object.keys(validationErrors),
      });
      return;
    }

    const payload = {
      annualIncome: Number(form.annualIncome) || 0,
      creditScore: Number(form.creditScore) || 0,
      existingLoans: Number(form.existingLoans) || 0,
      loanAmount: Number(form.loanAmount) || 0,
    };
    const evalResult = evaluateEligibility(payload);
    setResult(evalResult);

    captureEvent(EVENT_TYPES.ELIGIBILITY_CHECK, {
      customerId: user?.customerId || 'anonymous',
      category,
      result: evalResult.eligible ? 'Eligible' : 'Not Eligible',
      ...payload,
    });
  };

  const handleClose = () => {
    setResult(null);
    setErrors({});
    setForm({ annualIncome: '', employmentType: 'Salaried', existingLoans: '0', creditScore: '', loanAmount: '' });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontFamily: '"Fraunces", serif' }}>
        Check {category} Loan Eligibility
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Annual Income (₹)" type="number" value={form.annualIncome}
            onChange={update('annualIncome')} fullWidth
            error={Boolean(errors.annualIncome)} helperText={errors.annualIncome}
          />
          <TextField
            label="Employment Type" select value={form.employmentType}
            onChange={update('employmentType')} fullWidth
          >
            {EMPLOYMENT_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField
            label="Existing Loans" type="number" value={form.existingLoans}
            onChange={update('existingLoans')} fullWidth
          />
          <TextField
            label="Credit Score" type="number" value={form.creditScore}
            onChange={update('creditScore')} fullWidth
            error={Boolean(errors.creditScore)} helperText={errors.creditScore}
          />
          <TextField
            label="Loan Amount Required (₹)" type="number" value={form.loanAmount}
            onChange={update('loanAmount')} fullWidth
            error={Boolean(errors.loanAmount)} helperText={errors.loanAmount}
          />

          {result && (
            <Alert severity={result.eligible ? 'success' : 'warning'} variant="outlined">
              <Typography sx={{ fontWeight: 700 }}>
                {result.eligible ? 'Eligible' : 'Not Eligible'}
              </Typography>
              {!result.eligible && (
                <Box component="ul" sx={{ m: '4px 0 0', pl: 2 }}>
                  {result.reasons.map((r) => <li key={r}><Typography variant="body2">{r}</Typography></li>)}
                </Box>
              )}
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} color="inherit">Close</Button>
        <Button onClick={handleCheck} variant="contained" color="primary">Check Eligibility</Button>
      </DialogActions>
    </Dialog>
  );
}
