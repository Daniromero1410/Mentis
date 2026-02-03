'use client';

import { PruebaTrabajoWizard } from '@/components/pruebas-trabajo/PruebaTrabajoWizard';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';

export default function NuevaPruebaTrabajoPage() {
  return (
    <ModuleGuard requiredModule="pruebas_trabajo">
      <PruebaTrabajoWizard mode="create" />
    </ModuleGuard>
  );
}
