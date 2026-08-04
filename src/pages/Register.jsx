import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Stack, Alert, Link as MuiLink, Container, Grid,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { findUserByEmail } from '../services/customerService';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: '',
  });
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // This email is already registered — don't silently create/overwrite
    // anything. Send them to log in instead, since that's the only way to
    // safely retrieve their permanent Customer ID.
    const existing = findUserByEmail(form.email);
    if (existing) {
      setError('This email is already registered. Please log in instead.');
      return;
    }

    register(form);
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: '1.8rem' }}>Create your account</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          One Customer ID, permanent across every application you start.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {error && (
              <Alert severity="error">
                {error}{' '}
                {error.includes('already registered') && (
                  <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>Log in →</MuiLink>
                )}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="First Name" required value={form.firstName} onChange={update('firstName')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Last Name" required value={form.lastName} onChange={update('lastName')} fullWidth />
              </Grid>
            </Grid>

            <TextField label="Email Address" type="email" required value={form.email} onChange={update('email')} fullWidth />
            <TextField label="Mobile Number" required value={form.mobile} onChange={update('mobile')} fullWidth />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Password" type="password" required value={form.password} onChange={update('password')} fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField label="Confirm Password" type="password" required value={form.confirmPassword} onChange={update('confirmPassword')} fullWidth />
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" color="primary" size="large">Create Account</Button>
          </Stack>
        </Box>

        <Typography variant="body2" sx={{ mt: 3 }}>
          Already have an account?{' '}
          <MuiLink component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>Log in</MuiLink>
        </Typography>
      </Paper>
    </Container>
  );
}
