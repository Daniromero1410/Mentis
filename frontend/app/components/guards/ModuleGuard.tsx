'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';

interface ModuleGuardProps {
    children: React.ReactNode;
    requiredModule: 'valoraciones' | 'pruebas_trabajo';
}

export function ModuleGuard({ children, requiredModule }: ModuleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!user) {
            router.push('/login');
            return;
        }

        // Admin siempre tiene acceso
        if (user.rol === 'admin') return;

        // Verificar permiso específico
        const hasAccess = requiredModule === 'valoraciones'
            ? user.acceso_valoraciones
            : user.acceso_pruebas_trabajo;

        if (!hasAccess) {
            toast.error('No tienes acceso a este módulo');
            router.push('/dashboard');
        }
    }, [user, isLoading, requiredModule, router]);

    // Mientras carga, no mostrar nada
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // Si no tiene acceso, no renderizar
    if (!user) return null;

    if (user.rol !== 'admin') {
        const hasAccess = requiredModule === 'valoraciones'
            ? user.acceso_valoraciones
            : user.acceso_pruebas_trabajo;

        if (!hasAccess) return null;
    }

    return <>{children}</>;
}


