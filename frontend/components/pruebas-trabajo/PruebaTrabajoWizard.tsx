'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/app/services/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  User,
  Briefcase,
  Activity,
  AlertTriangle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Download,
  X,
  AlertCircle,
  Sparkles,
  Upload
} from 'lucide-react';

// ─── Steps ───────────────────────────────────────────────────────────
const steps = [
  { id: 1, title: 'Identificación', icon: User },
  { id: 2, title: 'Contexto y Participantes', icon: Briefcase },
  { id: 3, title: 'Descripción del Cargo', icon: Activity },
  { id: 4, title: 'Factores de Riesgo', icon: AlertTriangle },
  { id: 5, title: 'Resumen y Concepto', icon: FileText },
];

// ─── Condiciones de Riesgo (33 condiciones en 7 dimensiones) ─────────
interface CondicionItem {
  numero: number;
  nombre: string;
  descripcion: string;
}

const factoresRiesgo: Record<string, { titulo: string; items: CondicionItem[] }> = {
  demandas_cuantitativas: {
    titulo: 'Demandas Cuantitativas de Trabajo',
    items: [
      {
        numero: 1,
        nombre: 'Ritmo de trabajo acelerado o bajo presión de tiempo',
        descripcion: 'Esta condición considera la velocidad con la que se realizan las tareas y/o el ritmo acelerado de trabajo con el fin de cumplir con la cantidad de responsabilidades, lo que podría constituir un factor de riesgo.'
      },
      {
        numero: 2,
        nombre: 'Imposibilidad de hacer pausas dentro de la jornada',
        descripcion: 'Esta condición examina la posibilidad que tiene un trabajador de detener su actividad laboral para tomar un descanso o hacer una pausa, dependiendo de la cantidad de trabajo que tiene que hacer.'
      },
      {
        numero: 3,
        nombre: 'Tiempo adicional para cumplir con el trabajo asignado',
        descripcion: 'Esta condición considera la cantidad de tiempo que se debe invertir para realizar todas las actividades de las tareas asignadas. Trabajar tiempo adicional al de la jornada establecida para lograr cumplir con el trabajo asignado se constituye en un factor de riesgo.'
      },
    ]
  },
  demandas_carga_mental: {
    titulo: 'Demandas de Carga Mental',
    items: [
      {
        numero: 4,
        nombre: 'Exigencia de memoria, atención y concentración',
        descripcion: 'Esta condición considera si se debe realizar un esfuerzo mental importante de memoria, atención o concentración para el desarrollo de sus actividades.'
      },
      {
        numero: 5,
        nombre: 'Exigencia de altos niveles de detalle o precisión',
        descripcion: 'Esta condición considera si se debe realizar un esfuerzo mental importante para atender información detallada o debe manipular con precisión materiales, equipos o herramientas para el desarrollo de sus actividades.'
      },
      {
        numero: 6,
        nombre: 'Elevada cantidad de información que se usa bajo presión de tiempo',
        descripcion: 'Esta condición evalúa si se debe realizar un esfuerzo mental importante derivado del uso de mucha información en poco tiempo.'
      },
      {
        numero: 7,
        nombre: 'Elevada cantidad de información que se usa de forma simultánea',
        descripcion: 'Esta condición considera si para el cargo se debe realizar un esfuerzo mental importante derivado del uso simultáneo de mucha información proveniente de diferentes fuentes.'
      },
      {
        numero: 8,
        nombre: 'La información necesaria para realizar el trabajo es compleja',
        descripcion: 'Para el desarrollo de las funciones del cargo, se evalúa si se debe realizar un esfuerzo mental importante derivado del uso de información compleja.'
      },
    ]
  },
  demandas_emocionales: {
    titulo: 'Demandas emocionales',
    items: [
      {
        numero: 9,
        nombre: 'Exposición a sentimientos, emociones y trato negativo de usuarios o clientes',
        descripcion: 'Esta condición considera si en virtud de su trabajo, la persona se expone al estado emocional alterado (tristeza, irritabilidad, agresividad) de clientes o usuarios.'
      },
      {
        numero: 10,
        nombre: 'Exposición a situaciones emocionalmente devastadoras',
        descripcion: 'En el desarrollo de las labores, se evalúa si el trabajador experimenta situaciones emocionalmente devastadoras.'
      },
      {
        numero: 11,
        nombre: 'Requerimiento de ocultar o simular emociones o sentimientos',
        descripcion: 'En virtud de su trabajo, se evalúa si el funcionario recibe directrices que limitan la expresión de sentimientos y emociones de su naturaleza humana.'
      },
    ]
  },
  exigencias_responsabilidad: {
    titulo: 'Exigencias de Responsabilidad del Cargo',
    items: [
      {
        numero: 12,
        nombre: 'Responsabilidad directa por la vida, salud o seguridad de otras personas',
        descripcion: 'Esta condición está presente cuando el puesto que ocupa el servidor responde directamente por la vida, salud o seguridad de otras personas. Indaga si las actividades que se desarrollan en el puesto pueden tener un impacto directo sobre la promoción de la vida, el cuidado de la salud o la seguridad de otras personas.'
      },
      {
        numero: 13,
        nombre: 'Responsabilidad directa por supervisión de personal',
        descripcion: 'Esta condición indaga si el puesto tiene bajo su directa responsabilidad la jefatura de otras personas.'
      },
      {
        numero: 14,
        nombre: 'Responsabilidad directa por resultados del área de trabajo',
        descripcion: 'Esta condición indaga si en el puesto que se desempeña está la responsabilidad final de alcanzar los resultados generales del área.'
      },
      {
        numero: 15,
        nombre: 'Responsabilidad directa por bienes de elevada cuantía',
        descripcion: 'Esta condición revisa la tenencia bajo su responsabilidad de elementos cuyo costo sea considerable y su afectación pueda resultar en un detrimento patrimonial de la institución.'
      },
      {
        numero: 16,
        nombre: 'Responsabilidad directa por dinero de la organización',
        descripcion: 'Se evalúa si el cargo desempeñado es responsable de la tenencia o custodia de dinero en efectivo o papeles valor.'
      },
      {
        numero: 17,
        nombre: 'Responsabilidad directa por información confidencial',
        descripcion: 'El cargo exige mantener secretismo sobre información sensible.'
      },
    ]
  },
  consistencia_rol: {
    titulo: 'Consistencia de Rol',
    items: [
      {
        numero: 18,
        nombre: 'Falta de recursos, personas o herramientas necesarias para desarrollar el trabajo',
        descripcion: 'La condición examina si para el desarrollo de las funciones existen falencias en algunos recursos que la tarea requiere.'
      },
      {
        numero: 19,
        nombre: 'Órdenes contradictorias provenientes de una o varias personas',
        descripcion: 'En esta condición, el funcionario se somete a recibir órdenes o requerimientos que pueden ser contradictorios dentro de la cadena de mando.'
      },
      {
        numero: 20,
        nombre: 'Solicitudes o requerimientos innecesarios en el trabajo',
        descripcion: 'Se refiere a solicitudes o requerimientos innecesarios dentro del desarrollo de las actividades.'
      },
      {
        numero: 21,
        nombre: 'Solicitudes o requerimientos que van en contra de principios éticos, técnicos, de seguridad o de calidad o servicio del producto',
        descripcion: 'La naturaleza de la tarea puede estar permeada por demandas no asertivas que coloquen en riesgo la integridad moral, profesional o física del trabajador.'
      },
    ]
  },
  demandas_ambientales: {
    titulo: 'Demandas Ambientales y de Esfuerzo Físico',
    items: [
      {
        numero: 22,
        nombre: 'Ruido que afecta negativamente',
        descripcion: 'En el puesto de trabajo el ruido puede ser un factor de riesgo.'
      },
      {
        numero: 23,
        nombre: 'Iluminación que afecta negativamente',
        descripcion: 'La presencia de luz artificial o la escasez de luz natural, así como el exceso de las mismas, pueden ser un factor de riesgo.'
      },
      {
        numero: 24,
        nombre: 'Temperatura que afecta negativamente',
        descripcion: 'La temperatura puede ser un factor de riesgo.'
      },
      {
        numero: 25,
        nombre: 'Condiciones de Ventilación que afecten negativamente',
        descripcion: 'La ventilación natural en su exceso o escasez puede ser un factor de riesgo.'
      },
      {
        numero: 26,
        nombre: 'Distribución y características del puesto, equipos o herramientas que afectan negativamente',
        descripcion: 'La distribución y características del puesto, equipos o herramientas pueden convertirse en un factor estresante e incluso en un factor de riesgo físico.'
      },
      {
        numero: 27,
        nombre: 'Condiciones de orden y aseo que afecten negativamente',
        descripcion: 'Las condiciones de orden y aseo pueden constituir un factor de riesgo.'
      },
      {
        numero: 28,
        nombre: 'Preocupación por exposición a agentes biológicos',
        descripcion: 'La persona percibe la posibilidad de estar expuesto a virus, bacterias, hongos y otros patógenos.'
      },
      {
        numero: 29,
        nombre: 'Preocupación por exposición a agentes químicos',
        descripcion: 'Se evalúan las características de la tarea respecto a la exposición a agentes químicos.'
      },
      {
        numero: 30,
        nombre: 'Preocupación ante la posibilidad de sufrir un accidente de trabajo',
        descripcion: 'La persona percibe que puede estar sujeta a la ocurrencia de un accidente de trabajo en el cumplimiento de sus tareas.'
      },
      {
        numero: 31,
        nombre: 'Exigencias de esfuerzo físico que afectan negativamente',
        descripcion: 'Para el desarrollo de las tareas se requiere esfuerzo físico que puede constituir un factor de riesgo.'
      },
    ]
  },
  demandas_jornada: {
    titulo: 'Demandas de la Jornada de Trabajo',
    items: [
      {
        numero: 32,
        nombre: 'Trabajo en horario nocturno',
        descripcion: 'A razón del cargo, el trabajador puede requerir laborar en horario nocturno.'
      },
      {
        numero: 33,
        nombre: 'Días de trabajo consecutivo sin descanso',
        descripcion: 'Se evalúa si se refieren días de trabajo consecutivos sin descanso.'
      },
    ]
  }
};

// ─── Baremos ─────────────────────────────────────────────────────────
const BAREMOS: Record<string, { sin: number; bajo: number; medio: number; alto: number; muy_alto: number }> = {
  demandas_cuantitativas: { sin: 12.6, bajo: 25.3, medio: 38, alto: 50.6, muy_alto: 63 },
  demandas_carga_mental: { sin: 21, bajo: 42, medio: 63, alto: 84, muy_alto: 105 },
  demandas_emocionales: { sin: 12.6, bajo: 25.3, medio: 38, alto: 50.6, muy_alto: 63 },
  exigencias_responsabilidad: { sin: 25.2, bajo: 50.4, medio: 75.6, alto: 100.8, muy_alto: 126 },
  consistencia_rol: { sin: 16.8, bajo: 33.6, medio: 50.4, alto: 67.2, muy_alto: 84 },
  demandas_ambientales: { sin: 42, bajo: 84, medio: 126, alto: 168, muy_alto: 210 },
  demandas_jornada: { sin: 8.4, bajo: 16.8, medio: 25.2, alto: 33.6, muy_alto: 42 },
};

const getNivelRiesgo = (dimension: string, puntaje: number) => {
  const rangos = BAREMOS[dimension];
  if (!rangos) return { nivel: 'N/A', color: 'bg-gray-200 text-gray-800' };
  if (puntaje <= rangos.sin) return { nivel: 'SIN RIESGO', color: 'bg-green-500 text-white' };
  if (puntaje <= rangos.bajo) return { nivel: 'RIESGO BAJO', color: 'bg-yellow-400 text-black' };
  if (puntaje <= rangos.medio) return { nivel: 'RIESGO MEDIO', color: 'bg-orange-500 text-white' };
  if (puntaje <= rangos.alto) return { nivel: 'RIESGO ALTO', color: 'bg-red-500 text-white' };
  return { nivel: 'RIESGO MUY ALTO', color: 'bg-red-900 text-white' };
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'sin_riesgo': return 'bg-green-100 text-green-800 border-green-200';
    case 'riesgo_bajo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'riesgo_medio': return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'riesgo_alto': return 'bg-red-100 text-red-800 border-red-200';
    case 'riesgo_muy_alto': return 'bg-red-800 text-white border-red-900';
    default: return 'bg-white border-gray-200';
  }
};

const NIVELES_RIESGO = [
  { value: 'riesgo_muy_alto', label: 'RIESGO MUY ALTO', color: 'bg-red-900 text-white' },
  { value: 'riesgo_alto', label: 'RIESGO ALTO', color: 'bg-red-500 text-white' },
  { value: 'riesgo_medio', label: 'RIESGO MEDIO', color: 'bg-orange-500 text-white' },
  { value: 'riesgo_bajo', label: 'RIESGO BAJO', color: 'bg-yellow-400 text-black' },
  { value: 'sin_riesgo', label: 'SIN RIESGO', color: 'bg-green-500 text-white' },
];

// ─── Component ───────────────────────────────────────────────────────
interface PruebaTrabajoWizardProps {
  id?: number | null;
  mode?: 'create' | 'edit' | 'view';
  readOnly?: boolean;
}

export function PruebaTrabajoWizard({ id, mode = 'create', readOnly = false }: PruebaTrabajoWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [pruebaId, setPruebaId] = useState<number | null>(id || null);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<any>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [generandoConcepto, setGenerandoConcepto] = useState(false);

  const [formData, setFormData] = useState({
    fecha_valoracion: new Date().toISOString().split('T')[0],
    // Empresa
    empresa: '',
    tipo_documento_empresa: 'NIT',
    nit: '',
    persona_contacto: '',
    email_notificaciones: '',
    direccion_empresa: '',
    arl: '', // Nuevo campo
    ciudad_empresa: '', // Nuevo campo
    // Trabajador
    nombre_trabajador: '',
    identificacion_trabajador: '',
    edad: '',
    genero: '',
    fecha_nacimiento: '',
    escolaridad: '',
    nivel_educativo: '', // Nuevo campo
    eps: '',
    puesto_trabajo_evaluado: '',
    cargo: '', // Nuevo campo
    area: '', // Nuevo campo
    fecha_ingreso_puesto_evaluado: '',
    fecha_ingreso_empresa: '',
    antiguedad_empresa: '',
    antiguedad_puesto_evaluado: '',
    antiguedad_cargo: '', // Nuevo campo
    diagnostico: '',
    codigo_cie10: '',
    fecha_siniestro: '',
    // Evaluador
    nombre_evaluador: 'William Fernando Romero Suarez',
    identificacion_evaluador: '79.247.156',
    formacion_evaluador: 'Psicólogo especialista en Seguridad y Salud en el Trabajo',
    tarjeta_profesional: '140039',
    licencia_sst: '13828',
    // Secciones
    metodologia: '',
    participante_trabajador: '',
    participante_jefe: '',
    participante_cargo_jefe: '',
    fuente_trabajador_fecha: '',
    fuente_jefe_fecha: '',
    fuente_par_fecha: '',
    revision_documental: '',
    descripcion_puesto: '',
    condicion_actual: '',
    nombre_puesto_ocupacional: '',
    area_puesto: '',
    antiguedad_cargo_ocupacional: '',
    antiguedad_empresa_ocupacional: '',
    nivel_educativo_requerido: '',
    jornada_laboral: '',
    horas_extras: '',
    turnos: '',
    descripcion_funciones: '',
    // Factores de riesgo
    factores_riesgo: {} as Record<string, { fr: string; exp: string; int: string; total: string; fuentes: string; observaciones: string }>,
    // Resumen
    resumen_factores: {} as Record<string, { nivel_trabajador: string; nivel_experto: string; factores_trabajador: string; factores_experto: string; observaciones: string }>,
    // Concepto final
    concepto_generado_ml: '',
    conclusiones_finales: '',
    recomendaciones: '',
    firma_evaluador: '',
    concordancia_items: '',
    no_concordancia_items: '',
  });

  // Initialize factores_riesgo and resumen_factores
  useState(() => {
    const factoresInit: Record<string, any> = {};
    Object.entries(factoresRiesgo).forEach(([, categoria]) => {
      categoria.items.forEach(item => {
        factoresInit[item.nombre] = {
          fr: '', exp: '', int: '', total: '',
          fuentes: 'Entrevista con funcionario y jefe inmediato',
          observaciones: item.descripcion
        };
      });
    });
    setFormData(prev => ({ ...prev, factores_riesgo: factoresInit }));

    const resumenInit: Record<string, any> = {};
    Object.keys(factoresRiesgo).forEach(key => {
      resumenInit[key] = { nivel_trabajador: '', nivel_experto: '', factores_trabajador: '', factores_experto: '', observaciones: '' };
    });
    setFormData(prev => ({ ...prev, resumen_factores: resumenInit }));
  });

  // Efecto para recalcular automáticamente concordancia
  useEffect(() => {
    const concordancias: string[] = [];
    const noConcordancias: string[] = [];

    Object.entries(formData.resumen_factores).forEach(([key, values]) => {
      if (values.nivel_trabajador && values.nivel_experto) {
        // Encontrar título legible
        const categoria = Object.values(factoresRiesgo).find(c => c.titulo === factoresRiesgo[key]?.titulo);
        const nombreTitulo = categoria ? categoria.titulo : key;

        if (values.nivel_trabajador === values.nivel_experto) {
          concordancias.push(nombreTitulo);
        } else {
          noConcordancias.push(nombreTitulo);
        }
      }
    });

    const txtConcordancia = concordancias.length > 0 ? concordancias.join(', ') : 'Ninguna';
    const txtNoConcordancia = noConcordancias.length > 0 ? noConcordancias.join(', ') : 'Ninguna';

    if (txtConcordancia !== formData.concordancia_items || txtNoConcordancia !== formData.no_concordancia_items) {
      setFormData(prev => ({
        ...prev,
        concordancia_items: txtConcordancia,
        no_concordancia_items: txtNoConcordancia
      }));
    }
  }, [formData.resumen_factores]);

  const updateField = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const updateFactorRiesgo = (itemNombre: string, field: string, value: string) => {
    setFormData(prev => {
      const currentFactor = prev.factores_riesgo[itemNombre] || { fr: '', exp: '', int: '', total: '', fuentes: '', observaciones: '' };
      const updatedFactor = { ...currentFactor, [field]: value };
      if (['fr', 'exp', 'int'].includes(field)) {
        if (updatedFactor.fr !== '' && updatedFactor.exp !== '' && updatedFactor.int !== '') {
          const fr = parseInt(updatedFactor.fr) || 0;
          const exp = parseInt(updatedFactor.exp) || 0;
          const intVal = parseInt(updatedFactor.int) || 0;
          updatedFactor.total = (fr + exp + intVal).toString();
        }
      }
      return { ...prev, factores_riesgo: { ...prev.factores_riesgo, [itemNombre]: updatedFactor } };
    });
  };

  const updateResumenFactor = (dimension: string, field: string, value: string) => {
    setFormData(prev => {
      const currentResumen = prev.resumen_factores;
      const updatedDimension = { ...(currentResumen[dimension] || {}), [field]: value };
      const nextResumen = { ...currentResumen, [dimension]: updatedDimension as any };
      return { ...prev, resumen_factores: nextResumen };
    });
  };

  // ─── Load existing data ───────────────────────────────────────────
  useEffect(() => {
    if (id) {
      setCargando(true);
      const cargarPrueba = async () => {
        try {
          const data: any = await api.get(`/pruebas-trabajo/${id}`);
          setPruebaId(id);

          const mappedData: any = {
            empresa: data.datos_empresa?.empresa || '',
            tipo_documento_empresa: data.datos_empresa?.tipo_documento || 'NIT',
            nit: data.datos_empresa?.nit || '',
            persona_contacto: data.datos_empresa?.persona_contacto || '',
            email_notificaciones: data.datos_empresa?.email_notificaciones || '',
            direccion_empresa: data.datos_empresa?.direccion || '',
            arl: data.datos_empresa?.arl || '', // Mapped
            ciudad_empresa: data.datos_empresa?.ciudad || '', // Mapped

            nombre_trabajador: data.trabajador?.nombre || '',
            identificacion_trabajador: data.trabajador?.identificacion || '',
            fecha_nacimiento: data.trabajador?.fecha_nacimiento ? data.trabajador.fecha_nacimiento.split('T')[0] : '',
            edad: data.trabajador?.edad ? data.trabajador.edad.toString() : '',
            genero: data.trabajador?.genero || '',
            escolaridad: data.trabajador?.escolaridad || '',
            nivel_educativo: data.trabajador?.nivel_educativo || '', // Mapped
            eps: data.trabajador?.eps || '',
            puesto_trabajo_evaluado: data.trabajador?.puesto_trabajo_evaluado || '',
            cargo: data.trabajador?.cargo || '', // Mapped
            area: data.trabajador?.area || '', // Mapped
            fecha_ingreso_empresa: data.trabajador?.fecha_ingreso_empresa ? data.trabajador.fecha_ingreso_empresa.split('T')[0] : '',
            fecha_ingreso_puesto_evaluado: data.trabajador?.fecha_ingreso_puesto_evaluado ? data.trabajador.fecha_ingreso_puesto_evaluado.split('T')[0] : '',
            antiguedad_empresa: data.trabajador?.antiguedad_empresa || '',
            antiguedad_puesto_evaluado: data.trabajador?.antiguedad_puesto_evaluado || '',
            antiguedad_cargo: data.trabajador?.antiguedad_cargo || '', // Mapped
            diagnostico: data.trabajador?.diagnostico || '',
            codigo_cie10: data.trabajador?.codigo_cie10 || '',
            fecha_siniestro: data.trabajador?.fecha_siniestro ? data.trabajador.fecha_siniestro.split('T')[0] : '',

            nombre_evaluador: data.evaluador?.nombre || '',
            identificacion_evaluador: data.evaluador?.identificacion || '',
            formacion_evaluador: data.evaluador?.formacion || '',
            tarjeta_profesional: data.evaluador?.tarjeta_profesional || '',
            licencia_sst: data.evaluador?.licencia_sst || '',

            fecha_valoracion: data.fecha_valoracion ? data.fecha_valoracion.split('T')[0] : new Date().toISOString().split('T')[0],
            metodologia: data.secciones?.metodologia || '',
            participante_trabajador: data.secciones?.participante_trabajador || '',
            participante_jefe: data.secciones?.participante_jefe || '',
            participante_cargo_jefe: data.secciones?.participante_cargo_jefe || '',
            fuente_trabajador_fecha: data.secciones?.fuente_trabajador_fecha ? data.secciones.fuente_trabajador_fecha.split('T')[0] : '',
            fuente_jefe_fecha: data.secciones?.fuente_jefe_fecha ? data.secciones.fuente_jefe_fecha.split('T')[0] : '',
            fuente_par_fecha: data.secciones?.fuente_par_fecha ? data.secciones.fuente_par_fecha.split('T')[0] : '',
            revision_documental: data.secciones?.revision_documental || '',
            descripcion_puesto: data.secciones?.descripcion_puesto || '',
            condicion_actual: data.secciones?.condicion_actual || '',
            nombre_puesto_ocupacional: data.secciones?.nombre_puesto || '',
            area_puesto: data.secciones?.area_puesto || '',
            antiguedad_cargo_ocupacional: data.secciones?.antiguedad_cargo_ocupacional || '',
            antiguedad_empresa_ocupacional: data.secciones?.antiguedad_empresa_ocupacional || '',
            nivel_educativo_requerido: data.secciones?.nivel_educativo_requerido || '',
            jornada_laboral: data.secciones?.jornada_laboral || '',
            horas_extras: data.secciones?.horas_extras || '',
            turnos: data.secciones?.turnos || '',
            descripcion_funciones: data.secciones?.descripcion_funciones || '',

            concepto_generado_ml: data.concepto_final?.concepto_generado_ml || '',
            conclusiones_finales: data.concepto_final?.conclusiones_finales || '',
            recomendaciones: data.concepto_final?.recomendaciones || '',
            concordancia_items: data.concepto_final?.concordancia_items || '',
            no_concordancia_items: data.concepto_final?.no_concordancia_items || '',
            firma_evaluador: data.concepto_final?.firma_evaluador || '',
          };

          // Map condiciones de riesgo
          const factoresMapa: any = {};
          Object.entries(factoresRiesgo).forEach(([, categoria]) => {
            categoria.items.forEach(item => {
              factoresMapa[item.nombre] = {
                fr: '', exp: '', int: '', total: '',
                fuentes: 'Entrevista con funcionario y jefe inmediato',
                observaciones: item.descripcion
              };
            });
          });
          if (data.condiciones_riesgo) {
            data.condiciones_riesgo.forEach((cond: any) => {
              if (factoresMapa[cond.condicion_texto]) {
                factoresMapa[cond.condicion_texto] = {
                  fr: cond.frecuencia?.toString() || '',
                  exp: cond.exposicion?.toString() || '',
                  int: cond.intensidad?.toString() || '',
                  total: cond.total_condicion?.toString() || '',
                  fuentes: cond.fuentes_informacion || '',
                  observaciones: cond.descripcion_detallada || cond.observaciones || factoresMapa[cond.condicion_texto].observaciones
                };
              }
            });
          }
          mappedData.factores_riesgo = factoresMapa;

          // Map resumen factores
          const resumenMapa: any = {};
          Object.keys(factoresRiesgo).forEach(key => {
            resumenMapa[key] = { nivel_trabajador: '', nivel_experto: '', factores_trabajador: '', factores_experto: '', observaciones: '' };
          });
          if (data.resumen_factores) {
            data.resumen_factores.forEach((res: any) => {
              if (resumenMapa[res.dimension]) {
                resumenMapa[res.dimension] = {
                  nivel_trabajador: res.nivel_riesgo_trabajador || '',
                  nivel_experto: res.nivel_riesgo_experto || '',
                  factores_trabajador: res.factores_detectados_trabajador || '',
                  factores_experto: res.factores_detectados_experto || '',
                  observaciones: res.observaciones_experto || ''
                };
              }
            });
          }
          mappedData.resumen_factores = resumenMapa;

          setFormData(prev => ({ ...prev, ...mappedData }));
        } catch (error) {
          console.error("Error cargando prueba:", error);
          toast.error("No se pudo cargar la información de la prueba");
        } finally {
          setCargando(false);
        }
      };
      cargarPrueba();
    }
  }, [id]);

  // ─── Generate AI Concept ──────────────────────────────────────────
  const handleGenerarConcepto = async () => {
    if (generandoConcepto) return;
    if (!formData.nombre_trabajador) { toast.error('Debe ingresar el nombre del trabajador primero'); return; }
    setGenerandoConcepto(true);
    try {
      let requestPayload: any = {};
      if (pruebaId) {
        requestPayload = { prueba_id: pruebaId };
      } else {
        const condicionesRiesgo: any[] = [];
        Object.entries(factoresRiesgo).forEach(([key, categoria]) => {
          categoria.items.forEach((item, index) => {
            const values = formData.factores_riesgo[item.nombre];
            if (values && (values.fr || values.exp || values.int)) {
              condicionesRiesgo.push({
                dimension: key, item_numero: index + 1, item_texto: item.nombre, condicion_texto: item.nombre,
                frecuencia: values.fr ? parseInt(values.fr) : null, exposicion: values.exp ? parseInt(values.exp) : null,
                intensidad: values.int ? parseInt(values.int) : null, total_condicion: values.total ? parseInt(values.total) : null,
                fuentes_informacion: values.fuentes, descripcion_detallada: values.observaciones || ''
              });
            }
          });
        });
        if (condicionesRiesgo.length === 0) {
          toast.warning('Por favor diligencie al menos un factor de riesgo para generar conclusiones.');
          setGenerandoConcepto(false);
          return;
        }
        requestPayload = { nombre_trabajador: formData.nombre_trabajador, condiciones_riesgo: condicionesRiesgo };
      }
      const response = await api.post<{ analisis: string; recomendaciones: string }>('/pruebas-trabajo/generar-concepto-ia', requestPayload);
      if (response && response.analisis) {
        setFormData(prev => ({ ...prev, conclusiones_finales: response.analisis, recomendaciones: response.recomendaciones }));
        toast.success('Concepto generado exitosamente con IA');
      }
    } catch (error: any) {
      console.error('Error generando concepto:', error);
      toast.error('Error al generar concepto');
    } finally {
      setGenerandoConcepto(false);
    }
  };

  // ─── Save ─────────────────────────────────────────────────────────
  const handleSave = async (finalizar = false) => {
    if (finalizar && (!formData.empresa || !formData.nombre_trabajador || !formData.identificacion_evaluador)) {
      toast.error('Por favor complete los campos obligatorios');
      return;
    }
    setSaving(true);
    try {
      const condicionesRiesgo: any[] = [];
      Object.entries(factoresRiesgo).forEach(([key, categoria]) => {
        categoria.items.forEach((item, index) => {
          const values = formData.factores_riesgo[item.nombre];
          if (values && (values.fr || values.exp || values.int)) {
            condicionesRiesgo.push({
              dimension: key, item_numero: index + 1, condicion_texto: item.nombre,
              descripcion_detallada: values.observaciones || null,
              frecuencia: values.fr ? parseInt(values.fr) : null,
              exposicion: values.exp ? parseInt(values.exp) : null,
              intensidad: values.int ? parseInt(values.int) : null,
              total_condicion: values.total ? parseInt(values.total) : null,
              fuentes_informacion: values.fuentes
            });
          }
        });
      });

      const resumenFactoresPayload: any[] = [];
      Object.entries(formData.resumen_factores).forEach(([dimension, values]) => {
        if (values.nivel_trabajador || values.nivel_experto || values.factores_experto) {
          const dimItems = factoresRiesgo[dimension as keyof typeof factoresRiesgo]?.items || [];
          const totalPuntaje = dimItems.reduce((acc, item) => acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0);
          resumenFactoresPayload.push({
            dimension, num_items: dimItems.length, puntuacion_total: totalPuntaje || null,
            nivel_riesgo_trabajador: values.nivel_trabajador || null,
            nivel_riesgo_experto: values.nivel_experto || null,
            factores_detectados_trabajador: values.factores_trabajador || null,
            factores_detectados_experto: values.factores_experto || null,
            observaciones_experto: values.observaciones || null
          });
        }
      });

    });

    // Calcular concordancia explícitamente antes de guardar
    const concordanciasCalc: string[] = [];
    const noConcordanciasCalc: string[] = [];

    const nivelToValue: Record<string, string> = {
      'SIN RIESGO': 'sin_riesgo',
      'RIESGO BAJO': 'riesgo_bajo',
      'RIESGO MEDIO': 'riesgo_medio',
      'RIESGO ALTO': 'riesgo_alto',
      'RIESGO MUY ALTO': 'riesgo_muy_alto',
    };

    Object.entries(factoresRiesgo).forEach(([key, config]) => {
      // 1. Calcular nivel riesgo trabajador (igual que en el render)
      const total = config.items.reduce((acc, item) =>
        acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0
      );
      const { nivel: nivelCalculado } = getNivelRiesgo(key, total);
      const nivelTrabajadorValue = nivelToValue[nivelCalculado];

      // 2. Obtener nivel experto del form state
      const nivelExpertoValue = formData.resumen_factores[key]?.nivel_experto;

      // 3. Comparar si ambos existen
      if (nivelTrabajadorValue && nivelExpertoValue) {
        const titulo = config.titulo;
        if (nivelTrabajadorValue === nivelExpertoValue) {
          concordanciasCalc.push(titulo);
        } else {
          noConcordanciasCalc.push(titulo);
        }
      }
    });

    const txtConcordanciaFinal = concordanciasCalc.length > 0 ? concordanciasCalc.join(', ') : 'Ninguna';
    const txtNoConcordanciaFinal = noConcordanciasCalc.length > 0 ? noConcordanciasCalc.join(', ') : 'Ninguna';

    const payload = {
      fecha_valoracion: formData.fecha_valoracion || null,
      estado: finalizar ? 'completada' : 'borrador',
      datos_empresa: {
        empresa: formData.empresa, tipo_documento: formData.tipo_documento_empresa, nit: formData.nit,
        persona_contacto: formData.persona_contacto, email_notificaciones: formData.email_notificaciones,
        direccion: formData.direccion_empresa, arl: formData.arl, ciudad: formData.ciudad_empresa
      },
    },
      trabajador: {
        nombre: formData.nombre_trabajador, identificacion: formData.identificacion_trabajador,
        fecha_nacimiento: formData.fecha_nacimiento || null, edad: formData.edad ? parseInt(formData.edad) : null,
          genero: formData.genero, escolaridad: formData.escolaridad, eps: formData.eps,
            puesto_trabajo_evaluado: formData.puesto_trabajo_evaluado,
              cargo: formData.cargo, area: formData.area, nivel_educativo: formData.nivel_educativo,
                fecha_ingreso_empresa: formData.fecha_ingreso_empresa || null,
                  fecha_ingreso_puesto_evaluado: formData.fecha_ingreso_puesto_evaluado || null,
                    antiguedad_empresa: formData.antiguedad_empresa, antiguedad_puesto_evaluado: formData.antiguedad_puesto_evaluado,
                      antiguedad_cargo: formData.antiguedad_cargo,
                        diagnostico: formData.diagnostico, codigo_cie10: formData.codigo_cie10,
                          fecha_siniestro: formData.fecha_siniestro || null
  },
    evaluador: {
      nombre: formData.nombre_evaluador, identificacion: formData.identificacion_evaluador,
      formacion: formData.formacion_evaluador, tarjeta_profesional: formData.tarjeta_profesional,
      licencia_sst: formData.licencia_sst, fecha_evaluacion: formData.fecha_valoracion || null
},
secciones: {
  metodologia: formData.metodologia, participante_trabajador: formData.participante_trabajador,
    participante_jefe: formData.participante_jefe, participante_cargo_jefe: formData.participante_cargo_jefe,
      fuente_trabajador_fecha: formData.fuente_trabajador_fecha || null,
        fuente_jefe_fecha: formData.fuente_jefe_fecha || null,
          fuente_par_fecha: formData.fuente_par_fecha || null,
            revision_documental: formData.revision_documental,
              descripcion_puesto: formData.descripcion_puesto, condicion_actual: formData.condicion_actual,
                nombre_puesto: formData.nombre_puesto_ocupacional, area_puesto: formData.area_puesto,
                  antiguedad_cargo_ocupacional: formData.antiguedad_cargo_ocupacional,
                    antiguedad_empresa_ocupacional: formData.antiguedad_empresa_ocupacional,
                      nivel_educativo_requerido: formData.nivel_educativo_requerido,
                        jornada_laboral: formData.jornada_laboral, horas_extras: formData.horas_extras,
                          fuente_jefe_fecha: formData.fuente_jefe_fecha || null,
                            fuente_par_fecha: formData.fuente_par_fecha || null,
                              revision_documental: formData.revision_documental,
                                descripcion_puesto: formData.descripcion_puesto, condicion_actual: formData.condicion_actual,
                                  nombre_puesto: formData.nombre_puesto_ocupacional, area_puesto: formData.area_puesto,
                                    antiguedad_cargo_ocupacional: formData.antiguedad_cargo_ocupacional,
                                      antiguedad_empresa_ocupacional: formData.antiguedad_empresa_ocupacional,
                                        nivel_educativo_requerido: formData.nivel_educativo_requerido,
                                          jornada_laboral: formData.jornada_laboral, horas_extras: formData.horas_extras,
                                            turnos: formData.turnos, descripcion_funciones: formData.descripcion_funciones
},
condiciones_riesgo: condicionesRiesgo,
  resumen_factores: resumenFactoresPayload,
    concepto_final: {
  saveId = res.id;
} else {
  await api.put(`/pruebas-trabajo/${pruebaId}`, payload);
}
const finalRes: any = await api.post(`/pruebas-trabajo/${saveId}/finalizar`, {});
setDownloadUrls({ pdf_url: finalRes.pdf_url });
setShowDownloadModal(true);
toast.success('Prueba finalizada exitosamente');
  } else {
  if (pruebaId) {
    await api.put(`/pruebas-trabajo/${pruebaId}`, payload);
    toast.success('Guardado correctamente');
  } else {
    const res: any = await api.post('/pruebas-trabajo/', payload);
    setPruebaId(res.id);
    toast.success('Prueba creada exitosamente');
  }
}
} catch (error: any) {
  console.error(error);
  toast.error('Error al guardar: ' + error.message);
} finally {
  setSaving(false);
}
  };

// ─── Validation ───────────────────────────────────────────────────
const validateStep = (stepId: number): { isValid: boolean; errors: string[] } => {
  if (readOnly) return { isValid: true, errors: [] };
  const errors: string[] = [];
  switch (stepId) {
    case 1:
      if (!formData.empresa) errors.push('Nombre de la Empresa');
      if (!formData.nit) errors.push('NIT');
      if (!formData.nombre_trabajador) errors.push('Nombre del Trabajador');
      if (!formData.identificacion_trabajador) errors.push('Identificación del Trabajador');
      if (!formData.nombre_evaluador) errors.push('Nombre del Evaluador');
      if (!formData.identificacion_evaluador) errors.push('Identificación del Evaluador');
      break;
    case 2:
      if (!formData.participante_trabajador) errors.push('Nombre del Participante (Trabajador)');
      if (!formData.participante_jefe) errors.push('Nombre del Participante (Jefe)');
      break;
  }
  return { isValid: errors.length === 0, errors };
};

const attemptNavigation = (targetStep: number) => {
  if (targetStep < currentStep) { setCurrentStep(targetStep); return; }
  const validation = validateStep(currentStep);
  if (validation.isValid) setCurrentStep(targetStep);
  else { setValidationErrors(validation.errors); setShowValidationModal(true); }
};

const nextStep = () => attemptNavigation(currentStep + 1);
const prevStep = () => attemptNavigation(currentStep - 1);

// ─── Helper: Section Header ───────────────────────────────────────
const SectionHeader = ({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 font-bold text-sm uppercase tracking-wide rounded-lg shadow-md flex items-center gap-2 mb-4">
    {Icon && <Icon className="h-5 w-5" />}
    <span>{children}</span>
  </div>
);

// ─── Loading ──────────────────────────────────────────────────────
if (cargando) {
  return (
    <DashboardLayout>
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-10 w-10 text-orange-500" />
      </div>
    </DashboardLayout>
  );
}

// ─── Render ───────────────────────────────────────────────────────
return (
  <DashboardLayout>
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {mode === 'create' ? 'Nueva Prueba de Trabajo' : mode === 'edit' ? 'Editar Prueba' : 'Detalle de Prueba'}
          </h1>
          <p className="text-muted-foreground">
            {mode === 'view' ? 'Visualización de la evaluación' : 'Complete el formulario de evaluación paso a paso'}
          </p>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center justify-center py-4 mb-4">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isPending = step.id > currentStep;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Box */}
                <div
                  onClick={() => setCurrentStep(step.id)}
                  className={cn(
                    "flex flex-col items-center cursor-pointer group w-20"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-orange-500 text-white shadow-sm",
                    isPending && "bg-gray-100 dark:bg-gray-800 text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700"
                  )}>
                    {isCompleted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={cn(
                    "mt-2 text-[11px] font-medium text-center leading-tight",
                    isCurrent && "text-orange-600 dark:text-orange-400 font-semibold",
                    isCompleted && "text-green-600 dark:text-green-400",
                    isPending && "text-gray-400"
                  )}>
                    {step.title}
                  </span>
                </div>
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-8 h-0.5",
                    step.id < currentStep ? "bg-green-400" : "bg-gray-200 dark:bg-gray-700"
                  )} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card Content */}
      <Card>
        <CardContent className="p-6">

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PASO 1: IDENTIFICACIÓN                                     */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Empresa Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                <SectionHeader icon={Briefcase}>DATOS DE IDENTIFICACIÓN DE LA EMPRESA</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Empresa <span className="text-red-500">*</span></Label>
                    <Input disabled={readOnly} value={formData.empresa} onChange={e => updateField('empresa', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Tipo de Documento</Label>
                    <Input disabled={readOnly} value={formData.tipo_documento_empresa} onChange={e => updateField('tipo_documento_empresa', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">NIT <span className="text-red-500">*</span></Label>
                    <Input disabled={readOnly} value={formData.nit} onChange={e => updateField('nit', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Persona de Contacto</Label>
                    <Input disabled={readOnly} value={formData.persona_contacto} onChange={e => updateField('persona_contacto', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">E-mail para Notificaciones</Label>
                    <Input disabled={readOnly} type="email" value={formData.email_notificaciones} onChange={e => updateField('email_notificaciones', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Dirección</Label>
                    <Input disabled={readOnly} value={formData.direccion_empresa} onChange={e => updateField('direccion_empresa', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">ARL</Label>
                    <Input disabled={readOnly} value={formData.arl} onChange={e => updateField('arl', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Ciudad</Label>
                    <Input disabled={readOnly} value={formData.ciudad_empresa} onChange={e => updateField('ciudad_empresa', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                </div>
              </div>

              {/* Trabajador Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                <SectionHeader icon={User}>DATOS DEL TRABAJADOR</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></Label>
                    <Input disabled={readOnly} value={formData.nombre_trabajador} onChange={e => updateField('nombre_trabajador', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Identificación <span className="text-red-500">*</span></Label>
                    <Input disabled={readOnly} value={formData.identificacion_trabajador} onChange={e => updateField('identificacion_trabajador', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Edad</Label>
                    <Input disabled={readOnly} type="number" value={formData.edad} onChange={e => updateField('edad', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Género</Label>
                    <select disabled={readOnly} className="w-full border rounded-md p-2.5 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500" value={formData.genero} onChange={e => updateField('genero', e.target.value)}>
                      <option value="">Seleccione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Fecha de Nacimiento</Label>
                    <Input disabled={readOnly} type="date" value={formData.fecha_nacimiento} onChange={e => updateField('fecha_nacimiento', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Escolaridad</Label>
                    <Input disabled={readOnly} value={formData.escolaridad} onChange={e => updateField('escolaridad', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Nivel Educativo</Label>
                    <Input disabled={readOnly} value={formData.nivel_educativo} onChange={e => updateField('nivel_educativo', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">EPS</Label>
                    <Input disabled={readOnly} value={formData.eps} onChange={e => updateField('eps', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Puesto de Trabajo Evaluado</Label>
                    <Input disabled={readOnly} value={formData.puesto_trabajo_evaluado} onChange={e => updateField('puesto_trabajo_evaluado', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Cargo</Label>
                    <Input disabled={readOnly} value={formData.cargo} onChange={e => updateField('cargo', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Área</Label>
                    <Input disabled={readOnly} value={formData.area} onChange={e => updateField('area', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Fecha Ingreso a Puesto</Label>
                    <Input disabled={readOnly} type="date" value={formData.fecha_ingreso_puesto_evaluado} onChange={e => updateField('fecha_ingreso_puesto_evaluado', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Fecha Ingreso a Empresa</Label>
                    <Input disabled={readOnly} type="date" value={formData.fecha_ingreso_empresa} onChange={e => updateField('fecha_ingreso_empresa', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Antigüedad en la Empresa</Label>
                    <Input disabled={readOnly} value={formData.antiguedad_empresa} onChange={e => updateField('antiguedad_empresa', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Antigüedad en Puesto</Label>
                    <Input disabled={readOnly} value={formData.antiguedad_puesto_evaluado} onChange={e => updateField('antiguedad_puesto_evaluado', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Antigüedad en Cargo</Label>
                    <Input disabled={readOnly} value={formData.antiguedad_cargo} onChange={e => updateField('antiguedad_cargo', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Diagnóstico</Label>
                    <Input disabled={readOnly} value={formData.diagnostico} onChange={e => updateField('diagnostico', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Código CIE 10</Label>
                    <Input disabled={readOnly} value={formData.codigo_cie10} onChange={e => updateField('codigo_cie10', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Fecha de Siniestro</Label>
                    <Input disabled={readOnly} type="date" value={formData.fecha_siniestro} onChange={e => updateField('fecha_siniestro', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                </div>
              </div>

              {/* Evaluador Section */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
                <SectionHeader icon={FileText}>DATOS DEL EVALUADOR</SectionHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Nombre <span className="text-red-500">*</span></Label>
                    <Input disabled={readOnly} value={formData.nombre_evaluador} onChange={e => updateField('nombre_evaluador', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Identificación <span className="text-red-500">*</span></Label>
                    <Input disabled={readOnly} value={formData.identificacion_evaluador} onChange={e => updateField('identificacion_evaluador', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Formación</Label>
                    <Input disabled={readOnly} value={formData.formacion_evaluador} onChange={e => updateField('formacion_evaluador', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">N° Tarjeta Profesional</Label>
                    <Input disabled={readOnly} value={formData.tarjeta_profesional} onChange={e => updateField('tarjeta_profesional', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">N° Licencia en SST</Label>
                    <Input disabled={readOnly} value={formData.licencia_sst} onChange={e => updateField('licencia_sst', e.target.value)} className="bg-white dark:bg-gray-800" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PASO 2: CONTEXTO Y PARTICIPANTES                           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <SectionHeader>METODOLOGÍA</SectionHeader>
              <Textarea
                disabled={readOnly}
                className="min-h-[120px]"
                value={formData.metodologia}
                onChange={e => updateField('metodologia', e.target.value)}
                placeholder="El siguiente instrumento establecido para la realización de Pruebas de Trabajo de Esfera Mental basa su estructura en el apartado del Dominio Demandas del Trabajo de la Batería de instrumentos para la evaluación de factores de riesgo psicosocial del ministerio de protección social..."
              />

              <SectionHeader>PARTICIPANTES</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Trabajador(a) <span className="text-red-500">*</span></Label><Input disabled={readOnly} value={formData.participante_trabajador} onChange={e => updateField('participante_trabajador', e.target.value)} /></div>
                <div><Label>Jefe Inmediato <span className="text-red-500">*</span></Label><Input disabled={readOnly} value={formData.participante_jefe} onChange={e => updateField('participante_jefe', e.target.value)} /></div>
                <div><Label>Cargo Jefe</Label><Input disabled={readOnly} value={formData.participante_cargo_jefe} onChange={e => updateField('participante_cargo_jefe', e.target.value)} /></div>
              </div>

              <SectionHeader>FUENTES DE RECOLECCIÓN DE LA INFORMACIÓN</SectionHeader>
              <p className="text-sm text-gray-600 mb-2">Se llevaron a cabo las siguientes entrevistas</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 p-2 text-center font-bold">Trabajador</th>
                      <th className="border border-gray-300 p-2 text-center font-bold">Jefe</th>
                      <th className="border border-gray-300 p-2 text-center font-bold">Par</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-2 text-center font-medium">Fecha</td>
                      <td className="border border-gray-300 p-2 text-center font-medium">Fecha</td>
                      <td className="border border-gray-300 p-2 text-center font-medium">Fecha</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-2"><Input disabled={readOnly} type="date" value={formData.fuente_trabajador_fecha} onChange={e => updateField('fuente_trabajador_fecha', e.target.value)} /></td>
                      <td className="border border-gray-300 p-2"><Input disabled={readOnly} type="date" value={formData.fuente_jefe_fecha} onChange={e => updateField('fuente_jefe_fecha', e.target.value)} /></td>
                      <td className="border border-gray-300 p-2"><Input disabled={readOnly} type="date" value={formData.fuente_par_fecha} onChange={e => updateField('fuente_par_fecha', e.target.value)} /></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <SectionHeader>REVISIÓN DOCUMENTAL</SectionHeader>
              <Textarea
                disabled={readOnly}
                className="min-h-[80px]"
                value={formData.revision_documental}
                onChange={e => updateField('revision_documental', e.target.value)}
                placeholder="Se verifica documentación clínica..."
              />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PASO 3: DESCRIPCIÓN DEL CARGO                              */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <SectionHeader>DESCRIPCIÓN DEL PUESTO DE TRABAJO</SectionHeader>
              <Textarea
                disabled={readOnly}
                className="min-h-[120px]"
                value={formData.descripcion_puesto}
                onChange={e => updateField('descripcion_puesto', e.target.value)}
                placeholder="Describa el puesto de trabajo evaluado..."
              />

              <SectionHeader>CONDICIÓN ACTUAL</SectionHeader>
              <Textarea
                disabled={readOnly}
                className="min-h-[100px]"
                value={formData.condicion_actual}
                onChange={e => updateField('condicion_actual', e.target.value)}
                placeholder="Describa la condición actual del trabajador..."
              />

              <SectionHeader>ASPECTOS OCUPACIONALES</SectionHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label>Nombre o Denominación del Puesto</Label><Input disabled={readOnly} value={formData.nombre_puesto_ocupacional} onChange={e => updateField('nombre_puesto_ocupacional', e.target.value)} /></div>
                <div><Label>Área a la que pertenece el puesto</Label><Input disabled={readOnly} value={formData.area_puesto} onChange={e => updateField('area_puesto', e.target.value)} /></div>
                <div><Label>Antigüedad en el Cargo</Label><Input disabled={readOnly} value={formData.antiguedad_cargo_ocupacional} onChange={e => updateField('antiguedad_cargo_ocupacional', e.target.value)} /></div>
                <div><Label>Antigüedad en la Empresa</Label><Input disabled={readOnly} value={formData.antiguedad_empresa_ocupacional} onChange={e => updateField('antiguedad_empresa_ocupacional', e.target.value)} /></div>
                <div><Label>Nivel Educativo Requerido para el Cargo</Label><Input disabled={readOnly} value={formData.nivel_educativo_requerido} onChange={e => updateField('nivel_educativo_requerido', e.target.value)} /></div>
                <div><Label>Jornada Laboral</Label><Input disabled={readOnly} value={formData.jornada_laboral} onChange={e => updateField('jornada_laboral', e.target.value)} /></div>
                <div><Label>Horas Extras</Label><Input disabled={readOnly} value={formData.horas_extras} onChange={e => updateField('horas_extras', e.target.value)} /></div>
                <div><Label>Turnos</Label><Input disabled={readOnly} value={formData.turnos} onChange={e => updateField('turnos', e.target.value)} /></div>
              </div>

              <SectionHeader>DESCRIPCIÓN DE FUNCIONES</SectionHeader>
              <Textarea
                disabled={readOnly}
                className="min-h-[120px]"
                value={formData.descripcion_funciones}
                onChange={e => updateField('descripcion_funciones', e.target.value)}
                placeholder="Describa las funciones del cargo..."
              />
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PASO 4: FACTORES DE RIESGO                                 */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-orange-500" />
                  Factores de Riesgo Psicosociales
                </h2>
                <span className="inline-flex items-center gap-2 px-5 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-base font-medium">
                  <Activity className="w-5 h-5" /> Demandas de Trabajo
                </span>
              </div>

              {Object.entries(factoresRiesgo).map(([key, categoria]) => (
                <div key={key} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {/* Category Header */}
                  <div className="bg-orange-500 text-white px-5 py-4 font-bold text-base uppercase tracking-wide flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {categoria.titulo}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-800/50 border-b-2 border-gray-200 dark:border-gray-700">
                          <th className="text-left px-4 py-3 font-bold text-sm text-gray-700 dark:text-gray-300 w-[180px]">Condición</th>
                          <th className="text-left px-4 py-3 font-bold text-sm text-gray-700 dark:text-gray-300 min-w-[250px]">Descripción</th>
                          <th className="text-center px-3 py-3 font-bold text-sm text-orange-600 dark:text-orange-400 w-[75px]">FR</th>
                          <th className="text-center px-3 py-3 font-bold text-sm text-orange-600 dark:text-orange-400 w-[75px]">EXP</th>
                          <th className="text-center px-3 py-3 font-bold text-sm text-orange-600 dark:text-orange-400 w-[75px]">INT</th>
                          <th className="text-center px-3 py-3 font-bold text-sm text-gray-800 dark:text-gray-200 w-[75px]">Total</th>
                          <th className="text-left px-4 py-3 font-bold text-sm text-gray-700 dark:text-gray-300 w-[160px]">Fuentes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoria.items.map((item, index) => (
                          <tr
                            key={item.numero}
                            className={cn(
                              "border-b border-gray-100 dark:border-gray-800",
                              index % 2 === 1 && "bg-gray-50/50 dark:bg-gray-900/20"
                            )}
                          >
                            <td className="px-4 py-3 align-top">
                              <div className="flex items-start gap-2">
                                <span className="inline-flex items-center justify-center min-w-[22px] h-6 text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded font-bold">
                                  {item.numero}
                                </span>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
                                  {item.nombre}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <Textarea
                                disabled={readOnly}
                                className="min-h-[80px] text-sm resize-y bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
                                placeholder="Describa la condición..."
                                value={formData.factores_riesgo[item.nombre]?.observaciones || ''}
                                onChange={e => updateFactorRiesgo(item.nombre, 'observaciones', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2 text-center align-middle">
                              <Input
                                disabled={readOnly}
                                type="number"
                                className="h-11 w-14 text-center text-base font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-auto"
                                min={0} max={7}
                                value={formData.factores_riesgo[item.nombre]?.fr || ''}
                                onChange={e => updateFactorRiesgo(item.nombre, 'fr', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2 text-center align-middle">
                              <Input
                                disabled={readOnly}
                                type="number"
                                className="h-11 w-14 text-center text-base font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-auto"
                                min={0} max={7}
                                value={formData.factores_riesgo[item.nombre]?.exp || ''}
                                onChange={e => updateFactorRiesgo(item.nombre, 'exp', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2 text-center align-middle">
                              <Input
                                disabled={readOnly}
                                type="number"
                                className="h-11 w-14 text-center text-base font-bold bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 mx-auto"
                                min={0} max={7}
                                value={formData.factores_riesgo[item.nombre]?.int || ''}
                                onChange={e => updateFactorRiesgo(item.nombre, 'int', e.target.value)}
                              />
                            </td>
                            <td className="px-3 py-2 text-center align-middle">
                              <span className="inline-flex items-center justify-center w-12 h-11 rounded-lg bg-gray-100 dark:bg-gray-800 font-bold text-gray-800 dark:text-gray-200 text-base border border-gray-200 dark:border-gray-700">
                                {formData.factores_riesgo[item.nombre]?.total || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 align-middle">
                              <Input
                                disabled={readOnly}
                                className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 w-full"
                                placeholder="Entrevista..."
                                value={formData.factores_riesgo[item.nombre]?.fuentes || ''}
                                onChange={e => updateFactorRiesgo(item.nombre, 'fuentes', e.target.value)}
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Category Total */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 px-5 py-4 flex items-center justify-end gap-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-base font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-500" />
                      Total {categoria.titulo}:
                    </span>
                    <span className="inline-flex items-center justify-center min-w-[56px] h-12 px-4 rounded-lg bg-white dark:bg-gray-900 font-bold text-xl text-orange-600 dark:text-orange-400 border-2 border-orange-200 dark:border-orange-800">
                      {categoria.items.reduce((acc, item) => acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0)}
                    </span>
                    {(() => {
                      const total = categoria.items.reduce((acc, item) => acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0);
                      const { nivel, color } = getNivelRiesgo(key, total);
                      return (
                        <span className={cn("px-4 py-2 rounded-lg font-bold text-sm uppercase", color)}>
                          {nivel}
                        </span>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* PASO 5: RESUMEN Y CONCEPTO                                 */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Per-dimension editing table */}
              <SectionHeader>FACTORES DE RIESGO PSICOSOCIAL</SectionHeader>
              <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="border-b border-r border-gray-200 dark:border-gray-700 p-3 text-left text-sm font-bold text-gray-700 dark:text-gray-300 w-[220px]" rowSpan={2}>
                        Factores de Riesgo Psicosocial
                      </th>
                      <th className="border-b border-r border-gray-200 dark:border-gray-700 p-3 text-center text-sm font-bold text-orange-600 dark:text-orange-400" colSpan={2}>
                        Valoración Subjetiva del Trabajador
                      </th>
                      <th className="border-b border-gray-200 dark:border-gray-700 p-3 text-center text-sm font-bold text-blue-600 dark:text-blue-400" colSpan={2}>
                        Valoración del Experto
                      </th>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <th className="border-b border-r border-gray-200 dark:border-gray-700 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 w-[140px]">Nivel de Riesgo</th>
                      <th className="border-b border-r border-gray-200 dark:border-gray-700 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Factores Detectados</th>
                      <th className="border-b border-r border-gray-200 dark:border-gray-700 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 w-[140px]">Nivel de Riesgo</th>
                      <th className="border-b border-gray-200 dark:border-gray-700 p-2 text-center text-xs font-semibold text-gray-600 dark:text-gray-400">Factores / Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(factoresRiesgo).map(([key, categoria], index) => (
                      <tr key={key} className={cn(
                        "border-b border-gray-100 dark:border-gray-800",
                        index % 2 === 1 && "bg-gray-50/50 dark:bg-gray-900/30"
                      )}>
                        <td className="border-r border-gray-200 dark:border-gray-700 p-3 font-medium text-sm text-gray-800 dark:text-gray-200">
                          {categoria.titulo}
                        </td>
                        {/* Worker risk level - Auto calculated from Step 4 */}
                        <td className="border-r border-gray-200 dark:border-gray-700 p-3 text-center">
                          {(() => {
                            const cat = factoresRiesgo[key];
                            const total = cat.items.reduce((acc, item) => acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0);
                            const { nivel, color } = getNivelRiesgo(key, total);
                            return (
                              <span className={cn("inline-block px-3 py-1.5 rounded-md text-[10px] font-bold whitespace-nowrap", color)}>
                                {nivel}
                              </span>
                            );
                          })()}
                        </td>
                        {/* Worker factors */}
                        <td className="border-r border-gray-200 dark:border-gray-700 p-2">
                          <Textarea
                            disabled={readOnly}
                            className="min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            placeholder="Factores detectados..."
                            value={formData.resumen_factores[key]?.factores_trabajador || ''}
                            onChange={e => updateResumenFactor(key, 'factores_trabajador', e.target.value)}
                          />
                        </td>
                        {/* Expert risk level */}
                        <td className="border-r border-gray-200 dark:border-gray-700 p-3 text-center">
                          <select
                            disabled={readOnly}
                            className={cn(
                              "w-full border rounded-md p-2 text-xs font-semibold text-center",
                              getRiskColor(formData.resumen_factores[key]?.nivel_experto || '')
                            )}
                            value={formData.resumen_factores[key]?.nivel_experto || ''}
                            onChange={e => updateResumenFactor(key, 'nivel_experto', e.target.value)}
                          >
                            <option value="">Seleccione...</option>
                            <option value="riesgo_muy_alto">Muy Alto</option>
                            <option value="riesgo_alto">Alto</option>
                            <option value="riesgo_medio">Medio</option>
                            <option value="riesgo_bajo">Bajo</option>
                            <option value="sin_riesgo">Sin Riesgo</option>
                          </select>
                        </td>
                        {/* Expert factors */}
                        <td className="p-2">
                          <Textarea
                            disabled={readOnly}
                            className="min-h-[60px] text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                            placeholder="Factores / Observaciones..."
                            value={formData.resumen_factores[key]?.factores_experto || ''}
                            onChange={e => updateResumenFactor(key, 'factores_experto', e.target.value)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary grouped by risk level (matching PDF) */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-orange-100 border-b border-orange-200">
                  <div className="grid grid-cols-3 gap-0">
                    <div className="p-2 font-bold text-center text-sm border-r border-orange-200">Factores de Riesgo Psicosocial</div>
                    <div className="p-2 font-bold text-center text-xs border-r border-orange-200">
                      Factores de Riesgo Detectados por la Valoración Subjetiva del Trabajador
                      <div className="font-normal text-[10px] mt-1">De acuerdo a los resultados arrojados por el cuestionario intralaboral forma A se encontró:</div>
                    </div>
                    <div className="p-2 font-bold text-center text-xs">
                      Factores Detectados por la Valoración del Experto
                      <div className="font-normal text-[10px] mt-1">De acuerdo con el análisis psicosocial del puesto de trabajo se encontró:</div>
                    </div>
                  </div>
                </div>
                {NIVELES_RIESGO.map(nivel => {
                  // Calculate worker risk level from Step 4 totals
                  const nivelToValue: Record<string, string> = {
                    'SIN RIESGO': 'sin_riesgo',
                    'RIESGO BAJO': 'riesgo_bajo',
                    'RIESGO MEDIO': 'riesgo_medio',
                    'RIESGO ALTO': 'riesgo_alto',
                    'RIESGO MUY ALTO': 'riesgo_muy_alto',
                  };

                  const trabajadorDims = Object.entries(factoresRiesgo)
                    .filter(([key, cat]) => {
                      const total = cat.items.reduce((acc, item) => acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0);
                      const { nivel: nivelCalculado } = getNivelRiesgo(key, total);
                      return nivelToValue[nivelCalculado] === nivel.value;
                    })
                    .map(([, cat]) => cat.titulo);

                  const expertoDims = Object.entries(factoresRiesgo)
                    .filter(([key]) => formData.resumen_factores[key]?.nivel_experto === nivel.value)
                    .map(([, cat]) => cat.titulo);

                  return (
                    <div key={nivel.value} className="grid grid-cols-3 gap-0 border-b border-gray-200">
                      <div className="p-2 border-r border-gray-200 flex items-center justify-center">
                        <span className={`px-3 py-1 rounded text-xs font-bold ${nivel.color}`}>{nivel.label}</span>
                      </div>
                      <div className="p-2 border-r border-gray-200 text-xs">
                        {trabajadorDims.length > 0 ? trabajadorDims.join(', ') : <span className="text-gray-400">ninguno</span>}
                      </div>
                      <div className="p-2 text-xs">
                        {expertoDims.length > 0 ? expertoDims.join(', ') : <span className="text-gray-400">ninguno</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Concordance - Auto calculated */}
              <SectionHeader>CONCLUSIÓN DE LA EVALUACIÓN</SectionHeader>
              {(() => {
                // Map getNivelRiesgo text to value format
                const nivelToValue: Record<string, string> = {
                  'SIN RIESGO': 'sin_riesgo',
                  'RIESGO BAJO': 'riesgo_bajo',
                  'RIESGO MEDIO': 'riesgo_medio',
                  'RIESGO ALTO': 'riesgo_alto',
                  'RIESGO MUY ALTO': 'riesgo_muy_alto',
                };

                const concordancias: string[] = [];
                const noConcordancias: string[] = [];

                Object.entries(factoresRiesgo).forEach(([key, cat]) => {
                  // Calculate worker level from Step 4 totals
                  const total = cat.items.reduce((acc, item) => acc + (parseFloat(formData.factores_riesgo[item.nombre]?.total || '0') || 0), 0);
                  const { nivel: nivelTrabajadorTexto } = getNivelRiesgo(key, total);
                  const nivelTrabajador = nivelToValue[nivelTrabajadorTexto];

                  // Get expert level from form
                  const nivelExperto = formData.resumen_factores[key]?.nivel_experto;

                  if (nivelExperto) {
                    if (nivelTrabajador === nivelExperto) {
                      concordancias.push(cat.titulo);
                    } else {
                      noConcordancias.push(cat.titulo);
                    }
                  }
                });

                return (
                  <div className="space-y-4">
                    <div>
                      <Label className="font-semibold">Se encuentra concordancia entre la percepción del evaluado y la valoración del profesional para los ítems:</Label>
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 min-h-[60px] text-sm">
                        {concordancias.length > 0 ? concordancias.join(', ') : <span className="text-gray-400">Ninguna (complete la valoración del experto)</span>}
                      </div>
                    </div>
                    <div>
                      <Label className="font-semibold">No se encuentra concordancia entre la percepción del evaluado y la valoración del profesional para los ítems:</Label>
                      <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 min-h-[60px] text-sm">
                        {noConcordancias.length > 0 ? noConcordancias.join(', ') : <span className="text-gray-400">Ninguna (complete la valoración del experto)</span>}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Conclusions */}
              <div className="flex justify-between items-center mt-8">
                <SectionHeader>CONCLUSIONES FINALES DE LA PRUEBA DE TRABAJO DE ESFERA MENTAL</SectionHeader>
              </div>
              {!readOnly && (
                <div className="flex justify-end">
                  <Button onClick={handleGenerarConcepto} disabled={generandoConcepto} className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm" size="sm">
                    {generandoConcepto ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...</> : <><Sparkles className="mr-2 h-4 w-4 text-yellow-300" /> Generar con IA</>}
                  </Button>
                </div>
              )}
              <Textarea
                disabled={readOnly}
                className="min-h-[200px]"
                value={formData.conclusiones_finales}
                onChange={e => updateField('conclusiones_finales', e.target.value)}
                placeholder="Realizada la Prueba de Trabajo de Esfera Mental, analizados todos los ítems propios del instrumento y contrastada la información con otras fuentes..."
              />

              <div>
                <Label className="font-semibold">Recomendaciones</Label>
                <Textarea
                  disabled={readOnly}
                  className="min-h-[120px] mt-1"
                  value={formData.recomendaciones}
                  onChange={e => updateField('recomendaciones', e.target.value)}
                  placeholder="Escriba las recomendaciones..."
                />
              </div>

              {/* Signature Section */}
              <div className="border-t-2 border-gray-300 pt-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  <div>
                    <Label className="font-semibold">Psicólogo Especialista</Label>
                    <Input disabled className="mt-1 bg-gray-50" value={formData.nombre_evaluador} />
                  </div>
                  <div>
                    <Label className="font-semibold">Licencia SST</Label>
                    <Input disabled className="mt-1 bg-gray-50" value={formData.licencia_sst} />
                  </div>
                  <div>
                    <Label className="font-semibold">Firma del Evaluador</Label>
                    <div className="mt-1 space-y-2">
                      {formData.firma_evaluador ? (
                        <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800">
                          <img
                            src={formData.firma_evaluador}
                            alt="Firma del evaluador"
                            className="max-h-[80px] mx-auto object-contain"
                          />
                          {!readOnly && (
                            <button
                              type="button"
                              onClick={() => updateField('firma_evaluador', '')}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ) : (
                        <label className={cn(
                          "flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:border-orange-400 transition-colors",
                          readOnly && "cursor-not-allowed opacity-60"
                        )}>
                          <Upload className="w-6 h-6 text-gray-400 mb-1" />
                          <span className="text-xs text-gray-500">Subir imagen de firma</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={readOnly}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  // Process image to look like scanned signature
                                  const img = new Image();
                                  img.onload = () => {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    const ctx = canvas.getContext('2d');
                                    if (ctx) {
                                      // Draw original image
                                      ctx.drawImage(img, 0, 0);

                                      // Get image data
                                      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                                      const data = imageData.data;

                                      // Process pixels: increase contrast and make background transparent
                                      for (let i = 0; i < data.length; i += 4) {
                                        const r = data[i];
                                        const g = data[i + 1];
                                        const b = data[i + 2];

                                        // Calculate brightness
                                        const brightness = (r + g + b) / 3;

                                        // If pixel is light (background), make it transparent
                                        if (brightness > 200) {
                                          data[i + 3] = 0; // Set alpha to 0
                                        } else {
                                          // Increase contrast for dark pixels (signature)
                                          const factor = 1.5;
                                          data[i] = Math.min(255, Math.max(0, (r - 128) * factor + 128));
                                          data[i + 1] = Math.min(255, Math.max(0, (g - 128) * factor + 128));
                                          data[i + 2] = Math.min(255, Math.max(0, (b - 128) * factor + 128));
                                        }
                                      }

                                      ctx.putImageData(imageData, 0, 0);
                                      updateField('firma_evaluador', canvas.toDataURL('image/png'));
                                    }
                                  };
                                  img.src = reader.result as string;
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Navigation                                                 */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button
          variant="ghost"
          onClick={prevStep}
          disabled={currentStep === 1}
          className={cn(
            "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800",
            currentStep === 1 && 'invisible'
          )}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Anterior
        </Button>

        <div className="flex items-center gap-3">
          {!readOnly && (
            <Button
              variant="ghost"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              <Save className="mr-1 h-4 w-4" /> Guardar
            </Button>
          )}
          {currentStep < 5 ? (
            <Button
              onClick={nextStep}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6"
            >
              Siguiente <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            !readOnly && (
              <Button
                onClick={() => handleSave(true)}
                disabled={saving}
                className="bg-green-500 hover:bg-green-600 text-white px-6"
              >
                <Save className="mr-1 h-4 w-4" /> Finalizar
              </Button>
            )
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Download Modal                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white dark:bg-gray-900 shadow-xl rounded-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">Prueba Finalizada</h2>
              <p className="mb-6 text-gray-600 dark:text-gray-400">La prueba se ha guardado correctamente.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                {downloadUrls?.pdf_url && (
                  <a
                    href={downloadUrls.pdf_url.startsWith('http') ? downloadUrls.pdf_url : `${process.env.NEXT_PUBLIC_API_URL || 'https://mentis-production.up.railway.app'}${downloadUrls.pdf_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                      <Download className="mr-2 h-4 w-4" /> Descargar PDF ReportLab
                    </Button>
                  </a>
                )}
                <Button variant="outline" onClick={() => router.push('/dashboard/pruebas-trabajo')}>
                  Volver al listado
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* Validation Modal                                           */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h3 className="text-lg font-bold text-gray-900">Campos Requeridos</h3>
              <button onClick={() => setShowValidationModal(false)} className="text-gray-400 hover:text-gray-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 font-semibold flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" /> Por favor complete los siguientes campos:
              </p>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-1">
                {validationErrors.map((error, idx) => (<li key={idx}>{error}</li>))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowValidationModal(false)} className="bg-orange-500 hover:bg-orange-600 text-white">Entendido</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  </DashboardLayout>
);
}
