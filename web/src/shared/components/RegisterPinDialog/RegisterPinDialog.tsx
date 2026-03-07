/**
 * @copyright 2026 Jouni Sipola by OQM. All rights reserved.
 * Permission granted for personal/internal use only. Commercial
 * use prohibited except by copyright holder. See LICENSE for details.
 */

/**
 * @description Reusable modal dialog for registering a new PIN code.
 *   Collects firstname, lastname, alias (optional) and a validated PIN.
 *   PIN must be 4–6 numeric characters. Used by coach and trainee flows.
 *   @see skills/SKILL.wire-react-to-gas.md
 */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { LoadingOverlay } from '../LoadingOverlay/LoadingOverlay';
import styles from './RegisterPinDialog.module.css';

const PIN_PATTERN = /^\d{4,6}$/;
/** Allows letters (including Nordic), spaces and hyphens between letter groups. */
const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+([- ][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

function isValidName(value: string): boolean {
  if (!value || value.trim().length === 0) return false;
  if (value.length > 30) return false;
  return NAME_PATTERN.test(value);
}

/** Data collected and submitted by the RegisterPinDialog. */
export interface RegisterPinData {
  firstname: string;
  lastname: string;
  alias: string;
  pin: string;
}

export interface RegisterPinDialogProps {
  /** Whether the dialog is visible. */
  open: boolean;
  /**
   * Called with form data when the user clicks Register.
   * Implementation must call the backend API.
   * Throw Error('pin_reserved') if the PIN is already taken.
   * Throw other errors for network/service failures (shown as toast).
   */
  onRegister: (data: RegisterPinData) => Promise<void>;
  /** Called after successful registration, passing the registered PIN. */
  onSuccess: (pin: string) => void;
  /** Called when the user clicks Cancel. */
  onCancel: () => void;
  /** Whether to show the Alias input field. Defaults to true. */
  showAlias?: boolean;
}

/**
 * Modal dialog that collects user details and a new PIN code.
 * The PIN must be 4–6 digits and entered identically in both fields.
 * Firstname and Lastname are required; Alias is optional.
 */
export function RegisterPinDialog({
  open,
  onRegister,
  onSuccess,
  onCancel,
  showAlias = true,
}: RegisterPinDialogProps) {
  const { t } = useTranslation();
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [alias, setAlias] = useState('');
  const [pin, setPin] = useState('');
  const [pinAgain, setPinAgain] = useState('');
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pinReservedOpen, setPinReservedOpen] = useState(false);

  // Reset form state each time the dialog opens.
  useEffect(() => {
    if (open) {
      setFirstname('');
      setLastname('');
      setAlias('');
      setPin('');
      setPinAgain('');
      setDirty({});
      setIsSubmitting(false);
      setPinReservedOpen(false);
    }
  }, [open]);

  if (!open) return null;

  function markDirty(field: string) {
    setDirty(prev => ({ ...prev, [field]: true }));
  }

  const firstnameError =
    dirty.firstname && !isValidName(firstname)
      ? firstname.trim() === ''
        ? t('registerPin.mandatory')
        : t('registerPin.invalidName')
      : null;

  const lastnameError =
    dirty.lastname && !isValidName(lastname)
      ? lastname.trim() === ''
        ? t('registerPin.mandatory')
        : t('registerPin.invalidName')
      : null;

  const pinError = dirty.pin && pin.trim() === '' ? t('registerPin.mandatory') : null;
  const pinAgainError =
    dirty.pinAgain && pinAgain.trim() === '' ? t('registerPin.mandatory') : null;

  const pinMismatch =
    pin.length > 0 && pinAgain.length > 0 && pin !== pinAgain
      ? t('registerPin.pinMismatch')
      : null;

  const aliasValid = alias === '' || isValidName(alias);

  const isFormValid =
    isValidName(firstname) &&
    isValidName(lastname) &&
    aliasValid &&
    PIN_PATTERN.test(pin) &&
    pin === pinAgain;

  async function handleRegister() {
    if (!isFormValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onRegister({ firstname, lastname, alias, pin });
      toast.success(t('registerPin.successMessage'));
      onSuccess(pin);
    } catch (err) {
      if (err instanceof Error && err.message === 'pin_reserved') {
        setPinReservedOpen(true);
      } else {
        toast.error(t('registerPin.networkError'));
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePinReservedClose() {
    setPinReservedOpen(false);
    setPin('');
    setPinAgain('');
    setDirty(prev => ({ ...prev, pin: false, pinAgain: false }));
  }

  return (
    <>
      <div className={styles.overlay} role="presentation">
        <div
          className={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="register-pin-title"
        >
          <h2 id="register-pin-title">{t('registerPin.title')}</h2>

          {/* Firstname */}
          <div className={styles.field}>
            <label htmlFor="register-pin-firstname">{t('registerPin.firstname')}</label>
            <input
              id="register-pin-firstname"
              type="text"
              value={firstname}
              maxLength={30}
              onChange={e => {
                setFirstname(e.target.value);
                markDirty('firstname');
              }}
              aria-label={t('registerPin.firstname')}
              aria-describedby={firstnameError ? 'register-pin-firstname-error' : undefined}
            />
            {firstnameError && (
              <span id="register-pin-firstname-error" className={styles.error} role="alert">
                {firstnameError}
              </span>
            )}
          </div>

          {/* Lastname */}
          <div className={styles.field}>
            <label htmlFor="register-pin-lastname">{t('registerPin.lastname')}</label>
            <input
              id="register-pin-lastname"
              type="text"
              value={lastname}
              maxLength={30}
              onChange={e => {
                setLastname(e.target.value);
                markDirty('lastname');
              }}
              aria-label={t('registerPin.lastname')}
              aria-describedby={lastnameError ? 'register-pin-lastname-error' : undefined}
            />
            {lastnameError && (
              <span id="register-pin-lastname-error" className={styles.error} role="alert">
                {lastnameError}
              </span>
            )}
          </div>

          {/* Alias (optional, hidden for trainee) */}
          {showAlias && (
            <div className={styles.field}>
              <label htmlFor="register-pin-alias">{t('registerPin.alias')}</label>
              <input
                id="register-pin-alias"
                type="text"
                value={alias}
                maxLength={30}
                onChange={e => setAlias(e.target.value)}
                aria-label={t('registerPin.alias')}
              />
            </div>
          )}

          {/* Enter new PIN code */}
          <div className={styles.field}>
            <label htmlFor="register-pin-new">{t('registerPin.enterNewPin')}</label>
            <input
              id="register-pin-new"
              type="password"
              value={pin}
              onChange={e => {
                setPin(e.target.value);
                markDirty('pin');
              }}
              aria-label={t('registerPin.enterNewPin')}
              aria-describedby={pinError ? 'register-pin-new-error' : undefined}
            />
            {pinError && (
              <span id="register-pin-new-error" className={styles.error} role="alert">
                {pinError}
              </span>
            )}
          </div>

          {/* Enter PIN again */}
          <div className={styles.field}>
            <label htmlFor="register-pin-again">{t('registerPin.enterPinAgain')}</label>
            <input
              id="register-pin-again"
              type="password"
              value={pinAgain}
              onChange={e => {
                setPinAgain(e.target.value);
                markDirty('pinAgain');
              }}
              aria-label={t('registerPin.enterPinAgain')}
              aria-describedby={
                pinAgainError || pinMismatch ? 'register-pin-again-error' : undefined
              }
            />
            {pinAgainError && (
              <span id="register-pin-again-error" className={styles.error} role="alert">
                {pinAgainError}
              </span>
            )}
            {!pinAgainError && pinMismatch && (
              <span id="register-pin-again-error" className={styles.error} role="alert">
                {pinMismatch}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            <button onClick={handleRegister} disabled={!isFormValid || isSubmitting}>
              {t('registerPin.register')}
            </button>
            <button onClick={onCancel}>
              {t('registerPin.cancel')}
            </button>
          </div>
        </div>
      </div>

      {/* PIN reserved modal notification */}
      {pinReservedOpen && (
        <div className={styles.overlay} role="presentation">
          <div
            className={styles.pinReservedDialog}
            role="alertdialog"
            aria-modal="true"
            aria-describedby="pin-reserved-message"
          >
            <p id="pin-reserved-message">{t('registerPin.pinReserved')}</p>
            <div className={styles.actions}>
              <button onClick={handlePinReservedClose}>
                {t('registerPin.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <LoadingOverlay visible={isSubmitting} />
    </>
  );
}

