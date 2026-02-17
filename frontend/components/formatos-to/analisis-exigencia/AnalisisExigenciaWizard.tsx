'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sileo';
import {
    Save, ChevronLeft, ChevronRight, Loader2,
    FileText, User, Briefcase,
    Activity, AlertTriangle
} from 'lucide-react';
import { BlurValidationModal } from '../BlurValidationModal';

import { Step1IdentificacionAE } from './Step1IdentificacionAE';
import { Step2MetodologiaCondicionesAE } from './Step2MetodologiaCondicionesAE';
import { Step3RequerimientosAE } from './Step3RequerimientosAE';
import { Step4PeligrosAE, CATEGORIAS_PELIGRO_AE } from './Step4PeligrosAE';
import { Step5ConceptoAE } from './Step5ConceptoAE';
import { Step6PerfilExigenciasAE } from './Step6PerfilExigenciasAE';
import { Step7RegistroAE } from './Step7RegistroAE';

const STEPS = [
    { id: 1, title: 'Identificación', icon: User },
    { id: 2, title: 'Metodología', icon: Briefcase },
    { id: 3, title: 'Requerimientos', icon: Activity },
    { id: 4, title: 'Peligros', icon: AlertTriangle },
    { id: 5, title: 'Concepto', icon: FileText },
    { id: 6, title: 'Perfil de Exigencias', icon: Activity },
    { id: 7, title: 'Registro', icon: FileText }
];

interface AnalisisExigenciaWizardProps {
    mode: 'create' | 'edit' | 'view';
    id?: number;
    readOnly?: boolean;
}

export function AnalisisExigenciaWizard({ mode, id, readOnly = false }: AnalisisExigenciaWizardProps) {
    const { token } = useAuth();
    const router = useRouter();
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [currentStep, setCurrentStep] = useState(1);
    const [analisisId, setAnalisisId] = useState<number | null>(id || null);
    const [saving, setSaving] = useState(false);

    const [perfilExigencias, setPerfilExigencias] = useState<any>({});

    // Estados para validación de pasos
    const [stepsCompleted, setStepsCompleted] = useState<boolean[]>([false, false, false, false, false, false, false]);

    const [formData, setFormData] = useState({
        fecha_valoracion: new Date().toISOString().split('T')[0],
        nombre_trabajador: '',
        tipo_documento: '',
        numero_documento: '',
        id_siniestro: '',
        fecha_nacimiento: '',
        edad: '',
        genero: '',
        nivel_educativo: '',
        cargo_actual: '',
        antiguedad_cargo: '',
        antiguedad_empresa: '',
        telefonos_trabajador: '',
        direccion_residencia: '',
        dominancia: '',
        estado_civil: '',
        diagnosticos_atel: '',
        fechas_eventos_atel: '',
        eps_ips: '',
        afp: '',
        tiempo_incapacidad_dias: '',
        nit_empresa: '',
        cargo_unico: '',
        area_seccion: '',
        fecha_ingreso_cargo: '',
        fecha_ingreso_empresa: '',
        forma_vinculacion: '',
        modalidad: '',
        tiempo_modalidad: '',
        correos_electronicos: '',
        direccion_empresa: '',
        empresa: '',
        contacto_empresa: '',
        telefonos_empresa: '',
        cargo_jefe: '',
        objetivo_prueba: '',
        metodologia: '',
        descripcion_proceso_productivo: '',
        concepto_prueba_trabajo: '',
        relaciones_interpersonales: '',
        apreciacion_trabajador_proceso: '',
        estandares_productividad: '',
        verificacion_acciones_correctivas: '',
        jornada: '',
        ritmo: '',
        descansos_programados: '',
        turnos: '',
        tiempos_efectivos: '',
        rotaciones: '',
        horas_extras: '',
        distribucion_semanal: '',
        recomendaciones_trabajador: '',
        recomendaciones_empresa: '',
        nombre_elaboro: '',
        firma_elaboro: '',
        licencia_so_elaboro: '',
        nombre_revisor: '',
        firma_revisor: '',
        licencia_so_revisor: '',
        nombre_proveedor: '',
        firma_trabajador: '',
        ultimo_dia_incapacidad: '',
    });

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const [tareas, setTareas] = useState<any[]>([{
        id: 1, actividad: '', ciclo: '', subactividad: '', estandar_productividad: '',
        registro_fotografico: '', descripcion_biomecanica: '', requerimientos_motrices: '',
        apreciacion_trabajador: '', apreciacion_profesional: '',
        conclusion: '', descripcion_conclusion: '', orden: 0,
    }]);
    const [materiales, setMateriales] = useState<any[]>([]);
    const [peligros, setPeligros] = useState<any[]>(
        CATEGORIAS_PELIGRO_AE.map(cat => ({
            categoria: cat.value,
            descripcion: '',
            tipos_control_existente: '',
            recomendaciones_control: ''
        }))
    );

    const buildPayload = (finalizar: boolean) => {
        return {
            identificacion: {
                fecha_valoracion: formData.fecha_valoracion || null,
                ultimo_dia_incapacidad: formData.ultimo_dia_incapacidad || null,
                nombre_trabajador: formData.nombre_trabajador,
                tipo_documento: formData.tipo_documento,
                numero_documento: formData.numero_documento,
                id_siniestro: formData.id_siniestro,
                fecha_nacimiento: formData.fecha_nacimiento || null,
                edad: formData.edad ? parseInt(formData.edad) : null,
                dominancia: formData.dominancia,
                estado_civil: formData.estado_civil,
                nivel_educativo: formData.nivel_educativo,
                telefonos_trabajador: formData.telefonos_trabajador,
                direccion_residencia: formData.direccion_residencia,
                diagnosticos_atel: formData.diagnosticos_atel,
                fechas_eventos_atel: formData.fechas_eventos_atel,
                eps_ips: formData.eps_ips,
                afp: formData.afp,
                tiempo_incapacidad_dias: formData.tiempo_incapacidad_dias ? parseInt(formData.tiempo_incapacidad_dias) : null,
                empresa: formData.empresa,
                nit_empresa: formData.nit_empresa,
                cargo_actual: formData.cargo_actual,
                cargo_unico: formData.cargo_unico === 'Si',
                area_seccion: formData.area_seccion,
                fecha_ingreso_cargo: formData.fecha_ingreso_cargo || null,
                antiguedad_cargo: formData.antiguedad_cargo,
                fecha_ingreso_empresa: formData.fecha_ingreso_empresa || null,
                antiguedad_empresa: formData.antiguedad_empresa,
                forma_vinculacion: formData.forma_vinculacion,
                modalidad: formData.modalidad,
                tiempo_modalidad: formData.tiempo_modalidad,
                contacto_empresa: formData.contacto_empresa,
                correos_electronicos: formData.correos_electronicos,
                telefonos_empresa: formData.telefonos_empresa,
                direccion_empresa: formData.direccion_empresa
            },
            secciones_texto: {
                metodologia: formData.metodologia,
                descripcion_proceso_productivo: formData.descripcion_proceso_productivo,
                concepto_prueba_trabajo: formData.concepto_prueba_trabajo,
                relaciones_interpersonales: formData.relaciones_interpersonales,
                apreciacion_trabajador_proceso: formData.apreciacion_trabajador_proceso,
                estandares_productividad: formData.estandares_productividad,
                verificacion_acciones_correctivas: formData.verificacion_acciones_correctivas
            },
            desempeno_organizacional: {
                jornada: formData.jornada,
                ritmo: formData.ritmo,
                descansos_programados: formData.descansos_programados,
                turnos: formData.turnos,
                tiempos_efectivos: formData.tiempos_efectivos,
                rotaciones: formData.rotaciones,
                horas_extras: formData.horas_extras,
                distribucion_semanal: formData.distribucion_semanal
            },
            tareas: tareas.map(t => ({ ...t, orden: t.orden || 0 })),
            materiales_equipos: materiales.map(m => ({ ...m, orden: m.orden || 0 })),
            peligros: peligros,
            recomendaciones: {
                para_trabajador: formData.recomendaciones_trabajador,
                para_empresa: formData.recomendaciones_empresa
            },
            perfil_exigencias: perfilExigencias,
            registro: {
                nombre_elaboro: formData.nombre_elaboro,
                firma_elaboro: formData.firma_elaboro,
                licencia_so_elaboro: formData.licencia_so_elaboro,
                nombre_revisor: formData.nombre_revisor,
                firma_revisor: formData.firma_revisor,
                licencia_so_revisor: formData.licencia_so_revisor,
                nombre_proveedor: formData.nombre_proveedor,
                firma_trabajador: formData.firma_trabajador
            },
            estado: finalizar ? 'completada' : 'borrador'
        };
    };

    const [validationModal, setValidationModal] = useState({ isOpen: false, title: '', message: '', errors: [] as string[], type: 'error' as 'error' | 'success' });

    useEffect(() => {
        if (id && token) {
            const fetchData = async () => {
                try {
                    const res = await fetch(`${API_URL}/formatos-to/analisis-exigencia/${id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (!res.ok) throw new Error('Error al cargar');
                    const data = await res.json();

                    setFormData(prev => ({
                        ...prev,
                        ...data,
                        // Identificacion
                        fecha_valoracion: data.identificacion?.fecha_valoracion?.split('T')[0] || prev.fecha_valoracion,
                        ultimo_dia_incapacidad: data.identificacion?.ultimo_dia_incapacidad?.split('T')[0] || prev.ultimo_dia_incapacidad,
                        nombre_trabajador: data.identificacion?.nombre_trabajador || prev.nombre_trabajador,
                        tipo_documento: data.identificacion?.tipo_documento || prev.tipo_documento,
                        numero_documento: data.identificacion?.numero_documento || prev.numero_documento,
                        id_siniestro: data.identificacion?.id_siniestro || prev.id_siniestro,
                        fecha_nacimiento: data.identificacion?.fecha_nacimiento?.split('T')[0] || prev.fecha_nacimiento,
                        edad: data.identificacion?.edad?.toString() || prev.edad,
                        dominancia: data.identificacion?.dominancia || prev.dominancia,
                        genero: data.identificacion?.genero || prev.genero,
                        estado_civil: data.identificacion?.estado_civil || prev.estado_civil,
                        nivel_educativo: data.identificacion?.nivel_educativo || prev.nivel_educativo,
                        cargo_actual: data.identificacion?.cargo_actual || prev.cargo_actual,
                        antiguedad_cargo: data.identificacion?.antiguedad_cargo || prev.antiguedad_cargo,
                        antiguedad_empresa: data.identificacion?.antiguedad_empresa || prev.antiguedad_empresa,
                        telefonos_trabajador: data.identificacion?.telefonos_trabajador || prev.telefonos_trabajador,
                        direccion_residencia: data.identificacion?.direccion_residencia || prev.direccion_residencia,
                        diagnosticos_atel: data.identificacion?.diagnosticos_atel || prev.diagnosticos_atel,
                        fechas_eventos_atel: data.identificacion?.fechas_eventos_atel || prev.fechas_eventos_atel,
                        eps_ips: data.identificacion?.eps_ips || prev.eps_ips,
                        afp: data.identificacion?.afp || prev.afp,
                        tiempo_incapacidad_dias: data.identificacion?.tiempo_incapacidad_dias?.toString() || prev.tiempo_incapacidad_dias,
                        empresa: data.identificacion?.empresa || prev.empresa,
                        nit_empresa: data.identificacion?.nit_empresa || prev.nit_empresa,
                        cargo_unico: data.identificacion?.cargo_unico ? 'Si' : 'No',
                        area_seccion: data.identificacion?.area_seccion || prev.area_seccion,
                        fecha_ingreso_cargo: data.identificacion?.fecha_ingreso_cargo?.split('T')[0] || prev.fecha_ingreso_cargo,
                        fecha_ingreso_empresa: data.identificacion?.fecha_ingreso_empresa?.split('T')[0] || prev.fecha_ingreso_empresa,
                        forma_vinculacion: data.identificacion?.forma_vinculacion || prev.forma_vinculacion,
                        modalidad: data.identificacion?.modalidad || prev.modalidad,
                        tiempo_modalidad: data.identificacion?.tiempo_modalidad || prev.tiempo_modalidad,
                        contacto_empresa: data.identificacion?.contacto_empresa || prev.contacto_empresa,
                        correos_electronicos: data.identificacion?.correos_electronicos || prev.correos_electronicos,
                        telefonos_empresa: data.identificacion?.telefonos_empresa || prev.telefonos_empresa,
                        direccion_empresa: data.identificacion?.direccion_empresa || prev.direccion_empresa,
                        objetivo_prueba: data.identificacion?.objetivo_prueba || prev.objetivo_prueba,

                        // Secciones Texto
                        metodologia: data.secciones_texto?.metodologia || prev.metodologia,
                        descripcion_proceso_productivo: data.secciones_texto?.descripcion_proceso_productivo || prev.descripcion_proceso_productivo,
                        concepto_prueba_trabajo: data.secciones_texto?.concepto_prueba_trabajo || prev.concepto_prueba_trabajo,
                        relaciones_interpersonales: data.secciones_texto?.relaciones_interpersonales || prev.relaciones_interpersonales,
                        apreciacion_trabajador_proceso: data.secciones_texto?.apreciacion_trabajador_proceso || prev.apreciacion_trabajador_proceso,
                        estandares_productividad: data.secciones_texto?.estandares_productividad || prev.estandares_productividad,
                        verificacion_acciones_correctivas: data.secciones_texto?.verificacion_acciones_correctivas || prev.verificacion_acciones_correctivas,

                        // Desempeno Organizacional
                        jornada: data.desempeno_organizacional?.jornada || prev.jornada,
                        ritmo: data.desempeno_organizacional?.ritmo || prev.ritmo,
                        descansos_programados: data.desempeno_organizacional?.descansos_programados || prev.descansos_programados,
                        turnos: data.desempeno_organizacional?.turnos || prev.turnos,
                        tiempos_efectivos: data.desempeno_organizacional?.tiempos_efectivos || prev.tiempos_efectivos,
                        rotaciones: data.desempeno_organizacional?.rotaciones || prev.rotaciones,
                        horas_extras: data.desempeno_organizacional?.horas_extras || prev.horas_extras,
                        distribucion_semanal: data.desempeno_organizacional?.distribucion_semanal || prev.distribucion_semanal,

                        // Recomendaciones & Registro
                        recomendaciones_trabajador: data.recomendaciones?.para_trabajador || prev.recomendaciones_trabajador,
                        recomendaciones_empresa: data.recomendaciones?.para_empresa || prev.recomendaciones_empresa,
                        nombre_elaboro: data.registro?.nombre_elaboro || prev.nombre_elaboro,
                        firma_elaboro: data.registro?.firma_elaboro || prev.firma_elaboro,
                        licencia_so_elaboro: data.registro?.licencia_so_elaboro || prev.licencia_so_elaboro,
                        nombre_revisor: data.registro?.nombre_revisor || prev.nombre_revisor,
                        firma_revisor: data.registro?.firma_revisor || prev.firma_revisor,
                        licencia_so_revisor: data.registro?.licencia_so_revisor || prev.licencia_so_revisor,
                        nombre_proveedor: data.registro?.nombre_proveedor || prev.nombre_proveedor,
                        firma_trabajador: data.registro?.firma_trabajador || prev.firma_trabajador,
                    }));

                    if (data.tareas && data.tareas.length > 0) setTareas(data.tareas);
                    if (data.materiales_equipos) setMateriales(data.materiales_equipos);
                    if (data.perfil_exigencias) setPerfilExigencias(data.perfil_exigencias);
                    if (data.peligros) {
                        const mergedPeligros = CATEGORIAS_PELIGRO_AE.map(cat => {
                            const existing = data.peligros.find((p: any) => p.categoria === cat.value);
                            return existing || {
                                categoria: cat.value,
                                descripcion: '',
                                tipos_control_existente: '',
                                recomendaciones_control: ''
                            };
                        });
                        setPeligros(mergedPeligros);
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
                const invalidTareas = tareas.some(t => !t.actividad || !t.ciclo || !t.subactividad || !t.estandar_productividad);
                if (invalidTareas) errors.push('Complete todos los campos obligatorios de las tareas (Actividad, Ciclo, Subactividad, Estándar)');
                break;
            case 4:
                break;
            case 5:
                if (!formData.concepto_prueba_trabajo) errors.push('Concepto del Análisis de Exigencia');
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

            if (analisisId) {
                const res = await fetch(`${API_URL}/formatos-to/analisis-exigencia/${analisisId}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({ detail: 'Error al guardar' }));
                    throw new Error(JSON.stringify(err));
                }
                setValidationModal({ isOpen: true, title: 'Guardado', message: 'Se ha guardado el borrador correctamente.', errors: [], type: 'success' });
            } else {
                const res = await fetch(`${API_URL}/formatos-to/analisis-exigencia/`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({ detail: 'Error al crear' }));
                    throw new Error(JSON.stringify(err));
                }
                const d = await res.json();
                setAnalisisId(d.id);
                setValidationModal({ isOpen: true, title: 'Creado', message: 'Se ha creado el análisis correctamente.', errors: [], type: 'success' });
            }

        } catch (e: any) {
            console.error('Error in handleSave:', e);
            let errorMessage = e.message;
            let errorDetails = '';

            try {
                const parsed = JSON.parse(errorMessage);
                if (parsed.detail && Array.isArray(parsed.detail)) {
                    errorMessage = 'Datos inválidos/faltantes';
                    errorDetails = parsed.detail.map((err: any) =>
                        `${err.loc ? err.loc[err.loc.length - 1] + ': ' : ''}${err.msg}`
                    ).join('\n');
                } else if (parsed.detail) {
                    errorMessage = parsed.detail;
                }
            } catch (ignore) { }

            toast.error(`${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-left mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    {mode === 'create' ? 'Nuevo Análisis de Exigencia' : mode === 'view' ? 'Ver Análisis de Exigencia' : 'Editar Análisis de Exigencia'}
                </h1>
                <p className="text-slate-600 mt-2">Complete el formulario de análisis paso a paso</p>
            </div>

            {/* Stepper */}
            <div className="flex items-start justify-between relative mb-12 px-4">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-20" />
                <div
                    className="absolute top-5 left-0 h-0.5 bg-blue-600 -z-10 transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                />

                {STEPS.map((step) => {
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
                    <Step1IdentificacionAE
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 2 && (
                    <Step2MetodologiaCondicionesAE
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 3 && (
                    <Step3RequerimientosAE
                        tareas={tareas}
                        setTareas={setTareas}
                        materiales={materiales}
                        setMateriales={setMateriales}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 4 && (
                    <Step4PeligrosAE
                        peligros={peligros}
                        setPeligros={setPeligros}
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 5 && (
                    <Step5ConceptoAE
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 6 && (
                    <Step6PerfilExigenciasAE
                        perfil={perfilExigencias}
                        setPerfil={setPerfilExigencias}
                        readOnly={readOnly}
                    />
                )}

                {currentStep === 7 && (
                    <Step7RegistroAE
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}
            </div>

            {/* Navigation bar */}
            <div className="flex items-center justify-between mt-6">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>

                <div className="flex items-center gap-3">
                    {!readOnly && (
                        <button
                            onClick={() => handleSave(false)}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Guardar Cambios
                        </button>
                    )}

                    {currentStep !== STEPS.length && (
                        <button
                            onClick={handleNext}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            Siguiente <ChevronRight className="h-4 w-4" />
                        </button>
                    )}
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

        </div>
    );
}
