import React from 'react';
import { FormSection, FormRow, FormField, FormTextarea, FormInput } from './FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step5Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step5ConceptoRegistro = ({ formData, updateField, readOnly }: Step5Props) => {
    return (
        <div className="space-y-6">
            <FormSection title="7. CONCEPTO PARA PRUEBA DE TRABAJO">
                <FormField label="COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS">
                    <FormTextarea
                        className="min-h-[120px]"
                        value={formData.concepto_prueba_trabajo}
                        onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                        disabled={readOnly}
                    />
                </FormField>
            </FormSection>

            <FormSection title="8. RECOMENDACIONES">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-700">PARA EL TRABAJADOR</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <FormTextarea
                                className="min-h-[150px] border-none focus-visible:ring-0 p-0 resize-none shadow-none"
                                placeholder="Escriba aquí las recomendaciones..."
                                value={formData.recomendaciones_trabajador}
                                onChange={(e) => updateField('recomendaciones_trabajador', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-3 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-sm font-bold text-slate-700">PARA LA EMPRESA</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <FormTextarea
                                className="min-h-[150px] border-none focus-visible:ring-0 p-0 resize-none shadow-none"
                                placeholder="Escriba aquí las recomendaciones..."
                                value={formData.recomendaciones_empresa}
                                onChange={(e) => updateField('recomendaciones_empresa', e.target.value)}
                                disabled={readOnly}
                            />
                        </CardContent>
                    </Card>
                </div>
            </FormSection>

            <FormSection title="9. REGISTRO">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Elaboró */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-2 border-b border-slate-100 bg-slate-50 text-center">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">ELABORÓ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <FormField label="NOMBRE">
                                <FormInput
                                    value={formData.nombre_elaboro}
                                    onChange={(e) => updateField('nombre_elaboro', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <div className="h-24 border border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs">
                                Espacio para firma
                            </div>
                            <FormField label="Licencia S.O">
                                <FormInput
                                    value=""
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Revisó */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-2 border-b border-slate-100 bg-slate-50 text-center">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">REVISÓ</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <FormField label="NOMBRE">
                                <FormInput
                                    value={formData.nombre_revisor}
                                    onChange={(e) => updateField('nombre_revisor', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                            <div className="h-24 border border-dashed border-slate-200 rounded-md flex items-center justify-center text-slate-400 text-xs">
                                Espacio para firma
                            </div>
                            <FormField label="Licencia S.O">
                                <FormInput
                                    value=""
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Datos del Usuario */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="py-2 border-b border-slate-100 bg-slate-50 text-center">
                            <CardTitle className="text-xs font-bold text-slate-700 uppercase">DATOS DEL USUARIO</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <FormField label="NOMBRE">
                                <FormInput
                                    value={formData.nombre_trabajador}
                                    disabled={true}
                                />
                            </FormField>
                            <FormField label="C.C">
                                <FormInput
                                    value={formData.numero_documento}
                                    disabled={true}
                                />
                            </FormField>
                            <div className="h-24 border border-dashed border-slate-200 rounded-md flex items-end justify-center pb-2 text-slate-400 text-xs">
                                Firma del trabajador
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
};
