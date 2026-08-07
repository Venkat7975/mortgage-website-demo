import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Grid, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Stack, Divider,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { useAuth } from '../context/AuthContext';
import { KEYS, readJson } from '../services/localStorage';
import { simulateDecision, APPLICATION_STATUS } from '../services/applicationService';
import { getEventLog, getSessionEventLog } from '../services/eventCaptureService';
import { getDigitalData, getAdobeDataLayer, getIdentityMap } from '../services/dataLayerService';
import { getOrCreateEcid } from '../utils/ecid';
import StatusChip from '../components/StatusChip';

const DARK = '#12283B';
const DARK_RAISED = '#193A54';
const DARK_HAIRLINE = '#2C4A66';
const BRASS = '#C9994A';
const MUTED = '#8FA6BC';

function Panel({ title, children, sx }) {
  return (
    <Paper sx={{ bgcolor: DARK_RAISED, border: `1px solid ${DARK_HAIRLINE}`, p: 3, ...sx }}>
      <Typography
        className="mono"
        sx={{ color: BRASS, fontWeight: 600, mb: 2, fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}
      >
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  useEffect(() => {
    refresh();
  }, []);

  if (!user) return null;

  const users = readJson(KEYS.REGISTERED_USERS, []);
  const applications = readJson(KEYS.LOAN_APPLICATIONS, []);
  const events = [...getEventLog()].reverse();
  const sessionEvents = [...getSessionEventLog()].reverse();
  const digitalData = getDigitalData();
  const adobeDataLayer = [...getAdobeDataLayer()].reverse();
  const identityMap = getIdentityMap();
  const ecid = getOrCreateEcid();

  const renderDetail = (e) => Object.entries(e)
    .filter(([k]) => !['eventType', 'xdmEventType', 'timestamp', 'customerId', 'identityMap'].includes(k))
    .map(([k, v]) => `${k}=${typeof v === 'object' && v !== null ? JSON.stringify(v) : v}`)
    .join('  ');

  const handleDecision = (applicationId, decision) => {
    simulateDecision(applicationId, decision);
    refresh();
  };

  const handleResetDemo = () => {
    if (!window.confirm('Clear ALL local demo data (users, applications, events)? This cannot be undone.')) return;
    Object.keys(localStorage)
      .filter((k) => k.startsWith('meridian_'))
      .forEach((k) => localStorage.removeItem(k));
    Object.keys(sessionStorage)
      .filter((k) => k.startsWith('meridian_'))
      .forEach((k) => sessionStorage.removeItem(k));
    window.location.href = '/';
  };

  const cellStyle = { color: '#E8EDF2', borderColor: DARK_HAIRLINE };
  const headStyle = { color: MUTED, borderColor: DARK_HAIRLINE, fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.72rem', textTransform: 'uppercase' };

  return (
    <Box sx={{ bgcolor: DARK, minHeight: '100vh', color: '#E8EDF2', pb: 8 }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
          <Typography className="mono" sx={{ color: BRASS, fontSize: '1.4rem', fontWeight: 600 }}>
            $ meridian --admin
          </Typography>
          <Button
            size="small" startIcon={<RestartAltIcon />} onClick={handleResetDemo}
            sx={{ color: '#E8EDF2', borderColor: DARK_HAIRLINE }} variant="outlined"
          >
            Reset Demo Data
          </Button>
        </Stack>
        <Typography className="mono" sx={{ color: MUTED, mb: 4, fontSize: '0.85rem' }}>
          Local storage inspector — not part of the customer-facing site. Useful for verifying Web SDK payloads.
        </Typography>

        <Grid container spacing={3}>
          <Grid size={12}>
            <Panel title="Identity — ECID &amp; identityMap">
              <Stack direction="row" spacing={4} sx={{ mb: 2, flexWrap: 'wrap' }}>
                <Box>
                  <Typography sx={{ color: MUTED, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    ECID (this browser)
                  </Typography>
                  <Typography className="mono" sx={{ color: BRASS, fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>
                    {ecid}
                  </Typography>
                </Box>
              </Stack>
              <Box
                component="pre"
                sx={{
                  m: 0, maxHeight: 220, overflow: 'auto', fontSize: '0.72rem', lineHeight: 1.6,
                  color: '#DCE7F0', fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                {JSON.stringify(identityMap, null, 2)}
              </Box>
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Panel title={`Customers (${users.length})`}>
              <Stack spacing={1.5} divider={<Divider sx={{ borderColor: DARK_HAIRLINE }} />}>
                {users.map((u) => (
                  <Box key={u.customerId}>
                    <Typography className="mono" sx={{ fontWeight: 700, color: BRASS, fontSize: '0.85rem' }}>{u.customerId}</Typography>
                    <Typography sx={{ fontSize: '0.85rem' }}>{u.firstName} {u.lastName}</Typography>
                    <Typography className="mono" sx={{ fontSize: '0.75rem', color: MUTED }}>{u.email}</Typography>
                  </Box>
                ))}
                {users.length === 0 && <Typography sx={{ color: MUTED, fontSize: '0.85rem' }}>No customers registered.</Typography>}
              </Stack>
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, md: 8 }}>
            <Panel title={`Applications (${applications.length})`}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headStyle}>ID</TableCell>
                    <TableCell sx={headStyle}>Customer</TableCell>
                    <TableCell sx={headStyle}>Category</TableCell>
                    <TableCell sx={headStyle}>Status</TableCell>
                    <TableCell sx={headStyle} align="right">Decision</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {applications.map((a) => (
                    <TableRow key={a.applicationId}>
                      <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.78rem' }}>{a.applicationId}</TableCell>
                      <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.78rem' }}>{a.customerId}</TableCell>
                      <TableCell sx={cellStyle}>{a.category}</TableCell>
                      <TableCell sx={cellStyle}><StatusChip status={a.status} /></TableCell>
                      <TableCell sx={cellStyle} align="right">
                        {(a.status === APPLICATION_STATUS.SUBMITTED || a.status === APPLICATION_STATUS.IN_REVIEW) ? (
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button size="small" onClick={() => handleDecision(a.applicationId, 'approve')} sx={{ color: '#7CC9A0' }}>
                              Approve
                            </Button>
                            <Button size="small" onClick={() => handleDecision(a.applicationId, 'reject')} sx={{ color: '#E08A73' }}>
                              Reject
                            </Button>
                          </Stack>
                        ) : (
                          <Typography sx={{ color: MUTED, fontSize: '0.75rem' }}>—</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {applications.length === 0 && (
                    <TableRow><TableCell colSpan={5} sx={{ ...cellStyle, color: MUTED }}>No applications yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </Panel>
          </Grid>

          <Grid size={12}>
            <Panel title={`This Browser Session (${sessionEvents.length}) — clears on tab close`}>
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headStyle}>Timestamp</TableCell>
                      <TableCell sx={headStyle}>Event Type</TableCell>
                      <TableCell sx={headStyle}>Detail</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessionEvents.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          {new Date(e.timestamp).toLocaleTimeString()}
                        </TableCell>
                        <TableCell sx={{ ...cellStyle, fontSize: '0.8rem' }}>{e.eventType}</TableCell>
                        <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.7rem', color: MUTED }}>
                          {renderDetail(e)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {sessionEvents.length === 0 && (
                      <TableRow><TableCell colSpan={3} sx={{ ...cellStyle, color: MUTED }}>No activity yet this session.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Panel>
          </Grid>

          <Grid size={12}>
            <Panel title="window.digitalData — Adobe Client Data Layer (classic model)">
              <Box
                component="pre"
                sx={{
                  m: 0, maxHeight: 320, overflow: 'auto', fontSize: '0.72rem', lineHeight: 1.6,
                  color: '#DCE7F0', fontFamily: '"IBM Plex Mono", monospace',
                }}
              >
                {JSON.stringify(digitalData, null, 2)}
              </Box>
            </Panel>
          </Grid>

          <Grid size={12}>
            <Panel title={`window.adobeDataLayer — ACDL pushes (${adobeDataLayer.length})`}>
              <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                {adobeDataLayer.length === 0 && (
                  <Typography sx={{ color: MUTED, fontSize: '0.85rem' }}>No pushes yet.</Typography>
                )}
                <Stack spacing={1}>
                  {adobeDataLayer.map((record, i) => (
                    <Box
                      key={i}
                      component="pre"
                      sx={{
                        m: 0, p: 1.25, bgcolor: DARK, border: `1px solid ${DARK_HAIRLINE}`,
                        fontSize: '0.7rem', color: '#DCE7F0', fontFamily: '"IBM Plex Mono", monospace',
                        overflowX: 'auto',
                      }}
                    >
                      {JSON.stringify(record)}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Panel>
          </Grid>

          <Grid size={12}>
            <Panel title={`Web SDK Event Log — all time (${events.length})`}>
              <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headStyle}>Timestamp</TableCell>
                      <TableCell sx={headStyle}>Event Type</TableCell>
                      <TableCell sx={headStyle}>XDM eventType</TableCell>
                      <TableCell sx={headStyle}>Customer</TableCell>
                      <TableCell sx={headStyle}>Detail</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {events.map((e, i) => (
                      <TableRow key={i}>
                        <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          {new Date(e.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ ...cellStyle, fontSize: '0.8rem' }}>{e.eventType}</TableCell>
                        <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.72rem', color: BRASS }}>{e.xdmEventType}</TableCell>
                        <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.72rem' }}>{e.customerId || '—'}</TableCell>
                        <TableCell className="mono" sx={{ ...cellStyle, fontSize: '0.7rem', color: MUTED }}>
                          {renderDetail(e)}
                        </TableCell>
                      </TableRow>
                    ))}
                    {events.length === 0 && (
                      <TableRow><TableCell colSpan={5} sx={{ ...cellStyle, color: MUTED }}>No events logged yet.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Panel>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
