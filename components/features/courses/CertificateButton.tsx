'use client';

import { useState } from 'react';
import { Award, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface CertificateButtonProps {
  courseSlug: string;
  isComplete: boolean;
}

export function CertificateButton({
  courseSlug,
  isComplete,
}: CertificateButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/courses/${courseSlug}/certificate`
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to generate certificate');
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate-${courseSlug}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isComplete) return null;

  return (
    <Button onClick={handleDownload} disabled={loading} size="lg">
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
      ) : (
        <Award className="h-5 w-5 mr-2" />
      )}
      Download Certificate
    </Button>
  );
}
