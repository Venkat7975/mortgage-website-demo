import { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Grid, TextField, Button, Stack, Divider,
  FormGroup, FormControlLabel, Switch, Alert, Chip, Tabs, Tab, Box,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getConsent, updateConsent } from '../services/customerService';
import { getEventsForCustomer } from '../services/eventCaptureService';
import EventTimeline from '../components/EventTimeline';
import { COLORS } from '../theme';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', mobile: '' });
  const [saved, setSaved] = useState(false);
  const [consent, setConsentState] = useState({ email: true, sms: true, marketing: false });
  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (!user) return;
    setForm({ firstName: user.firstName, lastName: user.lastName, mobile: user.mobile });
    setConsentState(getConsent(user.customerId));
  }, [user]);

  if (!user) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(user.customerId, form);
    refreshUser();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleConsentToggle = (field) => (e) => {
    const next = { ...consent, [field]: e.target.checked };
    setConsentState(next);
    updateConsent(user.customerId, next);
  };

  const events = getEventsForCustomer(user.customerId);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 5, md: 7 } }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 0.5 }}>
        <Typography variant="h3" sx={{ fontSize: '1.8rem' }}>Profile</Typography>
        <Chip label={user.customerId} size="small" className="mono" sx={{ fontWeight: 600, bgcolor: '#F5F6F4' }} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>{user.email}</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${COLORS.hairline}` }}>
        <Tab label="Details" />
        <Tab label="Preferences" />
        <Tab label="Activity" />
      </Tabs>

      {tab === 0 && (
        <Paper variant="outlined" sx={{ p: 3.5 }}>
          <Box component="form" onSubmit={handleSave}>
            <Stack spacing={2.5}>
              {saved && <Alert severity="success">Profile updated.</Alert>}
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="First Name" value={form.firstName} onChange={update('firstName')} fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField label="Last Name" value={form.lastName} onChange={update('lastName')} fullWidth />
                </Grid>
              </Grid>
              <TextField label="Mobile Number" value={form.mobile} onChange={update('mobile')} fullWidth />
              <TextField label="Email" value={user.email} fullWidth disabled helperText="Email is your permanent account identifier and can't be changed." />
              <Box>
                <Button type="submit" variant="contained" color="primary">Save Changes</Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      )}

      {tab === 1 && (
        <Paper variant="outlined" sx={{ p: 3.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>Communication preferences</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Controls what channels Meridian can reach you on — feeds the consentUpdated event for AJO suppression testing.
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={<Switch checked={consent.email} onChange={handleConsentToggle('email')} />}
              label="Email updates about my applications"
            />
            <FormControlLabel
              control={<Switch checked={consent.sms} onChange={handleConsentToggle('sms')} />}
              label="SMS updates about my applications"
            />
            <Divider sx={{ my: 1.5 }} />
            <FormControlLabel
              control={<Switch checked={consent.marketing} onChange={handleConsentToggle('marketing')} />}
              label="Marketing offers and rate promotions"
            />
          </FormGroup>
        </Paper>
      )}

      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 3.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Event history</Typography>
          <EventTimeline events={events} emptyLabel="No activity recorded yet." />
        </Paper>
      )}
    </Container>
  );
}
