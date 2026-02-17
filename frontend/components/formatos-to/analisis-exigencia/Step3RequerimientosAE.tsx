import React from 'react';
import { FormSection, FormField, FormTextarea, FormInput } from '../prueba-trabajo/FormComponents';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuth } from '@/app/context/AuthContext';

interface Step3AEProps {
    tareas: any[];
    setTareas: React.Dispatch<React.SetStateAction<any[]>>;
    materiales: any[];
    setMateriales: React.Dispatch<React.SetStateAction<any[]>>;
    readOnly?: boolean;
}

export const Step3RequerimientosAE = ({ tareas, setTareas, materiales, setMateriales, readOnly }: Step3AEProps) => {
    const { token } = useAuth();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // --- MATERIALES LOGIC ---
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

    // --- TAREAS LOGIC ---
    const emptyTarea = () => ({
        actividad: '', ciclo: '', subactividad: '', estandar_productividad: '',
        registro_fotografico: '', descripcion_biomecanica: '', requerimientos_motrices: '',
        apreciacion_trabajador: '', apreciacion_profesional: '',
        conclusion: '', descripcion_conclusion: '', orden: 0,
    });
    const updateTarea = (index: number, field: string, value: any) => {
        const newTareas = [...tareas];
        newTareas[index] = { ...newTareas[index], [field]: value };
        setTareas(newTareas);
    };
    const addTarea = () => setTareas([...tareas, emptyTarea()]);
    const removeTarea = (index: number) => setTareas(tareas.filter((_, i) => i !== index));

    const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error('Error al subir imagen');
            const data = await res.json();
            const newUrl = data.url;
            const updatedUrls = [...currentUrls, newUrl].join(';');
            updateTarea(index, 'registro_fotografico', updatedUrls);
            toast.success('Evidencia subida');
        } catch (error) {
            console.error(error);
            toast.error('Error al subir evidencia');
        }
    };

    const removeImage = (index: number, imgIndex: number) => {
        const currentUrls = tareas[index].registro_fotografico
            ? tareas[index].registro_fotografico.split(';').filter((u: string) => u.trim())
            : [];
        const newUrls = currentUrls.filter((_: string, i: number) => i !== imgIndex);
        updateTarea(index, 'registro_fotografico', newUrls.join(';'));
    };

    return (
        <div className="space-y-8">

            {/* --- SECCIÓN 4: TAREAS --- */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6 pl-1 border-l-4 border-blue-500">
                    <h2 className="text-lg font-bold text-slate-800 uppercase">
                        4. REQUERIMIENTOS DEL PROCESO PRODUCTIVO POR TAREA
                    </h2>
                    {!readOnly && (
                        <Button onClick={addTarea} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4">
                            <Plus className="h-4 w-4 mr-2" /> Agregar Tarea
                        </Button>
                    )}
                </div>

                {tareas.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm mb-6">
                        No se han registrado tareas críticas.
                    </div>
                )}

                {tareas.map((tarea, idx) => (
                    <Card key={idx} className="border-slate-200 shadow-sm mb-6 overflow-hidden">
                        <CardHeader className="bg-slate-50/80 border-b border-slate-100 flex flex-row items-center justify-between py-3">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                                    {idx + 1}
                                </div>
                                <CardTitle className="text-sm font-bold text-slate-700">TAREA {idx + 1}</CardTitle>
                            </div>
                            {!readOnly && (
                                <Button variant="ghost" size="icon" onClick={() => removeTarea(idx)} className="text-red-500 hover:text-red-700 h-8 w-8 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            {/* 1. Información Básica */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                                <div className="lg:col-span-4">
                                    <FormField label="Actividad">
                                        <FormInput value={tarea.actividad} onChange={(e) => updateTarea(idx, 'actividad', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                                <div className="lg:col-span-4">
                                    <FormField label="Subactividad">
                                        <FormInput value={tarea.subactividad} onChange={(e) => updateTarea(idx, 'subactividad', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                                <div className="lg:col-span-2">
                                    <FormField label="Ciclo">
                                        <FormInput value={tarea.ciclo} onChange={(e) => updateTarea(idx, 'ciclo', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                                <div className="lg:col-span-2">
                                    <FormField label="Estándar">
                                        <FormInput value={tarea.estandar_productividad} onChange={(e) => updateTarea(idx, 'estandar_productividad', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                            </div>

                            {/* 2. Descripciones Técnicas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                <FormField label="Descripción Subactividad">
                                    <FormTextarea
                                        className="min-h-[100px] bg-white"
                                        value={tarea.descripcion_biomecanica}
                                        onChange={(e) => updateTarea(idx, 'descripcion_biomecanica', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Requerimientos Motrices - Análisis Biomecánico">
                                    <FormTextarea
                                        className="min-h-[100px] bg-white"
                                        value={tarea.requerimientos_motrices}
                                        onChange={(e) => updateTarea(idx, 'requerimientos_motrices', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>

                            {/* 3. Apreciación Profesional */}
                            <div>
                                <FormField label="Apreciación del profesional de la salud que evalúa y plan de reincorporación">
                                    <FormTextarea
                                        className="min-h-[80px]"
                                        value={tarea.apreciacion_profesional}
                                        onChange={(e) => updateTarea(idx, 'apreciacion_profesional', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>

                            {/* 4. Evidencia y Conclusión */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
                                {/* Columna Izquierda: Fotos */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-bold text-slate-700 uppercase">Registro Fotográfico</Label>
                                        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Máx 3 imágenes</span>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {tarea.registro_fotografico && tarea.registro_fotografico.split(';').filter((u: string) => u.trim()).map((url: string, imgIdx: number) => (
                                            <div key={imgIdx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group shadow-sm hover:shadow-md transition-shadow">
                                                <img src={`${API_URL || ''}${url}`} alt="Evidencia" className="w-full h-full object-cover" />
                                                {!readOnly && (
                                                    <Button
                                                        variant="destructive"
                                                        size="icon"
                                                        className="absolute top-1 right-1 h-6 w-6 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={() => removeImage(idx, imgIdx)}
                                                        title="Eliminar imagen"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}

                                        {!readOnly && (!tarea.registro_fotografico || tarea.registro_fotografico.split(';').filter((u: string) => u.trim()).length < 3) && (
                                            <div className="aspect-square border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 transition-all rounded-lg flex flex-col items-center justify-center cursor-pointer relative group">
                                                <div className="bg-white p-3 rounded-full shadow-sm border border-slate-100 mb-2 group-hover:scale-110 transition-transform">
                                                    <Upload className="h-6 w-6 text-blue-500" />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600">Subir Foto</span>
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(idx, e)} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Columna Derecha: Conclusión */}
                                <div className="space-y-4">
                                    <Label className="text-sm font-bold text-slate-700 uppercase">Conclusión con respecto a la actividad</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 h-full content-start">
                                        {[
                                            { value: 'reintegro_sin_modificaciones', label: 'Reintegro sin modificaciones' },
                                            { value: 'reintegro_con_modificaciones', label: 'Reintegro con modificaciones' },
                                            { value: 'desarrollo_capacidades', label: 'Desarrollo de capacidades' },
                                            { value: 'no_puede_desempenarla', label: 'No puede desempeñarla' }
                                        ].map((opt) => (
                                            <label
                                                key={opt.value}
                                                className={`flex flex-col items-start gap-2 p-4 rounded-xl border text-sm transition-all cursor-pointer relative overflow-hidden ${tarea.conclusion === opt.value
                                                    ? 'bg-blue-50 border-blue-500 text-blue-800 shadow-sm ring-1 ring-blue-500'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`conclusion-${idx}`}
                                                    value={opt.value}
                                                    checked={tarea.conclusion === opt.value}
                                                    onChange={(e) => updateTarea(idx, 'conclusion', e.target.value)}
                                                    disabled={readOnly}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-center justify-between w-full">
                                                    <span className="font-medium leading-tight">{opt.label}</span>
                                                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${tarea.conclusion === opt.value ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                                                        }`}>
                                                        {tarea.conclusion === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* --- SECCIÓN 5: MATERIALES --- */}
            <div className="mb-10">
                <div className="flex justify-between items-center mb-6 pl-1 border-l-4 border-blue-500">
                    <h2 className="text-lg font-bold text-slate-800 uppercase">
                        5. MATERIALES, EQUIPOS Y HERRAMIENTAS
                    </h2>
                    {!readOnly && (
                        <Button onClick={addMaterial} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white ml-4">
                            <Plus className="h-4 w-4 mr-2" /> Agregar Item
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {materiales.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                            No se han registrado materiales, equipos o herramientas.
                        </div>
                    )}
                    {materiales.map((mat, idx) => (
                        <Card key={idx} className="border-slate-200 shadow-sm relative group">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-2 px-4 flex flex-row justify-between items-center">
                                <span className="text-xs font-bold text-slate-600 uppercase">Item #{idx + 1}</span>
                                {!readOnly && (
                                    <Button
                                        variant="ghost" size="sm" onClick={() => removeMaterial(idx)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <FormField label="Nombre">
                                    <FormTextarea className="min-h-[40px]" value={mat.nombre} onChange={(e) => updateMaterial(idx, 'nombre', e.target.value)} disabled={readOnly} />
                                </FormField>
                                <FormField label="Descripción">
                                    <FormTextarea className="min-h-[40px]" value={mat.descripcion} onChange={(e) => updateMaterial(idx, 'descripcion', e.target.value)} disabled={readOnly} />
                                </FormField>
                                <FormField label="Estado (B/R/M)">
                                    <FormTextarea className="min-h-[40px]" value={mat.estado} onChange={(e) => updateMaterial(idx, 'estado', e.target.value)} disabled={readOnly} />
                                </FormField>
                                <FormField label="Requerimientos para su operación">
                                    <FormTextarea className="min-h-[40px]" value={mat.requerimientos_operacion} onChange={(e) => updateMaterial(idx, 'requerimientos_operacion', e.target.value)} disabled={readOnly} />
                                </FormField>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    );
};
