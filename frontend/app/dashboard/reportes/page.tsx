'use client';

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import {
  FileSpreadsheet,
  Download,
  FileText,
  AlertCircle,
  ClipboardList,
} from 'lucide-react';

export default function ReportesPage() {
  const handleDescargarPlantilla = async () => {
    try {
      toast.info('Preparando plantilla Excel...');

      await api.downloadFile('/reportes/plantilla', 'plantilla_valoracion_psicologica.xlsx');

      toast.success('Plantilla descargada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al descargar la plantilla');
    }
  };

  const handleDescargarPlantillaPruebaTrabajo = async () => {
    try {
      toast.info('Preparando plantilla de Prueba de Trabajo...');

      await api.downloadFile('/reportes/plantilla-prueba-trabajo', 'Plantilla_Prueba_Trabajo_Esfera_Mental.xlsx');

      toast.success('Plantilla descargada exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al descargar la plantilla');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Descargas y Reportes
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Descargue plantillas y genere reportes del sistema
          </p>
        </div>

        {/* Alert Info */}
        <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Nota:</strong> Los reportes de valoraciones completadas pueden ser descargados desde el módulo de Valoraciones en formato PDF y Excel.
              </p>
            </div>
          </div>
        </div>

        {/* Plantilla Section */}
        <Card className="border-2 border-gray-200 dark:border-slate-700">
          <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Plantilla Excel de Valoración</CardTitle>
                <CardDescription>
                  Plantilla oficial para valoraciones psicológicas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    ¿Qué incluye esta plantilla?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Formato completo de identificación del trabajador</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Sección de información laboral y historia ocupacional</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Evaluación de factores de riesgo psicosocial (7 categorías)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Espacio para concepto psicológico final y recomendaciones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Sección de firmas y validación profesional</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button
                  onClick={handleDescargarPlantilla}
                  className="w-full md:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  Descargar Plantilla Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plantilla Prueba de Trabajo Section */}
        <Card className="border-2 border-gray-200 dark:border-slate-700">
          <CardHeader className="border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Plantilla Prueba de Trabajo de Esfera Mental</CardTitle>
                <CardDescription>
                  Plantilla oficial para evaluaciones de riesgo psicosocial en el trabajo
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    ¿Qué incluye esta plantilla?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Datos de identificación de la empresa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Información completa del trabajador evaluado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Evaluación de 7 dimensiones de riesgo psicosocial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Resumen de factores de riesgo detectados</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 font-bold">•</span>
                      <span>Espacio para conclusiones y recomendaciones</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <Button
                  onClick={handleDescargarPlantillaPruebaTrabajo}
                  className="w-full md:w-auto gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Download className="h-5 w-5" />
                  Descargar Plantilla Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información sobre reportes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-600" />
                  Formato Excel
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Los archivos Excel generados utilizan la plantilla oficial y pueden ser editados posteriormente.
                  Son ideales para compartir con otros profesionales o hacer ajustes manuales.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-500" />
                  Formato PDF
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Los archivos PDF son documentos profesionales con formato fijo, ideales para impresión
                  y presentación oficial. No pueden ser editados pero mantienen el formato intacto.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4 text-blue-600" />
                  Acceso a reportes guardados
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Los reportes de valoraciones completadas se pueden descargar desde la lista de valoraciones.
                  Solo las valoraciones con estado "Completada" tienen archivos PDF y Excel disponibles.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}


