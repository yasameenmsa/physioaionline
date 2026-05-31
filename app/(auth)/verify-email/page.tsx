'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new verification email.');
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
        setMessage(result.message || 'Email verified successfully!');
        setTimeout(() => {
          router.push('/login?verified=true');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to verify email');
      }
    } catch (error) {
      setStatus('error');
      setMessage('An unexpected error occurred. Please try again.');
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
          {status === 'loading' && 'Verifying Your Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </CardTitle>
        <CardDescription>
          {status === 'loading' && 'Please wait while we verify your email address.'}
          {status === 'success' && 'Your email has been verified successfully.'}
          {status === 'error' && message}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === 'success' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now log in to your account. Redirecting to login page...
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The verification link may have expired or is invalid.
            </p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/login?resend=true">
                  <Mail className="mr-2 h-4 w-4" />
                  Request New Verification Email
                </Link>
              </Button>
              <Button asChild>
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          </div>
        )}

        {status === 'loading' && (
          <p className="text-center text-sm text-muted-foreground">
            This will only take a moment...
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
