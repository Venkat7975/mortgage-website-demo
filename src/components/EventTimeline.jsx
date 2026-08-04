import { Box, Typography, Stack } from '@mui/material';
import { COLORS } from '../theme';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function EventTimeline({ events, emptyLabel = 'No events yet.' }) {
  if (!events || events.length === 0) {
    return <Typography variant="body2" color="text.secondary">{emptyLabel}</Typography>;
  }

  const sorted = [...events].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Stack spacing={0}>
      {sorted.map((e, i) => (
        <Box
          key={`${e.timestamp}-${i}`}
          sx={{
            display: 'flex', gap: 2, py: 1.25,
            borderBottom: i < sorted.length - 1 ? `1px solid ${COLORS.hairline}` : 'none',
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS.brass, mt: 0.7, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.xdmEventType || e.eventType}</Typography>
            <Typography variant="caption" color="text.secondary" className="mono">
              {formatTime(e.timestamp)}
              {e.applicationId ? ` · ${e.applicationId}` : ''}
              {e.category ? ` · ${e.category}` : ''}
            </Typography>
          </Box>
        </Box>
      ))}
    </Stack>
  );
}
