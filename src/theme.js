import { createTheme } from '@mui/material/styles';

// Meridian Home Finance — brand tokens
// Cool paper background + deep ink navy + a single warm brass accent,
// deliberately away from the cream/terracotta and dark/neon defaults.
// Data (IDs, rates, amounts) is set in IBM Plex Mono throughout so numbers
// read as numbers, not prose — a small banking-ledger cue.

export const COLORS = {
  ink: '#12283B',
  steel: '#3E5C76',
  brass: '#B98A32',
  brassDark: '#8F6A22',
  paper: '#F5F6F4',
  paperRaised: '#FFFFFF',
  charcoal: '#1B1F23',
  success: '#2F6F4E',
  error: '#B4432D',
  hairline: '#DBDFDD',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: COLORS.ink, contrastText: '#FFFFFF' },
    secondary: { main: COLORS.brass, contrastText: '#12283B' },
    success: { main: COLORS.success },
    error: { main: COLORS.error },
    background: { default: COLORS.paper, paper: COLORS.paperRaised },
    text: { primary: COLORS.charcoal, secondary: COLORS.steel },
    divider: COLORS.hairline,
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h1: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h2: { fontFamily: '"Fraunces", serif', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h4: { fontFamily: '"Fraunces", serif', fontWeight: 600 },
    h5: { fontFamily: '"Fraunces", serif', fontWeight: 500 },
    h6: { fontFamily: '"Fraunces", serif', fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 2, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10 },
        containedPrimary: {
          backgroundColor: COLORS.ink,
          '&:hover': { backgroundColor: '#0B1D2B' },
        },
        containedSecondary: {
          backgroundColor: COLORS.brass,
          color: '#12283B',
          '&:hover': { backgroundColor: COLORS.brassDark },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${COLORS.hairline}`,
          boxShadow: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none', borderBottom: `1px solid ${COLORS.hairline}` },
      },
    },
  },
});

export default theme;
