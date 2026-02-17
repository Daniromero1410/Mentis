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
                                        <FormInput placeholder="Ej. Levantamiento de cargas" value={tarea.actividad} onChange={(e) => updateTarea(idx, 'actividad', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                                <div className="lg:col-span-4">
                                    <FormField label="Subactividad">
                                        <FormInput placeholder="Ej. Traslado manual" value={tarea.subactividad} onChange={(e) => updateTarea(idx, 'subactividad', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                                <div className="lg:col-span-2">
                                    <FormField label="Ciclo">
                                        <FormInput placeholder="Ej. 10 min" value={tarea.ciclo} onChange={(e) => updateTarea(idx, 'ciclo', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                                <div className="lg:col-span-2">
                                    <FormField label="Estándar">
                                        <FormInput placeholder="Ej. 50 u/h" value={tarea.estandar_productividad} onChange={(e) => updateTarea(idx, 'estandar_productividad', e.target.value)} disabled={readOnly} />
                                    </FormField>
                                </div>
                            </div>

                            {/* 2. Descripciones Técnicas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                                <FormField label="Descripción Subactividad">
                                    <FormTextarea
                                        className="min-h-[100px] bg-white"
                                        placeholder="Describa detalladamente la subactividad..."
                                        value={tarea.descripcion_biomecanica}
                                        onChange={(e) => updateTarea(idx, 'descripcion_biomecanica', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Requerimientos Motrices - Análisis Biomecánico">
                                    <FormTextarea
                                        className="min-h-[100px] bg-white"
                                        placeholder="Especifique los requerimientos motrices..."
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
                                        placeholder="Concepto profesional..."
                                        value={tarea.apreciacion_profesional}
                                        onChange={(e) => updateTarea(idx, 'apreciacion_profesional', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>

                            {/* 4. Evidencia y Conclusión */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                                {/* Columna Izquierda: Fotos */}
                                <div className="lg:col-span-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs font-bold text-slate-600 uppercase">Registro Fotográfico</Label>
                                        <span className="text-[10px] text-slate-400">Máx 3</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        {tarea.registro_fotografico && tarea.registro_fotografico.split(';').filter((u: string) => u.trim()).map((url: string, imgIdx: number) => (
                                            <div key={imgIdx} className="relative aspect-square rounded-md overflow-hidden border border-slate-200 group">
                                                <img src={`${API_URL || ''}${url}`} alt="Evidencia" className="w-full h-full object-cover" />
                                                {!readOnly && (
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button variant="destructive" size="icon" className="h-6 w-6 rounded-full" onClick={() => removeImage(idx, imgIdx)}>
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {!readOnly && (!tarea.registro_fotografico || tarea.registro_fotografico.split(';').filter((u: string) => u.trim()).length < 3) && (
                                            <div className="aspect-square border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors rounded-md flex flex-col items-center justify-center cursor-pointer relative">
                                                <Upload className="h-4 w-4 text-slate-400 mb-1" />
                                                <span className="text-[8px] font-medium text-slate-500 text-center px-1">Subir</span>
                                                <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(idx, e)} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Columna Derecha: Conclusión */}
                                <div className="lg:col-span-2 space-y-3">
                                    <Label className="text-xs font-bold text-slate-600 uppercase">Conclusión con respecto a la actividad</Label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {[
                                            { value: 'reintegro_sin_modificaciones', label: 'Reintegro sin modificaciones' },
                                            { value: 'reintegro_con_modificaciones', label: 'Reintegro con modificaciones' },
                                            { value: 'desarrollo_capacidades', label: 'Desarrollo de capacidades' },
                                            { value: 'no_puede_desempenarla', label: 'No puede desempeñarla' }
                                        ].map((opt) => (
                                            <label
                                                key={opt.value}
                                                className={`flex items-start gap-3 p-3 rounded-lg border text-sm transition-all cursor-pointer ${tarea.conclusion === opt.value
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
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
                                                    className="mt-0.5 sr-only" // Hide default radio
                                                />
                                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${tarea.conclusion === opt.value ? 'border-white bg-white/20' : 'border-slate-300'
                                                    }`}>
                                                    {tarea.conclusion === opt.value && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                <span className="leading-tight">{opt.label}</span>
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
