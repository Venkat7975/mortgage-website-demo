import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Container, Typography, Button, Grid, Stack, Paper, List, ListItem, ListItemIcon, ListItemText,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EligibilityForm from '../components/EligibilityForm';
import LoanApplicationForm from '../components/LoanApplicationForm';
import { useAuth } from '../context/AuthContext';
import { captureEvent } from '../services/eventCaptureService';
import { EVENT_TYPES } from '../utils/events';
import { COLORS } from '../theme';

export default function CategoryPage({ category }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eligibilityOpen, setEligibilityOpen] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  useEffect(() => {
    captureEvent(EVENT_TYPES.CATEGORY_VIEWED, {
      customerId: user?.customerId || 'anonymous',
      category: category.key,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category.key]);

  const requireAuth = (action) => {
    if (!user) {
      navigate('/login');
      return;
    }
    action();
  };

  return (
    <Box>
      <Box sx={{ borderBottom: `1px solid ${COLORS.hairline}`, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
          <Typography variant="caption" sx={{ color: COLORS.brassDark, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {category.label}
          </Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.6rem' }, mt: 1, mb: 1.5 }}>
            {category.tagline}
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button variant="contained" color="secondary" onClick={() => requireAuth(() => setApplyOpen(true))}>
              Apply Loan
            </Button>
            <Button variant="outlined" sx={{ borderColor: COLORS.ink, color: COLORS.ink }} onClick={() => requireAuth(() => setEligibilityOpen(true))}>
              Check Eligibility
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={5}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h5" sx={{ mb: 2, fontSize: '1.3rem' }}>Loan products</Typography>
            <Stack spacing={2} sx={{ mb: 5 }}>
              {category.products.map((p) => (
                <Paper key={p.name} sx={{ p: 2.5 }} variant="outlined">
                  <Typography sx={{ fontWeight: 600 }}>{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                </Paper>
              ))}
            </Stack>

            <Typography variant="h5" sx={{ mb: 2, fontSize: '1.3rem' }}>Benefits</Typography>
            <List dense disablePadding>
              {category.benefits.map((b) => (
                <ListItem key={b} disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CheckCircleOutlineIcon fontSize="small" sx={{ color: COLORS.success }} />
                  </ListItemIcon>
                  <ListItemText primary={b} />
                </ListItem>
              ))}
            </List>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 3, position: 'sticky', top: 88 }} variant="outlined">
              <Typography variant="overline" color="text.secondary">Rate {category.rateLabel}</Typography>
              <Typography className="mono" variant="h4" sx={{ color: COLORS.brassDark, fontWeight: 700, mb: 2 }}>
                {category.rate}
              </Typography>
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Term</Typography>
                  <Typography className="mono" variant="body2" sx={{ fontWeight: 600 }}>{category.term}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Maximum</Typography>
                  <Typography className="mono" variant="body2" sx={{ fontWeight: 600 }}>{category.maxAmount}</Typography>
                </Stack>
              </Stack>
              <Button
                fullWidth variant="contained" color="primary" sx={{ mt: 3 }}
                onClick={() => requireAuth(() => setApplyOpen(true))}
              >
                Apply Loan
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <EligibilityForm open={eligibilityOpen} onClose={() => setEligibilityOpen(false)} category={category.key} />
      <LoanApplicationForm open={applyOpen} onClose={() => setApplyOpen(false)} category={category.key} />
    </Box>
  );
}
