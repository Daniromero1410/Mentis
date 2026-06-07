'use client';

import { useAuth } from '@/app/context/AuthContext';
import { ModuleGuard } from '@/app/components/guards/ModuleGuard';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { VistaTerapeuta } from '@/components/cuentas/VistaTerapeuta';
import { VistaAdmin } from '@/components/cuentas/VistaAdmin';

export default function CuentasPage() {
    const { user } = useAuth();
    const esAdmin = user?.rol === 'admin';

    return (
        <ModuleGuard requiredModule="cuentas">
            <DashboardLayout>
                {esAdmin ? <VistaAdmin /> : <VistaTerapeuta />}
            </DashboardLayout>
        </ModuleGuard>
    );
}
