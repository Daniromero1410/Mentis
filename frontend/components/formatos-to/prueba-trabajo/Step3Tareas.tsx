import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Step3Props {
    tareas: any[];
    setTareas: React.Dispatch<React.SetStateAction<any[]>>;
    readOnly?: boolean;
}

const CONCLUSION_OPTIONS = [
    { value: 'reintegro_sin_modificaciones', label: 'Reintegro sin modificaciones' },
    { value: 'reintegro_con_modificaciones', label: 'Reintegro con modificaciones' },
    { value: 'desarrollo_capacidades', label: 'Desarrollo de capacidades' },
    { value: 'no_puede_desempenarla', label: 'No puede desempeñarla' },
];

export const Step3Tareas = ({ tareas, setTareas, readOnly }: Step3Props) => {

    // Helper to empty task
    const emptyTarea = () => ({
        actividad: '', ciclo: '', subactividad: '', estandar_productividad: '',
        registro_fotografico: '', descripcion_biomecanica: '', apreciacion_trabajador: '',
        apreciacion_profesional: '', conclusion: '', descripcion_conclusion: '', orden: 0,
    });

    const updateTarea = (index: number, field: string, value: any) => {
        const newTareas = [...tareas];
        newTareas[index] = { ...newTareas[index], [field]: value };
        setTareas(newTareas);
    };

    const addTarea = () => setTareas([...tareas, emptyTarea()]);
    const removeTarea = (index: number) => setTareas(tareas.filter((_, i) => i !== index));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-800">4. REQUERIMIENTOS DEL PROCESO PRODUCTIVO POR TAREA</h2>
                {!readOnly && (
                    <Button
                        onClick={addTarea}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        AGREGAR TAREA
                    </Button>
                )}
            </div>

            {tareas.map((tarea, idx) => (
                <Card key={idx} className="border-slate-200 shadow-sm mb-6">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between py-3">
                        <CardTitle className="text-sm font-bold text-slate-700">
                            TAREA {idx + 1}
                        </CardTitle>
                        {!readOnly && tareas.length > 1 && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTarea(idx)}
                                className="text-red-500 hover:text-red-700 h-8 w-8 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-4 space-y-6">
                        {/* Basic Info Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Actividad">
                                <FormInput
                                    value={tarea.actividad}
                                    onChange={(e) => updateTarea(idx, 'actividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Ciclo">
                                <FormInput
                                    value={tarea.ciclo}
                                    onChange={(e) => updateTarea(idx, 'ciclo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Subactividad">
                                <FormInput
                                    value={tarea.subactividad}
                                    onChange={(e) => updateTarea(idx, 'subactividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Estándar de productividad">
                                <FormInput
                                    value={tarea.estandar_productividad}
                                    onChange={(e) => updateTarea(idx, 'estandar_productividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </div>

                        {/* Descriptions */}
                        <FormField label="DESCRIPCIÓN Y REQUERIMIENTOS BIOMECÁNICOS DEL PUESTO DE TRABAJO">
                            <FormTextarea
                                className="min-h-[80px]"
                                value={tarea.descripcion_biomecanica}
                                onChange={(e) => updateTarea(idx, 'descripcion_biomecanica', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="APRECIACIÓN DEL TRABAJADOR">
                                <FormTextarea
                                    className="min-h-[80px]"
                                    value={tarea.apreciacion_trabajador}
                                    onChange={(e) => updateTarea(idx, 'apreciacion_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="APRECIACIÓN DEL PROFESIONAL">
                                <FormTextarea
                                    className="min-h-[80px]"
                                    value={tarea.apreciacion_profesional}
                                    onChange={(e) => updateTarea(idx, 'apreciacion_profesional', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </div>

                        {/* Conclusion Section */}
                        <div className="bg-slate-50 p-4 rounded-md border border-slate-100 space-y-4">
                            <Label className="text-xs font-bold text-slate-700 uppercase block text-center mb-2">
                                CONCLUSIÓN
                            </Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {CONCLUSION_OPTIONS.map((opt) => (
                                    <label
                                        key={opt.value}
                                        className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all ${tarea.conclusion === opt.value
                                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`conclusion-${idx}`}
                                            value={opt.value}
                                            checked={tarea.conclusion === opt.value}
                                            onChange={(e) => updateTarea(idx, 'conclusion', e.target.value)}
                                            disabled={readOnly}
                                            className="accent-indigo-600 h-4 w-4"
                                        />
                                        <span className="text-sm font-medium">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                            <FormField label="Descripción Conclusión" className="mt-4">
                                <FormTextarea
                                    className="min-h-[60px] bg-white"
                                    placeholder="Detalles adicionales sobre la conclusión..."
                                    value={tarea.descripcion_conclusion}
                                    onChange={(e) => updateTarea(idx, 'descripcion_conclusion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
