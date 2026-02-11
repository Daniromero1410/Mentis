import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Plus, Trash2 } from 'lucide-react';

interface Step4Props {
    materiales: any[];
    setMateriales: React.Dispatch<React.SetStateAction<any[]>>;
    peligros: any[];
    setPeligros: React.Dispatch<React.SetStateAction<any[]>>;
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

const CATEGORIAS_PELIGRO = [
    { value: 'fisicos', label: 'Físicos' },
    { value: 'biologicos', label: 'Biológicos' },
    { value: 'biomecanicos', label: 'Biomecánicos' },
    { value: 'psicosociales', label: 'Psicosociales' },
    { value: 'quimicos', label: 'Químicos' },
    { value: 'cond_seguridad', label: 'Condiciones de Seguridad' },
];

export const Step4MaterialesPeligros = ({ materiales, setMateriales, peligros, setPeligros, formData, updateField, readOnly }: Step4Props) => {

    const emptyMaterial = () => ({
        nombre: '', descripcion: '', requerimientos_operacion: '', observaciones: '', orden: 0,
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
            <FormSection title="5. IDENTIFICACIÓN DE MATERIALES, EQUIPOS Y HERRAMIENTAS">
                {/* Header Row */}
                <div className="flex border-b border-gray-200 bg-slate-50 text-xs font-bold text-slate-700 text-center tracking-wide">
                    <div className="w-1/4 p-3 border-r border-gray-200 flex items-center justify-center">NOMBRE</div>
                    <div className="w-1/4 p-3 border-r border-gray-200 flex items-center justify-center">DESCRIPCIÓN</div>
                    <div className="w-1/4 p-3 border-r border-gray-200 flex items-center justify-center">REQUERIMIENTOS OPERACIÓN</div>
                    <div className="w-1/4 p-3 flex items-center justify-center">OBSERVACIONES</div>
                </div>

                {materiales.map((mat, idx) => (
                    <FormRow key={idx} className="relative group hover:bg-slate-50/30 transition-colors">
                        <div className="w-1/4 border-r border-gray-200 p-2">
                            <FormTextarea
                                className="min-h-[50px]"
                                value={mat.nombre}
                                onChange={(e) => updateMaterial(idx, 'nombre', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                        <div className="w-1/4 border-r border-gray-200 p-2">
                            <FormTextarea
                                className="min-h-[50px]"
                                value={mat.descripcion}
                                onChange={(e) => updateMaterial(idx, 'descripcion', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                        <div className="w-1/4 border-r border-gray-200 p-2">
                            <FormTextarea
                                className="min-h-[50px]"
                                value={mat.requerimientos_operacion}
                                onChange={(e) => updateMaterial(idx, 'requerimientos_operacion', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                        <div className="w-1/4 relative p-2">
                            <FormTextarea
                                className="min-h-[50px]"
                                value={mat.observaciones}
                                onChange={(e) => updateMaterial(idx, 'observaciones', e.target.value)}
                                disabled={readOnly}
                            />
                            {!readOnly && materiales.length > 1 && (
                                <button
                                    onClick={() => removeMaterial(idx)}
                                    className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-0.5 shadow-sm border border-gray-100"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </FormRow>
                ))}

                {!readOnly && (
                    <div className="p-3 flex justify-center bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={addMaterial}
                            className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors"
                        >
                            <Plus className="h-3 w-3" /> Agregar Fila
                        </button>
                    </div>
                )}
            </FormSection>

            <FormSection title="6. IDENTIFICACIÓN DE PELIGROS">
                {/* Header Row */}
                <div className="flex border-b border-gray-200 bg-slate-50 text-xs font-bold text-slate-700 text-center tracking-wide">
                    <div className="w-1/4 p-3 border-r border-gray-200 flex items-center justify-center">PELIGRO - CLASIFICACIÓN</div>
                    <div className="w-1/4 p-3 border-r border-gray-200 flex items-center justify-center">DESCRIPCIÓN</div>
                    <div className="w-1/4 p-3 border-r border-gray-200 flex items-center justify-center">TIPOS DE CONTROL EXISTENTE</div>
                    <div className="w-1/4 p-3 flex items-center justify-center">RECOMENDACIONES DE CONTROL</div>
                </div>

                {peligros.map((pel, idx) => {
                    const label = CATEGORIAS_PELIGRO.find(c => c.value === pel.categoria)?.label || pel.categoria;
                    return (
                        <FormRow key={idx}>
                            <div className="w-1/4 border-r border-gray-200 p-2 text-xs font-semibold text-slate-600 flex items-center justify-center bg-slate-50/50">
                                {label}
                            </div>
                            <div className="w-1/4 border-r border-gray-200 p-2">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={pel.descripcion}
                                    onChange={(e) => updatePeligro(idx, 'descripcion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="w-1/4 border-r border-gray-200 p-2">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={pel.tipos_control_existente}
                                    onChange={(e) => updatePeligro(idx, 'tipos_control_existente', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                            <div className="w-1/4 p-2">
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={pel.recomendaciones_control}
                                    onChange={(e) => updatePeligro(idx, 'recomendaciones_control', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </FormRow>
                    );
                })}

                <div className="mt-4 border-t border-gray-200">
                    <FormRow noBorderBottom>
                        <FormField label="6.1 VERIFICACIÓN DE ACCIONES CORRECTIVAS" className="w-full" col noBorderRight>
                            <FormTextarea
                                className="min-h-[80px]"
                                value={formData.verificacion_acciones_correctivas}
                                onChange={(e) => updateField('verificacion_acciones_correctivas', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                    </FormRow>
                </div>
            </FormSection>
        </div>
    );
};
