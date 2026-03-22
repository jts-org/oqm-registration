/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description User manuals page that loads markdown manuals and renders them in-app.
 *   Supports trainee/coach manuals in English and Finnish using root-level user_manuals files.
 */
import React, { useEffect, useMemo, useState } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

type ManualAudience = 'trainee' | 'coach';
type ManualLanguage = 'en' | 'fi';

export interface ManualsPageProps {
  /** Navigates back to the main view. */
  onBack: () => void;
}

/** Render markdown user manuals as an application page with audience/language selectors. */
export function ManualsPage({ onBack }: ManualsPageProps) {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAudience = searchParams.get('audience') === 'coach' ? 'coach' : 'trainee';
  const initialLanguage = searchParams.get('lang') === 'fi'
    ? 'fi'
    : searchParams.get('lang') === 'en'
      ? 'en'
      : (i18n.language.startsWith('fi') ? 'fi' : 'en');

  const [audience, setAudience] = useState<ManualAudience>(initialAudience);
  const [language, setLanguage] = useState<ManualLanguage>(initialLanguage);
  const [markdown, setMarkdown] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const manualPath = useMemo(
    () => `${import.meta.env.BASE_URL}${audience}-manual.${language}.md`,
    [audience, language],
  );

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    let changed = false;

    if (next.get('audience') !== audience) {
      next.set('audience', audience);
      changed = true;
    }

    if (next.get('lang') !== language) {
      next.set('lang', language);
      changed = true;
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [audience, language, searchParams, setSearchParams]);

  useEffect(() => {
    let active = true;

    async function loadManual() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(manualPath, { cache: 'no-store' });
        if (!response.ok) throw new Error('manual_load_failed');
        const content = await response.text();
        if (active) setMarkdown(content);
      } catch {
        if (active) {
          setMarkdown('');
          setError(t('manuals.loadError'));
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadManual();

    return () => {
      active = false;
    };
  }, [manualPath, t]);

  useEffect(() => {
    const deepLinkedAudience = searchParams.get('audience') === 'coach' ? 'coach' : 'trainee';
    const deepLinkedLanguage = searchParams.get('lang') === 'fi' ? 'fi' : 'en';

    setAudience(prev => (prev !== deepLinkedAudience ? deepLinkedAudience : prev));
    setLanguage(prev => (prev !== deepLinkedLanguage ? deepLinkedLanguage : prev));
  }, [searchParams]);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 } }}>
      <Box mt={1} mb={3} textAlign="center">
        <Typography variant="h4" component="h1" gutterBottom>
          {t('manuals.title')}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {t('manuals.subtitle')}
        </Typography>
      </Box>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant={audience === 'trainee' ? 'contained' : 'outlined'}
              onClick={() => setAudience('trainee')}
              sx={{ flex: 1 }}
            >
              {t('manuals.traineeManual')}
            </Button>
            <Button
              variant={audience === 'coach' ? 'contained' : 'outlined'}
              onClick={() => setAudience('coach')}
              sx={{ flex: 1 }}
            >
              {t('manuals.coachManual')}
            </Button>
            <Button
              variant={language === 'en' ? 'contained' : 'outlined'}
              onClick={() => setLanguage('en')}
              sx={{ flex: 1 }}
            >
              {t('manuals.english')}
            </Button>
            <Button
              variant={language === 'fi' ? 'contained' : 'outlined'}
              onClick={() => setLanguage('fi')}
              sx={{ flex: 1 }}
            >
              {t('manuals.finnish')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          {loading && <Typography color="text.secondary">{t('manuals.loading')}</Typography>}
          {error && <Alert severity="error">{error}</Alert>}
          {!loading && !error && (
            <Box
              sx={{
                '& h1': { typography: 'h5', mt: 1, mb: 2 },
                '& h2': { typography: 'h6', mt: 3, mb: 1.5 },
                '& p': { my: 1.5 },
                '& ul, & ol': { pl: 3 },
                '& li': { my: 0.5 },
              }}
            >
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </Box>
          )}
        </CardContent>
      </Card>

      <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onBack}>
        {t('manuals.backToMain')}
      </Button>
    </Container>
  );
}
