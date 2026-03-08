'use client';

import { DashboardLayout } from '@/app/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { api } from '@/app/services/api';
import { toast } from '@/components/ui/sileo-toast';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Info,
  ClipboardList,
  CheckCircle,
  ArrowRight,
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

  const plantillas = [
    {
      title: 'Plantilla Valoración Psicológica',
      description: 'Formato oficial para evaluaciones de aptitud mental y laboral',
      icon: FileSpreadsheet,
      handler: handleDescargarPlantilla,
      items: [
        'Formato completo de identificación del trabajador',
        'Sección de información laboral e historia ocupacional',
        'Evaluación de factores de riesgo psicosocial (7 categorías)',
        'Concepto psicológico final y recomendaciones',
        'Sección de firmas y validación profesional',
      ],
    },
    {
      title: 'Plantilla Prueba de Trabajo - Esfera Mental',
      description: 'Formato oficial para evaluaciones de riesgo psicosocial',
      icon: ClipboardList,
      handler: handleDescargarPlantillaPruebaTrabajo,
      items: [
        'Datos de identificación de la empresa',
        'Información completa del trabajador evaluado',
        'Evaluación de 7 dimensiones de riesgo psicosocial',
        'Resumen de factores de riesgo detectados',
        'Espacio para conclusiones y recomendaciones',
      ],
    },
  ];

  const formatosInfo = [
    {
      icon: FileSpreadsheet,
      title: 'Formato Excel',
      desc: 'Los archivos Excel pueden ser editados. Ideales para compartir con otros profesionales o hacer ajustes.',
    },
    {
      icon: FileText,
      title: 'Formato PDF',
      desc: 'Documentos con formato fijo, ideales para impresión y presentación oficial. Mantienen el formato intacto.',
    },
    {
      icon: Download,
      title: 'Acceso a reportes',
      desc: 'Los reportes de valoraciones completadas se descargan desde la lista de cada módulo. Solo disponible en estado "Completada".',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 anim-fade-in">

        {/* Header */}
        <div className="anim-fade-in-up">
          <h1 className="text-3xl font-bold text-gray-900">
            Descargas y Reportes
          </h1>
          <p className="text-gray-500 mt-1">
            Descargue plantillas y genere reportes del sistema
          </p>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 opacity-0 anim-fade-in-up delay-1" style={{ animationFillMode: 'forwards' }}>
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los reportes de valoraciones completadas pueden ser descargados en formato PDF y Excel desde el módulo correspondiente.
          </p>
        </div>

        {/* Templates grid */}
        <div className="grid gap-5 md:grid-cols-2">
          {plantillas.map((plantilla, idx) => {
            const Icon = plantilla.icon;
            return (
              <div
                key={idx}
                className={`rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden opacity-0 anim-fade-in-up delay-${idx + 2} group hover:shadow-md`}
                style={{ animationFillMode: 'forwards' }}
              >
                {/* Card header with gradient */}
                <div className="bg-blue-600 px-5 py-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{plantilla.title}</h3>
                      <p className="text-xs text-blue-100 mt-0.5">{plantilla.description}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">¿Qué incluye?</h4>
                  <ul className="space-y-2.5 mb-5">
                    {plantilla.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={plantilla.handler}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-medium shadow-sm hover:shadow-md"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Plantilla Excel
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info section */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden opacity-0 anim-fade-in-up delay-4" style={{ animationFillMode: 'forwards' }}>
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">Información sobre reportes</h2>
          </div>
          <div className="p-5 grid gap-4 sm:grid-cols-3">
            {formatosInfo.map((info, idx) => {
              const InfoIcon = info.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 row-hover">
                  <div className="p-2 w-fit rounded-lg bg-blue-50 text-blue-600 mb-3">
                    <InfoIcon className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">{info.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{info.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
