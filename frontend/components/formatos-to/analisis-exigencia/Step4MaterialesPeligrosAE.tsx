import React from 'react';
import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Step4AEProps {
    materiales: any[];
    setMateriales: React.Dispatch<React.SetStateAction<any[]>>;
    peligros: any[];
    setPeligros: React.Dispatch<React.SetStateAction<any[]>>;
    formData: any;
    updateField: (field: string, value: any) => void;
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

export const Step4MaterialesPeligrosAE = ({ materiales, setMateriales, peligros, setPeligros, formData, updateField, readOnly }: Step4AEProps) => {

    const emptyMaterial = () => ({
        nombre: '', descripcion: '', estado: '', requerimientos_operacion: '', observaciones: '', orden: 0,
    });

    const updateMaterial = (index: number, field: string, value: any) => {
        const newMats = [...materiales];
        newMats[index] = { ...newMats[index], [field]: value };
        setMateriales(newMats);
    };

    const removeMaterial = (index: number) => setMateriales(materiales.filter((_, i) => i !== index));
    const addMaterial = () => setMateriales([...materiales, emptyMaterial()]);

    const updatePeligro = (index: number, field: string, value: any) => {
        const newPelis = [...peligros];
        newPelis[index] = { ...newPelis[index], [field]: value };
        setPeligros(newPelis);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">5. IDENTIFICACIÓN DE MATERIALES, EQUIPOS Y HERRAMIENTAS</h2>
                {!readOnly && (
                    <Button
                        onClick={addMaterial}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        AGREGAR MATERIAL
                    </Button>
                )}
            </div>

            {materiales.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-500">
                    No hay materiales registrados.
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {materiales.map((mat, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm relative group">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3 flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-bold text-slate-700">
                                MATERIAL / EQUIPO #{idx + 1}
                            </CardTitle>
                            {!readOnly && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeMaterial(idx)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField label="Nombre">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={mat.nombre}
                                    onChange={(e) => updateMaterial(idx, 'nombre', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Descripción">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={mat.descripcion}
                                    onChange={(e) => updateMaterial(idx, 'descripcion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            {/* NEW: Estado column */}
                            <FormField label="Estado">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={mat.estado}
                                    onChange={(e) => updateMaterial(idx, 'estado', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ej: Bueno, Regular, Malo..."
                                />
                            </FormField>
                            <FormField label="Requerimientos Operación">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={mat.requerimientos_operacion}
                                    onChange={(e) => updateMaterial(idx, 'requerimientos_operacion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Observaciones">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={mat.observaciones}
                                    onChange={(e) => updateMaterial(idx, 'observaciones', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <FormSection title="6. IDENTIFICACIÓN DE PELIGROS">
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
                                <FormField label="Recomendaciones de Control">
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

                <div className="mt-8">
                    <FormField label="6.1 VERIFICACIÓN DE ACCIONES CORRECTIVAS DE ARL. IMPLEMENTACIÓN DE RECOMENDACIONES">
                        <FormTextarea
                            className="min-h-[80px]"
                            value={formData.verificacion_acciones_correctivas}
                            onChange={(e) => updateField('verificacion_acciones_correctivas', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </div>
            </FormSection>
        </div>
    );
};
