import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Stack, Alert, Container, Link as MuiLink } from '@mui/material';
import { findUserByEmail, resetPassword } from '../services/customerService';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');

  const handleFindAccount = (e) => {
    e.preventDefault();
    setError('');
    const user = findUserByEmail(email);
    if (!user) {
      setError('No account found with that email.');
      return;
    }
    setStep(2);
  };

  const handleReset = (e) => {
    e.preventDefault();
    resetPassword(email, newPassword);
    setStep(3);
  };

  return (
    <Container maxWidth="xs" sx={{ py: { xs: 6, md: 10 } }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" sx={{ mb: 0.5, fontSize: '1.8rem' }}>Reset password</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {step === 1 && "Enter the email on your account."}
          {step === 2 && 'Choose a new password.'}
          {step === 3 && 'Password updated.'}
        </Typography>

        {step === 1 && (
          <Box component="form" onSubmit={handleFindAccount}>
            <Stack spacing={2.5}>
              {error && <Alert severity="error">{error}</Alert>}
              <TextField label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
              <Button type="submit" variant="contained" color="primary" size="large">Continue</Button>
            </Stack>
          </Box>
        )}

        {step === 2 && (
          <Box component="form" onSubmit={handleReset}>
            <Stack spacing={2.5}>
              <TextField
                label="New Password" type="password" required value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} fullWidth
              />
              <Button type="submit" variant="contained" color="primary" size="large">Update Password</Button>
            </Stack>
          </Box>
        )}

        {step === 3 && (
          <Stack spacing={2.5}>
            <Alert severity="success">Your password has been updated.</Alert>
            <Button variant="contained" color="primary" size="large" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Stack>
        )}

        <Typography variant="body2" sx={{ mt: 3 }}>
          <MuiLink component={RouterLink} to="/login">Back to login</MuiLink>
        </Typography>
      </Paper>
    </Container>
  );
}
