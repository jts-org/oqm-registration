/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Administrator page with in-page admin navigation.
 *   Shown after the admin successfully authenticates.
 *   Uses MUI components for accessible and consistent UI.
 */
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PeopleIcon from '@mui/icons-material/People';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import AppBar from '@mui/material/AppBar';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import { AdminBatchFeedPanel } from '../../features/admin/components/AdminBatchFeedPanel';

export interface AdminPageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
  /** Current admin session token for protected admin routes. */
  sessionToken?: string;
}
type AdminSection = 'dashboard' | 'reports' | 'settings' | 'batchFeed';

type ReportTab = 'logs' | 'usage' | 'errors';

const DRAWER_WIDTH = 248;

/** Full-page admin view with internal navigation and section content. */
export function AdminPage({ onBack, sessionToken = '' }: AdminPageProps) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('logs');

  const navigationItems = useMemo(
    () => [
      {
        id: 'dashboard' as const,
        label: t('adminView.dashboard'),
        icon: <PeopleIcon />,
      },
      {
        id: 'reports' as const,
        label: t('adminView.reports'),
        icon: <ListAltIcon />,
      },
      {
        id: 'settings' as const,
        label: t('adminView.settings'),
        icon: <SettingsIcon />,
      },
      {
        id: 'batchFeed' as const,
        label: t('adminView.batchFeed'),
        icon: <UploadFileIcon />,
      },
    ],
    [t]
  );

  const dashboardActions = useMemo(
    () => [
      {
        id: 'users',
        title: t('adminView.userManagementTitle'),
        description: t('adminView.userManagementDescription'),
        icon: <PeopleIcon fontSize="large" color="primary" />,
        target: 'settings' as const,
      },
      {
        id: 'reports',
        title: t('adminView.reports'),
        description: t('adminView.reportsDescription'),
        icon: <ListAltIcon fontSize="large" color="primary" />,
        target: 'reports' as const,
      },
      {
        id: 'settings',
        title: t('adminView.settings'),
        description: t('adminView.settingsDescription'),
        icon: <SettingsIcon fontSize="large" color="primary" />,
        target: 'settings' as const,
      },
    ],
    [t]
  );

  function renderDashboard() {
    return (
      <>
        <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
          {t('adminView.dashboard')}
        </Typography>
        <Grid container spacing={2}>
          {dashboardActions.map((action) => (
            <Grid key={action.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ mb: 1 }}>{action.icon}</Box>
                  <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => setActiveSection(action.target)}>
                    {t('adminView.open')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </>
    );
  }

  function renderReports() {
    return (
      <>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          {t('adminView.reports')}
        </Typography>
        <Tabs
          value={activeReportTab}
          onChange={(_, value: ReportTab) => setActiveReportTab(value)}
          aria-label={t('adminView.reportTabsAria')}
        >
          <Tab value="logs" label={t('adminView.reportsLogs')} />
          <Tab value="usage" label={t('adminView.reportsUsage')} />
          <Tab value="errors" label={t('adminView.reportsErrors')} />
        </Tabs>
        <Box sx={{ mt: 3 }}>
          {activeReportTab === 'logs' && (
            <Typography>{t('adminView.reportsLogsPlaceholder')}</Typography>
          )}
          {activeReportTab === 'usage' && (
            <Typography>{t('adminView.reportsUsagePlaceholder')}</Typography>
          )}
          {activeReportTab === 'errors' && (
            <Typography>{t('adminView.reportsErrorsPlaceholder')}</Typography>
          )}
        </Box>
      </>
    );
  }

  function renderSettings() {
    return (
      <>
        <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
          {t('adminView.settings')}
        </Typography>
        <Typography color="text.secondary">{t('adminView.settingsPlaceholder')}</Typography>
      </>
    );
  }

  function renderBatchFeed() {
    return <AdminBatchFeedPanel sessionToken={sessionToken} />;
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            {t('adminView.title')}
          </Typography>
          <Button variant="outlined" onClick={onBack}>
            {t('adminView.backToMain')}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        <Toolbar />
        <List>
          {navigationItems.map((item) => (
            <ListItemButton
              key={item.id}
              selected={activeSection === item.id}
              onClick={() => setActiveSection(item.id)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {activeSection === 'dashboard' && renderDashboard()}
        {activeSection === 'reports' && renderReports()}
        {activeSection === 'settings' && renderSettings()}
        {activeSection === 'batchFeed' && renderBatchFeed()}
      </Box>
    </Box>
  );
}
