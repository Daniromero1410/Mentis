'use client';

import { PruebaTrabajoTOWizard } from '@/components/formatos-to/PruebaTrabajoTOWizard';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

export default function NuevaPruebaTrabajoTOPage() {
    return (
        <ModuleGuard requiredModule="formatos_to">
            <DashboardLayout>
                <PruebaTrabajoTOWizard mode="create" />
            </DashboardLayout>
        </ModuleGuard>
    );
}
