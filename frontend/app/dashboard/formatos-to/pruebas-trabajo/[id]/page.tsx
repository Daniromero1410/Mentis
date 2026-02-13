'use client';

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

    return <PruebaTrabajoTOWizard mode={isViewMode ? 'view' : 'edit'} id={id} readOnly={isViewMode} />;
}
