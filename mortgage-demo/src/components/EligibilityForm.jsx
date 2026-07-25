import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  Button, Stack, Alert, Typography, Box,
} from '@mui/material';
import { evaluateEligibility } from '../utils/eligibility';
import { sendEvent } from '../services/alloyService';
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

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCheck = () => {
    const payload = {
      annualIncome: Number(form.annualIncome) || 0,
      creditScore: Number(form.creditScore) || 0,
      existingLoans: Number(form.existingLoans) || 0,
      loanAmount: Number(form.loanAmount) || 0,
    };
    const evalResult = evaluateEligibility(payload);
    setResult(evalResult);

    sendEvent(EVENT_TYPES.ELIGIBILITY_CHECK, {
      customerId: user?.customerId || 'anonymous',
      category,
      result: evalResult.eligible ? 'Eligible' : 'Not Eligible',
      ...payload,
    });
  };

  const handleClose = () => {
    setResult(null);
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
          />
          <TextField
            label="Loan Amount Required (₹)" type="number" value={form.loanAmount}
            onChange={update('loanAmount')} fullWidth
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
