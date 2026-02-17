'use client';

import { AnalisisExigenciaWizard } from '@/components/formatos-to/analisis-exigencia/AnalisisExigenciaWizard';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';

export default function NuevoAnalisisExigenciaPage() {
    return (
        <ModuleGuard requiredModule="formatos_to">
            <DashboardLayout>
                <AnalisisExigenciaWizard mode="create" />
            </DashboardLayout>
        </ModuleGuard>
    );
}
