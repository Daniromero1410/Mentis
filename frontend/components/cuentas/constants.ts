// Catálogos compartidos del módulo de Cuentas

export const ARLS = [
    'POSITIVA',
    'AXA COLPATRIA',
    'SURA',
    'SALUD TOTAL',
    'TO DOMICILIARIAS',
];

// Servicios estandarizados (basados en la relación de los terapeutas)
export const SERVICIOS = [
    'CONSULTA 1ER VEZ TERAPIA OCUPACIONAL',
    'VALORACIÓN OCUPACIONAL',
    'PRUEBA DE TRABAJO',
    'ANÁLISIS DE EXIGENCIA',
    'RECOMENDACIONES',
    'SEGUIMIENTO A RECOMENDACIONES',
    'NOTIFICACIÓN REINTEGRO EN PLENO',
    'PERFIL OCUPACIONAL',
    'COMITÉ',
    'INTERCONSULTA POR TO',
    'TERAPIA OCUPACIONAL',
];

export const TIPOS_DOCUMENTO = [
    'CÉDULA DE CIUDADANÍA',
    'CÉDULA DE EXTRANJERÍA',
    'TARJETA DE IDENTIDAD',
    'PASAPORTE',
    'PERMISO ESPECIAL DE PERMANENCIA',
    'NIT',
];

export const MESES = [
    '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function formatCOP(value: number | null | undefined): string {
    if (value === null || value === undefined) return '';
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(value);
}
