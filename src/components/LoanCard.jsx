import { Link as RouterLink } from 'react-router-dom';
import { Card, CardContent, Typography, Box, Button, Stack } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import TerrainOutlinedIcon from '@mui/icons-material/TerrainOutlined';
import DirectionsCarFilledOutlinedIcon from '@mui/icons-material/DirectionsCarFilledOutlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import { COLORS } from '../theme';

const ICONS = {
  home: HomeOutlinedIcon,
  terrain: TerrainOutlinedIcon,
  directions_car: DirectionsCarFilledOutlinedIcon,
  apartment: ApartmentOutlinedIcon,
};

export default function LoanCard({ category, to, onClick }) {
  const Icon = ICONS[category.icon] || HomeOutlinedIcon;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 120ms ease, transform 120ms ease',
        '&:hover': { borderColor: COLORS.brass, transform: 'translateY(-2px)' },
      }}
    >
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 3 }}>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: '50%',
            bgcolor: '#12283B0F', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon sx={{ color: COLORS.ink }} />
        </Box>

        <Typography variant="h5" sx={{ fontSize: '1.3rem' }}>{category.label}</Typography>
        <Typography variant="body2" color="text.secondary">{category.tagline}</Typography>

        <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Rate {category.rateLabel}</Typography>
            <Typography className="mono" sx={{ fontWeight: 600, color: COLORS.brassDark }}>
              {category.rate}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Up to</Typography>
            <Typography className="mono" sx={{ fontWeight: 600 }}>{category.maxAmount}</Typography>
          </Box>
        </Stack>

        <Box sx={{ flexGrow: 1 }} />

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button component={RouterLink} to={to} onClick={onClick} variant="contained" color="primary" size="small" fullWidth>
            View Details
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
