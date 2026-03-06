import { Input } from '@/components/ui/input';
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FormSection title="4. Descripción Actividad Laboral Actual (antes del evento)">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Información de la Actividad</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

                            <FormField label="Nombre del cargo">
                                <FormInput
                                    value={data?.actividad_actual?.nombre_cargo || ''}
                                    onChange={(e) => handleActividadChange('nombre_cargo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Antigüedad en el cargo">
                                <FormInput
                                    value={data?.actividad_actual?.antiguedad_cargo || ''}
                                    onChange={(e) => handleActividadChange('antiguedad_cargo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Tareas (nombre y descripcion):" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.actividad_actual?.tareas_descripcion || ''}
                                    onChange={(e) => handleActividadChange('tareas_descripcion', e.target.value)}
                                    disabled={readOnly}
                                    className="min-h-[100px]"
                                />
                            </FormField>

                            <FormField label="Herramientas de trabajo:" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.actividad_actual?.herramientas_trabajo || ''}
                                    onChange={(e) => handleActividadChange('herramientas_trabajo', e.target.value)}
                                    disabled={readOnly}
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Horario de trabajo:">
                                <FormTextarea
                                    value={data?.actividad_actual?.horario_trabajo || ''}
                                    onChange={(e) => handleActividadChange('horario_trabajo', e.target.value)}
                                    disabled={readOnly}
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Elementos de Proteccion Personal:">
                                <FormTextarea
                                    value={data?.actividad_actual?.elementos_proteccion || ''}
                                    onChange={(e) => handleActividadChange('elementos_proteccion', e.target.value)}
                                    disabled={readOnly}
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Requerimientos motrices de la actividad (con base en la información suministrada por el usuario):" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.actividad_actual?.requerimientos_motrices || ''}
                                    onChange={(e) => handleActividadChange('requerimientos_motrices', e.target.value)}
                                    disabled={readOnly}
                                    className="min-h-[100px]"
                                />
                            </FormField>

                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Ocurrencia del ATEL</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex flex-col gap-4">
                                <div className="flex gap-x-8 gap-y-4 flex-wrap items-center">
                                    <span className="text-sm font-semibold text-slate-700 min-w-[150px]">PUESTO DE TRABAJO</span>
                                    <div className="flex gap-4">
                                        {[{ val: 'si', label: 'SI' }, { val: 'no', label: 'NO' }].map((opt) => (
                                            <label key={opt.val} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="ocurrencia_puesto"
                                                    value={opt.val}
                                                    checked={
                                                        opt.val === 'si'
                                                            ? data?.actividad_actual?.ocurrencia_atel_puesto === true
                                                            : data?.actividad_actual?.ocurrencia_atel_puesto === false
                                                    }
                                                    onChange={() => handleActividadChange('ocurrencia_atel_puesto', opt.val === 'si')}
                                                    disabled={readOnly}
                                                    className="accent-blue-600 h-4 w-4"
                                                />
                                                {opt.label}
                                            </label>
                                        ))}
                                    </div>

                                    <div className="h-6 w-px bg-slate-300 mx-2 hidden md:block"></div>

                                    <span className="text-sm font-semibold text-slate-700 min-w-[60px]">AREA</span>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {/* Paper has "NO" and "OTRO" here logic-wise this probably means "Area? NO" and "Area? OTRO (which one?)" OR in area / other area. Let's make it intuitive */}
                                        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!data?.actividad_actual?.ocurrencia_atel_area}
                                                onChange={(e) => handleActividadChange('ocurrencia_atel_area', e.target.checked)}
                                                disabled={readOnly}
                                                className="accent-blue-600 h-4 w-4"
                                            />
                                            NO (fuera del área)
                                        </label>

                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">OTRO:</span>
                                            <Input
                                                value={data?.actividad_actual?.ocurrencia_atel_otro || ''}
                                                onChange={(e) => handleActividadChange('ocurrencia_atel_otro', e.target.value)}
                                                disabled={readOnly}
                                                className="h-8 md:w-64"
                                                placeholder="..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
}
