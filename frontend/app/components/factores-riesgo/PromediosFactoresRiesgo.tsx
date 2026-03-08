'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  calcularTodosLosPromedios,
  obtenerNivelRiesgoGeneral,
  generarConceptoPsicologico,
  type FactorRiesgo,
  type PromedioCategoria
} from '@/app/utils/factoresRiesgoCalculos';
import { TrendingUp, TrendingDown, Minus, FileText, Sparkles } from 'lucide-react';

interface PromediosFactoresRiesgoProps {
  factoresRiesgo: Record<string, FactorRiesgo>;
  categoriasConfig: Record<string, { titulo: string; items: string[] }>;
  onGenerarConcepto?: (concepto: string) => void;
  nombreTrabajador?: string;
  diagnostico?: string;
  mostrarBotonGenerar?: boolean;
}

export function PromediosFactoresRiesgo({
  factoresRiesgo,
  categoriasConfig,
  onGenerarConcepto,
  nombreTrabajador = '',
  diagnostico = '',
  mostrarBotonGenerar = true,
}: PromediosFactoresRiesgoProps) {
  const promedios = calcularTodosLosPromedios(factoresRiesgo, categoriasConfig);
  const riesgoGeneral = obtenerNivelRiesgoGeneral(promedios);

  const getColorByNivel = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'alto':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medio':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'bajo':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getIconByNivel = (nivel: string) => {
    switch (nivel.toLowerCase()) {
      case 'alto':
        return <TrendingUp className="h-4 w-4" />;
      case 'medio':
        return <Minus className="h-4 w-4" />;
      case 'bajo':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const handleGenerarConcepto = () => {
    const concepto = generarConceptoPsicologico(
      promedios,
      nombreTrabajador,
      diagnostico
    );
    onGenerarConcepto?.(concepto);
  };

  return (
    <div className="space-y-6">
      {/* Resumen General */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Resumen de Evaluación de Riesgos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`p-4 rounded-lg border-2 ${getColorByNivel(riesgoGeneral.nivel)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nivel de Riesgo General</p>
                <div className="flex items-center gap-2 mt-1">
                  {getIconByNivel(riesgoGeneral.nivel)}
                  <span className="text-2xl font-bold uppercase">
                    {riesgoGeneral.nivel || 'Sin evaluar'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Promedio General</p>
                <p className="text-3xl font-bold">
                  {riesgoGeneral.promedio_general.toFixed(2)}<span className="text-lg text-gray-500">/3.0</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Promedios por Categoría */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Promedios por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(promedios).map(([key, promedio]) => (
              <div
                key={key}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {promedio.categoria}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {promedio.items_evaluados} de {promedio.total_items} items evaluados
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {promedio.items_evaluados > 0 ? promedio.promedio_numerico.toFixed(2) : '-'}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg border ${getColorByNivel(promedio.promedio_cualitativo)} min-w-[80px] text-center`}>
                    <div className="flex items-center justify-center gap-1">
                      {getIconByNivel(promedio.promedio_cualitativo)}
                      <span className="text-xs font-semibold uppercase">
                        {promedio.promedio_cualitativo || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categorías por Nivel de Riesgo */}
      {riesgoGeneral.nivel && (
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Categorización por Nivel de Riesgo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riesgoGeneral.categorias_alto_riesgo.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-red-600" />
                  <h4 className="font-semibold text-red-600">Riesgo Alto ({riesgoGeneral.categorias_alto_riesgo.length})</h4>
                </div>
                <ul className="space-y-1 ml-6">
                  {riesgoGeneral.categorias_alto_riesgo.map((cat, idx) => (
                    <li key={idx} className="text-sm text-gray-700">• {cat}</li>
                  ))}
                </ul>
              </div>
            )}

            {riesgoGeneral.categorias_riesgo_medio.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-orange-600">Riesgo Medio ({riesgoGeneral.categorias_riesgo_medio.length})</h4>
                </div>
                <ul className="space-y-1 ml-6">
                  {riesgoGeneral.categorias_riesgo_medio.map((cat, idx) => (
                    <li key={idx} className="text-sm text-gray-700">• {cat}</li>
                  ))}
                </ul>
              </div>
            )}

            {riesgoGeneral.categorias_bajo_riesgo.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-600">Riesgo Bajo ({riesgoGeneral.categorias_bajo_riesgo.length})</h4>
                </div>
                <ul className="space-y-1 ml-6">
                  {riesgoGeneral.categorias_bajo_riesgo.map((cat, idx) => (
                    <li key={idx} className="text-sm text-gray-700">• {cat}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Botón de generar concepto */}
      {mostrarBotonGenerar && riesgoGeneral.nivel && onGenerarConcepto && (
        <div className="flex justify-center">
          <Button
            onClick={handleGenerarConcepto}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-500 shadow-lg shadow-indigo-500/25 gap-2"
            size="lg"
          >
            <Sparkles className="h-5 w-5" />
            Generar Concepto Psicológico Automático
          </Button>
        </div>
      )}
    </div>
  );
}


