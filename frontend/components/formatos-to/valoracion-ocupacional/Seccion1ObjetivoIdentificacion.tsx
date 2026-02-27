import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Seccion1Props {
    data: any;
    updateData: (section: string, field: string, value: any) => void;
    readOnly?: boolean;
}

export function Seccion1ObjetivoIdentificacion({ data, updateData, readOnly = false }: Seccion1Props) {
    const handleIdentificacionChange = (field: string, value: any) => {
        updateData('identificacion', field, value);
    };

    const handleSeccionesTextoChange = (field: string, value: any) => {
        updateData('secciones_texto', field, value);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* OBJETIVO DE LA VALORACIÓN */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border object-contain shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    1. Objetivo de la Valoración
                </h3>
                <div className="space-y-4">
                    <Textarea
                        value={data?.secciones_texto?.objetivo_valoracion || ''}
                        onChange={(e) => handleSeccionesTextoChange('objetivo_valoracion', e.target.value)}
                        placeholder="Describa el objetivo de la valoración..."
                        disabled={readOnly}
                        className="min-h-[100px]"
                    />
                </div>
            </div>

            {/* IDENTIFICACIÓN DEL TRABAJADOR */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border object-contain shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    2. Identificación
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Fecha de Valoración</Label>
                        <Input
                            type="date"
                            value={data?.identificacion?.fecha_valoracion || ''}
                            onChange={(e) => handleIdentificacionChange('fecha_valoracion', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nombre del Trabajador</Label>
                        <Input
                            value={data?.identificacion?.nombre_trabajador || ''}
                            onChange={(e) => handleIdentificacionChange('nombre_trabajador', e.target.value)}
                            disabled={readOnly}
                            placeholder="Nombres y apellidos"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Documento de Identidad (C.C)</Label>
                        <Input
                            value={data?.identificacion?.numero_documento || ''}
                            onChange={(e) => handleIdentificacionChange('numero_documento', e.target.value)}
                            disabled={readOnly}
                            type="number"
                        />
                    </div>

                    <div className="space-y-2 lg:col-span-3">
                        <Label>Identificación del Siniestro</Label>
                        <Input
                            value={data?.identificacion?.identificacion_siniestro || ''}
                            onChange={(e) => handleIdentificacionChange('identificacion_siniestro', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha de Nacimiento</Label>
                        <Input
                            type="date"
                            value={data?.identificacion?.fecha_nacimiento || ''}
                            onChange={(e) => handleIdentificacionChange('fecha_nacimiento', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Edad</Label>
                        <Input
                            value={data?.identificacion?.edad || ''}
                            onChange={(e) => handleIdentificacionChange('edad', parseInt(e.target.value))}
                            disabled={readOnly}
                            type="number"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Dominancia</Label>
                        <Select
                            disabled={readOnly}
                            value={data?.identificacion?.dominancia || ''}
                            onValueChange={(val) => handleIdentificacionChange('dominancia', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione dominancia" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Derecha">Derecha</SelectItem>
                                <SelectItem value="Izquierda">Izquierda</SelectItem>
                                <SelectItem value="Ambidiestra">Ambidiestra</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Estado Civil</Label>
                        <Input
                            value={data?.identificacion?.estado_civil || ''}
                            onChange={(e) => handleIdentificacionChange('estado_civil', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Nivel Educativo</Label>
                        <Input
                            value={data?.identificacion?.nivel_educativo || ''}
                            onChange={(e) => handleIdentificacionChange('nivel_educativo', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Especifique Formación</Label>
                        <Input
                            value={data?.identificacion?.especificar_formacion || ''}
                            onChange={(e) => handleIdentificacionChange('especificar_formacion', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Teléfono(s)</Label>
                        <Input
                            value={data?.identificacion?.telefonos_trabajador || ''}
                            onChange={(e) => handleIdentificacionChange('telefonos_trabajador', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Dirección</Label>
                        <Input
                            value={data?.identificacion?.direccion_residencia || ''}
                            onChange={(e) => handleIdentificacionChange('direccion_residencia', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Zona Residencial</Label>
                        <Select
                            disabled={readOnly}
                            value={data?.identificacion?.zona_residencia || ''}
                            onValueChange={(val) => handleIdentificacionChange('zona_residencia', val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Seleccione zona" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Urbano">Urbano</SelectItem>
                                <SelectItem value="Rural">Rural</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                        <Label>Diagnóstico(s) del ATEL (CIE10)</Label>
                        <Textarea
                            value={data?.identificacion?.diagnosticos_atel || ''}
                            onChange={(e) => handleIdentificacionChange('diagnosticos_atel', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ingrese los diagnósticos..."
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Fechas de Ocurrencia y/o Declaración Eventos ATEL</Label>
                        <Textarea
                            value={data?.identificacion?.fechas_eventos_atel || ''}
                            onChange={(e) => handleIdentificacionChange('fechas_eventos_atel', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ingrese las fechas de eventos ATEL..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Entidad de Salud Responsable (EPS/IPS)</Label>
                        <Input
                            value={data?.identificacion?.eps_ips || ''}
                            onChange={(e) => handleIdentificacionChange('eps_ips', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fondo de Pensiones (AFP)</Label>
                        <Input
                            value={data?.identificacion?.afp || ''}
                            onChange={(e) => handleIdentificacionChange('afp', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Tiempo de Incapacidad (Días o Fecha Inicio/Fin)</Label>
                        <Input
                            value={data?.identificacion?.tiempo_incapacidad_dias || ''}
                            onChange={(e) => handleIdentificacionChange('tiempo_incapacidad_dias', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            {/* DATOS DE LA EMPRESA */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <div className="h-6 w-1 bg-indigo-500 rounded-full"></div>
                    3. Datos de la Empresa
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <Label>Empresa donde labora / laboraba</Label>
                        <Input
                            value={data?.identificacion?.empresa || ''}
                            onChange={(e) => handleIdentificacionChange('empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="block mb-2">Vinculación Laboral Actual</Label>
                        <RadioGroup
                            disabled={readOnly}
                            value={data?.identificacion?.vinculacion_laboral === true ? 'si' : (data?.identificacion?.vinculacion_laboral === false ? 'no' : undefined)}
                            onValueChange={(val) => handleIdentificacionChange('vinculacion_laboral', val === 'si')}
                            className="flex items-center gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="si" id="vinc-si" />
                                <Label htmlFor="vinc-si" className="cursor-pointer">Sí</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="no" id="vinc-no" />
                                <Label htmlFor="vinc-no" className="cursor-pointer">No</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label>Forma de Vinculación y/o Cesación</Label>
                        <Input
                            value={data?.identificacion?.forma_vinculacion || ''}
                            onChange={(e) => handleIdentificacionChange('forma_vinculacion', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Modalidad</Label>
                        <Input
                            value={data?.identificacion?.modalidad || ''}
                            onChange={(e) => handleIdentificacionChange('modalidad', e.target.value)}
                            disabled={readOnly}
                            placeholder="Ej. Presencial, Teletrabajo..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tiempo de labor (en esta modalidad)</Label>
                        <Input
                            value={data?.identificacion?.tiempo_modalidad || ''}
                            onChange={(e) => handleIdentificacionChange('tiempo_modalidad', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>NIT de Empresa</Label>
                        <Input
                            value={data?.identificacion?.nit_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('nit_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Fecha de Ingreso a la Empresa</Label>
                        <Input
                            type="date"
                            value={data?.identificacion?.fecha_ingreso_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('fecha_ingreso_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Antigüedad en la Empresa</Label>
                        <Input
                            value={data?.identificacion?.antiguedad_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('antiguedad_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Contacto dentro de la Empresa</Label>
                        <Input
                            value={data?.identificacion?.contacto_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('contacto_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Correo Electrónico (Empresa/Trabajador)</Label>
                        <Input
                            value={data?.identificacion?.correos_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('correos_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Teléfono Empresa</Label>
                        <Input
                            value={data?.identificacion?.telefonos_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('telefonos_empresa', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
