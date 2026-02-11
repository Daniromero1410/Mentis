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
                <FormRow>
                    <FormField label="3.1 DESCRIPCIÓN DEL PROCESO PRODUCTIVO" className="w-full" col noBorderRight>
                        <FormTextarea
                            className="min-h-[80px]"
                            value={formData.descripcion_proceso_productivo}
                            onChange={(e) => updateField('descripcion_proceso_productivo', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </FormRow>

                <FormRow>
                    <FormField label="3.2 APRECIACIÓN DEL TRABAJADOR FRENTE A SU PROCESO PRODUCTIVO" className="w-full" col noBorderRight>
                        <FormTextarea
                            className="min-h-[60px]"
                            value={formData.apreciacion_trabajador_proceso}
                            onChange={(e) => updateField('apreciacion_trabajador_proceso', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </FormRow>

                <FormRow>
                    <FormField label="3.3 ESTÁNDARES DE PRODUCTIVIDAD ESTABLECIDO POR LA EMPRESA" className="w-full" col noBorderRight>
                        <FormTextarea
                            className="min-h-[60px]"
                            value={formData.estandares_productividad}
                            onChange={(e) => updateField('estandares_productividad', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </FormRow>

                <div className="mt-4 border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-slate-50 px-3 py-2 border-b border-gray-200">
                        <span className="text-xs font-bold text-slate-700 uppercase">3.4 REQUERIMIENTOS DEL DESEMPEÑO ORGANIZACIONAL</span>
                    </div>

                    {/* Grid for 3.4 */}
                    <div className="grid grid-cols-2">
                        {/* Column 1 */}
                        <div className="border-r border-gray-200">
                            <FormRow>
                                <FormField label="Jornada" className="w-1/3" />
                                <FormInput
                                    value={formData.jornada}
                                    onChange={(e) => updateField('jornada', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                            <FormRow>
                                <FormField label="Descansos programados" className="w-1/3" />
                                <FormInput
                                    value={formData.descansos_programados}
                                    onChange={(e) => updateField('descansos_programados', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                            <FormRow>
                                <FormField label="Tiempos efectivos en jornada" className="w-1/3" />
                                <FormInput
                                    value={formData.tiempos_efectivos}
                                    onChange={(e) => updateField('tiempos_efectivos', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                            <FormRow noBorderBottom>
                                <FormField label="Horas extras" className="w-1/3" />
                                <FormInput
                                    value={formData.horas_extras}
                                    onChange={(e) => updateField('horas_extras', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                        </div>

                        {/* Column 2 */}
                        <div>
                            <FormRow>
                                <FormField label="Ritmo" className="w-1/3" />
                                <FormInput
                                    value={formData.ritmo}
                                    onChange={(e) => updateField('ritmo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                            <FormRow>
                                <FormField label="Turnos" className="w-1/3" />
                                <FormInput
                                    value={formData.turnos}
                                    onChange={(e) => updateField('turnos', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                            <FormRow>
                                <FormField label="Rotaciones" className="w-1/3" />
                                <FormInput
                                    value={formData.rotaciones}
                                    onChange={(e) => updateField('rotaciones', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                            <FormRow noBorderBottom>
                                <FormField label="Distribución semanal" className="w-1/3" />
                                <FormInput
                                    value={formData.distribucion_semanal}
                                    onChange={(e) => updateField('distribucion_semanal', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormRow>
                        </div>
                    </div>
                </div>

            </FormSection>
        </div>
    );
};
