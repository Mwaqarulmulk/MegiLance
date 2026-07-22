// @AI-HINT: MFA setup component for TOTP, SMS, Email authentication methods

'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Button from '@/app/components/atoms/Button/Button';
import Input from '@/app/components/atoms/Input/Input';

import commonStyles from './MFASetup.common.module.css';
import lightStyles from './MFASetup.light.module.css';
import darkStyles from './MFASetup.dark.module.css';

type MFAMethod = 'totp';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function MFASetup({ onComplete, onCancel }: MFASetupProps) {
  const { resolvedTheme } = useTheme();
  const themeStyles = resolvedTheme === 'light' ? lightStyles : darkStyles;

  const selectedMethod: MFAMethod = 'totp';
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'select' | 'verify'>('select');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const setupMFA = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/security/mfa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({
          method: selectedMethod
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'MFA setup failed');
      }

      const data = await response.json();

      if (data.qr_code) {
        setQrCode(data.qr_code);
      }
      if (data.secret) {
        setSecret(data.secret);
      }
      if (data.backup_codes) {
        setBackupCodes(data.backup_codes);
      }

      setStep('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyMFA = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/security/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        credentials: 'include',
        body: JSON.stringify({
          method: selectedMethod,
          code: verificationCode
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Verification failed');
      }

      onComplete?.();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSelectMethod = () => (
    <div className={cn(commonStyles.methodGrid, themeStyles.methodGrid)}>
      <div
        className={cn(
          commonStyles.methodCard,
          themeStyles.methodCard,
          selectedMethod === 'totp' && commonStyles.selected,
          selectedMethod === 'totp' && themeStyles.selected
        )}
      >
        <div className={commonStyles.methodIcon}>🔐</div>
        <h3 className={commonStyles.methodTitle}>Authenticator App</h3>
        <p className={commonStyles.methodDesc}>
          Use Google Authenticator, Authy, or similar apps
        </p>
      </div>

    </div>
  );

  const renderVerify = () => (
    <div className={cn(commonStyles.verifyContainer, themeStyles.verifyContainer)}>
      {qrCode && (
        <div className={commonStyles.qrSection}>
          <h3 className={commonStyles.setupTitle}>Scan QR Code</h3>
          <div className={commonStyles.qrCodeWrapper}>
            <img src={qrCode} alt="Authenticator setup QR code" className={commonStyles.qrCode} />
          </div>
          {secret && (
            <div className={commonStyles.secretSection}>
              <p className={commonStyles.secretLabel}>Or enter this code manually:</p>
              <code className={cn(commonStyles.secret, themeStyles.secret)}>{secret}</code>
            </div>
          )}
        </div>
      )}
      <h3 className={commonStyles.verifyTitle}>Enter Verification Code</h3>
      <Input
        type="text"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
        placeholder="000000"
        maxLength={6}
        className={commonStyles.codeInput}
        autoFocus
      />

      {backupCodes.length > 0 && (
        <div className={cn(commonStyles.backupCodes, themeStyles.backupCodes)}>
          <h4>Backup Codes</h4>
          <p className={commonStyles.backupInfo}>
            Save these codes in a safe place. Each can be used once if you lose access.
          </p>
          <div className={commonStyles.codesList}>
            {backupCodes.map((code, index) => (
              <code key={index} className={cn(commonStyles.backupCode, themeStyles.backupCode)}>
                {code}
              </code>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={cn(commonStyles.container, themeStyles.container)}>
      <div className={cn(commonStyles.header, themeStyles.header)}>
        <h2 className={commonStyles.title}>Setup Multi-Factor Authentication</h2>
        <p className={commonStyles.subtitle}>
          Add an extra layer of security to your account
        </p>
      </div>

      {error && (
        <div className={cn(commonStyles.error, themeStyles.error)}>
          {error}
        </div>
      )}

      {step === 'select' && renderSelectMethod()}
      {step === 'verify' && renderVerify()}

      <div className={commonStyles.actions}>
        {step === 'select' && (
          <>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={setupMFA}
              isLoading={loading}
            >
              Continue
            </Button>
          </>
        )}

        {step === 'verify' && (
          <>
            <Button variant="outline" onClick={() => setStep('select')}>Back</Button>
            <Button 
              variant="primary" 
              onClick={verifyMFA} 
              isLoading={loading}
              disabled={verificationCode.length !== 6}
            >
              Verify & Enable
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
