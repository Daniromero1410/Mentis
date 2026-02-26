"""
Schemas Pydantic para el módulo de AE de Trabajo
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from app.models.analisis_exigencia_mental import (
    EstadoAE, DimensionRiesgo, NivelRiesgo
)


# ===== DATOS DE LA EMPRESA =====
class DatosEmpresaAECreate(BaseModel):
    """Schema para crear/actualizar datos de empresa"""
    empresa: Optional[str] = None
    tipo_documento: Optional[str] = None
    nit: Optional[str] = None
    persona_contacto: Optional[str] = None
    email_notificaciones: Optional[str] = None
    direccion: Optional[str] = None
    arl: Optional[str] = None
    ciudad: Optional[str] = None


class DatosEmpresaAERead(DatosEmpresaAECreate):
    """Schema para leer datos de empresa"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== DATOS DEL TRABAJADOR =====
class TrabajadorAECreate(BaseModel):
    """Schema para crear/actualizar datos del trabajador"""
    nombre: Optional[str] = None
    identificacion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    genero: Optional[str] = None
    escolaridad: Optional[str] = None
    nivel_educativo: Optional[str] = None
    eps: Optional[str] = None
    puesto_trabajo_evaluado: Optional[str] = None
    cargo: Optional[str] = None
    area: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    fecha_ingreso_puesto_evaluado: Optional[date] = None
    antiguedad_empresa: Optional[str] = None
    antiguedad_puesto_evaluado: Optional[str] = None
    antiguedad_cargo: Optional[str] = None
    diagnostico: Optional[str] = None
    codigo_cie10: Optional[str] = None
    fecha_siniestro: Optional[date] = None


class TrabajadorAERead(TrabajadorAECreate):
    """Schema para leer datos del trabajador"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== DATOS DEL EVALUADOR =====
class DatosEvaluadorCreate(BaseModel):
    """Schema para crear/actualizar datos del evaluador"""
    nombre: Optional[str] = None
    identificacion: Optional[str] = None
    formacion: Optional[str] = None
    tarjeta_profesional: Optional[str] = None
    licencia_sst: Optional[str] = None
    fecha_evaluacion: Optional[date] = None


class DatosEvaluadorRead(DatosEvaluadorCreate):
    """Schema para leer datos del evaluador"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== SECCIONES DE TEXTO LIBRE =====
class SeccionesAECreate(BaseModel):
    """Schema para crear/actualizar secciones de texto"""
    metodologia: Optional[str] = None
    revision_documental: Optional[str] = None
    descripcion_puesto: Optional[str] = None
    condicion_actual: Optional[str] = None
    descripcion_funciones: Optional[str] = None
    participante_trabajador: Optional[str] = None
    participante_jefe: Optional[str] = None
    participante_cargo_jefe: Optional[str] = None
    fuente_trabajador_fecha: Optional[date] = None
    fuente_jefe_fecha: Optional[date] = None
    fuente_par_fecha: Optional[date] = None
    nombre_puesto: Optional[str] = None
    area_puesto: Optional[str] = None
    antiguedad_cargo_ocupacional: Optional[str] = None
    antiguedad_empresa_ocupacional: Optional[str] = None
    nivel_educativo_requerido: Optional[str] = None
    jornada_laboral: Optional[str] = None
    horas_extras: Optional[str] = None
    turnos: Optional[str] = None


class SeccionesAERead(SeccionesAECreate):
    """Schema para leer secciones"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== CONDICIÓN DE RIESGO =====
class CondicionRiesgoAECreate(BaseModel):
    """Schema para crear/actualizar condición de riesgo"""
    dimension: DimensionRiesgo
    item_numero: int
    condicion_texto: str
    descripcion_detallada: Optional[str] = None
    frecuencia: Optional[int] = Field(None, ge=0, le=7)
    exposicion: Optional[int] = Field(None, ge=0, le=7)
    intensidad: Optional[int] = Field(None, ge=0, le=7)
    total_condicion: Optional[int] = Field(None, ge=0, le=21)
    fuentes_informacion: Optional[str] = "Entrevista con el trabajador y jefe inmediato"


class CondicionRiesgoAERead(CondicionRiesgoAECreate):
    """Schema para leer condición de riesgo"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== RESUMEN DE FACTORES =====
class ResumenFactorAECreate(BaseModel):
    """Schema para crear/actualizar resumen de factor"""
    dimension: DimensionRiesgo
    num_items: int
    puntuacion_total: Optional[int] = None
    nivel_riesgo_trabajador: Optional[NivelRiesgo] = None
    nivel_riesgo_experto: Optional[NivelRiesgo] = None
    factores_detectados_trabajador: Optional[str] = None
    factores_detectados_experto: Optional[str] = None
    observaciones_experto: Optional[str] = None


class ResumenFactorAERead(ResumenFactorAECreate):
    """Schema para leer resumen de factor"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== CONCEPTO FINAL =====
class ConceptoFinalAECreate(BaseModel):
    """Schema para crear/actualizar concepto final"""
    conclusion_evaluacion: Optional[str] = None
    concordancia_items: Optional[str] = None
    no_concordancia_items: Optional[str] = None
    concepto_generado_ml: Optional[str] = None
    conclusiones_finales: Optional[str] = None
    recomendaciones: Optional[str] = None
    firma_evaluador: Optional[str] = None


class ConceptoFinalAERead(ConceptoFinalAECreate):
    """Schema para leer concepto final"""
    id: int
    AE_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ===== AE DE TRABAJO COMPLETA =====
class AnalisisExigenciaMentalCreate(BaseModel):
    """Schema para crear nueva AE de trabajo"""
    fecha_valoracion: Optional[date] = None
    estado: EstadoAE = EstadoAE.BORRADOR
    
    # Datos anidados para creación monolítica
    datos_empresa: Optional[DatosEmpresaAECreate] = None
    trabajador: Optional[TrabajadorAECreate] = None
    evaluador: Optional[DatosEvaluadorCreate] = None
    secciones: Optional[SeccionesAECreate] = None
    condiciones_riesgo: Optional[List[CondicionRiesgoAECreate]] = None
    resumen_factores: Optional[List[ResumenFactorAECreate]] = None
    concepto_final: Optional[ConceptoFinalAECreate] = None


class AnalisisExigenciaMentalUpdate(BaseModel):
    """Schema para actualizar datos básicos y anidados de la AE"""
    fecha_valoracion: Optional[date] = None
    estado: Optional[EstadoAE] = None
    
    # Datos anidados para actualización
    datos_empresa: Optional[DatosEmpresaAECreate] = None
    trabajador: Optional[TrabajadorAECreate] = None
    evaluador: Optional[DatosEvaluadorCreate] = None
    secciones: Optional[SeccionesAECreate] = None
    condiciones_riesgo: Optional[List[CondicionRiesgoAECreate]] = None
    resumen_factores: Optional[List[ResumenFactorAECreate]] = None
    concepto_final: Optional[ConceptoFinalAECreate] = None


class AnalisisExigenciaMentalResponse(BaseModel):
    """Schema de respuesta completa con todas las relaciones"""
    id: int
    estado: EstadoAE
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_finalizacion: Optional[datetime] = None
    creado_por: int

    # Relaciones
    datos_empresa: Optional[DatosEmpresaAERead] = None
    trabajador: Optional[TrabajadorAERead] = None
    evaluador: Optional[DatosEvaluadorRead] = None
    secciones: Optional[SeccionesAERead] = None
    condiciones_riesgo: List[CondicionRiesgoAERead] = []
    resumen_factores: List[ResumenFactorAERead] = []
    concepto_final: Optional[ConceptoFinalAERead] = None

    class Config:
        from_attributes = True


class AnalisisExigenciaMentalListItem(BaseModel):
    """Schema resumido para listado de AEs"""
    id: int
    estado: EstadoAE
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    # Datos básicos del trabajador y empresa
    trabajador_nombre: Optional[str] = None
    trabajador_identificacion: Optional[str] = None
    empresa: Optional[str] = None

    class Config:
        from_attributes = True


# ===== SCHEMAS PARA GUARDAR SECCIONES =====
class GuardarDatosEmpresa(BaseModel):
    """Request para guardar datos de empresa"""
    AE_id: int
    datos: DatosEmpresaAECreate


class GuardarDatosTrabajador(BaseModel):
    """Request para guardar datos del trabajador"""
    AE_id: int
    datos: TrabajadorAECreate


class GuardarDatosEvaluador(BaseModel):
    """Request para guardar datos del evaluador"""
    AE_id: int
    datos: DatosEvaluadorCreate


class GuardarSecciones(BaseModel):
    """Request para guardar secciones de texto"""
    AE_id: int
    datos: SeccionesAECreate


class GuardarCondicionesRiesgo(BaseModel):
    """Request para guardar todas las condiciones de riesgo"""
    AE_id: int
    condiciones: List[CondicionRiesgoAECreate]


class GuardarResumenFactores(BaseModel):
    """Request para guardar resumen de factores"""
    AE_id: int
    factores: List[ResumenFactorAECreate]


class GuardarConceptoFinal(BaseModel):
    """Request para guardar concepto final"""
    AE_id: int
    concepto: ConceptoFinalAECreate


class FinalizarAEResponse(BaseModel):
    """Respuesta al finalizar AE con PDF generado"""
    message: str
    AE_id: int
    pdf_url: str


class PaginatedAEsResponse(BaseModel):
    """Respuesta paginada para lista de AEs de trabajo"""
    items: List[AnalisisExigenciaMentalListItem]
    total: int

