'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import {
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

// Definición de las dimensiones de riesgo y sus condiciones
const DIMENSIONES_RIESGO = {
  demandas_cuantitativas: {
    nombre: 'Demandas Cuantitativas de Trabajo',
    items: [
      { numero: 1, texto: 'Ritmo de trabajo acelerado' },
      { numero: 2, texto: 'Volumen de tareas elevado' },
      { numero: 3, texto: 'Tiempo insuficiente para completar tareas' },
    ],
  },
  demandas_carga_mental: {
    nombre: 'Demandas de Carga Mental',
    items: [
      { numero: 1, texto: 'Necesidad de atención sostenida' },
      { numero: 2, texto: 'Complejidad de las tareas' },
      { numero: 3, texto: 'Cantidad de información a procesar' },
      { numero: 4, texto: 'Necesidad de tomar decisiones complejas' },
      { numero: 5, texto: 'Concentración requerida' },
    ],
  },
  demandas_emocionales: {
    nombre: 'Demandas Emocionales',
    items: [
      { numero: 1, texto: 'Manejo de situaciones emocionalmente difíciles' },
      { numero: 2, texto: 'Contacto con público o usuarios' },
      { numero: 3, texto: 'Control de emociones ante situaciones laborales' },
    ],
  },
  exigencias_responsabilidad: {
    nombre: 'Exigencias de Responsabilidad del Cargo',
    items: [
      { numero: 1, texto: 'Responsabilidad sobre resultados críticos' },
      { numero: 2, texto: 'Supervisión de otros trabajadores' },
      { numero: 3, texto: 'Manejo de recursos importantes' },
      { numero: 4, texto: 'Toma de decisiones importantes' },
      { numero: 5, texto: 'Impacto de errores en la organización' },
      { numero: 6, texto: 'Responsabilidad sobre la seguridad de otros' },
    ],
  },
  consistencia_rol: {
    nombre: 'Consistencia de Rol',
    items: [
      { numero: 1, texto: 'Claridad de las funciones del puesto' },
      { numero: 2, texto: 'Instrucciones claras y consistentes' },
      { numero: 3, texto: 'Definición de objetivos' },
      { numero: 4, texto: 'Demandas contradictorias' },
    ],
  },
  demandas_ambientales: {
    nombre: 'Demandas Ambientales y de Esfuerzo Físico',
    items: [
      { numero: 1, texto: 'Ruido en el ambiente laboral' },
      { numero: 2, texto: 'Iluminación inadecuada' },
      { numero: 3, texto: 'Temperatura extrema' },
      { numero: 4, texto: 'Exposición a agentes químicos' },
      { numero: 5, texto: 'Esfuerzo físico intenso' },
      { numero: 6, texto: 'Posturas forzadas' },
      { numero: 7, texto: 'Movimientos repetitivos' },
      { numero: 8, texto: 'Manipulación de cargas' },
      { numero: 9, texto: 'Espacios de trabajo reducidos' },
      { numero: 10, texto: 'Vibraciones' },
    ],
  },
  demandas_jornada: {
    nombre: 'Demandas de la Jornada de Trabajo',
    items: [
      { numero: 1, texto: 'Jornadas de trabajo extendidas' },
      { numero: 2, texto: 'Trabajo en turnos rotativos o nocturnos' },
    ],
  },
};

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

// Helper para colores de riesgo (usado en el select)
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

interface StepData {
  // Paso 1: Metodología y Participantes
  metodologia: string;
  participante_trabajador: string;
  participante_jefe: string;
  participante_cargo_jefe: string;
  fuente_trabajador_fecha: string;
  fuente_jefe_fecha: string;
  fuente_par_fecha: string;

  // Paso 2: Revisión Documental y Descripción
  revision_documental: string;
  descripcion_puesto: string;
  condicion_actual: string;

  // Paso 3: Aspectos Ocupacionales y Funciones
  nombre_puesto: string;
  area_puesto: string;
  antiguedad_cargo_ocupacional: string;
  antiguedad_empresa_ocupacional: string;
  nivel_educativo_requerido: string;
  jornada_laboral: string;
  horas_extras: string;
  turnos: string;
  descripcion_funciones: string;

  // Pasos 4-10: Condiciones de Riesgo (se manejan por separado)
  // Paso 11: Resumen de Factores (se maneja por separado)
  // Paso 12: Conclusiones Finales
  conclusion_evaluacion: string;
  concordancia_items: string;
  no_concordancia_items: string;
  conclusiones_finales: string;
  recomendaciones: string;
}

interface PruebaTrabajoFormProps {
  readOnly?: boolean;
}

export function PruebaTrabajoForm({ readOnly = false }: PruebaTrabajoFormProps) {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 12;

  const [formData, setFormData] = useState<StepData>({
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
    nombre_puesto: '',
    area_puesto: '',
    antiguedad_cargo_ocupacional: '',
    antiguedad_empresa_ocupacional: '',
    nivel_educativo_requerido: '',
    jornada_laboral: '',
    horas_extras: '',
    turnos: '',
    descripcion_funciones: '',
    conclusion_evaluacion: '',
    concordancia_items: '',
    no_concordancia_items: '',
    conclusiones_finales: '',
    recomendaciones: '',
  });

  // Estado para condiciones de riesgo
  const [condicionesRiesgo, setCondicionesRiesgo] = useState<any[]>([]);

  // Estado para resumen de factores
  const [resumenFactores, setResumenFactores] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Cargar datos de secciones
      try {
        const secciones = await api.get(`/pruebas-trabajo/${params.id}/secciones`);
        if (secciones) {
          setFormData((prev) => ({
            ...prev,
            ...secciones,
          }));
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error loading secciones:', error);
        }
      }

      // Cargar condiciones de riesgo
      try {
        const condiciones = await api.get(`/pruebas-trabajo/${params.id}/condiciones-riesgo`);
        setCondicionesRiesgo((condiciones as any[]) || []);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error loading condiciones:', error);
        }
      }

      // Cargar resumen de factores
      try {
        const resumen = await api.get(`/pruebas-trabajo/${params.id}/resumen-factores`);
        setResumenFactores((resumen as any[]) || []);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error loading resumen:', error);
        }
      }

      // Cargar concepto final
      try {
        const concepto: any = await api.get(`/pruebas-trabajo/${params.id}/concepto-final`);
        if (concepto) {
          setFormData((prev: any) => ({
            ...prev,
            conclusion_evaluacion: concepto.conclusion_evaluacion || '',
            concordancia_items: concepto.concordancia_items || '',
            no_concordancia_items: concepto.no_concordancia_items || '',
            conclusiones_finales: concepto.conclusiones_finales || '',
            recomendaciones: concepto.recomendaciones || '',
          }));
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error('Error loading concepto:', error);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los datos de la evaluación');
    } finally {
      setLoading(false);
    }
  };

  // Efecto para auto-generar conclusiones de concordancia
  useEffect(() => {
    if (resumenFactores.length > 0) {
      const concordancias: string[] = [];
      const noConcordancias: string[] = [];

      resumenFactores.forEach(r => {
        const dimensionNombre = DIMENSIONES_RIESGO[r.dimension as keyof typeof DIMENSIONES_RIESGO]?.nombre;
        if (dimensionNombre && r.nivel_riesgo_experto && r.nivel_riesgo_trabajador) {
          if (r.nivel_riesgo_experto === r.nivel_riesgo_trabajador) {
            concordancias.push(dimensionNombre);
          } else {
            noConcordancias.push(dimensionNombre);
          }
        }
      });

      const textoConcordancia = concordancias.length > 0
        ? concordancias.join(', ')
        : 'Ninguna';

      const textoNoConcordancia = noConcordancias.length > 0
        ? noConcordancias.join(', ')
        : 'Ninguna';

      setFormData(prev => {
        // Solo actualizar si cambia para evitar ciclos infinitos
        if (prev.concordancia_items === textoConcordancia && prev.no_concordancia_items === textoNoConcordancia) {
          return prev;
        }
        return {
          ...prev,
          concordancia_items: textoConcordancia,
          no_concordancia_items: textoNoConcordancia
        };
      });
    }
  }, [resumenFactores]);



  const [generandoConcepto, setGenerandoConcepto] = useState(false);

  const handleGenerarConcepto = async () => {
    if (generandoConcepto) return;

    setGenerandoConcepto(true);
    try {
      const response = await api.post<{
        analisis_generado?: string;
        recomendaciones_generadas?: string;
        concepto?: string;
      }>('/conceptos/generar', {
        valoracion_id: parseInt(params.id as string)
      });

      if (response && response.analisis_generado) {
        setFormData(prev => ({
          ...prev,
          conclusiones_finales: response.analisis_generado || '',
          recomendaciones: response.recomendaciones_generadas || '',
          // Actualizar también la conclusión breve si está vacía
          conclusion_evaluacion: prev.conclusion_evaluacion || (response.concepto ? response.concepto.substring(0, 500) + '...' : '')
        }));

        // Guardar automáticamente para persistir los cambios
        await api.post(`/pruebas-trabajo/${params.id}/concepto-final`, {
          ...formData,
          conclusiones_finales: response.analisis_generado || '',
          recomendaciones: response.recomendaciones_generadas || ''
        });

        toast.success('Concepto generado exitosamente con IA');
      }

    } catch (error) {
      console.error('Error generando concepto:', error);
      toast.error('Error al generar el concepto');
    } finally {
      setGenerandoConcepto(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Guardar secciones (pasos 1, 2, 3)
      await api.post(`/pruebas-trabajo/${params.id}/secciones`, formData);

      toast.success('Datos guardados correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar los datos');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    await handleSave();
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = async () => {
    await handleSave();
    toast.success('Evaluación completada');
    router.push(`/dashboard/pruebas-trabajo/${params.id}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Metodologia formData={formData} setFormData={setFormData} readOnly={readOnly} />;
      case 2:
        return <Step2RevisionDocumental formData={formData} setFormData={setFormData} readOnly={readOnly} />;
      case 3:
        return <Step3AspectosOcupacionales formData={formData} setFormData={setFormData} readOnly={readOnly} />;
      case 4:
        return (
          <StepCondicionesRiesgo
            dimension="demandas_cuantitativas"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 5:
        return (
          <StepCondicionesRiesgo
            dimension="demandas_carga_mental"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 6:
        return (
          <StepCondicionesRiesgo
            dimension="demandas_emocionales"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 7:
        return (
          <StepCondicionesRiesgo
            dimension="exigencias_responsabilidad"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 8:
        return (
          <StepCondicionesRiesgo
            dimension="consistencia_rol"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 9:
        return (
          <StepCondicionesRiesgo
            dimension="demandas_ambientales"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 10:
        return (
          <StepCondicionesRiesgo
            dimension="demandas_jornada"
            pruebaId={params.id as string}
            condicionesRiesgo={condicionesRiesgo}
            setCondicionesRiesgo={setCondicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 11:
        return (
          <StepResumenFactores
            pruebaId={params.id as string}
            resumenFactores={resumenFactores}
            setResumenFactores={setResumenFactores}
            condicionesRiesgo={condicionesRiesgo}
            readOnly={readOnly}
          />
        );
      case 12:
        return (
          <StepConceptoFinal
            formData={formData}
            setFormData={setFormData}
            handleGenerarConcepto={handleGenerarConcepto}
            generandoConcepto={generandoConcepto}
            readOnly={readOnly}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-violet-500" />
              Completar Evaluación
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
          <Link href={`/dashboard/pruebas-trabajo/${params.id}`}>
            <Button variant="outline" className="border-gray-200 dark:border-[#333333]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-[#333333] rounded-full h-2">
          <div
            className="bg-violet-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>

        {/* Step Content */}
        <Card className="border-gray-200 dark:border-[#333333]">
          <CardContent className="p-6">{renderStep()}</CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="border-gray-200 dark:border-[#333333]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>

          <div className="flex gap-2">
            {!readOnly && (
              <Button
                variant="outline"
                onClick={handleSave}
                disabled={saving}
                className="border-gray-200 dark:border-[#333333]"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar
                  </>
                )}
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                className="bg-violet-500 hover:bg-violet-600 text-white"
              >
                Siguiente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              !readOnly && (
                <Button
                  onClick={handleFinish}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar Evaluación
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ===== COMPONENTES DE PASOS =====

function Step1Metodologia({
  formData,
  setFormData,
  readOnly,
}: {
  formData: StepData;
  setFormData: React.Dispatch<React.SetStateAction<StepData>>;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Metodología y Participantes
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="metodologia">Metodología</Label>
          <Textarea
            id="metodologia"
            rows={4}
            value={formData.metodologia}
            onChange={(e) => setFormData({ ...formData, metodologia: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Describa la metodología utilizada para la evaluación..."
            disabled={readOnly}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="participante_trabajador">Participante Trabajador</Label>
            <Input
              id="participante_trabajador"
              value={formData.participante_trabajador}
              onChange={(e) =>
                setFormData({ ...formData, participante_trabajador: e.target.value })
              }
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="participante_jefe">Participante Jefe</Label>
            <Input
              id="participante_jefe"
              value={formData.participante_jefe}
              onChange={(e) => setFormData({ ...formData, participante_jefe: e.target.value })}
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="participante_cargo_jefe">Cargo del Jefe</Label>
            <Input
              id="participante_cargo_jefe"
              value={formData.participante_cargo_jefe}
              onChange={(e) =>
                setFormData({ ...formData, participante_cargo_jefe: e.target.value })
              }
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
            Fuentes de Recolección de Información
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="fuente_trabajador_fecha">Fecha Trabajador</Label>
              <Input
                id="fuente_trabajador_fecha"
                type="date"
                value={formData.fuente_trabajador_fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fuente_trabajador_fecha: e.target.value })
                }
                className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="fuente_jefe_fecha">Fecha Jefe</Label>
              <Input
                id="fuente_jefe_fecha"
                type="date"
                value={formData.fuente_jefe_fecha}
                onChange={(e) => setFormData({ ...formData, fuente_jefe_fecha: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                disabled={readOnly}
              />
            </div>
            <div>
              <Label htmlFor="fuente_par_fecha">Fecha Par</Label>
              <Input
                id="fuente_par_fecha"
                type="date"
                value={formData.fuente_par_fecha}
                onChange={(e) => setFormData({ ...formData, fuente_par_fecha: e.target.value })}
                className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                disabled={readOnly}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2RevisionDocumental({
  formData,
  setFormData,
  readOnly,
}: {
  formData: StepData;
  setFormData: React.Dispatch<React.SetStateAction<StepData>>;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Revisión Documental y Descripción
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="revision_documental">Revisión Documental</Label>
          <Textarea
            id="revision_documental"
            rows={5}
            value={formData.revision_documental}
            onChange={(e) => setFormData({ ...formData, revision_documental: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Documente la revisión de documentos relevantes..."
            disabled={readOnly}
          />
        </div>

        <div>
          <Label htmlFor="descripcion_puesto">Descripción del Puesto</Label>
          <Textarea
            id="descripcion_puesto"
            rows={5}
            value={formData.descripcion_puesto}
            onChange={(e) => setFormData({ ...formData, descripcion_puesto: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Describa el puesto de trabajo evaluado..."
            disabled={readOnly}
          />
        </div>

        <div>
          <Label htmlFor="condicion_actual">Condición Actual del Trabajador</Label>
          <Textarea
            id="condicion_actual"
            rows={5}
            value={formData.condicion_actual}
            onChange={(e) => setFormData({ ...formData, condicion_actual: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Describa la condición actual del trabajador..."
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}

function Step3AspectosOcupacionales({
  formData,
  setFormData,
  readOnly,
}: {
  formData: StepData;
  setFormData: React.Dispatch<React.SetStateAction<StepData>>;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Aspectos Ocupacionales
        </h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nombre_puesto">Nombre del Puesto</Label>
            <Input
              id="nombre_puesto"
              value={formData.nombre_puesto}
              onChange={(e) => setFormData({ ...formData, nombre_puesto: e.target.value })}
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="area_puesto">Área</Label>
            <Input
              id="area_puesto"
              value={formData.area_puesto}
              onChange={(e) => setFormData({ ...formData, area_puesto: e.target.value })}
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="antiguedad_cargo_ocupacional">Antigüedad en el Cargo</Label>
            <Input
              id="antiguedad_cargo_ocupacional"
              value={formData.antiguedad_cargo_ocupacional}
              onChange={(e) =>
                setFormData({ ...formData, antiguedad_cargo_ocupacional: e.target.value })
              }
              placeholder="Ej: 2 años 3 meses"
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="antiguedad_empresa_ocupacional">Antigüedad en la Empresa</Label>
            <Input
              id="antiguedad_empresa_ocupacional"
              value={formData.antiguedad_empresa_ocupacional}
              onChange={(e) =>
                setFormData({ ...formData, antiguedad_empresa_ocupacional: e.target.value })
              }
              placeholder="Ej: 5 años 1 mes"
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="nivel_educativo_requerido">Nivel Educativo Requerido</Label>
            <Input
              id="nivel_educativo_requerido"
              value={formData.nivel_educativo_requerido}
              onChange={(e) =>
                setFormData({ ...formData, nivel_educativo_requerido: e.target.value })
              }
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="jornada_laboral">Jornada Laboral</Label>
            <Input
              id="jornada_laboral"
              value={formData.jornada_laboral}
              onChange={(e) => setFormData({ ...formData, jornada_laboral: e.target.value })}
              placeholder="Ej: 8:00 AM - 5:00 PM"
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="horas_extras">Horas Extras</Label>
            <Input
              id="horas_extras"
              value={formData.horas_extras}
              onChange={(e) => setFormData({ ...formData, horas_extras: e.target.value })}
              placeholder="Ej: Ocasionales, 2-3 horas/semana"
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="turnos">Turnos</Label>
            <Input
              id="turnos"
              value={formData.turnos}
              onChange={(e) => setFormData({ ...formData, turnos: e.target.value })}
              placeholder="Ej: Diurno, Mixto, Rotativo"
              className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
              disabled={readOnly}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="descripcion_funciones">Descripción de Funciones</Label>
          <Textarea
            id="descripcion_funciones"
            rows={6}
            value={formData.descripcion_funciones}
            onChange={(e) => setFormData({ ...formData, descripcion_funciones: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Describa las funciones principales del puesto..."
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}

function StepCondicionesRiesgo({
  dimension,
  pruebaId,
  condicionesRiesgo,
  setCondicionesRiesgo,
  readOnly,
}: {
  dimension: string;
  pruebaId: string;
  condicionesRiesgo: any[];
  setCondicionesRiesgo: React.Dispatch<React.SetStateAction<any[]>>;
  readOnly?: boolean;
}) {
  const dimensionData = DIMENSIONES_RIESGO[dimension as keyof typeof DIMENSIONES_RIESGO];
  const [saving, setSaving] = useState(false);

  const getCondicionData = (itemNumero: number) => {
    const found = condicionesRiesgo.find(
      (c) => c.dimension === dimension && c.item_numero === itemNumero
    );

    const defaultConfig = {
      dimension,
      item_numero: itemNumero,
      condicion_texto: '',
      descripcion_detallada: '',
      frecuencia: 0,
      exposicion: 0,
      intensidad: 0,
      total_condicion: 0,
      fuentes_informacion: 'Entrevista con el trabajador y jefe inmediato',
    };

    if (found) {
      return {
        ...defaultConfig,
        ...found,
        // Ensure numeric fields are numbers (handle DB nulls)
        frecuencia: found.frecuencia ?? 0,
        exposicion: found.exposicion ?? 0,
        intensidad: found.intensidad ?? 0,
        total_condicion: found.total_condicion ?? 0,
        // Default text for Fuentes de Información if empty
        fuentes_informacion: found.fuentes_informacion || 'Entrevista con el trabajador y jefe inmediato',
      };
    }

    return defaultConfig;
  };

  const updateCondicion = (itemNumero: number, field: string, rawValue: any) => {
    const existingIndex = condicionesRiesgo.findIndex(
      (c) => c.dimension === dimension && c.item_numero === itemNumero
    );

    let value = rawValue;

    // Strict validation for numeric fields
    if (['frecuencia', 'exposicion', 'intensidad'].includes(field)) {
      // Force empty string if invalid or allow 0
      if (rawValue === '' || rawValue === undefined) {
        value = 0;
      } else {
        const parsed = parseInt(rawValue);
        value = isNaN(parsed) ? 0 : parsed;
        if (value > 7) value = 7;
        if (value < 0) value = 0;
      }
    }

    const updatedCondicion = {
      ...getCondicionData(itemNumero),
      [field]: value,
    };

    // Calcular total if change is in FR, EXP or INT
    if (['frecuencia', 'exposicion', 'intensidad'].includes(field)) {
      const sum =
        (Number(updatedCondicion.frecuencia) || 0) +
        (Number(updatedCondicion.exposicion) || 0) +
        (Number(updatedCondicion.intensidad) || 0);

      // Ensure total never exceeds 21 (fallback safety)
      updatedCondicion.total_condicion = sum > 21 ? 21 : sum;
    }

    if (existingIndex >= 0) {
      const newCondiciones = [...condicionesRiesgo];
      newCondiciones[existingIndex] = updatedCondicion;
      setCondicionesRiesgo(newCondiciones);
    } else {
      setCondicionesRiesgo([...condicionesRiesgo, updatedCondicion]);
    }
  };

  // Helper for input onChange to enforce strict control
  const handleNumericInput = (itemNumero: number, field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // If empty, allow it momentarily as 0, or handle as delete
    if (inputValue === '') {
      updateCondicion(itemNumero, field, 0);
      return;
    }

    let val = parseInt(inputValue);

    // Strict clamping
    if (isNaN(val)) val = 0;
    if (val > 7) val = 7;
    if (val < 0) val = 0;

    // Force update with validated value
    // We explicitly cast to number to ensure state is clean
    updateCondicion(itemNumero, field, Number(val));
  };

  const handleSaveCondiciones = async () => {
    try {
      setSaving(true);

      // Guardar todas las condiciones de esta dimensión
      for (const item of dimensionData.items) {
        const condicionData = getCondicionData(item.numero);

        // Guardamos si tiene algún dato relevante
        if (condicionData.descripcion_detallada || condicionData.total_condicion > 0 || condicionData.frecuencia !== undefined) {
          // Asegurarnos de guardar incluso si es 0 pero ha sido editado, 
          // para este caso asumimos que si existe el objeto en el estado local, lo guardamos.
          await api.post(`/pruebas-trabajo/${pruebaId}/condiciones-riesgo`, {
            ...condicionData,
            condicion_texto: item.texto,
          });
        }
      }

      toast.success('Condiciones guardadas correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar las condiciones');
    } finally {
      setSaving(false);
    }
  };

  const totalDimension = dimensionData.items.reduce((acc, item) => acc + (getCondicionData(item.numero).total_condicion || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* Title is now inside the table header, but we keep the save button here */}
        <div className="flex-1"></div>
        {!readOnly && (
          <Button
            onClick={handleSaveCondiciones}
            disabled={saving}
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-[#333333] mb-2"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar Cambios
              </>
            )}
          </Button>
        )}
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-[#333333] rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-violet-500 text-white">
              <th colSpan={6} className="px-6 py-3 text-lg font-bold uppercase tracking-wider text-center border-b border-[#e55a2b]">
                {dimensionData.nombre}
              </th>
            </tr>
            <tr className="bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-200 font-semibold border-b border-gray-200 dark:border-[#333333]">
              <th className="px-4 py-3 w-[30%]">Condición</th>
              <th className="px-2 py-3 text-center w-[10%]">Frecuencia<br />(0-7)</th>
              <th className="px-2 py-3 text-center w-[10%]">Exposición<br />(0-7)</th>
              <th className="px-2 py-3 text-center w-[10%]">Intensidad<br />(0-7)</th>
              <th className="px-2 py-3 text-center w-[8%]">Total (Suma)</th>
              <th className="px-4 py-3 w-[32%]">Fuentes de Información</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#333333] bg-white dark:bg-[#0f0f0f]">
            {dimensionData.items.map((item) => {
              const condicionData = getCondicionData(item.numero);
              return (
                <tr key={item.numero} className="hover:bg-gray-50 dark:hover:bg-[#151515]">
                  <td className="px-4 py-3 align-middle font-medium text-gray-900 dark:text-white">
                    {item.texto}
                  </td>
                  <td className="px-2 py-3 align-middle text-center">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={condicionData.frecuencia}
                      onChange={(e) => handleNumericInput(item.numero, 'frecuencia', e)}
                      className="w-full text-center h-9 rounded-md border border-gray-300 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-2 py-3 align-middle text-center">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={condicionData.exposicion}
                      onChange={(e) => handleNumericInput(item.numero, 'exposicion', e)}
                      className="w-full text-center h-9 rounded-md border border-gray-300 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-2 py-3 align-middle text-center">
                    <input
                      type="number"
                      min="0"
                      max="7"
                      value={condicionData.intensidad}
                      onChange={(e) => handleNumericInput(item.numero, 'intensidad', e)}
                      className="w-full text-center h-9 rounded-md border border-gray-300 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      disabled={readOnly}
                    />
                  </td>
                  <td className="px-2 py-3 align-middle text-center font-bold text-gray-900 dark:text-white">
                    {condicionData.total_condicion ?? 0}
                  </td>
                  <td className="px-4 py-3 align-middle">
                    <Input
                      value={condicionData.fuentes_informacion || 'Entrevista con el trabajador y el jefe inmediato'}
                      onChange={(e) => updateCondicion(item.numero, 'fuentes_informacion', e.target.value)}
                      className="w-full h-9 bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-[#333333] text-sm"
                      disabled={readOnly}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-gray-50 dark:bg-[#1a1a1a] font-bold border-t-2 border-gray-200 dark:border-[#333333]">
              <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">TOTAL DEMANDA:</td>
              <td colSpan={3} className="px-2 py-3">
                {/* Visualización del Nivel de Riesgo en el Footer */}
                {(() => {
                  const { nivel, color } = getNivelRiesgo(dimension, totalDimension);
                  return (
                    <div className={`text-center py-1 px-3 rounded text-sm ${color}`}>
                      {nivel}
                    </div>
                  );
                })()}
              </td>
              <td className="px-2 py-3 text-center text-lg text-violet-500">
                {totalDimension}
              </td>
              <td className="px-4 py-3"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function StepResumenFactores({
  pruebaId,
  resumenFactores,
  setResumenFactores,
  condicionesRiesgo,
  readOnly,
}: {
  pruebaId: string;
  resumenFactores: any[];
  setResumenFactores: React.Dispatch<React.SetStateAction<any[]>>;
  condicionesRiesgo: any[];
  readOnly?: boolean;
}) {
  const [saving, setSaving] = useState(false);

  const dimensiones = Object.keys(DIMENSIONES_RIESGO);

  const getResumenData = (dimension: string) => {
    return resumenFactores.find((r) => r.dimension === dimension) || {
      dimension,
      num_items: DIMENSIONES_RIESGO[dimension as keyof typeof DIMENSIONES_RIESGO].items.length,
      puntuacion_total: 0,
      nivel_riesgo_trabajador: '',
      nivel_riesgo_experto: '',
      factores_detectados_trabajador: '',
      factores_detectados_experto: '',
      observaciones_experto: '',
    };
  };

  const updateResumen = (dimension: string, field: string, value: any) => {
    const existingIndex = resumenFactores.findIndex((r) => r.dimension === dimension);
    const updatedResumen = {
      ...getResumenData(dimension),
      [field]: value,
    };

    if (existingIndex >= 0) {
      const newResumen = [...resumenFactores];
      newResumen[existingIndex] = updatedResumen;
      setResumenFactores(newResumen);
    } else {
      setResumenFactores([...resumenFactores, updatedResumen]);
    }
  };

  const handleSaveResumen = async () => {
    try {
      setSaving(true);

      for (const dimension of dimensiones) {
        const resumenData = { ...getResumenData(dimension) };

        // --- INICIO AUTO-CALCULO --- 
        // Calculamos el nivel de riesgo en base a las condiciones actuales
        const totalScore = condicionesRiesgo
          .filter((c) => c.dimension === dimension)
          .reduce((sum, c) => sum + (c.total_condicion || 0), 0);

        const { nivel } = getNivelRiesgo(dimension, totalScore);

        // Mapeamos a snake_case para el backend
        let nivelInterno = '';
        if (nivel === 'SIN RIESGO') nivelInterno = 'sin_riesgo';
        else if (nivel === 'RIESGO BAJO') nivelInterno = 'riesgo_bajo';
        else if (nivel === 'RIESGO MEDIO') nivelInterno = 'riesgo_medio';
        else if (nivel === 'RIESGO ALTO') nivelInterno = 'riesgo_alto';
        else if (nivel === 'RIESGO MUY ALTO') nivelInterno = 'riesgo_muy_alto';

        // Asignamos el valor calculado
        resumenData.nivel_riesgo_trabajador = nivelInterno;
        resumenData.puntuacion_total = totalScore;
        // --- FIN AUTO-CALCULO ---

        if (resumenData.factores_detectados_experto || resumenData.nivel_riesgo_experto || resumenData.nivel_riesgo_trabajador || resumenData.puntuacion_total > 0) {
          await api.post(`/pruebas-trabajo/${pruebaId}/resumen-factores`, resumenData);
        }
      }

      toast.success('Resumen guardado correctamente');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar el resumen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Resumen de Factores de Riesgo
        </h2>
        {!readOnly && (
          <Button
            onClick={handleSaveResumen}
            disabled={saving}
            variant="outline"
            size="sm"
            className="border-gray-200 dark:border-[#333333]"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-600 dark:text-gray-400">
        Compare la valoración subjetiva del trabajador con su valoración como experto para cada
        dimensión de riesgo.
      </p>

      <div className="space-y-6">
        {dimensiones.map((dimension) => {
          const dimensionData =
            DIMENSIONES_RIESGO[dimension as keyof typeof DIMENSIONES_RIESGO];
          const resumenData = getResumenData(dimension);

          // Calculate total score for this dimension from condicionesRiesgo
          const totalScore = condicionesRiesgo
            .filter((c) => c.dimension === dimension)
            .reduce((sum, c) => sum + (c.total_condicion || 0), 0);

          const { nivel: calculatedRisk, color: riskColor } = getNivelRiesgo(dimension, totalScore);

          return (
            <Card key={dimension} className="border-gray-200 dark:border-[#333333]">
              <CardHeader className="pb-3 bg-gray-50 dark:bg-[#1a1a1a]">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">{dimensionData.nombre}</CardTitle>
                  <span className="text-sm font-medium px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    Puntaje Total: {totalScore}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nivel de Riesgo (Cuestionario) - Calculado</Label>
                    <div className={`p-2 rounded font-bold text-center border ${riskColor} mt-1`}>
                      {calculatedRisk}
                    </div>
                    {/* Hidden input to keep logic if needed, but display is now custom div */}
                    <input
                      type="hidden"
                      value={calculatedRisk}
                    // We might want to save this value to the state if it's meant to be persisted
                    // But for now it's calculated on fly for display. 
                    // If it needs to be saved to DB as 'nivel_riesgo_trabajador', we should update the state.
                    />
                  </div>
                  <div>
                    <Label>Nivel de Riesgo - Experto</Label>
                    <select
                      value={resumenData.nivel_riesgo_experto || ''}
                      onChange={(e) =>
                        updateResumen(dimension, 'nivel_riesgo_experto', e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-md border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-white"
                      disabled={readOnly}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="sin_riesgo">Sin Riesgo</option>
                      <option value="riesgo_bajo">Riesgo Bajo</option>
                      <option value="riesgo_medio">Riesgo Medio</option>
                      <option value="riesgo_alto">Riesgo Alto</option>
                      <option value="riesgo_muy_alto">Riesgo Muy Alto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Factores Detectados por el Trabajador</Label>
                  <Textarea
                    rows={3}
                    value={resumenData.factores_detectados_trabajador || ''}
                    onChange={(e) =>
                      updateResumen(dimension, 'factores_detectados_trabajador', e.target.value)
                    }
                    className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                    placeholder="Liste los factores reportados por el trabajador..."
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label>Factores Detectados por el Experto</Label>
                  <Textarea
                    rows={3}
                    value={resumenData.factores_detectados_experto || ''}
                    onChange={(e) =>
                      updateResumen(dimension, 'factores_detectados_experto', e.target.value)
                    }
                    className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                    placeholder="Liste los factores identificados por el experto..."
                    disabled={readOnly}
                  />
                </div>

                <div>
                  <Label>Observaciones del Experto</Label>
                  <Textarea
                    rows={2}
                    value={resumenData.observaciones_experto || ''}
                    onChange={(e) =>
                      updateResumen(dimension, 'observaciones_experto', e.target.value)
                    }
                    className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
                    placeholder="Agregue observaciones adicionales..."
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function StepConceptoFinal({
  formData,
  setFormData,
  handleGenerarConcepto,
  generandoConcepto,
  readOnly,
}: {
  formData: StepData;
  setFormData: React.Dispatch<React.SetStateAction<StepData>>;
  handleGenerarConcepto: () => void;
  generandoConcepto: boolean;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Conclusiones Finales
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="conclusion_evaluacion">Conclusión de la Evaluación</Label>
          <Textarea
            id="conclusion_evaluacion"
            rows={4}
            value={formData.conclusion_evaluacion}
            onChange={(e) => setFormData({ ...formData, conclusion_evaluacion: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Resuma la conclusión general de la evaluación..."
            disabled={readOnly}
          />
        </div>

        <div>
          <Label htmlFor="concordancia_items">Ítems con Concordancia</Label>
          <Textarea
            id="concordancia_items"
            rows={3}
            value={formData.concordancia_items}
            onChange={(e) => setFormData({ ...formData, concordancia_items: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Liste los ítems donde hay concordancia entre trabajador y experto..."
            disabled={readOnly}
          />
        </div>

        <div>
          <Label htmlFor="no_concordancia_items">Ítems sin Concordancia</Label>
          <Textarea
            id="no_concordancia_items"
            rows={3}
            value={formData.no_concordancia_items}
            onChange={(e) => setFormData({ ...formData, no_concordancia_items: e.target.value })}
            className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
            placeholder="Liste los ítems donde NO hay concordancia..."
            disabled={readOnly}
          />
        </div>

        <div className="flex justify-between items-center mb-2 mt-6">
          <Label htmlFor="conclusiones_finales" className="text-lg font-semibold">
            Conclusiones Finales de la Prueba de Trabajo de Esfera Mental
          </Label>
          {!readOnly && (
            <Button
              onClick={handleGenerarConcepto}
              disabled={generandoConcepto}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
              size="sm"
            >
              {generandoConcepto ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4 text-yellow-300" /> Generar con IA
                </>
              )}
            </Button>
          )}
        </div>
        <Textarea
          id="conclusiones_finales"
          rows={6}
          value={formData.conclusiones_finales}
          onChange={(e) => setFormData({ ...formData, conclusiones_finales: e.target.value })}
          className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
          placeholder="Escriba las conclusiones finales completas..."
          disabled={readOnly}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Este campo puede ser generado automáticamente por el modelo de ML en el futuro
        </p>
      </div>

      <div>
        <Label htmlFor="recomendaciones">Recomendaciones</Label>
        <Textarea
          id="recomendaciones"
          rows={4}
          value={formData.recomendaciones}
          onChange={(e) => setFormData({ ...formData, recomendaciones: e.target.value })}
          className="bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#333333]"
          placeholder="Agregue las recomendaciones finales..."
          disabled={readOnly}
        />
      </div>
    </div>
  );
}



