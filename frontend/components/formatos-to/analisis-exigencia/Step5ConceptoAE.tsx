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

            {/* 6.1 VERIFICACION ACCIONES CORRECTIVAS */}
            <FormSection title="6.1 VERIFICACIÓN DE LAS ACCIONES CORRECTIVAS PUNTUALES FRENTE AL RIESGO QUE PROPICIÓ EL EVENTO">
                <FormTextarea
                    className="min-h-[100px]"
                    value={formData.verificacion_acciones_correctivas}
                    onChange={(e) => updateField('verificacion_acciones_correctivas', e.target.value)}
                    disabled={readOnly}
                />
            </FormSection>

            {/* 7. CONCEPTO */}
            <FormSection title="7. CONCEPTO PARA PRUEBA DE TRABAJO">
                <Card className="border-slate-200 shadow-sm mb-4">
                    <CardContent className="p-6">
                        <Label className="text-sm font-bold text-slate-700 block mb-4">
                            COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS
                        </Label>
                        <FormTextarea
                            className="min-h-[100px] mb-6"
                            value={formData.concepto_prueba_trabajo} // Note: This text area maps to the concept description/text
                            onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                            disabled={readOnly}
                            placeholder="Escriba el concepto detallado..."
                        />
                        {/* Does the PDF have checkboxes for this section? Actually, the PDF shows text block for section 7.
                            The checkboxes in the previous code were likely a mix-up with the per-task conclusion or a different form.
                            The PDF generator code provided shows `secciones.concepto_prueba_trabajo` as a text block.
                            So we keep it as a text area and remove the checkboxes if they are not in the PDF structure for Section 7.
                            Wait, let me double check the PDF code.
                            Line 879: elements.append(bordered_text_block(secciones.concepto_prueba_trabajo if secciones else ""))
                            Yes, it is a text block.
                        */}
                    </CardContent>
                </Card>
            </FormSection>

            {/* 8. RECOMENDACIONES */}
            <FormSection title="8. RECOMENDACIONES">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="PARA EL TRABAJADOR">
                        <FormTextarea
                            className="min-h-[150px]"
                            value={formData.recomendaciones_trabajador}
                            onChange={(e) => updateField('recomendaciones_trabajador', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                    <FormField label="PARA LA EMPRESA">
                        <FormTextarea
                            className="min-h-[150px]"
                            value={formData.recomendaciones_empresa}
                            onChange={(e) => updateField('recomendaciones_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </div>
            </FormSection>

            {/* 9. REGISTRO */}
            <FormSection title="9. REGISTRO">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 space-y-6">
                        {/* ELABORO */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">ELABORÓ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Nombre">
                                    <FormInput
                                        value={formData.nombre_elaboro}
                                        onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Licencia S.O.">
                                    <FormInput
                                        value={formData.licencia_so_elaboro}
                                        onChange={(e) => updateField('licencia_so_elaboro', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                {/* Placeholder for signature if needed later, or simple text for now */}
                            </div>
                        </div>

                        {/* REVISO */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">REVISÓ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Nombre">
                                    <FormInput
                                        value={formData.nombre_revisor}
                                        onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Licencia S.O.">
                                    <FormInput
                                        value={formData.licencia_so_revisor}
                                        onChange={(e) => updateField('licencia_so_revisor', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* DATOS DEL USUARIO (Trabajador) */}
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <h4 className="font-bold text-slate-700 mb-4 border-b pb-2">DATOS DEL USUARIO (Trabajador)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Usually read-only from Step 1 but good to show or allow confirm */}
                                <FormField label="Nombre">
                                    <FormInput
                                        value={formData.nombre_trabajador}
                                        disabled={true}
                                        className="bg-slate-100"
                                    />
                                </FormField>
                                <FormField label="Documento (C.C)">
                                    <FormInput
                                        value={formData.numero_documento}
                                        disabled={true}
                                        className="bg-slate-100"
                                    />
                                </FormField>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </FormSection>
        </div>
    );
};
