'use client';

import { AnalisisExigenciaMentalWizard } from '@/components/analisis-exigencias-mental/AnalisisExigenciaMentalWizard';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';

export default function NuevaAnalisisExigenciaMentalPage() {
  return (
    <ModuleGuard requiredModule="pruebas_trabajo">
      <AnalisisExigenciaMentalWizard mode="create" />
    </ModuleGuard>
  );
}
