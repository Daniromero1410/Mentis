import { FormSection, FormField, FormInput, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FormSection title="1. Objetivo de la Valoración">
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                        <FormField>
                            <FormTextarea
                                value={data?.secciones_texto?.objetivo_valoracion || ''}
                                onChange={(e) => handleSeccionesTextoChange('objetivo_valoracion', e.target.value)}
                                placeholder="Describa el objetivo de la valoración..."
                                disabled={readOnly}
                                className="min-h-[100px]"
                            />
                        </FormField>
                    </CardContent>
                </Card>
            </FormSection>

            <FormSection title="2. Identificación">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Datos del Trabajador</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField label="Fecha de Valoración">
                                <FormInput
                                    type="date"
                                    value={data?.identificacion?.fecha_valoracion || ''}
                                    onChange={(e) => handleIdentificacionChange('fecha_valoracion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Nombre del Trabajador">
                                <FormInput
                                    value={data?.identificacion?.nombre_trabajador || ''}
                                    onChange={(e) => handleIdentificacionChange('nombre_trabajador', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Nombres y apellidos"
                                />
                            </FormField>

                            <FormField label="Documento de Identidad (C.C)">
                                <FormInput
                                    value={data?.identificacion?.numero_documento || ''}
                                    onChange={(e) => handleIdentificacionChange('numero_documento', e.target.value)}
                                    disabled={readOnly}
                                    type="number"
                                />
                            </FormField>

                            <FormField label="Identificación del Siniestro" className="lg:col-span-3">
                                <FormInput
                                    value={data?.identificacion?.identificacion_siniestro || ''}
                                    onChange={(e) => handleIdentificacionChange('identificacion_siniestro', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Fecha de Nacimiento">
                                <FormInput
                                    type="date"
                                    value={data?.identificacion?.fecha_nacimiento || ''}
                                    onChange={(e) => handleIdentificacionChange('fecha_nacimiento', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Edad">
                                <FormInput
                                    value={data?.identificacion?.edad || ''}
                                    onChange={(e) => handleIdentificacionChange('edad', parseInt(e.target.value))}
                                    disabled={readOnly}
                                    type="number"
                                />
                            </FormField>

                            <FormField label="Dominancia">
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
                            </FormField>

                            <FormField label="Estado Civil">
                                <FormInput
                                    value={data?.identificacion?.estado_civil || ''}
                                    onChange={(e) => handleIdentificacionChange('estado_civil', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Nivel Educativo">
                                <FormInput
                                    value={data?.identificacion?.nivel_educativo || ''}
                                    onChange={(e) => handleIdentificacionChange('nivel_educativo', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Especifique Formación">
                                <FormInput
                                    value={data?.identificacion?.especificar_formacion || ''}
                                    onChange={(e) => handleIdentificacionChange('especificar_formacion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Teléfono(s)">
                                <FormInput
                                    value={data?.identificacion?.telefonos_trabajador || ''}
                                    onChange={(e) => handleIdentificacionChange('telefonos_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Dirección">
                                <FormInput
                                    value={data?.identificacion?.direccion_residencia || ''}
                                    onChange={(e) => handleIdentificacionChange('direccion_residencia', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Zona Residencial">
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
                            </FormField>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Información ATEL</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField label="Diagnóstico(s) del ATEL (CIE10)" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.identificacion?.diagnosticos_atel || ''}
                                    onChange={(e) => handleIdentificacionChange('diagnosticos_atel', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ingrese los diagnósticos..."
                                />
                            </FormField>

                            <FormField label="Fechas de Ocurrencia y/o Declaración Eventos ATEL" className="md:col-span-2">
                                <FormTextarea
                                    value={data?.identificacion?.fechas_eventos_atel || ''}
                                    onChange={(e) => handleIdentificacionChange('fechas_eventos_atel', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ingrese las fechas de eventos ATEL..."
                                />
                            </FormField>

                            <FormField label="Entidad de Salud Responsable (EPS/IPS)">
                                <FormInput
                                    value={data?.identificacion?.eps_ips || ''}
                                    onChange={(e) => handleIdentificacionChange('eps_ips', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Fondo de Pensiones (AFP)">
                                <FormInput
                                    value={data?.identificacion?.afp || ''}
                                    onChange={(e) => handleIdentificacionChange('afp', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Tiempo de Incapacidad (Días o Fecha Inicio/Fin)" className="md:col-span-2">
                                <FormInput
                                    value={data?.identificacion?.tiempo_incapacidad_dias || ''}
                                    onChange={(e) => handleIdentificacionChange('tiempo_incapacidad_dias', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>

            <FormSection title="3. Datos de la Empresa">
                <div className="space-y-6">
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Información Laboral</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField label="Empresa donde labora / laboraba">
                                <FormInput
                                    value={data?.identificacion?.empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Vinculación Laboral Actual">
                                <RadioGroup
                                    disabled={readOnly}
                                    value={data?.identificacion?.vinculacion_laboral === true ? 'si' : (data?.identificacion?.vinculacion_laboral === false ? 'no' : undefined)}
                                    onValueChange={(val) => handleIdentificacionChange('vinculacion_laboral', val === 'si')}
                                    className="flex items-center gap-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="si" id="vinc-si" />
                                        <label htmlFor="vinc-si" className="cursor-pointer text-sm font-medium leading-none text-slate-700">Sí</label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id="vinc-no" />
                                        <label htmlFor="vinc-no" className="cursor-pointer text-sm font-medium leading-none text-slate-700">No</label>
                                    </div>
                                </RadioGroup>
                            </FormField>

                            <FormField label="Forma de Vinculación y/o Cesación">
                                <FormInput
                                    value={data?.identificacion?.forma_vinculacion || ''}
                                    onChange={(e) => handleIdentificacionChange('forma_vinculacion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Modalidad">
                                <FormInput
                                    value={data?.identificacion?.modalidad || ''}
                                    onChange={(e) => handleIdentificacionChange('modalidad', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ej. Presencial, Teletrabajo..."
                                />
                            </FormField>

                            <FormField label="Tiempo de labor (en esta modalidad)">
                                <FormInput
                                    value={data?.identificacion?.tiempo_modalidad || ''}
                                    onChange={(e) => handleIdentificacionChange('tiempo_modalidad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="NIT de Empresa">
                                <FormInput
                                    value={data?.identificacion?.nit_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('nit_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Fecha de Ingreso a la Empresa">
                                <FormInput
                                    type="date"
                                    value={data?.identificacion?.fecha_ingreso_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('fecha_ingreso_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Antigüedad en la Empresa">
                                <FormInput
                                    value={data?.identificacion?.antiguedad_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('antiguedad_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Contacto dentro de la Empresa">
                                <FormInput
                                    value={data?.identificacion?.contacto_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('contacto_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Correo Electrónico (Empresa/Trabajador)">
                                <FormInput
                                    value={data?.identificacion?.correos_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('correos_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Teléfono Empresa">
                                <FormInput
                                    value={data?.identificacion?.telefonos_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('telefonos_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div >
    );
}
