import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection, FormField, FormInput, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <FormSection title="7. Descripción Actividad Laboral Actual">
                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4">
                        Información del Cargo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Nombre del Cargo Actual">
                            <FormInput
                                value={data?.actividad_actual?.nombre_cargo || ''}
                                onChange={(e) => handleActividadChange('nombre_cargo', e.target.value)}
                                disabled={readOnly}
                                placeholder="Ej. Operario de máquinas..."
                            />
                        </FormField>

                        <FormField label="Antigüedad en el Cargo">
                            <FormInput
                                value={data?.actividad_actual?.antiguedad_cargo || ''}
                                onChange={(e) => handleActividadChange('antiguedad_cargo', e.target.value)}
                                disabled={readOnly}
                                placeholder="Ej. 2 años, 5 meses..."
                            />
                        </FormField>

                        <FormField label="Tareas y Descripción" className="md:col-span-2">
                            <FormTextarea
                                value={data?.actividad_actual?.tareas_descripcion || ''}
                                onChange={(e) => handleActividadChange('tareas_descripcion', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa las tareas principales del cargo..."
                                className="min-h-[100px]"
                            />
                        </FormField>

                        <FormField label="Herramientas y/o Máquinas de Trabajo" className="md:col-span-2">
                            <FormTextarea
                                value={data?.actividad_actual?.herramientas_trabajo || ''}
                                onChange={(e) => handleActividadChange('herramientas_trabajo', e.target.value)}
                                disabled={readOnly}
                                placeholder="Liste las herramientas o máquinas utilizadas..."
                                className="min-h-[60px]"
                            />
                        </FormField>

                        <FormField label="Horario de Trabajo (Turnos, horas, descanso)">
                            <FormTextarea
                                value={data?.actividad_actual?.horario_trabajo || ''}
                                onChange={(e) => handleActividadChange('horario_trabajo', e.target.value)}
                                disabled={readOnly}
                                placeholder="Ej. L-V de 8am a 5pm, 1 hora almuerzo..."
                                className="min-h-[80px]"
                            />
                        </FormField>

                        <FormField label="Elementos de Protección Personal (EPP)">
                            <FormTextarea
                                value={data?.actividad_actual?.elementos_proteccion || ''}
                                onChange={(e) => handleActividadChange('elementos_proteccion', e.target.value)}
                                disabled={readOnly}
                                placeholder="Ej. Casco, botas de seguridad, guantes..."
                                className="min-h-[80px]"
                            />
                        </FormField>

                        <FormField label="Requerimientos Motrices / Postura / Esfuerzos Físicos Relevantes (% de la Jornada)" className="md:col-span-2">
                            <FormTextarea
                                value={data?.actividad_actual?.requerimientos_motrices || ''}
                                onChange={(e) => handleActividadChange('requerimientos_motrices', e.target.value)}
                                disabled={readOnly}
                                placeholder="Describa posturas críticas, levantamiento de cargas, movimientos repetitivos..."
                                className="min-h-[100px]"
                            />
                        </FormField>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-2 mb-4 mt-6">
                        Ocurrencia del Presunto AT/EL (Accidente Trabajo / Enf. Laboral)
                    </h3>
                    <div>
                        <p className="text-sm text-gray-500 mb-4 block">Marque las opciones correspondientes a donde ocurrió el evento.</p>

                        <div className="space-y-4 max-w-xl">
                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="ocurrencia_puesto"
                                    checked={!!data?.actividad_actual?.ocurrencia_atel_puesto}
                                    onCheckedChange={(checked) => handleActividadChange('ocurrencia_atel_puesto', !!checked)}
                                    disabled={readOnly}
                                />
                                <Label htmlFor="ocurrencia_puesto" className="font-normal cursor-pointer text-slate-700">
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
                                <Label htmlFor="ocurrencia_area" className="font-normal cursor-pointer text-slate-700">
                                    En área diferente al puesto de trabajo Habitual (comisión, zona campo)
                                </Label>
                            </div>

                            <div className="flex items-start space-x-3 mt-2">
                                <Label htmlFor="ocurrencia_otro" className="pt-2 font-normal whitespace-nowrap text-slate-700">
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
            </FormSection>
        </div>
    );
}
