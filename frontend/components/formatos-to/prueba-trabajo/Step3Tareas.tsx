import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

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
    const { token } = useAuth();

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

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check if limit reached (defensive, though UI hides button)
        const currentUrls = tareas[index].registro_fotografico
            ? tareas[index].registro_fotografico.split(';').filter((u: string) => u.trim())
            : [];

        if (currentUrls.length >= 3) {
            toast.error('Máximo 3 imágenes por tarea');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/uploads/evidencia`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!res.ok) throw new Error('Error al subir imagen');

            const data = await res.json();

            // Append new URL
            const newUrl = data.url;
            const updatedUrls = [...currentUrls, newUrl].join(';');

            updateTarea(index, 'registro_fotografico', updatedUrls);
            toast.success('Evidencia subida correctamente');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir la evidencia');
        }
    };

    const removeImage = (index: number, imgIndex: number) => {
        const currentUrls = tareas[index].registro_fotografico
            ? tareas[index].registro_fotografico.split(';').filter((u: string) => u.trim())
            : [];

        const newUrls = currentUrls.filter((_: string, i: number) => i !== imgIndex);
        updateTarea(index, 'registro_fotografico', newUrls.join(';'));
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

                        {/* Registro Fotográfico */}
                        <div className="space-y-4">
                            <Label className="text-sm font-semibold text-slate-700">REGISTRO FOTOGRÁFICO (Máx 3)</Label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {tarea.registro_fotografico ? (
                                    tarea.registro_fotografico.split(';').filter((url: string) => url.trim() !== '').map((url: string, imgIdx: number) => (
                                        <div key={imgIdx} className="relative w-full aspect-[4/3] rounded-md overflow-hidden bg-slate-100 border border-slate-200 group">
                                            <img
                                                src={`${API_URL || ''}${url}`}
                                                alt={`Evidencia ${imgIdx + 1}`}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.onerror = null;
                                                    target.src = "https://placehold.co/400x300?text=Error+Cargando";
                                                }}
                                            />
                                            {!readOnly && (
                                                <Button
                                                    variant="destructive"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-7 w-7 rounded-full shadow-md z-10 bg-red-600 hover:bg-red-700 text-white border-2 border-white opacity-90 hover:opacity-100"
                                                    onClick={() => removeImage(idx, imgIdx)}
                                                    type="button"
                                                    title="Eliminar imagen"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : null}

                                {/* Upload Placeholder - SÓLO SI HAY MENOS DE 3 IMÁGENES */}
                                {!readOnly && (!tarea.registro_fotografico || tarea.registro_fotografico.split(';').filter((u: string) => u.trim()).length < 3) && (
                                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-indigo-400 transition-colors bg-white aspect-[4/3] relative">
                                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                        <div className="text-xs text-slate-500 font-medium">Subir Foto</div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => handleImageUpload(idx, e)}
                                        />
                                    </div>
                                )}
                            </div>
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
