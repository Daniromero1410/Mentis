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
                    <div key={idx} className="border-b-4 border-gray-400 mb-6 last:border-b-0 last:mb-0">
                        <div className="bg-gray-100 px-2 py-1 text-xs font-bold border-y border-gray-800 flex justify-between items-center">
                            <span>TAREA {idx + 1}</span>
                            {!readOnly && tareas.length > 1 && (
                                <button
                                    onClick={() => removeTarea(idx)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>

                        {/* Row 1: Actividad, Ciclo, Subactividad, Estandar */}
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Actividad" className="w-1/4 font-bold border-r border-gray-800 col" >
                                <FormInput
                                    value={tarea.actividad}
                                    onChange={(e) => updateTarea(idx, 'actividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Ciclo" className="w-1/4 font-bold border-r border-gray-800 col" >
                                <FormInput
                                    value={tarea.ciclo}
                                    onChange={(e) => updateTarea(idx, 'ciclo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Subactividad" className="w-1/4 font-bold border-r border-gray-800 col" >
                                <FormInput
                                    value={tarea.subactividad}
                                    onChange={(e) => updateTarea(idx, 'subactividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <FormField label="Estándar de productividad" className="w-1/4 font-bold col" noBorderRight >
                                <FormInput
                                    value={tarea.estandar_productividad}
                                    onChange={(e) => updateTarea(idx, 'estandar_productividad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </FormRow>

                        {/* Description Biomecanica */}
                        <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase">
                            DESCRIPCIÓN Y REQUERIMIENTOS BIOMECÁNICOS DEL PUESTO DE TRABAJO
                        </div>
                        <FormRow className="border-b border-gray-800">
                            <FormTextarea
                                className="min-h-[60px]"
                                value={tarea.descripcion_biomecanica}
                                onChange={(e) => updateTarea(idx, 'descripcion_biomecanica', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>

                        {/* Apreciaciones grid */}
                        <div className="grid grid-cols-2 border-b border-gray-800">
                            <div className="border-r border-gray-800">
                                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                                    APRECIACIÓN DEL TRABAJADOR
                                </div>
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={tarea.apreciacion_trabajador}
                                    onChange={(e) => updateTarea(idx, 'apreciacion_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                            <div>
                                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                                    APRECIACIÓN DEL PROFESIONAL
                                </div>
                                <FormTextarea
                                    className="min-h-[60px]"
                                    value={tarea.apreciacion_profesional}
                                    onChange={(e) => updateTarea(idx, 'apreciacion_profesional', e.target.value)}
                                    disabled={readOnly}
                                />
                            </div>
                        </div>

                        {/* Conclusion */}
                        <FormRow className="border-b border-gray-800 bg-[#FCE4D6]">
                            <FormField label="CONCLUSIÓN" className="w-full font-bold justify-center" />
                        </FormRow>
                        <FormRow>
                            <div className="w-full p-2 grid grid-cols-2 gap-2 text-xs">
                                {CONCLUSION_OPTIONS.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`conclusion-${idx}`}
                                            value={opt.value}
                                            checked={tarea.conclusion === opt.value}
                                            onChange={(e) => updateTarea(idx, 'conclusion', e.target.value)}
                                            disabled={readOnly}
                                            className="accent-gray-800"
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                        </FormRow>
                        <FormRow className="border-t border-gray-800">
                            <FormField label="Descripción Conclusión" className="w-32 font-bold bg-[#FCE4D6]" />
                            <FormTextarea
                                className="min-h-[40px]"
                                value={tarea.descripcion_conclusion}
                                onChange={(e) => updateTarea(idx, 'descripcion_conclusion', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>

                    </div>
                ))}
            </FormSection>
        </div>
    );
};
