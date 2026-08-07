import { Chip } from '@mui/material';

const STATUS_COLORS = {
  Draft: { bg: '#EFEFEF', fg: '#5A5A5A' },
  Submitted: { bg: '#E7EEF5', fg: '#3E5C76' },
  'In Review': { bg: '#FCF1DE', fg: '#8F6A22' },
  Approved: { bg: '#E5F1EA', fg: '#2F6F4E' },
  Rejected: { bg: '#F7E7E2', fg: '#B4432D' },
  Cancelled: { bg: '#EFEFEF', fg: '#8A8A8A' },
};

export default function StatusChip({ status }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.fg,
        fontWeight: 600,
        fontFamily: '"IBM Plex Mono", monospace',
        fontSize: '0.72rem',
        borderRadius: '4px',
      }}
    />
  );
}
