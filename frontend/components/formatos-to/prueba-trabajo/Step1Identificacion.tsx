import React from 'react';
import { FormSection, FormRow, FormField, FormInput, FormTextarea, DateInputs } from './FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface Step1Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step1Identificacion = ({ formData, updateField, readOnly }: Step1Props) => {

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
            {/* Header Dates Card */}
            <Card className="bg-slate-50 border-slate-200">
                <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Fecha de Valoración">
                        <FormInput
                            type="date"
                            value={formData.fecha_valoracion}
                            onChange={(e) => updateField('fecha_valoracion', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                    <FormField label="Último Día de Incapacidad">
                        <FormInput
                            type="date"
                            value={formData.ultimo_dia_incapacidad}
                            onChange={(e) => updateField('ultimo_dia_incapacidad', e.target.value)}
                            disabled={readOnly}
                        />
                    </FormField>
                </CardContent>
            </Card>


            <FormSection title="1. IDENTIFICACIÓN DEL TRABAJADOR Y EMPRESA">
                <div className="space-y-6">
                    {/* Datos Trabajador Card */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Datos del Trabajador</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FormField label="Nombre del Trabajador">
                                <FormInput
                                    value={formData.nombre_trabajador}
                                    onChange={(e) => updateField('nombre_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Tipo de Documento">
                                <select
                                    value={formData.tipo_documento}
                                    onChange={(e) => updateField('tipo_documento', e.target.value)}
                                    disabled={readOnly}
                                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">Seleccione...</option>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="NIT">NIT</option>
                                    <option value="PAS">Pasaporte</option>
                                    <option value="PEP">PEP</option>
                                </select>
                            </FormField>

                            <FormField label="Número de Documento">
                                <FormInput
                                    value={formData.numero_documento}
                                    onChange={(e) => updateField('numero_documento', e.target.value)}
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
                                <FormField label="Edad Calculada">
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
                                                className="accent-slate-900 h-4 w-4"
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

                            <FormField label="Dirección Residencia / Ciudad" className="lg:col-span-1">
                                <FormInput
                                    value={formData.direccion_residencia}
                                    onChange={(e) => updateField('direccion_residencia', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Teléfonos Trabajador">
                                <FormInput
                                    value={formData.telefonos_trabajador}
                                    onChange={(e) => updateField('telefonos_trabajador', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Nivel Educativo" className="col-span-full">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-2">
                                    {[
                                        { val: 'formacion_empirica', label: 'Formación empírica' },
                                        { val: 'basica_primaria', label: 'Básica primaria' },
                                        { val: 'bachillerato_vocacional', label: 'Bachillerato' },
                                        { val: 'tecnico', label: 'Técnico/Tecnológico' },
                                        { val: 'profesional', label: 'Profesional' },
                                        { val: 'postgrado', label: 'Especialización/Maestría' },
                                        { val: 'formacion_informal', label: 'Formación informal' },
                                        { val: 'analfabeta', label: 'Analfabeta' },
                                    ].map((item) => (
                                        <label key={item.val} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer p-2 border rounded-md hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="educacion"
                                                value={item.val}
                                                checked={formData.nivel_educativo === item.val}
                                                onChange={(e) => updateField('nivel_educativo', e.target.value)}
                                                disabled={readOnly}
                                                className="accent-slate-900 h-4 w-4"
                                            />
                                            {item.label}
                                        </label>
                                    ))}
                                </div>
                            </FormField>
                        </CardContent>
                    </Card>

                    {/* Datos ATEL y Empresa Card */}
                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-3">
                            <CardTitle className="text-sm font-bold text-slate-700">Datos del Evento y Empresa</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            <FormField label="Identificación del Siniestro">
                                <FormInput
                                    value={formData.id_siniestro}
                                    onChange={(e) => updateField('id_siniestro', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Fecha(s) del Evento ATEL">
                                <FormInput
                                    type="date"
                                    value={formData.fechas_eventos_atel}
                                    onChange={(e) => updateField('fechas_eventos_atel', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="DIAGNÓSTICO CLÍNICO POR EVENTO ATEL" className="col-span-full">
                                <FormTextarea
                                    className="min-h-[120px] resize-y"
                                    value={formData.diagnosticos_atel}
                                    onChange={(e) => updateField('diagnosticos_atel', e.target.value)}
                                    disabled={readOnly}
                                    placeholder="Ingrese el diagnóstico clínico detallado aquí..."
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

                            <FormField label="Tiempo Total Incapacidad">
                                <div className="flex gap-2 items-center">
                                    <FormInput
                                        value={formData.tiempo_incapacidad_dias}
                                        onChange={(e) => updateField('tiempo_incapacidad_dias', e.target.value)}
                                        disabled={readOnly}
                                    />
                                    <span className="text-sm text-slate-500">días</span>
                                </div>
                            </FormField>

                            <FormField label="Empresa">
                                <FormInput
                                    value={formData.empresa}
                                    onChange={(e) => updateField('empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>


                            <FormField label="NIT Empresa">
                                <FormInput
                                    value={formData.nit_empresa}
                                    onChange={(e) => updateField('nit_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Dirección Empresa">
                                <FormInput
                                    value={formData.direccion_empresa}
                                    onChange={(e) => updateField('direccion_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Cargo Actual">
                                <FormInput
                                    value={formData.cargo_actual}
                                    onChange={(e) => updateField('cargo_actual', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Cargo Único (mismas características)">
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
                                                className="accent-slate-900 h-4 w-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Área / Sección">
                                <FormInput
                                    value={formData.area_seccion}
                                    onChange={(e) => updateField('area_seccion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Fecha Ingreso Cargo">
                                    <FormInput
                                        type="date"
                                        value={formData.fecha_ingreso_cargo}
                                        onChange={(e) => updateField('fecha_ingreso_cargo', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Tiempo Cargo">
                                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm text-slate-600 border border-slate-200">
                                        {calculateAge(formData.fecha_ingreso_cargo)} años
                                    </div>
                                </FormField>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField label="Fecha Ingreso Empresa">
                                    <FormInput
                                        type="date"
                                        value={formData.fecha_ingreso_empresa}
                                        onChange={(e) => updateField('fecha_ingreso_empresa', e.target.value)}
                                        disabled={readOnly}
                                    />
                                </FormField>
                                <FormField label="Tiempo Empresa">
                                    <div className="h-10 flex items-center px-3 bg-slate-100 rounded-md text-sm text-slate-600 border border-slate-200">
                                        {calculateAge(formData.fecha_ingreso_empresa)} años
                                    </div>
                                </FormField>
                            </div>

                            <FormField label="Forma Vinculación">
                                <FormInput
                                    value={formData.forma_vinculacion}
                                    onChange={(e) => updateField('forma_vinculacion', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Modalidad Trabajo">
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {['Presencial', 'Teletrabajo', 'Trabajo en casa'].map((opt) => (
                                        <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer border px-3 py-1 rounded-md hover:bg-slate-50 transition-colors">
                                            <input
                                                type="radio"
                                                name="modalidad"
                                                value={opt}
                                                checked={formData.modalidad === opt}
                                                onChange={(e) => updateField('modalidad', e.target.value)}
                                                disabled={readOnly}
                                                className="accent-slate-900 h-4 w-4"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            </FormField>

                            <FormField label="Tiempo Modalidad">
                                <FormInput
                                    value={formData.tiempo_modalidad}
                                    onChange={(e) => updateField('tiempo_modalidad', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Contacto Empresa">
                                <FormInput
                                    value={formData.contacto_empresa}
                                    onChange={(e) => updateField('contacto_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Teléfono Contacto">
                                <FormInput
                                    value={formData.telefonos_empresa}
                                    onChange={(e) => updateField('telefonos_empresa', e.target.value)}
                                    disabled={readOnly}
                                />
                            </FormField>

                            <FormField label="Correo Contacto">
                                <FormInput
                                    value={formData.correos_electronicos}
                                    onChange={(e) => updateField('correos_electronicos', e.target.value)}
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
