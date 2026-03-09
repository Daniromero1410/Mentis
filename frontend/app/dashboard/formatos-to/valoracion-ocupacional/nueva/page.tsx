'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { ValoracionOcupacionalWizard } from '@/components/formatos-to/valoracion-ocupacional/ValoracionOcupacionalWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from '@/components/ui/sileo-toast';

function ValoracionFormContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading } = useAuth();

    const idParam = searchParams.get('id');
    const valoracionId = idParam ? parseInt(idParam) : undefined;
    const isViewOnly = searchParams.get('view') === 'true';

    useEffect(() => {
        if (!isLoading && user && !user.acceso_formatos_to && user.rol !== 'admin') {
            toast.error('No tienes permisos para acceder a esta sección');
            router.push('/dashboard/formatos-to');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 text-brand-500 animate-spin" />
            </div>
        );
    }

    if (!user?.acceso_formatos_to && user?.rol !== 'admin') {
        return null; // El useEffect se encarga de redirigir
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 border-b border-gray-200 pb-5">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push('/dashboard/formatos-to/valoracion-ocupacional')}
                    className="h-10 w-10 shrink-0 hover:bg-gray-100 text-gray-500 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                        <FileText className="h-7 w-7 text-brand-500" />
                        {isViewOnly ? 'Ver Valoración Ocupacional' : (valoracionId ? 'Editar Valoración Ocupacional' : 'Nueva Valoración Ocupacional')}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Complete el formulario de evaluación paso a paso
                    </p>
                </div>
            </div>

            <div className="min-h-[600px] w-full">
                <ValoracionOcupacionalWizard valoracionId={valoracionId} readOnly={isViewOnly} />
            </div>
        </div>
    );
}

export default function NuevaValoracionOcupacionalPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex justify-center flex-col gap-4 items-center py-20 min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    <p className="text-gray-500 font-medium">Cargando el editor...</p>
                </div>
            }>
                <ValoracionFormContent />
            </Suspense>
        </DashboardLayout>
    );
}
