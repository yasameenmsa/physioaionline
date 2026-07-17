'use client';

import { WorkshopForm } from '@/components/features/workshops/WorkshopForm';

export default function CreateWorkshopPage() {
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Workshop</h1>
      <WorkshopForm />
    </div>
  );
}
