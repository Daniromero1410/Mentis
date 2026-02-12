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

// ... (keep imports)

export function PruebaTrabajoTOWizard({ mode, id, readOnly = false }: PruebaTrabajoTOWizardProps) {
    // ... (keep existing state)
    const [validationModal, setValidationModal] = useState({ isOpen: false, title: '', message: '', type: 'error' as 'error' | 'success' });

    // ... (keep existing useEffects and functions)

    const validateStep = (step: number) => {
        if (readOnly) return true;
        let isValid = true;
        let message = '';

        switch (step) {
            case 1:
                if (!formData.fecha_valoracion) { isValid = false; message = 'La fecha de valoración es requerida.'; }
                else if (!formData.nombre_trabajador) { isValid = false; message = 'El nombre del trabajador es requerido.'; }
                else if (!formData.numero_documento) { isValid = false; message = 'El número de documento es requerido.'; }
                else if (!formData.id_siniestro) { isValid = false; message = 'El ID del siniestro es requerido.'; }
                break;
            case 2:
                if (!formData.metodologia) { isValid = false; message = 'La metodología es requerida.'; }
                else if (!formData.descripcion_proceso_productivo) { isValid = false; message = 'La descripción del proceso productivo es requerida.'; }
                break;
            case 3:
                const validTareas = tareas.filter(t => t.actividad.trim() !== '');
                if (validTareas.length === 0) { isValid = false; message = 'Debe registrar al menos una tarea con actividad.'; }
                break;
            case 4:
                // No strict validation for materials/peligros unless specified
                break;
            case 5:
                if (!formData.concepto_prueba_trabajo) { isValid = false; message = 'El concepto de la prueba de trabajo es requerido.'; }
                break;
        }

        if (!isValid) {
            setValidationModal({
                isOpen: true,
                title: 'Campos Incompletos',
                message: message,
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

        setSaving(true);
        try {
            const payload = buildPayload(finalizar);

            // ... (keep API logic)
            if (finalizar) {
                // ... logic for finalize
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
            } else {
                // Logic for save draft
                if (pruebaId) {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/${pruebaId}`, {
                        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error('Error al guardar');
                    setValidationModal({ isOpen: true, title: 'Guardado', message: 'Se ha guardado el borrador correctamente.', type: 'success' });
                } else {
                    const res = await fetch(`${API_URL}/formatos-to/pruebas-trabajo/`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                        body: JSON.stringify(payload),
                    });
                    if (!res.ok) throw new Error('Error al crear');
                    const d = await res.json();
                    setPruebaId(d.id);
                    setValidationModal({ isOpen: true, title: 'Creado', message: 'Se ha creado la prueba correctamente.', type: 'success' });
                }
            }

        } catch (e: any) {
            setValidationModal({ isOpen: true, title: 'Error', message: e.message, type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // ... (render)

    {/* Stepper (Orange Theme) */ }
    <div className="flex items-start justify-between relative mb-12 px-4">
        {/* Connecting Lines */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-20" />
        <div
            className="absolute top-5 left-0 h-0.5 bg-orange-500 -z-10 transition-all duration-500 ease-in-out"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            // const isUpcoming = currentStep < step.id; // Unused

            return (
                <div key={step.id} className="flex flex-col items-center relative z-10">
                    <button
                        onClick={() => {
                            if (readOnly || step.id < currentStep) setCurrentStep(step.id);
                            // Prevent jumping forward without validation if not readonly
                        }}
                        className={`
                                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 bg-white
                                    ${isActive
                                ? 'border-orange-500 text-orange-500 shadow-lg scale-110'
                                : isCompleted
                                    ? 'border-orange-500 bg-orange-500 text-white'
                                    : 'border-gray-300 text-gray-500 hover:border-gray-400'
                            }
                                `}
                    >
                        <StepIcon className="h-5 w-5" />
                    </button>
                    <div className={`mt-3 text-center transition-all duration-300 ${isActive ? 'text-orange-600 font-bold' : 'text-gray-500'}`}>
                        <span className="text-xs font-semibold block whitespace-nowrap">{step.title}</span>
                    </div>
                </div>
            );
        })}
    </div>

    {/* ... (Form Content) */ }

    {/* ── Navigation bar ─────────────────────────────────────────── */ }
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
                        <>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-60 transition-colors shadow-sm"
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
                type={validationModal.type}
            />

    {/* Download modal (keep existing) */ }
        </div >
    );
}
