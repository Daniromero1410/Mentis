import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';

interface Step5Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step5ConceptoRegistro = ({ formData, updateField, readOnly }: Step5Props) => {
    return (
        <div className="space-y-6">
            <FormSection title="7. CONCEPTO PARA PRUEBA DE TRABAJO">
                <FormRow noBorderBottom>
                    <FormField label="COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS" className="w-full" col noBorderRight>
                        <FormTextarea
                            className="min-h-[100px]"
                            value={formData.concepto_prueba_trabajo}
                            onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </FormRow>
            </FormSection>

            <FormSection title="8. RECOMENDACIONES">
                <div className="grid grid-cols-2">
                    <div className="border-r border-gray-200">
                        <FormField label="PARA EL TRABAJADOR" className="w-full" col noBorderRight>
                            <FormTextarea
                                className="min-h-[120px]"
                                value={formData.para_trabajador}
                                onChange={(e) => updateField('para_trabajador', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                    </div>
                    <div>
                        <FormField label="PARA LA EMPRESA" className="w-full" col noBorderRight>
                            <FormTextarea
                                className="min-h-[120px]" // Increased height
                                value={formData.para_empresa}
                                onChange={(e) => updateField('para_empresa', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>

            <FormSection title="9. REGISTRO">
                <div className="grid grid-cols-3">
                    {/* Elaboró */}
                    <div className="border-r border-gray-200">
                        <div className="bg-slate-50 border-b border-gray-200 px-3 py-2 text-xs font-bold uppercase text-center text-slate-700">
                            ELABORÓ
                        </div>
                        <FormRow className="border-b border-gray-200">
                            <FormField label="NOMBRE" className="w-[30%]" />
                            <FormInput
                                value={formData.nombre_elaboro}
                                onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <div className="h-28 border-b border-gray-200 flex items-end justify-center pb-2 bg-white">
                            {/* Space for signature */}
                        </div>
                        <FormRow noBorderBottom>
                            <FormField label="Licencia S.O" className="w-[40%]" />
                            {/* Spacer or input */}
                        </FormRow>
                    </div>

                    {/* Revisó */}
                    <div className="border-r border-gray-200">
                        <div className="bg-slate-50 border-b border-gray-200 px-3 py-2 text-xs font-bold uppercase text-center text-slate-700">
                            REVISÓ
                        </div>
                        <FormRow className="border-b border-gray-200">
                            <FormField label="NOMBRE" className="w-[30%]" />
                            <FormInput
                                value={formData.nombre_revisor}
                                onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <div className="h-28 border-b border-gray-200 flex items-end justify-center pb-2 bg-white">
                            {/* Space for signature */}
                        </div>
                        <FormRow noBorderBottom>
                            <FormField label="Licencia S.O" className="w-[40%]" />
                        </FormRow>
                    </div>

                    {/* Proveedor / Trabajador */}
                    <div>
                        <div className="bg-slate-50 border-b border-gray-200 px-3 py-2 text-xs font-bold uppercase text-center text-slate-700">
                            DATOS DEL USUARIO
                        </div>
                        <FormRow className="border-b border-gray-200">
                            <FormField label="NOMBRE" className="w-[30%]" />
                            <FormInput
                                value={formData.nombre_trabajador} // Read only mapping from step 1
                                disabled={true}
                            />
                        </FormRow>
                        <FormRow className="border-b border-gray-200">
                            <FormField label="C.C" className="w-[30%]" />
                            <FormInput
                                value={formData.numero_documento} // Read only mapping from step 1
                                disabled={true}
                            />
                        </FormRow>
                        <div className="h-20 flex items-end justify-center pb-2 bg-white">
                            <span className="text-xs text-gray-400">Firma del trabajador</span>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};
