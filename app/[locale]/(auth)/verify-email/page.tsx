'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const t = useTranslations('auth.verifyEmail');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage(t('invalidLink'));
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`);
      const result = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(result.message || t('successMessage'));
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || t('failedMessage'));
      }
    } catch (error) {
      setStatus('error');
      setMessage(t('unexpectedError'));
    }
  };

  const handleResendEmail = () => {
    router.push('/login?resend=true');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-destructive" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {status === 'loading' && t('loadingTitle')}
          {status === 'success' && t('successTitle')}
          {status === 'error' && t('errorTitle')}
        </CardTitle>
        <CardDescription>
          {status === 'loading' && t('loadingDescription')}
          {status === 'success' && t('successDescription')}
          {status === 'error' && message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'success' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('loginPrompt')}
            </p>
            <Button asChild className="w-full">
              <Link href="/login">{t('goToLogin')}</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('linkExpired')}
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/login?resend=true">
                  <Mail className="me-2 h-4 w-4" />
                  {t('requestNew')}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">{t('backToLogin')}</Link>
              </Button>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <p className="text-center text-sm text-muted-foreground">
            {t('loadingMessage')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="h-16 w-16 text-primary animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
