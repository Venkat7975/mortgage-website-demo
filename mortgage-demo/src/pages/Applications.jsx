import { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Button, Stack, Paper, Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  List, ListItem, ListItemText, Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import StatusChip from '../components/StatusChip';
import LoanApplicationForm from '../components/LoanApplicationForm';
import EventTimeline from '../components/EventTimeline';
import { useAuth } from '../context/AuthContext';
import {
  getApplicationsForCustomer, cancelApplication, detectAbandonedApplications,
  addDocument, APPLICATION_STATUS,
} from '../services/applicationService';
import { getEventsForCustomer } from '../services/alloyService';
import { COLORS } from '../theme';

export default function Applications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [detailApp, setDetailApp] = useState(null);
  const [resumeApp, setResumeApp] = useState(null);

  const refresh = () => {
    if (!user) return;
    detectAbandonedApplications();
    setApps(getApplicationsForCustomer(user.customerId));
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) return null;

  const handleCancel = (applicationId) => {
    cancelApplication(applicationId);
    refresh();
  };

  const handleUpload = (applicationId, file) => {
    if (!file) return;
    addDocument(applicationId, { name: file.name, uploadedAt: new Date().toISOString() });
    refresh();
    setDetailApp((prev) => (prev ? getApplicationsForCustomer(user.customerId).find((a) => a.applicationId === prev.applicationId) : prev));
  };

  const customerEvents = detailApp
    ? getEventsForCustomer(user.customerId).filter((e) => e.applicationId === detailApp.applicationId)
    : [];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
      <Typography variant="h3" sx={{ fontSize: '1.8rem', mb: 0.5 }}>My Applications</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Every application you've started, including drafts you haven't finished.
      </Typography>

      {apps.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 5, textAlign: 'center' }}>
          <Typography color="text.secondary">You haven't started any applications yet.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Application ID</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apps.map((a) => (
                <TableRow key={a.applicationId} hover>
                  <TableCell className="mono" sx={{ fontWeight: 600 }}>{a.applicationId}</TableCell>
                  <TableCell>{a.category}</TableCell>
                  <TableCell><StatusChip status={a.status} /></TableCell>
                  <TableCell className="mono" sx={{ color: COLORS.steel, fontSize: '0.8rem' }}>
                    {new Date(a.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => setDetailApp(a)}>View</Button>
                      {a.status === APPLICATION_STATUS.DRAFT && (
                        <Button size="small" variant="contained" color="secondary" onClick={() => setResumeApp(a)}>
                          Continue
                        </Button>
                      )}
                      {(a.status === APPLICATION_STATUS.DRAFT || a.status === APPLICATION_STATUS.SUBMITTED) && (
                        <Button size="small" color="error" onClick={() => handleCancel(a.applicationId)}>
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Detail dialog */}
      <Dialog open={Boolean(detailApp)} onClose={() => setDetailApp(null)} maxWidth="sm" fullWidth>
        {detailApp && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <span className="mono" style={{ fontWeight: 700 }}>{detailApp.applicationId}</span>
                {' · '}{detailApp.category}
              </Box>
              <IconButton size="small" onClick={() => setDetailApp(null)}><CloseIcon fontSize="small" /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <StatusChip status={detailApp.status} />
              </Stack>

              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Documents</Typography>
              <List dense disablePadding sx={{ mb: 1 }}>
                {(detailApp.documents || []).length === 0 && (
                  <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
                )}
                {(detailApp.documents || []).map((d, i) => (
                  <ListItem key={i} disableGutters>
                    <ListItemText primary={d.name} secondary={new Date(d.uploadedAt).toLocaleString()} />
                  </ListItem>
                ))}
              </List>
              <Button
                component="label" size="small" startIcon={<UploadFileIcon />} variant="outlined"
                sx={{ borderColor: COLORS.ink, color: COLORS.ink }}
              >
                Upload Document
                <input
                  type="file" hidden
                  onChange={(e) => handleUpload(detailApp.applicationId, e.target.files?.[0])}
                />
              </Button>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Event Timeline</Typography>
              <EventTimeline events={customerEvents} emptyLabel="No events recorded for this application." />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDetailApp(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {resumeApp && (
        <LoanApplicationForm
          open={Boolean(resumeApp)}
          onClose={() => { setResumeApp(null); refresh(); }}
          category={resumeApp.category}
          existingApplication={resumeApp}
        />
      )}
    </Container>
  );
}
