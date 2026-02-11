import React from 'react';
import { FormSection, FormRow, FormField, FormInput } from './FormComponents';

interface Step1Props {
    formData: any;
    updateField: (field: string, value: any) => void;
    readOnly?: boolean;
}

export const Step1Identificacion = ({ formData, updateField, readOnly }: Step1Props) => {

    // Helper for date calculations (simplified for display)
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
        <div className="space-y-4">
            {/* Header Dates */}
            <div className="flex justify-end mb-4">
                <div className="border border-gray-200 rounded-md overflow-hidden shadow-sm">
                    <FormRow>
                        <FormField label="FECHA DE VALORACIÓN:" className="bg-slate-50 w-48 justify-end" />
                        <div className="w-48 px-2">
                            <FormInput
                                type="date"
                                className="w-full text-center font-mono"
                                value={formData.fecha_valoracion}
                                onChange={(e) => updateField('fecha_valoracion', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                    </FormRow>
                    <FormRow noBorderBottom>
                        <FormField label="ÚLTIMO DIA DE INCAPACIDAD:" className="bg-slate-50 w-48 justify-end" />
                        <div className="w-48 px-2">
                            <FormInput
                                type="date"
                                className="w-full text-center font-mono"
                                value={formData.ultimo_dia_incapacidad}
                                onChange={(e) => updateField('ultimo_dia_incapacidad', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                    </FormRow>
                </div>
            </div>

            <FormSection title="1. IDENTIFICACIÓN">
                <div className="bg-[#FCE4D6] border-b border-gray-800 px-2 py-1 text-xs font-bold text-center">
                    (Datos trabajador, evento ATEL, Empresa)
                </div>

                <FormRow>
                    <FormField label="Nombre del trabajador" className="w-48 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.nombre_trabajador}
                        onChange={(e) => updateField('nombre_trabajador', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Número de documento" className="w-48 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.numero_documento}
                        onChange={(e) => updateField('numero_documento', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Identificación del siniestro" className="w-48 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.id_siniestro}
                        onChange={(e) => updateField('id_siniestro', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                {/* Fecha Nacimiento / Edad */}
                <FormRow>
                    <FormField label="Fecha de nacimiento/edad" className="w-48 bg-[#FCE4D6]" />
                    <div className="flex w-full">
                        <div className="flex-1 flex border-r border-gray-800">
                            <FormInput
                                type="date"
                                className="w-full text-center font-mono"
                                value={formData.fecha_nacimiento}
                                onChange={(e) => updateField('fecha_nacimiento', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                        <FormField label="Edad:" className="w-24 bg-[#FCE4D6] justify-end" />
                        <div className="w-16 flex items-center justify-center border-l border-gray-800">
                            <span className="text-xs">{calculateAge(formData.fecha_nacimiento)}</span>
                        </div>
                        <div className="px-2 flex items-center bg-[#FCE4D6] text-xs font-bold border-l border-gray-800">
                            años
                        </div>
                    </div>
                </FormRow>

                {/* Dominancia */}
                <FormRow>
                    <FormField label="Dominancia" className="w-48 bg-[#FCE4D6]" />
                    <div className="flex w-full items-center justify-start gap-8 px-4">
                        {['Derecha', 'Izquierda', 'Ambidiestra'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                    type="radio"
                                    name="dominancia"
                                    value={opt}
                                    checked={formData.dominancia === opt}
                                    onChange={(e) => updateField('dominancia', e.target.value)}
                                    disabled={readOnly}
                                    className="accent-gray-800 h-3 w-3"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </FormRow>

                <FormRow>
                    <FormField label="Estado civil" className="w-48 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.estado_civil}
                        onChange={(e) => updateField('estado_civil', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                {/* Nivel Educativo - Grid */}
                <FormRow>
                    <FormField label="Nivel educativo" className="w-48 bg-[#FCE4D6] flex items-center" />
                    <div className="w-full grid grid-cols-3 text-xs bg-white">
                        {/* Row 1 */}
                        <div className="border-b border-r border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="formacion_empirica" checked={formData.nivel_educativo === 'formacion_empirica'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Formación empírica</span>
                        </div>
                        <div className="border-b border-r border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="basica_primaria" checked={formData.nivel_educativo === 'basica_primaria'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Básica primaria</span>
                        </div>
                        <div className="border-b border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="bachillerato_vocacional" checked={formData.nivel_educativo === 'bachillerato_vocacional'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Bachillerato: vocacional 9°</span>
                        </div>

                        {/* Row 2 */}
                        <div className="border-b border-r border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="bachillerato_modalidad" checked={formData.nivel_educativo === 'bachillerato_modalidad'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Bachillerato: modalidad</span>
                        </div>
                        <div className="border-b border-r border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="tecnico" checked={formData.nivel_educativo === 'tecnico'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Técnico/Tecnológico</span>
                        </div>
                        <div className="border-b border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="profesional" checked={formData.nivel_educativo === 'profesional'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Profesional</span>
                        </div>

                        {/* Row 3 */}
                        <div className="border-r border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="postgrado" checked={formData.nivel_educativo === 'postgrado'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Especialización/maestría</span>
                        </div>
                        <div className="border-r border-gray-800 p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="formacion_informal" checked={formData.nivel_educativo === 'formacion_informal'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Formación informal</span>
                        </div>
                        <div className="p-1 flex items-center gap-1.5 h-8">
                            <input type="radio" name="educacion" value="analfabeta" checked={formData.nivel_educativo === 'analfabeta'} onChange={(e) => updateField('nivel_educativo', e.target.value)} disabled={readOnly} className="accent-gray-800" />
                            <span className="truncate">Analfabeta</span>
                        </div>
                    </div>
                </FormRow>

                <FormRow>
                    <FormField label="Teléfonos trabajador" className="w-48 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.telefonos_trabajador}
                        onChange={(e) => updateField('telefonos_trabajador', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Dirección residencia/ciudad" className="w-48 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.direccion_residencia}
                        onChange={(e) => updateField('direccion_residencia', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Diagnóstico(s) clínico(s) por evento ATEL" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.diagnosticos_clinicos}
                        onChange={(e) => updateField('diagnosticos_clinicos', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Fecha(s) del evento(s) ATEL" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        type="date"
                        value={formData.fecha_evento_atel}
                        onChange={(e) => updateField('fecha_evento_atel', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="EPS - IPS" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.eps}
                        onChange={(e) => updateField('eps', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="AFP" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.afp}
                        onChange={(e) => updateField('afp', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Tiempo total de incapacidad" className="w-64 bg-[#FCE4D6]" />
                    <div className="flex w-full">
                        <FormInput
                            className="flex-1"
                            value={formData.tiempo_total_incapacidad}
                            onChange={(e) => updateField('tiempo_total_incapacidad', e.target.value)}
                            disabled={readOnly}
                        />
                        <div className="px-2 flex items-center bg-[#FCE4D6] text-xs font-bold border-l border-gray-800">
                            días
                        </div>
                    </div>
                </FormRow>

                <FormRow>
                    <FormField label="Empresa donde labora" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.empresa_labora}
                        onChange={(e) => updateField('empresa_labora', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="NIT de la Empresa" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.nit_empresa}
                        onChange={(e) => updateField('nit_empresa', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Cargo actual" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.cargo_actual}
                        onChange={(e) => updateField('cargo_actual', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Cargo único de las mismas características" className="w-64 bg-[#FCE4D6]" />
                    <div className="flex w-full items-center justify-start gap-8 px-4">
                        {['Si', 'No'].map((opt) => (
                            <label key={opt} className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                    type="radio"
                                    name="cargo_unico"
                                    value={opt}
                                    checked={formData.cargo_unico == opt} // Loose equality for "Si"/"No" string match
                                    onChange={(e) => updateField('cargo_unico', e.target.value)}
                                    disabled={readOnly}
                                    className="accent-gray-800 h-3 w-3"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </FormRow>


                <FormRow>
                    <FormField label="Área/sección/proceso" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.area_seccion}
                        onChange={(e) => updateField('area_seccion', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                {/* Fecha ingreso cargo */}
                <FormRow>
                    <FormField label="Fecha ingreso cargo/antigüedad en el cargo" className="w-64 bg-[#FCE4D6]" />
                    <div className="flex w-full">
                        <div className="flex-1 flex border-r border-gray-800">
                            <FormInput
                                type="date"
                                className="w-full text-center font-mono"
                                value={formData.fecha_ingreso_cargo}
                                onChange={(e) => updateField('fecha_ingreso_cargo', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                        <FormField label="Tiempo:" className="w-24 bg-[#FCE4D6] justify-end" />
                        <div className="w-16 flex items-center justify-center border-l border-gray-800">
                            <span className="text-xs">{calculateAge(formData.fecha_ingreso_cargo)}</span>
                        </div>
                        <div className="px-2 flex items-center bg-[#FCE4D6] text-xs font-bold border-l border-gray-800">
                            años
                        </div>
                    </div>
                </FormRow>

                {/* Fecha ingreso empresa */}
                <FormRow>
                    <FormField label="Fecha ingreso a la empresa/antigüedad" className="w-64 bg-[#FCE4D6]" />
                    <div className="flex w-full">
                        <div className="flex-1 flex border-r border-gray-800">
                            <FormInput
                                type="date"
                                className="w-full text-center font-mono"
                                value={formData.fecha_ingreso_empresa}
                                onChange={(e) => updateField('fecha_ingreso_empresa', e.target.value)}
                                disabled={readOnly}
                            />
                        </div>
                        <FormField label="Tiempo:" className="w-24 bg-[#FCE4D6] justify-end" />
                        <div className="w-16 flex items-center justify-center border-l border-gray-800">
                            <span className="text-xs">{calculateAge(formData.fecha_ingreso_empresa)}</span>
                        </div>
                        <div className="px-2 flex items-center bg-[#FCE4D6] text-xs font-bold border-l border-gray-800">
                            años
                        </div>
                    </div>
                </FormRow>

                <FormRow>
                    <FormField label="Forma de vinculación laboral" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.forma_vinculacion}
                        onChange={(e) => updateField('forma_vinculacion', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Modalidad" className="w-32 bg-[#FCE4D6]" />
                    <div className="flex w-full divide-x divide-gray-800">
                        {['Presencial', 'Teletrabajo', 'Trabajo en casa'].map((opt) => (
                            <label key={opt} className="flex-1 flex items-center justify-center gap-1 text-xs cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="modalidad"
                                    value={opt}
                                    checked={formData.modalidad === opt}
                                    onChange={(e) => updateField('modalidad', e.target.value)}
                                    disabled={readOnly}
                                    className="accent-gray-800 h-3 w-3"
                                />
                                {opt}
                            </label>
                        ))}
                    </div>
                </FormRow>

                <FormRow>
                    <FormField label="Tiempo de la Modalidad" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.tiempo_modalidad}
                        onChange={(e) => updateField('tiempo_modalidad', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Contacto en empresa/cargo" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.contacto_empresa}
                        onChange={(e) => updateField('contacto_empresa', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Correo(s) electrónico(s)" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.correo_contacto}
                        onChange={(e) => updateField('correo_contacto', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow>
                    <FormField label="Teléfonos de contacto empresa" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.telefonos_contacto_empresa}
                        onChange={(e) => updateField('telefonos_contacto_empresa', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

                <FormRow noBorderBottom>
                    <FormField label="Dirección de empresa/ciudad" className="w-64 bg-[#FCE4D6]" />
                    <FormInput
                        value={formData.direccion_empresa}
                        onChange={(e) => updateField('direccion_empresa', e.target.value)}
                        disabled={readOnly}
                    />
                </FormRow>

            </FormSection>
        </div>
    );
};
