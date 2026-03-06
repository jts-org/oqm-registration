/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Modal dialog for admin login via password.
 *   Password is compared to the admin_pwd setting value.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminLoginDialogProps } from '../types';
import styles from './AdminLoginDialog.module.css';

/**
 * Modal dialog asking the admin to authenticate with a password.
 * On failure an inline error message is shown; the dialog stays open.
 */
export function AdminLoginDialog({ open, adminPassword, onLoginSuccess, onCancel }: AdminLoginDialogProps) {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  const loginEnabled = password.length > 0;

  function handleLogin() {
    if (password === adminPassword) {
      onLoginSuccess();
    } else {
      setError(t('adminLogin.incorrectPassword'));
    }
  }

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-login-title"
      >
        <h2 id="admin-login-title">{t('adminLogin.title')}</h2>

        <div className={styles.field}>
          <label htmlFor="admin-password">{t('adminLogin.enterPassword')}</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={e => {
              setPassword(e.target.value);
              setError('');
            }}
            aria-label={t('adminLogin.enterPassword')}
          />
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={handleLogin} disabled={!loginEnabled}>
            {t('adminLogin.login')}
          </button>
          <button onClick={onCancel}>
            {t('adminLogin.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
