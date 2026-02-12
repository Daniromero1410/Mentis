'use client';

import { useParams } from 'next/navigation';
import { PruebaTrabajoTOWizard } from '@/components/formatos-to/PruebaTrabajoTOWizard';

export default function DetallePruebaTrabajoTOPage() {
    const params = useParams();
    const id = params.id ? parseInt(params.id as string) : undefined;

    return <PruebaTrabajoTOWizard mode="view" id={id} readOnly={true} />;
}
