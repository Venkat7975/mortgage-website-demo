import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Stack, Divider } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LoanCard from '../components/LoanCard';
import { CATEGORY_LIST } from '../data/loanCategories';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

export default function Home() {
  const { user } = useAuth();

  return (
    <Box>
      {/* Hero */}
      <Box sx={{ borderBottom: `1px solid ${COLORS.hairline}`, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography
                variant="caption"
                sx={{ color: COLORS.brassDark, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                Ventura Home Finance
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.4rem', md: '3.4rem' }, mt: 1, mb: 2, lineHeight: 1.08 }}>
                Lending, laid out like a ledger — nothing hidden in the fine print.
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.05rem', maxWidth: 480, mb: 4 }}>
                Home, land, vehicle, and commercial loans with a rate you can see before you apply,
                and a status you can track the moment you start.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  component={RouterLink}
                  to={user ? '/loans/home' : '/register'}
                  variant="contained" color="secondary" size="large"
                  endIcon={<ArrowForwardIcon />}
                >
                  {user ? 'Browse Loans' : 'Get Started'}
                </Button>
                {!user && (
                  <Button component={RouterLink} to="/login" variant="text" size="large" sx={{ color: COLORS.ink }}>
                    Log In
                  </Button>
                )}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                sx={{
                  border: `1px solid ${COLORS.hairline}`, bgcolor: 'background.paper',
                  p: 3, position: 'relative',
                }}
              >
                <Typography variant="overline" color="text.secondary">Sample rate sheet</Typography>
                <Stack divider={<Divider />} spacing={1.5} sx={{ mt: 1 }}>
                  {CATEGORY_LIST.map((c) => (
                    <Stack key={c.key} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
                      <Typography sx={{ fontWeight: 500 }}>{c.label}</Typography>
                      <Typography className="mono" sx={{ fontWeight: 700, color: COLORS.brassDark }}>{c.rate}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Category grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Typography variant="h3" sx={{ fontSize: '1.7rem', mb: 0.5 }}>What are you financing?</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Every category includes a rate, an eligibility check, and a full application.
        </Typography>

        <Grid container spacing={3}>
          {CATEGORY_LIST.map((category) => (
            <Grid key={category.key} size={{ xs: 12, sm: 6, md: 3 }}>
              <LoanCard
                category={category}
                to={`/loans/${category.key.toLowerCase()}`}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
