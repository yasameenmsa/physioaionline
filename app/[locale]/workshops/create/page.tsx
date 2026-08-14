'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { WorkshopForm } from '@/components/features/workshops/WorkshopForm';

export default function CreateWorkshopPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (!json?.user) {
          router.replace('/login');
          return;
        }
        setChecking(false);
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  if (checking) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Create New Workshop</h1>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Workshop</h1>
      <WorkshopForm />
    </div>
  );
}
