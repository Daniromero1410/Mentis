import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface Step5AEProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
    onGenerarRecomendaciones?: () => void;
    generandoRecomendaciones?: boolean;
}

export const Step5ConceptoAE = ({ formData, updateField, readOnly, onGenerarRecomendaciones, generandoRecomendaciones }: Step5AEProps) => {

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* 7. CONCEPTO CAPACIDAD DE DESEMPEÑO EN LA ACTIVIDAD */}
            <FormSection title="7. CONCEPTO CAPACIDAD DE DESEMPEÑO EN LA ACTIVIDAD">
                <Card className="border-slate-200 shadow-sm mb-4">
                    <CardContent className="p-6">
                        <Label className="text-sm font-bold text-slate-700 block mb-4">
                            COMPETENCIA, SEGURIDAD, CONFORT, RELACIONES SOCIALES, OTROS ASPECTOS
                        </Label>
                        <FormTextarea
                            className="min-h-[100px] mb-6"
                            value={formData.concepto_prueba_trabajo}
                            onChange={(e) => updateField('concepto_prueba_trabajo', e.target.value)}
                            disabled={readOnly}
                            placeholder="Escriba el concepto detallado..."
                        />
                    </CardContent>
                </Card>
            </FormSection>

            {/* 8. RELACIONES INTERPERSONALES */}
            <FormSection title="8. RELACIONES INTERPERSONALES">
                <FormTextarea
                    className="min-h-[100px]"
                    value={formData.relaciones_interpersonales}
                    onChange={(e) => updateField('relaciones_interpersonales', e.target.value)}
                    disabled={readOnly}
                    placeholder="Describa las relaciones interpersonales..."
                />
            </FormSection>

            {/* 9. RECOMENDACIONES */}
            <FormSection title="9. RECOMENDACIONES">
                {!readOnly && onGenerarRecomendaciones && (
                    <div className="flex justify-end mb-4">
                        <Button
                            type="button"
                            onClick={onGenerarRecomendaciones}
                            disabled={generandoRecomendaciones}
                            size="sm"
                        >
                            {generandoRecomendaciones
                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>
                                : 'Enriquecer con IA'
                            }
                        </Button>
                    </div>
                )}
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
        </div>
    );
};
