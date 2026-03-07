import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Seccion4Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion4RolLaboralEvento({ data, updateData, readOnly = false }: Seccion4Props) {

    // Helper functions for easy updating
    const handleRolChange = (field: string, value: any) => {
        updateData('rol_laboral', field, value);
    };

    const handleEventoChange = (field: string, value: any) => {
        updateData('evento_atel', field, value);
    };

    // Adaptaciones / Limitaciones Checklist
    // Storing as a JSON string array in 'adaptaciones_recibidas'
    const adaptacionesOpciones = [
        "Bastón",
        "Muletas",
        "Caminador",
        "Prótesis",
        "Audífono",
        "Gafas",
        "Bastón guía",
        "Otros",
    ];

    const getAdaptaciones = (): string[] => {
        try {
            return data?.evento_atel?.adaptaciones_recibidas ? JSON.parse(data.evento_atel.adaptaciones_recibidas) : [];
        } catch {
            return [];
        }
    };

    const handleAdaptacionToggle = (opcion: string, checked: boolean) => {
        const adaps = getAdaptaciones();
        if (checked && !adaps.includes(opcion)) {
            handleEventoChange('adaptaciones_recibidas', JSON.stringify([...adaps, opcion]));
        } else if (!checked && adaps.includes(opcion)) {
            handleEventoChange('adaptaciones_recibidas', JSON.stringify(adaps.filter((item: string) => item !== opcion)));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ROL LABORAL */}
            <FormSection title="5. Rol Laboral">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">(Resultado del proceso de rhb)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Tareas y Operaciones:" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.rol_laboral?.tareas_operaciones || ''}
                                    onChange={(e) => handleRolChange('tareas_operaciones', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Describa a detalle las tareas u operaciones requeridas..."
                                    className="min-h-[100px]"
                                />
                            </FormField>

                            <FormField label="Componentes del desempeño:" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.rol_laboral?.componentes_desempeno || ''}
                                    onChange={(e) => handleRolChange('componentes_desempeno', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Habilidades motoras, procesamiento mental, habilidades sociales, etc..."
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Tiempo de Ejecución:">
                                <FormTextarea
                                    value={data?.rol_laboral?.tiempo_ejecucion || ''}
                                    onChange={(e) => handleRolChange('tiempo_ejecucion', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ej. Tiempo por tarea, ciclos..."
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Forma de integración laboral:">
                                <FormTextarea
                                    value={data?.rol_laboral?.forma_integracion || ''}
                                    onChange={(e) => handleRolChange('forma_integracion', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Interacciones, uso de equipos, trabajo en equipo..."
                                    className="min-h-[80px]"
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>

            {/* EVENTO ATEL REHABILITACIÓN */}
            <FormSection title="6. Información Evento ATEL (Tratamiento Rehabilitación Integrado)">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Rehabilitación Médica</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-8">
                            <FormField label="1. Tratamiento o Manejos (Rehabilitación Médica y de la Salud)">
                                <FormTextarea
                                    value={data?.evento_atel?.tratamiento_rehabilitacion || ''}
                                    onChange={(e) => handleEventoChange('tratamiento_rehabilitacion', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Describa fisioterapias, cirugías, tratamientos crónicos, psiquiatría..."
                                    className="min-h-[100px]"
                                />
                            </FormField>

                            <FormField label="2. Adaptación o Tipo de Ayudas Recibidas (Limitaciones del individuo)">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                    {adaptacionesOpciones.map(opcion => {
                                        const selected = getAdaptaciones();
                                        return (
                                            <div key={opcion} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`adap-${opcion}`}
                                                    disabled={readOnly}
                                                    checked={selected.includes(opcion)}
                                                    onCheckedChange={(c) => handleAdaptacionToggle(opcion, !!c)}
                                                />
                                                <label htmlFor={`adap-${opcion}`} className="font-normal cursor-pointer text-sm text-slate-700">
                                                    {opcion}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </FormField>

                            <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-full md:w-auto md:mr-4 uppercase tracking-wide">¿Tiene calificación para PCL?</Label>

                                    <div className="flex items-center gap-4">
                                        {[{ val: 'si', label: 'Sí' }, { val: 'no', label: 'No' }, { val: 'en_tramite', label: 'En trámite' }].map((opt) => (
                                            <label key={opt.val} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer border px-3 py-1 rounded-md hover:bg-slate-50 transition-colors">
                                                <input
                                                    type="radio"
                                                    name="pcl_vo"
                                                    value={opt.val}
                                                    checked={
                                                        opt.val === 'si'
                                                            ? !!data?.evento_atel?.calificacion_pcl_si
                                                            : opt.val === 'no'
                                                                ? !!data?.evento_atel?.calificacion_pcl_no
                                                                : !!data?.evento_atel?.calificacion_pcl_tramite
                                                    }
                                                    onChange={() => {
                                                        if (opt.val === 'si') {
                                                            handleEventoChange('calificacion_pcl_si', true);
                                                            handleEventoChange('calificacion_pcl_no', false);
                                                            handleEventoChange('calificacion_pcl_tramite', false);
                                                        } else if (opt.val === 'no') {
                                                            handleEventoChange('calificacion_pcl_si', false);
                                                            handleEventoChange('calificacion_pcl_no', true);
                                                            handleEventoChange('calificacion_pcl_tramite', false);
                                                            handleEventoChange('calificacion_pcl_porcentaje', '');
                                                        } else {
                                                            handleEventoChange('calificacion_pcl_si', false);
                                                            handleEventoChange('calificacion_pcl_no', false);
                                                            handleEventoChange('calificacion_pcl_tramite', true);
                                                            handleEventoChange('calificacion_pcl_porcentaje', '');
                                                        }
                                                    }}
                                                    disabled={readOnly}
                                                    className="accent-blue-600 h-4 w-4"
                                                />
                                                {opt.label}
                                            </label>
                                        ))}
                                    </div>

                                    {data?.evento_atel?.calificacion_pcl_si && (
                                        <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                            <Label className="text-sm font-medium text-slate-600 whitespace-nowrap">Porcentaje (%):</Label>
                                            <Input
                                                type="number"
                                                value={data?.evento_atel?.calificacion_pcl_porcentaje || ''}
                                                onChange={(e) => handleEventoChange('calificacion_pcl_porcentaje', e.target.value)}
                                                disabled={readOnly}
                                                className="w-24 text-center"
                                                placeholder="Ej. 15"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
}
