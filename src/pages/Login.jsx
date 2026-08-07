import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Stack, Alert, Link as MuiLink, Container,
  IconButton, InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import { isValidEmail } from '../utils/validation';
import { captureEvent } from '../services/eventCaptureService';
import { EVENT_TYPES } from '../utils/events';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
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
    if (!isValidEmail(form.email)) errors.email = 'Enter a valid email address.';
    if (!form.password) errors.password = 'Password is required.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      captureEvent(EVENT_TYPES.FORM_VALIDATION_ERROR, {
        form: 'login', invalidFields: Object.keys(errors),
      });
      return;
    }

    const result = login(form);
    if (!result.success) {
      setError(result.error);
      return;
    }
    const redirectTo = location.state?.from?.pathname || '/';
    navigate(redirectTo, { replace: true });
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: '1.8rem' }}>Welcome back</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Log in to continue your application.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Email" type="email" value={form.email} onChange={update('email')} fullWidth
              error={Boolean(fieldErrors.email)} helperText={fieldErrors.email}
            />
            <TextField
              label="Password" type={showPassword ? 'text' : 'password'}
              value={form.password} onChange={update('password')} fullWidth
              error={Boolean(fieldErrors.password)} helperText={fieldErrors.password}
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
            <Button type="submit" variant="contained" color="primary" size="large">Log In</Button>
          </Stack>
        </Box>

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <MuiLink component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: COLORS.steel }}>
            Forgot password?
          </MuiLink>
          <MuiLink component={RouterLink} to="/register" variant="body2" sx={{ color: COLORS.brassDark, fontWeight: 600 }}>
            Create an account
          </MuiLink>
        </Stack>
      </Paper>
    </Container>
  );
}
