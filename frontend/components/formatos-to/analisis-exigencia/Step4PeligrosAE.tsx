import React from 'react';
import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Step4AEProps {
    peligros: any[];
    setPeligros: React.Dispatch<React.SetStateAction<any[]>>;
    readOnly?: boolean;
}

export const CATEGORIAS_PELIGRO_AE = [
    { value: 'fisicos', label: 'Físicos' },
    { value: 'biologicos', label: 'Biológicos' },
    { value: 'biomecanicos', label: 'Biomecánicos' },
    { value: 'psicosociales', label: 'Psicosociales' },
    { value: 'quimicos', label: 'Químicos' },
    { value: 'cond_seguridad', label: 'Condiciones de Seguridad' },
];

export const Step4PeligrosAE = ({ peligros, setPeligros, readOnly }: Step4AEProps) => {

    const updatePeligro = (index: number, field: string, value: any) => {
        const newPelis = [...peligros];
        newPelis[index] = { ...newPelis[index], [field]: value };
        setPeligros(newPelis);
    };

    return (
        <div className="space-y-6">
            <FormSection title="4. IDENTIFICACIÓN DE PELIGROS DENTRO DEL PROCESO PRODUCTIVO">
                {peligros.map((pel, idx) => {
                    const label = CATEGORIAS_PELIGRO_AE.find(c => c.value === pel.categoria)?.label || pel.categoria;
                    return (
                        <Card key={idx} className="border-slate-200 shadow-sm mb-4">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-white font-bold text-slate-700 uppercase tracking-wide">
                                        {label}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField label="Descripción del Peligro">
                                    <FormTextarea
                                        className="min-h-[80px]"
                                        value={pel.descripcion}
                                        onChange={(e) => updatePeligro(idx, 'descripcion', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Tipos de Control Existente">
                                    <FormTextarea
                                        className="min-h-[80px]"
                                        value={pel.tipos_control_existente}
                                        onChange={(e) => updatePeligro(idx, 'tipos_control_existente', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Recomendaciones para su control">
                                    <FormTextarea
                                        className="min-h-[80px]"
                                        value={pel.recomendaciones_control}
                                        onChange={(e) => updatePeligro(idx, 'recomendaciones_control', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </CardContent>
                        </Card>
                    );
                })}
            </FormSection>
        </div>
    );
};
