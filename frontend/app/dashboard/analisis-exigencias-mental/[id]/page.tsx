'use client';

import { useParams } from 'next/navigation';
import { AnalisisExigenciaMentalWizard } from '@/components/analisis-exigencias-mental/AnalisisExigenciaMentalWizard';

export default function DetalleAnalisisExigenciaMentalPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;

  return <AnalisisExigenciaMentalWizard mode="view" id={id} readOnly={true} />;
}

