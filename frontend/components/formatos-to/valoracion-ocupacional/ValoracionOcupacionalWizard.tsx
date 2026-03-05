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
    AlertCircle,
    Loader2,
    User,
    Briefcase,
    Activity,
    ClipboardList,
    Heart,
    PenTool
} from 'lucide-react';
import { toast } from '@/components/ui/sileo-toast';
import { api } from '@/app/services/api';

import { Seccion1ObjetivoIdentificacion } from './Seccion1ObjetivoIdentificacion';
import { Seccion2HistoriaOcupacional } from './Seccion2HistoriaOcupacional';
import { Seccion3ActividadActual } from './Seccion3ActividadActual';
import { Seccion4RolLaboralEvento } from './Seccion4RolLaboralEvento';
import { Seccion5OtrasAreas } from './Seccion5OtrasAreas';
import { Seccion6ComposicionRegistro } from './Seccion6ComposicionRegistro';
import { BlurValidationModal } from '../BlurValidationModal';

interface WizardProps {
    valoracionId?: number;
    readOnly?: boolean;
}

const STEPS = [
    { title: '1. Identificación y Objetivos', icon: User },
    { title: '2. Historial y Eventos', icon: ClipboardList },
    { title: '3. Actividad Actual', icon: Activity },
    { title: '4. Rol Laboral y Evento', icon: Briefcase },
    { title: '5. Otras Áreas', icon: Heart },
    { title: '6. Composición y Registro', icon: PenTool }
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
        <div className="max-w-6xl mx-auto">

            {/* PROGRESS BAR (Refactored Stepper) */}
            <div className="flex items-start justify-between relative mb-12 px-4">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-20" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                />
                {STEPS.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === index;
                    const isCompleted = currentStep > index;

                    return (
                        <div key={index} className="flex flex-col items-center relative z-10">
                            <button
                                onClick={() => setCurrentStep(index)}
                                className={`
                                        flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                                        ${isActive
                                        ? 'border-blue-600 bg-white text-blue-600 shadow-lg scale-110'
                                        : isCompleted
                                            ? 'border-blue-600 bg-blue-600 text-white'
                                            : 'border-gray-300 bg-white text-gray-500 hover:border-gray-400'
                                    }
                                    `}
                            >
                                <StepIcon className="h-5 w-5" />
                            </button>
                            <div className={`mt-3 text-center transition-all duration-300 ${isActive ? 'text-blue-600 font-bold' : 'text-gray-500'}`}>
                                <span className="text-xs font-semibold block whitespace-nowrap">{step.title}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Form content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                {STEPS_COMPONENTS[currentStep]}
            </div>

            {/* Navigation bar */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                    disabled={currentStep === 0 || saving}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>

                <div className="flex items-center gap-3">
                    {!readOnly ? (
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar Borrador
                        </button>
                    ) : (
                        // Optional document generation shortcut if we implement PDF viewer here 
                        // as we did in Analisis de exigencia. Emulating standard for readOnly
                        <div />
                    )}

                    {currentStep !== STEPS.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Siguiente <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        !readOnly && (
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Completar Valoración
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
