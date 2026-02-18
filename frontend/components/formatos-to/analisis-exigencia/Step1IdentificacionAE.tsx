import React from 'react';
import { FormSection, FormField, FormInput, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step1AEProps {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step1IdentificacionAE = ({ formData, updateField, readOnly }: Step1AEProps) => {

    // Helper for date calculations
    const calculateAge = (dateString: string) => {
        if (!dateString) return '';
        const today = new Date();
        const birthDate = new Date(dateString);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age.toString();
    };

    return (
        <div className="space-y-6">
            {/* Header Dates Card - Explicitly requested at top */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="FECHA DE VALORACIÓN">
                        <FormInput
                            type="date"
                            value={formData.fecha_valoracion}
                            onChange={(e) => updateField('fecha_valoracion', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                    {/* Kept as it might be useful, though not in the snippet text explicitly, oftentimes needed */}
                    {/* If user strictly strictly wants ONLY text fields, I might hide this. 
                        But "Tiempo total de incapacidad" is in text. "Ultimo dia" is not. 
                        I will keep it for now as it's standard data, but prioritize the text fields. */}
                </CardContent>
            </Card>


            <FormSection title="1. IDENTIFICACIÓN (Datos trabajador, evento ATEL, Empresa)">
                <div className="space-y-6">
                    {/* Datos Trabajador Card */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Datos del Trabajador</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField label="Nombre del Trabajador" className="lg:col-span-2">
                                <FormInput
                                    value={formData.nombre_trabajador}
                                    onChange={(e) => updateField('nombre_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Tipo de Documento">
                                <select
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.tipo_documento || ''}
                                    onChange={(e) => updateField('tipo_documento', e.target.value)}
                                    disabled={readOnly}
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="PEP">PEP</option>
                                    <option value="PPT">PPT</option>
                                </select>
                            </FormField>

                            <FormField label="Número de Documento">
                                <FormInput
                                    value={formData.numero_documento}
                                    onChange={(e) => updateField('numero_documento', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Identificación del siniestro">
                                <FormInput
                                    value={formData.id_siniestro}
                                    onChange={(e) => updateField('id_siniestro', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Fecha de Nacimiento">
                                    <FormInput
                                        type="date"
                                        value={formData.fecha_nacimiento}
                                        onChange={(e) => updateField('fecha_nacimiento', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Edad">
                                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm text-slate-600 border border-slate-200">
                                        {calculateAge(formData.fecha_nacimiento)} años
                                    </div>
                                </FormField>
                            </div>

                            <FormField label="Dominancia">
                                <div className="flex flex-wrap gap-4 mt-2">
                                    {['Derecha', 'Izquierda', 'Ambidiestra'].map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="dominancia"
                                                value={opt}
                                                checked={formData.dominancia === opt}
                                                onChange={(e) => updateField('dominancia', e.target.value)}
                                                disabled={readOnly}
                                                className="accent-blue-600 h-4 w-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Estado Civil">
                                <FormInput
                                    value={formData.estado_civil}
                                    onChange={(e) => updateField('estado_civil', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Nivel Educativo" className="col-span-full">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                                    {[
                                        { val: 'formacion_empirica', label: 'Formación empírica' },
                                        { val: 'basica_primaria', label: 'Básica primaria' },
                                        { val: 'bachillerato_vocacional', label: 'Bachillerato: vocacional 9°' },
                                        { val: 'bachillerato_modalidad', label: 'Bachillerato: modalidad' },
                                        { val: 'tecnico', label: 'Técnico/Tecnológico' },
                                        { val: 'profesional', label: 'Profesional' },
                                        { val: 'postgrado', label: 'Especialización/ postgrado/ maestría' }, // Exact text match attempt
                                        { val: 'formacion_informal', label: 'Formación informal oficios' },
                                        { val: 'analfabeta', label: 'Analfabeta' },
                                        { val: 'otros', label: 'Otros' },
                                    ].map((item) => (
                                        <label key={item.val} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer p-2 border rounded-md hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="nivel_educativo_ae"
                                                value={item.val}
                                                checked={formData.nivel_educativo === item.val}
                                                onChange={(e) => updateField('nivel_educativo', e.target.value)}
                                                disabled={readOnly}
                                                className="accent-blue-600 h-4 w-4"
                                            />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Teléfonos trabajador">
                                <FormInput
                                    value={formData.telefonos_trabajador}
                                    onChange={(e) => updateField('telefonos_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Dirección residencia/ciudad">
                                <FormInput
                                    value={formData.direccion_residencia}
                                    onChange={(e) => updateField('direccion_residencia', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Datos ATEL y Empresa Card */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Evento ATEL y Empresa</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <FormField label="Diagnóstico(s) clínico(s) por evento ATEL" className="col-span-full">
                                <FormTextarea
                                    className="min-h-[80px]"
                                    value={formData.diagnosticos_atel}
                                    onChange={(e) => updateField('diagnosticos_atel', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Fecha(s) del evento(s) ATEL">
                                <FormInput
                                    type="date"
                                    value={formData.fechas_eventos_atel}
                                    onChange={(e) => updateField('fechas_eventos_atel', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="EPS - IPS">
                                <FormInput
                                    value={formData.eps_ips}
                                    onChange={(e) => updateField('eps_ips', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="AFP">
                                <FormInput
                                    value={formData.afp}
                                    onChange={(e) => updateField('afp', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Tiempo total de incapacidad">
                                <div className="flex gap-2 items-center">
                                    <FormInput
                                        value={formData.tiempo_incapacidad_dias}
                                        onChange={(e) => updateField('tiempo_incapacidad_dias', e.target.value)}
                                        disabled={readOnly}
                                    />
                                    <span className="text-sm text-slate-500">días</span>
                                </div>
                            </FormField>

                            <FormField label="Empresa donde labora">
                                <FormInput
                                    value={formData.empresa}
                                    onChange={(e) => updateField('empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>


                            <FormField label="NIT de la Empresa">
                                <FormInput
                                    value={formData.nit_empresa}
                                    onChange={(e) => updateField('nit_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Cargo actual">
                                <FormInput
                                    value={formData.cargo_actual}
                                    onChange={(e) => updateField('cargo_actual', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Cargo unico de las mismas caracteristicas">
                                <div className="flex gap-4 mt-2">
                                    {['Si', 'No'].map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer border px-3 py-1 rounded-md hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="cargo_unico"
                                                value={opt}
                                                checked={formData.cargo_unico == opt}
                                                onChange={(e) => updateField('cargo_unico', e.target.value)}
                                                disabled={readOnly}
                                                className="accent-blue-600 h-4 w-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Área/sección/proceso">
                                <FormInput
                                    value={formData.area_seccion}
                                    onChange={(e) => updateField('area_seccion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Fecha ingreso cargo">
                                    <FormInput
                                        type="date"
                                        value={formData.fecha_ingreso_cargo}
                                        onChange={(e) => updateField('fecha_ingreso_cargo', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Antigüedad en el cargo">
                                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm text-slate-600 border border-slate-200">
                                        {calculateAge(formData.fecha_ingreso_cargo)} años
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Fecha ingreso a la empresa">
                                    <FormInput
                                        type="date"
                                        value={formData.fecha_ingreso_empresa}
                                        onChange={(e) => updateField('fecha_ingreso_empresa', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Antigüedad en la empresa">
                                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm text-slate-600 border border-slate-200">
                                        {calculateAge(formData.fecha_ingreso_empresa)} años
                                    </div>
                                </FormField>
                            </div>

                            <FormField label="Forma de vinculación laboral">
                                <FormInput
                                    value={formData.forma_vinculacion}
                                    onChange={(e) => updateField('forma_vinculacion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Modalidad">
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['Presencial', 'Teletrabajo', 'Trabajo en casa'].map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer border px-3 py-1 rounded-md hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="modalidad"
                                                value={opt}
                                                checked={formData.modalidad && formData.modalidad.toLowerCase() === opt.toLowerCase()}
                                                onChange={(e) => updateField('modalidad', opt)}
                                                disabled={readOnly}
                                                className="accent-blue-600 h-4 w-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Tiempo de la modalidad">
                                <FormInput
                                    value={formData.tiempo_modalidad}
                                    onChange={(e) => updateField('tiempo_modalidad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Contacto en empresa/cargo">
                                <FormInput
                                    value={formData.contacto_empresa}
                                    onChange={(e) => updateField('contacto_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Correo(s) electrónico(s)">
                                <FormInput
                                    value={formData.correos_electronicos}
                                    onChange={(e) => updateField('correos_electronicos', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Teléfonos de contacto empresa">
                                <FormInput
                                    value={formData.telefonos_empresa}
                                    onChange={(e) => updateField('telefonos_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Dirección de empresa/ciudad">
                                <FormInput
                                    value={formData.direccion_empresa}
                                    onChange={(e) => updateField('direccion_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                        </CardContent>
                    </Card>
                </div>
            </FormSection>
        </div>
    );
};
