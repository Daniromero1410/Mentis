'use client';

import { useParams } from 'next/navigation';
import { PruebaTrabajoWizard } from '@/components/pruebas-trabajo/PruebaTrabajoWizard';

export default function DetallePruebaTrabajoPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string) : null;

  return <PruebaTrabajoWizard mode="view" id={id} readOnly={true} />;
}
