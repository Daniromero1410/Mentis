'use client';

import { PruebaTrabajoTOWizard } from '@/components/formatos-to/PruebaTrabajoTOWizard';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';

export default function NuevaPruebaTrabajoTOPage() {
    return (
        <ModuleGuard requiredModule="formatos_to">
            <PruebaTrabajoTOWizard mode="create" />
        </ModuleGuard>
    );
}
