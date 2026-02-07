'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Modal } from '@/components/ui/modal';
import { FileUpload } from '@/components/ui/file-upload';
import { api } from '@/app/services/api';
import { toast } from 'sonner';
import {
  User,
  Briefcase,
  History,
  Activity,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
  Check,
  Loader2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

const steps = [
  { id: 1, title: 'Identificación', icon: User },
  { id: 2, title: 'Info Laboral', icon: Briefcase },
  { id: 3, title: 'Historia Ocupacional', icon: History },
  { id: 4, title: 'Actividad Laboral', icon: Activity },
  { id: 5, title: 'Factores de Riesgo', icon: AlertTriangle },
  { id: 6, title: 'Concepto Final', icon: FileText },
];

// Factores de riesgo según la plantilla Excel
const factoresRiesgo = {
  demandas_cuantitativas: {
    titulo: 'DEMANDAS CUANTITATIVAS DEL TRABAJO',
    items: [
      'Ritmo de trabajo acelerado o bajo presión de tiempo',
      'Imposibilidad de hacer pausas dentro de la jornada',
      'Tiempo adicional para cumplir con el trabajo asignado',
      'Volumen de carga laboral',
    ]
  },
  demandas_carga_mental: {
    titulo: 'Demandas de Carga Mental',
    items: [
      'Exigencia de memoria, atención y concentración',
      'Exigencia de altos niveles de detalle o precisión',
      'Elevada cantidad de Información que se usa bajo presión de tiempo',
      'Elevada cantidad de información que se usa de forma simultánea',
      'La información necesaria para realizar el trabajo es compleja',
      'Ejecución de tareas de alta carga cognitiva',
      'Cantidad de tareas que exigen realización bajo presión de tiempo',
      'Percepción de agotamiento al final de la jornada',
    ]
  },
  demandas_emocionales: {
    titulo: 'Demandas Emocionales',
    items: [
      'Exposición a sentimientos, emociones y trato negativo de usuarios o clientes',
      'Exposición a situaciones emocionalmente devastadoras',
      'Impacto emocional de la tarea en el ámbito extralaboral',
      'Posibilidad de cometer errores dentro de la realización de la tarea que afecten el resultado de los procesos',
      'Grado de tensión sobre la realización de la tarea',
      'Percepción de monotonía o actividad repetitiva de la tarea',
    ]
  },
  exigencias_responsabilidad: {
    titulo: 'Exigencias de Responsabilidad del Cargo',
    items: [
      'Responsabilidad directa por la vida, salud o seguridad de otras personas',
      'Responsabilidad directa por supervisión de personal',
      'Responsabilidad directa por resultados del área de trabajo',
      'Responsabilidad directa por bienes de elevada cuantía',
      'Responsabilidad directa por dinero de la organización',
      'Responsabilidad directa por información confidencial',
    ]
  },
  consistencia_rol: {
    titulo: 'Consistencia de Rol',
    items: [
      'Falta de recursos, personas o herramientas necesarias para desarrollar el trabajo',
      'Órdenes contradictorias provenientes de una o varias personas',
      'Solicitudes o requerimientos innecesarios en el trabajo',
      'Solicitudes o requerimientos que van en contra de principios éticos, técnicos, de seguridad o de calidad o servicio del producto',
      'Variación eventual o continua de la tarea asignada',
      'Realización de tareas simultáneas',
      'Las tareas exigen actualización de conocimientos de manera constante',
    ]
  },
  demandas_ambientales: {
    titulo: 'Demandas Ambientales y de Esfuerzo Físico',
    items: [
      'Ruido que afecta negativamente la calidad de la tarea',
      'Iluminación que afecta negativamente la calidad de la tarea',
      'Temperatura que afecta negativamente',
      'Condiciones de Ventilación que afecten negativamente la calidad de la tarea',
      'Distribución y características del puesto, equipos o herramientas que afectan negativamente la calidad de la tarea',
      'Condiciones de orden y aseo que afecten negativamente la calidad de la tarea',
      'Preocupación por exposición a agentes biológicos',
      'Preocupación por exposición a agentes químicos',
      'Exigencias de esfuerzo físico que afectan negativamente la calidad de la tarea',
      'Preocupación ante la posibilidad de sufrir un accidente de trabajo',
    ]
  },
  demandas_jornada: {
    titulo: 'Demandas de la Jornada de Trabajo',
    items: [
      'Trabajo en horario nocturno',
      'Días de trabajo consecutivo sin descanso',
    ]
  },
};

export default function NuevaValoracionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [generandoConcepto, setGenerandoConcepto] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [modoVista, setModoVista] = useState(false); // true = solo lectura
  const [valoracionId, setValoracionId] = useState<number | null>(null);
  const [alertasRiesgo, setAlertasRiesgo] = useState<string[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<{ pdf_url: string; pdf_filename: string; excel_url: string; excel_filename: string } | null>(null);

  // Form data - Exactamente como la plantilla Excel
  const [formData, setFormData] = useState({
    // FECHA DE VALORACIÓN
    fecha_valoracion_dia: '',
    fecha_valoracion_mes: '',
    fecha_valoracion_ano: '',

    // IDENTIFICACIÓN
    nombre_trabajador: '',
    tipo_documento: '', // CC, TI, CE, PEP, PPT
    numero_documento: '',
    identificacion_siniestro: '',
    fecha_nacimiento_dia: '',
    fecha_nacimiento_mes: '',
    fecha_nacimiento_ano: '',
    edad: '',
    estado_civil: '', // casado, soltero, union_libre, separado, viudo

    // Nivel educativo (checkboxes)
    nivel_formacion_empirica: false,
    nivel_basica_primaria: false,
    nivel_bachillerato_vocacional: false,
    nivel_bachillerato_modalidad: false,
    nivel_tecnico_tecnologico: false,
    nivel_universitario: false,
    nivel_especializacion: false,
    nivel_formacion_informal: false,
    nivel_analfabeta: false,
    especificar_formacion_oficios: '',

    telefonos_trabajador: '',
    direccion_residencia_ciudad: '',
    zona: '', // urbano, rural
    diagnostico_esfera_mental: '',

    // INFO LABORAL
    fecha_evento_atel: '',
    eventos_no_laborales: '', // si, no
    eventos_no_laborales_fecha: '',
    eventos_no_laborales_diagnostico: '',
    eps: '',
    fondo_pension: '',
    tiempo_total_incapacidad_dias: '',
    empresa_donde_labora: '',
    vinculacion_laboral: '', // si, no
    tipo_vinculacion_laboral: '',
    modalidad: '', // presencial, teletrabajo, trabajo_en_casa
    tiempo_modalidad: '',
    nit_empresa: '',
    fecha_ingreso_dia: '',
    fecha_ingreso_mes: '',
    fecha_ingreso_ano: '',
    antiguedad_empresa_anos: '',
    antiguedad_empresa_meses: '',
    antiguedad_cargo_anos: '',
    antiguedad_cargo_meses: '',
    contacto_empresa_cargo: '',
    correos_electronicos: '',
    telefonos_contacto_empresa: '',

    // HISTORIA OCUPACIONAL
    historia_ocupacional: [
      { empresa: '', cargo_funciones_tareas: '', tiempo_duracion: '', motivo_retiro: '' },
      { empresa: '', cargo_funciones_tareas: '', tiempo_duracion: '', motivo_retiro: '' },
      { empresa: '', cargo_funciones_tareas: '', tiempo_duracion: '', motivo_retiro: '' },
    ],
    otros_oficios_desempenados: '',
    oficios_interes: '',

    // DESCRIPCION ACTIVIDAD LABORAL ACTUAL
    nombre_cargo: '',
    tareas_nombre_descripcion: '',
    herramientas_trabajo: '',
    horario_trabajo: '',
    elementos_proteccion_personal: '',

    // FACTORES DE RIESGO - Inicializar con todos los items
    factores_riesgo: {} as Record<string, { calificacion: string; observaciones: string }>,

    // CONCEPTO FINAL
    concepto_psicologico_final: '',
    orientacion_psicologica_reintegro: '',
    elaboro_nombre: '',
    elaboro_firma: '',
    reviso_nombre: '',
    reviso_firma: '',
  });

  // Inicializar factores de riesgo
  useState(() => {
    const factoresInit: Record<string, { calificacion: string; observaciones: string }> = {};
    Object.values(factoresRiesgo).forEach(categoria => {
      categoria.items.forEach(item => {
        factoresInit[item] = { calificacion: '', observaciones: '' };
      });
    });
    setFormData(prev => ({ ...prev, factores_riesgo: factoresInit }));
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateHistoria = (index: number, field: string, value: string) => {
    const newHistoria = [...formData.historia_ocupacional];
    newHistoria[index] = { ...newHistoria[index], [field]: value };
    setFormData(prev => ({ ...prev, historia_ocupacional: newHistoria }));
  };

  const updateFactorRiesgo = (item: string, field: 'calificacion' | 'observaciones', value: string) => {
    setFormData(prev => ({
      ...prev,
      factores_riesgo: {
        ...prev.factores_riesgo,
        [item]: { ...prev.factores_riesgo[item], [field]: value }
      }
    }));

    // Verificar alertas cuando se actualiza la calificación
    if (field === 'calificacion') {
      verificarAlertasRiesgo();
    }
  };

  const verificarAlertasRiesgo = () => {
    const alertas: string[] = [];

    // Analizar cada categoría de factores de riesgo
    Object.entries(factoresRiesgo).forEach(([_key, categoria]) => {
      const calificaciones = categoria.items
        .map(item => formData.factores_riesgo[item]?.calificacion)
        .filter(cal => cal && cal !== 'na'); // Excluir N/A y vacíos

      if (calificaciones.length === 0) return; // Si no hay calificaciones, saltar

      // Contar altos y medios
      const altos = calificaciones.filter(cal => cal === 'alto').length;
      const medios = calificaciones.filter(cal => cal === 'medio').length;

      // Si el promedio tiende a Alto o Medio, generar alerta
      const totalEvaluados = calificaciones.length;
      const porcentajeAlto = (altos / totalEvaluados) * 100;
      const porcentajeMedio = (medios / totalEvaluados) * 100;

      if (porcentajeAlto >= 50 || (porcentajeAlto + porcentajeMedio) >= 60) {
        alertas.push(`Riesgo en ${categoria.titulo}`);
      }
    });

    setAlertasRiesgo(alertas);
  };

  // Cargar valoración existente si viene ID en la URL
  useEffect(() => {
    const id = searchParams.get('id');
    const modo = searchParams.get('modo');

    if (id) {
      const idNum = parseInt(id);
      if (!isNaN(idNum)) {
        setModoVista(modo === 'ver');
        cargarValoracion(idNum);
      }
    }
  }, [searchParams]);

  const cargarValoracion = async (id: number) => {
    setCargando(true);
    try {
      const data = await api.get<any>(`/valoraciones/${id}`);

      // Mapear fecha de valoración
      if (data.fecha_valoracion) {
        // Parsear directamente la cadena ISO para evitar problemas de zona horaria
        const fechaParts = data.fecha_valoracion.split('-');
        if (fechaParts.length === 3) {
          updateField('fecha_valoracion_ano', fechaParts[0]);
          updateField('fecha_valoracion_mes', fechaParts[1].replace(/^0/, '')); // Quitar cero inicial
          updateField('fecha_valoracion_dia', fechaParts[2].replace(/^0/, '')); // Quitar cero inicial
        }
      }

      // Mapear trabajador
      if (data.trabajador) {
        const t = data.trabajador;
        updateField('nombre_trabajador', t.nombre || '');

        // Separar tipo de documento y número
        if (t.documento) {
          const docParts = t.documento.split(' ');
          if (docParts.length >= 2) {
            updateField('tipo_documento', docParts[0]);
            updateField('numero_documento', docParts.slice(1).join(' '));
          } else {
            updateField('numero_documento', t.documento);
          }
        }

        updateField('identificacion_siniestro', t.identificacion_siniestro || '');

        // Fecha de nacimiento
        if (t.fecha_nacimiento) {
          const fecha = new Date(t.fecha_nacimiento);
          updateField('fecha_nacimiento_dia', fecha.getDate().toString());
          updateField('fecha_nacimiento_mes', (fecha.getMonth() + 1).toString());
          updateField('fecha_nacimiento_ano', fecha.getFullYear().toString());
        }

        updateField('estado_civil', t.estado_civil || '');

        // Nivel educativo - parsear string a checkboxes
        if (t.nivel_educativo) {
          const niveles = t.nivel_educativo.toLowerCase();
          updateField('nivel_formacion_empirica', niveles.includes('formación empírica'));
          updateField('nivel_basica_primaria', niveles.includes('básica primaria'));
          updateField('nivel_bachillerato_vocacional', niveles.includes('bachillerato vocacional'));
          updateField('nivel_bachillerato_modalidad', niveles.includes('bachillerato modalidad'));
          updateField('nivel_tecnico_tecnologico', niveles.includes('técnico') || niveles.includes('tecnológico'));
          updateField('nivel_universitario', niveles.includes('universitario'));
          updateField('nivel_especializacion', niveles.includes('especialización') || niveles.includes('postgrado') || niveles.includes('maestría'));
          updateField('nivel_formacion_informal', niveles.includes('formación informal'));
          updateField('nivel_analfabeta', niveles.includes('analfabeta'));
        }

        updateField('especificar_formacion_oficios', t.formacion_especifica || '');
        updateField('telefonos_trabajador', t.telefonos || '');
        updateField('direccion_residencia_ciudad', t.direccion || '');
        updateField('zona', t.zona || '');
        updateField('diagnostico_esfera_mental', t.diagnostico_mental || '');
      }

      // Mapear info laboral
      if (data.info_laboral) {
        const il = data.info_laboral;
        updateField('fecha_evento_atel', il.fecha_evento_atel || '');
        updateField('eventos_no_laborales', il.eventos_no_laborales ? 'si' : 'no');
        updateField('eventos_no_laborales_fecha', il.evento_no_laboral_fecha || '');
        updateField('eventos_no_laborales_diagnostico', il.evento_no_laboral_diagnostico || '');
        updateField('eps', il.eps || '');
        updateField('fondo_pension', il.fondo_pension || '');
        updateField('tiempo_total_incapacidad_dias', il.dias_incapacidad?.toString() || '');
        updateField('empresa_donde_labora', il.empresa || '');
        updateField('vinculacion_laboral', il.vinculacion_laboral ? 'si' : 'no');
        updateField('tipo_vinculacion_laboral', il.tipo_vinculacion || '');
        updateField('modalidad', il.modalidad || '');
        updateField('tiempo_modalidad', il.tiempo_modalidad || '');
        updateField('nit_empresa', il.nit_empresa || '');

        // Fecha de ingreso
        if (il.fecha_ingreso_empresa) {
          const fecha = new Date(il.fecha_ingreso_empresa);
          updateField('fecha_ingreso_dia', fecha.getDate().toString());
          updateField('fecha_ingreso_mes', (fecha.getMonth() + 1).toString());
          updateField('fecha_ingreso_ano', fecha.getFullYear().toString());
        }

        updateField('antiguedad_empresa_anos', il.antiguedad_empresa_anos?.toString() || '');
        updateField('antiguedad_empresa_meses', il.antiguedad_empresa_meses?.toString() || '');
        updateField('antiguedad_cargo_anos', il.antiguedad_cargo_anos?.toString() || '');
        updateField('antiguedad_cargo_meses', il.antiguedad_cargo_meses?.toString() || '');
        updateField('contacto_empresa_cargo', il.contacto_empresa || '');
        updateField('correos_electronicos', il.correos || '');
        updateField('telefonos_contacto_empresa', il.telefonos_empresa || '');
      }

      // Mapear historia ocupacional
      if (data.historia_ocupacional && data.historia_ocupacional.length > 0) {
        const historia = data.historia_ocupacional.map((h: any) => ({
          empresa: h.empresa || '',
          cargo_funciones_tareas: h.cargo_funciones || '',
          tiempo_duracion: h.duracion || '',
          motivo_retiro: h.motivo_retiro || '',
        }));

        // Asegurar que siempre haya 3 elementos
        while (historia.length < 3) {
          historia.push({ empresa: '', cargo_funciones_tareas: '', tiempo_duracion: '', motivo_retiro: '' });
        }

        updateField('historia_ocupacional', historia.slice(0, 3));
      }

      // Mapear actividad laboral
      if (data.actividad_laboral) {
        const al = data.actividad_laboral;
        updateField('otros_oficios_desempenados', al.otros_oficios || '');
        updateField('oficios_interes', al.oficios_interes || '');
        updateField('nombre_cargo', al.nombre_cargo || '');
        updateField('tareas_nombre_descripcion', al.tareas || '');
        updateField('herramientas_trabajo', al.herramientas || '');
        updateField('horario_trabajo', al.horario || '');
        updateField('elementos_proteccion_personal', al.elementos_proteccion || '');
      }

      // Mapear evaluaciones de riesgo
      if (data.evaluaciones_riesgo && data.evaluaciones_riesgo.length > 0) {
        const factoresInit: Record<string, { calificacion: string; observaciones: string }> = {};

        // Primero inicializar todos con valores vacíos
        Object.values(factoresRiesgo).forEach(categoria => {
          categoria.items.forEach(item => {
            factoresInit[item] = { calificacion: '', observaciones: '' };
          });
        });

        // Luego mapear las evaluaciones existentes
        // Necesitamos crear un mapeo de categoria + item_numero a nombre del item
        const categoriaItemMap: Record<string, Record<number, string>> = {};
        Object.entries(factoresRiesgo).forEach(([categoriaKey, categoria]) => {
          categoriaItemMap[categoriaKey] = {};
          categoria.items.forEach((item, index) => {
            categoriaItemMap[categoriaKey][index + 1] = item;
          });
        });

        // Mapear las evaluaciones
        data.evaluaciones_riesgo.forEach((ev: any) => {
          const categoria = ev.categoria;
          const itemNumero = ev.item_numero;

          if (categoriaItemMap[categoria] && categoriaItemMap[categoria][itemNumero]) {
            const itemNombre = categoriaItemMap[categoria][itemNumero];
            factoresInit[itemNombre] = {
              calificacion: ev.calificacion || '',
              observaciones: ev.observaciones || '',
            };
          }
        });

        updateField('factores_riesgo', factoresInit);
      }

      // Mapear concepto
      if (data.concepto) {
        const c = data.concepto;
        updateField('concepto_psicologico_final', c.concepto_editado || c.concepto_generado || '');
        updateField('orientacion_psicologica_reintegro', c.orientacion_reintegro || '');
        updateField('elaboro_nombre', c.elaboro_nombre || '');
        updateField('elaboro_firma', c.elaboro_firma || '');
        updateField('reviso_nombre', c.reviso_nombre || '');
        updateField('reviso_firma', c.reviso_firma || '');
      }

      // Guardar el ID para posteriores actualizaciones
      setValoracionId(id);

      toast.success('Valoración cargada exitosamente');
    } catch (error: any) {
      console.error('Error al cargar valoración:', error);
      toast.error(error.message || 'Error al cargar la valoración');
      router.push('/dashboard/valoraciones');
    } finally {
      setCargando(false);
    }
  };

  const validarPasoActual = (): boolean => {
    const errores: string[] = [];

    switch (currentStep) {
      case 1: // Identificación
        if (!formData.nombre_trabajador.trim()) {
          errores.push('El nombre del trabajador es requerido');
        }
        if (!formData.tipo_documento) {
          errores.push('El tipo de documento es requerido');
        }
        if (!formData.numero_documento.trim()) {
          errores.push('El número de documento es requerido');
        }
        break;
      case 2: // Info Laboral
        if (!formData.empresa_donde_labora.trim()) {
          errores.push('El nombre de la empresa es requerido');
        }
        if (!formData.fecha_evento_atel) {
          errores.push('La fecha del evento ATEL es requerida');
        }
        break;
      case 4: // Actividad Laboral
        if (!formData.nombre_cargo.trim()) {
          errores.push('El nombre del cargo es requerido');
        }
        break;
      case 6: // Concepto Final
        if (!formData.concepto_psicologico_final.trim()) {
          errores.push('El concepto psicológico final es requerido');
        }
        if (!formData.elaboro_nombre.trim()) {
          errores.push('El nombre de quien elaboró es requerido');
        }
        break;
    }

    if (errores.length > 0) {
      setValidationErrors(errores);
      setShowValidationModal(true);
      return false;
    }

    return true;
  };

  const nextStep = () => {
    if (validarPasoActual() && currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const mapearEvaluacionesRiesgo = () => {
    const evaluaciones: any[] = [];

    Object.entries(factoresRiesgo).forEach(([categoriaKey, categoria]) => {
      categoria.items.forEach((item, index) => {
        const evaluacion = formData.factores_riesgo[item];
        if (evaluacion && evaluacion.calificacion && evaluacion.calificacion !== 'na') {
          evaluaciones.push({
            categoria: categoriaKey,
            item_numero: index + 1,
            item_texto: item,
            calificacion: evaluacion.calificacion,
            observaciones: evaluacion.observaciones || null,
          });
        }
      });
    });

    return evaluaciones;
  };

  const handleSave = async (estado: 'borrador' | 'completada', redirectAfter = true) => {
    setSaving(true);
    try {
      // Construir fecha de valoración
      const fechaValoracion = formData.fecha_valoracion_ano && formData.fecha_valoracion_mes && formData.fecha_valoracion_dia
        ? `${formData.fecha_valoracion_ano}-${formData.fecha_valoracion_mes.padStart(2, '0')}-${formData.fecha_valoracion_dia.padStart(2, '0')}`
        : new Date().toISOString().split('T')[0];

      // Construir nivel educativo string
      const nivelEducativo = [
        formData.nivel_formacion_empirica && 'Formación empírica',
        formData.nivel_basica_primaria && 'Básica primaria',
        formData.nivel_bachillerato_vocacional && 'Bachillerato vocacional 9°',
        formData.nivel_bachillerato_modalidad && 'Bachillerato modalidad',
        formData.nivel_tecnico_tecnologico && 'Técnico/Tecnológico',
        formData.nivel_universitario && 'Universitario',
        formData.nivel_especializacion && 'Especialización/Postgrado/Maestría',
        formData.nivel_formacion_informal && 'Formación informal oficios',
        formData.nivel_analfabeta && 'Analfabeta',
      ].filter(Boolean).join(', ');

      const payload = {
        fecha_valoracion: fechaValoracion,
        estado,
        trabajador: {
          nombre: formData.nombre_trabajador,
          documento: `${formData.tipo_documento || 'CC'} ${formData.numero_documento}`,
          identificacion_siniestro: formData.identificacion_siniestro,
          fecha_nacimiento: formData.fecha_nacimiento_ano && formData.fecha_nacimiento_mes && formData.fecha_nacimiento_dia
            ? `${formData.fecha_nacimiento_ano}-${formData.fecha_nacimiento_mes.padStart(2, '0')}-${formData.fecha_nacimiento_dia.padStart(2, '0')}`
            : null,
          estado_civil: formData.estado_civil || null,
          nivel_educativo: nivelEducativo,
          formacion_especifica: formData.especificar_formacion_oficios,
          telefonos: formData.telefonos_trabajador,
          direccion: formData.direccion_residencia_ciudad,
          zona: formData.zona || null,
          diagnostico_mental: formData.diagnostico_esfera_mental,
        },
        info_laboral: {
          fecha_evento_atel: formData.fecha_evento_atel || null,
          eventos_no_laborales: formData.eventos_no_laborales === 'si',
          evento_no_laboral_fecha: formData.eventos_no_laborales_fecha || null,
          evento_no_laboral_diagnostico: formData.eventos_no_laborales_diagnostico,
          eps: formData.eps,
          fondo_pension: formData.fondo_pension,
          dias_incapacidad: formData.tiempo_total_incapacidad_dias ? parseInt(formData.tiempo_total_incapacidad_dias) : null,
          empresa: formData.empresa_donde_labora,
          nit_empresa: formData.nit_empresa,
          vinculacion_laboral: formData.vinculacion_laboral === 'si',
          tipo_vinculacion: formData.tipo_vinculacion_laboral,
          modalidad: formData.modalidad || null,
          tiempo_modalidad: formData.tiempo_modalidad,
          fecha_ingreso_empresa: formData.fecha_ingreso_ano && formData.fecha_ingreso_mes && formData.fecha_ingreso_dia
            ? `${formData.fecha_ingreso_ano}-${formData.fecha_ingreso_mes.padStart(2, '0')}-${formData.fecha_ingreso_dia.padStart(2, '0')}`
            : null,
          antiguedad_empresa_anos: formData.antiguedad_empresa_anos ? parseInt(formData.antiguedad_empresa_anos) : null,
          antiguedad_empresa_meses: formData.antiguedad_empresa_meses ? parseInt(formData.antiguedad_empresa_meses) : null,
          antiguedad_cargo_anos: formData.antiguedad_cargo_anos ? parseInt(formData.antiguedad_cargo_anos) : null,
          antiguedad_cargo_meses: formData.antiguedad_cargo_meses ? parseInt(formData.antiguedad_cargo_meses) : null,
          contacto_empresa: formData.contacto_empresa_cargo,
          correos: formData.correos_electronicos,
          telefonos_empresa: formData.telefonos_contacto_empresa,
        },
        historia_ocupacional: formData.historia_ocupacional
          .filter(h => h.empresa || h.cargo_funciones_tareas)
          .map((h, i) => ({
            orden: i + 1,
            empresa: h.empresa,
            cargo_funciones: h.cargo_funciones_tareas,
            duracion: h.tiempo_duracion,
            motivo_retiro: h.motivo_retiro,
          })),
        actividad_laboral: {
          nombre_cargo: formData.nombre_cargo,
          tareas: formData.tareas_nombre_descripcion,
          herramientas: formData.herramientas_trabajo,
          horario: formData.horario_trabajo,
          elementos_proteccion: formData.elementos_proteccion_personal,
          otros_oficios: formData.otros_oficios_desempenados,
          oficios_interes: formData.oficios_interes,
        },
        evaluaciones_riesgo: mapearEvaluacionesRiesgo(),
        concepto: {
          concepto_editado: formData.concepto_psicologico_final,
          orientacion_reintegro: formData.orientacion_psicologica_reintegro,
          elaboro_nombre: formData.elaboro_nombre,
          elaboro_firma: formData.elaboro_firma,
          reviso_nombre: formData.reviso_nombre,
          reviso_firma: formData.reviso_firma,
        },
      };

      let result: any;
      if (valoracionId) {
        // Actualizar valoración existente
        result = await api.put(`/valoraciones/${valoracionId}`, payload);
      } else {
        // Crear nueva valoración
        result = await api.post('/valoraciones/', payload);
        setValoracionId(result.id);
      }

      toast.success(estado === 'borrador' ? 'Borrador guardado' : 'Valoración creada exitosamente');

      if (redirectAfter) {
        router.push('/dashboard/valoraciones');
      }

      return result;
    } catch (error: any) {
      console.error('Error al guardar valoración:', error);
      toast.error(error.message || 'Error al guardar');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleFinalizar = async () => {
    setFinalizando(true);
    try {
      // Validaciones previas
      if (!formData.concepto_psicologico_final.trim()) {
        toast.error('Debe generar o escribir el concepto psicológico final antes de finalizar');
        return;
      }

      if (!formData.elaboro_nombre.trim()) {
        toast.error('Debe ingresar el nombre de quien elaboró la valoración');
        return;
      }

      if (!formData.reviso_nombre.trim()) {
        toast.error('Debe ingresar el nombre de quien revisó la valoración');
        return;
      }

      // Si no hay valoracionId, guardar primero como borrador
      let currentValoracionId = valoracionId;
      if (!currentValoracionId) {
        toast.info('Guardando valoración...');
        const result: any = await handleSave('borrador', false);
        if (!result || !result.id) {
          toast.error('No se pudo guardar la valoración');
          return;
        }
        currentValoracionId = result.id;
      } else {
        // Si ya existe, actualizarla antes de finalizar
        await handleSave('borrador', false);
      }

      // Llamar al endpoint de finalizar
      toast.info('Generando archivo PDF...');
      const response: any = await api.post(`/valoraciones/${currentValoracionId}/finalizar`, {});

      toast.success('Valoración finalizada exitosamente');

      // Guardar las URLs para el modal de descarga
      setDownloadUrls({
        pdf_url: response.pdf_url,
        pdf_filename: response.pdf_filename,
        excel_url: response.excel_url,
        excel_filename: response.excel_filename
      });

      // Mostrar modal de descarga
      setShowDownloadModal(true);

    } catch (error: any) {
      toast.error(error.message || 'Error al finalizar la valoración');
    } finally {
      setFinalizando(false);
    }
  };

  const generarConceptoAutomatico = async () => {
    setGenerandoConcepto(true);
    try {
      // Verificar que haya evaluaciones de riesgo
      const evaluaciones = mapearEvaluacionesRiesgo();
      if (evaluaciones.length === 0) {
        toast.error('Debe completar la evaluación de factores de riesgo antes de generar el concepto');
        return;
      }

      // Verificar que haya nombre de trabajador
      if (!formData.nombre_trabajador.trim()) {
        toast.error('Debe ingresar el nombre del trabajador');
        return;
      }

      // Verificar si tiene diagnóstico mental
      const tieneDiagnostico = formData.diagnostico_esfera_mental && formData.diagnostico_esfera_mental.trim() !== '';

      // Llamar al endpoint de generar concepto enviando las evaluaciones directamente
      const response: any = await api.post('/conceptos/generar', {
        valoracion_id: valoracionId || null,
        evaluaciones: evaluaciones,
        nombre_trabajador: formData.nombre_trabajador,
        tiene_diagnostico_mental: tieneDiagnostico
      });

      console.log('Respuesta generación concepto:', response);

      let conceptoTexto = '';

      // Manejo robusto de la respuesta
      if (response && response.concepto) {
        if (typeof response.concepto === 'string') {
          conceptoTexto = response.concepto;
        } else if (typeof response.concepto === 'object') {
          // Si es un objeto, intentar extraer el texto si tiene propiedad 'concepto' o similar
          if (response.concepto.concepto) {
            conceptoTexto = response.concepto.concepto;
          } else {
            // Si no, convertir a string para ver qué es
            console.warn('Concepto recibido como objeto:', response.concepto);
            conceptoTexto = JSON.stringify(response.concepto, null, 2);
          }
        } else {
          conceptoTexto = String(response.concepto);
        }
      } else if (typeof response === 'string') {
        conceptoTexto = response;
      }

      // Actualizar el campo con el concepto generado
      updateField('concepto_psicologico_final', conceptoTexto);

      toast.success('Concepto generado exitosamente');
    } catch (error: any) {
      console.error('Error generando concepto:', error);
      toast.error(error.message || 'Error al generar el concepto');
    } finally {
      setGenerandoConcepto(false);
    }
  };

  // Mostrar loading mientras carga
  if (cargando) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Cargando valoración...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {modoVista ? 'VER VALORACIÓN' : valoracionId ? 'EDITAR VALORACIÓN' : 'NUEVA VALORACIÓN'} DE PSICOLOGÍA PARA RECOMENDACIONES LABORALES
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {modoVista
            ? 'Visualización de la valoración psicológica. No se pueden realizar modificaciones.'
            : valoracionId
              ? 'Edite los campos necesarios y guarde los cambios.'
              : 'Complete todos los pasos del formulario. Al finalizar se generará automáticamente el archivo PDF.'}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex items-center min-w-max">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${currentStep === step.id
                  ? 'bg-indigo-500 text-white'
                  : currentStep > step.id
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-[#333333] dark:text-[#b0b0b0]'
                  }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">{step.title}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-300 dark:bg-[#333333]'
                  }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="border-gray-200 dark:border-[#333333] dark:bg-[#2a2a2a]">
        <CardHeader className="bg-gray-50 dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-[#333333]">
          <CardTitle className="text-gray-700 dark:text-white">
            {steps[currentStep - 1].title.toUpperCase()}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">

          {/* ============ PASO 1: IDENTIFICACIÓN ============ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Fecha de Valoración */}
              <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                <Label className="text-sm font-semibold mb-3 block">FECHA DE VALORACIÓN:</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">día</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.fecha_valoracion_dia}
                      onChange={(e) => updateField('fecha_valoracion_dia', e.target.value)}
                      maxLength={2}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">mes</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.fecha_valoracion_mes}
                      onChange={(e) => updateField('fecha_valoracion_mes', e.target.value)}
                      maxLength={2}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">año</Label>
                    <Input
                      className="w-20 text-center"
                      value={formData.fecha_valoracion_ano}
                      onChange={(e) => updateField('fecha_valoracion_ano', e.target.value)}
                      maxLength={4}
                      disabled={modoVista}
                    />
                  </div>
                </div>
              </div>

              {/* Datos del trabajador */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del trabajador <span className="text-red-500">*</span></Label>
                  <Input
                    value={formData.nombre_trabajador}
                    onChange={(e) => updateField('nombre_trabajador', e.target.value)}
                    required
                    disabled={modoVista}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de documento <span className="text-red-500">*</span></Label>
                    <RadioGroup
                      value={formData.tipo_documento}
                      onValueChange={(v) => updateField('tipo_documento', v)}
                      className="flex flex-wrap gap-3"
                      disabled={modoVista}
                    >
                      {[
                        { value: 'CC', label: 'CC' },
                        { value: 'TI', label: 'TI' },
                        { value: 'CE', label: 'CE' },
                        { value: 'PEP', label: 'PEP' },
                        { value: 'PPT', label: 'PPT' },
                      ].map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={option.value} id={`tipo_doc_${option.value}`} />
                          <Label htmlFor={`tipo_doc_${option.value}`} className="text-sm font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label>Número de documento <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.numero_documento}
                      onChange={(e) => updateField('numero_documento', e.target.value)}
                      required
                      disabled={modoVista}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Identificación del siniestro</Label>
                  <Input
                    value={formData.identificacion_siniestro}
                    onChange={(e) => updateField('identificacion_siniestro', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
              </div>

              {/* Fecha de nacimiento */}
              <div className="space-y-2">
                <Label>Fecha de nacimiento/edad</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">día</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.fecha_nacimiento_dia}
                      onChange={(e) => updateField('fecha_nacimiento_dia', e.target.value)}
                      maxLength={2}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">mes</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.fecha_nacimiento_mes}
                      onChange={(e) => updateField('fecha_nacimiento_mes', e.target.value)}
                      maxLength={2}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">año</Label>
                    <Input
                      className="w-20 text-center"
                      value={formData.fecha_nacimiento_ano}
                      onChange={(e) => updateField('fecha_nacimiento_ano', e.target.value)}
                      maxLength={4}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">edad</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.edad}
                      onChange={(e) => updateField('edad', e.target.value)}
                      disabled={modoVista}
                    />
                    <span className="text-xs text-gray-500">años</span>
                  </div>
                </div>
              </div>

              {/* Estado Civil */}
              <div className="space-y-2">
                <Label>Estado civil</Label>
                <RadioGroup
                  value={formData.estado_civil}
                  onValueChange={(v) => updateField('estado_civil', v)}
                  className="flex flex-wrap gap-4"
                  disabled={modoVista}
                >
                  {[
                    { value: 'casado', label: 'Casado' },
                    { value: 'soltero', label: 'Soltero' },
                    { value: 'union_libre', label: 'Unión libre' },
                    { value: 'separado', label: 'Separado' },
                    { value: 'viudo', label: 'Viudo' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={`estado_${option.value}`} />
                      <Label htmlFor={`estado_${option.value}`} className="text-sm font-normal">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Nivel Educativo */}
              <div className="space-y-3">
                <Label>Nivel educativo</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { field: 'nivel_formacion_empirica', label: 'Formación empírica' },
                    { field: 'nivel_basica_primaria', label: 'Básica primaria' },
                    { field: 'nivel_bachillerato_vocacional', label: 'Bachillerato: vocacional 9°' },
                    { field: 'nivel_bachillerato_modalidad', label: 'Bachillerato: modalidad' },
                    { field: 'nivel_tecnico_tecnologico', label: 'Técnico/Tecnológico' },
                    { field: 'nivel_universitario', label: 'Universitario' },
                    { field: 'nivel_especializacion', label: 'Especialización/postgrado/maestría' },
                    { field: 'nivel_formacion_informal', label: 'Formación informal oficios' },
                    { field: 'nivel_analfabeta', label: 'Analfabeta' },
                  ].map((item) => (
                    <div key={item.field} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.field}
                        checked={formData[item.field as keyof typeof formData] as boolean}
                        onCheckedChange={(checked) => updateField(item.field, checked)}
                        disabled={modoVista}
                      />
                      <Label htmlFor={item.field} className="text-sm font-normal">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Especificar formación y oficios que conoce</Label>
                  <Textarea
                    value={formData.especificar_formacion_oficios}
                    onChange={(e) => updateField('especificar_formacion_oficios', e.target.value)}
                    rows={2}
                    disabled={modoVista}
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="space-y-2">
                <Label>Teléfonos trabajador</Label>
                <Input
                  value={formData.telefonos_trabajador}
                  onChange={(e) => updateField('telefonos_trabajador', e.target.value)}
                  disabled={modoVista}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Dirección residencia y ciudad</Label>
                  <Input
                    value={formData.direccion_residencia_ciudad}
                    onChange={(e) => updateField('direccion_residencia_ciudad', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zona</Label>
                  <RadioGroup
                    value={formData.zona}
                    onValueChange={(v) => updateField('zona', v)}
                    className="flex gap-4"
                    disabled={modoVista}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urbano" id="zona_urbano" />
                      <Label htmlFor="zona_urbano" className="text-sm font-normal">Urbano</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="rural" id="zona_rural" />
                      <Label htmlFor="zona_rural" className="text-sm font-normal">Rural</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Diagnóstico de esfera mental reconocidos</Label>
                <Textarea
                  value={formData.diagnostico_esfera_mental}
                  onChange={(e) => updateField('diagnostico_esfera_mental', e.target.value)}
                  rows={3}
                  disabled={modoVista}
                />
              </div>
            </div>
          )}

          {/* ============ PASO 2: INFO LABORAL ============ */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Fecha(s) del evento(s) ATEL <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.fecha_evento_atel}
                  onChange={(e) => updateField('fecha_evento_atel', e.target.value)}
                  className="max-w-xs"
                  required
                  disabled={modoVista}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Eventos No laborales</Label>
                  <RadioGroup
                    value={formData.eventos_no_laborales}
                    onValueChange={(v) => updateField('eventos_no_laborales', v)}
                    className="flex gap-4"
                    disabled={modoVista}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="eventos_si" />
                      <Label htmlFor="eventos_si" className="text-sm font-normal">Sí</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="eventos_no" />
                      <Label htmlFor="eventos_no" className="text-sm font-normal">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={formData.eventos_no_laborales_fecha}
                    onChange={(e) => updateField('eventos_no_laborales_fecha', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Diagnóstico</Label>
                  <Input
                    value={formData.eventos_no_laborales_diagnostico}
                    onChange={(e) => updateField('eventos_no_laborales_diagnostico', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>EPS</Label>
                  <Input
                    value={formData.eps}
                    onChange={(e) => updateField('eps', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fondo de Pensión</Label>
                  <Input
                    value={formData.fondo_pension}
                    onChange={(e) => updateField('fondo_pension', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tiempo total de incapacidad (días)</Label>
                <Input
                  type="number"
                  value={formData.tiempo_total_incapacidad_dias}
                  onChange={(e) => updateField('tiempo_total_incapacidad_dias', e.target.value)}
                  className="w-32"
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Empresa donde labora*</Label>
                <Input
                  value={formData.empresa_donde_labora}
                  onChange={(e) => updateField('empresa_donde_labora', e.target.value)}
                  disabled={modoVista}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vinculación laboral</Label>
                  <RadioGroup
                    value={formData.vinculacion_laboral}
                    onValueChange={(v) => updateField('vinculacion_laboral', v)}
                    className="flex gap-4"
                    disabled={modoVista}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="no" id="vinc_no" />
                      <Label htmlFor="vinc_no" className="text-sm font-normal">NO</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="si" id="vinc_si" />
                      <Label htmlFor="vinc_si" className="text-sm font-normal">SI</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de vinculación laboral</Label>
                  <Input
                    value={formData.tipo_vinculacion_laboral}
                    onChange={(e) => updateField('tipo_vinculacion_laboral', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Modalidad</Label>
                  <RadioGroup
                    value={formData.modalidad}
                    onValueChange={(v) => updateField('modalidad', v)}
                    className="flex flex-wrap gap-4"
                    disabled={modoVista}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="presencial" id="mod_presencial" />
                      <Label htmlFor="mod_presencial" className="text-sm font-normal">Presencial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="teletrabajo" id="mod_teletrabajo" />
                      <Label htmlFor="mod_teletrabajo" className="text-sm font-normal">Teletrabajo</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="trabajo_en_casa" id="mod_casa" />
                      <Label htmlFor="mod_casa" className="text-sm font-normal">Trabajo en casa</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label>Tiempo de la modalidad</Label>
                  <Input
                    value={formData.tiempo_modalidad}
                    onChange={(e) => updateField('tiempo_modalidad', e.target.value)}
                    disabled={modoVista}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>NIT de la Empresa</Label>
                <Input
                  value={formData.nit_empresa}
                  onChange={(e) => updateField('nit_empresa', e.target.value)}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Fecha ingreso a la empresa/antigüedad en la empresa</Label>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">día</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.fecha_ingreso_dia}
                      onChange={(e) => updateField('fecha_ingreso_dia', e.target.value)}
                      maxLength={2}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">mes</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.fecha_ingreso_mes}
                      onChange={(e) => updateField('fecha_ingreso_mes', e.target.value)}
                      maxLength={2}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">año</Label>
                    <Input
                      className="w-20 text-center"
                      value={formData.fecha_ingreso_ano}
                      onChange={(e) => updateField('fecha_ingreso_ano', e.target.value)}
                      maxLength={4}
                      disabled={modoVista}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Tiempo:</Label>
                    <Input
                      className="w-16 text-center"
                      value={formData.antiguedad_empresa_anos}
                      onChange={(e) => updateField('antiguedad_empresa_anos', e.target.value)}
                      disabled={modoVista}
                    />
                    <span className="text-xs">años</span>
                    <Input
                      className="w-16 text-center"
                      value={formData.antiguedad_empresa_meses}
                      onChange={(e) => updateField('antiguedad_empresa_meses', e.target.value)}
                      disabled={modoVista}
                    />
                    <span className="text-xs">meses</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Antigüedad en el cargo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-16 text-center"
                    value={formData.antiguedad_cargo_anos}
                    onChange={(e) => updateField('antiguedad_cargo_anos', e.target.value)}
                    disabled={modoVista}
                  />
                  <span className="text-xs">años</span>
                  <Input
                    className="w-16 text-center"
                    value={formData.antiguedad_cargo_meses}
                    onChange={(e) => updateField('antiguedad_cargo_meses', e.target.value)}
                    disabled={modoVista}
                  />
                  <span className="text-xs">meses</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Contacto en empresa/cargo</Label>
                <Input
                  value={formData.contacto_empresa_cargo}
                  onChange={(e) => updateField('contacto_empresa_cargo', e.target.value)}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Correo(s) electrónico(s)</Label>
                <Input
                  value={formData.correos_electronicos}
                  onChange={(e) => updateField('correos_electronicos', e.target.value)}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfonos de contacto empresa</Label>
                <Input
                  value={formData.telefonos_contacto_empresa}
                  onChange={(e) => updateField('telefonos_contacto_empresa', e.target.value)}
                  disabled={modoVista}
                />
              </div>
            </div>
          )}

          {/* ============ PASO 3: HISTORIA OCUPACIONAL ============ */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                (Trabajos desempeñados, comenzando por el primero de su historia laboral)
              </p>

              {/* Tabla de historia ocupacional */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-slate-700">
                      <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left text-sm font-semibold">Empresa</th>
                      <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left text-sm font-semibold">Cargo - funciones / tareas</th>
                      <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left text-sm font-semibold">Tiempo/duración</th>
                      <th className="border border-gray-300 dark:border-slate-600 px-3 py-2 text-left text-sm font-semibold">Motivo de retiro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.historia_ocupacional.map((historia, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 dark:border-slate-600 p-1">
                          <Input
                            className="border-0"
                            value={historia.empresa}
                            onChange={(e) => updateHistoria(index, 'empresa', e.target.value)}
                            disabled={modoVista}
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-slate-600 p-1">
                          <Input
                            className="border-0"
                            value={historia.cargo_funciones_tareas}
                            onChange={(e) => updateHistoria(index, 'cargo_funciones_tareas', e.target.value)}
                            disabled={modoVista}
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-slate-600 p-1">
                          <Input
                            className="border-0"
                            value={historia.tiempo_duracion}
                            onChange={(e) => updateHistoria(index, 'tiempo_duracion', e.target.value)}
                            disabled={modoVista}
                          />
                        </td>
                        <td className="border border-gray-300 dark:border-slate-600 p-1">
                          <Input
                            className="border-0"
                            value={historia.motivo_retiro}
                            onChange={(e) => updateHistoria(index, 'motivo_retiro', e.target.value)}
                            disabled={modoVista}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <Label>Otros Oficios desempeñados:</Label>
                <Textarea
                  value={formData.otros_oficios_desempenados}
                  onChange={(e) => updateField('otros_oficios_desempenados', e.target.value)}
                  rows={2}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Oficios de interés:</Label>
                <Textarea
                  value={formData.oficios_interes}
                  onChange={(e) => updateField('oficios_interes', e.target.value)}
                  rows={2}
                  disabled={modoVista}
                />
              </div>
            </div>
          )}

          {/* ============ PASO 4: ACTIVIDAD LABORAL ACTUAL ============ */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">
                DESCRIPCIÓN ACTIVIDAD LABORAL ACTUAL * (antes del evento)
              </p>

              <div className="space-y-2">
                <Label>Nombre del cargo <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.nombre_cargo}
                  onChange={(e) => updateField('nombre_cargo', e.target.value)}
                  required
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Tareas (nombre y descripción):</Label>
                <Textarea
                  value={formData.tareas_nombre_descripcion}
                  onChange={(e) => updateField('tareas_nombre_descripcion', e.target.value)}
                  rows={4}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Herramientas de trabajo:</Label>
                <Textarea
                  value={formData.herramientas_trabajo}
                  onChange={(e) => updateField('herramientas_trabajo', e.target.value)}
                  rows={2}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Horario de trabajo:</Label>
                <Input
                  value={formData.horario_trabajo}
                  onChange={(e) => updateField('horario_trabajo', e.target.value)}
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label>Elementos de Protección Personal:</Label>
                <Textarea
                  value={formData.elementos_proteccion_personal}
                  onChange={(e) => updateField('elementos_proteccion_personal', e.target.value)}
                  rows={2}
                  disabled={modoVista}
                />
              </div>
            </div>
          )}

          {/* ============ PASO 5: FACTORES DE RIESGO PSICOSOCIALES ============ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                FACTORES DE RIESGO PSICOSOCIALES - Califique cada factor según corresponda
              </p>

              {/* Alertas de Riesgo */}
              {alertasRiesgo.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                        ⚠️ Alertas de Riesgo Detectadas
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {alertasRiesgo.map((alerta, idx) => (
                          <li key={idx} className="text-red-700 dark:text-red-300 text-sm">
                            {alerta}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {Object.entries(factoresRiesgo).map(([key, categoria]) => (
                <div key={key} className="border border-gray-200 dark:border-[#333333] rounded-lg overflow-hidden">
                  <div className="bg-gray-50 dark:bg-[#1a1a1a] px-4 py-2 border-b border-gray-200 dark:border-[#333333]">
                    <h4 className="font-semibold text-gray-700 dark:text-white text-sm">
                      {categoria.titulo}
                    </h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#1a1a1a]">
                          <th className="text-left px-3 py-2 font-medium w-1/2">Factor</th>
                          <th className="text-center px-2 py-2 font-medium w-16">ALTO</th>
                          <th className="text-center px-2 py-2 font-medium w-16">MEDIO</th>
                          <th className="text-center px-2 py-2 font-medium w-16">BAJO</th>
                          <th className="text-center px-2 py-2 font-medium w-16">N/A</th>
                          <th className="text-left px-3 py-2 font-medium">OBSERVACIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoria.items.map((item, idx) => (
                          <tr key={idx} className="border-t border-gray-100 dark:border-slate-700">
                            <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{item}</td>
                            {['alto', 'medio', 'bajo', 'na'].map((nivel) => (
                              <td key={nivel} className="text-center px-2 py-2">
                                <input
                                  type="radio"
                                  name={`factor_${key}_${idx}`}
                                  checked={formData.factores_riesgo[item]?.calificacion === nivel}
                                  onChange={() => {
                                    // Permitir des-seleccionar haciendo clic de nuevo
                                    if (formData.factores_riesgo[item]?.calificacion === nivel) {
                                      updateFactorRiesgo(item, 'calificacion', '');
                                    } else {
                                      updateFactorRiesgo(item, 'calificacion', nivel);
                                    }
                                  }}
                                  className="w-4 h-4 text-indigo-500 cursor-pointer"
                                  disabled={modoVista}
                                />
                              </td>
                            ))}
                            <td className="px-2 py-2">
                              <Input
                                className="h-8 text-xs"
                                value={formData.factores_riesgo[item]?.observaciones || ''}
                                onChange={(e) => updateFactorRiesgo(item, 'observaciones', e.target.value)}
                                placeholder="Observaciones"
                                disabled={modoVista}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ============ PASO 6: CONCEPTO FINAL ============ */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-semibold">CONCEPTO PSICOLÓGICO FINAL <span className="text-red-500">*</span></Label>
                  {!modoVista && (
                    <Button
                      type="button"
                      onClick={generarConceptoAutomatico}
                      disabled={generandoConcepto}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {generandoConcepto ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          {formData.concepto_psicologico_final ? 'Regenerar Concepto' : 'Generar Concepto Automáticamente'}
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {!modoVista && formData.concepto_psicologico_final && (
                  <div className="text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md mb-2">
                    <strong>Nota:</strong> Si modificó los factores de riesgo, puede regenerar el concepto haciendo clic en el botón de arriba.
                  </div>
                )}
                <Textarea
                  value={formData.concepto_psicologico_final}
                  onChange={(e) => updateField('concepto_psicologico_final', e.target.value)}
                  rows={12}
                  placeholder="Escriba el concepto psicológico final de la valoración o genérelo automáticamente usando el botón de arriba..."
                  required
                  disabled={modoVista}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">ORIENTACIÓN PSICOLÓGICA PARA REINTEGRO LABORAL</Label>
                <Textarea
                  value={formData.orientacion_psicologica_reintegro}
                  onChange={(e) => updateField('orientacion_psicologica_reintegro', e.target.value)}
                  rows={6}
                  placeholder="Escriba las orientaciones y recomendaciones para el reintegro laboral..."
                  disabled={modoVista}
                />
              </div>

              {/* Firmas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Elaboró</h4>
                  <FileUpload
                    value={formData.elaboro_firma}
                    onChange={(url) => updateField('elaboro_firma', url)}
                    label="Subir firma (Elaboró)"
                    accept="image/*,.pdf"
                    maxSize={5}
                    preview={true}
                  />
                  <div className="space-y-2">
                    <Label>Nombre y Apellido <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.elaboro_nombre}
                      onChange={(e) => updateField('elaboro_nombre', e.target.value)}
                      placeholder="Profesionales que realizan la valoración"
                      required
                      disabled={modoVista}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-700 dark:text-gray-300">Revisión por Proveedor</h4>
                  <FileUpload
                    value={formData.reviso_firma}
                    onChange={(url) => updateField('reviso_firma', url)}
                    label="Subir firma (Revisó)"
                    accept="image/*,.pdf"
                    maxSize={5}
                    preview={true}
                  />
                  <div className="space-y-2">
                    <Label>Nombre y Apellido</Label>
                    <Input
                      value={formData.reviso_nombre}
                      onChange={(e) => updateField('reviso_nombre', e.target.value)}
                      placeholder="Profesional que revisa la valoración"
                      disabled={modoVista}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {modoVista ? (
                // Modo Vista: Solo botón de volver
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard/valoraciones')}
                  className="gap-2"
                >
                  Volver al Listado
                </Button>
              ) : (
                // Modo Edición/Creación: Mostrar botones de guardar y finalizar
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleSave('borrador')}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {valoracionId ? 'Guardar Cambios' : 'Guardar Borrador'}
                  </Button>

                  {currentStep < 6 ? (
                    <Button onClick={nextStep} className="gap-2 bg-indigo-500 hover:bg-indigo-600">
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleFinalizar}
                      disabled={finalizando || saving}
                      className="gap-2 bg-green-500 hover:bg-green-600"
                    >
                      {finalizando ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Finalizando y Generando PDF...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4" />
                          Finalizar y Generar PDF
                        </>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Validación */}
      <Modal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        title="Campos Requeridos"
        size="md"
        footer={
          <div className="flex justify-end">
            <Button
              onClick={() => setShowValidationModal(false)}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Entendido
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">
                Por favor complete los siguientes campos:
              </h4>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, idx) => (
                  <li key={idx} className="text-red-700 dark:text-red-300 text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal de Descarga de Archivos */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => {
          setShowDownloadModal(false);
          router.push('/dashboard/valoraciones');
        }}
        title="Valoración Finalizada Exitosamente"
        size="xl"
        footer={
          <div className="flex flex-col sm:flex-row justify-between gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => {
                setShowDownloadModal(false);
                router.push('/dashboard/valoraciones');
              }}
              className="gap-2"
            >
              Cerrar
            </Button>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => {
                  if (downloadUrls) {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://mentis-production.up.railway.app';
                    window.open(`${apiUrl}${downloadUrls.pdf_url}`, '_blank');
                    toast.success('Abriendo PDF en nueva pestaña');
                  }
                }}
                className="gap-2 bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <FileText className="h-5 w-5" />
                Ver PDF
              </Button>
              <Button
                onClick={async () => {
                  if (downloadUrls) {
                    try {
                      await api.downloadFile(downloadUrls.pdf_url, downloadUrls.pdf_filename, false);
                      toast.success('Descargando PDF...');
                    } catch (error) {
                      toast.error('Error al descargar el PDF');
                    }
                  }
                }}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <Download className="h-5 w-5" />
                Descargar PDF
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-6 p-2">
          <div className="flex items-center justify-center py-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  ¡Valoración Completada!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  El archivo de la valoración ha sido generado exitosamente
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="p-5 rounded-lg border-2 border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 max-w-md w-full">
              <div className="flex items-start gap-4">
                <FileText className="h-10 w-10 text-indigo-500 flex-shrink-0 mt-1" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Archivo PDF
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Documento profesional listo para imprimir y presentar
                  </p>
                  <div className="p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 break-all">
                      {downloadUrls?.pdf_filename}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Importante:</strong> El archivo queda guardado en el sistema y puede ser descargado nuevamente desde el listado de valoraciones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}

