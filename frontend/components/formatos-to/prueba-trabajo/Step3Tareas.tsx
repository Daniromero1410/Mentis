import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Plus, Trash2 } from 'lucide-react';

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
            <FormSection title="4. REQUERIMIENTOS DEL PROCESO PRODUCTIVO POR TAREA">
                <div className="p-2 bg-gray-50 border-b border-gray-800 flex justify-end">
                    {!readOnly && (
                        <button
                            onClick={addTarea}
                            className="flex items-center gap-1 text-xs font-bold bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                        >
                            <Plus className="h-3 w-3" /> AGREGAR TAREA
                        </button>
                    )}
                </div>

                {tareas.map((tarea, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
                        <div className="bg-slate-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-slate-700 text-sm">TAREA {idx + 1}</span>
                            {!readOnly && tareas.length > 1 && (
                                <button
                                    onClick={() => removeTarea(idx)}
                                    className="text-red-500 hover:text-red-700 bg-white p-1 rounded-full border border-gray-200 shadow-sm transition-all"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Row 1: Actividad, Ciclo, Subactividad, Estandar */}
                        <FormRow>
                            <FormField label="Actividad" className="w-1/4" col >
                                <FormInput
                                    value={tarea.actividad}
                                    onChange={(e) => updateTarea(idx, 'actividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Ciclo" className="w-1/4" col >
                                <FormInput
                                    value={tarea.ciclo}
                                    onChange={(e) => updateTarea(idx, 'ciclo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Subactividad" className="w-1/4" col >
                                <FormInput
                                    value={tarea.subactividad}
                                    onChange={(e) => updateTarea(idx, 'subactividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Estándar de productividad" className="w-1/4" col noBorderRight >
                                <FormInput
                                    value={tarea.estandar_productividad}
                                    onChange={(e) => updateTarea(idx, 'estandar_productividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </FormRow>

                        {/* Description Biomecanica */}
                        <FormRow>
                            <FormField label="DESCRIPCIÓN Y REQUERIMIENTOS BIOMECÁNICOS DEL PUESTO DE TRABAJO" className="w-full" col noBorderRight>
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={tarea.descripcion_biomecanica}
                                    onChange={(e) => updateTarea(idx, 'descripcion_biomecanica', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </FormRow>

                        {/* Apreciaciones grid */}
                        <div className="grid grid-cols-2 border-b border-gray-200">
                            <div className="border-r border-gray-200">
                                <FormField label="APRECIACIÓN DEL TRABAJADOR" className="w-full" col noBorderRight>
                                    <FormTextarea
                                        className="min-h-[80px]"
                                        value={tarea.apreciacion_trabajador}
                                        onChange={(e) => updateTarea(idx, 'apreciacion_trabajador', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>
                            <div>
                                <FormField label="APRECIACIÓN DEL PROFESIONAL" className="w-full" col noBorderRight>
                                    <FormTextarea
                                        className="min-h-[80px]"
                                        value={tarea.apreciacion_profesional}
                                        onChange={(e) => updateTarea(idx, 'apreciacion_profesional', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Conclusion */}
                        <div className="bg-slate-50 p-2 border-b border-gray-200 text-center font-bold text-xs text-slate-700 uppercase">
                            CONCLUSIÓN
                        </div>
                        <FormRow>
                            <div className="w-full p-3 grid grid-cols-2 gap-4">
                                {CONCLUSION_OPTIONS.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-50 border border-transparent hover:border-gray-200 transition-all">
                                        <input
                                            type="radio"
                                            name={`conclusion-${idx}`}
                                            value={opt.value}
                                            checked={tarea.conclusion === opt.value}
                                            onChange={(e) => updateTarea(idx, 'conclusion', e.target.value)}
                                            disabled={readOnly}
                                            className="accent-slate-700 h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </FormRow>
                        <FormRow noBorderBottom>
                            <FormField label="Descripción Conclusión" className="w-full" col noBorderRight >
                                <FormTextarea
                                    className="min-h-[40px]"
                                    value={tarea.descripcion_conclusion}
                                    onChange={(e) => updateTarea(idx, 'descripcion_conclusion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </FormRow>

                    </div>
                ))}
            </FormSection>
        </div>
    );
};
