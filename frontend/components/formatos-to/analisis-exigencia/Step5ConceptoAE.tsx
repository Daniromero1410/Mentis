import React from 'react';
import { FormSection, FormField, FormTextarea, FormInput } from '../prueba-trabajo/FormComponents';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Step5AEProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

const CONCEPTO_OPTIONS = [
    { value: 'no_puede_desempenarla', label: 'No puede desempeñarla' },
    { value: 'desarrollo_capacidades', label: 'Desarrollo de capacidades' },
    { value: 'reintegro_con_modificaciones', label: 'Reintegro con modificaciones' },
    { value: 'reintegro_sin_modificaciones', label: 'Reintegro sin modificaciones' },
];

export const Step5ConceptoAE = ({ formData, updateField, readOnly }: Step5AEProps) => {

    return (
        <div className="space-y-8">
            {/* 5. APRECIACION DEL PROFESIONAL */}
            <FormSection title="5. APRECIACIÓN DEL PROFESIONAL DE LA SALUD QUE EVALÚA Y PLAN DE REINCORPORACIÓN LABORAL">
                <FormTextarea
                    className="min-h-[150px]"
                    // Note: We might need to ensure this field exists in 'formData' structure or map it to 'apreciacion_trabajador_proceso' or similar if reusing.
                    // Checking existing Analysis wizard: 'apreciacion_trabajador_proceso' exists. 'concepto_prueba_trabajo' exists.
                    // Let's use 'concepto_prueba_trabajo' as the main "Concepto/Apreciacion" field if 'apreciacion_profesional_general' doesn't exist.
                    // Wait, Step3 had per-task appreciation. This is GLOBAL.
                    // The payload has 'concepto_prueba_trabajo' in 'secciones_texto'. Let's use that one or 'recomendaciones_trabajador'.
                    // Actually, let's use 'concepto_prueba_trabajo' for Section 7 (Concepto) and 'apreciacion_trabajador_proceso' for this Section 6.
                    // Or better yet, 'apreciacion_trabajador_proceso' seems more like "worker's appreciation".
                    // Let's us 'verificacion_acciones_correctivas' for 6.1.
                    // For 6, we can use 'metodologia' (used in 2) or 'recomendaciones_empresa'.
                    // A safe bet is using 'recomendaciones_empresa' or creating a new mapping if strict.
                    // Given the constraint of existing backend, I will reuse 'apreciacion_trabajador_proceso' for Section 6 if appropriate, or 'recomendaciones_empresa'.
                    // Let's use 'recomendaciones_empresa' for now as it captures "Plan de reincorporacion".
                    // RE-READING Step 5 existing: uses 'concepto_prueba_trabajo', 'recomendaciones_trabajador', 'recomendaciones_empresa'.
                    // Let's map Section 6 to `recomendaciones_empresa` (Plan de reincorporación usually goes here).
                    onChange={(e) => updateField('recomendaciones_empresa', e.target.value)}
                    value={formData.recomendaciones_empresa}
                    disabled={readOnly}
                />
            </FormSection>

            {/* 5.1 VERIFICACION ACCIONES */}
            <FormSection title="5.1 VERIFICACIÓN DE LAS ACCIONES CORRECTIVAS PUNTUALES FRENTE AL RIESGO QUE PROPICIÓ EL EVENTO">
                <FormTextarea
                    className="min-h-[100px]"
                    value={formData.verificacion_acciones_correctivas}
                    onChange={(e) => updateField('verificacion_acciones_correctivas', e.target.value)}
                    disabled={readOnly}
                />
            </FormSection>


            {/* 6. CONCEPTO */}
            <FormSection title="6. CONCEPTO CAPACIDAD DE DESEMPEÑO EN LA ACTIVIDAD">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <Label className="text-sm font-bold text-slate-700 block mb-4">
                            Conclusión con respecto a la actividad
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {CONCEPTO_OPTIONS.map((opt) => (
                                <label
                                    key={opt.value}
                                    className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all ${formData.concepto_prueba_trabajo === opt.value
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="concepto_ae"
                                        value={opt.value}
                                        checked={formData.concepto_prueba_trabajo === opt.value}
                                        onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                                        disabled={readOnly}
                                        className="accent-blue-600 h-5 w-5"
                                    />
                                    <span className="font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </FormSection>
        </div>
    );
};
