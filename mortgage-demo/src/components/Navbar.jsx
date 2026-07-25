import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Typography, Button, IconButton,
  Menu, MenuItem, Divider, useMediaQuery, Drawer, List, ListItemButton, ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Home Loan', to: '/loans/home' },
  { label: 'Land', to: '/loans/land' },
  { label: 'Vehicle', to: '/loans/vehicle' },
  { label: 'Commercial', to: '/loans/commercial' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isNarrow = useMediaQuery('(max-width:960px)');
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
    navigate('/');
  };

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ gap: 3, minHeight: 68 }}>
        {isNarrow && (
          <IconButton edge="start" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <MenuIcon />
          </IconButton>
        )}

        <Typography
          component={RouterLink}
          to="/"
          variant="h6"
          sx={{
            fontFamily: '"Fraunces", serif',
            fontWeight: 600,
            textDecoration: 'none',
            color: COLORS.ink,
            letterSpacing: '-0.01em',
          }}
        >
          Meridian
        </Typography>

        {!isNarrow && (
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
            {NAV_LINKS.map((link) => (
              <Button
                key={link.to}
                component={RouterLink}
                to={link.to}
                sx={{ color: COLORS.charcoal, fontWeight: 500 }}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        )}

        <Box sx={{ flexGrow: isNarrow ? 1 : 0 }} />

        {user ? (
          <>
            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              startIcon={<AccountCircleOutlinedIcon />}
              sx={{ color: COLORS.charcoal }}
            >
              {!isNarrow && `Welcome, ${user.firstName}`}
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              <MenuItem component={RouterLink} to="/applications" onClick={() => setAnchorEl(null)}>
                My Applications
              </MenuItem>
              <MenuItem component={RouterLink} to="/profile" onClick={() => setAnchorEl(null)}>
                Profile
              </MenuItem>
              <MenuItem component={RouterLink} to="/admin" onClick={() => setAnchorEl(null)}>
                Admin Panel
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button component={RouterLink} to="/login" sx={{ color: COLORS.charcoal }}>
              Log In
            </Button>
            <Button component={RouterLink} to="/register" variant="contained" color="secondary">
              Get Started
            </Button>
          </Box>
        )}
      </Toolbar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, pt: 2 }} role="presentation" onClick={() => setDrawerOpen(false)}>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 600, px: 2, pb: 1 }} variant="h6">
            Meridian
          </Typography>
          <List>
            {NAV_LINKS.map((link) => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to}>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}
            {user && (
              <>
                <Divider />
                <ListItemButton component={RouterLink} to="/applications">
                  <ListItemText primary="My Applications" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/profile">
                  <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/admin">
                  <ListItemText primary="Admin Panel" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
