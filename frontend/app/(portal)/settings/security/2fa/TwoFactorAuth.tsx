// @AI-HINT: Two-Factor Authentication setup component - enables/disables 2FA with QR code
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import { FaShieldAlt, FaKey, FaCheckCircle, FaTimesCircle, FaDownload } from 'react-icons/fa';
import Button from '@/app/components/Button/Button';
import Input from '@/app/components/Input/Input';

import commonStyles from './TwoFactorAuth.common.module.css';
import lightStyles from './TwoFactorAuth.light.module.css';
import darkStyles from './TwoFactorAuth.dark.module.css';

interface TwoFactorSetup {
  secret: string;
  qr_code_url: string;
  backup_codes: string[];
}

const TwoFactorAuth: React.FC = () => {
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkingStatus, setCheckingStatus] = useState(true);

  const themeStyles = resolvedTheme === 'dark' ? darkStyles : lightStyles;
  const styles = {
    container: cn(commonStyles.container, themeStyles.container),
    card: cn(commonStyles.card, themeStyles.card),
    header: cn(commonStyles.header, themeStyles.header),
    title: cn(commonStyles.title, themeStyles.title),
    subtitle: cn(commonStyles.subtitle, themeStyles.subtitle),
    statusBadge: cn(commonStyles.statusBadge, themeStyles.statusBadge),
    statusEnabled: cn(commonStyles.statusEnabled, themeStyles.statusEnabled),
    statusDisabled: cn(commonStyles.statusDisabled, themeStyles.statusDisabled),
    section: cn(commonStyles.section, themeStyles.section),
    sectionTitle: cn(commonStyles.sectionTitle, themeStyles.sectionTitle),
    qrWrapper: cn(commonStyles.qrWrapper, themeStyles.qrWrapper),
    backupCodes: cn(commonStyles.backupCodes, themeStyles.backupCodes),
    codeList: cn(commonStyles.codeList, themeStyles.codeList),
    codeItem: cn(commonStyles.codeItem, themeStyles.codeItem),
    actions: cn(commonStyles.actions, themeStyles.actions),
    message: cn(commonStyles.message, themeStyles.message),
    errorMessage: cn(commonStyles.errorMessage, themeStyles.errorMessage),
    successMessage: cn(commonStyles.successMessage, themeStyles.successMessage),
  };

  useEffect(() => {
    checkTwoFactorStatus();
  }, []);

  const checkTwoFactorStatus = async () => {
    setCheckingStatus(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/auth/2fa/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIs2FAEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/auth/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSetupData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to enable 2FA');
      }
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      setError('An error occurred while enabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (response.ok) {
        setSuccess('Two-Factor Authentication has been successfully enabled!');
        setIs2FAEnabled(true);
        setSetupData(null);
        setVerificationCode('');
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setError('An error occurred while verifying the code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/backend/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setSuccess('Two-Factor Authentication has been disabled');
        setIs2FAEnabled(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setError('An error occurred while disabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    if (!setupData?.backup_codes) return;
    
    const content = `MegiLance Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\n${setupData.backup_codes.join('\n')}\n\nKeep these codes safe! Each code can only be used once.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megilance-2fa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (checkingStatus) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p>Loading 2FA settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>
              <FaShieldAlt className="inline mr-2" />
              Two-Factor Authentication
            </h1>
            <p className={styles.subtitle}>
              Add an extra layer of security to your account
            </p>
          </div>
          <div className={cn(styles.statusBadge, is2FAEnabled ? styles.statusEnabled : styles.statusDisabled)}>
            {is2FAEnabled ? (
              <>
                <FaCheckCircle className="inline mr-2" />
                Enabled
              </>
            ) : (
              <>
                <FaTimesCircle className="inline mr-2" />
                Disabled
              </>
            )}
          </div>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <FaTimesCircle className="inline mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className={styles.successMessage}>
            <FaCheckCircle className="inline mr-2" />
            {success}
          </div>
        )}

        {!is2FAEnabled && !setupData && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Enable 2FA</h2>
            <p className={styles.message}>
              Two-factor authentication adds an additional layer of security by requiring a code from your authenticator app in addition to your password.
            </p>
            <div className={styles.actions}>
              <Button 
                variant="primary" 
                onClick={handleEnable2FA}
                isLoading={loading}
                disabled={loading}
              >
                <FaKey className="mr-2" />
                Enable Two-Factor Authentication
              </Button>
            </div>
          </div>
        )}

        {setupData && (
          <>
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Step 1: Scan QR Code</h2>
              <p className={styles.message}>
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className={styles.qrWrapper}>
                <QRCodeCanvas value={setupData.qr_code_url} size={200} />
              </div>
              <p className={styles.message}>
                <strong>Secret Key:</strong> {setupData.secret}
              </p>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Step 2: Backup Codes</h2>
              <p className={styles.message}>
                Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
              </p>
              <div className={styles.backupCodes}>
                <ul className={styles.codeList}>
                  {setupData.backup_codes.map((code, index) => (
                    <li key={index} className={styles.codeItem}>
                      {code}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="secondary" 
                  onClick={downloadBackupCodes}
                  size="sm"
                >
                  <FaDownload className="mr-2" />
                  Download Codes
                </Button>
              </div>
            </div>

            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Step 3: Verify Setup</h2>
              <p className={styles.message}>
                Enter the 6-digit code from your authenticator app to complete the setup
              </p>
              <Input
                name="verificationCode"
                type="text"
                label="Verification Code"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
              />
              <div className={styles.actions}>
                <Button 
                  variant="primary" 
                  onClick={handleVerifyAndComplete}
                  isLoading={loading}
                  disabled={loading || verificationCode.length !== 6}
                >
                  Verify and Enable
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => setSetupData(null)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        {is2FAEnabled && (
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Disable 2FA</h2>
            <p className={styles.message}>
              Disabling two-factor authentication will make your account less secure.
            </p>
            <div className={styles.actions}>
              <Button 
                variant="danger" 
                onClick={handleDisable2FA}
                isLoading={loading}
                disabled={loading}
              >
                Disable Two-Factor Authentication
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuth;
