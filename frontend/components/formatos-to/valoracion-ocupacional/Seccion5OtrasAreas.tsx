import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    5. Evaluación Otras Áreas Ocupacionales
                </h3>

                <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                        <Label>Cuidado Personal</Label>
                        <Textarea
                            value={data?.evaluacion_otras_areas?.cuidado_personal || ''}
                            onChange={(e) => handleAreasChange('cuidado_personal', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa si el trabajador requiere asistencia, es independiente, o experimenta dolor/dificultad para el cuidado personal..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Comunicación</Label>
                        <Textarea
                            value={data?.evaluacion_otras_areas?.comunicacion || ''}
                            onChange={(e) => handleAreasChange('comunicacion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa el nivel de independencia del trabajador en la comunicación y si presenta barreras..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Movilidad</Label>
                        <Textarea
                            value={data?.evaluacion_otras_areas?.movilidad || ''}
                            onChange={(e) => handleAreasChange('movilidad', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa el estado de movilidad, traslados, marcha, etc."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Aprendizaje / Sensopercepción</Label>
                        <Textarea
                            value={data?.evaluacion_otras_areas?.aprendizaje_sensopercepcion || ''}
                            onChange={(e) => handleAreasChange('aprendizaje_sensopercepcion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa las capacidades de aprendizaje y de sensopercepción evidenciadas..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vida Doméstica</Label>
                        <Textarea
                            value={data?.evaluacion_otras_areas?.vida_domestica || ''}
                            onChange={(e) => handleAreasChange('vida_domestica', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa la capacidad del trabajador para realizar o participar en tareas del hogar..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
