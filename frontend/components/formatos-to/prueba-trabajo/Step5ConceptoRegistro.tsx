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
                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                    COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS
                </div>
                <FormRow noBorderBottom>
                    <FormTextarea
                        className="min-h-[100px]"
                        value={formData.concepto_prueba_trabajo}
                        onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>
            </FormSection>

            <FormSection title="8. RECOMENDACIONES">
                <div className="grid grid-cols-2">
                    <div className="border-r border-gray-800">
                        <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                            PARA EL TRABAJADOR
                        </div>
                        <FormTextarea
                            className="min-h-[100px] border-none"
                            value={formData.para_trabajador}
                            onChange={(e) => updateField('para_trabajador', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                    <div>
                        <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                            PARA LA EMPRESA
                        </div>
                        <FormTextarea
                            className="min-h-[100px] border-none"
                            value={formData.para_empresa}
                            onChange={(e) => updateField('para_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </FormSection>

            <FormSection title="9. REGISTRO">
                <div className="grid grid-cols-3">
                    {/* Elaboró */}
                    <div className="border-r border-gray-800">
                        <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                            ELABORÓ
                        </div>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="NOMBRE" className="w-16 font-bold bg-[#FCE4D6]" />
                            <FormInput
                                value={formData.nombre_elaboro}
                                onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <div className="h-24 border-b border-gray-800 flex items-end justify-center pb-2 bg-white">
                            <span className="text-xs text-gray-400">Firma</span>
                            {/* Placeholder for signature or image if needed later */}
                        </div>
                        <FormRow noBorderBottom>
                            <FormField label="Licencia S.O" className="w-24 font-bold bg-[#FCE4D6]" />
                            {/* Assuming license is fixed or part of user profile, leaving input for now or could be readOnly */}
                            <div className="w-full"></div>
                        </FormRow>
                    </div>

                    {/* Revisó */}
                    <div className="border-r border-gray-800">
                        <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                            REVISÓ
                        </div>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="NOMBRE" className="w-16 font-bold bg-[#FCE4D6]" />
                            <FormInput
                                value={formData.nombre_revisor}
                                onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <div className="h-24 border-b border-gray-800 flex items-end justify-center pb-2 bg-white">
                            <span className="text-xs text-gray-400">Firma</span>
                        </div>
                        <FormRow noBorderBottom>
                            <FormField label="Licencia S.O" className="w-24 font-bold bg-[#FCE4D6]" />
                            <div className="w-full"></div>
                        </FormRow>
                    </div>

                    {/* Proveedor / Trabajador */}
                    <div>
                        <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase text-center">
                            DATOS DEL USUARIO
                        </div>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="NOMBRE" className="w-16 font-bold bg-[#FCE4D6]" />
                            <FormInput
                                value={formData.nombre_trabajador} // Read only mapping from step 1
                                disabled={true}
                            />
                        </FormRow>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="C.C" className="w-16 font-bold bg-[#FCE4D6]" />
                            <FormInput
                                value={formData.numero_documento} // Read only mapping from step 1
                                disabled={true}
                            />
                        </FormRow>
                        <div className="h-16 flex items-end justify-center pb-2 bg-white">
                            <span className="text-xs text-gray-400">Firma</span>
                        </div>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};
