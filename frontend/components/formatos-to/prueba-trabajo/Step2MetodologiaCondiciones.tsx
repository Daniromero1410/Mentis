import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step2Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step2MetodologiaCondiciones = ({ formData, updateField, readOnly }: Step2Props) => {
    return (
        <div className="space-y-6">
            <FormSection title="2. METODOLOGÍA">
                <FormTextarea
                    className="min-h-[120px]"
                    placeholder="Describa la metodología utilizada..."
                    value={formData.metodologia}
                    onChange={(e) => updateField('metodologia', e.target.value)}
                    disabled={readOnly}
                />
            </FormSection>

            <FormSection title="3. CONDICIONES DE TRABAJO">
                <div className="space-y-6">

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">3.1 DESCRIPCIÓN DEL PROCESO PRODUCTIVO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <FormTextarea
                                className="min-h-[100px]"
                                value={formData.descripcion_proceso_productivo}
                                onChange={(e) => updateField('descripcion_proceso_productivo', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">3.2 APRECIACIÓN DEL TRABAJADOR FRENTE A SU PROCESO PRODUCTIVO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <FormTextarea
                                className="min-h-[80px]"
                                value={formData.apreciacion_trabajador_proceso}
                                onChange={(e) => updateField('apreciacion_trabajador_proceso', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">3.3 ESTÁNDARES DE PRODUCTIVIDAD ESTABLECIDO POR LA EMPRESA</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <FormTextarea
                                className="min-h-[80px]"
                                value={formData.estandares_productividad}
                                onChange={(e) => updateField('estandares_productividad', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 bg-slate-50/50">
                        <CardHeader className="py-3 border-b border-slate-100">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">
                                3.4 REQUERIMIENTOS DEL DESEMPEÑO ORGANIZACIONAL
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <FormField label="Jornada">
                                    <FormInput
                                        value={formData.jornada}
                                        onChange={(e) => updateField('jornada', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Descansos programados">
                                    <FormInput
                                        value={formData.descansos_programados}
                                        onChange={(e) => updateField('descansos_programados', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Tiempos efectivos en jornada">
                                    <FormInput
                                        value={formData.tiempos_efectivos}
                                        onChange={(e) => updateField('tiempos_efectivos', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Horas extras">
                                    <FormInput
                                        value={formData.horas_extras}
                                        onChange={(e) => updateField('horas_extras', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>

                            <div className="space-y-4">
                                <FormField label="Ritmo">
                                    <FormInput
                                        value={formData.ritmo}
                                        onChange={(e) => updateField('ritmo', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
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
                                <FormField label="Distribución semanal">
                                    <FormInput
                                        value={formData.distribucion_semanal}
                                        onChange={(e) => updateField('distribucion_semanal', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
};
