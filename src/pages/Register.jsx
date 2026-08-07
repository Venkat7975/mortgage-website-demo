import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Stack, Alert, Link as MuiLink, Container, Grid,
  IconButton, InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { findUserByEmail } from '../services/customerService';
import { isValidEmail, isValidMobile, checkPasswordStrength } from '../utils/validation';
import { captureEvent } from '../services/eventCaptureService';
import { EVENT_TYPES } from '../utils/events';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', mobile: '', password: '', confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const update = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setFieldErrors((err) => ({ ...err, [field]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const errors = {};
    if (!form.firstName.trim()) errors.firstName = 'First name is required.';
    if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
    if (!isValidMobile(form.mobile)) errors.mobile = 'Enter a valid 10-digit mobile number.';

    const strength = checkPasswordStrength(form.password);
    if (!strength.valid) errors.password = strength.message;
    if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      captureEvent(EVENT_TYPES.FORM_VALIDATION_ERROR, {
        form: 'register', invalidFields: Object.keys(errors),
      });
      return;
    }

    // This email is already registered — don't silently create/overwrite
    // anything. Send them to log in instead, since that's the only way to
    // safely retrieve their permanent Customer ID.
    const existing = findUserByEmail(form.email);
    if (existing) {
      setError('This email is already registered. Please log in instead.');
      captureEvent(EVENT_TYPES.REGISTRATION_FAILED, { email: form.email, reason: 'email_already_registered' });
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

        <Box component="form" onSubmit={handleSubmit} noValidate>
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
                <TextField
                  label="First Name" value={form.firstName} onChange={update('firstName')} fullWidth
                  error={Boolean(fieldErrors.firstName)} helperText={fieldErrors.firstName}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Last Name" value={form.lastName} onChange={update('lastName')} fullWidth
                  error={Boolean(fieldErrors.lastName)} helperText={fieldErrors.lastName}
                />
              </Grid>
            </Grid>

            <TextField
              label="Email Address" type="email" value={form.email} onChange={update('email')} fullWidth
              error={Boolean(fieldErrors.email)} helperText={fieldErrors.email}
            />
            <TextField
              label="Mobile Number" value={form.mobile} onChange={update('mobile')} fullWidth
              error={Boolean(fieldErrors.mobile)} helperText={fieldErrors.mobile || '10-digit mobile number'}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Password" type={showPassword ? 'text' : 'password'}
                  value={form.password} onChange={update('password')} fullWidth
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password || '8+ characters, at least one letter and number'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small">
                            {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Confirm Password" type={showPassword ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={update('confirmPassword')} fullWidth
                  error={Boolean(fieldErrors.confirmPassword)} helperText={fieldErrors.confirmPassword}
                />
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
