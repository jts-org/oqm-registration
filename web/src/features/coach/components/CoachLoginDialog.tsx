/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Modal dialog for coach login via PIN code or password.
 *   PIN must be 4–6 digits. Password is compared to the coach_pwd setting.
 *   Opens a RegisterPinDialog when the user wants to register a new PIN.
 *   PIN verification calls the GAS backend (verifyCoachPin route).
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { RegisterPinDialog } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import type { RegisterPinData } from '../../../shared/components/RegisterPinDialog/RegisterPinDialog';
import { LoadingOverlay } from '../../../shared/components/LoadingOverlay/LoadingOverlay';
import { registerCoachPin, verifyCoachPin } from '../api/coach.api';
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
  const [pinError, setPinError] = useState('');
  const [registerPinOpen, setRegisterPinOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!open) return null;

  const pinValid = PIN_PATTERN.test(pin);
  const loginEnabled = password.length > 0;

  async function handleVerify() {
    if (!pinValid || isVerifying) return;
    setIsVerifying(true);
    try {
      const coachData = await verifyCoachPin(pin);
      toast.success(t('coachLogin.loginSuccess'));
      onLoginSuccess(coachData);
    } catch (err) {
      setPinError(t('coachLogin.invalidPin'));
      setPin('');
      setPassword('');
    } finally {
      setIsVerifying(false);
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

  async function handleCoachRegistration(data: RegisterPinData) {
    await registerCoachPin(data);
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
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={e => { setPin(e.target.value); setPinError(''); }}
                maxLength={6}
                aria-label={t('coachLogin.enterPin')}
              />
              <button onClick={handleVerify} disabled={!pinValid || isVerifying}>
                {t('coachLogin.verify')}
              </button>
            </div>
            {pinError && (
              <p className={styles.error} role="alert">
                {pinError}
              </p>
            )}
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
        onRegister={handleCoachRegistration}
        onSuccess={handlePinRegistered}
        onCancel={handleRegisterPinCancel}
        showAlias={true}
      />

      <LoadingOverlay visible={isVerifying} />
    </>
  );
}

