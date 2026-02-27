import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
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
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    7. Rol Laboral
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Tareas / Operaciones exigidas por el cargo</Label>
                        <Textarea
                            value={data?.rol_laboral?.tareas_operaciones || ''}
                            onChange={(e) => handleRolChange('tareas_operaciones', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa a detalle las tareas u operaciones requeridas..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Componentes del Desempeño</Label>
                        <Textarea
                            value={data?.rol_laboral?.componentes_desempeno || ''}
                            onChange={(e) => handleRolChange('componentes_desempeno', e.target.value)}
                            disabled={readOnly}
                            placeholder="Habilidades motoras, procesamiento mental, habilidades sociales, etc..."
                            className="min-h-[80px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tiempo Promedio de Ejecución</Label>
                        <Textarea
                            value={data?.rol_laboral?.tiempo_ejecucion || ''}
                            onChange={(e) => handleRolChange('tiempo_ejecucion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ej. Tiempo por tarea, ciclos..."
                            className="min-h-[60px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Forma de Integración y Adaptación al Puesto</Label>
                        <Textarea
                            value={data?.rol_laboral?.forma_integracion || ''}
                            onChange={(e) => handleRolChange('forma_integracion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Interacciones, uso de equipos, trabajo en equipo..."
                            className="min-h-[60px]"
                        />
                    </div>
                </div>
            </div>

            {/* EVENTO ATEL REHABILITACIÓN */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    8. Información Evento ATEL (Tratamiento Rehabilitación Integrado)
                </h3>

                <div className="space-y-8">
                    <div className="space-y-2">
                        <Label>1. Tratamiento o Manejos (Rehabilitación Médica y de la Salud)</Label>
                        <Textarea
                            value={data?.evento_atel?.tratamiento_rehabilitacion || ''}
                            onChange={(e) => handleEventoChange('tratamiento_rehabilitacion', e.target.value)}
                            disabled={readOnly}
                            placeholder="Describa fisioterapias, cirugías, tratamientos crónicos, psiquiatría..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-4">
                        <Label>2. Adaptación o Tipo de Ayudas Recibidas (Limitaciones del individuo)</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ml-2">
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
                                        <Label htmlFor={`adap-${opcion}`} className="font-normal cursor-pointer">
                                            {opcion}
                                        </Label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <Label className="font-semibold w-full md:w-auto md:mr-4">¿Tiene calificación para PCL?</Label>

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
                                    <Label htmlFor="pcl-si" className="cursor-pointer">Sí</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="no" id="pcl-no" />
                                    <Label htmlFor="pcl-no" className="cursor-pointer">No</Label>
                                </div>
                            </RadioGroup>

                            {data?.evento_atel?.calificacion_pcl_si && (
                                <div className="flex items-center gap-3 w-full md:w-auto md:ml-6 ml-0 animate-in fade-in">
                                    <Label>Porcentaje:</Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="100"
                                        placeholder="%"
                                        className="w-24 border-indigo-200 focus-visible:ring-indigo-500"
                                        value={data?.evento_atel?.calificacion_pcl_porcentaje || ''}
                                        onChange={(e) => handleEventoChange('calificacion_pcl_porcentaje', e.target.value)}
                                        disabled={readOnly}
                                    />
                                    <span className="text-sm font-medium text-gray-500">%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
