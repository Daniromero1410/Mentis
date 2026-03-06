import { FormSection, FormField, FormInput, FormTextarea } from '../prueba-trabajo/FormComponents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

    // Reusable table row component
    const FormRow = ({ label, children, required, className }: { label: string; children: React.ReactNode; required?: boolean; className?: string }) => (
        <div className={`grid grid-cols-[220px_1fr] border-b border-slate-200 last:border-b-0 ${className || ''}`}>
            <div className="bg-orange-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700 border-r border-slate-200 flex items-center">
                {label}{required && <span className="text-red-500 ml-0.5">*</span>}
            </div>
            <div className="px-4 py-2 flex items-center">
                {children}
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* FECHA DE VALORACIÓN */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="grid grid-cols-[220px_1fr] border-b border-slate-200">
                    <div className="bg-orange-50/60 px-4 py-2.5 text-sm font-bold text-slate-700 border-r border-slate-200 flex items-center justify-end">
                        FECHA DE VALORACIÓN:
                    </div>
                    <div className="px-4 py-2 flex items-center">
                        <input
                            type="date"
                            value={data?.identificacion?.fecha_valoracion || ''}
                            onChange={(e) => handleIdentificacionChange('fecha_valoracion', e.target.value)}
                            disabled={readOnly}
                            className="h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* 1. OBJETIVO DE LA VALORACIÓN */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-orange-100/70 px-4 py-2.5 border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-800">1 &nbsp;&nbsp; OBJETIVO DE LA VALORACIÓN</span>
                </div>
                <div className="p-4 bg-white">
                    <textarea
                        value={data?.secciones_texto?.objetivo_valoracion || ''}
                        onChange={(e) => handleSeccionesTextoChange('objetivo_valoracion', e.target.value)}
                        placeholder="Describa el objetivo de la valoración..."
                        disabled={readOnly}
                        className="w-full min-h-[80px] p-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                    />
                </div>
            </div>

            {/* 2. IDENTIFICACIÓN */}
            <div className="border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="bg-orange-100/70 px-4 py-2.5 border-b border-slate-200">
                    <span className="text-sm font-bold text-slate-800">2 &nbsp;&nbsp; IDENTIFICACIÓN</span>
                    <p className="text-xs text-slate-500 mt-0.5">(Datos trabajador, evento ATEL, Entidad)</p>
                </div>

                <div className="bg-white">
                    <FormRow label="Nombre del trabajador" required>
                        <input
                            type="text"
                            value={data?.identificacion?.nombre_trabajador || ''}
                            onChange={(e) => handleIdentificacionChange('nombre_trabajador', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Nombres y apellidos"
                        />
                    </FormRow>

                    <FormRow label="Número de documento" required>
                        <input
                            type="number"
                            value={data?.identificacion?.numero_documento || ''}
                            onChange={(e) => handleIdentificacionChange('numero_documento', e.target.value)}
                            disabled={readOnly}
                            className="w-full max-w-xs h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Identificación del siniestro" required>
                        <input
                            type="text"
                            value={data?.identificacion?.identificacion_siniestro || ''}
                            onChange={(e) => handleIdentificacionChange('identificacion_siniestro', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Fecha de nacimiento/edad" required>
                        <div className="flex items-center gap-4 flex-wrap">
                            <input
                                type="date"
                                value={data?.identificacion?.fecha_nacimiento || ''}
                                onChange={(e) => handleIdentificacionChange('fecha_nacimiento', e.target.value)}
                                disabled={readOnly}
                                className="h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-medium">Edad:</span>
                                <input
                                    type="number"
                                    value={data?.identificacion?.edad || ''}
                                    onChange={(e) => handleIdentificacionChange('edad', parseInt(e.target.value))}
                                    disabled={readOnly}
                                    className="w-20 h-9 px-3 text-sm text-center border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <span className="text-sm text-slate-500">años</span>
                            </div>
                        </div>
                    </FormRow>

                    <FormRow label="Dominancia" required>
                        <div className="flex gap-6">
                            {['Derecha', 'Izquierda', 'Ambidiestra'].map((opt) => (
                                <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="dominancia_vo"
                                        value={opt}
                                        checked={data?.identificacion?.dominancia === opt}
                                        onChange={(e) => handleIdentificacionChange('dominancia', e.target.value)}
                                        disabled={readOnly}
                                        className="accent-slate-900 h-4 w-4"
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </FormRow>

                    <FormRow label="Estado civil" required>
                        <input
                            type="text"
                            value={data?.identificacion?.estado_civil || ''}
                            onChange={(e) => handleIdentificacionChange('estado_civil', e.target.value)}
                            disabled={readOnly}
                            className="w-full max-w-xs h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    {/* Nivel Educativo - Grid de opciones como en el formato papel */}
                    <div className="grid grid-cols-[220px_1fr] border-b border-slate-200">
                        <div className="bg-orange-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700 border-r border-slate-200 flex items-start pt-4">
                            Nivel educativo<span className="text-red-500 ml-0.5">*</span>
                        </div>
                        <div className="px-2 py-2">
                            <div className="grid grid-cols-3 gap-0 text-sm">
                                {[
                                    { val: 'formacion_empirica', label: 'Formación empírica' },
                                    { val: 'basica_primaria', label: 'Básica primaria' },
                                    { val: 'bachillerato_vocacional', label: 'Bachillerato: vocacional 9°' },
                                    { val: 'bachillerato_modalidad', label: 'Bachillerato: modalidad' },
                                    { val: 'tecnico', label: 'Técnico/ Tecnológico' },
                                    { val: 'profesional', label: 'Profesional' },
                                    { val: 'postgrado', label: 'Especialización/ postgrado/ maestría' },
                                    { val: 'formacion_informal', label: 'Formación informal oficios' },
                                    { val: 'analfabeta', label: 'Analfabeta' },
                                ].map((item) => (
                                    <label key={item.val} className="flex items-center gap-2 px-3 py-1.5 cursor-pointer text-slate-600 hover:bg-slate-50 border-b border-r border-slate-100">
                                        <input
                                            type="radio"
                                            name="nivel_educativo_vo"
                                            value={item.val}
                                            checked={data?.identificacion?.nivel_educativo === item.val}
                                            onChange={(e) => handleIdentificacionChange('nivel_educativo', e.target.value)}
                                            disabled={readOnly}
                                            className="accent-slate-900 h-3.5 w-3.5 flex-shrink-0"
                                        />
                                        <span className="text-xs leading-tight">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-1 px-3 py-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 whitespace-nowrap">Especificar formación y oficios que conoce:</span>
                                    <input
                                        type="text"
                                        value={data?.identificacion?.especificar_formacion || ''}
                                        onChange={(e) => handleIdentificacionChange('especificar_formacion', e.target.value)}
                                        disabled={readOnly}
                                        className="flex-1 h-8 px-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <FormRow label="Teléfonos trabajador" required>
                        <input
                            type="text"
                            value={data?.identificacion?.telefonos_trabajador || ''}
                            onChange={(e) => handleIdentificacionChange('telefonos_trabajador', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Dirección residencia y ciudad" required>
                        <div className="flex items-center gap-4 flex-1 flex-wrap">
                            <input
                                type="text"
                                value={data?.identificacion?.direccion_residencia || ''}
                                onChange={(e) => handleIdentificacionChange('direccion_residencia', e.target.value)}
                                disabled={readOnly}
                                className="flex-1 min-w-[200px] h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <div className="flex gap-4">
                                {['Urbano', 'Rural'].map((opt) => (
                                    <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="zona_residencia_vo"
                                            value={opt}
                                            checked={data?.identificacion?.zona_residencia === opt}
                                            onChange={(e) => handleIdentificacionChange('zona_residencia', e.target.value)}
                                            disabled={readOnly}
                                            className="accent-slate-900 h-4 w-4"
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </FormRow>

                    <div className="grid grid-cols-[220px_1fr] border-b border-slate-200">
                        <div className="bg-orange-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700 border-r border-slate-200 flex items-start pt-3">
                            Diagnóstico(s) clínico(s) por evento ATEL<span className="text-red-500 ml-0.5">*</span>
                        </div>
                        <div className="px-4 py-2">
                            <textarea
                                value={data?.identificacion?.diagnosticos_atel || ''}
                                onChange={(e) => handleIdentificacionChange('diagnosticos_atel', e.target.value)}
                                disabled={readOnly}
                                placeholder="Ingrese los diagnósticos..."
                                className="w-full min-h-[60px] p-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                            />
                        </div>
                    </div>

                    <FormRow label="Fecha(s) del evento(s) ATEL" required>
                        <input
                            type="text"
                            value={data?.identificacion?.fechas_eventos_atel || ''}
                            onChange={(e) => handleIdentificacionChange('fechas_eventos_atel', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            placeholder="Ingrese las fechas de eventos ATEL..."
                        />
                    </FormRow>

                    {/* Eventos No laborales - like paper: SI | NO | Fecha | Diagnóstico */}
                    <div className="grid grid-cols-[220px_1fr] border-b border-slate-200">
                        <div className="bg-orange-50/60 px-4 py-2.5 text-sm font-semibold text-slate-700 border-r border-slate-200 flex items-center">
                            Eventos No laborales
                        </div>
                        <div className="px-4 py-2 flex items-center gap-4 flex-wrap">
                            <div className="flex gap-4">
                                {[{ val: 'si', label: 'Sí' }, { val: 'no', label: 'No' }].map((opt) => (
                                    <label key={opt.val} className="flex items-center gap-1.5 text-sm text-slate-600 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="eventos_no_laborales_sn"
                                            value={opt.val}
                                            checked={data?.identificacion?.eventos_no_laborales === opt.val}
                                            onChange={(e) => handleIdentificacionChange('eventos_no_laborales', e.target.value)}
                                            disabled={readOnly}
                                            className="accent-slate-900 h-4 w-4"
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Fecha:</span>
                                <input
                                    type="date"
                                    value={data?.identificacion?.eventos_no_laborales_fecha || ''}
                                    onChange={(e) => handleIdentificacionChange('eventos_no_laborales_fecha', e.target.value)}
                                    disabled={readOnly}
                                    className="h-9 px-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm text-slate-500">Diagnóstico:</span>
                                <input
                                    type="text"
                                    value={data?.identificacion?.eventos_no_laborales_diagnostico || ''}
                                    onChange={(e) => handleIdentificacionChange('eventos_no_laborales_diagnostico', e.target.value)}
                                    disabled={readOnly}
                                    className="flex-1 h-9 px-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    <FormRow label="EPS - IPS" required>
                        <input
                            type="text"
                            value={data?.identificacion?.eps_ips || ''}
                            onChange={(e) => handleIdentificacionChange('eps_ips', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="AFP">
                        <input
                            type="text"
                            value={data?.identificacion?.afp || ''}
                            onChange={(e) => handleIdentificacionChange('afp', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Tiempo total de incapacidad">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={data?.identificacion?.tiempo_incapacidad_dias || ''}
                                onChange={(e) => handleIdentificacionChange('tiempo_incapacidad_dias', e.target.value)}
                                disabled={readOnly}
                                className="w-32 h-9 px-3 text-sm text-center border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <span className="text-sm text-slate-500 font-medium">días</span>
                        </div>
                    </FormRow>

                    <FormRow label="Empresa donde labora" required>
                        <input
                            type="text"
                            value={data?.identificacion?.empresa || ''}
                            onChange={(e) => handleIdentificacionChange('empresa', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Vinculación laboral">
                        <div className="flex items-center gap-6">
                            {[{ val: 'no', label: 'NO' }, { val: 'si', label: 'SÍ' }].map((opt) => (
                                <label key={opt.val} className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="vinculacion_laboral_vo"
                                        value={opt.val}
                                        checked={
                                            opt.val === 'si'
                                                ? data?.identificacion?.vinculacion_laboral === true
                                                : data?.identificacion?.vinculacion_laboral === false
                                        }
                                        onChange={() => handleIdentificacionChange('vinculacion_laboral', opt.val === 'si')}
                                        disabled={readOnly}
                                        className="accent-slate-900 h-4 w-4"
                                    />
                                    {opt.label}
                                </label>
                            ))}
                        </div>
                    </FormRow>

                    <FormRow label="Forma de vinculación laboral">
                        <input
                            type="text"
                            value={data?.identificacion?.forma_vinculacion || ''}
                            onChange={(e) => handleIdentificacionChange('forma_vinculacion', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Modalidad">
                        <div className="flex gap-6">
                            {['Presencial', 'Teletrabajo', 'Trabajo en casa'].map((opt) => (
                                <label key={opt} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="modalidad_vo"
                                        value={opt}
                                        checked={data?.identificacion?.modalidad && data.identificacion.modalidad.toLowerCase() === opt.toLowerCase()}
                                        onChange={() => handleIdentificacionChange('modalidad', opt)}
                                        disabled={readOnly}
                                        className="accent-slate-900 h-4 w-4"
                                    />
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </FormRow>

                    <FormRow label="Tiempo de la modalidad">
                        <input
                            type="text"
                            value={data?.identificacion?.tiempo_modalidad || ''}
                            onChange={(e) => handleIdentificacionChange('tiempo_modalidad', e.target.value)}
                            disabled={readOnly}
                            className="w-full max-w-xs h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="NIT de la Empresa">
                        <input
                            type="text"
                            value={data?.identificacion?.nit_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('nit_empresa', e.target.value)}
                            disabled={readOnly}
                            className="w-full max-w-xs h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Fecha ingreso a la empresa/ antigüedad en la empresa">
                        <div className="flex items-center gap-4 flex-wrap">
                            <input
                                type="date"
                                value={data?.identificacion?.fecha_ingreso_empresa || ''}
                                onChange={(e) => handleIdentificacionChange('fecha_ingreso_empresa', e.target.value)}
                                disabled={readOnly}
                                className="h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            />
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 font-medium">Antigüedad:</span>
                                <input
                                    type="text"
                                    value={data?.identificacion?.antiguedad_empresa || ''}
                                    onChange={(e) => handleIdentificacionChange('antiguedad_empresa', e.target.value)}
                                    disabled={readOnly}
                                    className="w-32 h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <span className="text-sm text-slate-500">años</span>
                            </div>
                        </div>
                    </FormRow>

                    <FormRow label="Contacto en empresa/cargo" required>
                        <input
                            type="text"
                            value={data?.identificacion?.contacto_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('contacto_empresa', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Correo(s) electrónico(s)" required>
                        <input
                            type="text"
                            value={data?.identificacion?.correos_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('correos_empresa', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>

                    <FormRow label="Teléfonos de contacto empresa" required>
                        <input
                            type="text"
                            value={data?.identificacion?.telefonos_empresa || ''}
                            onChange={(e) => handleIdentificacionChange('telefonos_empresa', e.target.value)}
                            disabled={readOnly}
                            className="w-full h-9 px-3 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                    </FormRow>
                </div>
            </div>
        </div>
    );
}
