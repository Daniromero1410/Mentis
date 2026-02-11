import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';

interface Step2Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step2MetodologiaCondiciones = ({ formData, updateField, readOnly }: Step2Props) => {
    return (
        <div className="space-y-6">
            <FormSection title="2. METODOLOGÍA">
                <FormRow noBorderBottom>
                    <FormTextarea
                        className="min-h-[80px]"
                        value={formData.metodologia}
                        onChange={(e) => updateField('metodologia', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>
            </FormSection>

            <FormSection title="3. CONDICIONES DE TRABAJO">
                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase">
                    3.1 DESCRIPCIÓN DEL PROCESO PRODUCTIVO
                </div>
                <FormRow>
                    <FormTextarea
                        className="min-h-[80px]"
                        value={formData.descripcion_proceso_productivo}
                        onChange={(e) => updateField('descripcion_proceso_productivo', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase">
                    3.2 APRECIACIÓN DEL TRABAJADOR FRENTE A SU PROCESO PRODUCTIVO
                </div>
                <FormRow>
                    <FormTextarea
                        className="min-h-[60px]"
                        value={formData.apreciacion_trabajador_proceso}
                        onChange={(e) => updateField('apreciacion_trabajador_proceso', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase">
                    3.3 ESTÁNDARES DE PRODUCTIVIDAD ESTABLECIDO POR LA EMPRESA
                </div>
                <FormRow>
                    <FormTextarea
                        className="min-h-[60px]"
                        value={formData.estandares_productividad}
                        onChange={(e) => updateField('estandares_productividad', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold uppercase">
                    3.4 REQUERIMIENTOS DEL DESEMPEÑO ORGANIZACIONAL
                </div>

                {/* Grid for 3.4 */}
                <div className="grid grid-cols-2">
                    {/* Column 1 */}
                    <div className="border-r border-gray-800">
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Jornada" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.jornada}
                                onChange={(e) => updateField('jornada', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Descansos programados" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.descansos_programados}
                                onChange={(e) => updateField('descansos_programados', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Tiempos efectivos en la jornada laboral" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.tiempos_efectivos}
                                onChange={(e) => updateField('tiempos_efectivos', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <FormRow noBorderBottom>
                            <FormField label="Horas extras" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.horas_extras}
                                onChange={(e) => updateField('horas_extras', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                    </div>

                    {/* Column 2 */}
                    <div>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Ritmo" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.ritmo}
                                onChange={(e) => updateField('ritmo', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Turnos" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.turnos}
                                onChange={(e) => updateField('turnos', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <FormRow className="border-b border-gray-800">
                            <FormField label="Rotaciones" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.rotaciones}
                                onChange={(e) => updateField('rotaciones', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                        <FormRow noBorderBottom>
                            <FormField label="Distribución semanal" className="w-32 font-bold bg-white" />
                            <FormInput
                                value={formData.distribucion_semanal}
                                onChange={(e) => updateField('distribucion_semanal', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormRow>
                    </div>
                </div>

            </FormSection>
        </div>
    );
};
