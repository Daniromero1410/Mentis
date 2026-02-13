'use client';

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { useParams, useSearchParams } from 'next/navigation';
import { PruebaTrabajoTOWizard } from '@/components/formatos-to/PruebaTrabajoTOWizard';

export default function DetallePruebaTrabajoTOPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id ? parseInt(params.id as string) : undefined;
    const mode = searchParams.get('mode');
    const isViewMode = mode === 'view';

    return (
        <ModuleGuard requiredModule="pruebas_trabajo">
            <DashboardLayout>
                <div className="p-6">
                    <PruebaTrabajoTOWizard mode={isViewMode ? 'view' : 'edit'} id={id} readOnly={isViewMode} />
                </div>
            </DashboardLayout>
        </ModuleGuard>
    );
}
