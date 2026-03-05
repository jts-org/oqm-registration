/**
 * @copyright 2026 Jouni Sipola by OQM
 * @description Reusable modal dialog for registering a new PIN code.
 *   PIN must be 4–6 numeric characters. Used by coach and trainee flows.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './RegisterPinDialog.module.css';

const PIN_PATTERN = /^\d{4,6}$/;

export interface RegisterPinDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /** Called with the validated PIN when the user clicks Register. */
  onRegister: (pin: string) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
}

/**
 * Modal dialog that collects and validates a new PIN code from the user.
 * The PIN must be 4–6 digits and entered identically in both fields.
 */
export function RegisterPinDialog({ open, onRegister, onCancel }: RegisterPinDialogProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [pinAgain, setPinAgain] = useState('');

  if (!open) return null;

  const isValid = PIN_PATTERN.test(pin) && pin === pinAgain;

  function handleRegister() {
    if (isValid) {
      onRegister(pin);
    }
  }

  return (
    <div className={styles.overlay} role="presentation">
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-pin-title"
      >
        <h2 id="register-pin-title">{t('registerPin.title')}</h2>

        <div className={styles.field}>
          <label htmlFor="register-pin-new">{t('registerPin.enterNewPin')}</label>
          <input
            id="register-pin-new"
            type="text"
            inputMode="numeric"
            value={pin}
            onChange={e => setPin(e.target.value)}
            aria-label={t('registerPin.enterNewPin')}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="register-pin-again">{t('registerPin.enterPinAgain')}</label>
          <input
            id="register-pin-again"
            type="text"
            inputMode="numeric"
            value={pinAgain}
            onChange={e => setPinAgain(e.target.value)}
            aria-label={t('registerPin.enterPinAgain')}
          />
        </div>

        <div className={styles.actions}>
          <button onClick={handleRegister} disabled={!isValid}>
            {t('registerPin.register')}
          </button>
          <button onClick={onCancel}>
            {t('registerPin.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
