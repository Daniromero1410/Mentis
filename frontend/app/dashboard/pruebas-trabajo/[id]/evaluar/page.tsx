'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { PruebaTrabajoWizard } from '@/components/pruebas-trabajo/PruebaTrabajoWizard';

export default function EvaluarPruebaTrabajoPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;

  return <PruebaTrabajoWizard mode="edit" id={id} />;
}
