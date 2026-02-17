'use client';

import { AnalisisExigenciaWizard } from '@/components/formatos-to/analisis-exigencia/AnalisisExigenciaWizard';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';

export default function VerAnalisisExigenciaPage() {
    const params = useParams();
    const id = params.id ? parseInt(params.id as string) : undefined;

    return (
        <ModuleGuard requiredModule="formatos_to">
            <DashboardLayout>
                <AnalisisExigenciaWizard mode="view" id={id} readOnly={true} />
            </DashboardLayout>
        </ModuleGuard>
    );
}
