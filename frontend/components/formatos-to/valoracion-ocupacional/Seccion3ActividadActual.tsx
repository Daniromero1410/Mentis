import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface Seccion3Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion3ActividadActual({ data, updateData, readOnly = false }: Seccion3Props) {
    const handleActividadChange = (field: string, value: any) => {
        updateData('actividad_actual', field, value);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* DESCRIPCIÓN ACTIVIDAD LABORAL ACTUAL */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    6. Descripción Actividad Laboral Actual
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Nombre del Cargo Actual</Label>
                        <Input
                            value={data?.actividad_actual?.nombre_cargo || ''}
                            onChange={(e) => handleActividadChange('nombre_cargo', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ej. Operario de máquinas..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Antigüedad en el Cargo</Label>
                        <Input
                            value={data?.actividad_actual?.antiguedad_cargo || ''}
                            onChange={(e) => handleActividadChange('antiguedad_cargo', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ej. 2 años, 5 meses..."
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Tareas y Descripción</Label>
                        <Textarea
                            value={data?.actividad_actual?.tareas_descripcion || ''}
                            onChange={(e) => handleActividadChange('tareas_descripcion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa las tareas principales del cargo..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Herramientas y/o Máquinas de Trabajo</Label>
                        <Textarea
                            value={data?.actividad_actual?.herramientas_trabajo || ''}
                            onChange={(e) => handleActividadChange('herramientas_trabajo', e.target.value)}
                            disabled={readOnly}
                            placeholder="Liste las herramientas o máquinas utilizadas..."
                            className="min-h-[60px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Horario de Trabajo (Turnos, horas, descanso)</Label>
                        <Textarea
                            value={data?.actividad_actual?.horario_trabajo || ''}
                            onChange={(e) => handleActividadChange('horario_trabajo', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ej. L-V de 8am a 5pm, 1 hora almuerzo..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Elementos de Protección Personal (EPP)</Label>
                        <Textarea
                            value={data?.actividad_actual?.elementos_proteccion || ''}
                            onChange={(e) => handleActividadChange('elementos_proteccion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ej. Casco, botas de seguridad, guantes..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Requerimientos Motrices / Postura / Esfuerzos Físicos Relevantes (% de la Jornada)</Label>
                        <Textarea
                            value={data?.actividad_actual?.requerimientos_motrices || ''}
                            onChange={(e) => handleActividadChange('requerimientos_motrices', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa posturas críticas, levantamiento de cargas, movimientos repetitivos..."
                            className="min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-4">
                        Ocurrencia del Presunto AT/EL (Accidente Trabajo / Enf. Laboral)
                    </h4>
                    <p className="text-sm text-gray-500 mb-4 block">Marque las opciones correspondientes a donde ocurrió el evento.</p>

                    <div className="space-y-4 max-w-xl">
                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="ocurrencia_puesto"
                                checked={!!data?.actividad_actual?.ocurrencia_atel_puesto}
                                onCheckedChange={(checked) => handleActividadChange('ocurrencia_atel_puesto', !!checked)}
                                disabled={readOnly}
                            />
                            <Label htmlFor="ocurrencia_puesto" className="font-normal cursor-pointer">
                                En el puesto de trabajo Habitual
                            </Label>
                        </div>

                        <div className="flex items-center space-x-3">
                            <Checkbox
                                id="ocurrencia_area"
                                checked={!!data?.actividad_actual?.ocurrencia_atel_area}
                                onCheckedChange={(checked) => handleActividadChange('ocurrencia_atel_area', !!checked)}
                                disabled={readOnly}
                            />
                            <Label htmlFor="ocurrencia_area" className="font-normal cursor-pointer">
                                En área diferente al puesto de trabajo Habitual (comisión, zona campo)
                            </Label>
                        </div>

                        <div className="flex items-start space-x-3 mt-2">
                            <Label htmlFor="ocurrencia_otro" className="pt-2 font-normal whitespace-nowrap">
                                Otro. ¿Cuál?
                            </Label>
                            <Input
                                id="ocurrencia_otro"
                                value={data?.actividad_actual?.ocurrencia_atel_otro || ''}
                                onChange={(e) => handleActividadChange('ocurrencia_atel_otro', e.target.value)}
                                disabled={readOnly}
                                className="flex-1"
                                placeholder="..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
