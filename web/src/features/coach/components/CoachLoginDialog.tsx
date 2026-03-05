/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Modal dialog for coach login via PIN code or password.
 *   PIN must be 4–6 digits. Password is compared to the coach_pwd setting.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterPinDialog } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import type { CoachLoginDialogProps } from '../types';
import styles from './CoachLoginDialog.module.css';

const PIN_PATTERN = /^\d{4,6}$/;

/**
 * Modal dialog asking the coach to authenticate via PIN code or password.
 * Opens a RegisterPinDialog when the user wants to register a new PIN.
 */
export function CoachLoginDialog({ open, coachPassword, onLoginSuccess, onCancel }: CoachLoginDialogProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [registerPinOpen, setRegisterPinOpen] = useState(false);

  if (!open) return null;

  const pinValid = PIN_PATTERN.test(pin);
  const loginEnabled = password.length > 0;

  function handleVerify() {
    if (pinValid) {
      onLoginSuccess();
    }
  }

  function handleLogin() {
    if (password === coachPassword) {
      onLoginSuccess();
    } else {
      setPasswordError(t('coachLogin.wrongPassword'));
    }
  }

  function handleRegisterPinOpen() {
    setRegisterPinOpen(true);
  }

  function handlePinRegistered(newPin: string) {
    setPin(newPin);
    setRegisterPinOpen(false);
  }

  function handleRegisterPinCancel() {
    setRegisterPinOpen(false);
  }

  return (
    <>
      <div className={styles.overlay} role="presentation">
        <div
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="coach-login-title"
        >
          <h2 id="coach-login-title">{t('coachLogin.title')}</h2>

          {/* PIN code row */}
          <div className={styles.field}>
            <div className={styles.row}>
              <label htmlFor="coach-pin">{t('coachLogin.enterPin')}</label>
              <input
                id="coach-pin"
                type="text"
                inputMode="numeric"
                value={pin}
                onChange={e => setPin(e.target.value)}
                maxLength={6}
                aria-label={t('coachLogin.enterPin')}
              />
              <button onClick={handleVerify} disabled={!pinValid}>
                {t('coachLogin.verify')}
              </button>
            </div>
            <button
              className={styles.registerLink}
              onClick={handleRegisterPinOpen}
              type="button"
            >
              {t('coachLogin.registerNewPin')}
            </button>
          </div>

          {/* Password row */}
          <div className={styles.field}>
            <div className={styles.row}>
              <label htmlFor="coach-password">{t('coachLogin.enterPassword')}</label>
              <input
                id="coach-password"
                type="password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setPasswordError('');
                }}
                aria-label={t('coachLogin.enterPassword')}
              />
              <button onClick={handleLogin} disabled={!loginEnabled}>
                {t('coachLogin.login')}
              </button>
            </div>
            {passwordError && (
              <p className={styles.error} role="alert">
                {passwordError}
              </p>
            )}
          </div>

          <div className={styles.cancelRow}>
            <button onClick={onCancel}>{t('coachLogin.cancel')}</button>
          </div>
        </div>
      </div>

      <RegisterPinDialog
        open={registerPinOpen}
        onRegister={handlePinRegistered}
        onCancel={handleRegisterPinCancel}
      />
    </>
  );
}
