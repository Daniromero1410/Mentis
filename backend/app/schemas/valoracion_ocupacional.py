"""
Schemas Pydantic para el módulo Valoración Ocupacional
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# ── Secciones Texto / Otros ──────────────────────────────────────────
class SeccionesTextoVOCreate(BaseModel):
    objetivo_valoracion: Optional[str] = None
    otros_oficios_desempenados: Optional[str] = None
    oficios_interes: Optional[str] = None

    class Config:
        from_attributes = True

# ── Identificación ──────────────────────────────────────────────────
class IdentificacionVOCreate(BaseModel):
    fecha_valoracion: Optional[date] = None
    nombre_trabajador: Optional[str] = None
    numero_documento: Optional[str] = None
    identificacion_siniestro: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    edad: Optional[int] = None
    dominancia: Optional[str] = None
    estado_civil: Optional[str] = None
    nivel_educativo: Optional[str] = None
    especificar_formacion: Optional[str] = None
    telefonos_trabajador: Optional[str] = None
    direccion_residencia: Optional[str] = None
    zona_residencia: Optional[str] = None
    diagnosticos_atel: Optional[str] = None
    fechas_eventos_atel: Optional[str] = None
    eps_ips: Optional[str] = None
    afp: Optional[str] = None
    tiempo_incapacidad_dias: Optional[str] = None
    empresa: Optional[str] = None
    vinculacion_laboral: Optional[bool] = None
    forma_vinculacion: Optional[str] = None
    modalidad: Optional[str] = None
    tiempo_modalidad: Optional[str] = None
    nit_empresa: Optional[str] = None
    fecha_ingreso_empresa: Optional[date] = None
    antiguedad_empresa: Optional[str] = None
    contacto_empresa: Optional[str] = None
    correos_empresa: Optional[str] = None
    telefonos_empresa: Optional[str] = None

    class Config:
        from_attributes = True

class EventoNoLaboralVOCreate(BaseModel):
    si_no: Optional[str] = None
    fecha: Optional[str] = None
    diagnostico: Optional[str] = None
    orden: int = 0

# ── Historia Ocupacional ─────────────────────────────────────────────
class HistoriaOcupacionalVOCreate(BaseModel):
    empresa: Optional[str] = None
    cargo_funciones: Optional[str] = None
    tiempo_duracion: Optional[str] = None
    motivo_retiro: Optional[str] = None
    orden: int = 0

# ── Actividad Actual ─────────────────────────────────────────────────
class ActividadActualVOCreate(BaseModel):
    nombre_cargo: Optional[str] = None
    tareas_descripcion: Optional[str] = None
    herramientas_trabajo: Optional[str] = None
    horario_trabajo: Optional[str] = None
    elementos_proteccion: Optional[str] = None
    antiguedad_cargo: Optional[str] = None
    requerimientos_motrices: Optional[str] = None
    ocurrencia_atel_puesto: Optional[bool] = None
    ocurrencia_atel_area: Optional[bool] = None
    ocurrencia_atel_otro: Optional[str] = None

    class Config:
        from_attributes = True

# ── Rol Laboral ──────────────────────────────────────────────────────
class RolLaboralVOCreate(BaseModel):
    tareas_operaciones: Optional[str] = None
    componentes_desempeno: Optional[str] = None
    tiempo_ejecucion: Optional[str] = None
    forma_integracion: Optional[str] = None

    class Config:
        from_attributes = True

# ── Evento ATEL ──────────────────────────────────────────────────────
class EventoATELVOCreate(BaseModel):
    tratamiento_rehabilitacion: Optional[str] = None
    adaptaciones_recibidas: Optional[str] = None
    calificacion_pcl_si: Optional[bool] = None
    calificacion_pcl_porcentaje: Optional[str] = None
    calificacion_pcl_no: Optional[bool] = None

    class Config:
        from_attributes = True

# ── Composición Familiar ─────────────────────────────────────────────
class ComposicionFamiliarVOCreate(BaseModel):
    personas_sostienen_hogar: Optional[str] = None
    ingreso_promedio: Optional[str] = None
    convivencia_actual: Optional[str] = None

    class Config:
        from_attributes = True

class MiembroFamiliarVOCreate(BaseModel):
    composicion_nucleo: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    orden: int = 0

# ── Registro / Firmas ────────────────────────────────────────────────
class RegistroVOCreate(BaseModel):
    nombre_elaboro: Optional[str] = None
    firma_elaboro: Optional[str] = None
    licencia_so_elaboro: Optional[str] = None
    nombre_trabajador: Optional[str] = None
    firma_trabajador: Optional[str] = None

    class Config:
        from_attributes = True

# ══════════════════════════════════════════════════════════════════════
# Schemas monolíticos (Create / Update)
# ══════════════════════════════════════════════════════════════════════
class ValoracionOcupacionalCreate(BaseModel):
    secciones_texto: Optional[SeccionesTextoVOCreate] = None
    identificacion: Optional[IdentificacionVOCreate] = None
    eventos_no_laborales: Optional[List[EventoNoLaboralVOCreate]] = None
    historia_ocupacional: Optional[List[HistoriaOcupacionalVOCreate]] = None
    actividad_actual: Optional[ActividadActualVOCreate] = None
    rol_laboral: Optional[RolLaboralVOCreate] = None
    evento_atel: Optional[EventoATELVOCreate] = None
    composicion_familiar: Optional[ComposicionFamiliarVOCreate] = None
    miembros_familiares: Optional[List[MiembroFamiliarVOCreate]] = None
    registro: Optional[RegistroVOCreate] = None
    estado: Optional[str] = None

class ValoracionOcupacionalUpdate(BaseModel):
    secciones_texto: Optional[SeccionesTextoVOCreate] = None
    identificacion: Optional[IdentificacionVOCreate] = None
    eventos_no_laborales: Optional[List[EventoNoLaboralVOCreate]] = None
    historia_ocupacional: Optional[List[HistoriaOcupacionalVOCreate]] = None
    actividad_actual: Optional[ActividadActualVOCreate] = None
    rol_laboral: Optional[RolLaboralVOCreate] = None
    evento_atel: Optional[EventoATELVOCreate] = None
    composicion_familiar: Optional[ComposicionFamiliarVOCreate] = None
    miembros_familiares: Optional[List[MiembroFamiliarVOCreate]] = None
    registro: Optional[RegistroVOCreate] = None
    estado: Optional[str] = None

# ══════════════════════════════════════════════════════════════════════
# Schemas de respuesta (Read)
# ══════════════════════════════════════════════════════════════════════
class EventoNoLaboralVOResponse(EventoNoLaboralVOCreate):
    id: int
    class Config:
        from_attributes = True

class HistoriaOcupacionalVOResponse(HistoriaOcupacionalVOCreate):
    id: int
    class Config:
        from_attributes = True

class MiembroFamiliarVOResponse(MiembroFamiliarVOCreate):
    id: int
    class Config:
        from_attributes = True

class ValoracionOcupacionalResponse(BaseModel):
    id: int
    estado: str
    creado_por: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    fecha_finalizacion: Optional[datetime] = None
    secciones_texto: Optional[SeccionesTextoVOCreate] = None
    identificacion: Optional[IdentificacionVOCreate] = None
    eventos_no_laborales: Optional[List[EventoNoLaboralVOResponse]] = None
    historia_ocupacional: Optional[List[HistoriaOcupacionalVOResponse]] = None
    actividad_actual: Optional[ActividadActualVOCreate] = None
    rol_laboral: Optional[RolLaboralVOCreate] = None
    evento_atel: Optional[EventoATELVOCreate] = None
    composicion_familiar: Optional[ComposicionFamiliarVOCreate] = None
    miembros_familiares: Optional[List[MiembroFamiliarVOResponse]] = None
    registro: Optional[RegistroVOCreate] = None

    class Config:
        from_attributes = True


class ValoracionOcupacionalListItem(BaseModel):
    id: int
    estado: str
    fecha_creacion: datetime
    fecha_actualizacion: datetime
    trabajador_nombre: Optional[str] = None
    trabajador_documento: Optional[str] = None
    empresa: Optional[str] = None

class PaginatedValoracionesOcupacionalesResponse(BaseModel):
    items: List[ValoracionOcupacionalListItem]
    total: int

class FinalizarValoracionOResponse(BaseModel):
    message: str
    valoracion_id: int
    pdf_url: str
