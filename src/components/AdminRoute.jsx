import { Navigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// The Admin panel exposes every customer's data, applications, and event
// history — it's a developer/debug tool, not something any logged-in
// customer should see. Access is restricted to this single demo admin
// account. Register with this exact email to get in.
export const ADMIN_EMAIL = 'admin@mortgage.com';

export function isAdminUser(user) {
  return Boolean(user && user.email?.toLowerCase() === ADMIN_EMAIL);
}

export default function AdminRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdminUser(user)) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 1.5, fontSize: '1.6rem' }}>Not authorized</Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The admin panel is only available to the designated admin account.
        </Typography>
        <Box>
          <Button component={RouterLink} to="/" variant="contained" color="primary">
            Back to Home
          </Button>
        </Box>
      </Container>
    );
  }

  return children;
}
