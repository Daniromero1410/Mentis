from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from app.models.valoracion import EstadoValoracion, EstadoCivil, Zona, ModalidadTrabajo
from app.models.evaluacion import CalificacionRiesgo, CategoriaRiesgo

# ============== TRABAJADOR ==============
class TrabajadorSchema(BaseModel):
    nombre: str
    documento: str
    identificacion_siniestro: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    estado_civil: Optional[EstadoCivil] = None
    nivel_educativo: Optional[str] = None
    formacion_especifica: Optional[str] = None
    telefonos: Optional[str] = None
    direccion: Optional[str] = None
    zona: Optional[Zona] = None
    diagnostico_mental: Optional[str] = None

# ============== INFO LABORAL ==============
class InfoLaboralSchema(BaseModel):
    fecha_evento_atel: Optional[date] = None
    eventos_no_laborales: bool = False
    evento_no_laboral_fecha: Optional[date] = None
    evento_no_laboral_diagnostico: Optional[str] = None
    eps: Optional[str] = None
    fondo_pension: Optional[str] = None
    dias_incapacidad: Optional[int] = None
    empresa: Optional[str] = None
    nit_empresa: Optional[str] = None
    vinculacion_laboral: bool = True
    tipo_vinculacion: Optional[str] = None
    modalidad: Optional[ModalidadTrabajo] = None
    tiempo_modalidad: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    antiguedad_empresa_anos: Optional[int] = None
    antiguedad_empresa_meses: Optional[int] = None
    antiguedad_cargo_anos: Optional[int] = None
    antiguedad_cargo_meses: Optional[int] = None
    contacto_empresa: Optional[str] = None
    cargo_contacto: Optional[str] = None
    correos: Optional[str] = None
    telefonos_empresa: Optional[str] = None

# ============== HISTORIA OCUPACIONAL ==============
class HistoriaOcupacionalSchema(BaseModel):
    orden: int = 1
    empresa: Optional[str] = None
    cargo_funciones: Optional[str] = None
    duracion: Optional[str] = None
    motivo_retiro: Optional[str] = None

# ============== ACTIVIDAD LABORAL ==============
class ActividadLaboralSchema(BaseModel):
    nombre_cargo: Optional[str] = None
    tareas: Optional[str] = None
    herramientas: Optional[str] = None
    horario: Optional[str] = None
    elementos_proteccion: Optional[str] = None
    otros_oficios: Optional[str] = None
    oficios_interes: Optional[str] = None

# ============== EVALUACION RIESGO ==============
class EvaluacionRiesgoSchema(BaseModel):
    categoria: CategoriaRiesgo
    item_numero: int
    item_texto: str
    calificacion: Optional[CalificacionRiesgo] = None
    observaciones: Optional[str] = None

# ============== CONCEPTO FINAL ==============
class ConceptoFinalSchema(BaseModel):
    concepto_generado: Optional[str] = None
    concepto_editado: Optional[str] = None
    orientacion_reintegro: Optional[str] = None
    elaboro_nombre: Optional[str] = None
    elaboro_firma: Optional[str] = None
    reviso_nombre: Optional[str] = None
    reviso_firma: Optional[str] = None

# ============== VALORACION COMPLETA ==============
class ValoracionCreate(BaseModel):
    fecha_valoracion: date
    trabajador: TrabajadorSchema
    info_laboral: Optional[InfoLaboralSchema] = None
    historia_ocupacional: Optional[List[HistoriaOcupacionalSchema]] = []
    actividad_laboral: Optional[ActividadLaboralSchema] = None
    evaluaciones_riesgo: Optional[List[EvaluacionRiesgoSchema]] = []
    concepto: Optional[ConceptoFinalSchema] = None

class ValoracionUpdate(BaseModel):
    fecha_valoracion: Optional[date] = None
    estado: Optional[EstadoValoracion] = None
    trabajador: Optional[TrabajadorSchema] = None
    info_laboral: Optional[InfoLaboralSchema] = None
    historia_ocupacional: Optional[List[HistoriaOcupacionalSchema]] = None
    actividad_laboral: Optional[ActividadLaboralSchema] = None
    evaluaciones_riesgo: Optional[List[EvaluacionRiesgoSchema]] = None
    concepto: Optional[ConceptoFinalSchema] = None

class ValoracionResponse(BaseModel):
    id: int
    fecha_valoracion: date
    estado: EstadoValoracion
    created_at: datetime
    updated_at: datetime
    creado_por: Optional[int] = None
    trabajador: Optional[TrabajadorSchema] = None
    info_laboral: Optional[InfoLaboralSchema] = None
    historia_ocupacional: List[HistoriaOcupacionalSchema] = []
    actividad_laboral: Optional[ActividadLaboralSchema] = None
    evaluaciones_riesgo: List[EvaluacionRiesgoSchema] = []
    concepto: Optional[ConceptoFinalSchema] = None
    
    class Config:
        from_attributes = True

class ValoracionListItem(BaseModel):
    id: int
    fecha_valoracion: date
    estado: EstadoValoracion
    created_at: datetime
    trabajador_nombre: Optional[str] = None
    trabajador_documento: Optional[str] = None
    empresa: Optional[str] = None
    
    class Config:
        from_attributes = True