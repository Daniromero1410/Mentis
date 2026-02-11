'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { toast } from 'sonner';
import {
    Save, ChevronLeft, ChevronRight, Download, Loader2,
    Plus, Trash2, CheckCircle2, FileText, User, Briefcase,
    ClipboardList, Shield
} from 'lucide-react';
import { Step1Identificacion } from './prueba-trabajo/Step1Identificacion';
import { Step2MetodologiaCondiciones } from './prueba-trabajo/Step2MetodologiaCondiciones';
import { Step3Tareas } from './prueba-trabajo/Step3Tareas';
import { Step4MaterialesPeligros } from './prueba-trabajo/Step4MaterialesPeligros';
import { Step5ConceptoRegistro } from './prueba-trabajo/Step5ConceptoRegistro';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://mentis-production.up.railway.app';

interface PruebaTrabajoTOWizardProps {
    mode: 'create' | 'edit' | 'view';
    id?: number | null;
    readOnly?: boolean;
}

// ── Categorías de peligro fijas ──────────────────────────────────────
const CATEGORIAS_PELIGRO = [
    { value: 'fisicos', label: 'Físicos' },
    { value: 'biologicos', label: 'Biológicos' },
    { value: 'biomecanicos', label: 'Biomecánicos' },
    { value: 'psicosociales', label: 'Psicosociales' },
    { value: 'quimicos', label: 'Químicos' },
    { value: 'cond_seguridad', label: 'Cond. Seguridad' },
];

const CONCLUSION_OPTIONS = [
    { value: 'reintegro_sin_modificaciones', label: 'Reintegro sin modificaciones' },
    { value: 'reintegro_con_modificaciones', label: 'Reintegro con modificaciones' },
    { value: 'desarrollo_capacidades', label: 'Desarrollo de capacidades' },
    { value: 'no_puede_desempenarla', label: 'No puede desempeñarla' },
];

const NIVEL_EDUCATIVO_OPTIONS = [
    { value: 'formacion_empirica', label: 'Formación empírica' },
    { value: 'basica_primaria', label: 'Básica primaria' },
    { value: 'bachillerato_vocacional', label: 'Bachillerato vocacional 9°' },
    { value: 'bachillerato_modalidad', label: 'Bachillerato modalidad' },
    { value: 'tecnico_tecnologico', label: 'Técnico/Tecnológico' },
    { value: 'profesional', label: 'Profesional' },
    { value: 'especializacion_postgrado', label: 'Especialización/Postgrado/Maestría' },
    { value: 'formacion_informal', label: 'Formación informal oficios' },
    { value: 'analfabeta', label: 'Analfabeta' },
    { value: 'otros', label: 'Otros' },
];

// ── Initial data ────────────────────────────────────────────────────
const emptyTarea = () => ({
    actividad: '', ciclo: '', subactividad: '', estandar_productividad: '',
    registro_fotografico: '', descripcion_biomecanica: '', apreciacion_trabajador: '',
    apreciacion_profesional: '', conclusion: '', descripcion_conclusion: '', orden: 0,
});

const emptyMaterial = () => ({
    nombre: '', descripcion: '', requerimientos_operacion: '', observaciones: '', orden: 0,
});

const initialFormData = {
    // Identificación
    fecha_valoracion: '', ultimo_dia_incapacidad: '', nombre_trabajador: '',
    numero_documento: '', id_siniestro: '', fecha_nacimiento: '', edad: '',
    dominancia: '', estado_civil: '', nivel_educativo: '', telefonos_trabajador: '',
    direccion_residencia: '', diagnosticos_atel: '', fechas_eventos_atel: '',
    eps_ips: '', afp: '', tiempo_incapacidad_dias: '', empresa: '', nit_empresa: '',
    cargo_actual: '', cargo_unico: '', area_seccion: '', fecha_ingreso_cargo: '',
    antiguedad_cargo: '', fecha_ingreso_empresa: '', antiguedad_empresa: '',
    forma_vinculacion: '', modalidad: '', tiempo_modalidad: '', contacto_empresa: '',
    correos_electronicos: '', telefonos_empresa: '', direccion_empresa: '',
    // Secciones texto
    metodologia: '', descripcion_proceso_productivo: '', apreciacion_trabajador_proceso: '',
    estandares_productividad: '', verificacion_acciones_correctivas: '', concepto_prueba_trabajo: '',
    // Desempeño organizacional
    jornada: '', ritmo: '', descansos_programados: '', turnos: '',
    tiempos_efectivos: '', rotaciones: '', horas_extras: '', distribucion_semanal: '',
    // Recomendaciones
    para_trabajador: '', para_empresa: '',
    // Registro
    nombre_elaboro: '', firma_elaboro: '', nombre_revisor: '', firma_revisor: '', nombre_proveedor: '',
};

// ── Steps ───────────────────────────────────────────────────────────
const STEPS = [
    { id: 1, title: 'Identificación', icon: User, desc: 'Datos del trabajador y empresa' },
    { id: 2, title: 'Metodología y Condiciones', icon: ClipboardList, desc: 'Metodología y condiciones de trabajo' },
    { id: 3, title: 'Tareas', icon: Briefcase, desc: 'Requerimientos por tarea' },
    { id: 4, title: 'Materiales y Peligros', icon: Shield, desc: 'Equipos, herramientas y peligros' },
    { id: 5, title: 'Concepto y Registro', icon: FileText, desc: 'Conclusiones, recomendaciones y firmas' },
];


export function PruebaTrabajoTOWizard({ mode, id, readOnly = false }: PruebaTrabajoTOWizardProps) {
    const router = useRouter();
    const { token } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ ...initialFormData });
    const [tareas, setTareas] = useState([emptyTarea()]);
    const [materiales, setMateriales] = useState([emptyMaterial()]);
    const [peligros, setPeligros] = useState(
        CATEGORIAS_PELIGRO.map(c => ({ categoria: c.value, descripcion: '', tipos_control_existente: '', recomendaciones_control: '' }))
    );
    const [pruebaId, setPruebaId] = useState<number | null>(id || null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');

    // ── Load existing data ────────────────────────────────────────────
    useEffect(() => {
        if (!pruebaId || mode === 'create') return;
        setLoading(true);
        fetch(`${API_URL}/formatos-to/pruebas-trabajo/${pruebaId}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => { if (!r.ok) throw new Error('Error'); return r.json(); })
            .then(data => {
                const i = data.identificacion || {};
                const s = data.secciones_texto || {};
                const d = data.desempeno_organizacional || {};
                const rec = data.recomendaciones || {};
                const reg = data.registro || {};
                setFormData({
                    ...initialFormData,
                    ...Object.fromEntries(Object.entries(i).filter(([_, v]) => v !== null).map(([k, v]) => [k, String(v)])),
                    ...Object.fromEntries(Object.entries(s).filter(([_, v]) => v !== null).map(([k, v]) => [k, String(v)])),
                    ...Object.fromEntries(Object.entries(d).filter(([_, v]) => v !== null).map(([k, v]) => [k, String(v)])),
                    para_trabajador: rec.para_trabajador || '', para_empresa: rec.para_empresa || '',
                    nombre_elaboro: reg.nombre_elaboro || '', nombre_revisor: reg.nombre_revisor || '',
                    nombre_proveedor: reg.nombre_proveedor || '',
                    firma_elaboro: reg.firma_elaboro || '', firma_revisor: reg.firma_revisor || '',
                });
                if (data.tareas?.length) setTareas(data.tareas);
                if (data.materiales_equipos?.length) setMateriales(data.materiales_equipos);
                if (data.peligros?.length) setPeligros(data.peligros);
            })
            .catch(e => toast.error(e.message))
            .finally(() => setLoading(false));
    }, [pruebaId]);

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ── Build payload ─────────────────────────────────────────────────
    const buildPayload = (finalizar = false) => ({
        estado: finalizar ? 'completada' : 'borrador',
        identificacion: {
            fecha_valoracion: formData.fecha_valoracion || null,
            ultimo_dia_incapacidad: formData.ultimo_dia_incapacidad || null,
            nombre_trabajador: formData.nombre_trabajador || null,
            numero_documento: formData.numero_documento || null,
            id_siniestro: formData.id_siniestro || null,
            fecha_nacimiento: formData.fecha_nacimiento || null,
            edad: formData.edad ? parseInt(formData.edad) : null,
            dominancia: formData.dominancia || null,
            estado_civil: formData.estado_civil || null,
            nivel_educativo: formData.nivel_educativo || null,
            telefonos_trabajador: formData.telefonos_trabajador || null,
            direccion_residencia: formData.direccion_residencia || null,
            diagnosticos_atel: formData.diagnosticos_atel || null,
            fechas_eventos_atel: formData.fechas_eventos_atel || null,
            eps_ips: formData.eps_ips || null,
            afp: formData.afp || null,
            tiempo_incapacidad_dias: formData.tiempo_incapacidad_dias ? parseInt(formData.tiempo_incapacidad_dias) : null,
            empresa: formData.empresa || null,
            nit_empresa: formData.nit_empresa || null,
            cargo_actual: formData.cargo_actual || null,
            cargo_unico: formData.cargo_unico === 'true' ? true : formData.cargo_unico === 'false' ? false : null,
            area_seccion: formData.area_seccion || null,
            fecha_ingreso_cargo: formData.fecha_ingreso_cargo || null,
            antiguedad_cargo: formData.antiguedad_cargo || null,
            fecha_ingreso_empresa: formData.fecha_ingreso_empresa || null,
            antiguedad_empresa: formData.antiguedad_empresa || null,
            forma_vinculacion: formData.forma_vinculacion || null,
            modalidad: formData.modalidad || null,
            tiempo_modalidad: formData.tiempo_modalidad || null,
            contacto_empresa: formData.contacto_empresa || null,
            correos_electronicos: formData.correos_electronicos || null,
            telefonos_empresa: formData.telefonos_empresa || null,
            direccion_empresa: formData.direccion_empresa || null,
        },
        secciones_texto: {
            metodologia: formData.metodologia || null,
            descripcion_proceso_productivo: formData.descripcion_proceso_productivo || null,
            apreciacion_trabajador_proceso: formData.apreciacion_trabajador_proceso || null,
            estandares_productividad: formData.estandares_productividad || null,
            verificacion_acciones_correctivas: formData.verificacion_acciones_correctivas || null,
            concepto_prueba_trabajo: formData.concepto_prueba_trabajo || null,
        },
        desempeno_organizacional: {
            jornada: formData.jornada || null,
            ritmo: formData.ritmo || null,
            descansos_programados: formData.descansos_programados || null,
            turnos: formData.turnos || null,
            tiempos_efectivos: formData.tiempos_efectivos || null,
            rotaciones: formData.rotaciones || null,
            horas_extras: formData.horas_extras || null,
            distribucion_semanal: formData.distribucion_semanal || null,
        },
        tareas: tareas.filter(t => t.actividad || t.subactividad),
        materiales_equipos: materiales.filter(m => m.nombre),
        peligros: peligros,
        recomendaciones: {
            para_trabajador: formData.para_trabajador || null,
            para_empresa: formData.para_empresa || null,
        },
        registro: {
            nombre_elaboro: formData.nombre_elaboro || null,
            firma_elaboro: formData.firma_elaboro || null,
            nombre_revisor: formData.nombre_revisor || null,
            firma_revisor: formData.firma_revisor || null,
            nombre_proveedor: formData.nombre_proveedor || null,
        },
    });

    // ── Save ──────────────────────────────────────────────────────────
    const handleSave = async (finalizar = false) => {
        setSaving(true);
        try {
            const payload = buildPayload(finalizar);

            if (finalizar) {
                let saveId = pruebaId;
                if (!saveId) {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error('Error al crear');
                    const d = await res.json();
                    saveId = d.id;
                    setPruebaId(d.id);
                } else {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${saveId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error('Error al actualizar');
                }
                const finRes = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${saveId}/finalizar`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({}),
                });
                if (!finRes.ok) throw new Error('Error al finalizar');
                const finData = await finRes.json();
                setDownloadUrl(finData.pdf_url);
                setShowDownloadModal(true);
                toast.success('Prueba finalizada exitosamente');
            } else {
                if (pruebaId) {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${pruebaId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error('Error al guardar');
                    toast.success('Guardado correctamente');
                } else {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error('Error al crear');
                    const d = await res.json();
                    setPruebaId(d.id);
                    toast.success('Prueba creada exitosamente');
                }
            }
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSaving(false);
        }
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    {mode === 'create' ? 'Nueva Prueba de Trabajo TO' : mode === 'edit' ? 'Editar Prueba' : 'Detalle Prueba'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">Formato de Terapia Ocupacional — Positiva S.A.</p>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
                {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    return (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(step.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' :
                                    isCompleted ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                            <span className="hidden sm:inline">{step.title}</span>
                            <span className="sm:hidden">{step.id}</span>
                        </button>
                    );
                })}
            </div>

            {/* Form content */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                {/* ── STEP 1: Identificación ───────────────────────────────── */}
                {currentStep === 1 && (
                    <Step1Identificacion
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {/* ── STEP 2: Metodología y Condiciones ────────────────────── */}
                {currentStep === 2 && (
                    <Step2MetodologiaCondiciones
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}

                {/* ── STEP 3: Tareas ───────────────────────────────────────── */}
                {currentStep === 3 && (
                    <Step3Tareas
                        tareas={tareas}
                        setTareas={setTareas}
                        readOnly={readOnly}
                    />
                )}

                {/* ── STEP 4: Materiales y Peligros ────────────────────────── */}
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

                {/* ── STEP 5: Concepto y Registro ──────────────────────────── */}
                {currentStep === 5 && (
                    <Step5ConceptoRegistro
                        formData={formData}
                        updateField={updateField}
                        readOnly={readOnly}
                    />
                )}
            </div>

            {/* ── Navigation bar ─────────────────────────────────────────── */}
            <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" /> Anterior
                </button>

                <div className="flex items-center gap-2">
                    {!readOnly && (
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Guardar Borrador
                            </button>
                            {currentStep === STEPS.length && (
                                <button
                                    onClick={() => handleSave(true)}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                    Finalizar y Generar PDF
                                </button>
                            )}
                        </>
                    )}
                </div>

                <button
                    onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
                    disabled={currentStep === STEPS.length}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Siguiente <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Download modal */}
            {showDownloadModal && (
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
            )}
        </div>
    );
}
