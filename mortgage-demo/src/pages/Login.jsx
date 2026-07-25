import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Paper, Typography, TextField, Button, Stack, Alert, Link as MuiLink, Container,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
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

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Email" type="email" required value={form.email} onChange={update('email')} fullWidth />
            <TextField label="Password" type="password" required value={form.password} onChange={update('password')} fullWidth />
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
