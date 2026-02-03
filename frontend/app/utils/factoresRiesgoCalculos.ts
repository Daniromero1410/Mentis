/**
 * Utilidades para el cálculo de promedios de factores de riesgo psicosocial
 */

export type CalificacionCualitativa = 'bajo' | 'medio' | 'alto' | '';

export interface FactorRiesgo {
  calificacion: CalificacionCualitativa;
  observaciones: string;
}

export interface PromedioCategoria {
  categoria: string;
  promedio_numerico: number;
  promedio_cualitativo: CalificacionCualitativa;
  total_items: number;
  items_evaluados: number;
}

/**
 * Convierte una calificación cualitativa a numérica
 * bajo = 1, medio = 2, alto = 3
 */
export function cualitativoANumerico(calificacion: CalificacionCualitativa): number | null {
  switch (calificacion.toLowerCase()) {
    case 'bajo':
      return 1;
    case 'medio':
      return 2;
    case 'alto':
      return 3;
    default:
      return null; // No evaluado
  }
}

/**
 * Convierte un promedio numérico a calificación cualitativa
 * 1-1.5 = bajo, 1.51-2.5 = medio, 2.51-3 = alto
 */
export function numericoACualitativo(promedio: number): CalificacionCualitativa {
  if (promedio <= 1.5) return 'bajo';
  if (promedio <= 2.5) return 'medio';
  return 'alto';
}

/**
 * Calcula el promedio de una categoría de factores de riesgo
 */
export function calcularPromedioCategoria(
  factores: Record<string, FactorRiesgo>,
  items: string[]
): PromedioCategoria {
  const valores: number[] = [];

  items.forEach(item => {
    const factor = factores[item];
    if (factor && factor.calificacion) {
      const valor = cualitativoANumerico(factor.calificacion);
      if (valor !== null) {
        valores.push(valor);
      }
    }
  });

  const total_items = items.length;
  const items_evaluados = valores.length;

  if (items_evaluados === 0) {
    return {
      categoria: '',
      promedio_numerico: 0,
      promedio_cualitativo: '',
      total_items,
      items_evaluados: 0,
    };
  }

  const suma = valores.reduce((acc, val) => acc + val, 0);
  const promedio = suma / items_evaluados;

  return {
    categoria: '',
    promedio_numerico: parseFloat(promedio.toFixed(2)),
    promedio_cualitativo: numericoACualitativo(promedio),
    total_items,
    items_evaluados,
  };
}

/**
 * Calcula todos los promedios de las categorías de factores de riesgo
 */
export function calcularTodosLosPromedios(
  factores: Record<string, FactorRiesgo>,
  categoriasConfig: Record<string, { titulo: string; items: string[] }>
): Record<string, PromedioCategoria> {
  const promedios: Record<string, PromedioCategoria> = {};

  Object.entries(categoriasConfig).forEach(([key, config]) => {
    const promedio = calcularPromedioCategoria(factores, config.items);
    promedios[key] = {
      ...promedio,
      categoria: config.titulo,
    };
  });

  return promedios;
}

/**
 * Obtiene el nivel de riesgo general basado en todos los promedios
 */
export function obtenerNivelRiesgoGeneral(
  promedios: Record<string, PromedioCategoria>
): {
  nivel: CalificacionCualitativa;
  promedio_general: number;
  categorias_alto_riesgo: string[];
  categorias_riesgo_medio: string[];
  categorias_bajo_riesgo: string[];
} {
  const valores: number[] = [];
  const categorias_alto: string[] = [];
  const categorias_medio: string[] = [];
  const categorias_bajo: string[] = [];

  Object.values(promedios).forEach(promedio => {
    if (promedio.items_evaluados > 0) {
      valores.push(promedio.promedio_numerico);

      switch (promedio.promedio_cualitativo) {
        case 'alto':
          categorias_alto.push(promedio.categoria);
          break;
        case 'medio':
          categorias_medio.push(promedio.categoria);
          break;
        case 'bajo':
          categorias_bajo.push(promedio.categoria);
          break;
      }
    }
  });

  if (valores.length === 0) {
    return {
      nivel: '',
      promedio_general: 0,
      categorias_alto_riesgo: [],
      categorias_riesgo_medio: [],
      categorias_bajo_riesgo: [],
    };
  }

  const suma = valores.reduce((acc, val) => acc + val, 0);
  const promedio_general = suma / valores.length;

  return {
    nivel: numericoACualitativo(promedio_general),
    promedio_general: parseFloat(promedio_general.toFixed(2)),
    categorias_alto_riesgo: categorias_alto,
    categorias_riesgo_medio: categorias_medio,
    categorias_bajo_riesgo: categorias_bajo,
  };
}

/**
 * Genera el concepto psicológico automático basado en los promedios
 */
export function generarConceptoPsicologico(
  promedios: Record<string, PromedioCategoria>,
  nombreTrabajador: string,
  diagnostico: string
): string {
  const riesgoGeneral = obtenerNivelRiesgoGeneral(promedios);

  let concepto = `Una vez evaluada ${nombreTrabajador.includes('a ') ? 'la afiliada' : 'el afiliado'} del asunto`;

  if (diagnostico) {
    concepto += `, quien presenta un diagnóstico de ${diagnostico}`;
  }

  concepto += `, nos permitimos manifestar las recomendaciones que a continuación se mencionan, las cuales se emiten con el objetivo de prevenir agravamiento de su estado de salud y favorecer su rehabilitación, lo anterior de conformidad con los artículos 2°, 4° y 8° de la Ley 776 de 2002.\n\n`;

  // Análisis de factores de riesgo
  concepto += `ANÁLISIS DE FACTORES DE RIESGO PSICOSOCIAL:\n\n`;
  concepto += `El análisis de los factores de riesgo psicosocial indica un nivel de riesgo ${riesgoGeneral.nivel.toUpperCase()} general (${riesgoGeneral.promedio_general}/3.0).\n\n`;

  if (riesgoGeneral.categorias_alto_riesgo.length > 0) {
    concepto += `Se identifican factores de ALTO RIESGO en:\n`;
    riesgoGeneral.categorias_alto_riesgo.forEach(cat => {
      concepto += `- ${cat}\n`;
    });
    concepto += `\n`;
  }

  if (riesgoGeneral.categorias_riesgo_medio.length > 0) {
    concepto += `Se identifican factores de RIESGO MEDIO en:\n`;
    riesgoGeneral.categorias_riesgo_medio.forEach(cat => {
      concepto += `- ${cat}\n`;
    });
    concepto += `\n`;
  }

  concepto += `\nRECOMENDACIONES PARA ${nombreTrabajador.includes('a ') ? 'LA TRABAJADORA' : 'EL TRABAJADOR'}:\n\n`;

  concepto += `1. Continuar con el tratamiento por psiquiatría y psicología, siguiendo las indicaciones dadas de forma proactiva y comprometida con el proceso.\n\n`;

  concepto += `2. Continuar facilitando la información clara, veraz y completa sobre su estado de salud a la organización de conformidad con lo dispuesto en el art 27 de la Ley 1562 de 2012.\n\n`;

  concepto += `3. Mantenimiento de buenas prácticas laborales dispuestas por la organización que apoyan el desarrollo de la labor: cumplir el horario de trabajo asignado, participar en retroalimentaciones y/o reuniones del grupo de trabajo para estar al tanto de los cambios de la organización o bien para mejora del desempeño individual o grupal y mantener una actitud receptiva y propositiva frente a las oportunidades de mejora de su desempeño.\n\n`;

  concepto += `4. Mantener el compromiso y cumplimiento a las normas, responsabilidades, funciones y metas a corto plazo asignadas a su cargo por la organización.\n\n`;

  concepto += `5. Realizar pausas periódicas cortas, alternar tareas y cambiar de actividad en la medida en que sea posible, para contrarrestar el estatismo postural y la tensión muscular.\n\n`;

  concepto += `6. Se recomienda incrementar la interacción con las personas del grupo de trabajo o bien con grupos sociales externos a fin de fortalecer la red de apoyo social como factor protector.\n\n`;

  concepto += `7. Se sugiere ${nombreTrabajador.includes('a ') ? 'a la trabajadora' : 'al trabajador'} incluir en su práctica diaria y/o semanal actividades deportivas, lúdicas y/o recreativas que favorezcan la liberación de emociones o tensiones y un estilo de vida saludable.\n\n`;

  concepto += `\nRECOMENDACIONES PARA LA EMPRESA:\n\n`;

  concepto += `1. Participar del proceso de rehabilitación integral, informando ${nombreTrabajador.includes('a ') ? 'a la trabajadora' : 'al trabajador'} por escrito de las recomendaciones médico-laborales que debe tener en cuenta, conforme a su capacidad laboral actual, con el fin de poder llevar a cabo el seguimiento del cumplimiento de estas.\n\n`;

  concepto += `2. Permitir los permisos para las citas y controles que el médico y psicóloga tratantes consideren necesarios.\n\n`;

  concepto += `3. Mantener la privacidad adecuada en el uso de información con respecto a la historia clínica ${nombreTrabajador.includes('a ') ? 'de la paciente' : 'del paciente'}.\n\n`;

  concepto += `4. Se sugiere favorecer el buen trato y la no discriminación hacia ${nombreTrabajador.includes('a ') ? 'la trabajadora' : 'el trabajador'}, evitando la estigmatización y retroalimentando su desempeño de forma periódica y asertiva para favorecer el desarrollo y mejoramiento del trabajo.\n\n`;

  concepto += `5. ${nombreTrabajador.includes('a ') ? 'La trabajadora' : 'El trabajador'} debe cumplir el horario establecido por su empresa. Se sugiere no asignar horas extras, horarios extendidos, turnos nocturnos o en fin de semana. Esto incluye no asignar trabajo fuera del horario laboral.\n\n`;

  if (riesgoGeneral.categorias_alto_riesgo.some(cat => cat.includes('Demandas') || cat.includes('Carga'))) {
    concepto += `6. Se sugiere a su jefe directo, evaluar la carga laboral, definir claramente las funciones ${nombreTrabajador.includes('a ') ? 'de la trabajadora' : 'del trabajador'} acorde a sus capacidades y aptitudes, teniendo en cuenta la condición de salud ${nombreTrabajador.includes('a ') ? 'de la paciente' : 'del paciente'} y su capacidad laboral actual.\n\n`;
  } else {
    concepto += `6. Se sugiere a su jefe directo, evaluar la carga laboral y definir claramente las funciones ${nombreTrabajador.includes('a ') ? 'de la trabajadora' : 'del trabajador'} acorde a sus capacidades y aptitudes.\n\n`;
  }

  concepto += `7. Se recomienda dar estabilidad a los cargos asignados.\n\n`;

  concepto += `8. Retroalimentar periódicamente el desempeño ${nombreTrabajador.includes('a ') ? 'de la trabajadora' : 'del trabajador'} de forma clara, oportuna y útil para favorecer el desarrollo y mejoramiento del trabajo.\n\n`;

  concepto += `\nEstas recomendaciones tienen una vigencia de doce meses luego de la realización de las mismas.`;

  return concepto;
}
