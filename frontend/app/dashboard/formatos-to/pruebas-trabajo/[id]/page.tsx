'use client';

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { useParams } from 'next/navigation';
import { PruebaTrabajoTOWizard } from '@/components/formatos-to/PruebaTrabajoTOWizard';

export default function DetallePruebaTrabajoTOPage({
    searchParams,
}: {
    searchParams: { mode?: string };
}) {
    const params = useParams();
    const id = params.id ? parseInt(params.id as string) : undefined;
    const isViewMode = searchParams.mode === 'view';

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
