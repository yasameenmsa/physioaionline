'use client';

import { useState } from 'react';
import { AlertCircle, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface VerifyEmailAlertProps {
  email?: string;
  onResend?: () => void;
}

export function VerifyEmailAlert({ email, onResend }: VerifyEmailAlertProps) {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const t = useTranslations('auth.verifyEmailAlert');

  const handleResend = async () => {
    setIsResending(true);
    setResendStatus('idle');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (response.ok) {
        setResendStatus('success');
        onResend?.();
      } else {
        setResendStatus('error');
      }
    } catch {
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-200">
        {t('title')}
      </AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-300 space-y-3">
        <p>
          {t('sentDescription')} <strong>{email}</strong>. {t('checkInbox')}
        </p>

        {resendStatus === 'success' && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{t('resentSuccess')}</span>
          </div>
        )}

        {resendStatus === 'error' && (
          <p className="text-sm text-destructive">
            {t('resentError')}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResend}
            disabled={isResending || resendStatus === 'success'}
            className="h-8"
          >
            {isResending ? (
              <>
                <Loader2 className="me-2 h-3 w-3 animate-spin" />
                {t('sending')}
              </>
            ) : (
              <>
                <Mail className="me-2 h-3 w-3" />
                {t('resend')}
              </>
            )}
          </Button>
        </div>

        <p className="text-xs">
          {t('tip')}
        </p>
      </AlertDescription>
    </Alert>
  );
}
