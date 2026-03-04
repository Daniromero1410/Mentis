import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent } from '@/components/ui/card';

interface Seccion5Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion5OtrasAreas({ data, updateData, readOnly = false }: Seccion5Props) {
    const handleAreasChange = (field: string, value: any) => {
        updateData('evaluacion_otras_areas', field, value);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* EVALUACIÓN OTRAS ÁREAS OCUPACIONALES */}
            <FormSection title="10. Evaluación Otras Áreas Ocupacionales">
                <div className="mb-6">
                    <div className="grid grid-cols-1 gap-6">
                        <FormField label="Cuidado Personal">
                            <FormTextarea
                                value={data?.evaluacion_otras_areas?.cuidado_personal || ''}
                                onChange={(e) => handleAreasChange('cuidado_personal', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa si el trabajador requiere asistencia, es independiente, o experimenta dolor/dificultad para el cuidado personal..."
                                className="min-h-[80px]"
                            />
                        </FormField>

                        <FormField label="Comunicación">
                            <FormTextarea
                                value={data?.evaluacion_otras_areas?.comunicacion || ''}
                                onChange={(e) => handleAreasChange('comunicacion', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa el nivel de independencia del trabajador en la comunicación y si presenta barreras..."
                                className="min-h-[80px]"
                            />
                        </FormField>

                        <FormField label="Movilidad">
                            <FormTextarea
                                value={data?.evaluacion_otras_areas?.movilidad || ''}
                                onChange={(e) => handleAreasChange('movilidad', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa el estado de movilidad, traslados, marcha, etc."
                                className="min-h-[80px]"
                            />
                        </FormField>

                        <FormField label="Aprendizaje / Sensopercepción">
                            <FormTextarea
                                value={data?.evaluacion_otras_areas?.aprendizaje_sensopercepcion || ''}
                                onChange={(e) => handleAreasChange('aprendizaje_sensopercepcion', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa las capacidades de aprendizaje y de sensopercepción evidenciadas..."
                                className="min-h-[80px]"
                            />
                        </FormField>

                        <FormField label="Vida Doméstica">
                            <FormTextarea
                                value={data?.evaluacion_otras_areas?.vida_domestica || ''}
                                onChange={(e) => handleAreasChange('vida_domestica', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa la capacidad del trabajador para realizar o participar en tareas del hogar..."
                                className="min-h-[80px]"
                            />
                        </FormField>
                    </div>
                </div>
            </FormSection>
        </div>
    );
}
