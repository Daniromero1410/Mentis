'use client';

import { useParams } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { AnalisisExigenciaMentalWizard } from '@/components/analisis-exigencias-mental/AnalisisExigenciaMentalWizard';

export default function EvaluarAnalisisExigenciaMentalPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;

  return <AnalisisExigenciaMentalWizard mode="edit" id={id} />;
}

