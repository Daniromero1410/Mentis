'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import {
    Save, ChevronLeft, ChevronRight, Download, Loader2,
    Plus, Trash2, CheckCircle2, FileText, User, Briefcase,
    Activity, AlertTriangle // Updated icons
} from 'lucide-react';
import { BlurValidationModal } from './BlurValidationModal';

import { Step1Identificacion } from './prueba-trabajo/Step1Identificacion';
import { Step2MetodologiaCondiciones } from './prueba-trabajo/Step2MetodologiaCondiciones';
import { Step3Tareas } from './prueba-trabajo/Step3Tareas';
import { Step4MaterialesPeligros } from './prueba-trabajo/Step4MaterialesPeligros';
import { Step5ConceptoRegistro } from './prueba-trabajo/Step5ConceptoRegistro';

const STEPS = [
    { id: 1, title: 'Identificación', icon: User },
    { id: 2, title: 'Metodología', icon: Briefcase },
    { id: 3, title: 'Tareas', icon: Activity },
    { id: 4, title: 'Peligros', icon: AlertTriangle },
    { id: 5, title: 'Concepto', icon: FileText }
];

interface PruebaTrabajoTOWizardProps {
    mode: 'create' | 'edit' | 'view';
    id?: number;
    readOnly?: boolean;
}

export function PruebaTrabajoTOWizard({ mode, id, readOnly = false }: PruebaTrabajoTOWizardProps) {
    const { token } = useAuth();
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [currentStep, setCurrentStep] = useState(1);
    const [pruebaId, setPruebaId] = useState<number | null>(id || null);
    const [saving, setSaving] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    const [formData, setFormData] = useState({
        fecha_valoracion: new Date().toISOString().split('T')[0],
        nombre_trabajador: '',
        tipo_documento: '',
        numero_documento: '',
        id_siniestro: '',
        fecha_nacimiento: '',
        edad: '',
        genero: '',
        escolaridad: '',
        cargo_empresa: '',
        antiguedad_cargo: '',
        antiguedad_empresa: '',
        telefono: '',
        ciudad_residencia: '',
        direccion: '',
        empresa: '',
        jefe_inmediato: '',
        telefono_jefe: '',
        cargo_jefe: '',
        objetivo_prueba: '',
        metodologia: '',
        descripcion_proceso_productivo: '',
        concepto_prueba_trabajo: ''
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [tareas, setTareas] = useState<any[]>([{ id: 1, actividad: '', frecuencia: '', tiempo: '', observacion: '' }]);
    const [materiales, setMateriales] = useState<any[]>([]);
    const [peligros, setPeligros] = useState<any[]>([]);

    const buildPayload = (finalizar: boolean) => {
        return {
            identificacion: {
                fecha_valoracion: formData.fecha_valoracion,
                nombre_trabajador: formData.nombre_trabajador,
                tipo_documento: formData.tipo_documento,
                numero_documento: formData.numero_documento,
                id_siniestro: formData.id_siniestro,
                fecha_nacimiento: formData.fecha_nacimiento,
                edad: formData.edad ? parseInt(formData.edad) : null,
                genero: formData.genero,
                escolaridad: formData.escolaridad,
                cargo_empresa: formData.cargo_empresa,
                antiguedad_cargo: formData.antiguedad_cargo,
                antiguedad_empresa: formData.antiguedad_empresa,
                telefono: formData.telefono,
                ciudad_residencia: formData.ciudad_residencia,
                direccion: formData.direccion,
                empresa: formData.empresa,
                jefe_inmediato: formData.jefe_inmediato,
                telefono_jefe: formData.telefono_jefe,
                cargo_jefe: formData.cargo_jefe,
                objetivo_prueba: formData.objetivo_prueba
            },
            secciones_texto: {
                metodologia: formData.metodologia,
                descripcion_proceso_productivo: formData.descripcion_proceso_productivo,
                concepto_prueba_trabajo: formData.concepto_prueba_trabajo
            },
            tareas,
            materiales_equipos: materiales,
            peligros,
            estado: finalizar ? 'completada' : 'borrador'
        };
    };
    const [validationModal, setValidationModal] = useState({ isOpen: false, title: '', message: '', errors: [] as string[], type: 'error' as 'error' | 'success' });

    useEffect(() => {
        if (id && token) {
            const fetchData = async () => {
                try {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Error al cargar');
                    const data = await res.json();

                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        fecha_valoracion: data.fecha_valoracion?.split('T')[0] || prev.fecha_valoracion,
                        fecha_nacimiento: data.fecha_nacimiento?.split('T')[0] || prev.fecha_nacimiento,
                    }));

                    if (data.tareas) setTareas(data.tareas);
                    if (data.materiales) setMateriales(data.materiales);
                    if (data.peligros) setPeligros(data.peligros);
                    if (data.finalizado && data.pdf_url) {
                        setDownloadUrl(data.pdf_url);
                        // setShowDownloadModal(true); // Don't auto-show modal on load
                    }
                } catch (e) {
                    toast.error('Error cargando datos');
                }
            };
            fetchData();
        }
    }, [id, token, API_URL]);

    const validateStep = (step: number) => {
        if (readOnly) return true;

        let errors: string[] = [];

        switch (step) {
            case 1:
                if (!formData.fecha_valoracion) errors.push('Fecha de Valoración');
                if (!formData.nombre_trabajador) errors.push('Nombre del Trabajador');
                if (!formData.tipo_documento) errors.push('Tipo de Documento');
                if (!formData.numero_documento) errors.push('Número de Documento');
                if (!formData.id_siniestro) errors.push('ID Siniestro');
                break;
            case 2:
                if (!formData.metodologia) errors.push('Metodología');
                if (!formData.descripcion_proceso_productivo) errors.push('Descripción del Proceso Productivo');
                break;
            case 3:
                const validTareas = tareas.filter(t => t.actividad.trim() !== '');
                if (validTareas.length === 0) errors.push('Debe registrar al menos una tarea con actividad');
                const invalidTareas = tareas.some(t => !t.actividad || !t.frecuencia || !t.tiempo);
                if (invalidTareas) errors.push('Complete todos los campos de las tareas (Actividad, Frecuencia, Tiempo)');
                break;
            case 4:
                // No strict validation for materials/peligros unless specified
                break;
            case 5:
                if (!formData.concepto_prueba_trabajo) errors.push('Concepto de la Prueba de Trabajo');
                break;
        }

        if (errors.length > 0) {
            setValidationModal({
                isOpen: true,
                title: 'Campos Requeridos',
                message: '',
                errors: errors,
                type: 'error'
            });
            return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(STEPS.length, prev + 1));
        }
    };

    const handleSave = async (finalizar = false) => {
        if (finalizar && !validateStep(currentStep)) return;

        if (!API_URL) {
            setValidationModal({
                isOpen: true,
                title: 'Error de Configuración',
                message: 'La URL de la API no está definida. Por favor verifique las variables de entorno.',
                errors: [],
                type: 'error'
            });
            return;
        }

        setSaving(true);
        try {
            const payload = buildPayload(finalizar);
            console.log('Iniciando guardado...', { API_URL, pruebaId, finalizar, payload });

            if (finalizar) {
                let saveId = pruebaId;
                if (!saveId) {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({ detail: 'Error al crear' }));
                        throw new Error(err.detail || JSON.stringify(err));
                    }
                    const d = await res.json();
                    saveId = d.id;
                    setPruebaId(d.id);
                } else {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${saveId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({ detail: 'Error al actualizar' }));
                        throw new Error(err.detail || JSON.stringify(err));
                    }
                }
                const finRes = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${saveId}/finalizar`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({}),
                });
                if (!finRes.ok) {
                    const err = await finRes.json().catch(() => ({ detail: 'Error al finalizar' }));
                    throw new Error(err.detail || JSON.stringify(err));
                }
                const finData = await finRes.json();
                setDownloadUrl(finData.pdf_url);
                setShowDownloadModal(true);
            } else {
                if (pruebaId) {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${pruebaId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({ detail: 'Error al guardar' }));
                        throw new Error(err.detail || JSON.stringify(err));
                    }
                    setValidationModal({ isOpen: true, title: 'Guardado', message: 'Se ha guardado el borrador correctamente.', errors: [], type: 'success' });
                } else {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) {
                        const err = await res.json().catch(() => ({ detail: 'Error al crear' }));
                        throw new Error(err.detail || JSON.stringify(err));
                    }
                    const d = await res.json();
                    setPruebaId(d.id);
                    setValidationModal({ isOpen: true, title: 'Creado', message: 'Se ha creado la prueba correctamente.', errors: [], type: 'success' });
                }
            }

        } catch (e: any) {
            setValidationModal({ isOpen: true, title: 'Error', message: e.message, errors: [], type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-left mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    {mode === 'create' ? 'Nueva Prueba de Trabajo' : 'Editar Prueba de Trabajo'}
                </h1>
                <p className="text-slate-600 mt-2">Complete el formulario de evaluación paso a paso</p>
            </div>

            {/* Stepper (Orange Theme) */}
            <div className="flex items-start justify-between relative mb-12 px-4">
                {/* Connecting Lines */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-20" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;

                    return (
                        <div key={step.id} className="flex flex-col items-center relative z-10">
                            <button
                                onClick={() => setCurrentStep(step.id)}
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

                {currentStep === 1 && (
                    <Step1Identificacion
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 2 && (
                    <Step2MetodologiaCondiciones
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 3 && (
                    <Step3Tareas
                        tareas={tareas}
                        setTareas={setTareas}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 4 && (
                    <Step4MaterialesPeligros
                        materiales={materiales}
                        setMateriales={setMateriales}
                        peligros={peligros}
                        setPeligros={setPeligros}
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 5 && (
                    <Step5ConceptoRegistro
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}
            </div>

            {/* ── Navigation bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>

                <div className="flex items-center gap-3">
                    {downloadUrl && (
                        <a
                            href={`${API_URL}${downloadUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            <Download className="h-4 w-4" /> PDF Actual
                        </a>
                    )}
                    {!readOnly && (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Cambios
                            </button>
                            {currentStep === STEPS.length && (
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Finalizar y Regenerar PDF
                                </button>
                            )}
                        </>
                    )}

                    <button
                        onClick={handleNext}
                        disabled={currentStep === STEPS.length}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        Siguiente <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <BlurValidationModal
                isOpen={validationModal.isOpen}
                onClose={() => setValidationModal(prev => ({ ...prev, isOpen: false }))}
                title={validationModal.title}
                message={validationModal.message}
                errors={validationModal.errors}
                type={validationModal.type}
            />

            {/* Download modal */}
            {
                showDownloadModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
                            <div className="text-center">
                                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-gray-800 mb-2">¡Prueba Finalizada!</h3>
                                <p className="text-sm text-gray-500 mb-4">El PDF ha sido generado exitosamente.</p>
                                <div className="flex gap-2">
                                    <a
                                        href={`${API_URL}${downloadUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                                    >
                                        <Download className="h-4 w-4" /> Descargar PDF
                                    </a>
                                    <button
                                        onClick={() => { setShowDownloadModal(false); router.push('/dashboard/formatos-to/pruebas-trabajo'); }}
                                        className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Volver a Lista
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
