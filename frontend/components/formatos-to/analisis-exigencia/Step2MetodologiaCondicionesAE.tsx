import React from 'react';
import { FormSection, FormField, FormTextarea, FormInput } from '../prueba-trabajo/FormComponents';

interface Step2AEProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step2MetodologiaCondicionesAE = ({ formData, updateField, readOnly }: Step2AEProps) => {
    return (
        <div className="space-y-8">
            {/* 2. METODOLOGIA */}
            <FormSection title="2. METODOLOGÍA">
                <FormField>
                    <FormTextarea
                        className="min-h-[120px]"
                        value={formData.metodologia}
                        onChange={(e) => updateField('metodologia', e.target.value)}
                        disabled={readOnly}
                        placeholder="Describa la metodología utilizada..."
                    />
                </FormField>
            </FormSection>

            {/* 3. CONDICIONES DE TRABAJO -> 3.1 REQUERIMIENTOS DEL DESEMPEÑO ORGANIZACIONAL */}
            <FormSection title="3. CONDICIONES DE TRABAJO">
                <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-700 uppercase mb-4 pl-1 border-l-4 border-blue-500">
                        3.1 REQUERIMIENTOS DEL DESEMPEÑO ORGANIZACIONAL
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg border border-slate-100">
                        <FormField label="Turnos">
                            <FormInput
                                value={formData.turnos}
                                onChange={(e) => updateField('turnos', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Rotaciones">
                            <FormInput
                                value={formData.rotaciones}
                                onChange={(e) => updateField('rotaciones', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Distribución Semanal">
                            <FormInput
                                value={formData.distribucion_semanal}
                                onChange={(e) => updateField('distribucion_semanal', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Jornada">
                            <FormInput
                                value={formData.jornada}
                                onChange={(e) => updateField('jornada', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Descansos Programados">
                            <FormInput
                                value={formData.descansos_programados}
                                onChange={(e) => updateField('descansos_programados', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Tiempos efectivos en la jornada laboral">
                            <FormInput
                                value={formData.tiempos_efectivos}
                                onChange={(e) => updateField('tiempos_efectivos', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Horas Extras">
                            <FormInput
                                value={formData.horas_extras}
                                onChange={(e) => updateField('horas_extras', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                        <FormField label="Ritmo">
                            <FormInput
                                value={formData.ritmo}
                                onChange={(e) => updateField('ritmo', e.target.value)}
                                disabled={readOnly}
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>
        </div>
    );
};
