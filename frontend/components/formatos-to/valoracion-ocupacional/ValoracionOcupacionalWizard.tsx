'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    ChevronRight,
    ChevronLeft,
    Save,
    Check,
    FileCheck2,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { toast } from '@/components/ui/sileo-toast';
import { api } from '@/app/services/api';

import { Seccion1ObjetivoIdentificacion } from './Seccion1ObjetivoIdentificacion';
import { Seccion2HistoriaOcupacional } from './Seccion2HistoriaOcupacional';
import { Seccion3ActividadActual } from './Seccion3ActividadActual';
import { Seccion4RolLaboralEvento } from './Seccion4RolLaboralEvento';
import { Seccion5OtrasAreas } from './Seccion5OtrasAreas';
import { Seccion6ComposicionRegistro } from './Seccion6ComposicionRegistro';

interface WizardProps {
    valoracionId?: number;
    readOnly?: boolean;
}

const STEPS = [
    { title: '1. Identificación y Objetivos', icon: FileCheck2 },
    { title: '2. Historial y Eventos', icon: FileCheck2 },
    { title: '3. Actividad Actual', icon: FileCheck2 },
    { title: '4. Rol Laboral y Evento ATEL', icon: FileCheck2 },
    { title: '5. Otras Áreas', icon: FileCheck2 },
    { title: '6. Composición y Registro', icon: FileCheck2 }
];

export function ValoracionOcupacionalWizard({ valoracionId, readOnly = false }: WizardProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Core data state
    const [formData, setFormData] = useState<any>({
        secciones_texto: {},
        identificacion: {},
        eventos_nolaborales: [],
        historia_ocupacional: [],
        actividad_actual: {},
        rol_laboral: {},
        evento_atel: {},
        composicion_familiar: {},
        miembros_familiares: [],
        evaluacion_otras_areas: {},
        registro: {}
    });

    useEffect(() => {
        if (valoracionId) {
            loadValoracion(valoracionId);
        }
    }, [valoracionId]);

    const loadValoracion = async (id: number) => {
        setLoading(true);
        try {
            const response = await api.get(`/formatos-to/valoracion-ocupacional/${id}`);
            const data = response as any;

            // Normalize sections that might have multiple records
            // Because they come back grouped arrays if relationship is 1-to-N
            // Even if model restricts to 1, fastAPI returns 1 or null/empty array depending on DB

            setFormData({
                secciones_texto: Array.isArray(data.secciones_texto) ? data.secciones_texto[0] || {} : data.secciones_texto || {},
                identificacion: Array.isArray(data.identificacion) ? data.identificacion[0] || {} : data.identificacion || {},
                eventos_nolaborales: data.eventos_nolaborales || [],
                historia_ocupacional: data.historia_ocupacional || [],
                actividad_actual: Array.isArray(data.actividad_actual) ? data.actividad_actual[0] || {} : data.actividad_actual || {},
                rol_laboral: Array.isArray(data.rol_laboral) ? data.rol_laboral[0] || {} : data.rol_laboral || {},
                evento_atel: Array.isArray(data.evento_atel) ? data.evento_atel[0] || {} : data.evento_atel || {},
                composicion_familiar: Array.isArray(data.composicion_familiar) ? data.composicion_familiar[0] || {} : data.composicion_familiar || {},
                miembros_familiares: data.miembros_familiares || [],
                evaluacion_otras_areas: Array.isArray(data.evaluacion_otras_areas) ? data.evaluacion_otras_areas[0] || {} : data.evaluacion_otras_areas || {},
                registro: Array.isArray(data.registro) ? data.registro[0] || {} : data.registro || {}
            });
        } catch (error: any) {
            toast.error('Error al cargar la valoración');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const updateData = (section: string, field: string, value: any) => {
        setFormData((prev: any) => {
            // Manejo especial de arreglos (eventos, historial, miembros)
            if (['eventos_nolaborales', 'historia_ocupacional', 'miembros_familiares'].includes(section)) {
                return { ...prev, [section]: value };
            }

            // Manejo de objetos individuales (identificacion, rol_laboral...)
            return {
                ...prev,
                [section]: {
                    ...prev[section],
                    [field]: value
                }
            };
        });
    };

    const handleSave = async (finalizar: boolean = false) => {
        try {
            setSaving(true);

            // Normalize nested sections back into arrays as needed
            // The schemas accept a single object or list of objects depending on our specific FastAPI router.
            // Based on our implementation, Pydantic takes the single dict object for 1-1 relationships 
            // and list of dicts for 1-N.

            const payload = {
                ...formData,
                secciones_texto: Object.keys(formData.secciones_texto).length > 0 ? formData.secciones_texto : null,
                identificacion: Object.keys(formData.identificacion).length > 0 ? formData.identificacion : null,
                actividad_actual: Object.keys(formData.actividad_actual).length > 0 ? formData.actividad_actual : null,
                rol_laboral: Object.keys(formData.rol_laboral).length > 0 ? formData.rol_laboral : null,
                evento_atel: Object.keys(formData.evento_atel).length > 0 ? formData.evento_atel : null,
                composicion_familiar: Object.keys(formData.composicion_familiar).length > 0 ? formData.composicion_familiar : null,
                evaluacion_otras_areas: Object.keys(formData.evaluacion_otras_areas).length > 0 ? formData.evaluacion_otras_areas : null,
                registro: Object.keys(formData.registro).length > 0 ? formData.registro : null,
            };

            let responseId = valoracionId;
            if (valoracionId) {
                await api.put(`/formatos-to/valoracion-ocupacional/${valoracionId}`, payload);
            } else {
                const response = await api.post('/formatos-to/valoracion-ocupacional/', payload) as any;
                responseId = response.id;
                // If it's new, we smoothly map the ID so next saves are PUT and not POST
                // This would be handled ideally by redirecting or setting the state
            }

            if (finalizar && responseId) {
                await api.post(`/formatos-to/valoracion-ocupacional/${responseId}/finalizar`, {});
                toast.success('Valoración Ocupacional completada exitosamente');
                router.push('/dashboard/formatos-to/valoracion-ocupacional');
            } else {
                toast.success('Borrador guardado');
                if (!valoracionId && responseId) {
                    router.push(`/dashboard/formatos-to/valoracion-ocupacional/nueva?id=${responseId}`);
                }
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al guardar');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const STEPS_COMPONENTS = [
        <Seccion1ObjetivoIdentificacion key="s1" data={formData} updateData={updateData} readOnly={readOnly} />,
        <Seccion2HistoriaOcupacional key="s2" data={formData} updateData={updateData} readOnly={readOnly} />,
        <Seccion3ActividadActual key="s3" data={formData} updateData={updateData} readOnly={readOnly} />,
        <Seccion4RolLaboralEvento key="s4" data={formData} updateData={updateData} readOnly={readOnly} />,
        <Seccion5OtrasAreas key="s5" data={formData} updateData={updateData} readOnly={readOnly} />,
        <Seccion6ComposicionRegistro key="s6" data={formData} updateData={updateData} readOnly={readOnly} />
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="mt-4 text-gray-500">Cargando datos de la valoración...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50/30 dark:bg-gray-900/10">
            {/* PROGRESS BAR */}
            <div className="mb-8 px-4">
                <div className="flex justify-between items-center relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full z-0"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-600 rounded-full z-0 transition-all duration-300"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    ></div>

                    {STEPS.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = index === currentStep;
                        const isPast = index < currentStep;

                        return (
                            <div key={index} className="relative z-10 flex flex-col items-center group">
                                <button
                                    onClick={() => setCurrentStep(index)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                                        ${isActive ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-110' :
                                            isPast ? 'bg-indigo-100 border-indigo-600 text-indigo-600 dark:bg-indigo-900/50' :
                                                'bg-white border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'}
                                    `}
                                >
                                    {isPast && !isActive ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                                </button>
                                <span className={`absolute -bottom-6 text-xs font-semibold whitespace-nowrap transition-colors duration-300
                                    ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 md:opacity-100'}
                                `}>
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8">
                {STEPS_COMPONENTS[currentStep]}
            </div>

            {/* NAVIGATION BOTTOM */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex justify-between items-center sticky bottom-0 bg-white dark:bg-gray-900 p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-xl z-20">
                <Button
                    variant="outline"
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0 || saving}
                    className="border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Atrás
                </Button>

                <div className="flex gap-3">
                    {!readOnly && (
                        <Button
                            variant="outline"
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            Guardar Borrador
                        </Button>
                    )}

                    {currentStep < STEPS.length - 1 ? (
                        <Button
                            onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            Siguiente
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        !readOnly && (
                            <Button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
                            >
                                <Check className="w-4 h-4 mr-2" />
                                Completar Valoración
                            </Button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
