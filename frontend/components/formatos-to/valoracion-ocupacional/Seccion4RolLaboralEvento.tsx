import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { FormSection, FormField, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

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
        "Férulas",
        "Prótesis",
        "Ayudas de marcha",
        "Lentes correctivos",
        "Audífonos",
        "Sillas de ruedas",
        "Otras",
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
            handleEventoChange('adaptaciones_recibidas', JSON.stringify(adaps.filter(item => item !== opcion)));
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* ROL LABORAL */}
            <FormSection title="8. Rol Laboral">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Responsabilidades Rol</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Tareas / Operaciones exigidas por el cargo" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.rol_laboral?.tareas_operaciones || ''}
                                    onChange={(e) => handleRolChange('tareas_operaciones', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Describa a detalle las tareas u operaciones requeridas..."
                                    className="min-h-[100px]"
                                />
                            </FormField>

                            <FormField label="Componentes del Desempeño" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.rol_laboral?.componentes_desempeno || ''}
                                    onChange={(e) => handleRolChange('componentes_desempeno', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Habilidades motoras, procesamiento mental, habilidades sociales, etc..."
                                    className="min-h-[80px]"
                                />
                            </FormField>

                            <FormField label="Tiempo Promedio de Ejecución">
                                <FormTextarea
                                    value={data?.rol_laboral?.tiempo_ejecucion || ''}
                                    onChange={(e) => handleRolChange('tiempo_ejecucion', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ej. Tiempo por tarea, ciclos..."
                                    className="min-h-[60px]"
                                />
                            </FormField>

                            <FormField label="Forma de Integración y Adaptación al Puesto">
                                <FormTextarea
                                    value={data?.rol_laboral?.forma_integracion || ''}
                                    onChange={(e) => handleRolChange('forma_integracion', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Interacciones, uso de equipos, trabajo en equipo..."
                                    className="min-h-[60px]"
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>

            {/* EVENTO ATEL REHABILITACIÓN */}
            <FormSection title="9. Información Evento ATEL (Tratamiento Rehabilitación Integrado)">
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

                                    <RadioGroup
                                        disabled={readOnly}
                                        value={data?.evento_atel?.calificacion_pcl_si ? 'si' : (data?.evento_atel?.calificacion_pcl_no ? 'no' : undefined)}
                                        onValueChange={(val) => {
                                            if (val === 'si') {
                                                handleEventoChange('calificacion_pcl_si', true);
                                                handleEventoChange('calificacion_pcl_no', false);
                                            } else {
                                                handleEventoChange('calificacion_pcl_si', false);
                                                handleEventoChange('calificacion_pcl_no', true);
                                                handleEventoChange('calificacion_pcl_porcentaje', ''); // clear percentage
                                            }
                                        }}
                                        className="flex items-center gap-6"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="si" id="pcl-si" />
                                            <Label htmlFor="pcl-si" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">Sí</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="pcl-no" />
                                            <Label htmlFor="pcl-no" className="cursor-pointer font-medium text-slate-700 dark:text-slate-300">No</Label>
                                        </div>
                                    </RadioGroup>

                                    {data?.evento_atel?.calificacion_pcl_si && (
                                        <div className="flex items-center gap-3 w-full md:w-auto md:ml-6 ml-0 animate-in fade-in">
                                            <Label className="uppercase tracking-wide text-xs text-slate-500 font-medium">Porcentaje:</Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                max="100"
                                                placeholder="%"
                                                className="w-24 border-slate-200 focus-visible:ring-blue-500 h-10"
                                                value={data?.evento_atel?.calificacion_pcl_porcentaje || ''}
                                                onChange={(e) => handleEventoChange('calificacion_pcl_porcentaje', e.target.value)}
                                                disabled={readOnly}
                                            />
                                            <span className="text-sm font-medium text-slate-500">%</span>
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
